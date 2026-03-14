from app import create_app
from extensions import db
from models.application import Application
from routes.downloads import _build_pdf

app = create_app()
with app.app_context():
    app_db = Application.query.first()
    if app_db:
        buf = _build_pdf(app_db, doc_type="mom")
        with open("test_out.pdf", "wb") as f:
            f.write(buf.read())
        print("PDF generated successfully.")
    else:
        print("No apps found.")
