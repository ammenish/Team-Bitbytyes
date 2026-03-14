"""
Generate 3 sample regulatory documents (as PDF) for testing AI Scrutiny.
These represent real documents that a Project Proponent would upload.
"""
from fpdf import FPDF
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "sample_docs")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def safe(text):
    return text.encode("latin-1", errors="replace").decode("latin-1") if text else ""


# ═══════════════════════════════════════════════════════════════════════════
# SAMPLE 1: Pre-feasibility Report (PFR)
# ═══════════════════════════════════════════════════════════════════════════
def gen_pfr():
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 12, safe("PRE-FEASIBILITY REPORT"), align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, safe("Document Reference: PFR/MIN/2026/001"), align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(10)

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, safe("1. PROJECT SUMMARY"), new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 6, safe(
        "Project Name: Limestone Mining Expansion — Phase II\n"
        "Proponent: Sharma Infrastructure Pvt. Ltd.\n"
        "Location: Village Chandanpur, Tehsil Bastar, District Jagdalpur, Chhattisgarh\n"
        "Lease Area: 12.50 Hectares\n"
        "Production Capacity: 1,50,000 TPA\n"
        "Estimated Project Cost: Rs. 4.25 Crore\n"
    ))
    pdf.ln(5)

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, safe("2. GEOLOGICAL OVERVIEW"), new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 6, safe(
        "The proposed mining area falls within the Cuddapah Supergroup geological formation. "
        "Limestone outcrops of high purity (CaO > 48%) have been confirmed through geological "
        "mapping and bore-hole analysis. The overburden ratio is approximately 1:3.5, making "
        "surface mining economically viable. The mineral reserve estimated through IBM guidelines "
        "is approximately 18.75 lakh tonnes within the applied lease boundary."
    ))
    pdf.ln(5)

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, safe("3. ENVIRONMENTAL BASELINE"), new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 6, safe(
        "Air Quality: The ambient air quality in the area meets NAAQS standards as per CPCB guidelines.\n"
        "Water Quality: Nearest water body is Chandanpur Nallah (350m away). pH 7.2, TDS 280 mg/L.\n"
        "Flora: Tropical deciduous forest in the surrounding 5 km radius. 42 species identified.\n"
        "Fauna: Common species include spotted deer, peafowl, and jungle fowl. No Schedule-1 species.\n"
        "Noise Level: Baseline noise level recorded at 42 dB(A) (daytime), within CPCB Zone III limits.\n"
    ))
    pdf.ln(5)

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, safe("4. SOCIO-ECONOMIC IMPACT"), new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 6, safe(
        "The project will provide direct employment to 45 local workers and indirect employment "
        "to approximately 120 persons. A Corporate Environmental Responsibility (CER) plan worth "
        "Rs. 12 Lakhs has been proposed, including construction of community water tank, renovation "
        "of Anganwadi centre, and tree plantation along 2 km village road."
    ))
    pdf.ln(8)
    pdf.set_font("Helvetica", "I", 9)
    pdf.cell(0, 5, safe("Prepared by: M/s GreenEarth Environmental Consultants, Raipur"), align="C")

    path = os.path.join(OUTPUT_DIR, "Pre-feasibility Report.pdf")
    pdf.output(path)
    print(f"  Created: {path}")


# ═══════════════════════════════════════════════════════════════════════════
# SAMPLE 2: Forest NOC
# ═══════════════════════════════════════════════════════════════════════════
def gen_forest_noc():
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 8, safe("OFFICE OF THE DIVISIONAL FOREST OFFICER"), align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 6, safe("Jagdalpur Forest Division, Bastar, Chhattisgarh"), align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, safe("No. DFO/BST/NOC/2026/187"), new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, safe("Date: 08/02/2026"), align="R", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(8)

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, safe("NO OBJECTION CERTIFICATE"), align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 6, safe(
        "To Whom It May Concern,\n\n"
        "This is to certify that the proposed mining lease area applied by Sharma Infrastructure "
        "Pvt. Ltd., located at Khasra No. 121/1, 121/2, 122, 123/4 in Village Chandanpur, "
        "Tehsil Bastar, District Jagdalpur, Chhattisgarh has been examined with reference to "
        "the forest land records maintained by this office.\n\n"
        "After thorough verification, it is hereby certified that:\n\n"
        "1. The applied lease area of 12.50 Hectares does NOT fall within any Reserved Forest or Protected Forest.\n\n"
        "2. The nearest Reserved Forest boundary (Kanger Valley National Park) is at a distance of "
        "8.7 km from the nearest edge of the lease boundary.\n\n"
        "3. The nearest Wildlife Sanctuary (Barnawapara WLS) is at a distance of 52 km.\n\n"
        "4. The nearest Biodiversity Heritage Site is at a distance of 35 km.\n\n"
        "5. No eco-sensitive zone overlap has been detected.\n\n"
        "Therefore, this office has NO OBJECTION to the proposed mining activity from the "
        "forestry perspective, subject to the following conditions:\n\n"
        "a) No trees shall be cut without prior permission from the Forest Department.\n"
        "b) The proponent shall plant 500 saplings of indigenous species within the safety zone.\n"
        "c) Survival rate of plantation shall be maintained at 90% or above.\n\n"
    ))
    pdf.ln(5)
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(0, 6, safe("Sd/-"), align="R", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, safe("Divisional Forest Officer"), align="R", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, safe("Jagdalpur Forest Division"), align="R")

    path = os.path.join(OUTPUT_DIR, "Forest NOC.pdf")
    pdf.output(path)
    print(f"  Created: {path}")


