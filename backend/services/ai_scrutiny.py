"""
PARIVESH 3.0 — AI Auto-Scrutiny Engine
=======================================
Powered by real regulatory data extracted from:
  • Checklist - Categories.pdf   (sector-wise mandatory documents)
  • EDS Points.pdf               (official EDS remark sentences)
  • Affidavits.pdf               (category-wise affidavit points)

This service cross-references an application's uploaded documents
against the sector-specific checklist and generates:
  1. Compliance score (%)
  2. List of missing documents with official EDS remarks
  3. Required affidavit points for the sector
  4. AI recommendation (Pass / Issue EDS / Needs Affidavit Review)
"""

from datetime import datetime

# ══════════════════════════════════════════════════════════════════════════════
# SECTOR-WISE DOCUMENT CHECKLISTS  (from Checklist - Categories.pdf)
# ══════════════════════════════════════════════════════════════════════════════

CHECKLISTS = {
    "Mining": [
        "Processing Fees Details",
        "Pre-feasibility Report",
        "EMP",
        "Form 1 / 1-M / CAF",
        "District Survey Report (DSR)",
        "Land Documents (B-1 P-2)",
        "Consent of Land Owner(s)",
        "LOI",
        "Lease Deed",
        "Previously Issued EC",
        "Past Production Data",
        "NOC from Gram Panchayat",
        "200 Meter Certificate",
        "500 Meter Certificate",
        "Mining Plan Approval Letter",
        "Approved Mining Plan",
        "Forest NOC",
        "Tree Plantation Compliance",
        "Water NOC (CGWA)",
        "CTE / CTO from CECB",
        "Geo-tagged Photographs",
        "Drone Video",
        "KML File",
        "CCR (Certified Compliance Report)",
        "C.E.M.P.",
        "CER Details",
        "All Affidavits",
        "EIA Report",
    ],
    "Infrastructure": [
        "Processing Fees Details",
        "Pre-feasibility Report",
        "EMP",
        "Form 1 / 1-M / CAF",
        "Land Documents (B-1 P-2)",
        "Previously Issued EC",
        "Partnership Deed / Consent of Owner(s)",
        "Conceptual Plan",
        "Approved Layout from Town and Country Planning",
        "Land Use / Zoning Map",
        "Built-up Area Statement",
        "Building Permission",
        "Water Permission (NRANVP/CGWA)",
        "STP Design & Reuse Plan",
        "Solid Waste Management Plan",
        "Solar Energy Plan",
        "Green Belt Area Statement",
        "EMP Cost Estimates",
        "NBWL Clearance",
        "Fire NOC",
        "Aviation NOC",
        "Wildlife Management Plan",
        "CTE / CTO from CECB",
        "Geo-tagged Photographs",
        "KML File",
        "CER Details",
        "All Affidavits",
        "EIA Report",
    ],
    "Industrial": [
        "Processing Fees Details",
        "Pre-feasibility Report",
        "EMP",
        "Form 1 / 1-M / CAF",
        "Land Documents (B-1 P-2)",
        "Consent of Land Owner(s)",
        "Lease Deed",
        "Previously Issued EC",
        "Past Production Data",
        "NOC from Gram Panchayat",
        "Forest NOC",
        "Tree Plantation Compliance",
        "Land Use Breakup Details",
        "ETP",
        "Fire NOC",
        "Water Permission (NRANVP/CGWA)",
        "Water NOC (CGWA)",
        "STP Design & Reuse Plan",
        "EMP Cost Estimates",
        "CTE / CTO from CECB",
        "ToR Granted",
        "EIA Report",
        "Wildlife Management Plan",
        "Affidavit on Pending Litigation",
        "All Compliance Affidavits",
        "Drone Video",
        "CCR (Certified Compliance Report)",
        "C.E.M.P.",
        "CER Details",
    ],
    "Energy": [
        "Processing Fees Details",
        "Pre-feasibility Report",
        "EMP",
        "Form 1 / 1-M / CAF",
        "Land Documents (B-1 P-2)",
        "Previously Issued EC",
        "NOC from Gram Panchayat",
        "EIA Report",
        "Forest NOC",
        "Wildlife Management Plan",
        "KML File",
        "CER Details",
        "All Affidavits",
        "Solar Energy Plan",
        "Water NOC (CGWA)",
    ],
    "River Valley": [
        "Processing Fees Details",
        "Pre-feasibility Report",
        "EMP",
        "Form 1 / 1-M / CAF",
        "Land Documents (B-1 P-2)",
        "Previously Issued EC",
        "EIA Report",
        "Forest NOC",
        "Hydrology Report",
        "Wildlife Survey",
        "Wildlife Management Plan",
        "KML File",
        "CER Details",
        "All Affidavits",
        "Water NOC (CGWA)",
        "Geo-tagged Photographs",
    ],
    "Coastal Regulation Zone": [
        "Processing Fees Details",
        "Pre-feasibility Report",
        "EMP",
        "Form 1 / 1-M / CAF",
        "CRZ Clearance",
        "Marine Survey",
        "Land Documents (B-1 P-2)",
        "Previously Issued EC",
        "EIA Report",
        "Forest NOC",
        "KML File",
        "CER Details",
        "All Affidavits",
    ],
}

