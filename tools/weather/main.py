import requests
import h5py
import numpy as np
import pandas as pd
from pathlib import Path
from pyproj import Proj
import time
import os

# Configuration
API_KEY = os.environ.get("KNMI_API_KEY")
if not API_KEY:
    raise ValueError("KNMI_API_KEY environment variable is required")

JSONBIN_API_KEY = os.environ.get("JSONBIN_API_KEY")
if not JSONBIN_API_KEY:
    raise ValueError("JSONBIN_API_KEY environment variable is required")

JSONBIN_BIN_ID = "687255286063391d31ac20d2"

BASE_URL = "https://api.dataplatform.knmi.nl/open-data/v1/datasets/radar_forecast/versions/2.0/files"

UTRECHT_LAT, UTRECHT_LON = 52.0907, 5.1214

dx = dy = 1.0  # Grid resolution in km
n_steps = 25

def list_latest_file():
    headers = {"Authorization": f"Bearer {API_KEY}"}
    params = {"maxKeys": 1, "order_by": "filename", "sorting": "desc"}
    r = requests.get(BASE_URL, headers=headers, params=params)
    r.raise_for_status()
    return r.json()["files"][0]["filename"]

def get_download_url(fname):
    headers = {"Authorization": f"Bearer {API_KEY}"}
    resp = requests.get(f"{BASE_URL}/{fname}/url", headers=headers)
    resp.raise_for_status()
    return resp.json()["temporaryDownloadUrl"]

def download_file(url, path):
    Path(path).parent.mkdir(exist_ok=True, parents=True)
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        with open(path, "wb") as f:
            for chunk in r.iter_content(8192):
                f.write(chunk)

def is_file_recent(filepath, max_age_minutes=15):
    """Check if file exists and is newer than max_age_minutes"""
    if not filepath.exists():
        return False
    
    file_age_seconds = time.time() - filepath.stat().st_mtime
    file_age_minutes = file_age_seconds / 60
    return file_age_minutes < max_age_minutes

def process_radar_data(filepath):
    # Read projection & timing
    with h5py.File(filepath, "r") as f:
        nrows, ncols = f["image1/image_data"].shape
        proj4 = f["geographic/map_projection"].attrs["projection_proj4_params"].decode()
        start_raw = f["overview"].attrs["product_datetime_start"].decode()
    
    start = pd.to_datetime(start_raw, format="%d-%b-%Y;%H:%M:%S.%f")
    
    # Locate Utrecht in pixel space
    proj = Proj(proj4)
    uX, uY = proj(UTRECHT_LON, UTRECHT_LAT)
    x_min, y_max = proj(0.0, 55.97)  # West/North bounds
    
    # Compute grid position
    col = int(round((uX - x_min) / dx))
    row = int(round((y_max - uY) / dy))
    row = max(0, min(nrows-1, row))
    col = max(0, min(ncols-1, col))
    
    print(f"Using grid cell row={row}, col={col}")
    
    # Read & calibrate all time steps
    values = []
    with h5py.File(filepath, "r") as f:
        for i in range(1, n_steps+1):
            pv = f[f"image{i}/image_data"][row, col]
            # Convert to mm/hour: PV*0.01 gives mm in 5 min; *12 → mm/hour
            values.append(pv * 0.01 * 12)
    
    # Build time series
    times = pd.date_range(start=start, periods=n_steps, freq="5min")
    rainrate = pd.Series(values, index=times, name="rainrate_mm_per_hr")
    
    return rainrate

def upload_to_jsonbin(data):
    """Upload data to JSONBin.io"""
    headers = {
        "Content-Type": "application/json",
        "X-Master-key": JSONBIN_API_KEY
    }
    
    if JSONBIN_BIN_ID:
        # Update existing bin
        url = f"https://api.jsonbin.io/v3/b/{JSONBIN_BIN_ID}"
        response = requests.put(url, json=data, headers=headers)
    else:
        # Create new bin
        url = "https://api.jsonbin.io/v3/b"
        response = requests.post(url, json=data, headers=headers)
    
    response.raise_for_status()
    result = response.json()
    
    if not JSONBIN_BIN_ID and "metadata" in result:
        print(f"Created new bin with ID: {result['metadata']['id']}")
        print(f"Public URL: https://api.jsonbin.io/v3/b/{result['metadata']['id']}")
        print("Set JSONBIN_BIN_ID environment variable to this ID for future updates")
    
    return result

# Main execution
filename = list_latest_file()
print("Latest file:", filename)

local_path = Path(filename)

# Only download if file doesn't exist or is older than 15 minutes
if is_file_recent(local_path):
    print(f"Using existing file {local_path} (less than 15 minutes old)")
else:
    print(f"Downloading {filename} (file missing or older than 15 minutes)")
    dl_url = get_download_url(filename)
    download_file(dl_url, local_path)
    print("Saved to", local_path)

# Process radar data
rainrate = process_radar_data(local_path)

print("\n5-minute rate (mm/hr) near Utrecht:")
print(rainrate)

# Hourly totals
hourly = rainrate.resample("1h").sum()
print("\nHourly totals (mm):")
print(hourly)

# Generate JSON data for website
import json
from datetime import datetime

data = {
    "last_updated": datetime.now().isoformat(),
    "location": "Utrecht",
    "forecast": [
        {
            "time": timestamp.isoformat(),
            "rainfall_mm_per_hr": float(value)
        }
        for timestamp, value in rainrate.items()
    ]
}

# Upload to JSONBin.io
try:
    result = upload_to_jsonbin(data)
    print(f"\nJSON data uploaded to JSONBin.io successfully with {len(data['forecast'])} forecasts")
    if JSONBIN_BIN_ID:
        print(f"Updated bin: {JSONBIN_BIN_ID}")
    else:
        print(f"Created new bin: {result['metadata']['id']}")
except Exception as e:
    print(f"\nError uploading to JSONBin.io: {e}")
    raise
