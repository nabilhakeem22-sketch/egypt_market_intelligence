from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Egypt Market Intelligence AI", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For MVP, allow all. In prod, restrict to frontend URL.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from pydantic import BaseModel
from orchestrator import orchestrator
from auth import auth_router, get_current_user, User
from fastapi import Depends, HTTPException
from engine_micro import micro_engine
from engine_macro import macro_engine
from typing import List, Optional, Dict

# Include Auth Router
app.include_router(auth_router, prefix="/api")

class QueryRequest(BaseModel):
    text: str
    dashboard_context: Optional[Dict] = None
    simulation_mode: Optional[bool] = False

class DataFilters(BaseModel):
    districts: Optional[List[str]] = None
    min_rent: Optional[float] = None
    max_rent: Optional[float] = None
    min_traffic: Optional[float] = None
    max_traffic: Optional[float] = None
    competitor_density: Optional[List[str]] = None

class DataRequest(BaseModel):
    filters: DataFilters

@app.post("/api/query")
def query_ai(request: QueryRequest, current_user: User = Depends(get_current_user)):
    result = orchestrator.process_query(
        request.text, 
        user_industry=current_user.industry,
        dashboard_context=request.dashboard_context,
        simulation_mode=request.simulation_mode
    )
    return result

@app.get("/api/macro/sectors")
async def get_macro_sectors():
    try:
        print("Endpoint /api/macro/sectors called")
        data = macro_engine.get_sector_data()
        print(f"Got data: {len(data)} sectors")
        return {"sectors": data}
    except Exception as e:
        print(f"Error in /api/macro/sectors: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/data")
def get_filtered_data(request: DataRequest, current_user: User = Depends(get_current_user)):
    """
    Returns filtered market data for the dashboard.
    """
    data = micro_engine.filter_data(request.filters.dict())
    return {"data": data}

class InsightRequest(BaseModel):
    filters: Dict
    data_summary: str

@app.post("/api/ai/insight")
def get_ai_insight(request: InsightRequest):
    """Generates a proactive AI insight based on current context."""
    insight = orchestrator.generate_proactive_insight(request.filters, request.data_summary)
    return {"insight": insight}

@app.get("/api/districts")
def get_districts():
    """Returns mapping of Governorate -> Districts."""
    return {"districts": micro_engine.get_all_districts()}

@app.get("/api/hierarchy")
def get_hierarchy():
    """Returns the full data hierarchy tree."""
    # 1. Get Micro Data Hierarchy (Dynamic)
    micro_tree = micro_engine.get_hierarchy_tree()

    # 2. Get Macro Sectors (Semi-Dynamic from Macro Engine)
    # We constructed the tree structure here to match the frontend expectation
    macro_items = [
        {"name": "manufacturing_gdp", "label": "Manufacturing (% GDP)", "icon": "Activity"},
        {"name": "agriculture_gdp", "label": "Agriculture (% GDP)", "icon": "Activity"},
        {"name": "services_gdp", "label": "Services (% GDP)", "icon": "Activity"},
        {"name": "exports_gdp", "label": "Exports (% GDP)", "icon": "Activity"},
    ]
    
    macro_node = {
        "name": "Macroeconomic Sectors",
        "icon": "PieChart",
        "items": macro_items
    }

    # Combine
    full_tree = micro_tree + [macro_node]
    
    return {"tree": full_tree}

@app.get("/")
def read_root():
    return {"status": "active", "system": "Egypt Market Intelligence AI"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

@app.get("/health")
def health_check():
    return {"status": "healthy"}
