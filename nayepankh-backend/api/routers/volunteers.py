from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from api.database import get_db
from api.models import Volunteer, Assignment
from api.schemas import (
    VolunteerRegister, VolunteerLogin, VolunteerOut, 
    VolunteerUpdate, AssignmentOut, Token
)
from api.auth import hash_password, verify_password, create_access_token, get_current_volunteer

router = APIRouter()

@router.post("/auth/volunteer/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register_volunteer(data: VolunteerRegister, db: Session = Depends(get_db)):
    existing = db.query(Volunteer).filter(Volunteer.email == data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
        
    new_vol = Volunteer(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
        phone=data.phone,
        city=data.city,
        skills=data.skills,
        availability=data.availability
    )
    db.add(new_vol)
    db.commit()
    db.refresh(new_vol)
    
    token = create_access_token({"sub": new_vol.email, "role": "volunteer"})
    vol_out = VolunteerOut.model_validate(new_vol)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "volunteer",
        "volunteer": vol_out
    }

@router.post("/auth/volunteer/login", response_model=dict)
def login_volunteer(data: VolunteerLogin, db: Session = Depends(get_db)):
    vol = db.query(Volunteer).filter(Volunteer.email == data.email).first()
    if not vol:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not verify_password(data.password, vol.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")
        
    if not vol.is_active:
        raise HTTPException(status_code=401, detail="User deactivated")
        
    token = create_access_token({"sub": vol.email, "role": "volunteer"})
    vol_out = VolunteerOut.model_validate(vol)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "volunteer",
        "volunteer": vol_out
    }

@router.get("/volunteers/me", response_model=VolunteerOut)
def get_me(volunteer: Volunteer = Depends(get_current_volunteer)):
    return volunteer

@router.put("/volunteers/me", response_model=VolunteerOut)
def update_me(data: VolunteerUpdate, volunteer: Volunteer = Depends(get_current_volunteer), db: Session = Depends(get_db)):
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(volunteer, key, value)
    db.commit()
    db.refresh(volunteer)
    return volunteer

@router.get("/volunteers/me/assignments", response_model=List[AssignmentOut])
def get_my_assignments(volunteer: Volunteer = Depends(get_current_volunteer), db: Session = Depends(get_db)):
    return volunteer.assignments
