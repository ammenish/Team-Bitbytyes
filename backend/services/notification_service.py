"""
Notification Service — Email + In-App notifications on workflow changes.
Uses SMTP (Gmail) for email. Falls back to console logging.
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime


# Email config from environment
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
FROM_NAME = "PARIVESH 3.0 — CECB"


def send_email(to_email, subject, html_body):
    """Send an email notification. Falls back to console if SMTP not configured."""
    if not SMTP_USER or not SMTP_PASS:
        print(f"📧 [EMAIL MOCK] To: {to_email}")
        print(f"   Subject: {subject}")
        print(f"   Body: {html_body[:200]}...")
        return {"sent": False, "mock": True, "reason": "SMTP not configured"}

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = f"{FROM_NAME} <{SMTP_USER}>"
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)

        print(f"📧 [EMAIL SENT] To: {to_email} | Subject: {subject}")
        return {"sent": True, "mock": False}
    except Exception as e:
        print(f"📧 [EMAIL FAILED] To: {to_email} | Error: {e}")
        return {"sent": False, "mock": False, "error": str(e)}


def notify_status_change(user_email, user_name, app_id, project, old_status, new_status):
    """Send notification when application status changes."""
    subject = f"[PARIVESH 3.0] Application {app_id} — Status Updated to {new_status}"

    status_colors = {
        "Draft": "#9ca3af",
        "Submitted": "#3b82f6",
        "Under Scrutiny": "#f59e0b",
        "EDS Issued": "#ef4444",
        "Referred for Meeting": "#8b5cf6",
        "MoM Generated": "#10b981",
        "Finalized": "#059669",
    }

    color = status_colors.get(new_status, "#3b82f6")

    html = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0c3320, #064e2b); padding: 24px 32px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #05c46b; font-size: 20px; margin: 0;">🌿 PARIVESH 3.0</h1>
            <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 4px 0 0;">Environmental Clearance Management Portal — CECB</p>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #e2e8f0;">
            <p style="font-size: 15px; color: #334155;">Dear <strong>{user_name}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                Your application status has been updated:
            </p>
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
                <div style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Application</div>
                <div style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 4px 0;">{app_id}</div>
                <div style="font-size: 13px; color: #475569; margin-bottom: 12px;">{project}</div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="background: #e2e8f0; color: #64748b; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-decoration: line-through;">{old_status}</span>
                    <span style="color: #94a3b8;">→</span>
                    <span style="background: {color}22; color: {color}; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;">{new_status}</span>
                </div>
            </div>
            <p style="font-size: 13px; color: #64748b;">
                Log in to your PARIVESH 3.0 dashboard to view details and take any required action.
            </p>
        </div>
        <div style="background: #f1f5f9; padding: 16px 32px; border-radius: 0 0 12px 12px; text-align: center;">
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                CECB — Chhattisgarh Environment Conservation Board | Toll Free: 1800 11 9792
            </p>
        </div>
    </div>
    """

    return send_email(user_email, subject, html)


def notify_eds_issued(user_email, user_name, app_id, project, eds_points):
    """Send notification when EDS is issued."""
    subject = f"[PARIVESH 3.0] EDS Issued — Application {app_id}"

    points_html = "".join(
        f'<li style="font-size: 13px; color: #475569; margin-bottom: 8px;">{p}</li>'
        for p in (eds_points if isinstance(eds_points, list) else eds_points.split(", "))
    )

    html = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0c3320, #064e2b); padding: 24px 32px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #05c46b; font-size: 20px; margin: 0;">🌿 PARIVESH 3.0</h1>
            <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 4px 0 0;">Essential Document Sought Notice</p>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #e2e8f0;">
            <p style="font-size: 15px; color: #334155;">Dear <strong>{user_name}</strong>,</p>
            <p style="font-size: 14px; color: #475569;">
                An EDS (Essential Document Sought) notice has been issued for your application <strong>{app_id}</strong> — "{project}".
            </p>
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <div style="font-size: 13px; font-weight: 700; color: #991b1b; margin-bottom: 8px;">⚠ Documents / Information Required:</div>
                <ol style="margin: 0; padding-left: 20px;">{points_html}</ol>
            </div>
            <p style="font-size: 13px; color: #64748b;">
                Please submit the above documents at the earliest to avoid delay in processing.
            </p>
        </div>
        <div style="background: #f1f5f9; padding: 16px 32px; border-radius: 0 0 12px 12px; text-align: center;">
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                CECB — Chhattisgarh Environment Conservation Board | Toll Free: 1800 11 9792
            </p>
        </div>
    </div>
    """

    return send_email(user_email, subject, html)


def notify_sla_breach(user_email, user_name, app_id, project, days_overdue, stage):
    """Send SLA breach escalation notification."""
    subject = f"⚠ [SLA BREACH] Application {app_id} — {days_overdue} days overdue at {stage}"

    html = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #991b1b, #dc2626); padding: 24px 32px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #fff; font-size: 20px; margin: 0;">⚠ SLA BREACH ALERT</h1>
            <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 4px 0 0;">PARIVESH 3.0 — Auto-Escalation System</p>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #fecaca;">
            <p style="font-size: 15px; color: #334155;">Dear <strong>{user_name}</strong>,</p>
            <p style="font-size: 14px; color: #475569;">
                Application <strong>{app_id}</strong> has exceeded its SLA deadline.
            </p>
            <div style="background: #fef2f2; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <div><strong>Project:</strong> {project}</div>
                <div><strong>Current Stage:</strong> {stage}</div>
                <div><strong>Days Overdue:</strong> <span style="color: #dc2626; font-weight: 800;">{days_overdue} days</span></div>
            </div>
            <p style="font-size: 13px; color: #ef4444; font-weight: 600;">
                Immediate action required. This has been auto-escalated.
            </p>
        </div>
    </div>
    """

    return send_email(user_email, subject, html)
