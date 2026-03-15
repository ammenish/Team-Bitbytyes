import Ic from './Ic.jsx';

export const statusClass = { "Draft": "#f1f5f9:#64748b", "Submitted": "#eff6ff:#2563eb", "Under Scrutiny": "#fffbeb:#d97706", "EDS Issued": "#fef2f2:#dc2626", "Referred for Meeting": "#f0fdf4:#16a34a", "MoM Generated": "#faf5ff:#7c3aed", "Finalized": "#ecfdf5:#059669" };

export const Badge = ({ t }) => {
    const [bg, cl] = (statusClass[t] || "#f1f5f9:#64748b").split(":");
    return <span className="badge" style={{ background: bg, color: cl }}><span style={{ fontSize: 8 }}>●</span>{t}</span>;
};

export const StatCard = ({ label, val, icon, color, sub }) => (
    <div className="card" style={{ padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: color + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Ic n={icon} s={22} c={color} />
        </div>
        <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "Outfit,sans-serif", lineHeight: 1 }}>{val}</div>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 3 }}>{label}</div>
            {sub && <div style={{ fontSize: 11, color: color, fontWeight: 600, marginTop: 4 }}>{sub}</div>}
        </div>
    </div>
);

export const WorkflowBar = ({ status }) => {
    const steps = ["Draft", "Submitted", "Under Scrutiny", "Referred for Meeting", "MoM Generated", "Finalized"];
    const idx = status === "EDS Issued" ? 2 : steps.indexOf(status);
    return (
        <div style={{ padding: "14px 18px", background: "#f8fafc", borderRadius: 12, border: "1px solid #dce3ef" }}>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Application Workflow</div>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px 0" }}>
                {steps.map((s, i) => (
                    <div key={s} style={{ display: "flex", alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            <div style={{ width: 26, height: 26, borderRadius: "50%", background: i <= idx ? "#1e56c2" : "#dce3ef", color: i <= idx ? "#fff" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, transition: "all 0.3s" }}>
                                {i < idx ? <Ic n="ok" s={12} c="#fff" /> : i + 1}
                            </div>
                            <span style={{ fontSize: 10, color: i <= idx ? "#1e56c2" : "#94a3b8", fontWeight: 600, textAlign: "center", maxWidth: 65, lineHeight: 1.3 }}>{s}</span>
                        </div>
                        {i < steps.length - 1 && <div style={{ width: 38, height: 2, background: i < idx ? "#1e56c2" : "#dce3ef", margin: "0 3px", marginBottom: 16, transition: "all 0.3s" }} />}
                    </div>
                ))}
            </div>
            {status === "EDS Issued" && <div style={{ marginTop: 10, padding: "8px 12px", background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca", fontSize: 12, color: "#dc2626", fontWeight: 500 }}>⚠ Application returned to Proponent – EDS issued pending resolution</div>}
        </div>
    );
};

export const QRCode = () => (
    <svg width="130" height="130" viewBox="0 0 130 130" fill="#0a2463">
        <rect x="5" y="5" width="36" height="36" rx="3" fill="none" stroke="#0a2463" strokeWidth="3" />
        <rect x="13" y="13" width="20" height="20" rx="1" />
        <rect x="89" y="5" width="36" height="36" rx="3" fill="none" stroke="#0a2463" strokeWidth="3" />
        <rect x="97" y="13" width="20" height="20" rx="1" />
        <rect x="5" y="89" width="36" height="36" rx="3" fill="none" stroke="#0a2463" strokeWidth="3" />
        <rect x="13" y="97" width="20" height="20" rx="1" />
        {[[50, 5], [58, 5], [66, 5], [50, 13], [66, 13], [58, 21], [50, 29], [58, 29], [66, 29], [74, 5], [82, 5], [74, 21], [82, 29], [5, 50], [5, 58], [13, 50], [21, 58], [29, 50], [29, 66], [5, 74], [21, 74], [5, 82], [13, 82], [29, 82], [50, 50], [66, 50], [74, 50], [82, 58], [66, 66], [50, 74], [58, 74], [74, 74], [82, 74], [50, 82], [66, 82], [74, 82], [58, 58], [90, 90], [98, 90], [106, 90], [114, 90], [90, 98], [114, 98], [90, 106], [98, 106], [106, 106], [114, 106], [90, 114], [98, 114], [106, 114], [114, 114]].map(([x, y], i) => <rect key={i} x={x} y={y} width="6" height="6" rx="1" />)}
    </svg>
);
