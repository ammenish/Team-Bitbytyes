from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.notification import Notification
from models.user import User
from extensions import db

notifs_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")


@notifs_bp.route("/", methods=["GET"])
@jwt_required()
def list_notifications():
    """Get notifications for current user."""
    user_id = int(get_jwt_identity())
    unread_only = request.args.get("unread", "false").lower() == "true"

    query = Notification.query.filter_by(user_id=user_id)
    if unread_only:
        query = query.filter_by(is_read=False)

    notifs = query.order_by(Notification.created_at.desc()).limit(50).all()
    unread_count = Notification.query.filter_by(user_id=user_id, is_read=False).count()

    return jsonify({
        "notifications": [n.to_dict() for n in notifs],
        "unread_count": unread_count,
    }), 200


@notifs_bp.route("/<int:notif_id>/read", methods=["PUT"])
@jwt_required()
def mark_read(notif_id):
    """Mark a notification as read."""
    user_id = int(get_jwt_identity())
    notif = Notification.query.get(notif_id)

    if not notif or notif.user_id != user_id:
        return jsonify({"error": "Notification not found"}), 404

    notif.is_read = True
    db.session.commit()
    return jsonify({"message": "Marked as read"}), 200


@notifs_bp.route("/read-all", methods=["PUT"])
@jwt_required()
def mark_all_read():
    """Mark all notifications as read for current user."""
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All notifications marked as read"}), 200


@notifs_bp.route("/<int:notif_id>", methods=["DELETE"])
@jwt_required()
def delete_notification(notif_id):
    """Delete a notification."""
    user_id = int(get_jwt_identity())
    notif = Notification.query.get(notif_id)

    if not notif or notif.user_id != user_id:
        return jsonify({"error": "Notification not found"}), 404

    db.session.delete(notif)
    db.session.commit()
    return jsonify({"message": "Notification deleted"}), 200
