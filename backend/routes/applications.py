from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.application import Application
from models.document import Document
from models.notification import Notification
from extensions import db
from datetime import datetime, timezone

apps_bp = Blueprint("applications", __name__, url_prefix="/api/applications")

VALID_STATUSES = ["Draft", "Under Scrutiny", "EDS Issued", "Referred for Meeting", "MoM Generated", "Finalized"]
VALID_SECTORS = ["Mining", "Infrastructure", "Industrial", "Energy", "River Valley", "Nuclear", "Tourism", "Coastal Regulation Zone", "Other"]
VALID_CATEGORIES = ["Category A", "Category B1", "Category B2"]


def _generate_app_id():
    """Generate next application ID like PAR-2025-001."""
    year = datetime.now(timezone.utc).year
    last = Application.query.filter(Application.app_id.like(f"PAR-{year}-%")).order_by(Application.id.desc()).first()
    if last:
        num = int(last.app_id.split("-")[-1]) + 1
    else:
        num = 1
    return f"PAR-{year}-{num:03d}"


@apps_bp.route("/", methods=["GET"])
@jwt_required()
def list_applications():
    """List applications based on user role."""
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    query = Application.query

    # Role-based filtering
    if user.role == "proponent":
        query = query.filter_by(proponent_id=user.id)
    elif user.role == "scrutiny":
        # Scrutiny needs: Submitted, Under Scrutiny, EDS Issued, Referred for Meeting, MoM Generated
        query = query.filter(Application.status.in_(["Submitted", "Under Scrutiny", "EDS Issued", "Referred for Meeting", "MoM Generated"]))
    elif user.role == "mom":
        # MoM needs: Referred for Meeting, MoM Generated, Finalized
        query = query.filter(Application.status.in_(["Referred for Meeting", "MoM Generated", "Finalized"]))
    # admin sees all

    # Optional filters
    status = request.args.get("status")
    sector = request.args.get("sector")
    if status:
        query = query.filter_by(status=status)
    if sector:
        query = query.filter_by(sector=sector)

    apps = query.order_by(Application.created_at.desc()).all()
    return jsonify({"applications": [a.to_dict() for a in apps], "total": len(apps)}), 200


@apps_bp.route("/<int:app_id>", methods=["GET"])
@jwt_required()
def get_application(app_id):
    """Get a specific application."""
    app = Application.query.get(app_id)
    if not app:
        return jsonify({"error": "Application not found"}), 404
    return jsonify({"application": app.to_dict()}), 200


