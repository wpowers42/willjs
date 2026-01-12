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

# City coordinates for major Dutch cities
CITIES = {
    "Utrecht": {"lat": 52.092876, "lon": 5.104480},
    "Amsterdam": {"lat": 52.377956, "lon": 4.897070},
    "Rotterdam": {"lat": 51.926517, "lon": 4.462456},
    "The Hague": {"lat": 52.078663, "lon": 4.288788},
    "Eindhoven": {"lat": 51.441642, "lon": 5.469722},
    "Groningen": {"lat": 53.219383, "lon": 6.566502},
    "Tilburg": {"lat": 51.555351, "lon": 5.091600},
    "Almere": {"lat": 52.371353, "lon": 5.222124},
    "Breda": {"lat": 51.586151, "lon": 4.776150},
    "Nijmegen": {"lat": 51.812565, "lon": 5.837226},
    "Haarlem": {"lat": 52.387386, "lon": 4.646219},
    "Leiden": {"lat": 52.160114, "lon": 4.497010},
    "Dordrecht": {"lat": 51.813297, "lon": 4.690093},
    "Zaandam": {"lat": 52.442039, "lon": 4.829199},
    "Deventer": {"lat": 52.266075, "lon": 6.155217},
    "Lelystad": {"lat": 52.518536, "lon": 5.471422},
    "Emmen": {"lat": 52.785805, "lon": 6.897585},
    "Gouda": {"lat": 52.011112, "lon": 4.711111}
}

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


def process_radar_data(filepath, city_name, city_lat, city_lon):
    # Read projection & timing
    with h5py.File(filepath, "r") as f:
        nrows, ncols = f["image1/image_data"].shape
        proj4 = f["geographic/map_projection"].attrs["projection_proj4_params"].decode()
        start_raw = f["overview"].attrs["product_datetime_start"].decode()

    start = pd.to_datetime(start_raw, format="%d-%b-%Y;%H:%M:%S.%f")

    # Locate city in pixel space
    proj = Proj(proj4)
    cX, cY = proj(city_lon, city_lat)
    x_min, y_max = proj(0.0, 55.97)  # West/North bounds

    # Compute grid position
    col = int(round((cX - x_min) / dx))
    row = int(round((y_max - cY) / dy))
    row = max(0, min(nrows-1, row))
    col = max(0, min(ncols-1, col))

    print(f"{city_name}: Using grid cell row={row}, col={col}")

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
    """Upload data to JSONBin.io with retry logic for 502/504 errors"""
    headers = {
        "Content-Type": "application/json",
        "X-Master-key": JSONBIN_API_KEY
    }

    max_retries = 20
    base_delay = 1  # seconds

    for attempt in range(max_retries + 1):
        try:
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

        except requests.exceptions.HTTPError as e:
            if e.response.status_code in [502, 504] and attempt < max_retries:
                delay = min(base_delay * (2 ** attempt), 256)
                print(f"JSONBin.io {e.response.status_code} error, retrying in {delay}s (attempt {attempt + 1}/{max_retries + 1})")
                time.sleep(delay)
                continue
            else:
                # Re-raise for non-retryable errors or if max retries exceeded
                raise

# Main execution
filename = list_latest_file()
print("Latest file:", filename)

local_path = Path(filename)

print(f"Downloading {filename}")
dl_url = get_download_url(filename)
download_file(dl_url, local_path)
print("Saved to", local_path)

# Process radar data for all cities
import json
from datetime import datetime

cities_data = {}
print("\nProcessing cities:")

for city_name, coords in CITIES.items():
    rainrate = process_radar_data(local_path, city_name, coords["lat"], coords["lon"])

    cities_data[city_name] = {
        "forecast": [
            {
                "time": timestamp.isoformat(),
                "rainfall_mm_per_hr": float(value)
            }
            for timestamp, value in rainrate.items()
        ]
    }

    print(f"{city_name}: Processed {len(rainrate)} forecast points")

# Generate JSON data for website
data = {
    "last_updated": datetime.now().isoformat(),
    "cities": cities_data
}

# Upload to JSONBin.io
try:
    result = upload_to_jsonbin(data)
    total_forecasts = sum(len(city_data['forecast']) for city_data in data['cities'].values())
    print(f"\nJSON data uploaded to JSONBin.io successfully")
    print(f"Processed {len(data['cities'])} cities with {total_forecasts} total forecast points")
    if JSONBIN_BIN_ID:
        print(f"Updated bin: {JSONBIN_BIN_ID}")
    else:
        print(f"Created new bin: {result['metadata']['id']}")
except Exception as e:
    print(f"\nError uploading to JSONBin.io: {e}")
    raise
