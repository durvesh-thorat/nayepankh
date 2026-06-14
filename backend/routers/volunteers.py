from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from typing import List

from backend.database import get_db
from backend.models import Volunteer, Assignment
from backend.schemas import VolunteerCreate, VolunteerOut, Token, AssignmentOut
from backend.auth import hash_password, verify_password, create_access_token, get_current_volunteer

router = APIRouter()

@router.post("/auth/volunteer/register", response_model=VolunteerOut)
def register_volunteer(volunteer: VolunteerCreate, db: Session = Depends(get_db)):
    db_volunteer = db.query(Volunteer).filter(Volunteer.email == volunteer.email).first()
    if db_volunteer:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = hash_password(volunteer.password)
    new_volunteer = Volunteer(
        name=volunteer.name,
        email=volunteer.email,
        phone=volunteer.phone,
        password_hash=hashed_pwd,
        skills=volunteer.skills
    )
    db.add(new_volunteer)
    db.commit()
    db.refresh(new_volunteer)
    return new_volunteer

@router.post("/auth/volunteer/login", response_model=Token)
def login_volunteer(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # In OAuth2PasswordRequestForm, username field is used for email
    volunteer = db.query(Volunteer).filter(Volunteer.email == form_data.username).first()
    if not volunteer or not verify_password(form_data.password, volunteer.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": volunteer.email, "role": "volunteer"})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/volunteer/me", response_model=VolunteerOut)
def get_volunteer_profile(current_user: Volunteer = Depends(get_current_volunteer)):
    return current_user

@router.get("/volunteer/assignments", response_model=List[AssignmentOut])
def get_volunteer_assignments(current_user: Volunteer = Depends(get_current_volunteer), db: Session = Depends(get_db)):
    assignments = db.query(Assignment).filter(Assignment.volunteer_id == current_user.id).all()
    return assignments
