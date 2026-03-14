import { useState, useEffect } from "react";
import Ic from './Ic.jsx';
import { Badge, StatCard, WorkflowBar } from './helpers.jsx';
import { apiAiScrutiny, apiGetEdsPoints, apiAiGenerateGist } from './api.js';

export const ScrutinyHome = ({ apps }) => (
    <div className="fade-in">
        <div style={{ marginBottom: 22 }}><h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 24, fontWeight: 800, color: "#0a2463" }}>Scrutiny Dashboard</h1><p style={{ color: "#64748b", fontSize: 13 }}>Environmental Document Review & Verification Unit</p></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 22 }}>
            <StatCard label="Submitted" val={apps.filter(a => a.status === "Submitted").length} icon="file" color="#2563eb" />
            <StatCard label="Under Scrutiny" val={apps.filter(a => a.status === "Under Scrutiny").length} icon="eye" color="#d97706" />
            <StatCard label="EDS Issued" val={apps.filter(a => a.status === "EDS Issued").length} icon="warn" color="#dc2626" />
            <StatCard label="Referred" val={apps.filter(a => a.status === "Referred for Meeting").length} icon="meet" color="#059669" />
        </div>
        <div className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, color: "#0a2463", marginBottom: 14 }}>All Submitted Applications</div>
            <table className="table"><thead><tr><th>App ID</th><th>Proponent</th><th>Category</th><th>Fee Status</th><th>Status</th></tr></thead>
                <tbody>{apps.filter(a => ["Submitted", "Under Scrutiny", "EDS Issued", "Referred for Meeting"].includes(a.status)).map(a => <tr key={a.id}>
                    <td><span style={{ fontWeight: 700, color: "#1e56c2", fontFamily: "monospace", fontSize: 12 }}>{a.id}</span></td>
                    <td style={{ fontWeight: 500 }}>{a.proponent}</td>
                    <td style={{ fontSize: 12 }}>{a.category}</td>
                    <td><span style={{ color: a.feesPaid ? "#059669" : "#dc2626", fontWeight: 600, fontSize: 12 }}>₹{a.fees.toLocaleString()} {a.feesPaid ? "✓" : "⚠"}</span></td>
                    <td><Badge t={a.status} /></td>
                </tr>)}</tbody></table>
        </div>
    </div>
);

