"""Seed script – populates the database with initial data matching the frontend."""

from extensions import db
from models.user import User
from models.application import Application
from models.document import Document
from models.notification import Notification


def seed_database():
    """Insert demo data into the database."""

    print("🌱 Seeding database...")

    # ── Users ──────────────────────────────────────────────────────────
    users_data = [
        {"email": "admin@parivesh.gov.in", "password": "Admin@123", "role": "admin", "name": "System Administrator"},
        {"email": "sharma@infraltd.com", "password": "Pass@123", "role": "proponent", "name": "Rajiv Sharma", "company": "Sharma Infrastructure Ltd."},
        {"email": "scrutiny1@moef.gov.in", "password": "Pass@123", "role": "scrutiny", "name": "Dr. Priya Mehta"},
        {"email": "mom1@moef.gov.in", "password": "Pass@123", "role": "mom", "name": "Arvind Kumar"},
        {"email": "demo@proponent.in", "password": "Pass@123", "role": "proponent", "name": "Demo User", "company": "New Ventures Corp."},
    ]

    created_users = {}
    for u_data in users_data:
        existing = User.query.filter_by(email=u_data["email"]).first()
        if existing:
            created_users[u_data["email"]] = existing
            print(f"  ⏩ User {u_data['email']} already exists, skipping")
            continue

        user = User(
            email=u_data["email"],
            name=u_data["name"],
            role=u_data["role"],
            company=u_data.get("company"),
        )
        user.set_password(u_data["password"])
        db.session.add(user)
        db.session.flush()
        created_users[u_data["email"]] = user
        print(f"  ✅ Created user: {u_data['email']} ({u_data['role']})")

    db.session.commit()

    # ── Applications ───────────────────────────────────────────────────
    sharma = created_users["sharma@infraltd.com"]
    demo = created_users["demo@proponent.in"]
    priya = created_users["scrutiny1@moef.gov.in"]

    apps_data = [
        {
            "app_id": "PAR-2025-001",
            "proponent_id": sharma.id,
            "project": "Iron Ore Mining Project – Jharkhand Block C",
            "sector": "Mining",
            "category": "Category A",
            "status": "Under Scrutiny",
            "fees": 75000,
            "fees_paid": True,
            "docs": ["EIA Report", "Forest Clearance", "NOC"],
        },
        {
            "app_id": "PAR-2025-002",
            "proponent_id": sharma.id,
            "reviewer_id": priya.id,
            "project": "NH-48 Bypass Extension – 42 km",
            "sector": "Infrastructure",
            "category": "Category B1",
            "status": "Referred for Meeting",
            "fees": 45000,
            "fees_paid": True,
            "gist": "Auto-Gist: NH-48 project ready for committee review...",
            "docs": ["Traffic Impact", "EIA Report", "Land Acquisition"],
        },
        {
            "app_id": "PAR-2025-003",
            "proponent_id": demo.id,
            "project": "50 MW Solar Farm – Rajasthan Desert",
            "sector": "Energy",
            "category": "Category B2",
            "status": "EDS Issued",
            "fees": 30000,
            "fees_paid": False,
            "eds_remarks": "Missing: Wildlife Impact Assessment, Final EIA Report, Water Usage Plan",
            "docs": ["Land Lease", "EIA Draft"],
        },
        {
            "app_id": "PAR-2025-004",
            "proponent_id": sharma.id,
            "project": "Port Expansion – Visakhapatnam Terminal",
            "sector": "Coastal Regulation Zone",
            "category": "Category A",
            "status": "MoM Generated",
            "fees": 120000,
            "fees_paid": True,
            "gist": "MEETING GIST\nApp: PAR-2025-004\nProject: Port Expansion – Visakhapatnam\n\n1. Project Overview\nExpansion of existing port terminal.\n\n2. Recommendations\nReferred to EAC for appraisal.",
            "mom": "MINUTES OF THE MEETING\nDate: 25 June 2025\nApp: PAR-2025-004\n\nDecision: Environmental Clearance recommended subject to conditions.\n\n— Signed: MoM Secretariat",
            "docs": ["CRZ Clearance", "Marine Survey", "EIA"],
        },
        {
            "app_id": "PAR-2025-005",
            "proponent_id": sharma.id,
            "project": "Tehri II Hydro Power Project – Uttarakhand",
            "sector": "River Valley",
            "category": "Category A",
            "status": "Finalized",
            "fees": 95000,
            "fees_paid": True,
            "locked": True,
            "gist": "Final gist content...",
            "mom": "FINALIZED MINUTES\nPAR-2025-005 | Tehri II Hydro\n\nEnvironmental Clearance GRANTED\nDate: 20 June 2025\n\nConditions Applied: 14\n\n— LOCKED & FINALIZED —",
            "docs": ["EIA", "Hydrology Report", "Forest NOC", "Wildlife Survey"],
        },
    ]

    for a_data in apps_data:
        existing = Application.query.filter_by(app_id=a_data["app_id"]).first()
        if existing:
            print(f"  ⏩ Application {a_data['app_id']} already exists, skipping")
            continue

        app = Application(
            app_id=a_data["app_id"],
            proponent_id=a_data["proponent_id"],
            reviewer_id=a_data.get("reviewer_id"),
            project=a_data["project"],
            sector=a_data["sector"],
            category=a_data["category"],
            status=a_data["status"],
            fees=a_data["fees"],
            fees_paid=a_data["fees_paid"],
            gist=a_data.get("gist", ""),
            mom=a_data.get("mom", ""),
            eds_remarks=a_data.get("eds_remarks", ""),
            locked=a_data.get("locked", False),
        )
        db.session.add(app)
        db.session.flush()

        # Add documents
        for doc_name in a_data.get("docs", []):
            doc = Document(application_id=app.id, name=doc_name)
            db.session.add(doc)

        print(f"  ✅ Created application: {a_data['app_id']} – {a_data['project'][:40]}...")

    db.session.commit()

    # ── Notifications ──────────────────────────────────────────────────
    admin = created_users["admin@parivesh.gov.in"]

    notifs_data = [
        {"user_id": admin.id, "title": "New project approved", "message": "Mars Colony AR is now live", "category": "success"},
        {"user_id": admin.id, "title": "New comment", "message": "Sarah left feedback on Interior", "category": "info"},
        {"user_id": admin.id, "title": "Team invite accepted", "message": "Mike joined your workspace", "category": "info"},
        {"user_id": admin.id, "title": "System update", "message": "AR engine v2.4 available", "category": "info"},
        {"user_id": sharma.id, "title": "Application Update", "message": "PAR-2025-001 is now Under Scrutiny", "category": "info"},
        {"user_id": sharma.id, "title": "Payment Confirmed", "message": "₹75,000 paid for PAR-2025-001", "category": "success"},
    ]

    existing_notifs = Notification.query.count()
    if existing_notifs == 0:
        for n_data in notifs_data:
            notif = Notification(**n_data)
            db.session.add(notif)
        db.session.commit()
        print(f"  ✅ Created {len(notifs_data)} notifications")
    else:
        print(f"  ⏩ Notifications already exist ({existing_notifs}), skipping")

    print("✅ Database seeding complete!")
