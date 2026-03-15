import { useState, useEffect } from "react";
import { SECTORS } from './data.js';
import { apiListApps, apiUpdateApp, apiPayFees, apiCreateApp, apiListNotifications, apiMarkAllNotifsRead, clearTokens, getSavedUser, apiLogin, apiCreatePaymentOrder, apiVerifyPayment, getQrCodeUrl } from './api.js';
import Ic from './Ic.jsx';
import Login from './Login.jsx';
import LandingPage from './LandingPage.jsx';
import Sidebar from './Sidebar.jsx';
import { AdminHome, UserMgmt, Templates, AppTable, HeatmapDash, SectorParams } from './AdminScreens.jsx';
import { PPHome, NewApp } from './ProponentScreens.jsx';
import { ScrutinyHome, ReviewQ, EDSMgmt, GistGen } from './ScrutinyScreens.jsx';
import { MoMHome, MoMEd, Finalized } from './MoMScreens.jsx';

// ── Global Styles (injected once) ─────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const globalStyle = document.createElement("style");
globalStyle.textContent = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f0f4f8; }
  .fade-in { animation: fadeIn 0.4s ease both; }
  .slide-up { animation: slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both; }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
  @keyframes slideUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
  .card { background: #fff; border-radius: 16px; border: 1px solid #dce3ef; box-shadow: 0 2px 12px rgba(10,36,99,0.06); }
  .btn { display:inline-flex; align-items:center; gap:6px; padding:9px 20px; border-radius:10px; border:none; cursor:pointer; font-family:inherit; font-weight:600; font-size:14px; transition:all 0.18s ease; }
  .btn:disabled { opacity:0.5; cursor:not-allowed; }
  .btn-primary { background:#1e56c2; color:#fff; }
  .btn-primary:not(:disabled):hover { background:#1749a8; transform:translateY(-1px); box-shadow:0 4px 16px rgba(30,86,194,0.3); }
  .btn-secondary { background:#e8edf5; color:#0a2463; }
  .btn-secondary:hover { background:#d5dff0; }
  .btn-danger { background:#fff0f3; color:#ef476f; border:1px solid #ffd0da; }
  .btn-success { background:#e8fdf5; color:#059669; border:1px solid #a7f3d0; }
  .btn-sm { padding:6px 14px; font-size:13px; }
  .input { width:100%; padding:10px 14px; border:1.5px solid #dce3ef; border-radius:10px; font-family:inherit; font-size:14px; color:#0f172a; outline:none; transition:border 0.18s; background:#fff; }
  .input:focus { border-color:#3a86ff; box-shadow:0 0 0 3px rgba(58,134,255,0.1); }
  .select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; padding-right:36px; }
  .badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:600; }
  .sidebar-link { display:flex; align-items:center; gap:10px; padding:10px 16px; border-radius:10px; cursor:pointer; font-size:13.5px; font-weight:500; color:rgba(255,255,255,0.7); transition:all 0.18s; margin:2px 8px; }
  .sidebar-link:hover { background:rgba(255,255,255,0.1); color:#fff; }
  .sidebar-link.active { background:#3a86ff; color:#fff; box-shadow:0 2px 8px rgba(58,134,255,0.4); }
  .modal-backdrop { position:fixed; inset:0; background:rgba(10,36,99,0.45); backdrop-filter:blur(4px); z-index:1000; display:flex; align-items:center; justify-content:center; }
  .modal { background:#fff; border-radius:20px; padding:28px; max-width:540px; width:90%; max-height:85vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,0.2); animation:slideUp 0.3s ease both; }
  .table { width:100%; border-collapse:collapse; }
  .table th { background:#f8fafc; color:#64748b; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; padding:10px 14px; text-align:left; border-bottom:1px solid #dce3ef; }
  .table td { padding:12px 14px; border-bottom:1px solid #f1f5f9; font-size:14px; color:#0f172a; }
  .table tr:hover td { background:#fafbfe; }
  .notif { position:fixed; top:20px; right:20px; z-index:9999; background:#fff; border-radius:12px; padding:14px 18px; box-shadow:0 8px 30px rgba(0,0,0,0.15); border-left:4px solid #06d6a0; display:flex; align-items:center; gap:10px; font-size:14px; font-weight:500; animation:slideUp 0.3s ease; min-width:280px; }
  .progress-bar { height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden; }
  .progress-fill { height:100%; background:linear-gradient(90deg,#3a86ff,#00b4d8); border-radius:3px; transition:width 0.5s ease; }
`;
document.head.appendChild(globalStyle);

// ── Profile Settings Component ───────────────────────────────────────────────
const ProfileSettings = ({ user, setView }) => {
    return (
        <div className="fade-in" style={{ maxWidth: 500, margin: "0 auto", background: "#f8fafc", borderRadius: 24, padding: "20px 0" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "0 20px", marginBottom: 30 }}>
                <div style={{ cursor: "pointer", padding: "5px" }} onClick={() => setView('dashboard')}>
                    <Ic n="arrL" s={22} c="#0a2463" />
                </div>
                <h2 style={{ flex: 1, textAlign: "center", fontSize: 18, fontWeight: 700, color: "#0a2463", marginRight: 32 }}>Profile Settings</h2>
            </div>

            {/* Avatar Section */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 30 }}>
                <div style={{ position: "relative", marginBottom: 16 }}>
                    <div style={{ width: 100, height: 100, borderRadius: "50%", border: "3px solid #007AFF", display: "flex", alignItems: "center", justifyContent: "center", background: "#e2e8f0" }}>
                        <Ic n="user" s={44} c="#94a3b8" />
                    </div>
                    <div style={{ position: "absolute", bottom: 0, right: 0, width: 32, height: 32, background: "#0a2463", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid #fff" }}>
                        <Ic n="edit" s={14} c="#fff" />
                    </div>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: "#0a2463", marginBottom: 6 }}>{user.email.split('@')[0]}</h3>
                <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500, marginBottom: 6 }}>
                    <span style={{ background: "#e0f2fe", color: "#0284c7", padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 800, marginRight: 8 }}>LEVEL 8</span>
                    Senior {user.role === 'admin' ? 'Administrator' : 'Officer'}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{user.email}</div>
            </div>

            {/* Stats Card */}
            <div style={{ background: "#0a2463", borderRadius: 24, padding: "24px 0", display: "flex", justifyContent: "space-evenly", margin: "0 20px 34px", color: "#fff" }}>
                <div style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#3a86ff", marginBottom: 4 }}>8</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1 }}>Applications</div>
                </div>
                <div style={{ width: 1, background: "rgba(255,255,255,0.15)" }}></div>
                <div style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#05c46b", marginBottom: 4 }}>5</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1 }}>Cleared</div>
                </div>
                <div style={{ width: 1, background: "rgba(255,255,255,0.15)" }}></div>
                <div style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#fbbf24", marginBottom: 4 }}>3</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1 }}>Pending</div>
                </div>
            </div>

            {/* Menus */}
            <div style={{ padding: "0 20px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, paddingLeft: 8 }}>Account Workspace</div>
                <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #e2e8f0", marginBottom: 24 }}>
                    {[
                        { t: "Personal Information", d: "Name, designation, and contact details", i: "user" },
                        { t: "Account Security", d: "Password and login sessions", i: "shield" },
                        { t: "Notification Preferences", d: "Email, SMS, and in-app alert settings", i: "bell" },
                    ].map((m, idx) => (
                        <div key={idx} style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, borderBottom: idx < 2 ? "1px solid #f1f5f9" : "none", cursor: "pointer" }}>
                            <div style={{ width: 40, height: 40, background: "#f8fafc", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#0a2463" }}><Ic n={m.i} s={18} /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: "#0a2463", marginBottom: 3 }}>{m.t}</div>
                                <div style={{ fontSize: 12, color: "#94a3b8" }}>{m.d}</div>
                            </div>
                            <div style={{ color: "#cbd5e1", fontWeight: 700, fontSize: 16 }}>›</div>
                        </div>
                    ))}
                </div>

                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, paddingLeft: 8 }}>System Preferences</div>
                <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                    <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}>
                        <div style={{ width: 40, height: 40, background: "#f8fafc", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#0a2463" }}><Ic n="cog" s={18} /></div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#0a2463", marginBottom: 3 }}>Language & Region</div>
                            <div style={{ fontSize: 12, color: "#94a3b8" }}>Interface language and date format</div>
                        </div>
                        <div style={{ color: "#cbd5e1", fontWeight: 700, fontSize: 16 }}>›</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
    const [user, setUser] = useState(null);
    const [page, setPage] = useState("landing"); // landing | login | dashboard
    const [view, setView] = useState("dashboard");
    const [apps, setApps] = useState([]);
    const [notif, setNotif] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notify = msg => { setNotif(msg); setTimeout(() => setNotif(null), 3200); };

    // Restore session on mount
    useEffect(() => {
        const saved = getSavedUser();
        if (saved) {
            setUser(saved);
            setPage("dashboard");
        }
    }, []);

    // Fetch apps & notifications when user logs in
    useEffect(() => {
        if (user) {
            apiListApps().then(data => {
                // Map backend fields to frontend format for compatibility
                const mapped = data.map(a => ({
                    id: a.app_id,
                    dbId: a.id,
                    proponent: a.company || a.proponent,
                    sector: a.sector,
                    category: a.category,
                    project: a.project,
                    status: a.status,
                    date: a.created_at ? a.created_at.split('T')[0] : '',
                    fees: a.fees,
                    feesPaid: a.fees_paid,
                    docs: (a.documents || []).map(d => d.name),
                    gist: a.gist || '',
                    mom: a.mom || '',
                    locked: a.locked,
                    edsRemarks: a.eds_remarks || '',
                    reviewer: a.reviewer || '',
                }));
                setApps(mapped);
            }).catch(e => console.error('Failed to fetch apps:', e));

            apiListNotifications().then(data => {
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);
            }).catch(e => console.error('Failed to fetch notifications:', e));
        }
    }, [user]);

    const upd = async (id, changes) => {
        // Find the backend DB id
        const app = apps.find(a => a.id === id);
        if (!app) return;
        try {
            // Map frontend field names to backend
            const backendChanges = {};
            if ('feesPaid' in changes) {
                await apiPayFees(app.dbId);
                changes.feesPaid = true;
            } else {
                if ('status' in changes) backendChanges.status = changes.status;
                if ('gist' in changes) backendChanges.gist = changes.gist;
                if ('mom' in changes) backendChanges.mom = changes.mom;
                if ('edsRemarks' in changes) backendChanges.eds_remarks = changes.edsRemarks;
                if ('locked' in changes) backendChanges.locked = changes.locked;
                if (Object.keys(backendChanges).length > 0) {
                    await apiUpdateApp(app.dbId, backendChanges);
                }
            }
            setApps(p => p.map(a => a.id === id ? { ...a, ...changes } : a));
        } catch (e) {
            console.error('Update failed:', e);
            notify('Update failed: ' + e.message);
        }
    };

    const addApp = async (a) => {
        try {
            const created = await apiCreateApp({
                project: a.project,
                sector: a.sector,
                category: a.category,
                fees: a.fees || 0,
                fees_paid: a.feesPaid || false,
                documents: a.docs || [],
            });
            const mapped = {
                id: created.app_id,
                dbId: created.id,
                proponent: created.company || created.proponent,
                sector: created.sector,
                category: created.category,
                project: created.project,
                status: created.status,
                date: created.created_at ? created.created_at.split('T')[0] : '',
                fees: created.fees,
                feesPaid: created.fees_paid,
                docs: (created.documents || []).map(d => d.name),
                gist: '', mom: '', locked: false, edsRemarks: '', reviewer: '',
            };
            setApps(p => [mapped, ...p]);
            setView("myApps");
        } catch (e) {
            console.error('Create app failed:', e);
            notify('Failed to create application: ' + e.message);
        }
    };

    const handleLogin = (u) => {
        setUser(u);
        setPage("dashboard");
        setView("dashboard");
    };

    const handleLogout = () => {
        clearTokens();
        setUser(null);
        setApps([]);
        setNotifications([]);
        setPage("landing");
        setView("dashboard");
    };

    const handleMarkAllRead = async () => {
        try {
            await apiMarkAllNotifsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (e) { console.error('Mark all read failed:', e); }
    };

    if (!user && page === "landing") return <LandingPage onLogin={(u) => { if (u && u.role) handleLogin(u); else setPage("login"); }} />;
    if (!user) return <Login onLogin={handleLogin} />;

    const render = () => {
        if (view === "profile") return <ProfileSettings user={user} setView={setView} />;
        const { role } = user;
        if (role === "admin") {
            if (view === "dashboard") return <AdminHome apps={apps} />;
            if (view === "users") return <UserMgmt notify={notify} />;
            if (view === "templates") return <Templates notify={notify} />;
            if (view === "allApps") return <AppTable apps={apps} title="All Applications" sub={`${apps.length} total records`} />;
            if (view === "heatmaps") return <HeatmapDash apps={apps} />;
            if (view === "sectors") return <SectorParams notify={notify} />;
        }
        if (role === "proponent") {
            if (view === "dashboard") return <PPHome user={user} apps={apps} />;
            if (view === "newApp") return <NewApp user={user} onAdd={addApp} notify={notify} />;
            if (view === "myApps") return <AppTable apps={apps.filter(a => a.proponent === (user.company || user.name))} title="My Applications" />;
            if (view === "payments") return (
                <div className="fade-in">
                    <h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 24, fontWeight: 800, color: "#0a2463", marginBottom: 6 }}>Fee Payments</h1>
                    <p style={{ color: "#64748b", fontSize: 13, marginBottom: 22 }}>Pay via Cashfree — UPI, Cards, Net Banking & QR Code supported</p>
                    <div className="card" style={{ overflow: "hidden" }}>
                        <table className="table"><thead><tr><th>App ID</th><th>Project</th><th>Fee</th><th>Status</th><th>Pay via Cashfree</th><th>QR Code</th></tr></thead>
                            <tbody>{apps.filter(a => a.proponent === (user.company || user.name)).map(a => <tr key={a.id}>
                                <td><span style={{ fontFamily: "monospace", fontWeight: 700, color: "#1e56c2", fontSize: 12 }}>{a.id}</span></td>
                                <td style={{ fontWeight: 500 }}>{a.project}</td>
                                <td style={{ fontWeight: 700 }}>₹{a.fees.toLocaleString()}</td>
                                <td><span style={{ color: a.feesPaid ? "#059669" : "#dc2626", fontWeight: 600, fontSize: 12 }}>{a.feesPaid ? "Paid ✓" : "Pending ⚠"}</span></td>
                                <td>{!a.feesPaid && <button className="btn btn-primary btn-sm" onClick={async () => {
                                    try {
                                        const order = await apiCreatePaymentOrder(a.id);
                                        
                                        // ── MOCK GATEWAY (For Hackathon Demo if keys not set) ──
                                        if (order.is_mock) {
                                            const mockOverlay = document.createElement("div");
                                            mockOverlay.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px);font-family:sans-serif;";
                                            const box = document.createElement("div");
                                            box.style.cssText = "background:#fff;width:380px;border-radius:12px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.2);animation:slideUpFade 0.3s ease;";
                                            box.innerHTML = `
                                                <div style="background:#552288;color:#fff;padding:20px;text-align:center;">
                                                    <h3 style="margin:0;font-size:18px;font-weight:700">PARIVESH 3.0</h3>
                                                    <div style="opacity:0.8;font-size:13px;margin-top:4px">Cashfree Secured Checkout</div>
                                                </div>
                                                <div style="padding:24px;text-align:center;">
                                                    <div style="font-size:28px;font-weight:800;color:#0f172a;margin-bottom:8px">₹${order.amount_inr.toLocaleString()}</div>
                                                    <div style="font-size:13px;color:#64748b;margin-bottom:24px">${order.description}</div>
                                                    
                                                    <button id="mock-pay-btn" style="width:100%;padding:14px;background:#552288;color:#fff;border:none;border-radius:8px;font-weight:700;font-size:15px;cursor:pointer;margin-bottom:12px;transition:0.2s">Pay with UPI / Cards</button>
                                                    <button id="mock-cancel-btn" style="width:100%;padding:14px;background:transparent;color:#64748b;border:none;font-weight:600;font-size:14px;cursor:pointer;">Cancel Payment</button>
                                                </div>
                                            `;
                                            mockOverlay.appendChild(box);
                                            document.body.appendChild(mockOverlay);

                                            document.getElementById("mock-cancel-btn").onclick = () => {
                                                mockOverlay.remove();
                                                notify("Payment cancelled");
                                            };
                                            
                                            document.getElementById("mock-pay-btn").onclick = async () => {
                                                document.getElementById("mock-pay-btn").innerText = "Processing...";
                                                document.getElementById("mock-pay-btn").style.opacity = "0.7";
                                                setTimeout(async () => {
                                                    mockOverlay.remove();
                                                    try {
                                                        await apiVerifyPayment({
                                                            cf_order_id: order.order_id,
                                                            cf_payment_id: "pay_mock_" + Math.random().toString(36).substr(2, 9),
                                                            app_db_id: a.id,
                                                        });
                                                        upd(a.id, { feesPaid: true });
                                                        notify(`✅ Payment of ₹${a.fees.toLocaleString()} confirmed for ${a.id}`);
                                                    } catch (err) {
                                                        notify("⚠ Payment verification failed: " + err.message);
                                                    }
                                                }, 1500); // simulate network delay
                                            };
                                            return;
                                        }

                                        // ── REAL CASHFREE GATEWAY ──
                                        const cashfree = await window.Cashfree({
                                            mode: "sandbox" // Change to "production" for live
                                        });

                                        const checkoutOptions = {
                                            paymentSessionId: order.payment_session_id,
                                            redirectTarget: "_modal"
                                        };
                                        cashfree.checkout(checkoutOptions);
                                        
                                        // Usually Cashfree provides a callback or redirects. For this demo,
                                        // we'll listen for the message event, or in a real setup, rely on webhooks.
                                        // Polling could be added here to check payment status if using _modal.

                                    } catch (err) {
                                        notify("⚠ " + err.message);
                                    }
                                }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:6}}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>Pay via Cashfree</button>}</td>
                                <td>{!a.feesPaid && <button className="btn btn-secondary btn-sm" onClick={() => {
                                    const w = window.open('', 'QR Code', 'width=400,height=500');
                                    w.document.write(`<html><head><title>QR Payment — ${a.app_id || a.id}</title></head><body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;background:#f8fafc;margin:0"><h2 style="color:#0a2463">Scan to Pay</h2><p style="color:#64748b">₹${a.fees.toLocaleString()} — ${a.project}</p><img src="${getQrCodeUrl(a.id)}" style="width:280px;height:280px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1)" /><p style="color:#94a3b8;font-size:13px;margin-top:16px">UPI QR Code • PARIVESH 3.0</p></body></html>`);
                                }}>📱 Show QR</button>}</td>
                            </tr>)}</tbody></table>
                    </div>
                </div>
            );
        }
        if (role === "scrutiny") {
            if (view === "dashboard") return <ScrutinyHome apps={apps} />;
            if (view === "review") return <ReviewQ apps={apps} upd={upd} notify={notify} />;
            if (view === "eds") return <EDSMgmt apps={apps} upd={upd} notify={notify} />;
            if (view === "gistGen") return <GistGen apps={apps} upd={upd} notify={notify} />;
        }
        if (role === "mom") {
            if (view === "dashboard") return <MoMHome apps={apps} />;
            if (view === "momEdit") return <MoMEd apps={apps} upd={upd} notify={notify} />;
            if (view === "finalized") return <Finalized apps={apps} notify={notify} />;
        }
        return <div style={{ padding: 40, color: "#94a3b8" }}>Select a section from the sidebar.</div>;
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f8" }}>
            <Sidebar user={user} active={view} setActive={setView} logout={handleLogout} />
            <main style={{ flex: 1, padding: 26, overflowY: "auto", minWidth: 0 }}>
                {view !== "profile" && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, flexWrap: "wrap", gap: 14 }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                <div style={{width: 38, height: 38, borderRadius: 8, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center"}}><Ic n="dash" s={18} c="#64748b" /></div>
                                <h2 style={{ fontSize: 24, color: "#0a2463", fontWeight: 800, letterSpacing: "-0.5px" }}>Hello, {user.email.split('@')[0]}</h2>
                            </div>
                            <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500, marginLeft: 46 }}>Ready to build today?</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div className="login-dropdown-wrapper">
                                <div style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0", cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.02)" }}>
                                    <Ic n="bell" s={20} c="#0a2463" />
                                    <div style={{ position: "absolute", top: -2, right: -2, background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 800, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>{unreadCount}</div>
                                </div>
                                <div className="login-dropdown" style={{ right: 8, left: "auto", transform: "none", minWidth: 320, padding: 20, borderRadius: 16, border: "none", boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #e2e8f0", alignItems: "baseline" }}>
                                        <span style={{ fontWeight: 800, fontSize: 16 }}>Notifications</span>
                                        <span style={{ color: "#3a86ff", fontSize: 12, cursor: "pointer", fontWeight: 700 }} onClick={handleMarkAllRead}>Mark all as read</span>
                                    </div>
                                    {notifications.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '16px 0' }}>No notifications</div>}
                                    {notifications.slice(0, 5).map((n, idx) => (
                                        <div key={n.id || idx} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: n.category === 'success' ? '#d1fae5' : '#dbeafe', flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: n.category === 'success' ? '#059669' : '#2563eb' }}><Ic n={n.category === 'success' ? 'ok' : 'file'} s={18} /></div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{n.title}</div>
                                                <div style={{ fontSize: 12, color: "#64748b" }}>{n.message}</div>
                                                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{n.created_at ? new Date(n.created_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}</div>
                                            </div>
                                            {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3a86ff", marginTop: 6 }} />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#007AFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 10px rgba(0, 122, 255, 0.3)", transition: "all 0.2s" }} onClick={() => setView('profile')}>
                                <Ic n="user" s={22} c="#fff" />
                            </div>
                        </div>
                    </div>
                )}
                {render()}
            </main>
            {notif && <div className="notif"><span style={{ color: "#06d6a0", fontSize: 18 }}>●</span>{notif}<span style={{ marginLeft: "auto", cursor: "pointer", opacity: 0.5, fontSize: 16 }} onClick={() => setNotif(null)}>✕</span></div>}
        </div>
    );
}
