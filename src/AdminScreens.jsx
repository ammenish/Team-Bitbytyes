import React, { useState, useEffect } from "react";
import { apiListUsers, apiUpdateUser, apiGetChecklists, apiUpdateChecklist, apiGetTemplates, apiUpdateTemplate, apiSlaEscalate } from "./api.js";
import Ic from './Ic.jsx';
import { CATEGORIES, SECTORS } from './data.js';
import { Badge, StatCard } from './helpers.jsx';

export const AdminHome = ({ apps, notify }) => {
    const s = (st) => apps.filter(a => a.status === st).length;
    const triggerSla = async () => {
        try {
            const res = await apiSlaEscalate();
            notify(`SLA Check Complete: ${res.escalated_count} escalating warnings sent.`);
        } catch(e) {
            notify("Failed to trigger SLA checks");
        }
    };
    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div><h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 24, fontWeight: 800, color: "#0a2463" }}>System Overview</h1><p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>PARI✓ESH 3.0 — Administrative Control Center</p></div>
                <button className="btn btn-secondary" onClick={triggerSla}><Ic n="warn" s={14} color="#dc2626"/> Run SLA Deadlines Check</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 14, marginBottom: 22 }}>
                <StatCard label="Total Applications" val={apps.length} icon="file" color="#1e56c2" sub="All statuses" />
                <StatCard label="Under Scrutiny" val={s("Under Scrutiny")} icon="eye" color="#d97706" sub="Awaiting review" />
                <StatCard label="EDS Issued" val={s("EDS Issued")} icon="warn" color="#dc2626" sub="Pending correction" />
                <StatCard label="In Meeting Stage" val={s("Referred for Meeting") + s("MoM Generated")} icon="meet" color="#0077b6" sub="Active meetings" />
                <StatCard label="Finalized" val={s("Finalized")} icon="ok" color="#059669" sub="Clearance granted" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ fontWeight: 700, marginBottom: 14, color: "#0a2463", fontSize: 15 }}>Applications by Category</div>
                    {CATEGORIES.map(c => { const n = apps.filter(a => a.category === c).length, p = apps.length ? Math.round(n / apps.length * 100) : 0; return (<div key={c} style={{ marginBottom: 12 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}><span style={{ fontWeight: 500 }}>{c}</span><span style={{ color: "#64748b" }}>{n} ({p}%)</span></div><div className="progress-bar"><div className="progress-fill" style={{ width: `${p}%` }} /></div></div>); })}
                </div>
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ fontWeight: 700, marginBottom: 14, color: "#0a2463", fontSize: 15 }}>Latest Applications</div>
                    {apps.slice(0, 5).map(a => <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f1f5f9" }}><div><div style={{ fontSize: 13, fontWeight: 600 }}>{a.id}</div><div style={{ fontSize: 11, color: "#64748b" }}>{a.proponent}</div></div><Badge t={a.status} /></div>)}
                </div>
            </div>
        </div>
    );
};

