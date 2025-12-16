import pandas as pd
import random
import numpy as np

# Constants
GOVERNORATES = {
    "Cairo": ["Maadi", "Zamalek", "New Cairo", "Nasr City", "Downtown"],
    "Giza": ["6th of October", "Sheikh Zayed", "Dokki", "Mohandessin"],
    "Alexandria": ["Smouha", "Glim", "San Stefano", "Borg El Arab"],
    "Dakahlia": ["Mansoura", "Talkha"],
    "Red Sea": ["Hurghada", "El Gouna"]
}

HIERARCHY = {
    "Agriculture": {
        "Crops": {
            "Wheat": ["Yield per Feddan", "Market Price (Ton)", "Export Volume"],
            "Cotton": ["Long Staple Price", "Short Staple Price", "Export Volume"],
            "Rice": ["Yield per Feddan", "Market Price (Ton)"]
        },
        "Livestock": {
            "Cattle": ["Head Count", "Milk Production", "Meat Price"],
            "Poultry": ["Egg Production", "Meat Price"]
        }
    },
    "Manufacturing": {
        "Textiles": {
            "Raw Materials": ["Cotton Yarn Price", "Synthetic Fiber Price"],
            "Apparel": ["Export Volume", "Local Sales Volume"]
        },
        "Chemicals": {
            "Fertilizers": ["Nitrogen Price", "Phosphate Price", "Production Volume"],
            "Plastics": ["Polyethylene Price", "Polypropylene Price"]
        }
    },
    "Real Estate": {
        "Residential": {
            "Rental": ["Avg Rent (Sqm)", "Occupancy Rate"],
            "Sales": ["Avg Price (Sqm)", "Sales Volume"]
        },
        "Commercial": {
            "Retail": ["Avg Rent (Sqm)", "Foot Traffic Score"],
            "Office": ["Avg Rent (Sqm)", "Vacancy Rate"]
        }
    }
}

YEARS = [2023, 2024, 2025]
QUARTERS = ["Q1", "Q2", "Q3", "Q4"]

def generate_data():
    rows = []
    
    for gov, districts in GOVERNORATES.items():
        for district in districts:
            for year in YEARS:
                for quarter in QUARTERS:
                    # Iterate through Hierarchy
                    for industry, sectors in HIERARCHY.items():
                        for sector, sub_sectors in sectors.items():
                            for sub_sector, indicators in sub_sectors.items():
                                for indicator in indicators:
                                    
                                    # Randomly skip some data to test "Dimming" logic
                                    if random.random() < 0.1: 
                                        continue

                                    # Base Value Logic
                                    base_value = random.uniform(100, 5000)
                                    if "Price" in indicator: base_value *= 2
                                    if "Volume" in indicator: base_value *= 10
                                    
                                    # YoY Change
                                    yoy = random.uniform(-15, 25)
                                    
                                    row = {
                                        "Industry": industry,
                                        "Sector": sector,
                                        "Sub_Sector": sub_sector,
                                        "Indicator": indicator,
                                        "Governorate": gov,
                                        "District": district,
                                        "Date": f"{year}-{quarter}",
                                        "Year": year,
                                        "Quarter": quarter,
                                        "Value": round(base_value * (1 + yoy/100), 2),
                                        "Unit": "EGP" if "Price" in indicator or "Rent" in indicator else "Units",
                                        "Confidence_Score": random.choice(["High", "Medium", "Low"]),
                                        "Source_Verified": random.choice([True, False]),
                                        "YoY_Change": round(yoy, 1),
                                        "Source_ID": f"SRC-{random.randint(100, 999)}" if random.random() > 0.3 else None
                                    }
                                    rows.append(row)

    df = pd.DataFrame(rows)
    df.to_csv("egypt_complex_micro_data.csv", index=False)
    print(f"Generated {len(df)} rows of complex data.")

if __name__ == "__main__":
    generate_data()
