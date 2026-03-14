import os
import csv
import json
import requests
from flask import Blueprint, jsonify, current_app

statistics_bp = Blueprint("statistics", __name__, url_prefix="/api/statistics")

def get_csv_data():
    """Fallback parser referencing the real CSV structure for Parivesh 2.0 State-wise EC Grants 2022."""
    data_dir = os.path.join(current_app.root_path, 'data')
    csv_file = os.path.join(data_dir, 'ec_granted_2022.csv')
    
    if not os.path.exists(csv_file):
        return None
        
    results = []
    try:
        with open(csv_file, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                # The columns will map to state and the count of granted proposals
                state = row.get("State", row.get("state_name", "Unknown"))
                count = row.get("EC Granted Proposals JAN-DEC 22", row.get("proposals_granted", 0))
                try:
                    count = int(count)
                except ValueError:
                    count = 0
                results.append({"state": state, "granted": count})
    except Exception as e:
        print(f"CSV read error: {e}")
        return None
        
    return {"source": "csv", "data": results}

def get_api_data():
    """Attempt to fetch live data from data.gov.in OGD API."""
    api_key = os.getenv("OGD_API_KEY") # User must configure this
    if not api_key:
        return None
        
    # The dataset resource ID for "State-wise Environmental Clearance Proposals Granted during 2022"
    resource_id = "30f2b58a-cb77-4ac3-8e55-96a307c3e02b" 
    url = f"https://api.data.gov.in/resource/{resource_id}?api-key={api_key}&format=json"
    
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            json_data = response.json()
            records = json_data.get("records", [])
            results = []
            for record in records:
                state = record.get("state", "Unknown")
                count = record.get("ec_granted_proposals_jan_dec_22", 0)
                try:
                    count = int(count)
                except ValueError:
                    count = 0
                results.append({"state": state, "granted": count})
            return {"source": "api", "data": results}
    except Exception as e:
        print(f"API fetch error: {e}")
        
    return None

@statistics_bp.route("/ec-granted-2022", methods=["GET"])
def get_ec_granted_stats():
    """
    Returns the true dataset value, prioritizing the Live API with fallback to CSV parsing.
    """
    # Try fetching via Live API first
    data = get_api_data()
    
    # If API fails or key is missing, parse the downloaded CSV
    if not data:
        data = get_csv_data()
        
    if not data:
        return jsonify({"error": "Data could not be loaded from API or CSV."}), 500
        
    return jsonify(data), 200
