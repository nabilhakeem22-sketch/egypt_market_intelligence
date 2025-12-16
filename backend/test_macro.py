from engine_macro import macro_engine
import json

print("Testing Macro Engine...")
try:
    print("Fetching Sector Data...")
    data = macro_engine.get_sector_data()
    print(json.dumps(data, indent=2))
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