export const UserMgmt = ({ notify }) => {
    const [users, setUsers] = useState([]);
    const [show, setShow] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", role: "scrutiny" });
    const rc = { proponent: "#059669", scrutiny: "#d97706", mom: "#7c3aed" };
    
    useEffect(() => {
        apiListUsers().then(setUsers).catch(e => console.error(e));
    }, []);

    const add = () => { setUsers(p => [...p, { id: Date.now(), ...form }]); setShow(false); setForm({ name: "", email: "", role: "scrutiny" }); notify("User provisioned"); };
    
    const toggle = async (id, currentRole) => { 
        const newRole = currentRole === "scrutiny" ? "mom" : "scrutiny";
        try {
            await apiUpdateUser(id, { role: newRole });
            setUsers(p => p.map(u => u.id === id ? { ...u, role: newRole } : u)); 
            notify("Role updated"); 
        } catch (e) {
            notify("Failed to update user role");
        }
    };
    
    return (
        <div className="fade-in">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div><h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 24, fontWeight: 800, color: "#0a2463" }}>User Management</h1><p style={{ color: "#64748b", fontSize: 13 }}>Dynamic role assignment & access control</p></div>
                <button className="btn btn-primary" onClick={() => setShow(true)}><Ic n="plus" s={14} />Add User</button>
            </div>
            <div className="card" style={{ overflow: "hidden" }}>
                <table className="table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
                    <tbody>{users.map(u => <tr key={u.id}><td style={{ fontWeight: 600 }}>{u.name}</td><td style={{ color: "#64748b" }}>{u.email}</td>
                        <td><span className="badge" style={{ background: (rc[u.role] || "#1e56c2") + "18", color: rc[u.role] || "#1e56c2" }}>{u.role}</span></td>
                        <td>{(u.role === "scrutiny" || u.role === "mom") && <button className="btn btn-secondary btn-sm" onClick={() => toggle(u.id, u.role)}><Ic n="sync" s={12} />Switch to {u.role === "scrutiny" ? "MoM" : "Scrutiny"}</button>}</td>
                    </tr>)}</tbody></table>
            </div>
            {show && <div className="modal-backdrop" onClick={() => setShow(false)}><div className="modal" onClick={e => e.stopPropagation()}>
                <h3 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, color: "#0a2463", marginBottom: 18 }}>Provision New User</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                    <div><label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Full Name</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Dr. Firstname Lastname" /></div>
                    <div><label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Official Email</label><input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="official@moef.gov.in" /></div>
                    <div><label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Assign Role</label>
                        <select className="input select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}><option value="scrutiny">Scrutiny Team</option><option value="mom">MoM Team</option><option value="proponent">Project Proponent</option></select>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 22 }}><button className="btn btn-primary" onClick={add} style={{ flex: 1, justifyContent: "center" }}>Create User</button><button className="btn btn-secondary" onClick={() => setShow(false)}>Cancel</button></div>
            </div></div>}
        </div>
    );
};

