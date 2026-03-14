/**
 * PARIVESH 3.0 — API Service Layer
 * Connects the React frontend to the Flask backend.
 */

const BASE_URL = "http://127.0.0.1:5000/api";

// ── Token Management ─────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem("parivesh_token");
export const getRefreshToken = () => localStorage.getItem("parivesh_refresh");

export const saveTokens = (access, refresh) => {
    localStorage.setItem("parivesh_token", access);
    if (refresh) localStorage.setItem("parivesh_refresh", refresh);
};

export const clearTokens = () => {
    localStorage.removeItem("parivesh_token");
    localStorage.removeItem("parivesh_refresh");
    localStorage.removeItem("parivesh_user");
};

export const saveUser = (user) => localStorage.setItem("parivesh_user", JSON.stringify(user));
export const getSavedUser = () => {
    try { return JSON.parse(localStorage.getItem("parivesh_user")); }
    catch { return null; }
};

// ── HTTP Helper ──────────────────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = { "Content-Type": "application/json", ...options.headers };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

    // If token expired, try refresh
    if (res.status === 401 && getRefreshToken()) {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getRefreshToken()}` },
        });
        if (refreshRes.ok) {
            const data = await refreshRes.json();
            saveTokens(data.access_token);
            headers["Authorization"] = `Bearer ${data.access_token}`;
            const retry = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
            return retry;
        } else {
            clearTokens();
            window.location.reload();
        }
    }

    return res;
}

// ── Auth API ─────────────────────────────────────────────────────────────────
export async function apiLogin(email, password) {
    const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    saveTokens(data.access_token, data.refresh_token);
    saveUser(data.user);
    return data.user;
}

export async function apiRegister(userData) {
    const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");

    saveTokens(data.access_token, data.refresh_token);
    saveUser(data.user);
    return data.user;
}

export async function apiGetMe() {
    const res = await apiFetch("/auth/me");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to get user");
    return data.user;
}

// ── Users API ────────────────────────────────────────────────────────────────
export async function apiListUsers(role = null) {
    const q = role ? `?role=${role}` : "";
    const res = await apiFetch(`/users/${q}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.users;
}

