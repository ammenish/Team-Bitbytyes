from datetime import datetime, timezone
from extensions import db


class Application(db.Model):
    """Environmental clearance application model."""

    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)
    app_id = db.Column(db.String(20), unique=True, nullable=False, index=True)  # e.g. PAR-2025-001
    project = db.Column(db.String(300), nullable=False)
    sector = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # Category A, B1, B2
    status = db.Column(db.String(50), nullable=False, default="Draft")
    # Statuses: Draft | Under Scrutiny | EDS Issued | Referred for Meeting | MoM Generated | Finalized

    fees = db.Column(db.Float, default=0)
    fees_paid = db.Column(db.Boolean, default=False)

    gist = db.Column(db.Text, default="")
    mom = db.Column(db.Text, default="")
    eds_remarks = db.Column(db.Text, default="")
    locked = db.Column(db.Boolean, default=False)

    # Foreign keys
    proponent_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    reviewer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    documents = db.relationship("Document", backref="application", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "app_id": self.app_id,
            "project": self.project,
            "sector": self.sector,
            "category": self.category,
            "status": self.status,
            "fees": self.fees,
            "fees_paid": self.fees_paid,
            "gist": self.gist,
            "mom": self.mom,
            "eds_remarks": self.eds_remarks,
            "locked": self.locked,
            "proponent_id": self.proponent_id,
            "proponent": self.owner.name if self.owner else None,
            "company": self.owner.company if self.owner else None,
            "reviewer_id": self.reviewer_id,
            "reviewer": self.reviewer_user.name if self.reviewer_user else None,
            "documents": [d.to_dict() for d in self.documents],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<Application {self.app_id} – {self.status}>"
