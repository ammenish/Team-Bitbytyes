"""
SLA Background Scheduler — Automatically checks for SLA breaches every night.
Uses APScheduler with a BackgroundScheduler running alongside the Flask app.
"""

from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# ── SLA Configuration (days per stage) ──────────────────────────────────────
SLA_LIMITS = {
    "Submitted": 3,
    "Under Scrutiny": 7,
    "EDS Issued": 14,
    "Referred for Meeting": 5,
    "MoM Generated": 7,
}


def run_sla_check(app):
    """
    Core SLA check logic — runs inside an app context.
    Scans all active applications, finds overdue ones, and sends notifications.
    """
    with app.app_context():
        from models.application import Application
        from models.user import User
        from services.notification_service import send_smart_notification
        from extensions import db

        logger.info("🕐 [SLA Scheduler] Running automatic SLA breach check...")

        apps = Application.query.filter(
            Application.status.notin_(["Finalized", "Draft"])
        ).all()

        escalated = []
        admin = User.query.filter_by(role="admin").first()

        for a in apps:
            sla_limit = SLA_LIMITS.get(a.status, 7)
            last_update = a.updated_at or a.created_at
            days_in_stage = (datetime.utcnow() - last_update).days if last_update else 0

            if days_in_stage > sla_limit:
                days_overdue = days_in_stage - sla_limit

                # Notify admin
                if admin:
                    send_smart_notification(
                        user=admin,
                        title=f"⚠ SLA Breach (Auto-Check): {a.app_id}",
                        message=f"Application {a.project} is {days_overdue} day(s) overdue at '{a.status}' stage. Auto-detected by the nightly scheduler.",
                        category="warning"
                    )

                # Notify proponent (relationship is 'owner')
                if a.owner:
                    send_smart_notification(
                        user=a.owner,
                        title=f"⚠ SLA Breach Warning: {a.app_id}",
                        message=f"Your application '{a.project}' is {days_overdue} day(s) overdue for the '{a.status}' stage. Immediate action may be required.",
                        category="warning"
                    )

                # Notify assigned reviewer (relationship is 'reviewer_user')
                if a.reviewer_user:
                    send_smart_notification(
                        user=a.reviewer_user,
                        title=f"⏳ Pending Action - High Priority: {a.app_id}",
                        message=f"The application '{a.project}' you are reviewing is {days_overdue} day(s) overdue in your queue.",
                        category="warning"
                    )

                escalated.append(a.app_id)

        db.session.commit()

        if escalated:
            logger.warning(f"🚨 [SLA Scheduler] {len(escalated)} application(s) breached SLA: {', '.join(escalated)}")
        else:
            logger.info("✅ [SLA Scheduler] All applications are within SLA limits.")


# ── Scheduler singleton ────────────────────────────────────────────────────
_scheduler = None


def init_sla_scheduler(app):
    """
    Initialize and start the APScheduler background job.
    Runs the SLA check:
      - Once at server startup (after a 30-second delay)
      - Every day at midnight (00:00)
    """
    global _scheduler

    # Avoid double-scheduling in Flask debug reloader
    import os
    if os.environ.get("WERKZEUG_RUN_MAIN") != "true" and app.debug:
        return

    if _scheduler is not None:
        return

    _scheduler = BackgroundScheduler(daemon=True)

    # Nightly check at midnight
    _scheduler.add_job(
        func=run_sla_check,
        trigger="cron",
        hour=0,
        minute=0,
        args=[app],
        id="sla_nightly_check",
        name="Nightly SLA Breach Check",
        replace_existing=True,
        misfire_grace_time=3600,
    )

    # Also run once 30 seconds after startup for immediate feedback
    from datetime import timedelta
    _scheduler.add_job(
        func=run_sla_check,
        trigger="date",
        run_date=datetime.now() + timedelta(seconds=30),
        args=[app],
        id="sla_startup_check",
        name="Startup SLA Check",
        replace_existing=True,
    )

    _scheduler.start()
    logger.info("⏰ [SLA Scheduler] Background scheduler started — nightly checks at 00:00")
    print("⏰ [SLA Scheduler] Background scheduler started — nightly checks at 00:00")