# Fallback checklist for sectors not explicitly listed above
DEFAULT_CHECKLIST = [
    "Processing Fees Details",
    "Pre-feasibility Report",
    "EMP",
    "Form 1 / 1-M / CAF",
    "Land Documents (B-1 P-2)",
    "EIA Report",
    "Forest NOC",
    "KML File",
    "CER Details",
    "All Affidavits",
]


# ══════════════════════════════════════════════════════════════════════════════
# EDS POINTS MAP  (from EDS Points.pdf)
# Maps a required document → official EDS remark sentence
# ══════════════════════════════════════════════════════════════════════════════

EDS_REMARKS = {
    "Processing Fees Details":     "PP shall submit processing fee details.",
    "Pre-feasibility Report":      "PP shall submit Pre-feasibility report.",
    "EMP":                         "PP shall submit Environmental Management Plan.",
    "Form 1 / 1-M / CAF":         "PP shall submit Form 1 / 1-M / CAF as applicable.",
    "District Survey Report (DSR)":"PP shall submit DSR (Latest) with Sand Replenishment Study.",
    "Land Documents (B-1 P-2)":    "PP shall submit Land Documents (B-1 P-2).",
    "Consent of Land Owner(s)":    "PP shall submit Consent of Land Owners (If applicable).",
    "LOI":                         "PP shall submit LOI.",
    "Lease Deed":                  "PP shall submit lease deed.",
    "Previously Issued EC":        "PP shall submit Previously issued EC (Environmental Clearance).",
    "Past Production Data":        "PP shall submit latest past production certificate certified from Mining Department.",
    "NOC from Gram Panchayat":     "PP shall submit Gram Panchayat NoC mentioning Khasra No.",
    "200 Meter Certificate":       "PP shall submit 200 m Certificate.",
    "500 Meter Certificate":       "PP shall submit 500 m Certificate.",
    "Mining Plan Approval Letter":  "PP shall submit Mining plan approval letter.",
    "Approved Mining Plan":        "PP shall submit approved Mining plan.",
    "Forest NOC":                  "PP shall submit revised Forest NOC from DFO, mentioning all khasra no. of applied area & the distance of the lease area from the nearest forest boundary, National Park and Wild Life Sanctuary and Biodiversity Area.",
    "Tree Plantation Compliance":   "PP shall submit Plantation details as per previously issued EC.",
    "Water NOC (CGWA)":            "PP shall submit Water NOC for Ground water abstraction.",
    "Water Permission (NRANVP/CGWA)": "PP shall submit Water Permission (NRANVP/CGWA).",
    "CTE / CTO from CECB":        "PP shall submit Certified compliance Report of Air and Water Consent issued by CECB.",
    "Geo-tagged Photographs":      "PP shall submit Geotagged photographs of applied lease area.",
    "Drone Video":                 "PP shall submit drone video of the applied mining lease area.",
    "KML File":                    "PP shall submit KML file of applied area with properly demarcated boundary.",
    "CCR (Certified Compliance Report)": "PP shall submit Certified Compliance Report.",
    "C.E.M.P.":                   "PP shall submit C.E.M.P details for cluster.",
    "CER Details":                 "PP shall submit CER Details with consent from local authority.",
    "All Affidavits":              "PP shall submit all notarized affidavits points related to project.",
    "EIA Report":                  "PP shall submit updated EIA Report along with applicable ToR compliance.",
    "Conceptual Plan":             "PP shall submit conceptual plan for the project.",
    "Approved Layout from Town and Country Planning": "PP shall submit Approved Layout from town and country planning copy.",
    "Land Use / Zoning Map":       "PP shall submit Land Use / Zoning Map.",
    "Built-up Area Statement":     "PP shall submit Built-up Area Statement.",
    "Building Permission":         "PP shall submit Building permission copy.",
    "STP Design & Reuse Plan":     "PP shall submit STP Design & Reuse Plan / Disinfection Proposal.",
    "Solid Waste Management Plan": "PP shall submit Solid Waste Management Plan.",
    "Solar Energy Plan":           "PP shall submit Solar Energy Plan.",
    "Green Belt Area Statement":   "PP shall submit Green Belt Area statement.",
    "EMP Cost Estimates":          "PP shall submit EMP Cost Estimates.",
    "NBWL Clearance":              "PP shall submit NBWL Clearance (if <1km).",
    "Fire NOC":                    "PP shall submit Fire NOC.",
    "Aviation NOC":                "PP shall submit Aviation NOC (If applicable).",
    "Wildlife Management Plan":    "PP shall submit Wildlife Management Plan.",
    "Wildlife Survey":             "PP shall submit Wild life Conservation plan (Schedule 1 Species as per Nt. Dated 01/4/2023).",
    "All Compliance Affidavits":   "PP shall submit all compliance affidavits.",
    "Affidavit on Pending Litigation": "PP shall submit Affidavit on pending Litigation.",
    "Partnership Deed / Consent of Owner(s)": "PP shall submit Partnership deed / Consent of owner(s).",
    "Land Use Breakup Details":    "PP shall submit land use breakup details.",
    "ETP":                         "PP shall submit ETP details.",
    "ToR Granted":                 "PP shall submit ToR Granted document.",
    "Hydrology Report":            "PP shall submit Hydrology Report.",
    "CRZ Clearance":               "PP shall submit CRZ Clearance.",
    "Marine Survey":               "PP shall submit Marine Survey report.",
    "Marked & Delimited":          "PP shall submit Marked & Delimited Copy.",
    "Sand Replenishment Study":    "PP shall submit Sand Replenishment Study.",
    "Panchnama":                   "PP shall submit Panchnama.",
    "Self Compliance Report":      "PP shall submit Self compliance Report of previously issued EC.",
    "Restoration Plan":            "PP shall submit Restoration Plan (if excavated).",
}


