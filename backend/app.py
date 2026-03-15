"""
PARIVESH 3.0 — Backend API Server
Flask + SQLAlchemy + JWT Authentication
"""

import os
import sys
from flask import Flask, jsonify
from config import config_map
from extensions import db, migrate, jwt, bcrypt, cors


def create_app(config_name=None):
    """Application factory."""

    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_map[config_name])

    # ── Initialize extensions ──────────────────────────────────────────
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {
        "origins": app.config["CORS_ORIGINS"],
        "expose_headers": ["Content-Disposition"]
    }})

    # ── Import models so Alembic/SQLAlchemy can see them ───────────────
    with app.app_context():
        from models import User, Application, Notification, Document  # noqa: F401

    # ── Register blueprints ────────────────────────────────────────────
    from routes import auth_bp, users_bp, apps_bp, notifs_bp, downloads_bp, statistics_bp, ai_bp, payments_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(apps_bp)
    app.register_blueprint(notifs_bp)
    app.register_blueprint(downloads_bp)
    app.register_blueprint(statistics_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(payments_bp)

    # ── Health check ───────────────────────────────────────────────────
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "healthy",
            "service": "PARIVESH 3.0 API",
            "version": "1.0.0",
        }), 200

    # ── Error handlers ─────────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token has expired", "code": "token_expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error": "Invalid token", "code": "invalid_token"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"error": "Authorization token required", "code": "token_missing"}), 401

    return app


# ── Entry point ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app = create_app()

    # Handle CLI commands
    if len(sys.argv) > 1 and sys.argv[1] == "seed":
        with app.app_context():
            db.create_all()
            from seed import seed_database
            seed_database()
    else:
        with app.app_context():
            db.create_all()
            print("📦 Database tables created")

        # ── Start background SLA scheduler ─────────────────────────────
        from services.sla_scheduler import init_sla_scheduler
        init_sla_scheduler(app)

        host = os.getenv("HOST", "0.0.0.0")
        port = int(os.getenv("PORT", 5000))
        print(f"""
╔══════════════════════════════════════════════════╗
║   🌿 PARI✓ESH 3.0 — Backend API Server          ║
║   📡 Running on http://{host}:{port}              ║
║   🔧 Environment: {os.getenv('FLASK_ENV', 'development'):>10}             ║
║   ⏰ SLA Scheduler: Active (nightly at 00:00)    ║
╚══════════════════════════════════════════════════╝
        """)
        app.run(host=host, port=port, debug=True)
