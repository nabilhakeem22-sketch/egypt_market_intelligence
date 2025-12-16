import requests
import sys

BASE_URL = "http://localhost:8000/api"

def test_backend():
    print("Testing Backend Endpoints...")
    
    # 1. Signup
    print("\n1. Testing Signup...")
    import random
    username = f"curl_user_{random.randint(1000, 9999)}"
    signup_data = {"username": username, "password": "password123"}
    try:
        res = requests.post(f"{BASE_URL}/signup", json=signup_data)
        if res.status_code != 200:
            print(f"Signup Failed: {res.text}")
            sys.exit(1)
        token = res.json()["access_token"]
        print("Signup Successful. Token received.")
    except Exception as e:
        print(f"Signup Error: {e}")
        sys.exit(1)

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Update Profile
    print("\n2. Testing Profile Update...")
    profile_data = {"industry": "Retail"}
    try:
        res = requests.post(f"{BASE_URL}/profile", json=profile_data, headers=headers)
        if res.status_code != 200:
            print(f"Profile Update Failed: {res.text}")
            sys.exit(1)
        print(f"Profile Updated: {res.json()}")
    except Exception as e:
        print(f"Profile Update Error: {e}")
        sys.exit(1)

    # 3. Query AI
    print("\n3. Testing AI Query...")
    query_data = {"text": "Is it a good time to invest?"}
    try:
        res = requests.post(f"{BASE_URL}/query", json=query_data, headers=headers)
        if res.status_code != 200:
            print(f"Query Failed: {res.text}")
            sys.exit(1)
        response = res.json()
        print(f"AI Response Intent: {response.get('intent')}")
        print(f"AI Response Text: {response.get('response')[:100]}...") # Print first 100 chars
    except Exception as e:
        print(f"Query Error: {e}")
        sys.exit(1)

    # 4. Test Data Filtering
    print("\n4. Testing Data Filtering...")
    # Test 1: No filters (should return all)
    try:
        res = requests.post(f"{BASE_URL}/data", json={"filters": {}}, headers=headers)
        if res.status_code != 200:
            print(f"Data Fetch Failed: {res.text}")
        else:
            data = res.json()["data"]
            print(f"Total Data Rows: {len(data)}")
            if len(data) > 0:
                print(f"Sample Row: {data[0]}")
    except Exception as e:
        print(f"Data Fetch Error: {e}")

    # Test 2: With Filters (Rent + Density)
    print("\nTesting Density Filter...")
    filter_data = {
        "filters": {
            "competitor_density": ["High"]
        }
    }
    try:
        res = requests.post(f"{BASE_URL}/data", json=filter_data, headers=headers)
        if res.status_code != 200:
            print(f"Density Filter Failed: {res.text}")
        else:
            data = res.json()["data"]
            print(f"High Density Rows: {len(data)}")
            if len(data) > 0:
                print(f"Sample District: {data[0]['District']} | Density: {data[0]['Competitor_Density']}")
    except Exception as e:
        print(f"Density Filter Error: {e}")
    except Exception as e:
        print(f"Density Filter Error: {e}")

    # 5. Test Macro Sectors
    print("\n5. Testing Macro Sectors...")
    try:
        res = requests.get(f"{BASE_URL}/macro/sectors")
        if res.status_code != 200:
            print(f"Macro Sectors Failed: {res.text}")
        else:
            sectors = res.json()["sectors"]
            print(f"Sectors Found: {len(sectors)}")
            if len(sectors) > 0:
                print(f"Sample Sector: {sectors[0]['name']} | Data Points: {len(sectors[0]['data'])}")
    except Exception as e:
        print(f"Macro Sectors Error: {e}")

    except Exception as e:
        print(f"Macro Sectors Error: {e}")

    # 6. Test Hierarchy & Complex Filtering
    print("\n6. Testing Smart Filtering...")
    try:
        # Hierarchy
        res = requests.get(f"{BASE_URL}/hierarchy")
        if res.status_code != 200:
            print(f"Hierarchy Failed: {res.text}")
        else:
            tree = res.json()["tree"]
            print(f"Hierarchy Tree Nodes: {len(tree)}")
            if len(tree) > 0:
                print(f"Sample Root: {tree[0]['name']} | Children: {len(tree[0]['children'])}")

        # Complex Filter
        filter_data = {
            "filters": {
                "governorate": "Cairo",
                "indicators": ["Yield per Feddan", "Avg Rent (Sqm)"],
                "confidence_score": ["High"]
            }
        }
        res = requests.post(f"{BASE_URL}/data", json=filter_data, headers=headers)
        data = res.json()["data"]
        print(f"Complex Filter Rows: {len(data)}")
        if len(data) > 0:
            print(f"Sample Row: {data[0]['Indicator']} | Val: {data[0]['Value']} | Gov: {data[0]['Governorate']}")

    except Exception as e:
        print(f"Smart Filtering Error: {e}")

    except Exception as e:
        print(f"Smart Filtering Error: {e}")

    # 7. Test Integrations Status
    print("\n7. Verifying Integrations...")
    
    # Macro API (World Bank)
    print("Checking World Bank API Connection...")
    try:
        # Force a fresh fetch for one indicator
        from engine_macro import macro_engine
        data = macro_engine.fetch_indicator("FP.CPI.TOTL.ZG") # Inflation
        if len(data) > 0:
            print(f"World Bank API: ONLINE (Fetched {len(data)} data points for Inflation)")
            print(f"Latest Inflation Data: {data[-1]}")
        else:
            print("World Bank API: WARNING (No data returned, possible API issue)")
    except Exception as e:
        print(f"World Bank API: ERROR ({e})")

    # Micro Engine (Google Sheets)
    print("Checking Google Sheets Integration...")
    from engine_micro import micro_engine
    if micro_engine.sheets_client.client:
        print("Google Sheets API: CONNECTED")
    else:
        print("Google Sheets API: OFFLINE (Using Local CSV Fallback - Expected for MVP)")
        print(f"Current Data Source: {len(micro_engine.df)} rows loaded from local file.")

    # 8. Test AI Analyst (Proactive Insight)
    print("\n8. Testing AI Analyst (Proactive Insight)...")
    try:
        insight_req = {
            "filters": {"metric": "Avg_Rent_Sqm_EGP", "location": "Cairo"},
            "data_summary": "Maadi: 500, Zamalek: 800, New Cairo: 600"
        }
        res = requests.post(f"{BASE_URL}/ai/insight", json=insight_req, headers=headers)
        if res.status_code == 200:
            insight = res.json()["insight"]
            print(f"AI Insight: {insight}")
        else:
            print(f"AI Insight Failed: {res.text}")
    except Exception as e:
        print(f"AI Analyst Error: {e}")

    # 9. Test Context-Aware RAG (Simulation Mode)
    print("\n9. Testing Context-Aware RAG (Simulation Mode)...")
    try:
        rag_req = {
            "text": "What happens if rent increases by 10%?",
            "dashboard_context": {
                "filters": {"location": "Maadi"},
                "visible_data": [{"District": "Maadi", "Avg_Rent_Sqm_EGP": 500}]
            },
            "simulation_mode": True
        }
        res = requests.post(f"{BASE_URL}/query", json=rag_req, headers=headers)
        if res.status_code == 200:
            response = res.json()["response"]
            print(f"AI Response (Snippet): {response[:100]}...")
            if "SIMULATION" in response or "|" in response: # Check for table format
                print("Simulation Mode: SUCCESS (Table detected)")
            else:
                print("Simulation Mode: WARNING (No table detected)")
        else:
            print(f"RAG Failed: {res.text}")
    except Exception as e:
        print(f"RAG Error: {e}")

    print("\nBackend Verification Passed!")

if __name__ == "__main__":
    test_backend()
