"""
AI Routes — Auto-scrutiny, Gist generation, MoM generation, Analytics, SLA.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import json
import os

from extensions import db
from models.application import Application
from models.user import User
from models.notification import Notification
from services.ai_service import auto_scrutiny, generate_meeting_gist, generate_mom, get_sector_checklist, update_sector_checklist, get_templates, update_template, CHECKLISTS, EDS_POINTS, AFFIDAVITS
from services.notification_service import notify_status_change, notify_eds_issued, notify_sla_breach

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")


# ── SLA Configuration (days per stage) ─────────────────────────────────────────
SLA_LIMITS = {
    "Submitted": 3,
    "Under Scrutiny": 7,
    "EDS Issued": 14,
    "Referred for Meeting": 5,
    "MoM Generated": 7,
}


# ── Auto-Scrutiny ──────────────────────────────────────────────────────────────
@ai_bp.route("/scrutiny/<int:app_db_id>", methods=["POST"])
@jwt_required()
def ai_scrutiny(app_db_id):
    """AI-powered document scrutiny for an application."""
    app = Application.query.get_or_404(app_db_id)
    body = request.get_json(silent=True) or {}

    # Get documents from DB first, fallback to request body
    db_docs = [{"name": d.name} for d in app.documents]
    if not db_docs:
        # Use frontend-provided document names
        frontend_docs = body.get("documents", [])
        db_docs = [{"name": d} if isinstance(d, str) else d for d in frontend_docs]

    app_data = {
        "app_id": app.app_id,
        "project": app.project,
        "sector": app.sector,
        "category": app.category,
        "documents": db_docs,
        "status": app.status,
        "fees": app.fees,
        "fees_paid": app.fees_paid,
        "eds_remarks": app.eds_remarks,
    }

    result = auto_scrutiny(app_data)
    return jsonify(result), 200


# ── Generate Gist ──────────────────────────────────────────────────────────────
@ai_bp.route("/generate-gist/<int:app_db_id>", methods=["POST"])
@jwt_required()
def ai_generate_gist(app_db_id):
    """Generate meeting gist using AI."""
    app = Application.query.get_or_404(app_db_id)
    body = request.get_json(silent=True) or {}

    app_data = {
        "app_id": app.app_id,
        "project": app.project,
        "sector": app.sector,
        "category": app.category,
        "proponent": app.owner.company or app.owner.name if app.owner else "N/A",
        "documents": [{"name": d.name} for d in app.documents],
        "status": app.status,
        "fees": app.fees,
        "eds_remarks": app.eds_remarks,
    }

    result = generate_meeting_gist(app_data, template=body.get("template"))

    # Save gist to application
    app.gist = result["gist"]
    db.session.commit()

    return jsonify(result), 200


# ── Generate MoM ──────────────────────────────────────────────────────────────
@ai_bp.route("/generate-mom/<int:app_db_id>", methods=["POST"])
@jwt_required()
def ai_generate_mom(app_db_id):
    """Generate Minutes of Meeting using AI."""
    app = Application.query.get_or_404(app_db_id)

    if app.locked:
        return jsonify({"error": "Application is locked. MoM cannot be regenerated."}), 400

    app_data = {
        "app_id": app.app_id,
        "project": app.project,
        "sector": app.sector,
        "category": app.category,
        "proponent": app.owner.company or app.owner.name if app.owner else "N/A",
        "documents": [{"name": d.name} for d in app.documents],
        "status": app.status,
        "fees": app.fees,
    }

    result = generate_mom(app_data, gist_text=app.gist or "")

    # Save MoM to application
    app.mom = result["mom"]
    if app.status == "Referred for Meeting":
        app.status = "MoM Generated"
    db.session.commit()

    return jsonify(result), 200


# ── Get Reference Data ─────────────────────────────────────────────────────────
@ai_bp.route("/checklists", methods=["GET"])
def get_checklists():
    """Return all sector checklists."""
    return jsonify(CHECKLISTS), 200


@ai_bp.route("/checklists/<sector>", methods=["GET"])
def get_checklist_for_sector(sector):
    """Return checklist for a specific sector."""
    checklist = get_sector_checklist(sector)
    return jsonify({"sector": sector, "checklist": checklist}), 200


@ai_bp.route("/checklists/<sector>", methods=["PUT"])
@jwt_required()
def update_checklist_for_sector(sector):
    """Update checklist for a specific sector (Admin only)."""
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    if not user or user.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403
        
    data = request.get_json()
    if not data or "checklist" not in data:
        return jsonify({"error": "Checklist data is required"}), 400
        
    checklist = data.get("checklist")
    if not isinstance(checklist, list):
        return jsonify({"error": "Checklist must be an array of strings"}), 400
        
    success = update_sector_checklist(sector, checklist)
    if success:
        return jsonify({"message": f"Checklist for {sector} updated successfully."}), 200
    return jsonify({"error": "Failed to update checklist"}), 500
    return jsonify({"error": "Failed to update checklist"}), 500


@ai_bp.route("/templates", methods=["GET"])
def list_templates():
    """Return all gist templates."""
    return jsonify(get_templates()), 200


@ai_bp.route("/templates/<int:template_id>", methods=["PUT"])
@jwt_required()
def update_template_route(template_id):
    """Update a specific gist template (Admin only)."""
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    if not user or user.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403
        
    data = request.get_json()
    if not data:
        return jsonify({"error": "Template data is required"}), 400
        
    updated = update_template(template_id, data)
    if updated:
        return jsonify({"message": f"Template {template_id} updated successfully.", "template": updated}), 200
    return jsonify({"error": "Failed to update template or not found"}), 404

@ai_bp.route("/eds-points", methods=["GET"])
def get_eds_points():
    """Return all standard EDS points."""
    return jsonify(EDS_POINTS), 200


@ai_bp.route("/affidavits", methods=["GET"])
def get_affidavits():
    """Return all affidavit templates."""
    return jsonify(AFFIDAVITS), 200


# ── Live Analytics ─────────────────────────────────────────────────────────────
@ai_bp.route("/analytics", methods=["GET"])
@jwt_required()
def get_analytics():
    """Comprehensive analytics for the admin dashboard."""
    apps = Application.query.all()

    # Status distribution
    status_dist = {}
    for a in apps:
        status_dist[a.status] = status_dist.get(a.status, 0) + 1

    # Sector distribution
    sector_dist = {}
    for a in apps:
        sector_dist[a.sector] = sector_dist.get(a.sector, 0) + 1

    # Category distribution
    category_dist = {}
    for a in apps:
        category_dist[a.category] = category_dist.get(a.category, 0) + 1

    # Fee collection stats
    total_fees = sum(a.fees for a in apps)
    collected_fees = sum(a.fees for a in apps if a.fees_paid)
    pending_fees = total_fees - collected_fees

    # Monthly trends (based on created_at)
    monthly = {}
    for a in apps:
        if a.created_at:
            month_key = a.created_at.strftime("%Y-%m")
            monthly[month_key] = monthly.get(month_key, 0) + 1

    # SLA compliance
    sla_data = _compute_sla_data(apps)

    # Regional/State heatmap data (simulated from sectors for demo)
    heatmap = _generate_heatmap_data(apps)

    # Processing time stats
    avg_processing = _compute_avg_processing(apps)

    return jsonify({
        "total_applications": len(apps),
        "status_distribution": status_dist,
        "sector_distribution": sector_dist,
        "category_distribution": category_dist,
        "fee_stats": {
            "total": total_fees,
            "collected": collected_fees,
            "pending": pending_fees,
            "collection_rate": round(collected_fees / max(total_fees, 1) * 100, 1)
        },
        "monthly_trends": monthly,
        "sla_compliance": sla_data,
        "heatmap": heatmap,
        "avg_processing_days": avg_processing,
    }), 200


# ── SLA Dashboard ──────────────────────────────────────────────────────────────
@ai_bp.route("/sla", methods=["GET"])
@jwt_required()
def get_sla_status():
    """Get SLA status for all active applications."""
    apps = Application.query.filter(
        Application.status.notin_(["Finalized", "Draft"])
    ).all()

    sla_items = []
    for a in apps:
        sla_limit = SLA_LIMITS.get(a.status, 7)
        days_in_stage = (datetime.utcnow() - (a.updated_at or a.created_at)).days if (a.updated_at or a.created_at) else 0
        days_remaining = sla_limit - days_in_stage
        is_overdue = days_remaining < 0

        if days_remaining < 0:
            urgency = "CRITICAL"
            color = "#dc2626"
        elif days_remaining <= 2:
            urgency = "WARNING"
            color = "#f59e0b"
        else:
            urgency = "ON_TRACK"
            color = "#10b981"

        sla_items.append({
            "app_id": a.app_id,
            "db_id": a.id,
            "project": a.project,
            "sector": a.sector,
            "status": a.status,
            "sla_limit_days": sla_limit,
            "days_in_stage": days_in_stage,
            "days_remaining": days_remaining,
            "is_overdue": is_overdue,
            "urgency": urgency,
            "urgency_color": color,
        })

    # Sort by urgency (critical first)
    urgency_order = {"CRITICAL": 0, "WARNING": 1, "ON_TRACK": 2}
    sla_items.sort(key=lambda x: (urgency_order.get(x["urgency"], 3), x["days_remaining"]))

    # Summary
    total = len(sla_items)
    critical = sum(1 for s in sla_items if s["urgency"] == "CRITICAL")
    warning = sum(1 for s in sla_items if s["urgency"] == "WARNING")
    on_track = sum(1 for s in sla_items if s["urgency"] == "ON_TRACK")

    return jsonify({
        "items": sla_items,
        "summary": {
            "total": total,
            "critical": critical,
            "warning": warning,
            "on_track": on_track,
            "compliance_rate": round(on_track / max(total, 1) * 100, 1)
        }
    }), 200


# ── SLA Auto-Escalation ───────────────────────────────────────────────────────
@ai_bp.route("/sla/escalate", methods=["POST"])
@jwt_required()
def sla_auto_escalate():
    """Check all applications for SLA breaches and auto-escalate."""
    apps = Application.query.filter(
        Application.status.notin_(["Finalized", "Draft"])
    ).all()

    escalated = []
    admin = User.query.filter_by(role="admin").first()

    for a in apps:
        sla_limit = SLA_LIMITS.get(a.status, 7)
        days_in_stage = (datetime.utcnow() - (a.updated_at or a.created_at)).days if (a.updated_at or a.created_at) else 0

        if days_in_stage > sla_limit:
            days_overdue = days_in_stage - sla_limit

            # Create in-app notification
            notif = Notification(
                user_id=admin.id if admin else 1,
                title=f"⚠ SLA Breach: {a.app_id}",
                message=f"{a.project} is {days_overdue} day(s) overdue at {a.status} stage.",
                category="warning"
            )
            db.session.add(notif)

            # Send email to admin
            if admin:
                notify_sla_breach(
                    admin.email, admin.name,
                    a.app_id, a.project,
                    days_overdue, a.status
                )

            # Also notify proponent
            if a.proponent:
                notify_sla_breach(
                    a.proponent.email, a.proponent.name,
                    a.app_id, a.project,
                    days_overdue, a.status
                )

            escalated.append({
                "app_id": a.app_id,
                "project": a.project,
                "status": a.status,
                "days_overdue": days_overdue
            })

    db.session.commit()

    return jsonify({
        "escalated_count": len(escalated),
        "escalated": escalated,
        "message": f"Auto-escalation complete. {len(escalated)} applications flagged."
    }), 200


# ── Trigger Email Notification ─────────────────────────────────────────────────
@ai_bp.route("/notify/status-change", methods=["POST"])
@jwt_required()
def trigger_status_notification():
    """Manually trigger a status change notification."""
    body = request.get_json()
    app_db_id = body.get("app_db_id")
    old_status = body.get("old_status", "")
    new_status = body.get("new_status", "")

    app = Application.query.get_or_404(app_db_id)
    user = app.proponent

    if user:
        result = notify_status_change(
            user.email, user.name,
            app.app_id, app.project,
            old_status, new_status
        )
        return jsonify({"notification": result}), 200

    return jsonify({"error": "No proponent found for this application"}), 404


# ── Helper Functions ───────────────────────────────────────────────────────────

def _compute_sla_data(apps):
    """Compute SLA compliance statistics."""
    active = [a for a in apps if a.status not in ("Finalized", "Draft")]
    if not active:
        return {"compliant": 0, "breach": 0, "rate": 100}

    breached = 0
    for a in active:
        sla_limit = SLA_LIMITS.get(a.status, 7)
        days = (datetime.utcnow() - (a.updated_at or a.created_at)).days if (a.updated_at or a.created_at) else 0
        if days > sla_limit:
            breached += 1

    return {
        "compliant": len(active) - breached,
        "breach": breached,
        "rate": round((len(active) - breached) / len(active) * 100, 1)
    }


def _generate_heatmap_data(apps):
    """Generate state-level heatmap data for Chhattisgarh districts."""
    # Map sectors to simulated districts for demo
    districts = {
        "Raipur": {"applications": 0, "approved": 0, "lat": 21.2514, "lng": 81.6296},
        "Bilaspur": {"applications": 0, "approved": 0, "lat": 22.0796, "lng": 82.1391},
        "Durg": {"applications": 0, "approved": 0, "lat": 21.1904, "lng": 81.2849},
        "Korba": {"applications": 0, "approved": 0, "lat": 22.3595, "lng": 82.7501},
        "Jagdalpur": {"applications": 0, "approved": 0, "lat": 19.0833, "lng": 82.0167},
        "Raigarh": {"applications": 0, "approved": 0, "lat": 21.8974, "lng": 83.3950},
        "Ambikapur": {"applications": 0, "approved": 0, "lat": 23.1186, "lng": 83.1986},
        "Rajnandgaon": {"applications": 0, "approved": 0, "lat": 21.0971, "lng": 81.0320},
        "Koriya": {"applications": 0, "approved": 0, "lat": 23.2500, "lng": 82.5833},
        "Janjgir": {"applications": 0, "approved": 0, "lat": 22.0094, "lng": 82.5779},
        "Mahasamund": {"applications": 0, "approved": 0, "lat": 21.1083, "lng": 82.0973},
        "Dhamtari": {"applications": 0, "approved": 0, "lat": 20.7077, "lng": 81.5497},
    }

    # Distribute apps across districts for demo
    dist_names = list(districts.keys())
    for i, a in enumerate(apps):
        d = dist_names[i % len(dist_names)]
        districts[d]["applications"] += 1
        if a.status == "Finalized":
            districts[d]["approved"] += 1

    # Add density based on application count
    max_apps = max((d["applications"] for d in districts.values()), default=1)
    for d in districts.values():
        d["density"] = round(d["applications"] / max(max_apps, 1), 2)

    return districts


def _compute_avg_processing(apps):
    """Compute average processing time for completed applications."""
    finalized = [a for a in apps if a.status == "Finalized" and a.created_at and a.updated_at]
    if not finalized:
        return 18  # Default demo value

    total_days = sum((a.updated_at - a.created_at).days for a in finalized)
    return round(total_days / len(finalized), 1)