export const Templates = ({ notify }) => {
    const [tpls, setTpls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTpl, setSelectedTpl] = useState(null);
    const [editList, setEditList] = useState([]);
    const [newItem, setNewItem] = useState("");

    useEffect(() => {
        loadTpls();
    }, []);

    const loadTpls = async () => {
        try {
            setLoading(true);
            const data = await apiGetTemplates();
            setTpls(data);
            setLoading(false);
        } catch (e) {
            console.error("Failed loading templates", e);
            notify("Error loading templates");
            setLoading(false);
        }
    };

    const handleEdit = (t) => {
        setSelectedTpl(t);
        setEditList([...(t.secs || [])]);
    };

    const handleRemove = (idx) => {
        const newList = [...editList];
        newList.splice(idx, 1);
        setEditList(newList);
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (newItem.trim()) {
            setEditList([...editList, newItem.trim()]);
            setNewItem("");
        }
    };

    const handleSave = async () => {
        try {
            const updated = await apiUpdateTemplate(selectedTpl.id, { 
                secs: editList,
                upd: new Date().toISOString().split('T')[0]
            });
            setTpls(prev => prev.map(t => t.id === updated.template.id ? updated.template : t));
            notify(`Saved ${updated.template.name}`);
            setSelectedTpl(null);
        } catch (e) {
            console.error("Failed to save template", e);
            notify("Failed to save template");
        }
    };

    if (loading) return <div>Loading Templates...</div>;

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24 }}><h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 24, fontWeight: 800, color: "#0a2463" }}>Gist Template Manager</h1><p style={{ color: "#64748b", fontSize: 13 }}>Master templates for auto-gist generation by category</p></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 16 }}>
                {tpls.map(t => <div key={t.id} className="card" style={{ padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><Badge t={t.cat} /><span style={{ fontSize: 11, color: "#64748b" }}>Updated {t.upd}</span></div>
                    <div style={{ fontWeight: 700, color: "#0a2463", marginBottom: 12 }}>{t.name}</div>
                    <div style={{ marginBottom: 14 }}>{t.secs.map((s, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #f0f4f8", fontSize: 13 }}><span style={{ width: 19, height: 19, borderRadius: 6, background: "#eff6ff", color: "#2563eb", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", minWidth: 19 }}>{i + 1}</span>{s}</div>)}</div>
                    <button className="btn btn-secondary btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={() => handleEdit(t)}><Ic n="edit" s={12} />Edit Template</button>
                </div>)}
            </div>

            {selectedTpl && (
                <div className="modal-backdrop" onClick={() => setSelectedTpl(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 600, maxWidth: "90%" }}>
                        <h3 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, color: "#0a2463", marginBottom: 18 }}>Editing: {selectedTpl.name} ({selectedTpl.cat})</h3>
                        
                        <div style={{ maxHeight: "50vh", overflowY: "auto", marginBottom: 16, border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 }}>
                            {editList.length === 0 ? <div style={{ color: "#94a3b8", fontSize: 13, padding: 10 }}>No sections configured.</div> : (
                                editList.map((item, idx) => (
                                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                                        <span style={{ fontSize: 13, fontWeight: 500, color: "#334155", display: "flex", alignItems: "center", gap: 8 }}>
                                            <span style={{ width: 19, height: 19, borderRadius: 6, background: "#eff6ff", color: "#2563eb", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{idx + 1}</span>
                                            {item}
                                        </span>
                                        <button onClick={() => handleRemove(idx)} style={{ border: "none", background: "none", color: "#dc2626", cursor: "pointer", padding: "4px" }}>
                                            <Ic n="x" s={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <form onSubmit={handleAdd} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                            <input className="input" style={{ flex: 1 }} value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Add new section (e.g. Committee Discussion Points)" />
                            <button type="submit" className="btn btn-secondary">Add</button>
                        </form>

                        <div style={{ display: "flex", gap: 10 }}>
                            <button className="btn btn-primary" onClick={handleSave} style={{ flex: 1, justifyContent: "center" }}>Save Sections</button>
                            <button className="btn btn-secondary" onClick={() => setSelectedTpl(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const AppTable = ({ apps, title, sub }) => (
    <div className="fade-in">
        <div style={{ marginBottom: 22 }}><h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 24, fontWeight: 800, color: "#0a2463" }}>{title || "Applications"}</h1><p style={{ color: "#64748b", fontSize: 13 }}>{sub || `${apps.length} records`}</p></div>
        <div className="card" style={{ overflow: "auto" }}>
            <table className="table"><thead><tr><th>App ID</th><th>Proponent</th><th>Sector</th><th>Category</th><th>Project</th><th>Status</th><th>Fee</th></tr></thead>
                <tbody>{apps.map(a => <tr key={a.id}>
                    <td><span style={{ fontWeight: 700, color: "#1e56c2", fontFamily: "monospace", fontSize: 12 }}>{a.id}</span></td>
                    <td style={{ fontWeight: 500 }}>{a.proponent}</td>
                    <td><span className="badge" style={{ background: "#eff6ff", color: "#2563eb", fontSize: 11 }}>{a.sector}</span></td>
                    <td style={{ fontSize: 13 }}>{a.category}</td>
                    <td style={{ maxWidth: 190, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13 }}>{a.project}</td>
                    <td><Badge t={a.status} /></td>
                    <td><span style={{ color: a.feesPaid ? "#059669" : "#dc2626", fontWeight: 600, fontSize: 12 }}>₹{a.fees.toLocaleString()} {a.feesPaid ? "✓" : "⚠"}</span></td>
                </tr>)}</tbody></table>
        </div>
    </div>
);

export const SectorParams = ({ notify }) => {
    const [checklists, setChecklists] = useState({});
    const [selectedSector, setSelectedSector] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editList, setEditList] = useState([]);
    const [newItem, setNewItem] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await apiGetChecklists();
            setChecklists(data);
            setLoading(false);
        } catch (e) {
            console.error("Failed loading checklists", e);
            notify("Error loading sector parameters");
            setLoading(false);
        }
    };

    const handleEdit = (sector) => {
        setSelectedSector(sector);
        setEditList([...checklists[sector]]);
    };

    const handleRemove = (idx) => {
        const newList = [...editList];
        newList.splice(idx, 1);
        setEditList(newList);
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (newItem.trim()) {
            setEditList([...editList, newItem.trim()]);
            setNewItem("");
        }
    };

    const handleSave = async () => {
        try {
            await apiUpdateChecklist(selectedSector, editList);
            setChecklists(prev => ({ ...prev, [selectedSector]: editList }));
            notify(`Saved parameters for ${selectedSector}`);
            setSelectedSector(null);
        } catch (e) {
            console.error("Failed to save params", e);
            notify("Failed to save parameters");
        }
    };

    if (loading) return <div>Loading Parameters...</div>;

    const availableSectors = Object.keys(checklists);

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 24, fontWeight: 800, color: "#0a2463", marginBottom: 6 }}>Sector Parameters Editor</h1>
                <p style={{ color: "#64748b", fontSize: 13, marginBottom: 22 }}>Configure required documents and AI scrutiny criteria for each sector</p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 16 }}>
                {availableSectors.map(s => (
                    <div key={s} className="card" style={{ padding: 16 }}>
                        <div style={{ fontWeight: 700, color: "#0a2463", marginBottom: 7 }}>{s}</div>
                        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>{checklists[s].length} Document Criteria required</div>
                        <button className="btn btn-secondary btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={() => handleEdit(s)}>
                            <Ic n="edit" s={12} /> Configure Criteria
                        </button>
                    </div>
                ))}
            </div>

            {selectedSector && (
                <div className="modal-backdrop" onClick={() => setSelectedSector(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 600, maxWidth: "90%" }}>
                        <h3 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, color: "#0a2463", marginBottom: 18 }}>Editing: {selectedSector} Parameters</h3>
                        
                        <div style={{ maxHeight: "50vh", overflowY: "auto", marginBottom: 16, border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 }}>
                            {editList.length === 0 ? <div style={{ color: "#94a3b8", fontSize: 13, padding: 10 }}>No criteria found.</div> : (
                                editList.map((item, idx) => (
                                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                                        <span style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{idx + 1}. {item}</span>
                                        <button onClick={() => handleRemove(idx)} style={{ border: "none", background: "none", color: "#dc2626", cursor: "pointer", padding: "4px" }}>
                                            <Ic n="x" s={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <form onSubmit={handleAdd} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                            <input className="input" style={{ flex: 1 }} value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Type new requirement (e.g. NOC from Forest Dept)" />
                            <button type="submit" className="btn btn-secondary">Add</button>
                        </form>

                        <div style={{ display: "flex", gap: 10 }}>
                            <button className="btn btn-primary" onClick={handleSave} style={{ flex: 1, justifyContent: "center" }}>Save Changes</button>
                            <button className="btn btn-secondary" onClick={() => setSelectedSector(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const HeatmapDash = ({ apps }) => {
    // District coordinates for Chhattisgarh
    const DISTRICT_COORDS = {
        "Ambikapur": [23.12, 83.20],
        "Bilaspur": [22.08, 82.15],
        "Durg": [21.19, 81.28],
        "Jagdalpur": [19.08, 82.02],
        "Kanker": [20.27, 81.49],
        "Korba": [22.35, 82.68],
        "Raigarh": [21.90, 83.40],
        "Raipur": [21.25, 81.63],
        "Rajnandgaon": [21.10, 81.03],
    };

    const data = apps.map(a => {
        let loc = "Unknown", risk = 0, sector = a.sector || "Other";
        const m = /in\s+(.*?)\s+\(.*Ha\)\s+\[Risk:\s+([\d.]+)\]/.exec(a.project);
        if (m) { loc = m[1]; risk = parseFloat(m[2]); }
        return { loc, risk, sector };
    }).filter(d => d.loc !== "Unknown");

    const locGroup = {}, locSectorCount = {};
    data.forEach(d => {
        if (!locGroup[d.loc]) locGroup[d.loc] = { sum: 0, count: 0 };
        locGroup[d.loc].sum += d.risk;
        locGroup[d.loc].count += 1;
        if (!locSectorCount[d.loc]) locSectorCount[d.loc] = {};
        locSectorCount[d.loc][d.sector] = (locSectorCount[d.loc][d.sector] || 0) + 1;
    });

    const locations = Object.keys(locGroup).sort();
    const sectors = [...new Set(data.map(d => d.sector))].sort();

    const getRiskColor = (risk) => {
        const ratio = Math.min(Math.max(risk, 0), 1);
        const hue = (1 - ratio) * 120;
        return `hsl(${hue}, 75%, 45%)`;
    };

    let maxConc = 0;
    locations.forEach(l => { sectors.forEach(s => { const v = locSectorCount[l][s] || 0; if (v > maxConc) maxConc = v; }); });

    // Leaflet map ref
    const mapRef = React.useRef(null);
    const mapInstance = React.useRef(null);

    React.useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        // Dynamic import of leaflet
        import('leaflet').then(L => {
            // Fix default icon paths
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            const map = L.map(mapRef.current, { scrollWheelZoom: true, zoomControl: true }).setView([21.5, 82.0], 7);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18,
            }).addTo(map);

            // Add circle markers for each district
            locations.forEach(loc => {
                const coords = DISTRICT_COORDS[loc];
                if (!coords) return;
                const avgRisk = locGroup[loc].sum / locGroup[loc].count;
                const color = getRiskColor(avgRisk);
                const radius = 12000 + locGroup[loc].count * 800;

                const circle = L.circle(coords, {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.65,
                    radius: radius,
                    weight: 2,
                }).addTo(map);

                // Tooltip with info
                circle.bindPopup(`
                    <div style="font-family:Outfit,sans-serif;min-width:160px">
                        <div style="font-weight:800;font-size:15px;color:#0a2463;margin-bottom:6px">${loc}</div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                            <span style="color:#64748b;font-size:12px">Avg Risk Score</span>
                            <span style="font-weight:700;color:${color};font-size:13px">${avgRisk.toFixed(2)}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                            <span style="color:#64748b;font-size:12px">Total Projects</span>
                            <span style="font-weight:700;color:#0a2463;font-size:13px">${locGroup[loc].count}</span>
                        </div>
                        <hr style="border:none;border-top:1px solid #e2e8f0;margin:6px 0"/>
                        <div style="font-size:11px;color:#94a3b8">Click for details</div>
                    </div>
                `);

                // Label on map
                L.marker(coords, {
                    icon: L.divIcon({
                        className: 'leaflet-district-label',
                        html: `<div style="text-align:center;font-family:Outfit,sans-serif;text-shadow:0 1px 4px rgba(0,0,0,0.7)">
                            <div style="font-weight:800;font-size:11px;color:#fff">${loc}</div>
                            <div style="font-weight:900;font-size:16px;color:#fff">${avgRisk.toFixed(2)}</div>
                        </div>`,
                        iconSize: [80, 40],
                        iconAnchor: [40, 20],
                    })
                }).addTo(map);
            });

            // Add legend
            const legend = L.control({ position: 'bottomright' });
            legend.onAdd = function() {
                const div = L.DomUtil.create('div');
                div.style.cssText = 'background:white;padding:10px 14px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.15);font-family:Outfit,sans-serif;font-size:11px';
                div.innerHTML = `
                    <div style="font-weight:700;margin-bottom:6px;color:#0a2463">Risk Legend</div>
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px"><span style="width:12px;height:12px;border-radius:50%;background:hsl(120,75%,45%);display:inline-block"></span> Low (&lt;0.3)</div>
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px"><span style="width:12px;height:12px;border-radius:50%;background:hsl(60,75%,45%);display:inline-block"></span> Medium (0.3-0.6)</div>
                    <div style="display:flex;align-items:center;gap:6px"><span style="width:12px;height:12px;border-radius:50%;background:hsl(0,75%,45%);display:inline-block"></span> High (&gt;0.6)</div>
                `;
                return div;
            };
            legend.addTo(map);

            mapInstance.current = map;

            // Force a resize after a short delay to fix rendering
            setTimeout(() => map.invalidateSize(), 200);
        });

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [locations.length]);

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 24, fontWeight: 800, color: "#0a2463" }}>Geospatial Heat Maps</h1>
                <p style={{ color: "#64748b", fontSize: 14 }}>Real-time Risk and Concentration Analytics across Districts</p>
            </div>
            
            {/* Real Interactive Map */}
            <div className="card" style={{ padding: 0, marginBottom: 24, overflow: "hidden", borderRadius: 14 }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0a2463", margin: 0 }}>🗺️ Chhattisgarh District Risk Map</h3>
                    <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>Interactive map — click circles for project details. Larger circles = more projects.</p>
                </div>
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                <div ref={mapRef} style={{ height: 480, width: "100%", background: "#e8f0fe" }} />
            </div>

            {/* Quick Stats Row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
                {locations.map(loc => {
                    const avgRisk = locGroup[loc].sum / locGroup[loc].count;
                    return (
                        <div key={loc} style={{ 
                            padding: "12px 16px", borderRadius: 10, 
                            background: getRiskColor(avgRisk), color: "white",
                            minWidth: 120, textAlign: "center",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            textShadow: "0 1px 3px rgba(0,0,0,0.3)"
                        }}>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{loc}</div>
                            <div style={{ fontSize: 20, fontWeight: 900 }}>{avgRisk.toFixed(2)}</div>
                            <div style={{ fontSize: 10, opacity: 0.9 }}>{locGroup[loc].count} Projects</div>
                        </div>
                    );
                })}
            </div>

            {/* Industrial Concentration Table */}
            <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0a2463", marginBottom: 16 }}>🏭 Industrial Concentration Heat Map</h3>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Project types distributed across districts.</p>
                
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 4 }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: "left", padding: "8px", color: "#64748b", fontSize: 12 }}>District</th>
                                {sectors.map(s => <th key={s} style={{ padding: "8px", color: "#64748b", fontSize: 11, fontWeight: 600, width: "120px" }}>{s}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {locations.map(loc => (
                                <tr key={loc}>
                                    <td style={{ fontWeight: 600, color: "#0a2463", fontSize: 13, padding: "8px" }}>{loc}</td>
                                    {sectors.map(sec => {
                                        const count = locSectorCount[loc]?.[sec] || 0;
                                        const opacity = maxConc ? 0.15 + (count / maxConc) * 0.85 : 0.1;
                                        return (
                                            <td key={sec} style={{ 
                                                background: count > 0 ? `rgba(220, 38, 38, ${opacity})` : "#f8fafc",
                                                borderRadius: 6, textAlign: "center", padding: "12px 8px",
                                                fontSize: 13, fontWeight: count > 0 ? 700 : 400,
                                                color: count > 0 ? (opacity > 0.5 ? "white" : "#7f1d1d") : "#cbd5e1",
                                                border: "1px solid #e2e8f0", transition: "all 0.2s"
                                            }}>
                                                {count > 0 ? count : "-"}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

