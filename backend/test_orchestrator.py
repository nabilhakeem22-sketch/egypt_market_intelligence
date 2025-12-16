from orchestrator import orchestrator
import sys

try:
    print("Testing Orchestrator...")
    query = "Is it a good time to invest?"
    industry = "Retail"
    print(f"Query: {query}, Industry: {industry}")
    
    result = orchestrator.process_query(query, user_industry=industry)
    print("Result:", result)
    print("Orchestrator Test Passed!")
except Exception as e:
    print(f"Orchestrator Test Failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
