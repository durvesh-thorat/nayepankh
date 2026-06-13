from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Volunteer, Assignment, Campaign
from ..schemas import VolunteerResponse, VolunteerUpdate, AssignmentWithCampaignResponse
from ..auth import get_current_volunteer

router = APIRouter()

@router.get("/me", response_model=VolunteerResponse)
def get_me(volunteer: Volunteer = Depends(get_current_volunteer)):
    return volunteer

@router.put("/me", response_model=VolunteerResponse)
def update_me(update_data: VolunteerUpdate, volunteer: Volunteer = Depends(get_current_volunteer), db: Session = Depends(get_db)):
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(volunteer, key, value)
    
    db.commit()
    db.refresh(volunteer)
    return volunteer

@router.get("/me/assignments", response_model=List[AssignmentWithCampaignResponse])
def get_my_assignments(volunteer: Volunteer = Depends(get_current_volunteer), db: Session = Depends(get_db)):
    assignments = db.query(Assignment).filter(Assignment.volunteer_id == volunteer.id).all()
    return assignments
