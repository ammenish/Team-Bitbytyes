"""
AI Service — Gemini-powered document analysis and MoM generation.
Uses Google Generative AI (Gemini) with intelligent fallback.
"""

import os
import json

# Try to import Google Generative AI
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

# Load reference data
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

def _load_json(filename):
    path = os.path.join(DATA_DIR, filename)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

CHECKLISTS = _load_json("checklists.json")
AFFIDAVITS = _load_json("affidavits.json")
EDS_POINTS = _load_json("eds_points.json")
TEMPLATES = _load_json("templates.json")
if not isinstance(TEMPLATES, list):
    TEMPLATES = []


def _get_gemini_model():
    """Initialize Gemini model if API key is available."""
    api_key = os.getenv("GEMINI_API_KEY", "")
    if api_key and GENAI_AVAILABLE:
        genai.configure(api_key=api_key)
        return genai.GenerativeModel("gemini-2.0-flash")
    return None


def get_sector_checklist(sector):
    """Return the document checklist for a given sector."""
    # Try exact match first, then partial match
    if sector in CHECKLISTS:
        return CHECKLISTS[sector]
    for key in CHECKLISTS:
        if key.lower() in sector.lower() or sector.lower() in key.lower():
            return CHECKLISTS[key]
    # Default: return a generic checklist
    return CHECKLISTS.get("Infrastructure", [])


