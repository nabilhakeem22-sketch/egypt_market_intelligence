import pandas as pd
import os
import numpy as np
import gspread
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv

load_dotenv()

# Path to mock data
DATA_PATH = os.path.join(os.path.dirname(__file__), "mock_data", "egypt_complex_micro_data.csv")

class GoogleSheetsClient:
    def __init__(self):
        self.client = None
        self.credentials_path = os.path.join(os.path.dirname(__file__), "service_account.json")
        self.connect()

    def connect(self):
        """Attempts to connect to Google Sheets API using service_account.json"""
        if os.path.exists(self.credentials_path):
            try:
                self.client = gspread.service_account(filename=self.credentials_path)
                print("Connected to Google Sheets API.")
            except Exception as e:
                print(f"Google Sheets Auth Error: {e}")
        else:
            print("No service_account.json found. Google Sheets Auth skipped.")

    def get_data(self, sheet_id_or_url):
        """Fetches data from a Google Sheet and returns a DataFrame."""
        if not self.client:
            # Try public CSV URL fallback if it looks like a URL
            # Support both 'output=csv' (Published) and 'export?format=csv' (Shared)
            if "docs.google.com" in sheet_id_or_url and ("output=csv" in sheet_id_or_url or "format=csv" in sheet_id_or_url):
                try:
                    print(f"Attempting to fetch public CSV from: {sheet_id_or_url}")
                    return pd.read_csv(sheet_id_or_url)
                except Exception as e:
                    print(f"Public CSV Fetch Error: {e}")
            return None

        try:
            if "docs.google.com" in sheet_id_or_url:
                sheet = self.client.open_by_url(sheet_id_or_url)
            else:
                sheet = self.client.open_by_key(sheet_id_or_url)
            
            worksheet = sheet.get_worksheet(0)
            data = worksheet.get_all_records()
            return pd.DataFrame(data)
        except Exception as e:
            print(f"Google Sheets Fetch Error: {e}")
            return None

