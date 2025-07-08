# Utrecht Weather Forecast

A simple weather forecast website that displays 5-minute rainfall predictions for Utrecht using KNMI radar data.

## Setup

### 1. GitHub Secret Configuration

To protect the KNMI API key, you need to set it up as a GitHub Secret:

1. Go to your repository settings
2. Click on "Secrets and variables" ’ "Actions"
3. Click "New repository secret"
4. Name: `KNMI_API_KEY`
5. Value: `eyJvcmciOiI1ZTU1NGUxOTI3NGE5NjAwMDEyYTNlYjEiLCJpZCI6Ijg1NzkyZWVkM2NiNDRjOTBhZDk2NTMyNmI1NDU0ZmM1IiwiaCI6Im11cm11cjEyOCJ9`

### 2. GitHub Pages Setup

1. Go to repository settings ’ Pages
2. Set source to "GitHub Actions"
3. The weather forecast will be available at: `https://yourusername.github.io/willjs/weather/`

### 3. Local Development

For local testing, set the environment variable:

```bash
export KNMI_API_KEY="eyJvcmciOiI1ZTU1NGUxOTI3NGE5NjAwMDEyYTNlYjEiLCJpZCI6Ijg1NzkyZWVkM2NiNDRjOTBhZDk2NTMyNmI1NDU0ZmM1IiwiaCI6Im11cm11cjEyOCJ9"
cd tools/weather
python main.py
```

## How It Works

1. **Data Collection**: Python script fetches latest radar forecast from KNMI API
2. **Processing**: Extracts 5-minute rainfall predictions for Utrecht coordinates
3. **JSON Output**: Generates `data.json` with timestamped forecast data
4. **Automation**: GitHub Action runs every 15 minutes to update the forecast
5. **Display**: Simple HTML table shows next 2-3 hours of rainfall predictions

## Files

- `main.py` - Python script for fetching and processing weather data
- `index.html` - Frontend displaying the weather forecast table
- `data.json` - Generated JSON file with forecast data (updated automatically)
- `.github/workflows/weather.yml` - GitHub Action for automation

## Security

- API key is stored as a GitHub Secret, not in the code
- Environment variable validation prevents accidental exposure
- No sensitive data is committed to the repository