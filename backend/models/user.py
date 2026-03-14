from datetime import datetime, timezone
from extensions import db, bcrypt


class User(db.Model):
    """User model — supports Admin, Proponent, Scrutiny, MoM roles."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="proponent")  # admin | proponent | scrutiny | mom
    company = db.Column(db.String(200), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    level = db.Column(db.Integer, default=1)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    applications = db.relationship("Application", backref="owner", lazy="dynamic", foreign_keys="Application.proponent_id")
    assigned_reviews = db.relationship("Application", backref="reviewer_user", lazy="dynamic", foreign_keys="Application.reviewer_id")
    notifications = db.relationship("Notification", backref="recipient", lazy="dynamic")

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "company": self.company,
            "phone": self.phone,
            "avatar_url": self.avatar_url,
            "level": self.level,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"