def update_sector_checklist(sector, checklist):
    """Update and persist the document checklist for a given sector."""
    matched = False
    if sector in CHECKLISTS:
        CHECKLISTS[sector] = checklist
        matched = True
    else:
        for key in CHECKLISTS:
            if key.lower() in sector.lower() or sector.lower() in key.lower():
                CHECKLISTS[key] = checklist
                matched = True
                break
                
    if not matched:
        CHECKLISTS[sector] = checklist
        
    path = os.path.join(DATA_DIR, "checklists.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(CHECKLISTS, f, indent=4)
    return True



def get_category_affidavits(sector):
    """Return relevant affidavit points based on sector."""
    sector_lower = sector.lower()
    if "sand" in sector_lower:
        return AFFIDAVITS.get("Sand", [])
    elif "brick" in sector_lower:
        return AFFIDAVITS.get("Bricks", [])
    elif "stone" in sector_lower or "mining" in sector_lower or "mineral" in sector_lower:
        return AFFIDAVITS.get("Stones", [])
    else:
        return AFFIDAVITS.get("Others", [])


def get_templates():
    """Return all master gist templates."""
    return TEMPLATES

def update_template(template_id, data):
    """Update and persist a specific gist template."""
    for idx, t in enumerate(TEMPLATES):
        if t.get("id") == template_id:
            TEMPLATES[idx] = {**t, **data}
            path = os.path.join(DATA_DIR, "templates.json")
            with open(path, "w", encoding="utf-8") as f:
                json.dump(TEMPLATES, f, indent=4)
            return TEMPLATES[idx]
    return None

def auto_scrutiny(application_data):
    """
    AI-powered document scrutiny.
    Compares submitted documents against sector checklist and returns analysis.
    """
    sector = application_data.get("sector", "Infrastructure")
    submitted_docs = application_data.get("documents", [])
    submitted_names = [d if isinstance(d, str) else d.get("name", "") for d in submitted_docs]
    project = application_data.get("project", "Unknown Project")
    category = application_data.get("category", "Category B2")

    # Get the required checklist
    required_docs = get_sector_checklist(sector)
    affidavit_points = get_category_affidavits(sector)

    # Perform rule-based analysis first
    missing_docs = []
    present_docs = []
    for req_doc in required_docs:
        found = False
        for sub_doc in submitted_names:
            if _fuzzy_match(req_doc, sub_doc):
                found = True
                break
        if found:
            present_docs.append(req_doc)
        else:
            missing_docs.append(req_doc)

    completeness = round((len(present_docs) / max(len(required_docs), 1)) * 100, 1)

    # Map missing docs to EDS points
    suggested_eds = []
    for missing in missing_docs:
        for eds in EDS_POINTS:
            if _fuzzy_match(missing, eds):
                suggested_eds.append(eds)
                break
        else:
            suggested_eds.append(f"PP shall submit {missing}.")

    # Determine risk level
    if completeness >= 80:
        risk = "LOW"
        recommendation = "Application is substantially complete. Minor documents pending."
    elif completeness >= 50:
        risk = "MEDIUM"
        recommendation = "Several critical documents are missing. Issue EDS for deficiencies."
    else:
        risk = "HIGH"
        recommendation = "Application is significantly incomplete. Major documentation gaps detected."

    # Try Gemini AI for enhanced analysis
    ai_insights = None
    model = _get_gemini_model()
    if model:
        try:
            prompt = f"""You are an environmental clearance scrutiny expert for CECB (Chhattisgarh Environment Conservation Board).

Analyze this application and provide a brief expert assessment (3-4 sentences):

Project: {project}
Sector: {sector}
Category: {category}
Documents Submitted: {', '.join(submitted_names) if submitted_names else 'None'}
Documents Missing: {', '.join(missing_docs[:10]) if missing_docs else 'None'}
Completeness: {completeness}%

Provide practical recommendations for the scrutiny team. Be specific to the {sector} sector.
Keep response under 150 words."""

            response = model.generate_content(prompt)
            ai_insights = response.text
        except Exception as e:
            ai_insights = None

    result = {
        "completeness_score": completeness,
        "risk_level": risk,
        "total_required": len(required_docs),
        "total_submitted": len(present_docs),
        "total_missing": len(missing_docs),
        "present_documents": present_docs,
        "missing_documents": missing_docs,
        "suggested_eds_points": suggested_eds[:15],
        "applicable_affidavits": affidavit_points[:10],
        "recommendation": recommendation,
        "ai_insights": ai_insights,
        "ai_powered": ai_insights is not None,
    }

    return result


def _get_authority(category):
    """Determine the appropriate authority body based on project category."""
    if category and "A" in str(category).upper() and "B" not in str(category).upper():
        return {
            "name": "EAC (Expert Appraisal Committee)",
            "role": "meeting secretary for the EAC (Expert Appraisal Committee) under MoEF&CC, Government of India",
            "venue": "MoEF&CC Conference Room, Indira Paryavaran Bhawan, New Delhi",
            "committee": "Expert Appraisal Committee (EAC)",
            "sign": "EAC Secretariat, MoEF&CC, Government of India",
            "report_to": "MoEF&CC"
        }
    return {
        "name": "SEIAA (State Environment Impact Assessment Authority)",
        "role": "meeting secretary for the SEIAA (State Environment Impact Assessment Authority), Chhattisgarh",
        "venue": "CECB Conference Hall, Raipur, Chhattisgarh",
        "committee": "State Expert Appraisal Committee (SEAC)",
        "sign": "SEAC/SEIAA Secretariat, Chhattisgarh",
        "report_to": "SEIAA/CECB"
    }


def generate_meeting_gist(application_data, template=None):
    """
    Generate a meeting gist from application data.
    Uses AI if available, falls back to template-based generation.
    """
    project = application_data.get("project", "Unknown Project")
    app_id = application_data.get("app_id", "N/A")
    sector = application_data.get("sector", "N/A")
    category = application_data.get("category", "N/A")
    proponent = application_data.get("proponent", "N/A")
    documents = application_data.get("documents", [])
    doc_names = [d if isinstance(d, str) else d.get("name", "") for d in documents]
    status = application_data.get("status", "N/A")
    fees = application_data.get("fees", 0)
    eds_remarks = application_data.get("eds_remarks", "")

    # Determine template structure
    template_structure = """
1. MEETING GIST header with App ID and date
2. Project Overview (brief description)
3. Documents Reviewed (list key documents)
4. Scrutiny Observations (key findings)
5. Committee Discussion Points
6. Recommendations (recommend for approval/rejection/further review with conditions)
"""
    if template:
        # Find template by ID
        t = next((t for t in TEMPLATES if str(t.get("id")) == str(template)), None)
        if t and t.get("secs"):
            template_structure = "\n".join([f"{i+1}. {sec}" for i, sec in enumerate(t["secs"])])

    # Try Gemini AI generation
    model = _get_gemini_model()
    if model:
        try:
            authority = _get_authority(category)
            prompt = f"""You are a {authority['role']}.

Generate a formal MEETING GIST for the following environmental clearance application:

Application ID: {app_id}
Project: {project}
Sector: {sector}
Category: {category}
Proponent: {proponent}
Processing Fees: ₹{fees:,.0f}
Documents Submitted: {', '.join(doc_names) if doc_names else 'None'}
Current Status: {status}
EDS Remarks (if any): {eds_remarks if eds_remarks else 'None'}

The gist should strictly follow this structure:
{template_structure}

Keep it professional, formal, and under 400 words. Use proper formatting."""

            response = model.generate_content(prompt)
            return {
                "gist": response.text,
                "ai_generated": True,
                "source": "Gemini AI"
            }
        except Exception:
            pass

    # Fallback: Template-based generation
    gist = f"""MEETING GIST
Application: {app_id}
Date: {_get_date()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PROJECT OVERVIEW
   Project: {project}
   Sector: {sector} | Category: {category}
   Proponent: {proponent}
   Processing Fees: ₹{fees:,.0f}

2. DOCUMENTS REVIEWED
{_format_list(doc_names, '   ')}

3. SCRUTINY OBSERVATIONS
   - Application has been reviewed by the scrutiny team.
   - {f'EDS was issued: {eds_remarks}' if eds_remarks else 'No EDS was issued. All documents found satisfactory.'}
   - Compliance with EIA Notification 2006 requirements has been verified.

4. COMMITTEE DISCUSSION POINTS
   - Environmental impact assessment for {sector} sector reviewed.
   - Compliance conditions to be imposed as per standard norms.
   - CER (Corporate Environmental Responsibility) plan evaluated.

5. RECOMMENDATIONS
   The committee recommends the application for {
       'APPROVAL subject to standard environmental conditions.'
       if not eds_remarks else
       'FURTHER REVIEW after submission of pending documents.'
   }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated by PARIVESH 3.0 — AI Gist Engine
"""
    return {
        "gist": gist,
        "ai_generated": False,
        "source": "Template Engine"
    }


def generate_mom(application_data, gist_text=""):
    """
    Generate formal Minutes of Meeting from application data and gist.
    """
    project = application_data.get("project", "Unknown Project")
    app_id = application_data.get("app_id", "N/A")
    sector = application_data.get("sector", "N/A")
    category = application_data.get("category", "N/A")
    proponent = application_data.get("proponent", "N/A")

    model = _get_gemini_model()
    if model and gist_text:
        try:
            authority = _get_authority(category)
            prompt = f"""You are a {authority['role']}.

Convert the following meeting GIST into formal MINUTES OF THE MEETING:

Application ID: {app_id}
Project: {project}
Sector: {sector}
Category: {category}
Proponent: {proponent}

MEETING GIST:
{gist_text}

The MoM should follow this format:
1. MINUTES OF THE MEETING header with venue, date, attendees
2. Agenda Items
3. Detailed Discussion
4. Decision / Resolution
5. Conditions imposed (numbered list, at least 5 conditions)
6. Validity period
7. Signature block

Keep it formal, authoritative, and under 500 words."""

            response = model.generate_content(prompt)
            return {
                "mom": response.text,
                "ai_generated": True,
                "source": "Gemini AI"
            }
        except Exception:
            pass

    # Fallback template
    mom = f"""MINUTES OF THE MEETING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Meeting of the {_get_authority(category)['committee']}
Venue: {_get_authority(category)['venue']}
Date: {_get_date()}

Application: {app_id}
Project: {project}
Sector: {sector} | Category: {category}
Proponent: {proponent}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AGENDA
Item: Consideration of Environmental Clearance application {app_id}

DISCUSSION
The committee reviewed the application filed by {proponent} for the project "{project}" under the {sector} sector, classified as {category}.

{f'The meeting gist was reviewed: ' + gist_text[:200] + '...' if gist_text else 'All submitted documents were reviewed and found satisfactory.'}

DECISION
After detailed deliberation, the committee has decided to RECOMMEND the project for Environmental Clearance subject to the following conditions:

CONDITIONS:
1. The project proponent shall comply with all conditions stipulated in the EIA Notification, 2006 and subsequent amendments.
2. Six-monthly compliance reports shall be submitted to {_get_authority(category)['report_to']}.
3. CER activities shall be undertaken as per the approved plan.
4. 90% survival rate of plantation shall be maintained.
5. Water sprinkling arrangements shall be made for fugitive dust emission control.
6. No polluted water shall be released into any natural water source.
7. Employment shall be given to local people as per State Government rules.
8. The EC shall be valid for a period of 7 years from the date of issue.

VALIDITY
This Environmental Clearance is valid for 7 (seven) years from the date of issue.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

— Signed: {_get_authority(category)['sign']}
— Generated by PARIVESH 3.0 MoM Engine
"""
    return {
        "mom": mom,
        "ai_generated": False,
        "source": "Template Engine"
    }


def _fuzzy_match(required, submitted):
    """Simple fuzzy matching for document names."""
    req = required.lower().strip()
    sub = submitted.lower().strip()
    # Direct containment
    if req in sub or sub in req:
        return True
    # Key word matching
    req_words = set(req.replace("/", " ").replace("-", " ").split())
    sub_words = set(sub.replace("/", " ").replace("-", " ").split())
    # Remove common filler words
    fillers = {"the", "a", "an", "of", "from", "for", "and", "or", "in", "to", "by", "with", "shall", "submit", "pp", "if", "applicable"}
    req_words -= fillers
    sub_words -= fillers
    if not req_words:
        return False
    overlap = req_words & sub_words
    return len(overlap) / len(req_words) >= 0.5


def _get_date():
    from datetime import datetime
    return datetime.now().strftime("%d %B %Y")


def _format_list(items, indent=""):
    if not items:
        return f"{indent}- No documents submitted"
    return "\n".join(f"{indent}- {item}" for item in items)
