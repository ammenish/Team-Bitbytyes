import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// SHARED CHART COMPONENTS (Pure CSS/SVG — No Libraries Needed)
// ═══════════════════════════════════════════════════════════════════════════

const AnimatedNumber = ({ val, dur = 1500 }) => {
    const [n, setN] = useState(0);
    useEffect(() => {
        let start = 0; const inc = val / (dur / 16);
        const t = setInterval(() => { start += inc; if (start >= val) { setN(val); clearInterval(t); } else setN(Math.floor(start)); }, 16);
        return () => clearInterval(t);
    }, [val, dur]);
    return <>{n.toLocaleString("en-IN")}</>;
};

// Horizontal Bar Chart
const BarChart = ({ data, maxVal, color = "#2563eb", height = 28 }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 140, fontSize: 12, fontWeight: 500, color: "#334155", textAlign: "right", flexShrink: 0 }}>{d.label}</div>
                <div style={{ flex: 1, height, background: "#f1f5f9", borderRadius: 6, overflow: "hidden", position: "relative" }}>
                    <div className="bar-fill" style={{ width: `${(d.value / maxVal) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${color}, ${color}cc)`, borderRadius: 6, transition: "width 1.2s cubic-bezier(0.22,1,0.36,1)", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{d.value.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

// Donut Chart (Pure SVG)
const DonutChart = ({ data, size = 200 }) => {
    const cx = size / 2, cy = size / 2, r = size * 0.35, sw = size * 0.14;
    let cumAngle = -90;
    const total = data.reduce((s, d) => s + d.value, 0);
    const arcs = data.map(d => {
        const angle = (d.value / total) * 360;
        const start = cumAngle;
        cumAngle += angle;
        return { ...d, start, angle, pct: ((d.value / total) * 100).toFixed(1) };
    });

    const arcPath = (sa, ea) => {
        const s = (sa * Math.PI) / 180, e = ((sa + ea) * Math.PI) / 180;
        const lf = ea > 180 ? 1 : 0;
        return `M ${cx + r * Math.cos(s)} ${cy + r * Math.sin(s)} A ${r} ${r} 0 ${lf} 1 ${cx + r * Math.cos(e)} ${cy + r * Math.sin(e)}`;
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <svg width={size} height={size} style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))" }}>
                {arcs.map((a, i) => (
                    <path key={i} d={arcPath(a.start, Math.max(a.angle - 1, 0.5))} fill="none" stroke={a.color} strokeWidth={sw} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
                ))}
                <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="800" fill="#0f172a">{total.toLocaleString()}</text>
                <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#64748b">Total</text>
            </svg>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {arcs.map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#475569" }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: a.color }} />
                        {a.label} ({a.pct}%)
                    </div>
                ))}
            </div>
        </div>
    );
};

// Stacked Bar Chart
const StackedBar = ({ data, categories, colors }) => {
    const maxVal = Math.max(...data.map(d => categories.reduce((s, c) => s + (d[c] || 0), 0)));
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.map((d, i) => {
                const total = categories.reduce((s, c) => s + (d[c] || 0), 0);
                return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 130, fontSize: 12, fontWeight: 500, color: "#334155", textAlign: "right", flexShrink: 0 }}>{d.label}</div>
                        <div style={{ flex: 1, height: 26, background: "#f1f5f9", borderRadius: 6, overflow: "hidden", display: "flex" }}>
                            {categories.map((c, j) => d[c] > 0 && (
                                <div key={j} style={{ width: `${(d[c] / maxVal) * 100}%`, height: "100%", background: colors[j], transition: "width 1s ease", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {d[c] > maxVal * 0.05 && <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{d[c]}</span>}
                                </div>
                            ))}
                        </div>
                        <div style={{ width: 40, fontSize: 11, fontWeight: 600, color: "#64748b" }}>{total}</div>
                    </div>
                );
            })}
        </div>
    );
};

// Progress Gauge
const Gauge = ({ value, max, label, color = "#059669" }) => {
    const pct = Math.min((value / max) * 100, 100);
    return (
        <div style={{ textAlign: "center" }}>
            <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto" }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="8" strokeDasharray={`${pct * 2.136} 213.6`} strokeLinecap="round" transform="rotate(-90 40 40)" style={{ transition: "stroke-dasharray 1.5s ease" }} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color }}>{Math.round(pct)}%</div>
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 6, fontWeight: 600 }}>{label}</div>
        </div>
    );
};

