from datetime import datetime, timezone
from extensions import db


class Document(db.Model):
    """Document/file attachment linked to an application."""

    __tablename__ = "documents"

    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey("applications.id"), nullable=False)
    name = db.Column(db.String(255), nullable=False)       # e.g. "EIA Report"
    file_path = db.Column(db.String(500), nullable=True)    # path on server
    file_type = db.Column(db.String(50), nullable=True)     # pdf, docx, etc.
    file_size = db.Column(db.Integer, nullable=True)        # bytes
    uploaded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "application_id": self.application_id,
            "name": self.name,
            "file_path": self.file_path,
            "file_type": self.file_type,
            "file_size": self.file_size,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
        }

    def __repr__(self):
        return f"<Document {self.name} for app {self.application_id}>"
