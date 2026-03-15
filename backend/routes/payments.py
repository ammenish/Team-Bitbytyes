"""
Payment Routes — Razorpay integration for fee payments.
Supports order creation, payment verification, and QR code generation.
"""

from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
import hmac
import hashlib
import io
import os
import requests

from extensions import db
from models.application import Application

payments_bp = Blueprint("payments", __name__, url_prefix="/api/payments")

# ── Cashfree configuration (uses test keys from .env) ────────────────────────────
CASHFREE_APP_ID = os.getenv("CASHFREE_APP_ID", "cf_test_PLACEHOLDER")
CASHFREE_SECRET_KEY = os.getenv("CASHFREE_SECRET_KEY", "PLACEHOLDER_SECRET")
CASHFREE_ENV = os.getenv("CASHFREE_ENV", "TEST") # TEST or PROD


@payments_bp.route("/create-order", methods=["POST"])
@jwt_required()
def create_order():
    """Create a Cashfree order for an application's fees."""
    body = request.get_json()
    app_id = body.get("app_db_id")

    if not app_id:
        return jsonify({"error": "app_db_id is required"}), 400

    application = Application.query.get_or_404(app_id)

    if application.fees_paid:
        return jsonify({"error": "Fees already paid for this application"}), 400

    amount_inr = application.fees or 5000  # Default ₹5000 if not set

    if CASHFREE_APP_ID == "cf_test_PLACEHOLDER":
        # Auto-fallback to Mock Payment Gateway
        return jsonify({
            "order_id": f"mock_order_{application.app_id}_{application.id}",
            "amount_inr": amount_inr,
            "currency": "INR",
            "app_id": application.app_id,
            "project": application.project,
            "description": f"PARIVESH Fee — {application.app_id} ({application.sector})",
            "is_mock": True
        }), 200

    # Real Cashfree Integration Structure
    url = "https://sandbox.cashfree.com/pg/orders" if CASHFREE_ENV == "TEST" else "https://api.cashfree.com/pg/orders"
    headers = {
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json"
    }
    
    order_id = f"CF_{application.app_id}"
    
    payload = {
        "order_id": order_id,
        "order_amount": amount_inr,
        "order_currency": "INR",
        "customer_details": {
            "customer_id": f"cust_{application.id}",
            "customer_phone": "9999999999" # In a real app, pull from application.owner
        },
        "order_meta": {
            "return_url": "http://localhost:5173/payments?order_id={order_id}"
        }
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        data = response.json()
        
        if response.status_code == 200:
            return jsonify({
                "order_id": data["order_id"],
                "payment_session_id": data["payment_session_id"],
                "amount_inr": amount_inr,
                "currency": "INR",
                "app_id": application.app_id,
                "project": application.project,
                "description": f"PARIVESH Fee — {application.app_id}",
                "is_mock": False
            }), 200
        else:
            return jsonify({"error": "Failed to create Cashfree order", "details": data}), 500
    except Exception as e:
        return jsonify({"error": f"Failed to connect to Cashfree: {str(e)}"}), 500


@payments_bp.route("/verify", methods=["POST"])
@jwt_required()
def verify_payment():
    """Verify a Cashfree payment."""
    body = request.get_json()
    cf_order_id = body.get("cf_order_id")
    cf_payment_id = body.get("cf_payment_id")
    app_db_id = body.get("app_db_id")

    if not all([cf_order_id, cf_payment_id, app_db_id]):
        return jsonify({"error": "Missing required payment verification fields"}), 400

    # Verify signature
    if str(cf_order_id).startswith("mock_order_"):
        pass # Automatically accept mock payments for hackathon demo
    else:
        # In a real Cashfree flow, you would verify the signature using the Cashfree public key
        # or call their GET /pg/orders/{order_id}/payments API to verify status.
        return jsonify({"error": "Real signature verification not implemented in demo"}), 400

    # Mark application as paid
    application = Application.query.get_or_404(app_db_id)
    application.fees_paid = True
    db.session.commit()

    # Send notification
    try:
        from services.notification_service import send_smart_notification
        if application.owner:
            send_smart_notification(
                user=application.owner,
                title=f"✅ Payment Received: {application.app_id}",
                message=f"₹{application.fees:,.0f} fee payment confirmed for '{application.project}'. Transaction ID: {razorpay_payment_id}",
                category="success"
            )
    except Exception:
        pass  # Non-critical

    return jsonify({
        "status": "success",
        "message": "Payment verified and recorded",
        "payment_id": razorpay_payment_id,
        "app_id": application.app_id,
    }), 200


@payments_bp.route("/qr/<int:app_db_id>", methods=["GET"])
@jwt_required()
def generate_qr(app_db_id):
    """Generate a UPI QR code for an application's fees."""
    application = Application.query.get_or_404(app_db_id)
    amount = application.fees or 5000

    # UPI deep link format mapped for generic/cashfree simulation
    upi_string = f"upi://pay?pa=parivesh@cashfree&pn=PARIVESH+3.0&am={amount}&cu=INR&tn=Fee+for+{application.app_id}"

    try:
        import qrcode
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(upi_string)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#0a2463", back_color="white")

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)

        return send_file(buf, mimetype="image/png", download_name=f"qr_{application.app_id}.png")

    except Exception as e:
        return jsonify({"error": f"QR generation failed: {str(e)}"}), 500


@payments_bp.route("/config", methods=["GET"])
def get_payment_config():
    """Return the Cashfree App ID for frontend initialization."""
    return jsonify({
        "app_id": CASHFREE_APP_ID,
        "configured": CASHFREE_APP_ID != "cf_test_PLACEHOLDER"
    }), 200
