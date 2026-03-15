from .auth import auth_bp
from .users import users_bp
from .applications import apps_bp
from .notifications import notifs_bp
from .downloads import downloads_bp
from .statistics import statistics_bp
from .ai import ai_bp
from .payments import payments_bp

__all__ = ["auth_bp", "users_bp", "apps_bp", "notifs_bp", "downloads_bp", "statistics_bp", "ai_bp", "payments_bp"]
