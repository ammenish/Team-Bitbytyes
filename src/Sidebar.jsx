import Ic from './Ic.jsx';

const Sidebar = ({ user, active, setActive, logout }) => {
    const nav = {
        admin: [{ k: "dashboard", l: "Dashboard", i: "dash" }, { k: "heatmaps", l: "Geospatial Heatmaps", i: "cog" }, { k: "users", l: "User Management", i: "users" }, { k: "templates", l: "Gist Templates", i: "tpl" }, { k: "sectors", l: "Sector Params", i: "cog" }, { k: "allApps", l: "All Applications", i: "file" }],
        proponent: [{ k: "dashboard", l: "My Dashboard", i: "dash" }, { k: "newApp", l: "New Application", i: "plus" }, { k: "myApps", l: "My Applications", i: "file" }, { k: "payments", l: "Fee Payment", i: "pay" }],
        scrutiny: [{ k: "dashboard", l: "Dashboard", i: "dash" }, { k: "review", l: "Review Queue", i: "eye" }, { k: "eds", l: "EDS Management", i: "warn" }, { k: "gistGen", l: "Auto-Gist / Referral", i: "meet" }],
        mom: [{ k: "dashboard", l: "Dashboard", i: "dash" }, { k: "momEdit", l: "Gist & MoM Editor", i: "edit" }, { k: "finalized", l: "Finalized MoMs", i: "lock" }],
    };
    const rc = { admin: "#f4a261", proponent: "#06d6a0", scrutiny: "#ffd166", mom: "#00b4d8" };
    const rl = { admin: "Administrator", proponent: "Proponent / RQP", scrutiny: "Scrutiny Team", mom: "MoM Secretariat" };
    return (
        <div style={{ background: "#0a2463", minHeight: "100vh", width: 238, flexShrink: 0, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
            <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}><img src="/moefcc_logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>
                    <div><div style={{ fontFamily: "Outfit,sans-serif", color: "#fff", fontWeight: 800, fontSize: 16, letterSpacing: "-0.3px" }}>PARI✓ESH</div><div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 500 }}>VERSION 3.0</div></div>
                </div>
            </div>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: rc[user.role] + "30", border: `2px solid ${rc[user.role]}60`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: rc[user.role], fontWeight: 700, fontSize: 13 }}>{user.name.charAt(0)}</span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ color: "#fff", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
                        <div style={{ padding: "1px 7px", borderRadius: 20, background: rc[user.role] + "25", display: "inline-block" }}><span style={{ color: rc[user.role], fontSize: 10, fontWeight: 700 }}>{rl[user.role]}</span></div>
                    </div>
                </div>
            </div>
            <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
                {(nav[user.role] || []).map(item => (
                    <div key={item.k} className={`sidebar-link${active === item.k ? " active" : ""}`} onClick={() => setActive(item.k)}>
                        <Ic n={item.i} s={15} />{item.l}
                    </div>
                ))}
            </nav>
            <div style={{ padding: "10px 8px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="sidebar-link" onClick={logout} style={{ color: "rgba(255,255,255,0.45)" }}><Ic n="out" s={15} />Sign Out</div>
            </div>
        </div>
    );
};

export default Sidebar;
