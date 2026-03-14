export const SECTORS = ["Mining", "Infrastructure", "Industrial", "Energy", "River Valley", "Nuclear", "Tourism", "Coastal Regulation Zone", "Other"];
export const CATEGORIES = ["Category A", "Category B1", "Category B2"];

export const INITIAL_APPS = [
    { id: "PAR-2025-001", proponent: "Sharma Infrastructure Ltd.", sector: "Mining", category: "Category A", project: "Iron Ore Mining Project – Jharkhand Block C", status: "Under Scrutiny", date: "2025-06-12", fees: 75000, feesPaid: true, docs: ["EIA Report", "Forest Clearance", "NOC"], gist: "", mom: "", locked: false, edsRemarks: "", reviewer: "" },
    { id: "PAR-2025-002", proponent: "GreenPath Developers", sector: "Infrastructure", category: "Category B1", project: "NH-48 Bypass Extension – 42 km", status: "Referred for Meeting", date: "2025-06-18", fees: 45000, feesPaid: true, docs: ["Traffic Impact", "EIA Report", "Land Acquisition"], gist: "Auto-Gist: NH-48 project ready for committee review...", mom: "", locked: false, edsRemarks: "", reviewer: "Dr. Priya Mehta" },
    { id: "PAR-2025-003", proponent: "SunPower Energy Pvt. Ltd.", sector: "Energy", category: "Category B2", project: "50 MW Solar Farm – Rajasthan Desert", status: "EDS Issued", date: "2025-06-20", fees: 30000, feesPaid: false, docs: ["Land Lease", "EIA Draft"], gist: "", mom: "", locked: false, edsRemarks: "Missing: Wildlife Impact Assessment, Final EIA Report, Water Usage Plan", reviewer: "" },
    { id: "PAR-2025-004", proponent: "CoastalDev Corp.", sector: "Coastal Regulation Zone", category: "Category A", project: "Port Expansion – Visakhapatnam Terminal", status: "MoM Generated", date: "2025-06-08", fees: 120000, feesPaid: true, docs: ["CRZ Clearance", "Marine Survey", "EIA"], gist: "MEETING GIST\nApp: PAR-2025-004\nProject: Port Expansion – Visakhapatnam\nCategory: Category A | Sector: CRZ\n\n1. Project Overview\nExpansion of existing port terminal to handle additional cargo capacity.\n\n2. Environmental Summary\nCRZ clearance obtained. Marine survey conducted.\n\n3. Recommendations\nReferred to EAC for appraisal.", mom: "MINUTES OF THE MEETING\nDate: 25 June 2025\nApp: PAR-2025-004\n\nAttendees: EAC Members, MoEFCC Officials\n\nDecision: Environmental Clearance recommended subject to conditions.\n\n— Signed: MoM Secretariat", locked: false, edsRemarks: "", reviewer: "" },
    { id: "PAR-2025-005", proponent: "RiverTech Hydro", sector: "River Valley", category: "Category A", project: "Tehri II Hydro Power Project – Uttarakhand", status: "Finalized", date: "2025-05-30", fees: 95000, feesPaid: true, docs: ["EIA", "Hydrology Report", "Forest NOC", "Wildlife Survey"], gist: "Final gist content...", mom: "FINALIZED MINUTES\nPAR-2025-005 | Tehri II Hydro\n\nEnvironmental Clearance GRANTED\nDate: 20 June 2025\n\nConditions Applied: 14\nCompliance Monitoring: Quarterly\n\n— LOCKED & FINALIZED —", locked: true, edsRemarks: "", reviewer: "" },
];

export const USERS = [
    { id: 1, email: "admin@parivesh.gov.in", password: "Admin@123", role: "admin", name: "System Administrator" },
    { id: 2, email: "sharma@infraltd.com", password: "Pass@123", role: "proponent", name: "Rajiv Sharma", company: "Sharma Infrastructure Ltd." },
    { id: 3, email: "scrutiny1@moef.gov.in", password: "Pass@123", role: "scrutiny", name: "Dr. Priya Mehta" },
    { id: 4, email: "mom1@moef.gov.in", password: "Pass@123", role: "mom", name: "Arvind Kumar" },
    { id: 5, email: "demo@proponent.in", password: "Pass@123", role: "proponent", name: "Demo User", company: "New Ventures Corp." },
];
