const landingCSS = `
  .lp * { box-sizing: border-box; margin: 0; padding: 0; }
  .lp { font-family: 'Plus Jakarta Sans', sans-serif; background: #e8f5e9; min-height: 100vh; color: #1b3a2a; }

  /* ── Icons ── */
  .ic { width: 1em; height: 1em; fill: currentColor; }

  /* ── Animations ── */
  @keyframes slideUpFade { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes bounceIcon { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
  
  .animate-slide-up { animation: slideUpFade 0.7s cubic-bezier(0.16,1,0.3,1) both; }
  .delay-1 { animation-delay: 0.15s; }
  .delay-2 { animation-delay: 0.3s; }
  .delay-3 { animation-delay: 0.45s; }

  /* ── Scroll Reveal System ── */
  .scroll-reveal { opacity: 0; transform: translateY(40px); transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1); }
  .scroll-reveal.revealed { opacity: 1; transform: translateY(0); }

  /* Smooth scroll behavior */
  html { scroll-behavior: smooth; }

  /* ── Top Government Bar ── */
  .gov-bar { background: #0c3320; color: #fff; padding: 6px 40px; display: flex; align-items: center; justify-content: space-between; font-size: 13px; font-weight: 500;}
  .gov-bar-left { opacity: 0.95; }
  .gov-bar-right { display: flex; gap: 16px; align-items: center; }
  .font-size-ctrl { display: flex; gap: 8px; font-weight: 600; }
  .font-size-ctrl span { cursor: pointer; }
  .lang-select { border-left: 1px solid rgba(255,255,255,0.3); padding-left: 14px; opacity: 0.95; }

  /* ── Header ── */
  .lp-header { background: linear-gradient(135deg, #d4edda, #c3e6cb); padding: 14px 40px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(5,196,107,0.2); position: sticky; top: 0; z-index: 100; transition: all 0.3s ease; }
  .lp-header.scrolled { background: rgba(200, 235, 210, 0.92); backdrop-filter: blur(14px); box-shadow: 0 4px 24px rgba(5,100,50,0.1); border-bottom-color: transparent; padding: 10px 40px; }
  .brand { display: flex; align-items: center; gap: 14px; }
  .logo-icon { width: 44px; height: 44px; background: #05c46b; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; }
  .brand-text h2 { font-size: 18px; color: #0c3320; margin: 0; font-weight: 700; }
  .brand-text p { font-size: 11px; color: #05c46b; margin: 2px 0 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .nav-links { display: flex; align-items: center; gap: 20px; font-size: 14px; font-weight: 600; color: #4b5563; }
  .nav-item { cursor: pointer; padding: 8px 18px; border-radius: 20px; transition: all 0.2s; }
  .nav-item.active { background: #e2fbe9; color: #0c3320; }
  .nav-item:hover:not(.active) { color: #0c3320; }
  .nav-actions { display: flex; align-items: center; gap: 16px; margin-left: 10px; }
  .login-btn { color: #05c46b; font-weight: 600; cursor: pointer; border: none; background: transparent; font-size: 14px; font-family: inherit; }
  .reg-btn { background: #05c46b; color: #fff; border: none; padding: 10px 24px; border-radius: 20px; font-weight: 600; font-size: 14px; cursor: pointer; font-family: inherit; }
  
  /* ── Dropdown Navbar logic ── */
  .login-dropdown-wrapper { position: relative; display: inline-block; padding: 10px 0; }
  .login-dropdown { display: none; position: absolute; top: calc(100% - 5px); left: 50%; transform: translateX(-50%); background: #fff; border-radius: 16px; box-shadow: 0 6px 30px rgba(0,0,0,0.12); padding: 10px 0; z-index: 200; min-width: 180px; animation: slideUpFade 0.2s ease forwards; }
  .login-dropdown::before { content: ''; position: absolute; top: -6px; left: 50%; transform: translateX(-50%) rotate(45deg); width: 14px; height: 14px; background: #fff; box-shadow: -2px -2px 4px rgba(0,0,0,0.02); }
  .login-dropdown-wrapper:hover .login-dropdown { display: block; }
  .dropdown-item { position: relative; padding: 12px 24px; cursor: pointer; color: #064e2b; font-weight: 600; font-size: 15px; transition: all 0.2s; display: flex; align-items: center; gap: 12px; z-index: 2; background: transparent; }
  .dropdown-item:hover { background: rgba(5, 196, 107, 0.08); color: #059669; }

  /* ── Nav Dropdown (Dashboard) ── */
  .nav-dropdown-wrapper { position: relative; display: inline-block; }
  .nav-dropdown { display: none; position: absolute; top: calc(100% + 6px); left: 50%; transform: translateX(-50%); background: #fff; border-radius: 14px; box-shadow: 0 8px 36px rgba(0,0,0,0.14); padding: 8px 0; z-index: 300; min-width: 210px; animation: slideUpFade 0.2s ease forwards; }
  .nav-dropdown::before { content: ''; position: absolute; top: -6px; left: 50%; transform: translateX(-50%) rotate(45deg); width: 12px; height: 12px; background: #fff; box-shadow: -2px -2px 4px rgba(0,0,0,0.02); }
  .nav-dropdown-wrapper:hover .nav-dropdown { display: block; }
  .nav-dd-item { padding: 11px 20px; cursor: pointer; color: #334155; font-weight: 600; font-size: 13px; transition: all 0.15s; display: flex; align-items: center; gap: 8px; }
  .nav-dd-item:hover { background: linear-gradient(90deg, rgba(5,196,107,0.1), transparent); color: #059669; padding-left: 24px; }

  /* ── Home Hero Section ── */
  .hero-sec { position: relative; min-height: 580px; display: flex; align-items: center; justify-content: space-between; padding: 0 60px; background-size: cover; background-position: center; gap: 40px; overflow: hidden; }
  .hero-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(8,30,19,0.85) 0%, rgba(8,30,19,0.5) 60%, transparent 100%); z-index: 2; }
  .hero-content { position: relative; max-width: 650px; color: #fff; z-index: 3; padding-top: 20px; padding-bottom: 60px; }
  .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; font-size: 12px; margin-bottom: 24px; backdrop-filter: blur(4px); }
  .hero-title { font-size: 52px; font-weight: 700; line-height: 1.1; margin-bottom: 20px; }
  .text-green { color: #05c46b; }
  .hero-desc { font-size: 16px; line-height: 1.6; color: #d1d5db; margin-bottom: 34px; max-width: 540px; }
  .hero-btns { display: flex; gap: 16px; }
  .btn-get { background: #05c46b; color: #fff; border: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s;}
  .btn-get:hover { background: #04b360; }
  .btn-learn { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: #fff; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; backdrop-filter: blur(4px); transition: 0.2s; }
  .btn-learn:hover { background: rgba(255,255,255,0.25); }

  /* ── Background Video ── */
  .hero-bg-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; }

  /* ── Stats Overlay ── */
  .stats-row { position: relative; z-index: 10; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; padding: 0 60px; margin-top: -50px; margin-bottom: 60px; }
  .stat-card { background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 24px; border-radius: 16px; box-shadow: 0 10px 30px rgba(5,100,50,0.1); display: flex; align-items: flex-start; gap: 16px; border: 1px solid rgba(5,196,107,0.15);}
  .s-icon { width: 44px; height: 44px; border-radius: 12px; background: #0c3320; display: flex; align-items: center; justify-content: center; color: #34d399; font-size: 20px; flex-shrink: 0;}
  .s-text { display: flex; flex-direction: column; }
  .s-val { font-size: 24px; font-weight: 800; color: #064e2b; margin-bottom: 2px; }
  .s-lbl { font-size: 12px; color: #3a6b50; font-weight: 500; }

  /* ── Why Parivesh ── */
  .sec-why { padding: 60px 40px; text-align: center; background: linear-gradient(180deg, #e8f5e9, #c8e6c9); }
  .sec-title { font-size: 32px; font-weight: 700; color: #0c3320; margin-bottom: 12px; }
  .sec-sub { font-size: 16px; color: #3a6b50; max-width: 500px; margin: 0 auto 50px; font-weight: 500; }
  .why-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: left; }
  .why-card { background: linear-gradient(145deg, #f0fdf4, #d1fae5); border-radius: 20px; padding: 36px 32px; box-shadow: 0 6px 24px rgba(5,100,50,0.08); transition: all 0.3s ease; border: 1px solid rgba(5,196,107,0.15); }
  .why-card:hover { transform: translateY(-8px); box-shadow: 0 16px 40px rgba(5,100,50,0.18); border-color: rgba(5,196,107,0.4); }
  .why-card:hover .wci { animation: bounceIcon 0.6s ease-in-out infinite; box-shadow: 0 8px 20px rgba(0,0,0,0.15); border-radius: 18px; }
  .wci { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; font-size: 22px; color: #fff; transition: all 0.3s ease; }
  .wci.blue { background: #166534; }
  .wci.orange { background: #15803d; }
  .wci.green { background: #059669; }
  .wci.purple { background: #0d9488; }
  .why-card h4 { font-size: 18px; color: #064e2b; font-weight: 700; margin-bottom: 12px; }
  .why-card p { font-size: 14px; color: #3a6b50; line-height: 1.6; }

  /* ── Domains Gallery ── */
  .sec-domains { padding: 60px 40px; text-align: center; background: #fff; }
  .domain-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; text-align: left; }
  .domain-card { height: 320px; border-radius: 16px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); cursor: pointer; border: 1px solid rgba(0,0,0,0.05); }
  .dc-img { position: absolute; inset: 0; background-position: center; background-size: cover; background-repeat: no-repeat; transition: transform 0.6s cubic-bezier(0.16,1,0.3,1); }
  .domain-card:hover .dc-img { transform: scale(1.06); }
  .dc-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(8,30,19,0.85) 100%); display: flex; flex-direction: column; justify-content: flex-end; padding: 24px; color: #fff; transition: background 0.4s ease; }
  .domain-card:hover .dc-overlay { background: linear-gradient(180deg, rgba(8,30,19,0.2) 20%, rgba(8,30,19,0.95) 100%); }
  .dc-overlay h4 { font-size: 20px; font-weight: 800; margin-bottom: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
  .dc-overlay p { font-size: 13px; font-weight: 500; color: #d1fae5; line-height: 1.5; opacity: 0; transform: translateY(10px); transition: opacity 0.4s ease, transform 0.4s ease; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
  .domain-card:hover .dc-overlay p { opacity: 1; transform: translateY(0); }

  /* ── Domain Details Interface ── */
  .domain-details-page { background: #fafafa; min-height: 80vh; padding-bottom: 60px; }
  .dd-header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 40px 60px; color: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
  .dd-body { display: flex; padding: 40px 60px; gap: 40px; align-items: flex-start; }
  .dd-sidebar { width: 320px; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); padding: 20px 0; border: 1px solid rgba(0,0,0,0.05); flex-shrink: 0; }
  .dd-nav-item { padding: 16px 24px; color: #334155; font-weight: 600; font-size: 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; border-left: 3px solid transparent; }
  .dd-nav-item:hover { background: #f8fafc; color: #16a34a; }
  .dd-nav-item.active { color: #16a34a; background: #f0fdf4; border-left-color: #16a34a; }
  .dd-arrow { font-size: 18px; color: #94a3b8; }
  .dd-nav-group { padding: 10px 0; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; margin: 10px 0; }
  .dd-nav-label { padding: 0 24px 10px; font-size: 13px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
  .dd-nav-subitem { padding: 10px 24px 10px 40px; color: #475569; font-size: 14px; cursor: pointer; display: flex; justify-content: space-between; font-weight: 500; transition: color 0.1s;}
  .dd-nav-subitem:hover { color: #16a34a; }
  .dd-nav-subitem.active { color: #16a34a; font-weight: 700; }
  .dd-content { flex-grow: 1; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); padding: 40px; border: 1px solid rgba(0,0,0,0.05); }

  /* ── Workflow Stages ── */
  .sec-wf { padding: 60px 40px 80px; text-align: center; background: #d5f0db; }

  /* ── Vertical Central Guide Timeline ── */
  .wf-vertical-timeline { position: relative; max-width: 700px; margin: 50px auto 0; padding: 20px 0; }
  .wf-vline { position: absolute; left: 50%; top: 0; bottom: 0; width: 3px; background: #c8e6c9; transform: translateX(-50%); border-radius: 3px; z-index: 1; }
  .wf-vline-progress { width: 100%; background: linear-gradient(180deg, #05c46b, #059669); border-radius: 3px; transition: height 1s ease; }
  .wf-vstep { position: relative; display: flex; align-items: center; margin-bottom: 40px; z-index: 2; }
  .wf-vstep.left { flex-direction: row-reverse; }
  .wf-vstep.left .wf-vcard { text-align: right; margin-right: 30px; margin-left: 0; }
  .wf-vstep.right .wf-vcard { text-align: left; margin-left: 30px; margin-right: 0; }
  .wf-vdot { width: 18px; height: 18px; border-radius: 50%; background: #d1d5db; position: absolute; left: 50%; transform: translateX(-50%); transition: all 0.5s ease; z-index: 3; }
  .wf-vstep.active .wf-vdot { transform: translateX(-50%) scale(1.3); }
  .wf-vcard { background: linear-gradient(145deg, #f0fdf4, #dcfce7); border: 1px solid rgba(5,196,107,0.2); border-radius: 16px; padding: 18px 24px; box-shadow: 0 6px 20px rgba(5,100,50,0.08); width: calc(50% - 50px); transition: all 0.4s ease; }
  .wf-vstep.active .wf-vcard { box-shadow: 0 10px 30px rgba(5,100,50,0.15); border-color: rgba(5,196,107,0.4); transform: scale(1.03); }
  .wf-vlabel { font-size: 16px; font-weight: 700; color: #064e2b; margin-bottom: 4px; }
  .wf-vdesc { font-size: 13px; color: #3a6b50; font-weight: 500; }
  .wf-vstep:last-child { margin-bottom: 0; }

  /* ── Ready to File Banner ── */
  .sec-ready { padding: 0 40px 80px; background: #cde8d2; }
  .ready-box { background: linear-gradient(135deg, #064e2b 0%, #0c3320 50%, #0ba360 100%); border-radius: 24px; padding: 70px 40px; text-align: center; color: #fff; position: relative; overflow: hidden; box-shadow: 0 10px 40px rgba(11,163,96,0.3) }
  .ready-box h2 { font-size: 38px; font-weight: 700; margin-bottom: 18px; position: relative; z-index: 2; }
  .ready-box p { font-size: 16px; color: rgba(255,255,255,0.9); max-width: 600px; margin: 0 auto 36px; position: relative; z-index: 2; line-height: 1.6;}
  .rb-btns { display: flex; justify-content: center; gap: 16px; position: relative; z-index: 2; }
  .rb-btn1 { background: #fff; color: #0c7b4a; border: none; padding: 14px 34px; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; transition: 0.2s;}
  .rb-btn1:hover { background: #f0fdf4; }
  .rb-btn2 { background: transparent; color: #fff; border: 1.5px solid rgba(255,255,255,0.4); padding: 14px 34px; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; transition: 0.2s;}
  .rb-btn2:hover { background: rgba(255,255,255,0.1); border-color: #fff; }
  /* Decorative circles in ready box */
  .ready-box::before { content: ''; position: absolute; top: -100px; right: -50px; width: 400px; height: 400px; background: rgba(255,255,255,0.06); border-radius: 50%; z-index: 1;}
  .ready-box::after { content: ''; position: absolute; bottom: -150px; left: -100px; width: 400px; height: 400px; background: rgba(255,255,255,0.06); border-radius: 50%; z-index: 1;}

  /* ── Footer ── */
  .lp-footer { background: linear-gradient(180deg, #0c3320, #082418); padding: 60px 40px 20px; color: #c6e8d0; }
  .ft-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 40px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 40px; margin-bottom: 20px; }
  .ft-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
  .ft-logo-icon { width: 36px; height: 36px; background: rgba(255,255,255,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.2); color: #05c46b;}
  .ft-logo-text { font-size: 18px; font-weight: 700; color: #fff; }
  .ft-logo-sub { font-size: 11px; color: #05c46b; font-weight: 600; text-transform: uppercase; margin-top: 2px;}
  .ft-desc { font-size: 13px; line-height: 1.6; margin-bottom: 16px; max-width: 340px; font-weight: 500;}
  .ft-toll { font-size: 13px; margin-bottom: 24px; font-weight: 500;}
  .ft-col h4 { color: #fff; font-size: 15px; font-weight: 700; margin-bottom: 24px; }
  .ft-links { display: flex; flex-direction: column; gap: 14px; font-size: 13px; font-weight: 500;}
  .ft-links a { color: #cbd5e1; text-decoration: none; transition: color 0.2s; }
  .ft-links a:hover { color: #05c46b; }
  .social-icons { display: flex; gap: 10px; margin-bottom: 24px; }
  .s-icon-box { width: 36px; height: 36px; background: rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; transition: background 0.2s; font-size: 14px; border: 1px solid rgba(255,255,255,0.05);}
  .s-icon-box:hover { background: #05c46b; }
  .ft-visitor-box { background: rgba(255,255,255,0.06); border-radius: 12px; padding: 14px 20px; display: inline-block; border: 1px solid rgba(255,255,255,0.08);}
  .v-lbl { font-size: 11px; margin-bottom: 6px; font-weight: 500; color: #cbd5e1;}
  .v-num { font-size: 22px; font-weight: 800; color: #05c46b; }
  .v-date { font-size: 11px; margin-top: 14px; opacity: 0.6; }
  .ft-bottom { display: flex; justify-content: space-between; font-size: 11px; opacity: 0.6; font-weight: 500;}

  /* ── About Page ── */
  .about-hero { min-height: 280px; background-size: cover; background-position: center; display: flex; align-items: center; padding: 0 40px; position: relative; }
  .ah-overlay { position: absolute; inset: 0; background: rgba(12,51,32,0.65); }
  .ah-content { position: relative; z-index: 2; color: #fff; }
  .ah-bread { font-size: 13px; color: #05c46b; margin-bottom: 12px; font-weight: 600; }
  .ah-title { font-size: 46px; font-weight: 700; line-height: 1.1;}
  .about-body { padding: 50px 40px 80px; display: grid; grid-template-columns: 280px 1fr; gap: 40px; background: #e8f5e9; }
  .ab-nav { background: linear-gradient(145deg, #f0fdf4, #d1fae5); border-radius: 20px; padding: 24px 16px; box-shadow: 0 4px 24px rgba(5,100,50,0.08); align-self: start; border: 1px solid rgba(5,196,107,0.15); }
  .ab-nav-title { font-size: 13px; color: #6b7280; font-weight: 700; padding: 0 16px; margin-bottom: 16px; }
  .ab-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 700; color: #4b5563; transition: all 0.2s; margin-bottom: 4px; }
  .ab-item.active { background: #e2fbe9; color: #0c3320; }
  .ab-icon-group { display: flex; align-items: center; gap: 12px; }
  .ab-icon { color: #05c46b; font-size: 18px; display: flex;}
  .ab-arrow { font-size: 12px; color: #9ca3af; }
  .ab-content { background: linear-gradient(145deg, #f0fdf4, #d1fae5); border-radius: 20px; padding: 40px; box-shadow: 0 4px 24px rgba(5,100,50,0.08); border: 1px solid rgba(5,196,107,0.15); }
  .ab-content h3 { font-size: 26px; color: #0c3320; font-weight: 700; margin-bottom: 24px; }
  .ab-content p { font-size: 15px; color: #2d5a3f; line-height: 1.8; margin-bottom: 24px; font-weight: 500;}
`;

export default landingCSS;
