import urllib.request
import urllib.error
import json
import random
from datetime import datetime, timedelta

TOKEN = 'eyJhbGciOiJIUzUxMiJ9.eyJyb2xlcyI6WyJST0xFX0FETUlOIiwiUk9MRV9CSU9NRUQiLCJST0xFX1VTRVIiXSwic3ViIjoiemV1cyIsImlhdCI6MTc3ODQxMjk5OCwiZXhwIjoxNzc4NDk5Mzk4fQ.m3laoYBqd_pcVnfkT9z6RxeHRjWsX29VzOfLhFKQ2paEpEoj5EZ0cg7z8i3bLFL8ajSRJYWaC7hiGDa1xQmEkQ'
URL = "http://localhost:8080/api/medical-devices"
DEPARTMENTS_URL = "http://localhost:8080/api/departments"

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {TOKEN}'
}

dept_ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
try:
    req = urllib.request.Request(DEPARTMENTS_URL, headers=headers, method='GET')
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        if isinstance(data, list):
            dept_ids = [d['id'] for d in data]
        elif 'content' in data:
            dept_ids = [d['id'] for d in data['content']]
except Exception as e:
    pass

if not dept_ids:
    dept_ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

devices_templates = [
    {"name": "MRI Scanner", "model": "MAGNETOM Vida", "manufacturer": "Siemens", "prefix": "MRI"},
    {"name": "CT Scanner", "model": "Revolution CT", "manufacturer": "GE Healthcare", "prefix": "CT"},
    {"name": "X-Ray Machine", "model": "DigitalDiagnost", "manufacturer": "Philips", "prefix": "XR"},
    {"name": "Ultrasound", "model": "EPIQ Elite", "manufacturer": "Philips", "prefix": "US"},
    {"name": "Patient Monitor", "model": "IntelliVue MX700", "manufacturer": "Philips", "prefix": "PM"},
    {"name": "Ventilator", "model": "Puritan Bennett 980", "manufacturer": "Medtronic", "prefix": "VENT"},
    {"name": "Defibrillator", "model": "LIFEPAK 15", "manufacturer": "Stryker", "prefix": "DEF"},
    {"name": "Infusion Pump", "model": "Plum 360", "manufacturer": "ICU Medical", "prefix": "IP"},
    {"name": "Anesthesia Machine", "model": "Aisys CS2", "manufacturer": "GE Healthcare", "prefix": "ANES"},
    {"name": "Electrosurgical Unit", "model": "Force FX", "manufacturer": "Medtronic", "prefix": "ESU"},
    {"name": "ECG Machine", "model": "MAC 2000", "manufacturer": "GE Healthcare", "prefix": "ECG"},
    {"name": "EEG Machine", "model": "Nihon Kohden EEG-1200", "manufacturer": "Nihon Kohden", "prefix": "EEG"},
    {"name": "Infant Incubator", "model": "Giraffe OmniBed", "manufacturer": "GE Healthcare", "prefix": "INC"},
    {"name": "Linear Accelerator", "model": "TrueBeam", "manufacturer": "Varian", "prefix": "LINAC"},
    {"name": "Hematology Analyzer", "model": "Sysmex XN-1000", "manufacturer": "Sysmex", "prefix": "HEM"},
]

statuses = ["ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "MAINTENANCE", "OUT_OF_SERVICE"]

success_count = 0

def random_date(start_year, end_year):
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    return start + timedelta(days=random.randint(0, (end - start).days))

for i in range(1031, 1038):
    template = random.choice(devices_templates)
    purch_date = random_date(2018, 2024)
    warr_date = purch_date + timedelta(days=365 * random.randint(1, 5))
    last_maint = random_date(2025, 2026)
    next_maint = last_maint + timedelta(days=180)
    
    device = {
        "name": template["name"],
        "model": template["model"],
        "manufacturer": template["manufacturer"],
        "serialNumber": f'SN-{template["prefix"]}-{1000+i}',
        "assetTag": f'AT-{template["prefix"]}-{2000+i}',
        "status": random.choice(statuses),
        "conditionDescription": "Good condition, normal wear and tear." if random.random() > 0.2 else "Needs upcoming calibration.",
        "departmentId": random.choice(dept_ids),
        "location": f'Room {random.randint(100, 500)}',
        "supplier": f'{template["manufacturer"]} Direct',
        "purchasePrice": round(random.uniform(5000, 200000), 2),
        "purchaseDate": purch_date.strftime('%Y-%m-%d'),
        "warrantyExpiryDate": warr_date.strftime('%Y-%m-%d'),
        "lastMaintenanceDate": last_maint.strftime('%Y-%m-%d'),
        "nextMaintenanceDate": next_maint.strftime('%Y-%m-%d')
    }

    req = urllib.request.Request(URL, data=json.dumps(device).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Created: {device['name']} ({device['serialNumber']}) - Status: {response.status}")
            success_count += 1
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode('utf-8')
        print(f"Failed to create {device['name']}: {e.code} {e.reason} - {error_msg}")
    except urllib.error.URLError as e:
        print(f"Connection failed: {e.reason}")

print(f"Successfully created {success_count} devices.")