# ═══════════════════════════════════════════════════════════════════════════
# SAMPLE 3: EIA Report
# ═══════════════════════════════════════════════════════════════════════════
def gen_eia():
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 12, safe("ENVIRONMENTAL IMPACT ASSESSMENT REPORT"), align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, safe("As per EIA Notification, 2006 (as amended)"), align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, safe("Ref: EIA/CG/MIN/2026/312"), align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(10)

    sections = [
        ("1. EXECUTIVE SUMMARY", 
         "This Environmental Impact Assessment (EIA) report has been prepared for the proposed "
         "Limestone Mining Project at Village Chandanpur, Tehsil Bastar, Chhattisgarh by "
         "Sharma Infrastructure Pvt. Ltd. The lease area is 12.50 Ha with a proposed production "
         "capacity of 1,50,000 TPA. The EIA study was conducted during Winter 2025 (Nov-Jan) "
         "covering all four environmental components: Air, Water, Land, and Ecology."),
        
        ("2. PROJECT DESCRIPTION",
         "The project involves opencast limestone mining using drilling and controlled blasting. "
         "The mine will have a life of 20 years. Mining will be done in a systematic manner with "
         "3 benches of 6m height each. Total mineral reserve within the lease area is 18.75 lakh "
         "tonnes. Annual water requirement is 25 KLD, to be sourced from a borewell with CGWA permission."),
        
        ("3. BASELINE ENVIRONMENT",
         "Air Quality: PM10 = 62 ug/m3, PM2.5 = 28 ug/m3, SO2 = 8 ug/m3 (all within NAAQS).\n"
         "Water Quality: BOD = 2.1 mg/L, DO = 6.8 mg/L, Total Coliform = 180 MPN/100ml.\n"
         "Soil: Sandy loam, pH 6.8, Organic Carbon 0.42%.\n"
         "Noise: Day 42 dB(A), Night 34 dB(A) — within CPCB Zone III limits.\n"
         "Ecology: No Schedule-I fauna species found in 10 km study area."),
        
        ("4. IMPACT PREDICTION",
         "Air: Fugitive dust from mining operations — mitigated by water sprinkling and wet drilling.\n"
         "Water: No discharge into natural water bodies. STP to be installed for domestic wastewater.\n"
         "Land: Progressive reclamation with plantation on worked-out areas.\n"
         "Noise: Impact limited to 500m radius — controlled blasting with DGMS-approved practices."),
        
        ("5. ENVIRONMENTAL MANAGEMENT PLAN (EMP)",
         "Capital Cost of EMP: Rs. 28.00 Lakhs\n"
         "Recurring Cost: Rs. 8.50 Lakhs per annum\n"
         "Key components: Dust suppression, Green belt development (33% area), Water harvesting, "
         "Noise barriers, Wildlife conservation, Occupational Health & Safety measures.\n"
         "Monitoring: Online CAAQMS station for real-time air quality monitoring."),
        
        ("6. CER PLAN (CORPORATE ENVIRONMENTAL RESPONSIBILITY)",
         "Total CER Budget: Rs. 12.00 Lakhs\n"
         "Activities: Community water supply (Rs. 4L), Anganwadi renovation (Rs. 3L), "
         "Road-side plantation (Rs. 2L), Skill development program (Rs. 3L).\n"
         "Implementation: In consultation with Gram Sabha, Chandanpur."),
    ]

    for title, content in sections:
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, safe(title), new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 10)
        pdf.multi_cell(0, 6, safe(content))
        pdf.ln(5)

    pdf.ln(5)
    pdf.set_font("Helvetica", "I", 9)
    pdf.multi_cell(0, 5, safe(
        "Prepared by: M/s GreenEarth Environmental Consultants, Raipur\n"
        "NABET Accredited EIA Consultant (Accreditation No: NABET/EIA/1234/2024)\n"
        "Date: 15/01/2026"
    ), align="C")

    path = os.path.join(OUTPUT_DIR, "EIA Report.pdf")
    pdf.output(path)
    print(f"  Created: {path}")


if __name__ == "__main__":
    print("Generating sample regulatory documents for testing AI Scrutiny...")
    gen_pfr()
    gen_forest_noc()
    gen_eia()
    print(f"\nDone! Sample docs saved to: {OUTPUT_DIR}")
    print("\nUpload these to an application and run AI Scrutiny to see them get verified!")
