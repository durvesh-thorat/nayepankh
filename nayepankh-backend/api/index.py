from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from dotenv import load_dotenv
import os

from .database import engine, Base
from .routers import volunteers, campaigns, admin
from .auth import create_access_token, verify_password, get_password_hash
from .models import Volunteer, Admin
from .schemas import LoginRequest, VolunteerAuthResponse, AdminAuthResponse, VolunteerCreate, AdminSetup
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from .database import get_db

load_dotenv()

# Create tables if not exists
Base.metadata.create_all(bind=engine)

app = FastAPI(title="NayePankh Foundation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to NayePankh Foundation API"}

# Include routers
app.include_router(volunteers.router, prefix="/api/volunteers", tags=["Volunteers"])
app.include_router(campaigns.router, prefix="/api/campaigns", tags=["Campaigns"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

# Auth routes (placed directly in index or router)
@app.post("/api/auth/volunteer/register", response_model=VolunteerAuthResponse)
def register_volunteer(volunteer_in: VolunteerCreate, db: Session = Depends(get_db)):
    existing_user = db.query(Volunteer).filter(Volunteer.email == volunteer_in.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    
    hashed_password = get_password_hash(volunteer_in.password)
    new_volunteer = Volunteer(
        full_name=volunteer_in.full_name,
        email=volunteer_in.email,
        password_hash=hashed_password,
        phone=volunteer_in.phone,
        city=volunteer_in.city,
        skills=volunteer_in.skills,
        availability=volunteer_in.availability
    )
    db.add(new_volunteer)
    db.commit()
    db.refresh(new_volunteer)
    
    access_token = create_access_token(data={"sub": new_volunteer.email, "role": "volunteer"})
    return {"access_token": access_token, "volunteer": new_volunteer}

@app.post("/api/auth/volunteer/login", response_model=VolunteerAuthResponse)
def login_volunteer(creds: LoginRequest, db: Session = Depends(get_db)):
    volunteer = db.query(Volunteer).filter(Volunteer.email == creds.email).first()
    if not volunteer or not verify_password(creds.password, volunteer.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not volunteer.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")
        
    access_token = create_access_token(data={"sub": volunteer.email, "role": "volunteer"})
    return {"access_token": access_token, "volunteer": volunteer}

@app.post("/api/auth/admin/login", response_model=AdminAuthResponse)
def login_admin(creds: LoginRequest, db: Session = Depends(get_db)):
    admin_user = db.query(Admin).filter(Admin.email == creds.email).first()
    if not admin_user or not verify_password(creds.password, admin_user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        
    access_token = create_access_token(data={"sub": admin_user.email, "role": "admin"})
    return {"access_token": access_token, "role": "admin"}

@app.post("/api/auth/admin/setup")
def setup_first_admin(setup_data: AdminSetup, db: Session = Depends(get_db)):
    admin_count = db.query(Admin).count()
    if admin_count > 0:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin already exists")
    
    # Check setup key if it's set in env
    setup_key = os.getenv("ADMIN_SETUP_KEY")
    if setup_key and setup_data.setup_key != setup_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid setup key")

    hashed_password = get_password_hash(setup_data.password)
    new_admin = Admin(email=setup_data.email, password_hash=hashed_password)
    db.add(new_admin)
    db.commit()
    return {"message": "Admin account created successfully"}

handler = Mangum(app)
