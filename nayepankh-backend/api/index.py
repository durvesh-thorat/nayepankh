from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from api.routers import volunteers, campaigns, admin
from api.database import engine, Base

Base.metadata.create_all(bind=engine)

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

@app.get("/api/health")
def health():
    return {"status": "ok", "project": "NayePankh"}

handler = Mangum(app)
