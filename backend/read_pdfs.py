import sys
from pypdf import PdfReader

pdfs = [
    r"C:\Users\Manish Bisai\Desktop\Checklist - Categories.pdf",
    r"C:\Users\Manish Bisai\Desktop\Affidavits.pdf",
    r"C:\Users\Manish Bisai\Desktop\EDS Points.pdf"
]

for p in pdfs:
    print(f"\n{'='*20}\nFILE: {p}\n{'='*20}")
    try:
        reader = PdfReader(p)
        text = ""
        for page in reader.pages:
            t = page.extract_text()
            if t: text += t + "\n"
        print(text)
    except Exception as e:
        print(f"ERROR: {e}")
