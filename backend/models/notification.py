from datetime import datetime, timezone
from extensions import db


class Notification(db.Model):
    """Notification model for in-app alerts."""

    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.String(500), nullable=False)
    category = db.Column(db.String(50), default="info")   # info | success | warning | error
    is_read = db.Column(db.Boolean, default=False)
    link = db.Column(db.String(300), nullable=True)        # optional deep-link into the app
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "message": self.message,
            "category": self.category,
            "is_read": self.is_read,
            "link": self.link,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Notification {self.id} → user {self.user_id}>"
