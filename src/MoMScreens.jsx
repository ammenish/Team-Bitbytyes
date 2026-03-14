import React, { useState } from "react";
import Ic from './Ic.jsx';
import { Badge, StatCard } from './helpers.jsx';
import { apiDownloadDocument, apiAiGenerateMom } from './api.js';

export const MoMHome = ({ apps }) => (
    <div className="fade-in">
        <div style={{ marginBottom: 22 }}><h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 24, fontWeight: 800, color: "#0a2463" }}>MoM Team Dashboard</h1><p style={{ color: "#64748b", fontSize: 13 }}>Meeting Secretariat – Minutes Management</p></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
            <StatCard label="Gists Ready" val={apps.filter(a => a.status === "MoM Generated" && a.gist && !a.locked).length} icon="doc" color="#1e56c2" sub="Awaiting edit" />
            <StatCard label="Pending MoM" val={apps.filter(a => a.gist && !a.mom && !a.locked).length} icon="edit" color="#d97706" />
            <StatCard label="Finalized" val={apps.filter(a => a.status === "Finalized" && a.locked).length} icon="lock" color="#059669" />
        </div>
    </div>
);

export const MoMEd = ({ apps, upd, notify }) => {
    const [sel, setSel] = useState(null); const [gist, setGist] = useState(""); const [mom, setMom] = useState(""); const [tab, setTab] = useState("gist");
    const [momLoading, setMomLoading] = useState(false);
    const [momSource, setMomSource] = useState("");
    const [listening, setListening] = useState(false);
    const recognitionRef = React.useRef(null);
    const eligible = apps.filter(a => ["MoM Generated", "Finalized"].includes(a.status));
    const app = sel ? apps.find(a => a.id === sel) : null;
    const pick = id => { const a = apps.find(x => x.id === id); setSel(id); setGist(a.gist || ""); setMom(a.mom || ""); setTab(a.mom ? "mom" : "gist"); setMomSource(""); };
    const savGist = () => { upd(sel, { gist }); notify("Gist saved"); };
    const toMoM = async () => {
        const a = apps.find(x => x.id === sel);
        if (a && a.dbId) {
            setMomLoading(true);
            try {
                const result = await apiAiGenerateMom(a.dbId);
                setMom(result.mom);
                setMomSource(result.source || "");
                upd(sel, { mom: result.mom });
                setTab("mom");
                notify("AI MoM generated" + (result.ai_generated ? " (Gemini)" : " (Template)"));
            } catch (e) {
                // Fallback to simple conversion
                const m = gist.replace("MEETING GIST", "MINUTES OF THE MEETING").replace("Date:", "MoM Date:") + "\n\n— END OF MINUTES —\nIssued by: MoM Secretariat, MoEFCC\nRef No: MOM/" + sel + "/2025";
                setMom(m); upd(sel, { mom: m }); setTab("mom");
                notify("MoM generated (fallback)");
            }
            setMomLoading(false);
        } else {
            const m = gist.replace("MEETING GIST", "MINUTES OF THE MEETING").replace("Date:", "MoM Date:") + "\n\n— END OF MINUTES —\nIssued by: MoM Secretariat, MoEFCC\nRef No: MOM/" + sel + "/2025";
            setMom(m); upd(sel, { mom: m }); setTab("mom"); notify("MoM generated");
        }
    };
    const finalize = () => { upd(sel, { mom, status: "Finalized", locked: true }); notify("MoM finalized & locked for " + sel); setSel(null); };

    // Speech-to-text
    const toggleSpeech = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) { notify("Speech recognition not supported in this browser"); return; }

        if (listening && recognitionRef.current) {
            recognitionRef.current.stop();
            setListening(false);
            return;
        }

        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = 'en-IN';

        recog.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                if (tab === 'gist') {
                    setGist(prev => prev + ' ' + finalTranscript);
                } else {
                    setMom(prev => prev + ' ' + finalTranscript);
                }
            }
        };

        recog.onerror = (e) => {
            console.error('Speech error:', e.error);
            setListening(false);
            if (e.error === 'not-allowed') notify('Microphone access denied');
        };

        recog.onend = () => { setListening(false); };

        recog.start();
        recognitionRef.current = recog;
        setListening(true);
        notify('🎤 Voice dictation active — speak now');
    };
    return (
        <div className="fade-in">
            <div style={{ marginBottom: 22 }}><h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 24, fontWeight: 800, color: "#0a2463" }}>Gist & MoM Editor</h1><p style={{ color: "#64748b", fontSize: 13 }}>Refine Gist → Generate MoM → Finalize & Lock</p></div>
            <div style={{ display: "grid", gridTemplateColumns: "268px 1fr", gap: 18 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {eligible.map(a => <div key={a.id} onClick={() => pick(a.id)} className="card" style={{ padding: 13, cursor: "pointer", border: `2px solid ${sel === a.id ? "#1e56c2" : "#dce3ef"}`, transition: "all 0.15s" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#1e56c2" }}>{a.id}</span>{a.locked ? <Ic n="lock" s={12} c="#94a3b8" /> : <Ic n="edit" s={12} c="#94a3b8" />}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#0a2463", marginBottom: 4, lineHeight: 1.3 }}>{a.project.slice(0, 48)}</div>
                        <Badge t={a.status} />
                    </div>)}
                    {!eligible.length && <div className="card" style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No gists available yet</div>}
                </div>
                {app ? <div className="card" style={{ padding: 22 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <div><span style={{ fontFamily: "monospace", fontWeight: 700, color: "#1e56c2", fontSize: 12 }}>{app.id}</span><div style={{ fontWeight: 700, color: "#0a2463", fontSize: 15, marginTop: 2 }}>{app.project}</div></div>
                        {!app.locked && <div style={{ display: "flex", gap: 7 }}>
                            <button onClick={() => setTab("gist")} style={{ padding: "5px 13px", borderRadius: 8, border: `1.5px solid ${tab === "gist" ? "#1e56c2" : "#dce3ef"}`, background: tab === "gist" ? "#1e56c2" : "#fff", color: tab === "gist" ? "#fff" : "#64748b", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Gist</button>
                            {app.mom && <button onClick={() => setTab("mom")} style={{ padding: "5px 13px", borderRadius: 8, border: `1.5px solid ${tab === "mom" ? "#1e56c2" : "#dce3ef"}`, background: tab === "mom" ? "#1e56c2" : "#fff", color: tab === "mom" ? "#fff" : "#64748b", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>MoM</button>}
                        </div>}
                    </div>
                    {app.locked ? <div>
                        <div style={{ padding: "9px 13px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #a7f3d0", marginBottom: 12, fontSize: 13, color: "#059669", fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}><Ic n="lock" s={13} />Finalized & Locked – no further edits permitted</div>
                        <pre style={{ background: "#f8fafc", borderRadius: 10, padding: 16, fontSize: 12, lineHeight: 1.7, color: "#0f172a", overflowY: "auto", maxHeight: 340, whiteSpace: "pre-wrap", border: "1px solid #dce3ef", fontFamily: "'Courier New',monospace" }}>{app.mom}</pre>
                        <div style={{ display: "flex", gap: 9, marginTop: 12 }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => apiDownloadDocument(app.dbId, 'mom', 'docx').catch(e => console.error(e))}><Ic n="dl" s={12} />Download .docx</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => apiDownloadDocument(app.dbId, 'mom', 'pdf').catch(e => console.error(e))}><Ic n="dl" s={12} />Download .pdf</button>
                        </div>
                    </div> : <div>
                        {tab === "gist" && <>
                            <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 7, textTransform: "uppercase" }}>Edit Meeting Gist</label>
                            <textarea value={gist} onChange={e => setGist(e.target.value)} rows={13} style={{ width: "100%", padding: 12, border: `1.5px solid ${listening ? '#ef4444' : '#dce3ef'}`, borderRadius: 9, fontFamily: "'Courier New',monospace", fontSize: 12, lineHeight: 1.7, outline: "none", resize: "vertical", transition: "border-color 0.3s" }} />
                            <div style={{ display: "flex", gap: 9, marginTop: 12, flexWrap: "wrap" }}>
                                <button className="btn btn-primary" onClick={savGist}><Ic n="ok" s={14} />Save Gist</button>
                                <button onClick={toggleSpeech} style={{ padding: "9px 16px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6, background: listening ? "#ef4444" : "#f1f5f9", color: listening ? "#fff" : "#334155", animation: listening ? "pulse 1.5s infinite" : "none" }}>
                                    {listening ? "🔴 Stop Dictation" : "🎤 Voice Dictate"}
                                </button>
                                {!app.mom && <button className="btn" style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", border: "none" }} onClick={toMoM} disabled={momLoading}>
                                    {momLoading ? <><span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />AI Generating MoM…</> : <>🤖 Convert to MoM (AI)</>}
                                </button>}
                                <button className="btn btn-secondary" onClick={() => apiDownloadDocument(app.dbId, 'gist', 'docx').catch(e => console.error(e))}><Ic n="dl" s={12} />Download</button>
                            </div>
                        </>}
                        {tab === "mom" && <>
                            <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 7, textTransform: "uppercase" }}>Edit Minutes of Meeting</label>
                            <textarea value={mom} onChange={e => setMom(e.target.value)} rows={13} style={{ width: "100%", padding: 12, border: `1.5px solid ${listening ? '#ef4444' : '#dce3ef'}`, borderRadius: 9, fontFamily: "'Courier New',monospace", fontSize: 12, lineHeight: 1.7, outline: "none", resize: "vertical", transition: "border-color 0.3s" }} />
                            <div style={{ display: "flex", gap: 9, marginTop: 12, flexWrap: "wrap" }}>
                                <button className="btn btn-primary" onClick={() => { upd(sel, { mom }); notify("MoM saved"); }}><Ic n="ok" s={14} />Save MoM</button>
                                <button onClick={toggleSpeech} style={{ padding: "9px 16px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6, background: listening ? "#ef4444" : "#f1f5f9", color: listening ? "#fff" : "#334155", animation: listening ? "pulse 1.5s infinite" : "none" }}>
                                    {listening ? "🔴 Stop Dictation" : "🎤 Voice Dictate"}
                                </button>
                                <button style={{ background: "#0a2463", color: "#fff", border: "none", padding: "9px 16px", borderRadius: 9, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }} onClick={finalize}><Ic n="lock" s={13} c="#fff" />Finalize & Lock MoM</button>
                            </div>
                        </>}
                    </div>}
                </div> : <div className="card" style={{ padding: 40, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, color: "#94a3b8" }}><Ic n="doc" s={40} c="#dce3ef" /><div>Select an application to edit</div></div>}
            </div>
        </div>
    );
};

export const Finalized = ({ apps, notify }) => {
    const fin = apps.filter(a => a.status === "Finalized" && a.locked);
    return (
        <div className="fade-in">
            <div style={{ marginBottom: 22 }}><h1 style={{ fontFamily: "Outfit,sans-serif", fontSize: 24, fontWeight: 800, color: "#0a2463" }}>Finalized MoMs Archive</h1><p style={{ color: "#64748b", fontSize: 13 }}>{fin.length} finalized documents – read-only</p></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {fin.map(a => <div key={a.id} className="card" style={{ padding: 22 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                        <div><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ fontFamily: "monospace", fontWeight: 700, color: "#1e56c2", fontSize: 12 }}>{a.id}</span><span className="badge" style={{ background: "#ecfdf5", color: "#059669" }}><Ic n="lock" s={10} />Finalized</span></div><div style={{ fontWeight: 700, color: "#0a2463", fontSize: 15 }}>{a.project}</div><div style={{ fontSize: 12, color: "#64748b" }}>{a.sector} · {a.proponent}</div></div>
                        <div style={{ display: "flex", gap: 8 }}><button className="btn btn-secondary btn-sm" onClick={() => apiDownloadDocument(a.dbId, 'mom', 'docx').catch(e => console.error(e))}><Ic n="dl" s={12} />.docx</button><button className="btn btn-secondary btn-sm" onClick={() => apiDownloadDocument(a.dbId, 'mom', 'pdf').catch(e => console.error(e))}><Ic n="dl" s={12} />.pdf</button></div>
                    </div>
                    <div style={{ background: "#f8fafc", borderRadius: 9, padding: "12px 14px", border: "1px solid #dce3ef", maxHeight: 110, overflow: "hidden", position: "relative" }}>
                        <pre style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6, whiteSpace: "pre-wrap", fontFamily: "'Courier New',monospace" }}>{(a.mom || "").slice(0, 260)}…</pre>
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 36, background: "linear-gradient(transparent,#f8fafc)" }} />
                    </div>
                </div>)}
                {!fin.length && <div className="card" style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}><Ic n="lock" s={40} c="#dce3ef" /><div style={{ marginTop: 10 }}>No finalized MoMs yet</div></div>}
            </div>
        </div>
    );
};
