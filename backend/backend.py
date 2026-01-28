from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os

app = FastAPI(title="LCA Databank API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(BASE_DIR, "databank.csv")

# 🔹 Load once at startup
databank = pd.read_csv(csv_path)
databank.fillna(0, inplace=True)

# Convert to list of dicts ONCE
DATA = databank.to_dict(orient="records")

@app.get("/databank")
def get_databank():
    return DATA
