from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI(title="LCA Databank API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

databank = pd.read_csv("databank.csv")

@app.get("/search")
def search_materials(q: str):
    results = databank[databank["Materials"].str.contains(q, case=False, na=False)]
    return results["Materials"].tolist()

@app.get("/material/{name}")
def get_material(name: str):
    row = databank[databank["Materials"] == name]
    if row.empty:
        return {"error": "Material not found"}
    return row.to_dict(orient="records")[0]
