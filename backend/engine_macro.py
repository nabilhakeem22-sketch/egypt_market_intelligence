import requests
import pandas as pd
from datetime import datetime

# World Bank API Base URL
WB_API_URL = "http://api.worldbank.org/v2/country/egy/indicator/"

# Indicator Codes
INDICATORS = {
    "inflation": "FP.CPI.TOTL.ZG",
    "gdp_growth": "NY.GDP.MKTP.KD.ZG",
    "lending_rate": "FR.INR.LEND",
    "agriculture_gdp": "NV.AGR.TOTL.ZS",
    "manufacturing_gdp": "NV.IND.MANF.ZS",
    "services_gdp": "NV.SRV.TOTL.ZS",
    "exports_gdp": "NE.EXP.GNFS.ZS"
}

class MacroEngine:
    def __init__(self):
        self.cache = {}
        self.last_fetch = None

    def fetch_indicator(self, indicator_code):
        """Fetches the last 5 years of data for a given indicator."""
        url = f"{WB_API_URL}{indicator_code}?format=json&per_page=5"
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if len(data) < 2:
                return []
            
            # Parse time series
            series = []
            for entry in data[1]:
                if entry['value'] is not None:
                    series.append({
                        "year": entry['date'],
                        "value": round(entry['value'], 2)
                    })
            # Sort by year ascending for charts
            series.sort(key=lambda x: x['year'])
            return series
        except Exception as e:
            print(f"Error fetching {indicator_code}: {e}")
            return []

    def fetch_data360(self, indicator_code, country_code="EGY"):
        """
        Fetches data from the new World Bank Data360 API.
        Example Indicator: 'WB_WDI_SE_PRM_CMPT_FE_ZS' (Primary completion rate)
        """
        url = "https://data360api.worldbank.org/data360/data"
        params = {
            "indicator": indicator_code,
            "refArea": country_code,
            "timePeriodFrom": "2020" # Optional: Filter by year
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # The API returns a 'value' list
            clean_data = []
            for entry in data.get('value', []):
                clean_data.append({
                    "year": entry.get('TIME_PERIOD'),
                    "value": entry.get('OBS_VALUE'),
                    "source": entry.get('DATA_SOURCE')
                })
            
            return sorted(clean_data, key=lambda x: x['year'])
            
        except Exception as e:
            print(f"Data360 Error: {e}")
            return []

    def get_macro_summary(self):
        """Returns a summary of key macro indicators."""
        # Simple in-memory caching (refresh if older than 1 day - for MVP)
        if self.last_fetch and (datetime.now() - self.last_fetch).days < 1:
            return self.cache

        summary = {}
        for name, code in INDICATORS.items():
            data = self.fetch_indicator(code)
            if data:
                summary[name] = {
                    "latest_value": data[-1]['value'], # Last item is latest due to sort
                    "latest_year": data[-1]['year'],
                    "trend": data # Full series for charts
                }
        
        self.cache = summary
        self.last_fetch = datetime.now()
        return summary

    def get_sector_data(self):
        """Returns time-series data for sector indicators."""
        # Ensure cache is populated
        if not self.cache or (self.last_fetch and (datetime.now() - self.last_fetch).days >= 1):
            self.get_macro_summary()
        
        sectors = []
        sector_keys = ["agriculture_gdp", "manufacturing_gdp", "services_gdp", "exports_gdp"]
        
        for key in sector_keys:
            if key in self.cache:
                sectors.append({
                    "name": key,
                    "label": key.replace("_gdp", "").title() + " (% GDP)",
                    "data": self.cache[key]["trend"]
                })
        return sectors

# Singleton instance
macro_engine = MacroEngine()