class MicroEngine:
    def __init__(self):
        self.df = None
        self.vectorizer = None
        self.tfidf_matrix = None
        self.sheets_client = GoogleSheetsClient()
        self.load_data()
        self.init_vector_search()

    def load_data(self):
        """Loads data from Google Sheets (if configured) or falls back to local CSV."""
        # Check for Sheet ID in env or hardcoded for testing
        sheet_id = os.getenv("GOOGLE_SHEET_ID")
        
        if sheet_id: # Enabled
            print(f"Attempting to load data from Google Sheet: {sheet_id}")
            df = self.sheets_client.get_data(sheet_id)
            if df is not None and not df.empty:
                # Debug: Print columns and first row
                print(f"Sheet Columns: {df.columns.tolist()}")
                print(f"Sheet Head:\n{df.head(2)}")
                
                # Fix: If columns look like 'Unnamed', try to promote first row to header
                if "Unnamed: 0" in df.columns:
                    print("Detected missing headers. Promoting first row...")
                    new_header = df.iloc[0] #grab the first row for the header
                    df = df[1:] #take the data less the header row
                    df.columns = new_header #set the header row as the df header
                    df.reset_index(drop=True, inplace=True)
                
                # NEW: Handle Long-Format Data (e.g. Industry/Sector/Indicator/Value)
                if "Indicator" in df.columns and "Value" in df.columns and "District" in df.columns:
                    print("Detected Long-Format Data. Pivoting...")
                    # Pivot: Index=District, Columns=Indicator, Values=Value
                    df_pivot = df.pivot_table(index="District", columns="Indicator", values="Value", aggfunc='first').reset_index()
                    df = df_pivot
                    print(f"Pivoted Columns: {df.columns.tolist()}")

                # Normalize columns (strip whitespace)
                df.columns = df.columns.astype(str).str.strip()
                print(f"Normalized Columns: {df.columns.tolist()}")

                # Column Mapping (Fuzzy Match)
                col_map = {}
                for col in df.columns:
                    if "Rent" in col and "Avg" in col:
                        col_map[col] = "Avg_Rent_Sqm_EGP"
                    elif "Traffic" in col:
                        col_map[col] = "Foot_Traffic_Score"
                    elif "Competitor" in col:
                        col_map[col] = "Competitor_Density"
                    elif "District" in col:
                        col_map[col] = "District"
                    elif "Shop_Sale_Price" in col:
                        col_map[col] = "Avg_Rent_Sqm_EGP" # Proxy
                
                if col_map:
                    print(f"Renaming columns: {col_map}")
                    df.rename(columns=col_map, inplace=True)

                # Ensure numeric types and missing columns
                for col in ["Avg_Rent_Sqm_EGP", "Foot_Traffic_Score", "Competitor_Density"]:
                    if col not in df.columns:
                         # Mock data for demo if column is completely missing
                         import numpy as np
                         df[col] = np.random.randint(10, 1000, size=len(df))
                         if col == "Competitor_Density":
                             df[col] = np.random.choice(["High", "Medium", "Low"], size=len(df))
                    
                    if col != "Competitor_Density": # Keep Density as string or map it later
                         df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

                self.df = df
                
                # NEW: Generate Source IDs if missing for Traceability
                if "Source_ID" not in self.df.columns:
                    # Generate IDs like FS_CAI_001, FS_CAI_002...
                    self.df["Source_ID"] = [f"FS_CAI_{i+1:03d}" for i in range(len(self.df))]
                
                print("Micro Data Loaded from Google Sheets.")
                return

        # Fallback to local
        if os.path.exists(DATA_PATH):
            if "complex" in DATA_PATH:
                self.df = self._load_complex_data(DATA_PATH)
                print("Micro Data Loaded from Complex CSV.")
            else:
                self.df = pd.read_csv(DATA_PATH)
                print("Micro Data Loaded from Local CSV (Fallback).")
        else:
            print(f"Error: Data file not found at {DATA_PATH}")
            self.df = pd.DataFrame()

        # Ensure Source_ID exists even for local/empty data
        if self.df is not None and not self.df.empty and "Source_ID" not in self.df.columns:
             self.df["Source_ID"] = [f"FS_LOC_{i+1:03d}" for i in range(len(self.df))]
        
        # FINAL FALLBACK: If everything failed, populate with Mock Data for Demo
        if self.df is None or self.df.empty:
            print("CRITICAL: All data sources failed. Using Hardcoded Mock Data.")
            self.df = pd.DataFrame({
                "District": ["Maadi", "Zamalek", "Nasr City", "New Cairo", "6th of October", "Heliopolis"],
                "Avg_Rent_Sqm_EGP": [350, 500, 200, 250, 180, 280],
                "Foot_Traffic_Score": [1500, 3000, 3500, 1200, 2000, 2200],
                "Competitor_Density": ["Medium", "Very High", "Very High", "Low", "Medium", "High"],
                "Source_ID": [f"MOCK_{i}" for i in range(6)]
            })

    def _load_complex_data(self, path):
        """
        Loads and transforms the complex long-format CSV into the wide-format expected by the app.
        Focuses on 2025 Real Estate/Commercial data.
        """
        try:
            df_raw = pd.read_csv(path)
            
            # Filter for latest 2025 data and relevant sectors
            # We want Retail Commercial data for "Market Intelligence" dashboard context
            mask_2025 = df_raw['Year'] == 2025
            mask_retail = (df_raw['Sector'] == 'Real Estate') & (df_raw['Sub_Sector'].isin(['Commercial', 'Residential'])) 
            
            df_filtered = df_raw[mask_2025 & mask_retail].copy()
            
            if df_filtered.empty:
                print("Warning: No 2025 data found in complex CSV, falling back to all years.")
                df_filtered = df_raw.copy()

            # We need to aggregate because there might be multiple quarters. 
            # Let's take the mean value for 2025 per District and Indicator.
            df_pivot = df_filtered.pivot_table(
                index='District', 
                columns='Indicator', 
                values='Value', 
                aggfunc='mean'
            ).reset_index()
            
            # Rename columns to match internal schema
            # Schema expects: Avg_Rent_Sqm_EGP, Foot_Traffic_Score, Competitor_Density
            col_map = {
                'Avg Rent (Sqm)': 'Avg_Rent_Sqm_EGP',
                'Foot Traffic Score': 'Foot_Traffic_Score',
                'Avg Price (Sqm)': 'Avg_Sale_Price_Sqm_EGP' # Extra bonus field
            }
            df_pivot.rename(columns=col_map, inplace=True)
            
            # Synthesize generic fields if missing
            if 'Competitor_Density' not in df_pivot.columns:
                # Logic: Higher traffic -> Higher competition
                def get_comp_density(traffic):
                    if pd.isna(traffic): return "Medium"
                    if traffic > 3000: return "Very High"
                    if traffic > 2000: return "High"
                    if traffic > 1000: return "Medium"
                    return "Low"
                
                if 'Foot_Traffic_Score' in df_pivot.columns:
                    df_pivot['Competitor_Density'] = df_pivot['Foot_Traffic_Score'].apply(get_comp_density)
                else:
                    df_pivot['Competitor_Density'] = "Medium"

            # Fill NaNs
            if 'Avg_Rent_Sqm_EGP' not in df_pivot.columns: df_pivot['Avg_Rent_Sqm_EGP'] = 0
            if 'Foot_Traffic_Score' not in df_pivot.columns: 
                # If traffic missing in complex data, assume generic
                df_pivot['Foot_Traffic_Score'] = 1500 

            df_pivot = df_pivot.fillna(0)
            
            print(f"transformed complex data shape: {df_pivot.shape}")
            print(f"Columns: {df_pivot.columns.tolist()}")
            
            return df_pivot

        except Exception as e:
            print(f"Error processing complex data: {e}")
            import traceback
            traceback.print_exc()
            return pd.DataFrame()

    def init_vector_search(self):
        """Initializes the TF-IDF vectorizer and pre-computes vectors for the data."""
        if self.df.empty:
            return

        print("Initializing Vector Search Model (TF-IDF)...")
        try:
            # Create a text representation for each row to embed
            # Handle potential missing columns if Sheet schema differs
            required_cols = ['District', 'Avg_Rent_Sqm_EGP', 'Foot_Traffic_Score', 'Competitor_Density']
            if not all(col in self.df.columns for col in required_cols):
                print(f"Warning: Missing columns for vector search. Available: {self.df.columns}")
                # Try to use whatever is available
                self.df['text_representation'] = self.df.apply(lambda row: " ".join(str(x) for x in row.values), axis=1)
            else:
                self.df['text_representation'] = self.df.apply(
                    lambda row: f"{row['District']} {row['District']} rent price {row['Avg_Rent_Sqm_EGP']} traffic {row['Foot_Traffic_Score']} competitors {row['Competitor_Density']}", 
                    axis=1
                )
            
            # Initialize Vectorizer
            self.vectorizer = TfidfVectorizer(stop_words='english')
            self.tfidf_matrix = self.vectorizer.fit_transform(self.df['text_representation'].tolist())
            
            print("Vector Index Built Successfully (TF-IDF).")
        except Exception as e:
            print(f"Error initializing vector search: {e}")
            self.vectorizer = None

    def search(self, query, top_k=3):
        """
        Performs a vector search using TF-IDF cosine similarity.
        """
        if self.df.empty:
            return []
        
        if not self.vectorizer or self.tfidf_matrix is None:
            print("Warning: Falling back to keyword search.")
            return self._keyword_search(query)

        try:
            # Transform the query to a vector
            query_vec = self.vectorizer.transform([query])
            
            # Compute cosine similarity
            cos_scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
            
            # Find top_k results
            top_indices = cos_scores.argsort()[-top_k:][::-1]
            
            results = []
            for idx in top_indices:
                score = cos_scores[idx]
                if score > 0.1: # Threshold
                    row = self.df.iloc[idx].to_dict()
                    row['relevance_score'] = float(score)
                    results.append(row)
            
            return results

        except Exception as e:
            print(f"Search Error: {e}")
            return []

    def _keyword_search(self, query):
        """Legacy keyword search fallback."""
        query = query.lower()
        results = []
        for _, row in self.df.iterrows():
            # Robust check for 'District' column
            district = str(row.get('District', '')).lower()
            if district and district in query:
                results.append(row.to_dict())
        
        if not results:
            # Return top districts by traffic as default
            if 'Foot_Traffic_Score' in self.df.columns:
                top_districts = self.df.sort_values(by='Foot_Traffic_Score', ascending=False).head(3)
                results = top_districts.to_dict('records')
            else:
                results = self.df.head(3).to_dict('records')
        
        return results

    def get_all_districts(self):
        if self.df.empty:
            return []
        if 'District' in self.df.columns:
            return sorted(self.df['District'].unique().tolist())
        return []

    def filter_data(self, filters):
        """
        Filters the dataframe based on provided criteria.
        filters: dict with keys 'districts', 'min_rent', 'max_rent', 'min_traffic', 'max_traffic'
        """
        if self.df.empty:
            return []

        # Debug: Print columns
        print(f"Filter Data Columns: {self.df.columns.tolist()}")

        filtered_df = self.df.copy()

        # Filter by District
        if filters.get('districts'):
            filtered_df = filtered_df[filtered_df['District'].isin(filters['districts'])]

        # Filter by Rent
        if filters.get('min_rent') is not None:
            filtered_df = filtered_df[filtered_df['Avg_Rent_Sqm_EGP'] >= filters['min_rent']]
        if filters.get('max_rent') is not None:
            filtered_df = filtered_df[filtered_df['Avg_Rent_Sqm_EGP'] <= filters['max_rent']]

        # Filter by Traffic
        if filters.get('min_traffic') is not None:
            filtered_df = filtered_df[filtered_df['Foot_Traffic_Score'] >= filters['min_traffic']]
        if filters.get('max_traffic') is not None:
            filtered_df = filtered_df[filtered_df['Foot_Traffic_Score'] <= filters['max_traffic']]

        if filters.get('competitor_density'):
            filtered_df = filtered_df[filtered_df['Competitor_Density'].isin(filters['competitor_density'])]

        # Handle NaNs for JSON serialization
        filtered_df = filtered_df.astype(object).where(pd.notnull(filtered_df), None)

        return filtered_df.to_dict('records')

    def get_hierarchy_tree(self):
        """
        Returns the hierarchy tree for Micro data based on available columns.
        """
        if self.df is None or self.df.empty:
             return []

        tree = []
        
        # 1. Market Indicators
        market_items = []
        if "Avg_Rent_Sqm_EGP" in self.df.columns:
            market_items.append({
                "name": "Avg_Rent_Sqm_EGP", 
                "label": "Avg Rent (EGP)", 
                "icon": "DollarSign",
                "industries": ["Retail", "F&B", "Logistics", "Real Estate"] # Universal
            })
        if "Vacancy_Rate" in self.df.columns:
             market_items.append({
                 "name": "Vacancy_Rate", 
                 "label": "Vacancy Rate", 
                 "icon": "Activity",
                 "industries": ["Real Estate", "Logistics"]
             })
        
        if market_items:
            tree.append({
                "name": "Market Indicators",
                "icon": "PieChart",
                "items": market_items
            })

        # 2. Operational Metrics
        op_items = []
        if "Foot_Traffic_Score" in self.df.columns:
            op_items.append({
                "name": "Foot_Traffic_Score", 
                "label": "Foot Traffic", 
                "icon": "Users",
                "industries": ["Retail", "F&B"] # Not for Warehouses/Offices primarily
            })
        if "Competitor_Density" in self.df.columns:
            op_items.append({
                "name": "Competitor_Density", 
                "label": "Competitor Density", 
                "icon": "Users",
                "industries": ["Retail", "F&B", "Healthcare"]
            })
        
        if op_items:
            tree.append({
                "name": "Operational Metrics",
                "icon": "TrendingUp",
                "items": op_items
            })
            
        return tree

# Singleton instance
micro_engine = MicroEngine()
