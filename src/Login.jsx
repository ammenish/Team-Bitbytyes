import { useState } from "react";
import Ic from './Ic.jsx';
import { apiLogin } from './api.js';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState(""); const [pass, setPass] = useState(""); const [err, setErr] = useState(""); const [sel, setSel] = useState(null); const [loading, setLoading] = useState(false);
    const demos = [{ l: "Admin", e: "admin@parivesh.gov.in", p: "Admin@123", c: "#f4a261" }, { l: "Proponent", e: "sharma@infraltd.com", p: "Pass@123", c: "#06d6a0" }, { l: "Scrutiny", e: "scrutiny1@moef.gov.in", p: "Pass@123", c: "#ffd166" }, { l: "MoM Team", e: "mom1@moef.gov.in", p: "Pass@123", c: "#00b4d8" }];

    const go = async () => {
        if (!email || !pass) { setErr("Please enter email and password."); return; }
        setLoading(true); setErr("");
        try {
            const user = await apiLogin(email, pass);
            onLogin(user);
        } catch (e) {
            setErr(e.message || "Invalid credentials. Try a demo role below.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0a2463 0%,#1e56c2 45%,#0077b6 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%,rgba(58,134,255,0.15) 0%,transparent 60%),radial-gradient(circle at 80% 20%,rgba(0,180,216,0.1) 0%,transparent 50%)" }} />
            <div style={{ position: "absolute", top: "8%", right: "6%", width: 280, height: 280, border: "1px solid rgba(255,255,255,0.07)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", bottom: "12%", left: "4%", width: 180, height: 180, border: "1px solid rgba(255,255,255,0.07)", borderRadius: "50%" }} />
            <div className="slide-up" style={{ width: "100%", maxWidth: 460, position: "relative" }}>
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 68, height: 68, borderRadius: 20, background: "transparent", marginBottom: 14 }}>
                        <img src="/moefcc_logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <h1 style={{ fontFamily: "Outfit,sans-serif", color: "#fff", fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px" }}>PARI✓ESH 3.0</h1>
                    <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, marginTop: 5 }}>Environmental Clearance Management Portal</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 }}>
                        <span style={{ height: 1, width: 30, background: "rgba(255,255,255,0.2)" }} />
                        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em" }}>MINISTRY OF ENVIRONMENT, FOREST & CLIMATE CHANGE</span>
                        <span style={{ height: 1, width: 30, background: "rgba(255,255,255,0.2)" }} />
                    </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.97)", borderRadius: 24, padding: 34, boxShadow: "0 30px 80px rgba(0,0,0,0.3)" }}>
                    <h2 style={{ fontFamily: "Outfit,sans-serif", fontSize: 19, fontWeight: 700, color: "#0a2463", marginBottom: 5 }}>Secure Login</h2>
                    <p style={{ color: "#64748b", fontSize: 13, marginBottom: 22 }}>Access your role-based dashboard</p>
                    <div style={{ marginBottom: 14 }}><label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>Email Address</label><input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.gov.in" onKeyDown={e => e.key === "Enter" && go()} /></div>
                    <div style={{ marginBottom: 18 }}><label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>Password</label><input className="input" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && go()} /></div>
                    {err && <div style={{ background: "#fff0f3", border: "1px solid #ffd0da", borderRadius: 8, padding: "9px 13px", color: "#ef476f", fontSize: 13, marginBottom: 14, display: "flex", alignItems: "center", gap: 7 }}><Ic n="warn" s={14} c="#ef476f" />{err}</div>}
                    <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "11px 20px", fontSize: 15 }} onClick={go} disabled={loading}>
                        {loading ? <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} />Signing in...</> : <><Ic n="shield" s={15} />Sign In Securely</>}
                    </button>
                    <div style={{ margin: "22px 0 14px", display: "flex", alignItems: "center", gap: 10 }}><div style={{ flex: 1, height: 1, background: "#dce3ef" }} /><span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>Quick Demo Access</span><div style={{ flex: 1, height: 1, background: "#dce3ef" }} /></div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {demos.map(d => <button key={d.l} onClick={() => { setEmail(d.e); setPass(d.p); setSel(d.l); setErr(""); }} style={{ padding: "8px 12px", borderRadius: 10, border: `1.5px solid ${sel === d.l ? d.c : "#dce3ef"}`, background: sel === d.l ? d.c + "18" : "#f8fafc", cursor: "pointer", fontSize: 12, fontWeight: 600, color: d.c, display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s" }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: d.c }} />{d.l}</button>)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
