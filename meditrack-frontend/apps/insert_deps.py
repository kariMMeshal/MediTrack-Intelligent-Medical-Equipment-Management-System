import urllib.request
import urllib.error
import json

departments = [
    {"name": "Radiology", "description": "Handles all imaging and radiology equipment."},
    {"name": "Intensive Care Unit (ICU)", "description": "Critical care and life support equipment."},
    {"name": "Emergency Room (ER)", "description": "Urgent and emergency medical devices."},
    {"name": "Surgery (OR)", "description": "Surgical tools, anesthesia machines, and monitors."},
    {"name": "Cardiology", "description": "Heart monitoring and cardiovascular equipment."},
    {"name": "Neurology", "description": "Brain and nerve monitoring devices."},
    {"name": "Pediatrics", "description": "Equipment specialized for infants and children."},
    {"name": "Oncology", "description": "Cancer treatment and radiation therapy devices."},
    {"name": "Laboratory", "description": "Blood analyzers, microscopes, and testing equipment."},
    {"name": "Pharmacy", "description": "Medication dispensing and storage equipment."}
]

url = "http://localhost:8080/api/departments"
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJyb2xlcyI6WyJST0xFX0FETUlOIiwiUk9MRV9CSU9NRUQiLCJST0xFX1VTRVIiXSwic3ViIjoiemV1cyIsImlhdCI6MTc3ODQxMjk5OCwiZXhwIjoxNzc4NDk5Mzk4fQ.m3laoYBqd_pcVnfkT9z6RxeHRjWsX29VzOfLhFKQ2paEpEoj5EZ0cg7z8i3bLFL8ajSRJYWaC7hiGDa1xQmEkQ'
}

success_count = 0
for dept in departments:
    req = urllib.request.Request(url, data=json.dumps(dept).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Created: {dept['name']} - Status: {response.status}")
            success_count += 1
    except urllib.error.HTTPError as e:
        print(f"Failed to create {dept['name']}: {e.code} {e.reason}")
        if e.code in [401, 403]:
            print("ERROR: Authentication required! The API needs a Bearer Token.")
            break
    except urllib.error.URLError as e:
        print(f"Connection failed: {e.reason}")
        break

print(f"Successfully created {success_count} departments.")