// Filter Dropdown
const Filter = ({ label, options, value, onChange }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>
        <select value={value} onChange={e => onChange(e.target.value)} style={{ padding: "8px 32px 8px 12px", borderRadius: 8, border: "1.5px solid #dce3ef", fontSize: 13, fontWeight: 500, color: "#0f172a", background: "#fff", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", cursor: "pointer", minWidth: 140 }}>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// 1. MAIN DASHBOARD HUB (parivesh.nic.in/#/dashboard)
// ═══════════════════════════════════════════════════════════════════════════
export const DashboardHub = ({ onNavigate }) => (
    <div style={{ minHeight: "70vh", padding: "80px 24px 40px", background: "linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 30%, #f8fafc 100%)" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0c3320", marginBottom: 10, fontFamily: "Outfit, sans-serif" }}>Public MIS Dashboards</h1>
            <p style={{ color: "#2d5a3f", fontSize: 15, maxWidth: 600, margin: "0 auto" }}>Track real-time environmental clearance statistics across different domains</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, maxWidth: 1200, margin: "0 auto" }}>
            {[
                { title: "Environmental Clearance", sub: "EC / CRZ MIS Dashboard", icon: "🌍", color: "#2563eb", bg: "linear-gradient(135deg, #2563eb, #1d4ed8)", desc: "Sector-wise clearances, ToR, amendments & compliance", tab: "ECCRZ" },
                { title: "Forest Clearance", sub: "FC Public Dashboard", icon: "🌲", color: "#16a34a", bg: "linear-gradient(135deg, #16a34a, #15803d)", desc: "Stage-I & II approvals, state-wise distribution", tab: "FC" },
                { title: "Wildlife Clearance", sub: "WLC Public Dashboard", icon: "🐾", color: "#ea580c", bg: "linear-gradient(135deg, #ea580c, #c2410c)", desc: "Permit status, NBWL recommendations & species data", tab: "WLC" },
                { title: "National CAMPA", sub: "CAMPA State Dashboard", icon: "₹", color: "#047857", bg: "linear-gradient(135deg, #047857, #065f46)", desc: "Fund utilization, afforestation progress & activities", tab: "CAMPA" },
            ].map((d, i) => (
                <div key={i} onClick={() => onNavigate(d.tab)} style={{ background: "#fff", borderRadius: 20, overflow: "hidden", cursor: "pointer", transition: "all 0.25s ease", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.12)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)"; }}>
                    <div style={{ background: d.bg, padding: "30px 24px", display: "flex", alignItems: "center", gap: 16, color: "#fff" }}>
                        <div style={{ width: 60, height: 60, background: "rgba(255,255,255,0.2)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, backdropFilter: "blur(4px)" }}>{d.icon}</div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 800 }}>{d.title}</div>
                            <div style={{ fontSize: 12, opacity: 0.85 }}>{d.sub}</div>
                        </div>
                    </div>
                    <div style={{ padding: "18px 24px" }}>
                        <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, marginBottom: 14 }}>{d.desc}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: d.color, fontSize: 13, fontWeight: 700 }}>
                            View Dashboard <span style={{ fontSize: 18, transition: "transform 0.2s" }}>→</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// 2. EC/CRZ MIS DASHBOARD (parivesh.nic.in/admin/#/public/ec-crz-mis)
// ═══════════════════════════════════════════════════════════════════════════
export const ECCRZDashboard = ({ onBack }) => {
    const [sector, setSector] = useState("All Sectors");
    const [year, setYear] = useState("2025");

    const statCards = [
        { label: "EC Granted", val: 8426, color: "#2563eb", icon: "🏭" },
        { label: "ToR Granted", val: 5218, color: "#7c3aed", icon: "📋" },
        { label: "EC Amendment", val: 1847, color: "#0891b2", icon: "📝" },
        { label: "EC Transfer", val: 423, color: "#059669", icon: "🔄" },
        { label: "CRZ Clearance", val: 1265, color: "#d97706", icon: "🌊" },
        { label: "Validity Extension", val: 892, color: "#dc2626", icon: "⏳" },
    ];

    const sectorData = [
        { label: "Mining", value: 2847 },
        { label: "Thermal Power", value: 1956 },
        { label: "Infrastructure", value: 1634 },
        { label: "Industry", value: 1245 },
        { label: "River Valley", value: 892 },
        { label: "Nuclear", value: 145 },
        { label: "Defence", value: 89 },
        { label: "CRZ", value: 1265 },
    ];

    const donutData = [
        { label: "EC", value: 8426, color: "#2563eb" },
        { label: "ToR", value: 5218, color: "#7c3aed" },
        { label: "Amendment", value: 1847, color: "#0891b2" },
        { label: "CRZ", value: 1265, color: "#d97706" },
        { label: "Transfer", value: 423, color: "#059669" },
        { label: "Extension", value: 892, color: "#dc2626" },
    ];

    const stateData = [
        { label: "Maharashtra", value: 1842 }, { label: "Tamil Nadu", value: 1456 },
        { label: "Karnataka", value: 1234 }, { label: "Gujarat", value: 1187 },
        { label: "Rajasthan", value: 1056 }, { label: "Andhra Pradesh", value: 945 },
        { label: "Madhya Pradesh", value: 834 }, { label: "Chhattisgarh", value: 723 },
        { label: "Odisha", value: 678 }, { label: "Telangana", value: 612 },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#f0f4f8", padding: "80px 24px 40px" }}>
            {/* Header */}
            <div style={{ maxWidth: 1200, margin: "0 auto 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <button onClick={onBack} style={{ background: "#e2e8f0", border: "none", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569", display: "flex", alignItems: "center", gap: 6 }}>← Back</button>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0a2463", fontFamily: "Outfit, sans-serif" }}>EC / CRZ MIS Dashboard</h1>
                        <p style={{ fontSize: 13, color: "#64748b" }}>Environmental Clearance & Coastal Regulation Zone — Management Information System</p>
                    </div>
                </div>
                {/* Filters */}
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", padding: "16px 20px", background: "#fff", borderRadius: 14, border: "1px solid #dce3ef", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <Filter label="Sector" options={["All Sectors", "Mining", "Thermal Power", "Infrastructure", "Industry", "River Valley", "CRZ"]} value={sector} onChange={setSector} />
                    <Filter label="Year" options={["2025", "2024", "2023", "2022", "2021"]} value={year} onChange={setYear} />
                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                        <button style={{ padding: "8px 20px", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Apply Filters</button>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14, maxWidth: 1200, margin: "0 auto 24px" }}>
                {statCards.map((s, i) => (
                    <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "18px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0", transition: "transform 0.2s", cursor: "default" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                            <span style={{ fontSize: 24 }}>{s.icon}</span>
                            <div style={{ background: `${s.color}15`, color: s.color, padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700 }}>+12%</div>
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: s.color, marginBottom: 4 }}><AnimatedNumber val={s.val} /></div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 1200, margin: "0 auto 24px" }}>
                <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a2463", marginBottom: 20 }}>EC Granted — Sector-wise Count</h3>
                    <BarChart data={sectorData} maxVal={3000} color="#2563eb" />
                </div>
                <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a2463", marginBottom: 20 }}>Clearance Type Distribution</h3>
                    <DonutChart data={donutData} size={220} />
                </div>
            </div>

            {/* State-wise chart */}
            <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0", maxWidth: 1200, margin: "0 auto" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a2463", marginBottom: 20 }}>Top 10 States — EC Granted ({year})</h3>
                <BarChart data={stateData} maxVal={2000} color="#059669" height={24} />
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 3. FOREST CLEARANCE DASHBOARD (ifs.nic.in/FC2Dashboard)
// ═══════════════════════════════════════════════════════════════════════════
export const FCDashboard = ({ onBack }) => {
    const [fcYear, setFCYear] = useState("2025");

    const stageData = [
        { label: "Stage-I Approvals", val: 24567, color: "#16a34a", icon: "✅", sub: "Total area: 1,23,456 Ha" },
        { label: "Stage-II Approvals", val: 18934, color: "#0891b2", icon: "🏁", sub: "Total area: 98,234 Ha" },
        { label: "Pending Proposals", val: 3421, color: "#d97706", icon: "⏳", sub: "Under consideration" },
        { label: "Rejected", val: 1289, color: "#dc2626", icon: "❌", sub: "Not recommended" },
    ];

    const authorityData = [
        { label: "MoEFCC", value: 8945, color: "#2563eb" },
        { label: "REC/IRO", value: 6723, color: "#16a34a" },
        { label: "State Govt", value: 4567, color: "#d97706" },
        { label: "District", value: 2345, color: "#7c3aed" },
    ];

    const stateFC = [
        { label: "Madhya Pradesh", value: 3245 }, { label: "Chhattisgarh", value: 2867 },
        { label: "Odisha", value: 2456 }, { label: "Jharkhand", value: 2134 },
        { label: "Maharashtra", value: 1987 }, { label: "Rajasthan", value: 1745 },
        { label: "Andhra Pradesh", value: 1523 }, { label: "Karnataka", value: 1234 },
        { label: "Telangana", value: 1089 }, { label: "Tamil Nadu", value: 967 },
    ];

    const categoryData = [
        { label: "Mining", submitted: 4567, approved: 3245, pending: 1322 },
        { label: "Road/Rail", submitted: 3456, approved: 2890, pending: 566 },
        { label: "Irrigation", submitted: 2345, approved: 1987, pending: 358 },
        { label: "Transmission", submitted: 1890, approved: 1567, pending: 323 },
        { label: "Defence", submitted: 567, approved: 489, pending: 78 },
        { label: "Hydro Power", submitted: 890, approved: 612, pending: 278 },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#f0f4f8", padding: "80px 24px 40px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <button onClick={onBack} style={{ background: "#e2e8f0", border: "none", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569" }}>← Back</button>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0a2463", fontFamily: "Outfit, sans-serif" }}>Forest Clearance Public Dashboard</h1>
                        <p style={{ fontSize: 13, color: "#64748b" }}>Stage-I & Stage-II FC Approvals — Nationwide Summary</p>
                    </div>
                </div>

                {/* Big Stat Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                    {stageData.map((s, i) => (
                        <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "24px 20px", border: `2px solid ${s.color}22`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", textAlign: "center" }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
                            <div style={{ fontSize: 32, fontWeight: 800, color: s.color, marginBottom: 4 }}><AnimatedNumber val={s.val} /></div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{s.label}</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>{s.sub}</div>
                        </div>
                    ))}
                </div>

                {/* Charts Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                    <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0" }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a2463", marginBottom: 20 }}>Authority-wise Distribution</h3>
                        <DonutChart data={authorityData} size={200} />
                    </div>
                    <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0" }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a2463", marginBottom: 20 }}>State-wise FC Approvals (Top 10)</h3>
                        <BarChart data={stateFC} maxVal={3500} color="#16a34a" height={22} />
                    </div>
                </div>

                {/* Category-wise Table */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a2463", marginBottom: 20 }}>Category-wise FC Proposals</h3>
                    <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                        {[{ c: "#2563eb", l: "Submitted" }, { c: "#16a34a", l: "Approved" }, { c: "#d97706", l: "Pending" }].map((lg, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#475569" }}>
                                <div style={{ width: 12, height: 12, borderRadius: 3, background: lg.c }} /> {lg.l}
                            </div>
                        ))}
                    </div>
                    <StackedBar data={categoryData.map(d => ({ label: d.label, Submitted: d.submitted, Approved: d.approved, Pending: d.pending }))} categories={["Submitted", "Approved", "Pending"]} colors={["#2563eb", "#16a34a", "#d97706"]} />
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 4. WILDLIFE CLEARANCE DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
export const WLCDashboard = ({ onBack }) => {
    const statCards = [
        { label: "Total Submitted", val: 4567, color: "#2563eb", icon: "📋" },
        { label: "Permits Granted", val: 2890, color: "#16a34a", icon: "✅" },
        { label: "Under Consideration", val: 1234, color: "#d97706", icon: "⏳" },
        { label: "Rejected", val: 443, color: "#dc2626", icon: "❌" },
    ];

    const proposalTypes = [
        { label: "Mining in WL Area", value: 1234, color: "#2563eb" },
        { label: "Linear Projects", value: 987, color: "#16a34a" },
        { label: "Hydro Power", value: 567, color: "#0891b2" },
        { label: "Irrigation", value: 456, color: "#7c3aed" },
        { label: "Transmission Lines", value: 345, color: "#d97706" },
        { label: "Defence", value: 234, color: "#dc2626" },
        { label: "Others", value: 744, color: "#64748b" },
    ];

    const nbwlData = [
        { label: "NBWL Meeting 67", submitted: 45, approved: 38, rejected: 7 },
        { label: "NBWL Meeting 66", submitted: 52, approved: 41, rejected: 11 },
        { label: "NBWL Meeting 65", submitted: 38, approved: 32, rejected: 6 },
        { label: "NBWL Meeting 64", submitted: 61, approved: 48, rejected: 13 },
        { label: "NBWL Meeting 63", submitted: 43, approved: 36, rejected: 7 },
    ];

    const speciesData = [
        { name: "Tiger", count: 3167, icon: "🐅", trend: "+4.6%" },
        { name: "Asian Elephant", count: 29964, icon: "🐘", trend: "+2.1%" },
        { name: "One-horned Rhino", count: 2613, icon: "🦏", trend: "+7.8%" },
        { name: "Snow Leopard", count: 718, icon: "🐆", trend: "+3.2%" },
        { name: "Gangetic Dolphin", count: 4014, icon: "🐬", trend: "-1.4%" },
        { name: "Red Panda", count: 5078, icon: "🦊", trend: "+5.3%" },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#f0f4f8", padding: "80px 24px 40px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <button onClick={onBack} style={{ background: "#e2e8f0", border: "none", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569" }}>← Back</button>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0a2463", fontFamily: "Outfit, sans-serif" }}>Wildlife Clearance Public Dashboard</h1>
                        <p style={{ fontSize: 13, color: "#64748b" }}>WLC Proposals, NBWL Recommendations & Species Conservation Status</p>
                    </div>
                </div>

                {/* Stat Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                    {statCards.map((s, i) => (
                        <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "22px 18px", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: 28 }}>{s.icon}</span>
                                <span style={{ fontSize: 28, fontWeight: 800, color: s.color }}><AnimatedNumber val={s.val} /></span>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginTop: 8 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                    {/* Proposal Distribution */}
                    <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0" }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a2463", marginBottom: 20 }}>Proposal Type Distribution</h3>
                        <DonutChart data={proposalTypes} size={210} />
                    </div>
                    {/* NBWL Meetings */}
                    <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0" }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a2463", marginBottom: 20 }}>NBWL Meeting-wise Decisions</h3>
                        <StackedBar data={nbwlData.map(d => ({ label: d.label, Approved: d.approved, Rejected: d.rejected }))} categories={["Approved", "Rejected"]} colors={["#16a34a", "#dc2626"]} />
                        <div style={{ display: "flex", gap: 14, marginTop: 12, justifyContent: "center" }}>
                            {[{ c: "#16a34a", l: "Approved" }, { c: "#dc2626", l: "Rejected" }].map((lg, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: 3, background: lg.c }} /> {lg.l}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Species Cards */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a2463", marginBottom: 20 }}>🐾 Key Species — Conservation Census Data</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14 }}>
                        {speciesData.map((sp, i) => (
                            <div key={i} style={{ background: "#f8fafc", borderRadius: 14, padding: "18px 14px", textAlign: "center", border: "1px solid #e2e8f0", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                                <div style={{ fontSize: 36, marginBottom: 8 }}>{sp.icon}</div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{sp.count.toLocaleString()}</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4 }}>{sp.name}</div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: sp.trend.startsWith("+") ? "#16a34a" : "#dc2626" }}>{sp.trend}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 5. CAMPA DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
export const CAMPADashboard = ({ onBack }) => {
    const [fy, setFY] = useState("2024-25");
    const [selState, setSelState] = useState("All India");

    const financialCards = [
        { label: "Fund Received (₹ Cr)", val: 54867, color: "#2563eb", icon: "💰" },
        { label: "Fund Released (₹ Cr)", val: 42345, color: "#16a34a", icon: "📤" },
        { label: "Fund Utilized (₹ Cr)", val: 38912, color: "#7c3aed", icon: "📊" },
        { label: "Forest Area Diverted (Ha)", val: 123456, color: "#0891b2", icon: "🌲" },
    ];

    const activities = [
        { name: "Compensatory Afforestation", icon: "🌱", count: 45678, unit: "Ha", color: "#16a34a" },
        { name: "Catchment Area Treatment", icon: "💧", count: 12345, unit: "Ha", color: "#0891b2" },
        { name: "Wildlife Management", icon: "🐯", count: 2345, unit: "Projects", color: "#ea580c" },
        { name: "Assisted Natural Regeneration", icon: "🌿", count: 8967, unit: "Ha", color: "#059669" },
        { name: "Forest Fire Prevention", icon: "🔥", count: 1567, unit: "Units", color: "#dc2626" },
        { name: "Soil & Moisture Conservation", icon: "🏔️", count: 6789, unit: "Ha", color: "#7c3aed" },
        { name: "Nursery Development", icon: "🌸", count: 456, unit: "Nurseries", color: "#db2777" },
        { name: "Infrastructure Development", icon: "🏗️", count: 234, unit: "Projects", color: "#475569" },
        { name: "Biodiversity Conservation", icon: "🦋", count: 890, unit: "Projects", color: "#0d9488" },
        { name: "Livelihood Support", icon: "👥", count: 3456, unit: "Families", color: "#b45309" },
        { name: "Research & Monitoring", icon: "🔬", count: 178, unit: "Studies", color: "#6366f1" },
        { name: "Capacity Building", icon: "📚", count: 567, unit: "Programs", color: "#84cc16" },
    ];

    const stateWise = [
        { label: "Madhya Pradesh", value: 8945 }, { label: "Chhattisgarh", value: 6723 },
        { label: "Odisha", value: 5678 }, { label: "Jharkhand", value: 4567 },
        { label: "Maharashtra", value: 4234 }, { label: "Telangana", value: 3456 },
        { label: "Karnataka", value: 3123 }, { label: "Rajasthan", value: 2890 },
    ];

    const apoProgress = [
        { label: "Afforestation", value: 78, max: 100, color: "#16a34a" },
        { label: "Wildlife", value: 62, max: 100, color: "#ea580c" },
        { label: "Infrastructure", value: 45, max: 100, color: "#2563eb" },
        { label: "Utilization", value: 89, max: 100, color: "#7c3aed" },
    ];

    const states = ["All India", "Chhattisgarh", "Madhya Pradesh", "Maharashtra", "Odisha", "Jharkhand", "Rajasthan", "Karnataka", "Tamil Nadu", "Andhra Pradesh", "Gujarat", "Telangana"];

    return (
        <div style={{ minHeight: "100vh", background: "#f0f4f8", padding: "80px 24px 40px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <button onClick={onBack} style={{ background: "#e2e8f0", border: "none", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569" }}>← Back</button>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0a2463", fontFamily: "Outfit, sans-serif" }}>National CAMPA Dashboard</h1>
                        <p style={{ fontSize: 13, color: "#64748b" }}>Compensatory Afforestation Fund Management & Planning Authority</p>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 }}>
                    {/* Sidebar Filters */}
                    <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #e2e8f0", height: "fit-content", position: "sticky", top: 90 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0a2463", marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.5 }}>Filters</h4>
                        <Filter label="Financial Year" options={["2024-25", "2023-24", "2022-23", "2021-22"]} value={fy} onChange={setFY} />
                        <div style={{ marginTop: 14 }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, display: "block" }}>State / UT</label>
                            <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                                {states.map(s => (
                                    <div key={s} onClick={() => setSelState(s)} style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: selState === s ? 700 : 500, color: selState === s ? "#fff" : "#475569", background: selState === s ? "linear-gradient(135deg, #047857, #065f46)" : "transparent", transition: "all 0.15s" }}>
                                        {s}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div>
                        {/* Financial Summary */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
                            {financialCards.map((f, i) => (
                                <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "20px 16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                                    <span style={{ fontSize: 28 }}>{f.icon}</span>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: f.color, margin: "8px 0 4px" }}><AnimatedNumber val={f.val} /></div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>{f.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* APO Progress Gauges */}
                        <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0", marginBottom: 24 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a2463", marginBottom: 20 }}>APO Progress — FY {fy}</h3>
                            <div style={{ display: "flex", justifyContent: "space-around" }}>
                                {apoProgress.map((p, i) => <Gauge key={i} value={p.value} max={p.max} label={p.label} color={p.color} />)}
                            </div>
                        </div>

                        {/* Activity Grid */}
                        <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0", marginBottom: 24 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a2463", marginBottom: 20 }}>CAMPA Activities — {selState}</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                                {activities.map((a, i) => (
                                    <div key={i} style={{ background: "#f8fafc", borderRadius: 12, padding: "16px 14px", border: "1px solid #e2e8f0", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = `${a.color}10`; e.currentTarget.style.borderColor = a.color; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.transform = "translateY(0)"; }}>
                                        <div style={{ fontSize: 28, marginBottom: 6 }}>{a.icon}</div>
                                        <div style={{ fontSize: 16, fontWeight: 800, color: a.color }}>{a.count.toLocaleString()}</div>
                                        <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>{a.unit}</div>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: "#334155", marginTop: 4 }}>{a.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* State-wise bar chart */}
                        <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0" }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a2463", marginBottom: 20 }}>State-wise CAMPA Fund Utilization (₹ Crore)</h3>
                            <BarChart data={stateWise} maxVal={10000} color="#047857" height={24} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
