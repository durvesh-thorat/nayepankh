from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.models import Campaign, Assignment, Volunteer
from backend.schemas import CampaignOut, AssignmentOut
from backend.auth import get_current_volunteer

router = APIRouter()

@router.get("/campaigns", response_model=List[CampaignOut])
def get_campaigns(is_active: bool = None, db: Session = Depends(get_db)):
    query = db.query(Campaign)
    if is_active is not None:
        query = query.filter(Campaign.is_active == is_active)
    return query.all()

@router.get("/campaigns/{campaign_id}", response_model=CampaignOut)
def get_campaign(campaign_id: int, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@router.post("/campaigns/{campaign_id}/join", response_model=AssignmentOut)
def join_campaign(
    campaign_id: int, 
    current_user: Volunteer = Depends(get_current_volunteer),
    db: Session = Depends(get_db)
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    existing = db.query(Assignment).filter(
        Assignment.volunteer_id == current_user.id,
        Assignment.campaign_id == campaign_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already joined this campaign")
        
    assignment = Assignment(volunteer_id=current_user.id, campaign_id=campaign_id)
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment
