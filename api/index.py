import os
import sys

# Add project root to sys.path so 'api.' imports work in Vercel
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import volunteers, campaigns, admin
from api.database import engine, Base

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database connection failed on startup: {e}")
    print("If you are on Vercel using Supabase, ensure you use the IPv4 Connection Pooling URL.")

app = FastAPI(title="NayePankh Foundation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(volunteers.router, prefix="/api")
app.include_router(campaigns.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to NayePankh Foundation API. Endpoints are at /api"}

@app.get("/api/health")
def health():
    return {"status": "ok", "project": "NayePankh"}
