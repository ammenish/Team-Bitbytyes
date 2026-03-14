from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from extensions import db

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


@users_bp.route("/", methods=["GET"])
@jwt_required()
def list_users():
    """List all users (admin only)."""
    current_user = User.query.get(int(get_jwt_identity()))
    if not current_user or current_user.role != "admin":
        return jsonify({"error": "Admin access required"}), 403

    role_filter = request.args.get("role")
    query = User.query

    if role_filter:
        query = query.filter_by(role=role_filter)

    users = query.order_by(User.created_at.desc()).all()
    return jsonify({"users": [u.to_dict() for u in users]}), 200


@users_bp.route("/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    """Get a specific user's details."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"user": user.to_dict()}), 200


@users_bp.route("/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    """Update a user (self or admin)."""
    current_user = User.query.get(int(get_jwt_identity()))
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Only self or admin can update
    if current_user.id != user.id and current_user.role != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    updatable = ["name", "company", "phone", "avatar_url"]

    for field in updatable:
        if field in data:
            setattr(user, field, data[field])

    # Only admin can change role or active status
    if current_user.role == "admin":
        if "role" in data:
            user.role = data["role"]
        if "is_active" in data:
            user.is_active = data["is_active"]

    if "password" in data:
        user.set_password(data["password"])

    db.session.commit()
    return jsonify({"message": "User updated", "user": user.to_dict()}), 200


@users_bp.route("/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    """Deactivate a user (admin only)."""
    current_user = User.query.get(int(get_jwt_identity()))
    if not current_user or current_user.role != "admin":
        return jsonify({"error": "Admin access required"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.is_active = False
    db.session.commit()
    return jsonify({"message": f"User {user.email} deactivated"}), 200


@users_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    """Get current user's profile with stats."""
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404

    profile_data = user.to_dict()
    profile_data["stats"] = {
        "projects": user.applications.count() if user.role == "proponent" else 0,
        "reviews": user.assigned_reviews.count() if user.role in ["scrutiny", "mom"] else 0,
    }

    return jsonify({"profile": profile_data}), 200