# ══════════════════════════════════════════════════════════════════════════════
# AFFIDAVIT POINTS BY SECTOR  (from Affidavits.pdf)
# ══════════════════════════════════════════════════════════════════════════════

AFFIDAVIT_POINTS = {
    "Mining": [
        "That top soil will be preserved & stored.",
        "That control blasting will be done by a DGMS authorized license holder.",
        "That completion certificate of 7.5 meter wide safety zone plantation and proposed work under CER activities will be submitted along with Geotag photographs in six monthly compliance reports.",
        "That survival rate of Plantation will be 90%.",
        "That demarcation will be done by boundary pillars as Mineral Concession Rules.",
        "That water sprinkling arrangements will be done for fugitive dust emission.",
        "That any type of polluted water will not be released into any natural water source.",
        "That employment will be given to the local people as per the rules of the State Government.",
        "That no court case is pending relating to this project before any Court of Law in India.",
        "That no violation of Notification S.O. 804(E) dated 14/03/2017 issued by MoEFCC.",
        "That the cutting of trees located in the lease area will be done only after obtaining permission from the authority.",
        "That the conditions given in the environmental clearance will be followed.",
        "That in future will not carry out any excavation without obtaining environmental clearance.",
        "That the transportation of minerals will be done as per the SOP/Guidelines issued by CPCB.",
        "That mining operation does not cause any disturbance to flora & fauna.",
        "That proposed CER work will be done as per the proposal presented before the honourable committee.",
    ],
    "Infrastructure": [
        "That the conditions given in the environmental clearance will be followed.",
        "That employment will be given to the local people as per the rules of the State Government.",
        "That no court case is pending relating to this project before any Court of Law in India.",
        "That no violation of Notification S.O. 804(E) dated 14/03/2017 issued by MoEFCC.",
        "That proposed CER work will be done as per the proposal presented before the honourable committee.",
        "That any type of polluted water will not be released into any natural water source.",
        "That water sprinkling arrangements will be done for fugitive dust emission.",
    ],
    "Industrial": [
        "That the conditions given in the environmental clearance will be followed.",
        "That survival rate of Plantation will be 90%.",
        "That water sprinkling arrangements will be done for fugitive dust emission.",
        "That any type of polluted water will not be released into any natural water source.",
        "That employment will be given to the local people as per the rules of the State Government.",
        "That no court case is pending relating to this project before any Court of Law in India.",
        "That no violation of Notification S.O. 804(E) dated 14/03/2017 issued by MoEFCC.",
        "That proposed CER work will be done as per the proposal presented before the honourable committee.",
    ],
}


# ══════════════════════════════════════════════════════════════════════════════
# AI SCRUTINY ENGINE
# ══════════════════════════════════════════════════════════════════════════════