export const ReviewQ = ({ apps, upd, notify }) => {
    const [sel, setSel] = useState(null);
    const [eds, setEds] = useState(""); const [showEds, setShowEds] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [edsPoints, setEdsPoints] = useState([]);
    const [selectedEds, setSelectedEds] = useState([]);

    const queue = apps.filter(a => ["Submitted", "Under Scrutiny"].includes(a.status));
    const app = sel ? apps.find(a => a.id === sel) : null;

    // Load EDS points on mount
    useEffect(() => {
        apiGetEdsPoints().then(setEdsPoints).catch(() => {});
    }, []);

    // Run AI scrutiny when an app is selected
    const runAiScrutiny = async (appItem) => {
        if (!appItem || !appItem.dbId) return;
        setAiLoading(true);
        setAiResult(null);
        try {
            const result = await apiAiScrutiny(appItem.dbId, appItem.docs || []);
            setAiResult(result);
        } catch (e) {
            console.error("AI scrutiny error:", e);
        }
        setAiLoading(false);
    };

    const toggleEdsPoint = (point) => {
        setSelectedEds(prev => prev.includes(point) ? prev.filter(p => p !== point) : [...prev, point]);
    };

    const issueEds = () => {
        const remarks = selectedEds.length > 0 ? selectedEds.join("\n") : eds;
        upd(sel, { status: "EDS Issued", edsRemarks: remarks });
        notify("EDS issued for " + sel);
        setShowEds(false); setEds(""); setSelectedEds([]); setSel(null); setAiResult(null);
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 22 }}><h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 24, fontWeight: 800, color: "#0a2463" }}>Document Review Queue</h1><p style={{ color: "#64748b", fontSize: 13 }}>{queue.length} applications awaiting review</p></div>
            <div style={{ display: "grid", gridTemplateColumns: "310px 1fr", gap: 18 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {queue.map(a => <div key={a.id} onClick={() => { setSel(a.id); setAiResult(null); }} className="card" style={{ padding: 14, cursor: "pointer", border: `2px solid ${sel === a.id ? "#1e56c2" : "#dce3ef"}`, transition: "all 0.15s" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}><span style={{ fontFamily: "monospace", fontWeight: 700, color: "#1e56c2", fontSize: 11 }}>{a.id}</span><Badge t={a.status} /></div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#0a2463", marginBottom: 2 }}>{a.project.slice(0, 42)}…</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>{a.proponent}</div>
                    </div>)}
                    {!queue.length && <div className="card" style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Queue is empty</div>}
                </div>
                {app ? <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div className="card" style={{ padding: 22 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
                            <div><span style={{ fontFamily: "monospace", fontWeight: 700, color: "#1e56c2", fontSize: 12 }}>{app.id}</span><h2 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: 17, color: "#0a2463", marginTop: 3 }}>{app.project}</h2><div style={{ color: "#64748b", fontSize: 12 }}>{app.sector} · {app.category} · {app.proponent}</div></div>
                            <Badge t={app.status} />
                        </div>
                        <WorkflowBar status={app.status} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "14px 0" }}>
                            {[["Filed", app.date], ["Fee", "₹" + app.fees.toLocaleString()], ["Paid", app.feesPaid ? "✓ Yes" : "⚠ No"], ["Docs", app.docs.length + " files"]].map(([k, v]) => <div key={k} style={{ padding: "9px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #dce3ef" }}><div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{k}</div><div style={{ fontSize: 13, fontWeight: 600, marginTop: 1 }}>{v}</div></div>)}
                        </div>
                        <div style={{ marginBottom: 14 }}><div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: 7 }}>Documents</div><div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{app.docs.map(d => <span key={d} className="badge" style={{ background: "#eff6ff", color: "#2563eb" }}><Ic n="doc" s={10} /> {d}</span>)}</div></div>
                        
                        {/* AI Scrutiny Button */}
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                            <button className="btn" style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", border: "none" }} onClick={() => runAiScrutiny(app)} disabled={aiLoading}>
                                {aiLoading ? <><span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />AI Analyzing…</> : <>🤖 AI Auto-Scrutiny</>}
                            </button>
                            {app.status === "Submitted" && <button className="btn btn-primary" onClick={() => { upd(app.id, { status: "Under Scrutiny" }); notify("Review started for " + app.id); }}><Ic n="eye" s={14} />Start Review</button>}
                            {app.status === "Under Scrutiny" && <>
                                <button className="btn btn-success" onClick={() => { upd(app.id, { status: "Referred for Meeting", reviewer: "Dr. Priya Mehta" }); notify(app.id + " referred for meeting"); setSel(null); setAiResult(null); }}><Ic n="send" s={14} />Refer for Meeting</button>
                                <button className="btn btn-danger" onClick={() => setShowEds(true)}><Ic n="warn" s={14} />Issue EDS</button>
                            </>}
                        </div>
                    </div>

                    {/* AI Scrutiny Results Panel */}
                    {aiResult && <div className="card" style={{ padding: 22, border: "2px solid #a855f7" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #7c3aed, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18 }}>🤖</div>
                            <div>
                                <h3 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: 16, color: "#0a2463" }}>AI Scrutiny Report</h3>
                                <div style={{ fontSize: 11, color: "#64748b" }}>{aiResult.ai_powered ? "✨ Powered by Gemini AI" : "📋 Rule-based analysis"}</div>
                            </div>
                            <div style={{ marginLeft: "auto" }}>
                                <span style={{ 
                                    padding: "6px 14px", borderRadius: 20, fontWeight: 700, fontSize: 12,
                                    background: aiResult.risk_level === "LOW" ? "#dcfce7" : aiResult.risk_level === "MEDIUM" ? "#fef3c7" : "#fef2f2",
                                    color: aiResult.risk_level === "LOW" ? "#166534" : aiResult.risk_level === "MEDIUM" ? "#92400e" : "#991b1b"
                                }}>{aiResult.risk_level === "LOW" ? "✅" : aiResult.risk_level === "MEDIUM" ? "⚠️" : "🔴"} {aiResult.risk_level} RISK</span>
                            </div>
                        </div>

                        {/* Completeness Bar */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                                <span>Document Completeness</span>
                                <span style={{ color: aiResult.completeness_score >= 80 ? "#059669" : aiResult.completeness_score >= 50 ? "#d97706" : "#dc2626" }}>{aiResult.completeness_score}%</span>
                            </div>
                            <div style={{ height: 10, background: "#f1f5f9", borderRadius: 10, overflow: "hidden" }}>
                                <div style={{ 
                                    height: "100%", borderRadius: 10, transition: "width 1s ease",
                                    width: `${aiResult.completeness_score}%`,
                                    background: aiResult.completeness_score >= 80 ? "linear-gradient(90deg, #10b981, #059669)" : aiResult.completeness_score >= 50 ? "linear-gradient(90deg, #f59e0b, #d97706)" : "linear-gradient(90deg, #ef4444, #dc2626)"
                                }} />
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                                <span>{aiResult.total_submitted} / {aiResult.total_required} documents found</span>
                                <span>{aiResult.total_missing} missing</span>
                            </div>
                        </div>

                        {/* Present Documents */}
                        {aiResult.present_documents?.length > 0 && <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#059669", marginBottom: 6 }}>✅ Documents Found ({aiResult.present_documents.length})</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                {aiResult.present_documents.map((d, i) => <span key={i} style={{ padding: "3px 10px", background: "#dcfce7", color: "#166534", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{d}</span>)}
                            </div>
                        </div>}

                        {/* Missing Documents */}
                        {aiResult.missing_documents?.length > 0 && <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", marginBottom: 6 }}>❌ Missing Documents ({aiResult.missing_documents.length})</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                {aiResult.missing_documents.map((d, i) => <span key={i} style={{ padding: "3px 10px", background: "#fef2f2", color: "#991b1b", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{d}</span>)}
                            </div>
                        </div>}

                        {/* AI Recommendation */}
                        <div style={{ padding: 14, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#0a2463", marginBottom: 4 }}>📊 Recommendation</div>
                            <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.6 }}>{aiResult.recommendation}</p>
                        </div>

                        {/* AI Insights (Gemini) */}
                        {aiResult.ai_insights && <div style={{ padding: 14, background: "linear-gradient(135deg, #faf5ff, #f3e8ff)", borderRadius: 10, border: "1px solid #d8b4fe", marginBottom: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", marginBottom: 4 }}>✨ Gemini AI Insights</div>
                            <p style={{ fontSize: 13, color: "#581c87", margin: 0, lineHeight: 1.6 }}>{aiResult.ai_insights}</p>
                        </div>}

                        {/* Suggested EDS Points */}
                        {aiResult.suggested_eds_points?.length > 0 && <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#d97706", marginBottom: 6 }}>📝 Suggested EDS Points</div>
                            {aiResult.suggested_eds_points.slice(0, 8).map((e, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", borderBottom: "1px solid #f1f5f9", fontSize: 12, color: "#475569" }}>
                                    <span style={{ color: "#d97706", fontWeight: 800, minWidth: 18 }}>{i + 1}.</span>
                                    <span>{e}</span>
                                </div>
                            ))}
                        </div>}

                        {/* Quick Actions from AI */}
                        {app.status === "Under Scrutiny" && <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                            {aiResult.completeness_score >= 80 && <button className="btn btn-success" onClick={() => { upd(app.id, { status: "Referred for Meeting", reviewer: "AI-Verified" }); notify(app.id + " auto-referred (AI: " + aiResult.completeness_score + "% complete)"); setSel(null); setAiResult(null); }}>✅ AI Recommends: Refer for Meeting</button>}
                            {aiResult.completeness_score < 80 && <button className="btn btn-danger" onClick={() => { setSelectedEds(aiResult.suggested_eds_points || []); setShowEds(true); }}>⚠ AI Recommends: Issue EDS ({aiResult.total_missing} missing)</button>}
                        </div>}
                    </div>}

                </div> : <div className="card" style={{ padding: 40, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, color: "#94a3b8" }}><Ic n="eye" s={40} c="#dce3ef" /><div>Select an application to review</div></div>}
            </div>

            {/* EDS Modal with real EDS Points selector */}
            {showEds && <div className="modal-backdrop" onClick={() => setShowEds(false)}><div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 620, maxHeight: "85vh", overflow: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}><div style={{ width: 38, height: 38, borderRadius: 11, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="warn" s={18} c="#dc2626" /></div><div><h3 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, color: "#0a2463" }}>Issue EDS – {sel}</h3><p style={{ fontSize: 12, color: "#64748b" }}>Select deficiency points or type custom remarks</p></div></div>
                
                {/* Pre-selected from AI */}
                {selectedEds.length > 0 && <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", marginBottom: 6 }}>Selected EDS Points ({selectedEds.length})</div>
                    {selectedEds.map((p, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#fef2f2", borderRadius: 8, marginBottom: 4, fontSize: 12 }}>
                            <span style={{ flex: 1, color: "#7f1d1d" }}>{p}</span>
                            <button onClick={() => toggleEdsPoint(p)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontWeight: 700, fontSize: 16 }}>×</button>
                        </div>
                    ))}
                </div>}

                {/* Standard EDS Points Dropdown */}
                <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0a2463", marginBottom: 6 }}>📋 Standard EDS Points (click to add)</div>
                    <div style={{ maxHeight: 200, overflow: "auto", border: "1px solid #e2e8f0", borderRadius: 8, padding: 6 }}>
                        {edsPoints.map((p, i) => (
                            <div key={i} onClick={() => toggleEdsPoint(p)} style={{ 
                                padding: "7px 10px", cursor: "pointer", borderRadius: 6, fontSize: 12, fontWeight: 500,
                                marginBottom: 2, transition: "all 0.1s",
                                background: selectedEds.includes(p) ? "#dcfce7" : "transparent",
                                color: selectedEds.includes(p) ? "#166534" : "#475569",
                            }}>
                                {selectedEds.includes(p) ? "☑" : "☐"} {p}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Custom remarks */}
                <textarea className="input" rows={3} value={eds} onChange={e => setEds(e.target.value)} placeholder={"Additional custom remarks (optional)..."} style={{ resize: "vertical" }} />
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}><button className="btn btn-danger" style={{ flex: 1, justifyContent: "center" }} onClick={issueEds}>Issue EDS & Return to Proponent ({selectedEds.length} points)</button><button className="btn btn-secondary" onClick={() => { setShowEds(false); setSelectedEds([]); }}>Cancel</button></div>
            </div></div>}
        </div>
    );
};

