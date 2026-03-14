"""
PARIVESH 3.0 — AI Scrutiny API Routes
Provides endpoints for triggering AI-based document scrutiny on applications.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.application import Application
from models.notification import Notification
from extensions import db
from services.ai_scrutiny import scrutinize_application

scrutiny_bp = Blueprint("scrutiny", __name__, url_prefix="/api/scrutiny")


@scrutiny_bp.route("/<int:app_id>", methods=["POST"])
@jwt_required()
def run_ai_scrutiny(app_id):
    """
    Run AI Auto-Scrutiny on a specific application.
    Cross-references uploaded documents against sector-specific regulatory checklists.
    Returns compliance score, missing docs, EDS text, and recommendation.
    """
    user = User.query.get(int(get_jwt_identity()))
    if not user or user.role not in ["scrutiny", "admin"]:
        return jsonify({"error": "Only scrutiny team or admin can run AI scrutiny"}), 403

    app = Application.query.get(app_id)
    if not app:
        return jsonify({"error": "Application not found"}), 404

    # Get document names from the application
    doc_names = [d.name for d in app.documents.all()]

    # Run the AI scrutiny engine
    result = scrutinize_application(
        sector=app.sector,
        category=app.category,
        documents=doc_names,
        fees_paid=app.fees_paid,
    )

    # Add application context to the result
    result["app_id"] = app.app_id
    result["project"] = app.project
    result["proponent_id"] = app.proponent_id

    # Create notification for the scrutiny officer
    db.session.add(Notification(
        user_id=user.id,
        title="AI Scrutiny Complete",
        message=f"AI Scrutiny for {app.app_id}: {result['score']}% compliant. {result['recommendation_text'][:80]}...",
        category="info" if result["recommendation"] == "PASS" else "warning",
    ))
    db.session.commit()

    return jsonify({"scrutiny_result": result}), 200


@scrutiny_bp.route("/<int:app_id>/auto-eds", methods=["POST"])
@jwt_required()
def auto_issue_eds(app_id):
    """
    Run AI Scrutiny AND automatically issue EDS if documents are missing.
    This is the one-click AI workflow: Scrutinize → Generate EDS → Update Status → Notify Proponent.
    """
    user = User.query.get(int(get_jwt_identity()))
    if not user or user.role not in ["scrutiny", "admin"]:
        return jsonify({"error": "Only scrutiny team or admin can auto-issue EDS"}), 403

    app = Application.query.get(app_id)
    if not app:
        return jsonify({"error": "Application not found"}), 404

    if app.locked:
        return jsonify({"error": "Application is locked/finalized"}), 403

    # Run AI scrutiny
    doc_names = [d.name for d in app.documents.all()]
    result = scrutinize_application(
        sector=app.sector,
        category=app.category,
        documents=doc_names,
        fees_paid=app.fees_paid,
    )

    if result["recommendation"] == "PASS":
        # All docs present — mark ready for meeting referral
        app.status = "Under Scrutiny"
        app.eds_remarks = ""
        db.session.add(Notification(
            user_id=app.proponent_id,
            title="AI Scrutiny Passed",
            message=f"Your application {app.app_id} passed AI scrutiny with 100% compliance. It is now under manual review.",
            category="success",
        ))
        db.session.add(Notification(
            user_id=user.id,
            title="AI Scrutiny — All Clear",
            message=f"{app.app_id} is 100% compliant. Ready for manual verification and meeting referral.",
            category="success",
        ))
    else:
        # Missing docs — auto-issue EDS
        app.status = "EDS Issued"
        app.eds_remarks = result["eds_text"]
        db.session.add(Notification(
            user_id=app.proponent_id,
            title="EDS Issued (AI Auto-Scrutiny)",
            message=f"Your application {app.app_id} has {result['missing_count']} missing document(s). Please check EDS remarks and re-submit.",
            category="warning",
        ))
        db.session.add(Notification(
            user_id=user.id,
            title="AI Auto-EDS Issued",
            message=f"EDS auto-issued for {app.app_id}: {result['missing_count']} missing docs, {result['score']}% compliant.",
            category="info",
        ))

    db.session.commit()

    result["app_id"] = app.app_id
    result["project"] = app.project
    result["new_status"] = app.status

    return jsonify({"scrutiny_result": result, "application": app.to_dict()}), 200


@scrutiny_bp.route("/checklist/<sector>", methods=["GET"])
@jwt_required()
def get_checklist(sector):
    """Get the regulatory checklist for a specific sector."""
    from services.ai_scrutiny import CHECKLISTS, DEFAULT_CHECKLIST, EDS_REMARKS
    checklist = CHECKLISTS.get(sector, DEFAULT_CHECKLIST)
    items = []
    for doc in checklist:
        items.append({
            "document": doc,
            "eds_remark": EDS_REMARKS.get(doc, f"PP shall submit {doc}."),
        })
    return jsonify({"sector": sector, "checklist": items, "total": len(items)}), 200
