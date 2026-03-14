import csv
import sys
from datetime import datetime, timezone
import random

from app import create_app
from extensions import db
from models.user import User
from models.application import Application

def import_csv(file_path):
    app = create_app()
    with app.app_context():
        # Clean existing mock apps if any
        # Avoid deleting the admin testing apps if you want, but for demo let's not delete.
        
        # Get proponent user
        admin = User.query.filter_by(role='admin').first()
        scrutiny = User.query.filter_by(role='scrutiny').first()
        mom = User.query.filter_by(role='mom').first()
        
        # If no users, we should create a basic proponent
        proponent_cache = {}
        
        def get_or_create_proponent(company_name):
            if company_name in proponent_cache:
                return proponent_cache[company_name]
            
            email = company_name.replace(" ", "").lower() + "@example.com"
            user = User.query.filter_by(email=email).first()
            if not user:
                user = User(
                    email=email,
                    name=company_name + " Rep",
                    company=company_name,
                    role="proponent"
                )
                user.set_password("Pass@123")
                db.session.add(user)
                db.session.flush() # get ID
            proponent_cache[company_name] = user
            return user
        
        
        apps_to_add = []
        app_counter = 1000
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row_idx, row in enumerate(reader):
                    proponent_agency = row['proponent_agency']
                    project_location = row['project_location']
                    project_type = row['project_type']
                    area_hectare = row.get('area_hectare', '0')
                    submission_date = row.get('submission_date', '')
                    approval_status = row.get('approval_status', 'Submitted')
                    eds_count = row.get('eds_count', '0')
                    risk_score = row.get('environmental_risk_score', '0')
                    
                    user = get_or_create_proponent(proponent_agency)
                    
                    # Compute Category
                    area = float(area_hectare) if area_hectare else 0
                    cat = "Category A" if area > 10 else "Category B1"
                    
                    app_id = f"PAR-2024-{str(app_counter).zfill(4)}"
                    app_counter += 1
                    
                    # Create Project Name
                    proj_name = f"{project_type} in {project_location} ({area_hectare} Ha) [Risk: {risk_score}]"
                    
                    # Parse Date
                    try:
                        cr_date = datetime.strptime(submission_date, "%Y-%m-%d")
                    except ValueError:
                        cr_date = datetime.now(timezone.utc)
                    
                    reviewer_id = None
                    if approval_status in ['Under Scrutiny', 'EDS Issued', 'EDS']:
                        reviewer_id = scrutiny.id if scrutiny else admin.id
                        approval_status = approval_status if approval_status != 'EDS' else 'EDS Issued'
                    elif approval_status in ['Referred', 'Referred for Meeting', 'MoM Generated']:
                        reviewer_id = mom.id if mom else admin.id
                        approval_status = approval_status if approval_status != 'Referred' else 'Referred for Meeting'
                    elif approval_status == "Approved":
                        approval_status = "Finalized"
                    elif approval_status in ['Rejected']:
                        approval_status = "Rejected"
                    else:
                        approval_status = "Submitted"
                    
                    application = Application(
                        app_id=app_id,
                        project=proj_name,
                        sector=project_type,
                        category=cat,
                        status=approval_status,
                        fees=random.choice([0, 50000, 100000]),
                        fees_paid=random.choice([True, False]),
                        proponent_id=user.id,
                        reviewer_id=reviewer_id,
                        created_at=cr_date,
                        updated_at=cr_date,
                        eds_remarks=f"Historical EDS Count: {eds_count}" if int(eds_count) > 0 else ""
                    )
                    apps_to_add.append(application)
                    
                    if len(apps_to_add) >= 200:
                        db.session.bulk_save_objects(apps_to_add)
                        db.session.commit()
                        apps_to_add = []
                        
            if apps_to_add:
                db.session.bulk_save_objects(apps_to_add)
                db.session.commit()
                
            print(f"Successfully imported applications.")
            
        except Exception as e:
            print("Error parsing csv:", str(e))
            db.session.rollback()

if __name__ == '__main__':
    csv_file = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\Manish Bisai\Desktop\cecb_proponent_dataset_large.csv"
    import_csv(csv_file)