export const EDSMgmt = ({ apps, upd, notify }) => {
    const eds = apps.filter(a => a.status === "EDS Issued");
    return (
        <div className="fade-in">
            <div style={{ marginBottom: 22 }}><h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 24, fontWeight: 800, color: "#0a2463" }}>EDS Management</h1><p style={{ color: "#64748b", fontSize: 13 }}>Essential Documents Sought – track pending corrections</p></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {eds.map(a => <div key={a.id} className="card" style={{ padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                        <div><span style={{ fontFamily: "monospace", fontWeight: 700, color: "#1e56c2", fontSize: 12 }}>{a.id}</span><div style={{ fontWeight: 600, color: "#0a2463", marginTop: 3 }}>{a.project}</div><div style={{ fontSize: 12, color: "#64748b" }}>{a.sector} · {a.proponent}</div></div>
                        <Badge t={a.status} />
                    </div>
                    <div style={{ padding: "11px 13px", background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca", fontSize: 13, color: "#7f1d1d", marginBottom: 12, whiteSpace: "pre-line" }}><strong>EDS Remarks:</strong><br/>{a.edsRemarks}</div>
                    <button className="btn btn-success btn-sm" onClick={() => { upd(a.id, { status: "Under Scrutiny", edsRemarks: "" }); notify("EDS resolved – " + a.id + " back in scrutiny"); }}><Ic n="ok" s={12} />Mark Documents Received</button>
                </div>)}
                {!eds.length && <div className="card" style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}><Ic n="warn" s={40} c="#dce3ef" /><div style={{ marginTop: 10 }}>No active EDS cases</div></div>}
            </div>
        </div>
    );
};

export const GistGen = ({ apps, upd, notify }) => {
    const [gen, setGen] = useState(null);
    const [gistResult, setGistResult] = useState(null);
    const ready = apps.filter(a => a.status === "Referred for Meeting" && !a.gist);
    const done = apps.filter(a => a.status === "MoM Generated" && a.gist);

    const generate = async (app) => {
        setGen(app.id);
        setGistResult(null);
        try {
            if (app.dbId) {
                const result = await apiAiGenerateGist(app.dbId);
                setGistResult(result);
                upd(app.id, { gist: result.gist, status: "MoM Generated" });
                notify("AI Gist generated for " + app.id + (result.ai_generated ? " (Gemini)" : " (Template)"));
            } else {
                // Frontend-only fallback
                const g = `MEETING GIST\nApp ID: ${app.id}\nDate: ${new Date().toLocaleDateString("en-IN")}\nCategory: ${app.category} | Sector: ${app.sector}\n\n1. PROJECT OVERVIEW\nProject: ${app.project}\nProponent: ${app.proponent}\nCategory: ${app.category} | Sector: ${app.sector}\n\n2. ENVIRONMENTAL IMPACT SUMMARY\nProject involves development in the ${app.sector} sector under ${app.category} norms.\nReviewed documents: ${app.docs.join(", ")}.\nFee of ₹${app.fees.toLocaleString()} ${app.feesPaid ? "paid" : "pending"}.\n\n3. COMMITTEE OBSERVATIONS\n• Application filed on ${app.date}, reviewed by ${app.reviewer || "Scrutiny Team"}\n• All mandatory documents verified as per EIA Notification 2006\n\n4. RECOMMENDATIONS\nReferred to Expert Appraisal Committee for detailed appraisal.`;
                upd(app.id, { gist: g, status: "MoM Generated" });
                notify("Auto-Gist generated for " + app.id);
            }
        } catch (e) {
            console.error("Gist generation error:", e);
            notify("Gist generation failed — " + e.message);
        }
        setGen(null);
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 22 }}><h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 24, fontWeight: 800, color: "#0a2463" }}>AI Gist Generation & Meeting Referral</h1><p style={{ color: "#64748b", fontSize: 13 }}>Trigger AI-powered Gist creation using Gemini or Master Templates</p></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {ready.map(a => <div key={a.id} className="card" style={{ padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                        <div><div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}><span style={{ fontFamily: "monospace", fontWeight: 700, color: "#1e56c2", fontSize: 12 }}>{a.id}</span><Badge t={a.status} /></div><div style={{ fontWeight: 600, color: "#0a2463" }}>{a.project}</div><div style={{ fontSize: 12, color: "#64748b" }}>{a.category} · {a.sector}</div></div>
                        <button className="btn" style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", border: "none" }} onClick={() => generate(a)} disabled={gen === a.id}>
                            {gen === a.id ? <><span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />AI Generating…</> : <>🤖 Generate Gist (AI)</>}
                        </button>
                    </div>
                </div>)}

                {gistResult && <div className="card" style={{ padding: 18, border: "2px solid #a855f7" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 18 }}>🤖</span>
                        <h3 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: 14, color: "#7c3aed", margin: 0 }}>Generated Gist</h3>
                        <span style={{ padding: "2px 8px", background: gistResult.ai_generated ? "#f3e8ff" : "#f0f9ff", color: gistResult.ai_generated ? "#7c3aed" : "#0369a1", borderRadius: 10, fontSize: 10, fontWeight: 700, marginLeft: "auto" }}>{gistResult.source}</span>
                    </div>
                    <pre style={{ background: "#f8fafc", padding: 14, borderRadius: 8, fontSize: 12, color: "#334155", overflow: "auto", maxHeight: 300, whiteSpace: "pre-wrap", fontFamily: "monospace", lineHeight: 1.6, border: "1px solid #e2e8f0" }}>{gistResult.gist}</pre>
                </div>}

                {done.map(a => <div key={a.id} className="card" style={{ padding: 18, opacity: 0.8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                        <div><div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}><span style={{ fontFamily: "monospace", fontWeight: 700, color: "#1e56c2", fontSize: 12 }}>{a.id}</span><span className="badge" style={{ background: "#faf5ff", color: "#7c3aed" }}>✓ Gist Ready</span></div><div style={{ fontWeight: 600, color: "#0a2463" }}>{a.project}</div></div>
                        <span style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>✓ Awaiting MoM Team</span>
                    </div>
                </div>)}
                {!ready.length && !done.length && <div className="card" style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}><Ic n="sync" s={40} c="#dce3ef" /><div style={{ marginTop: 10 }}>No applications ready for Gist generation</div></div>}
            </div>
        </div>
    );
};