@apps_bp.route("/", methods=["POST"])
@jwt_required()
def create_application():
    """Create a new application (proponent only)."""
    user = User.query.get(int(get_jwt_identity()))
    if not user or user.role != "proponent":
        return jsonify({"error": "Only proponents can create applications"}), 403

    data = request.get_json()
    required = ["project", "sector", "category"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    if data["sector"] not in VALID_SECTORS:
        return jsonify({"error": f"Invalid sector. Valid: {VALID_SECTORS}"}), 400
    if data["category"] not in VALID_CATEGORIES:
        return jsonify({"error": f"Invalid category. Valid: {VALID_CATEGORIES}"}), 400

    app = Application(
        app_id=_generate_app_id(),
        project=data["project"],
        sector=data["sector"],
        category=data["category"],
        fees=data.get("fees", 0),
        fees_paid=data.get("fees_paid", False),
        proponent_id=user.id,
        status="Submitted",
    )

    db.session.add(app)
    db.session.commit()

    # Add documents if provided
    for doc_name in data.get("documents", []):
        doc = Document(application_id=app.id, name=doc_name)
        db.session.add(doc)

    db.session.commit()

    # Notify proponent
    db.session.add(Notification(
        user_id=app.proponent_id,
        title="Application Submitted",
        message=f"Your application {app.app_id} for {app.project[:30]}... has been submitted successfully.",
        category="success",
    ))

    # Notify all scrutiny officers
    scrutiny_users = User.query.filter_by(role="scrutiny").all()
    for s_user in scrutiny_users:
        db.session.add(Notification(
            user_id=s_user.id,
            title="New Application Received",
            message=f"New application {app.app_id} submitted by {user.company}. Awaiting review in your queue.",
            category="info",
        ))

    db.session.commit()

    return jsonify({"message": "Application created", "application": app.to_dict()}), 201


@apps_bp.route("/<int:app_id>", methods=["PUT"])
@jwt_required()
def update_application(app_id):
    """Update an application."""
    user = User.query.get(int(get_jwt_identity()))
    app = Application.query.get(app_id)

    if not app:
        return jsonify({"error": "Application not found"}), 404
    if app.locked:
        return jsonify({"error": "Application is locked and cannot be modified"}), 403

    data = request.get_json()

    # Status transition
    if "status" in data:
        if data["status"] not in VALID_STATUSES:
            return jsonify({"error": f"Invalid status. Valid: {VALID_STATUSES}"}), 400
        
        if data["status"] == "Referred for Meeting" and app.status != "Referred for Meeting":
            mom_users = User.query.filter_by(role="mom").all()
            for m_user in mom_users:
                db.session.add(Notification(
                    user_id=m_user.id,
                    title="New Meeting Referral",
                    message=f"Application {app.app_id} has been verified and referred for meeting.",
                    category="info",
                ))
                
        app.status = data["status"]

        # Create notification for status change
        notif = Notification(
            user_id=app.proponent_id,
            title="Application Status Updated",
            message=f"Your application {app.app_id} is now: {data['status']}",
            category="info",
        )
        db.session.add(notif)

    # Updatable fields
    updatable = ["project", "sector", "category", "fees", "fees_paid", "gist", "mom", "eds_remarks", "locked"]
    for field in updatable:
        if field in data:
            setattr(app, field, data[field])

    # Assign reviewer
    if "reviewer_id" in data:
        reviewer = User.query.get(data["reviewer_id"])
        if reviewer and reviewer.role in ["scrutiny", "mom"]:
            app.reviewer_id = data["reviewer_id"]
            # Notify the reviewer
            notif = Notification(
                user_id=reviewer.id,
                title="New Review Assignment",
                message=f"You've been assigned to review {app.app_id}: {app.project}",
                category="info",
            )
            db.session.add(notif)

    db.session.commit()
    return jsonify({"message": "Application updated", "application": app.to_dict()}), 200


@apps_bp.route("/<int:app_id>/pay", methods=["POST"])
@jwt_required()
def pay_fees(app_id):
    """Mark application fees as paid."""
    app = Application.query.get(app_id)
    if not app:
        return jsonify({"error": "Application not found"}), 404

    app.fees_paid = True
    db.session.commit()

    notif = Notification(
        user_id=app.proponent_id,
        title="Payment Confirmed",
        message=f"Payment of ₹{app.fees:,.0f} confirmed for {app.app_id}",
        category="success",
    )
    db.session.add(notif)
    db.session.commit()

    return jsonify({"message": "Payment confirmed", "application": app.to_dict()}), 200


@apps_bp.route("/<int:app_id>/lock", methods=["POST"])
@jwt_required()
def lock_application(app_id):
    """Lock/finalize an application (MoM role)."""
    user = User.query.get(int(get_jwt_identity()))
    if not user or user.role not in ["mom", "admin"]:
        return jsonify({"error": "Only MoM team or admin can lock applications"}), 403

    app = Application.query.get(app_id)
    if not app:
        return jsonify({"error": "Application not found"}), 404

    app.locked = True
    app.status = "Finalized"
    db.session.commit()

    notif = Notification(
        user_id=app.proponent_id,
        title="Application Finalized",
        message=f"Application {app.app_id} has been finalized and locked.",
        category="success",
    )
    db.session.add(notif)
    db.session.commit()

    return jsonify({"message": "Application locked", "application": app.to_dict()}), 200


@apps_bp.route("/stats", methods=["GET"])
@jwt_required()
def stats():
    """Get application statistics for dashboard."""
    total = Application.query.count()
    by_status = {}
    for s in VALID_STATUSES:
        by_status[s] = Application.query.filter_by(status=s).count()

    by_sector = {}
    for sec in VALID_SECTORS:
        by_sector[sec] = Application.query.filter_by(sector=sec).count()

    pending_fees = Application.query.filter_by(fees_paid=False).count()

    return jsonify({
        "stats": {
            "total": total,
            "by_status": by_status,
            "by_sector": by_sector,
            "pending_fees": pending_fees,
        }
    }), 200