export async function apiUpdateUser(userId, updates) {
    const res = await apiFetch(`/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.user;
}

export async function apiGetProfile() {
    const res = await apiFetch("/users/profile");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.profile;
}

// ── Applications API ─────────────────────────────────────────────────────────
export async function apiListApps(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const q = params ? `?${params}` : "";
    const res = await apiFetch(`/applications/${q}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.applications;
}

export async function apiGetApp(appId) {
    const res = await apiFetch(`/applications/${appId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.application;
}

export async function apiCreateApp(appData) {
    const res = await apiFetch("/applications/", {
        method: "POST",
        body: JSON.stringify(appData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.application;
}

export async function apiUpdateApp(appId, updates) {
    const res = await apiFetch(`/applications/${appId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.application;
}

export async function apiPayFees(appId) {
    const res = await apiFetch(`/applications/${appId}/pay`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.application;
}

export async function apiLockApp(appId) {
    const res = await apiFetch(`/applications/${appId}/lock`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.application;
}

export async function apiGetStats() {
    const res = await apiFetch("/applications/stats");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.stats;
}

// ── Notifications API ────────────────────────────────────────────────────────
export async function apiListNotifications(unreadOnly = false) {
    const q = unreadOnly ? "?unread=true" : "";
    const res = await apiFetch(`/notifications/${q}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
}

export async function apiMarkNotifRead(notifId) {
    const res = await apiFetch(`/notifications/${notifId}/read`, { method: "PUT" });
    if (!res.ok) { const data = await res.json(); throw new Error(data.error); }
    return true;
}

export async function apiMarkAllNotifsRead() {
    const res = await apiFetch("/notifications/read-all", { method: "PUT" });
    if (!res.ok) { const data = await res.json(); throw new Error(data.error); }
    return true;
}

// ── Downloads API ────────────────────────────────────────────────────────────
export async function apiDownloadDocument(dbId, docType, fileFormat) {
    // docType: "mom" | "gist"    fileFormat: "pdf" | "docx"
    const token = getToken();
    const res = await fetch(`${BASE_URL}/download/${dbId}/${docType}/${fileFormat}`, {
        headers: { "Authorization": `Bearer ${token}` },
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Download failed");
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    // Parse the disposition securely
    const disp = res.headers.get("content-disposition");
    let filename = `document_${docType}.${fileFormat}`;
    if (disp && disp.includes("filename=")) {
        filename = disp.split("filename=")[1].replace(/["']/g, "");
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// ── Statistics API ─────────────────────────────────────────────────────────────
export async function apiFetchClearanceStats() {
    const res = await fetch(`${BASE_URL}/statistics/ec-granted-2022`);
    if (!res.ok) {
        throw new Error("Failed to load statistics");
    }
    return await res.json();
}

// ── Health Check ─────────────────────────────────────────────────────────────
export async function apiHealthCheck() {
    try {
        const res = await fetch(`${BASE_URL}/health`);
        return res.ok;
    } catch {
        return false;
    }
}

// ── AI Auto-Scrutiny ─────────────────────────────────────────────────────────
export async function apiAiScrutiny(appDbId, docs = []) {
    const res = await apiFetch(`/ai/scrutiny/${appDbId}`, {
        method: "POST",
        body: JSON.stringify({ documents: docs }),
    });
    if (!res.ok) throw new Error("AI scrutiny failed");
    return await res.json();
}

// ── AI Generate Gist ─────────────────────────────────────────────────────────
export async function apiAiGenerateGist(appDbId, template = null) {
    const res = await apiFetch(`/ai/generate-gist/${appDbId}`, {
        method: "POST",
        body: JSON.stringify({ template }),
    });
    if (!res.ok) throw new Error("Gist generation failed");
    return await res.json();
}

// ── AI Generate MoM ──────────────────────────────────────────────────────────
export async function apiAiGenerateMom(appDbId) {
    const res = await apiFetch(`/ai/generate-mom/${appDbId}`, { method: "POST" });
    if (!res.ok) throw new Error("MoM generation failed");
    return await res.json();
}

// ── EDS Points Reference ─────────────────────────────────────────────────────
export async function apiGetEdsPoints() {
    const res = await apiFetch(`/ai/eds-points`);
    if (!res.ok) throw new Error("Failed loading EDS points");
    return await res.json();
}

// ── Master Templates ─────────────────────────────────────────────────────────
export async function apiGetTemplates() {
    const res = await apiFetch(`/ai/templates`);
    if (!res.ok) throw new Error("Failed loading templates");
    return await res.json();
}

export async function apiUpdateTemplate(templateId, data) {
    const res = await apiFetch(`/ai/templates/${templateId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed updating template");
    return await res.json();
}

// ── Sector Checklists ────────────────────────────────────────────────────────
export async function apiGetChecklists() {
    const res = await apiFetch(`/ai/checklists`);
    if (!res.ok) throw new Error("Failed loading checklists");
    return await res.json();
}

export async function apiUpdateChecklist(sector, checklist) {
    const res = await apiFetch(`/ai/checklists/${encodeURIComponent(sector)}`, {
        method: "PUT",
        body: JSON.stringify({ checklist }),
    });
    if (!res.ok) throw new Error("Failed updating checklist");
    return await res.json();
}

// ── Affidavit Templates ──────────────────────────────────────────────────────
export async function apiGetAffidavits() {
    const res = await apiFetch(`/ai/affidavits`);
    if (!res.ok) throw new Error("Failed loading affidavits");
    return await res.json();
}

// ── Live Analytics ───────────────────────────────────────────────────────────
export async function apiGetAnalytics() {
    const res = await apiFetch(`/ai/analytics`);
    if (!res.ok) throw new Error("Failed loading analytics");
    return await res.json();
}

// ── SLA Dashboard ────────────────────────────────────────────────────────────
export async function apiGetSlaStatus() {
    const res = await apiFetch(`/ai/sla`);
    if (!res.ok) throw new Error("Failed loading SLA data");
    return await res.json();
}

// ── SLA Auto-Escalation ──────────────────────────────────────────────────────
export async function apiSlaEscalate() {
    const res = await apiFetch(`/ai/sla/escalate`, { method: "POST" });
    if (!res.ok) throw new Error("Escalation failed");
    return await res.json();
}

