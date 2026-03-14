import { useState } from "react";
import Ic from './Ic.jsx';
import { SECTORS, CATEGORIES } from './data.js';
import { Badge, StatCard, WorkflowBar, QRCode } from './helpers.jsx';

export const PPHome = ({ user, apps }) => {
    const mine = apps.filter(a => a.proponent === (user.company || user.name));
    return (
        <div className="fade-in">
            <div style={{ marginBottom: 22 }}><h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 24, fontWeight: 800, color: "#0a2463" }}>Welcome, {user.name.split(" ")[0]}!</h1><p style={{ color: "#64748b", fontSize: 14 }}>{user.company} – Project Proponent Dashboard</p></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 22 }}>
                <StatCard label="Filed" val={mine.length} icon="file" color="#1e56c2" />
                <StatCard label="Under Review" val={mine.filter(a => a.status === "Under Scrutiny").length} icon="eye" color="#d97706" />
                <StatCard label="EDS Pending" val={mine.filter(a => a.status === "EDS Issued").length} icon="warn" color="#dc2626" sub="Action needed" />
                <StatCard label="Cleared" val={mine.filter(a => a.status === "Finalized").length} icon="ok" color="#059669" />
            </div>
            {mine.length ? <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{mine.map(a => <div key={a.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                    <div><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}><span style={{ fontFamily: "monospace", fontWeight: 700, color: "#1e56c2", fontSize: 12 }}>{a.id}</span><Badge t={a.status} /></div><div style={{ fontWeight: 700, color: "#0a2463", fontSize: 15 }}>{a.project}</div><div style={{ color: "#64748b", fontSize: 12 }}>{a.sector} · {a.category} · Filed {a.date}</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ fontWeight: 700, color: a.feesPaid ? "#059669" : "#dc2626", fontSize: 14 }}>₹{a.fees.toLocaleString()}</div><div style={{ fontSize: 11, color: "#64748b" }}>{a.feesPaid ? "Fees Paid ✓" : "Payment Pending ⚠"}</div></div>
                </div>
                <WorkflowBar status={a.status} />
                {a.status === "EDS Issued" && <div style={{ marginTop: 12, padding: "12px 14px", background: "#fef2f2", borderRadius: 10, border: "1px solid #fecaca" }}><div style={{ fontWeight: 700, color: "#dc2626", fontSize: 13, marginBottom: 5 }}>⚠ Essential Documents Sought (EDS)</div><p style={{ fontSize: 13, color: "#7f1d1d" }}>{a.edsRemarks}</p><button className="btn btn-primary btn-sm" style={{ marginTop: 10 }}>Upload Corrected Documents</button></div>}
            </div>)}</div> : <div className="card" style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}><Ic n="file" s={40} c="#dce3ef" /><div style={{ fontWeight: 600, marginTop: 10 }}>No applications filed yet</div><div style={{ fontSize: 13, marginTop: 4 }}>Click "New Application" to get started</div></div>}
        </div>
    );
};