def _normalize(text):
    """Normalize document names for flexible matching (case-insensitive, strip whitespace, common abbreviations)."""
    t = text.lower().strip()
    # Common alias substitutions for fuzzy matching
    aliases = {
        "eia": "eia report",
        "eia draft": "eia report",
        "eia report and public hearing": "eia report",
        "noc": "forest noc",
        "forest clearance": "forest noc",
        "traffic impact": "eia report",
        "land lease": "land documents (b-1 p-2)",
        "land acquisition": "land documents (b-1 p-2)",
        "crz clearance": "crz clearance",
        "marine survey": "marine survey",
        "hydrology report": "hydrology report",
        "wildlife survey": "wildlife survey",
        "water noc": "water noc (cgwa)",
    }
    return aliases.get(t, t)


def scrutinize_application(sector, category, documents, fees_paid=False):
    """
    Main AI Scrutiny function.
    
    Args:
        sector (str): Application sector (Mining, Infrastructure, etc.)
        category (str): Category A, B1, or B2
        documents (list[str]): List of document names uploaded by the proponent
        fees_paid (bool): Whether fees are paid
    
    Returns:
        dict: Complete scrutiny result with score, missing docs, EDS remarks, affidavit list, recommendation
    """
    
    # 1. Get the required checklist for this sector
    required = CHECKLISTS.get(sector, DEFAULT_CHECKLIST)
    
    # 2. Normalize uploaded documents for comparison
    uploaded_normalized = {_normalize(d) for d in documents}
    
    # 3. Cross-reference: find missing documents
    found = []
    missing = []
    
    for req_doc in required:
        req_normalized = _normalize(req_doc)
        # Check if any uploaded doc matches or contains the required doc name
        matched = False
        for up_doc in uploaded_normalized:
            if req_normalized in up_doc or up_doc in req_normalized:
                matched = True
                break
        
        if matched:
            found.append({"document": req_doc, "status": "submitted", "remark": ""})
        else:
            eds_remark = EDS_REMARKS.get(req_doc, f"PP shall submit {req_doc}.")
            missing.append({"document": req_doc, "status": "missing", "eds_remark": eds_remark})
    
    # 4. Additional check: fees not paid
    fee_warning = None
    if not fees_paid:
        fee_warning = "Processing fees are not yet paid. Application cannot proceed until payment is confirmed."
    
    # 5. Compute compliance score
    total = len(required)
    submitted_count = len(found)
    score = round((submitted_count / total) * 100) if total > 0 else 0
    
    # 6. Get affidavit points for the sector
    affidavits = AFFIDAVIT_POINTS.get(sector, AFFIDAVIT_POINTS.get("Infrastructure", []))
    
    # 7. Generate AI recommendation
    if score == 100 and fees_paid:
        recommendation = "PASS"
        recommendation_text = "All mandatory documents are present and fees are paid. Application is ready for referral to Expert Appraisal Committee (EAC) meeting."
        severity = "success"
    elif score >= 75:
        recommendation = "ISSUE_EDS"
        recommendation_text = f"Application is {score}% compliant. {len(missing)} document(s) are missing. EDS should be issued requesting the missing documents from the Project Proponent."
        severity = "warning"
    else:
        recommendation = "ISSUE_EDS"
        recommendation_text = f"Application is only {score}% compliant. {len(missing)} critical document(s) are missing. EDS must be issued. Application cannot proceed until deficiencies are resolved."
        severity = "critical"
    
    # 8. Generate formatted EDS text (ready to send to proponent)
    eds_text = ""
    if missing:
        eds_text = f"ESSENTIAL DETAILS SOUGHT (EDS)\nApplication Sector: {sector} | Category: {category}\nDate: {datetime.now().strftime('%d/%m/%Y')}\n\n"
        eds_text += "The following documents/details are required to process your application:\n\n"
        for i, m in enumerate(missing, 1):
            eds_text += f"{i}. {m['eds_remark']}\n"
        eds_text += f"\nTotal Missing: {len(missing)} document(s)\n"
        eds_text += "Please submit the above within 15 working days of receipt of this notice.\n"
        eds_text += "\n— Generated by PARIVESH 3.0 AI Scrutiny Engine"
    
    return {
        "score": score,
        "total_required": total,
        "submitted_count": submitted_count,
        "missing_count": len(missing),
        "found_documents": found,
        "missing_documents": missing,
        "eds_text": eds_text,
        "fee_warning": fee_warning,
        "affidavit_points": affidavits,
        "recommendation": recommendation,
        "recommendation_text": recommendation_text,
        "severity": severity,
        "sector": sector,
        "category": category,
        "scrutinized_at": datetime.now().isoformat(),
    }
