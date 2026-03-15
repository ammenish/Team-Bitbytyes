import { useState, useEffect, useRef } from "react";
import landingCSS from './landingStyles.js';
import { apiLogin, apiFetchClearanceStats } from './api.js';
import { DashboardHub, ECCRZDashboard, FCDashboard, WLCDashboard, CAMPADashboard } from './PublicDashboards.jsx';
import HelpBox from './HelpBox.jsx';

// Inject landing page styles
const lpStyle = document.createElement("style");
lpStyle.textContent = landingCSS;
document.head.appendChild(lpStyle);

const LeafIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
);

const ShieldIcon = () => (<svg className="ic" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" strokeWidth="2" /></svg>);
const ZapIcon = () => (<svg className="ic" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" /></svg>);
const EyeIcon = () => (<svg className="ic" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="3" fill="currentColor" /></svg>);
const DocIcon = () => (<svg className="ic" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" strokeWidth="2" /><polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" strokeWidth="2" /><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" /><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" /><polyline points="10 9 9 9 8 9" fill="none" stroke="currentColor" strokeWidth="2" /></svg>);

const TargetIcon = () => (<svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>);
const HistoryIcon = () => (<svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /><polyline points="12 7 12 12 15 15" /></svg>);
const StackIcon = () => (<svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>);

const StatCounter = ({ endVal, label, suffix = "" }) => {
    const [count, setCount] = useState(0);
    const numericEnd = typeof endVal === "string" ? parseInt(endVal.replace(/,/g, '')) : endVal;
    
    useEffect(() => {
        let start = 0;
        const duration = 2000;
        if (!numericEnd) return; // Prevent NaN on 0 or empty

        const increment = numericEnd / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= numericEnd) {
                setCount(numericEnd);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [numericEnd]);

    return (
        <div className="s-text">
            <span className="s-val">{count.toLocaleString()}{suffix}</span>
            <span className="s-lbl">{label}</span>
        </div>
    );
};

const LandingPage = ({ onLogin }) => {
    const [tab, setTab] = useState("Home");
    const [aboutSubTab, setAboutSubTab] = useState("Objective");
    const [isScrolled, setIsScrolled] = useState(false);
    const [timelineStep, setTimelineStep] = useState(0);
    const [realStats, setRealStats] = useState({ totalGranted: 12847, source: "mock", states: [] });
    const [selectedDomain, setSelectedDomain] = useState("Environment Clearance");
    const [domainSubTab, setDomainSubTab] = useState("Overview");

    // Fetch live OGD API stats
    useEffect(() => {
        apiFetchClearanceStats().then(data => {
            if (data && data.data) {
                const total = data.data.reduce((sum, item) => sum + item.granted, 0);
                if (total > 0) {
                    setRealStats({ totalGranted: total, source: data.source, states: data.data });
                }
            }
        }).catch(err => console.error(err));
    }, []);

    const handleQuickLogin = async (role) => {
        const creds = {
            admin: { email: 'admin@parivesh.gov.in', password: 'Admin@123' },
            proponent: { email: 'sharma@infraltd.com', password: 'Pass@123' },
            scrutiny: { email: 'scrutiny1@moef.gov.in', password: 'Pass@123' },
            mom: { email: 'mom1@moef.gov.in', password: 'Pass@123' },
        };
        const c = creds[role];
        if (c && onLogin) {
            try {
                const user = await apiLogin(c.email, c.password);
                onLogin(user);
            } catch (e) {
                console.error('Quick login failed:', e);
            }
        }
    };

    useEffect(() => {
        const handleScroll = () => { setIsScrolled(window.scrollY > 20); };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (tab === "Home" && timelineStep < 6) {
            const timer = setInterval(() => {
                setTimelineStep(prev => {
                    if (prev >= 6) { clearInterval(timer); return 6; }
                    return prev + 1;
                });
            }, 3000);
            return () => clearInterval(timer);
        }
    }, [tab]);

    const lpRef = useRef(null);

    // Scroll-triggered reveal observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const delay = entry.target.dataset.delay || 0;
                        setTimeout(() => {
                            entry.target.classList.add('revealed');
                        }, Number(delay));
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );

        const el = lpRef.current;
        if (el) {
            el.querySelectorAll('.scroll-reveal').forEach((item) => observer.observe(item));
        }
        return () => observer.disconnect();
    }, [tab]);

    return (
        <div className="lp" ref={lpRef}>
            {/* ── Top Bar ── */}
            <div className="gov-bar">
                <div className="gov-bar-left">Government of Chhattisgarh</div>
                <div className="gov-bar-right">
                    <div className="font-size-ctrl">
                        <span>A-</span><span>A</span><span>A+</span>
                    </div>
                    <div className="lang-select">English</div>
                </div>
            </div>

            {/* ── Header ── */}
            <header className={`lp-header ${isScrolled ? "scrolled" : ""}`}>
                <div className="brand">
                    <div className="logo-icon" style={{ padding: 0, overflow: 'hidden', background: 'transparent' }}><img src="/moefcc_logo.png" style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="MOEFCC" /></div>
                    <div className="brand-text">
                        <h2>PARI✓ESH 3.0</h2>
                        <p>CECB Environmental Clearance</p>
                    </div>
                </div>
                <nav className="nav-links">
                    <span className={`nav-item ${tab === "Home" ? "active" : ""}`} onClick={() => setTab("Home")}>Home</span>
                    <span className={`nav-item ${tab === "About" ? "active" : ""}`} onClick={() => setTab("About")}>About</span>
                    <div className="nav-dropdown-wrapper">
                        <span className={`nav-item ${["Dashboard","ECCRZ","FC","WLC","CAMPA"].includes(tab) ? "active" : ""}`} onClick={() => setTab("Dashboard")}>Dashboard <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{verticalAlign: "middle", marginLeft: 2, marginTop: -2}}><polyline points="6 9 12 15 18 9"/></svg></span>
                        <div className="nav-dropdown">
                            <div className="nav-dd-item" onClick={() => { setTab("Dashboard"); window.scrollTo(0,0); }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:8,verticalAlign:"middle"}}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>Dashboard Hub</div>
                            <div className="nav-dd-item" onClick={() => { setTab("ECCRZ"); window.scrollTo(0,0); }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:8,verticalAlign:"middle"}}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>EC / CRZ MIS</div>
                            <div className="nav-dd-item" onClick={() => { setTab("FC"); window.scrollTo(0,0); }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" style={{marginRight:8,verticalAlign:"middle"}}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>Forest Clearance</div>
                            <div className="nav-dd-item" onClick={() => { setTab("WLC"); window.scrollTo(0,0); }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:8,verticalAlign:"middle"}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Wildlife Clearance</div>
                            <div className="nav-dd-item" onClick={() => { setTab("CAMPA"); window.scrollTo(0,0); }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:8,verticalAlign:"middle"}}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>National CAMPA</div>
                        </div>
                    </div>
                    <span className={`nav-item ${tab === "Contact" ? "active" : ""}`} onClick={() => setTab("Contact")}>Contact</span>
                    <span className={`nav-item ${tab === "Clearance" ? "active" : ""}`} onClick={() => setTab("Clearance")}>Clearance <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{verticalAlign: "middle", marginLeft: 2, marginTop: -2}}><polyline points="6 9 12 15 18 9"/></svg></span>
                    <div className="nav-actions">
                        <div className="login-dropdown-wrapper">
                            <button className="reg-btn">Login <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{verticalAlign: "middle", marginLeft: 4, marginTop: -1}}><polyline points="6 9 12 15 18 9"/></svg></button>
                            <div className="login-dropdown">
                                <div className="dropdown-item" onClick={() => handleQuickLogin('admin')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" style={{marginRight:8,verticalAlign:"middle"}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 12 15 16 10"/></svg>Admin</div>
                                <div className="dropdown-item" onClick={() => handleQuickLogin('proponent')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" style={{marginRight:8,verticalAlign:"middle"}}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>Proponent</div>
                                <div className="dropdown-item" onClick={() => handleQuickLogin('scrutiny')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e56c2" strokeWidth="2" style={{marginRight:8,verticalAlign:"middle"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Scrutiny</div>
                                <div className="dropdown-item" onClick={() => handleQuickLogin('mom')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" style={{marginRight:8,verticalAlign:"middle"}}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>MoM Team</div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header >

            {/* ── Home Content ── */}
            {
                tab === "Home" && (
                    <>
                        <section className="hero-sec">
                            <video src="/animation1.mp4" autoPlay loop muted playsInline className="hero-bg-video" />
                            <div className="hero-overlay"></div>
                            <div className="hero-content">
                                <span className="hero-badge animate-slide-up">🌐 PARIVESH 3.0 Initiative</span>
                                <h1 className="hero-title animate-slide-up delay-1">Environmental Clearance <span className="text-green">Made Digital</span></h1>
                                <p className="hero-desc animate-slide-up delay-2">
                                    A unified portal managing the complete lifecycle of environmental clearance applications, from initial filing to final Minutes of Meeting publication.
                                </p>
                                <div className="hero-btns animate-slide-up delay-3">
                                    <button className="btn-get" onClick={onLogin}>Get Started ➝</button>
                                    <button className="btn-learn" onClick={() => setTab("About")}>Learn More</button>
                                </div>
                            </div>
                        </section>

                        <section className="stats-row">
                            {[
                                { val: realStats.totalGranted, label: "EC Granted (2022) - OGD Data" },
                                { val: "3456", label: "Active Projects" },
                                { val: "28190", label: "Registered Users" },
                                { val: "18", label: "Avg. Processing Time", suffix: " Days" },
                            ].map((s, i) => (
                                <div key={i} className="stat-card scroll-reveal" data-delay={i * 120}>
                                    <div className="s-icon">
                                        {i === 0 && <DocIcon />}
                                        {i === 1 && <LeafIcon />}
                                        {i === 2 && <svg className="ic" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M16 3.13a4 4 0 0 1 0 7.75" fill="none" stroke="currentColor" strokeWidth="2" /></svg>}
                                        {i === 3 && <svg className="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" /><polyline points="12 6 12 12 16 14" fill="none" stroke="currentColor" strokeWidth="2" /></svg>}
                                    </div>
                                    <StatCounter endVal={s.val} label={s.label} suffix={s.suffix} />
                                    {i === 0 && (
                                        <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: 10, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <div style={{width: 6, height: 6, background: '#fff', borderRadius: '50%', animation: 'pulse 2s infinite'}}></div>
                                            LIVE OGD
                                        </div>
                                    )}
                                </div>
                            ))}
                        </section>

                        <section className="sec-why scroll-reveal">
                            <h2 className="sec-title scroll-reveal">Why PARIVESH 3.0?</h2>
                            <p className="sec-sub scroll-reveal" data-delay="100">Designed for transparency, efficiency, and speed in environmental governance</p>
                            <div className="why-grid">
                                <div className="why-card scroll-reveal" data-delay="0">
                                    <div className="wci blue"><ShieldIcon /></div>
                                    <h4>Role-Based Security</h4>
                                    <p>Strict access control with Admin, Scrutiny, MoM, and Proponent roles</p>
                                </div>
                                <div className="why-card scroll-reveal" data-delay="150">
                                    <div className="wci orange"><ZapIcon /></div>
                                    <h4>Automated Workflows</h4>
                                    <p>Seamless progression from Draft to Finalized MoM stage</p>
                                </div>
                                <div className="why-card scroll-reveal" data-delay="300">
                                    <div className="wci green"><EyeIcon /></div>
                                    <h4>Full Transparency</h4>
                                    <p>Track application status in real-time at every workflow stage</p>
                                </div>
                                <div className="why-card scroll-reveal" data-delay="450">
                                    <div className="wci purple"><DocIcon /></div>
                                    <h4>Document Management</h4>
                                    <p>Secure upload, verification, and export in Word & PDF formats</p>
                                </div>
                            </div>
                        </section>

                        <section className="sec-domains scroll-reveal">
                            <h2 className="sec-title scroll-reveal">Clearance Domains</h2>
                            <p className="sec-sub scroll-reveal" data-delay="100">Seek approvals across varying environmental landscapes through our single-window hub.</p>
                            
                            <div className="domain-grid">
                                {[
                                    { title: "Environment Clearance", url: "/environmental.jpg", desc: "For industrial, infrastructural & mining projects" },
                                    { title: "Forest Clearance", url: "/forest.jpg", desc: "Diversion of forest land for non-forest purposes" },
                                    { title: "Wildlife Clearance", url: "/wildlife.jpg", desc: "Activities within protected areas and eco-sensitive zones" },
                                    { title: "CRZ Clearance", url: "/crz.jpg", desc: "Development within Coastal Regulation Zones" }
                                ].map((d, i) => (
                                    <div key={i} className="domain-card scroll-reveal" data-delay={i * 150} onClick={() => { setTab("DomainDetails"); setSelectedDomain(d.title); setDomainSubTab("Overview"); window.scrollTo(0, 0); }}>
                                        <div className="dc-img" style={{ backgroundImage: `url(${d.url})` }}></div>
                                        <div className="dc-overlay">
                                            <h4>{d.title}</h4>
                                            <p>{d.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="sec-wf scroll-reveal">
                            <div className="sec-title scroll-reveal">Workflow Stages</div>
                            <p className="sec-sub scroll-reveal" data-delay="100" style={{ marginBottom: 0 }}>Linear status progression from application to finalization</p>
                            
                            {/* Vertical Central Guide Timeline */}
                            <div className="wf-vertical-timeline">
                                <div className="wf-vline">
                                    <div className="wf-vline-progress" style={{ height: `${(timelineStep / 6) * 100}%` }}></div>
                                </div>
                                {[
                                    { lbl: "Draft", col: "#9ca3af", desc: "Application is being prepared" },
                                    { lbl: "Submitted", col: "#3b82f6", desc: "Filed for review" },
                                    { lbl: "Under Scrutiny", col: "#f59e0b", desc: "Expert evaluation in progress" },
                                    { lbl: "EDS", col: "#ef4444", desc: "Essential Details Sought" },
                                    { lbl: "Referred", col: "#8b5cf6", desc: "Sent to appraisal committee" },
                                    { lbl: "MoM Generated", col: "#10b981", desc: "Minutes of Meeting created" },
                                    { lbl: "Finalized", col: "#059669", desc: "Clearance decision issued" }
                                ].map((s, i) => (
                                    <div key={i} className={`wf-vstep scroll-reveal ${i <= timelineStep ? 'active' : ''} ${i % 2 === 0 ? 'left' : 'right'}`} data-delay={i * 150}>
                                        <div className="wf-vdot" style={{ background: i <= timelineStep ? s.col : '#d1d5db', boxShadow: i <= timelineStep ? `0 0 0 6px ${s.col}33` : 'none' }}></div>
                                        <div className="wf-vcard">
                                            <div className="wf-vlabel">{s.lbl}</div>
                                            <div className="wf-vdesc">{s.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="sec-ready scroll-reveal">
                            <div className="ready-box">
                                <h2 className="scroll-reveal">Ready to File Your Application?</h2>
                                <p className="scroll-reveal" data-delay="150">Register as a Project Proponent or Qualified Professional to begin the environmental clearance process.</p>
                                <div className="rb-btns scroll-reveal" data-delay="300">
                                    <button className="rb-btn1" onClick={() => handleQuickLogin('proponent')}>Register Now</button>
                                    <button className="rb-btn2" onClick={() => handleQuickLogin('proponent')}>Sign In</button>
                                </div>
                            </div>
                        </section>
                    </>
                )
            }

            {/* ── About Content ── */}
            {
                tab === "About" && (
                    <>
                        <div className="about-hero" style={{ backgroundImage: "url('/about_cecb.png')" }}>
                            <div className="ah-overlay"></div>
                            <div className="ah-content">
                                <div className="ah-bread">Home &gt; About</div>
                                <h1 className="ah-title">About</h1>
                            </div>
                        </div>
                        <div className="about-body">
                            <div className="ab-nav">
                                <div className="ab-nav-title">What do we do?</div>
                                {[
                                    { id: "Objective", icon: <TargetIcon /> },
                                    { id: "Evolution of PARIVESH", icon: <HistoryIcon /> },
                                    { id: "Modules", icon: <StackIcon /> }
                                ].map(s => (
                                    <div key={s.id} className={`ab-item ${aboutSubTab === s.id ? "active" : ""}`} onClick={() => setAboutSubTab(s.id)}>
                                        <div className="ab-icon-group">
                                            <span className="ab-icon">{s.icon}</span>
                                            <span>{s.id}</span>
                                        </div>
                                        <div className="ab-arrow">›</div>
                                    </div>
                                ))}
                            </div>
                            <div className="ab-content">
                                {aboutSubTab === "Objective" && (
                                    <>
                                        <h3>Objective</h3>
                                        <p>The primary objective of PARIVESH 3.0 is to provide a transparent, efficient, and digitized workflow for managing environmental clearance applications. By implementing role-based access control and automated document generation, the system aims to reduce processing time, eliminate manual errors, and ensure accountability at every stage of the clearance lifecycle.</p>
                                        <p>The platform serves as a single-window solution for Project Proponents, Scrutiny Teams, MoM Teams, and Administrators to collaborate seamlessly within a secure digital environment.</p>
                                    </>
                                )}
                                {aboutSubTab === "Evolution of PARIVESH" && (
                                    <>
                                        <h3>Evolution of PARIVESH</h3>
                                        <p>PARIVESH has evolved significantly from its earlier iterations. Version 3.0 focuses on addressing previous bottlenecks by integrating an advanced rule-engine, parallel processing capabilities, and automated data aggregation.</p>
                                        <p>This leap forward ensures that all stakeholders, from applicants to the highest appraisal committees, share a unified view of the application status, ensuring total transparency.</p>
                                    </>
                                )}
                                {aboutSubTab === "Modules" && (
                                    <>
                                        <h3>Modules</h3>
                                        <p>PARIVESH 3.0 consists of several core modules tailored for different stakeholders:</p>
                                        <ul>
                                            <li style={{ marginLeft: 20, marginBottom: 8 }}><strong>Proponent Workspace:</strong> For transparent application drafting and status tracking.</li>
                                            <li style={{ marginLeft: 20, marginBottom: 8 }}><strong>Scrutiny Dashboard:</strong> For deep verification and the issuance of EDS (Essential Details Sought).</li>
                                            <li style={{ marginLeft: 20, marginBottom: 8 }}><strong>MoM Editor:</strong> For auto-generating gists and locking final Minutes of Meeting.</li>
                                            <li style={{ marginLeft: 20, marginBottom: 8 }}><strong>Admin Control Center:</strong> For overall monitoring, user administration, and templates.</li>
                                        </ul>
                                    </>
                                )}
                            </div>
                        </div >
                    </>
                )
            }

            {/* ── Additional Tabs ── */}
            {tab === "Dashboard" && <DashboardHub onNavigate={(t) => { setTab(t); window.scrollTo(0,0); }} />}
            {tab === "ECCRZ" && <ECCRZDashboard onBack={() => setTab("Dashboard")} />}
            {tab === "FC" && <FCDashboard onBack={() => setTab("Dashboard")} />}
            {tab === "WLC" && <WLCDashboard onBack={() => setTab("Dashboard")} />}
            {tab === "CAMPA" && <CAMPADashboard onBack={() => setTab("Dashboard")} />}
            {
                tab === "Contact" && (
                    <div className="about-body animate-slide-up" style={{ padding: "60px 40px", background: "#f8fafc" }}>
                        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                            <div style={{ textAlign: "center", marginBottom: 50 }}>
                                <h1 style={{ fontSize: 36, fontWeight: 800, color: "#0a2463", marginBottom: 12 }}>Contact Support</h1>
                                <p style={{ color: "#64748b", fontSize: 16 }}>Official Helpdesk and Technical Support for PARIVESH 3.0</p>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, marginBottom: 40 }}>
                                <div className="card" style={{ padding: 30, borderTop: "4px solid #05c46b" }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0a2463", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{ padding: 8, background: "#d1fae5", borderRadius: 8, color: "#059669" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
                                        Toll Free Helpdesk
                                    </h3>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: "#05c46b", marginBottom: 8 }}>1800 11 9792</div>
                                    <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>Available 9:00 AM to 5:30 PM on all working days (Monday to Friday, excluding Gazetted holidays).</p>
                                </div>

                                <div className="card" style={{ padding: 30, borderTop: "4px solid #1e56c2" }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0a2463", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{ padding: 8, background: "#dbeafe", borderRadius: 8, color: "#1e56c2" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
                                        Email Support
                                    </h3>
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Environment Clearance</div>
                                        <div style={{ fontSize: 15, fontWeight: 600, color: "#1e56c2" }}>monitoring-ec@nic.in</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Forest Clearance</div>
                                        <div style={{ fontSize: 15, fontWeight: 600, color: "#1e56c2" }}>monitoring-fc@nic.in</div>
                                    </div>
                                </div>
                            </div>

                            <div className="card" style={{ padding: 30, marginBottom: 30 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0a2463", marginBottom: 22 }}>Technical Support (ESCALATION LEVEL-II)</h3>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                                    <div style={{ background: "#f1f5f9", padding: 20, borderRadius: 12 }}>
                                        <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Shri Navin Kishore Karan</div>
                                        <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Scientist-F, NIC MoEFCC</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: "#05c46b", marginTop: 10 }}>hod-env@nic.in</div>
                                    </div>
                                    <div style={{ background: "#f1f5f9", padding: 20, borderRadius: 12 }}>
                                        <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Shri Prabhakar Kumar</div>
                                        <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Scientist-B, NIC MoEFCC</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: "#05c46b", marginTop: 10 }}>officer4.env@nic.in</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: "center", marginTop: 40 }}>
                                <button className="btn btn-primary" onClick={() => setTab("Home")}>Return to Homepage</button>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                tab === "Clearance" && (
                    <div className="about-body animate-slide-up" style={{ padding: "60px 40px", background: "#f8fafc" }}>
                        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                            <div style={{ textAlign: "center", marginBottom: 50 }}>
                                <h1 style={{ fontSize: 36, fontWeight: 800, color: "#0a2463", marginBottom: 12 }}>Clearance Services</h1>
                                <p style={{ color: "#64748b", fontSize: 16 }}>Integrated system for Environment, Forest, Wildlife and CRZ clearances</p>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 40 }}>
                                {[
                                    { t: "EC Clearance", c: "#05c46b", d: "Environmental Impact Assessment based approvals for projects." },
                                    { t: "FC Clearance", c: "#1e56c2", d: "Diversion of forest land for non-forest infrastructure." },
                                    { t: "WL Clearance", c: "#ea580c", d: "Clearances for activities in and around protected areas." },
                                    { t: "CRZ Clearance", c: "#0077b6", d: "Regulation and development in Coastal Regulated Zones." }
                                ].map((srv, i) => (
                                    <div key={i} className="card" style={{ padding: 24, borderLeft: `5px solid ${srv.c}` }}>
                                        <h4 style={{ fontWeight: 800, color: "#0a2463", marginBottom: 10 }}>{srv.t}</h4>
                                        <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{srv.d}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="card" style={{ padding: 40, background: "linear-gradient(135deg, #0a2463, #1e56c2)", color: "#fff" }}>
                                <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
                                    <div style={{ flex: 1 }}>
                                        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 14 }}>How to file your application?</h2>
                                        <p style={{ fontSize: 15, opacity: 0.9, marginBottom: 20, lineHeight: 1.6 }}>PARIVESH utilizes a secure **OTP-based authentication** system. Applicants must register via their official mobile number. Once logged in, you can prepare, submit, and track your proposals across multiple agencies through a unified dashboard.</p>
                                        <ul style={{ fontSize: 14, opacity: 0.9, marginLeft: 20, marginBottom: 24 }}>
                                            <li>One-time Registration for Project Proponents</li>
                                            <li>Online Form Filling (Form 1, 1A, EIA/EMP)</li>
                                            <li>Real-time track and trace mechanism</li>
                                        </ul>
                                        <button className="btn" style={{ background: "#05c46b", color: "#fff", border: "none" }} onClick={() => onLogin()}>Get Started Now</button>
                                    </div>
                                    <div style={{ width: 200, display: "flex", justifyContent: "center" }}>
                                        <div style={{ width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/><circle cx="12" cy="10" r="1"/></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: "center", marginTop: 40 }}>
                                <button className="btn btn-secondary" onClick={() => setTab("Home")}>Return to Homepage</button>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                tab === "DomainDetails" && (
                    <div className="domain-details-page animate-slide-up">
                        <div className="dd-header">
                            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 12 }}>Home &gt; Catalog &gt; {selectedDomain}</div>
                            <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 10px 0" }}>{selectedDomain}</h1>
                            <p style={{ maxWidth: 900, fontSize: 14, lineHeight: 1.6, opacity: 0.9 }}>
                                PARIVESH is a web based, role based workflow application which has been developed for online submission and monitoring of the proposals submitted by the proponents for seeking Environment, Forest, Wildlife and CRZ Clearances from Central, State and district level authorities. It automates the entire tracking of proposals.
                            </p>
                        </div>
                        <div className="dd-body">
                            <aside className="dd-sidebar">
                                {["Overview", "Know Your Approving Authority(KYAA)", "Know Your Process Flow", "Know Your Application Forms", "Agenda", "MOM"].map(sub => (
                                    <div key={sub} className={`dd-nav-item ${domainSubTab === sub ? "active" : ""}`} onClick={() => setDomainSubTab(sub)}>
                                        {sub}
                                        <span className="dd-arrow">›</span>
                                    </div>
                                ))}
                                <div className="dd-nav-group">
                                    <div className="dd-nav-label">Notification & Order</div>
                                    <div className={`dd-nav-subitem ${domainSubTab === "MoEFCC" ? "active" : ""}`} onClick={() => setDomainSubTab("MoEFCC")}>MoEFCC <span className="dd-arrow" style={{fontSize:15}}>›</span></div>
                                    <div className={`dd-nav-subitem ${domainSubTab === "SEIAA" ? "active" : ""}`} onClick={() => setDomainSubTab("SEIAA")}>SEIAA <span className="dd-arrow" style={{fontSize:15}}>›</span></div>
                                </div>
                                <div className={`dd-nav-item ${domainSubTab === "EIA/Consultant Organisation" ? "active" : ""}`} onClick={() => setDomainSubTab("EIA/Consultant Organisation")}>
                                    EIA/Consultant Organisation
                                    <span className="dd-arrow">›</span>
                                </div>
                            </aside>
                            
                            <main className="dd-content">
                                <h2 style={{ fontSize: 22, color: "#1e293b", marginBottom: 16 }}>{selectedDomain}</h2>
                                {domainSubTab === "Overview" ? (
                                    <div className="animate-slide-up">
                                        <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.6, marginBottom: 24 }}>
                                            In pursuant to the provisions of Environment Impact Assessment Notification, 2006 and subsequent amendments, issued under Environment (Protection) Act, 1986, following Projects/Activities as listed in the schedule to this notification shall require prior environment clearance from the concerned regulatory authority before commencing any construction work.
                                        </p>
                                        
                                        <div className="dd-graphic" style={{ background: "linear-gradient(135deg, #e11d48, #be123c, #881337)", borderRadius: 12, padding: "50px 40px", color: "white", textAlign: "center", position: "relative", overflow: "hidden", minHeight: 400 }}>
                                            <div style={{ position: "absolute", top: -30, left: -30, width: 140, height: 140, borderRadius: "50%", background: "#fcd34d", opacity: 0.9 }}></div>
                                            <div style={{ position: "absolute", top: 60, left: 30, width: 20, height: 20, borderRadius: "50%", background: "#a3e635" }}></div>
                                            <div style={{ position: "absolute", top: 10, left: 120, width: 14, height: 14, borderRadius: "50%", background: "#fcd34d" }}></div>
                                            
                                            <div style={{ position: "absolute", bottom: -20, right: -40, width: 200, height: 200, borderRadius: "50%", border: "20px solid rgba(255,255,255,0.05)" }}></div>
                                            
                                            <h3 style={{ fontSize: 26, fontWeight: 800, letterSpacing: 2, marginBottom: 40, position: "relative", zIndex: 1, textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>CATEGORIZATION OF PROJECTS</h3>
                                            
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1, marginTop: 20 }}>
                                                <div style={{ background: "#fde047", color: "#1e293b", padding: "14px 50px", borderRadius: 8, fontSize: 22, fontWeight: 800, border: "3px solid #ca8a04", marginBottom: 30, boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>CAT</div>
                                                
                                                {/* Lines */}
                                                <div style={{ position: "absolute", top: 66, width: 2, height: 40, background: "#1e293b" }}></div>
                                                <div style={{ position: "absolute", top: 104, width: 360, height: 2, background: "#1e293b" }}></div>
                                                <div style={{ position: "absolute", top: 104, left: "50%", transform: "translateX(-180px)", width: 2, height: 20, background: "#1e293b" }}></div>
                                                <div style={{ position: "absolute", top: 104, left: "50%", transform: "translateX(180px)", width: 2, height: 20, background: "#1e293b" }}></div>
                                                <div style={{ position: "absolute", top: 104, left: "50%", transform: "translateX(0px)", width: 2, height: 20, background: "#1e293b" }}></div>

                                                <div style={{ display: "flex", gap: 30, marginTop: 52 }}>
                                                    <div style={{ width: 150, background: "#f97316", color: "#1e293b", padding: "16px 20px", borderRadius: 8, fontSize: 22, fontWeight: 800, border: "3px solid #c2410c", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>A</div>
                                                    <div style={{ width: 150, background: "#a3e635", color: "#1e293b", padding: "20px 10px", borderRadius: 8, fontSize: 13, fontWeight: 800, border: "3px solid #65a30d", boxShadow: "0 4px 10px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>*General Condition</div>
                                                    <div style={{ width: 150, background: "#fdba74", color: "#1e293b", padding: "16px 20px", borderRadius: 8, fontSize: 22, fontWeight: 800, border: "3px solid #ea580c", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>B</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-slide-up" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, color: "#94a3b8", background: "#f8fafc", borderRadius: 12, border: "2px dashed #e2e8f0" }}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 16 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                        <h3 style={{ fontSize: 18, marginBottom: 8, color: "#64748b" }}>{domainSubTab}</h3>
                                        <p style={{ fontSize: 14 }}>Content for this section is currently being updated by the department.</p>
                                    </div>
                                )}
                            </main>
                        </div>
                    </div>
                )
            }

            {/* ── Footer ── */}
            <footer className="lp-footer">
                <div className="ft-grid">
                    <div>
                        <div className="ft-logo">
                            <div className="ft-logo-icon" style={{ padding: 0, overflow: 'hidden', background: 'transparent' }}><img src="/moefcc_logo.png" style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="MOEFCC" /></div>
                            <div>
                                <div className="ft-logo-text">PARI✓ESH 3.0</div>
                                <div className="ft-logo-sub">CECB Green</div>
                            </div>
                        </div>
                        <p className="ft-desc">
                            Chhattisgarh Environment Conservation Board<br />
                            Ministry of Environment, Forest and Climate Change<br />
                            Raipur, Chhattisgarh
                        </p>
                        <div className="ft-toll">Toll Free: 1800 11 9792</div>
                    </div>
                    <div className="ft-col">
                        <h4>Quick Links</h4>
                        <div className="ft-links">
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Use</a>
                            <a href="#">Accessibility</a>
                            <a href="#">Disclaimer</a>
                            <a href="#">Copyright Policy</a>
                        </div>
                    </div>
                    <div className="ft-col">
                        <h4>Resources</h4>
                        <div className="ft-links">
                            <a href="#">Acts, Rules & Guidelines</a>
                            <a href="#">PARIVESH Brochure</a>
                            <a href="#">Subordinate Legislation</a>
                            <a href="#">Downloads</a>
                            <a href="#">Technical Support</a>
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30 }}>
                    <div className="social-icons">
                        {["𝕏", "📷", "f", "🔗", "▶"].map((ic, i) => <div key={i} className="s-icon-box">{ic}</div>)}
                    </div>
                    <div className="ft-visitor-box">
                        <div className="v-lbl">Total Visitors</div>
                        <div className="v-num">38,94,493</div>
                    </div>
                </div>
                <div className="ft-bottom">
                    <div>Content owned by CECB, Government of Chhattisgarh. Last updated: 14th March 2026</div>
                    <div>Designed & Developed by NIC, MoEF&CC</div>
                </div>
            </footer>
            <HelpBox />
        </div >
    );
};

export default LandingPage;