export const NewApp = ({ user, onAdd, notify }) => {
    const [step, setStep] = useState(1);
    const [f, setF] = useState({ cat: "", sector: "", name: "", loc: "", area: "", invest: "", desc: "", docs: [], pm: "upi", upi: "", pdfFiles: [] });
    const [paid, setPaid] = useState(false);
    const fee = f.cat === "Category A" ? 75000 : f.cat === "Category B1" ? 45000 : 30000;
    const steps = ["Category & Sector", "Project Details", "Documents", "Fee Payment", "Submit"];
    const ok = () => { if (step === 1) return f.cat && f.sector; if (step === 2) return f.name && f.loc && f.area; if (step === 4) return paid; return true; };
    const mandDocs = { "Category A": ["EIA Report", "Forest Clearance", "Wildlife Survey", "Water Usage Plan", "NOC from State"], "Category B1": ["EIA Report", "Traffic Impact Study", "Land Acquisition Docs", "NOC"], "Category B2": ["Environmental Impact Statement", "Land Lease", "Project DPR"] };
    const toggleDoc = d => setF(p => ({ ...p, docs: p.docs.includes(d) ? p.docs.filter(x => x !== d) : [...p.docs, d] }));
    const pay = () => setTimeout(() => { setPaid(true); notify("Payment ₹" + fee.toLocaleString() + " confirmed via " + f.pm.toUpperCase()); }, 1400);
    const submit = () => { const a = { id: "PAR-2025-" + String(200 + Math.floor(Math.random() * 700)), proponent: user.company || user.name, sector: f.sector, category: f.cat, project: f.name, status: "Submitted", date: new Date().toISOString().split("T")[0], fees: fee, feesPaid: paid, docs: f.docs, gist: "", mom: "", locked: false, edsRemarks: "", reviewer: "" }; onAdd(a); notify("Application " + a.id + " submitted!"); setStep(1); setF({ cat: "", sector: "", name: "", loc: "", area: "", invest: "", desc: "", docs: [], pm: "upi", upi: "" }); setPaid(false); };
    return (
        <div className="fade-in">
            <div style={{ marginBottom: 22 }}><h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 24, fontWeight: 800, color: "#0a2463" }}>New Application</h1><p style={{ color: "#64748b", fontSize: 13 }}>Multi-step Environmental Clearance Filing</p></div>
            <div className="card" style={{ padding: 18, marginBottom: 18, overflow: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                    {steps.map((s, i) => <div key={s} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            <div style={{ width: 30, height: 30, borderRadius: "50%", background: i + 1 < step ? "#06d6a0" : i + 1 === step ? "#1e56c2" : "#dce3ef", color: i + 1 <= step ? "#fff" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, transition: "all 0.3s" }}>{i + 1 < step ? <Ic n="ok" s={13} c="#fff" /> : i + 1}</div>
                            <span style={{ fontSize: 10, fontWeight: 600, color: i + 1 <= step ? "#1e56c2" : "#94a3b8", whiteSpace: "nowrap" }}>{s}</span>
                        </div>
                        {i < steps.length - 1 && <div style={{ width: 44, height: 2, background: i + 1 < step ? "#06d6a0" : "#dce3ef", margin: "0 5px", marginBottom: 16, transition: "all 0.3s" }} />}
                    </div>)}
                </div>
            </div>
            <div className="card" style={{ padding: 26 }}>
                {step === 1 && <div className="slide-up">
                    <h3 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, color: "#0a2463", marginBottom: 18 }}>Step 1: Application Category & Sector</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
                        <div><label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Application Category *</label><select className="input select" value={f.cat} onChange={e => setF(p => ({ ...p, cat: e.target.value }))}><option value="">Select...</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                        <div><label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Industry Sector *</label><select className="input select" value={f.sector} onChange={e => setF(p => ({ ...p, sector: e.target.value }))}><option value="">Select...</option>{SECTORS.map(s => <option key={s}>{s}</option>)}</select></div>
                    </div>
                    {f.cat && <div style={{ padding: "12px 14px", background: "#eff6ff", borderRadius: 10, border: "1px solid #bfdbfe", fontSize: 13, color: "#1e40af" }}><strong>Applicable Fee:</strong> ₹{fee.toLocaleString()} &nbsp;|&nbsp; <strong>Processing:</strong> {f.cat === "Category A" ? "180 days" : f.cat === "Category B1" ? "120 days" : "60 days"}</div>}
                </div>}
                {step === 2 && <div className="slide-up">
                    <h3 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, color: "#0a2463", marginBottom: 18 }}>Step 2: Project Details</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                        <div><label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Project Name *</label><input className="input" value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Iron Ore Mining Project – Block C, Jharkhand" /></div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
                            <div><label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Location *</label><input className="input" value={f.loc} onChange={e => setF(p => ({ ...p, loc: e.target.value }))} placeholder="Village, District, State" /></div>
                            <div><label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Area (hectares) *</label><input className="input" type="number" value={f.area} onChange={e => setF(p => ({ ...p, area: e.target.value }))} placeholder="e.g. 245.5" /></div>
                        </div>
                        <div><label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Total Investment (₹ Crore)</label><input className="input" type="number" value={f.invest} onChange={e => setF(p => ({ ...p, invest: e.target.value }))} placeholder="450" /></div>
                        <div><label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Project Description</label><textarea className="input" rows={4} value={f.desc} onChange={e => setF(p => ({ ...p, desc: e.target.value }))} placeholder="Describe the project..." style={{ resize: "vertical" }} /></div>
                        {/* PDF Attachment Section */}
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Attach Project PDFs <span style={{ fontWeight: 400, textTransform: "none" }}>(Max 5 files, 10MB each)</span></label>
                            <div
                                onClick={() => document.getElementById('pdf-upload-input').click()}
                                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#1e56c2"; e.currentTarget.style.background = "#eff6ff"; }}
                                onDragLeave={e => { e.currentTarget.style.borderColor = "#dce3ef"; e.currentTarget.style.background = "#fafbfc"; }}
                                onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#dce3ef"; e.currentTarget.style.background = "#fafbfc"; const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf'); if (files.length) setF(p => ({ ...p, pdfFiles: [...p.pdfFiles, ...files].slice(0, 5) })); }}
                                style={{ border: "2px dashed #dce3ef", borderRadius: 12, padding: "24px 20px", textAlign: "center", cursor: "pointer", background: "#fafbfc", transition: "all 0.2s" }}
                            >
                                <input id="pdf-upload-input" type="file" accept=".pdf" multiple style={{ display: "none" }} onChange={e => { const files = Array.from(e.target.files); if (files.length) setF(p => ({ ...p, pdfFiles: [...p.pdfFiles, ...files].slice(0, 5) })); e.target.value = ''; }} />
                                <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 4 }}>Drop PDF files here or <span style={{ color: "#1e56c2", textDecoration: "underline" }}>browse</span></div>
                                <div style={{ fontSize: 11, color: "#94a3b8" }}>Supports: EIA Reports, DPRs, NOCs, Site Plans, Feasibility Reports</div>
                            </div>
                            {f.pdfFiles.length > 0 && (
                                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                                    {f.pdfFiles.map((file, idx) => (
                                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe" }}>
                                            <Ic n="doc" s={14} c="#2563eb" />
                                            <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "#1e40af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                                            <span style={{ fontSize: 11, color: "#64748b", flexShrink: 0 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                            <button onClick={e => { e.stopPropagation(); setF(p => ({ ...p, pdfFiles: p.pdfFiles.filter((_, i) => i !== idx) })); }} style={{ background: "#fee2e2", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 11, color: "#dc2626", fontWeight: 700 }}>✕</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>}
                {step === 3 && <div className="slide-up">
                    <h3 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, color: "#0a2463", marginBottom: 6 }}>Step 3: Document Attachment</h3>
                    <p style={{ color: "#64748b", fontSize: 13, marginBottom: 18 }}>Mandatory documents for <strong>{f.cat}</strong> – {f.sector} sector</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                        {(mandDocs[f.cat] || []).map(doc => <div key={doc} onClick={() => toggleDoc(doc)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 14px", border: `1.5px solid ${f.docs.includes(doc) ? "#1e56c2" : "#dce3ef"}`, borderRadius: 10, cursor: "pointer", background: f.docs.includes(doc) ? "#eff6ff" : "#fafbfc", transition: "all 0.15s" }}>
                            <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${f.docs.includes(doc) ? "#1e56c2" : "#dce3ef"}`, background: f.docs.includes(doc) ? "#1e56c2" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{f.docs.includes(doc) && <Ic n="ok" s={11} c="#fff" />}</div>
                            <Ic n="doc" s={15} c={f.docs.includes(doc) ? "#1e56c2" : "#94a3b8"} />
                            <span style={{ fontSize: 13, fontWeight: f.docs.includes(doc) ? 600 : 400, color: f.docs.includes(doc) ? "#1e56c2" : "#0f172a" }}>{doc}</span>
                            {f.docs.includes(doc) && <span style={{ marginLeft: "auto", fontSize: 11, color: "#059669", fontWeight: 600 }}>✓ Attached</span>}
                        </div>)}
                    </div>
                    <div style={{ marginTop: 14, padding: "9px 13px", background: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a", fontSize: 12, color: "#92400e" }}>⚠ In production, actual files are uploaded. Ensure documents are current and notarized where required.</div>
                </div>}
                {step === 4 && <div className="slide-up">
                    <h3 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, color: "#0a2463", marginBottom: 18 }}>Step 4: Fee Payment</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                        <div>
                            <div style={{ padding: "14px 18px", background: "#0a2463", borderRadius: 13, color: "#fff", marginBottom: 14 }}>
                                <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 3 }}>APPLICABLE FEE</div>
                                <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 30, fontWeight: 800 }}>₹{fee.toLocaleString()}</div>
                                <div style={{ fontSize: 12, opacity: 0.65 }}>{f.cat} · {f.sector}</div>
                            </div>
                            <div style={{ marginBottom: 12 }}>
                                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 7, textTransform: "uppercase" }}>Payment Method</label>
                                {["upi", "qr", "netbanking"].map(m => <div key={m} onClick={() => setF(p => ({ ...p, pm: m }))} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 13px", border: `1.5px solid ${f.pm === m ? "#1e56c2" : "#dce3ef"}`, borderRadius: 10, cursor: "pointer", marginBottom: 7, background: f.pm === m ? "#eff6ff" : "#fafbfc", transition: "all 0.15s" }}>
                                    <div style={{ width: 17, height: 17, borderRadius: "50%", border: `2px solid ${f.pm === m ? "#1e56c2" : "#dce3ef"}`, background: f.pm === m ? "#1e56c2" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{f.pm === m && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}</div>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{m === "upi" ? "UPI Payment" : m === "qr" ? "QR Code Scan" : "Net Banking"}</span>
                                </div>)}
                            </div>
                            {f.pm === "upi" && !paid && <div><input className="input" value={f.upi} onChange={e => setF(p => ({ ...p, upi: e.target.value }))} placeholder="yourname@paytm" style={{ marginBottom: 9 }} /><button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={pay}><Ic n="pay" s={14} />Pay ₹{fee.toLocaleString()} via UPI</button></div>}
                            {f.pm === "netbanking" && !paid && <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={pay}><Ic n="pay" s={14} />Proceed to Net Banking</button>}
                            {paid && <div style={{ padding: "12px 14px", background: "#ecfdf5", borderRadius: 10, border: "1px solid #a7f3d0", display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 30, height: 30, borderRadius: "50%", background: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="ok" s={15} c="#fff" /></div><div><div style={{ fontWeight: 700, color: "#059669", fontSize: 13 }}>Payment Successful</div><div style={{ fontSize: 11, color: "#065f46" }}>TXN{Date.now().toString().slice(-8)}</div></div></div>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {f.pm === "qr" && <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 10 }}>Scan to Pay ₹{fee.toLocaleString()}</div>
                                <div style={{ background: "#fff", borderRadius: 14, padding: 14, border: "2px solid #dce3ef", display: "inline-block" }}><QRCode /></div>
                                <div style={{ marginTop: 10, fontSize: 11, color: "#64748b" }}>parivesh.moef@sbi · UPI</div>
                                {!paid && <button className="btn btn-success" style={{ marginTop: 12 }} onClick={pay}>Simulate Payment Confirmed</button>}
                            </div>}
                        </div>
                    </div>
                </div>}
                {step === 5 && <div className="slide-up">
                    <h3 style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, color: "#0a2463", marginBottom: 18 }}>Step 5: Review & Submit</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
                        {[["Category", f.cat], ["Sector", f.sector], ["Project", f.name], ["Location", f.loc], ["Area", f.area + " ha"], ["Fee", `₹${fee.toLocaleString()} ${paid ? "(Paid ✓)" : "(Unpaid)"}`]].map(([k, v]) => <div key={k} style={{ padding: "10px 13px", background: "#f8fafc", borderRadius: 9, border: "1px solid #dce3ef" }}><div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: 2 }}>{k}</div><div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{v || "—"}</div></div>)}
                    </div>
                    <div style={{ marginBottom: 16 }}><div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: 7 }}>Attached Documents ({f.docs.length})</div><div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{f.docs.map(d => <span key={d} className="badge" style={{ background: "#eff6ff", color: "#2563eb" }}><Ic n="doc" s={10} />  {d}</span>)}{!f.docs.length && <span style={{ color: "#94a3b8", fontSize: 13 }}>None attached</span>}</div></div>
                    <div style={{ padding: "12px 14px", background: "#fffbeb", borderRadius: 9, border: "1px solid #fde68a", fontSize: 13, color: "#92400e" }}>By submitting, you confirm all information is accurate. False declarations are punishable under EPA 1986.</div>
                </div>}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 26, paddingTop: 18, borderTop: "1px solid #f1f5f9" }}>
                    <button className="btn btn-secondary" onClick={() => setStep(s => Math.max(1, s - 1))} style={{ visibility: step === 1 ? "hidden" : "visible" }}>← Previous</button>
                    {step < 5 ? <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={!ok()}>Next Step →</button> : <button className="btn" style={{ background: "#059669", color: "#fff", justifyContent: "center" }} onClick={submit}><Ic n="send" s={14} c="#fff" />Submit Application</button>}
                </div>
            </div>
        </div>
    );
};
