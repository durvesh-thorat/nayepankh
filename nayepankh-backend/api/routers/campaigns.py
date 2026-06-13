from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from api.database import get_db
from api.models import Campaign, Assignment, Volunteer
from api.schemas import CampaignOut, AssignmentOut
from api.auth import get_current_volunteer
from sqlalchemy.exc import IntegrityError

router = APIRouter()

@router.get("/campaigns", response_model=List[CampaignOut])
def list_campaigns(
    city: Optional[str] = None,
    campaign_type: Optional[str] = None,
    is_active: bool = True,
    db: Session = Depends(get_db)
):
    query = db.query(Campaign)
    if city:
        query = query.filter(Campaign.city.ilike(f"%{city}%"))
    if campaign_type:
        query = query.filter(Campaign.campaign_type == campaign_type)
    if is_active is not None:
        query = query.filter(Campaign.is_active == is_active)
        
    return query.all()

@router.get("/campaigns/{campaign_id}", response_model=CampaignOut)
def get_campaign(campaign_id: str, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@router.post("/campaigns/{campaign_id}/join", response_model=AssignmentOut)
def join_campaign(
    campaign_id: str, 
    volunteer: Volunteer = Depends(get_current_volunteer), 
    db: Session = Depends(get_db)
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    if not campaign.is_active:
        raise HTTPException(status_code=400, detail="Campaign is not active")
        
    if campaign.slots_total is not None and campaign.slots_filled >= campaign.slots_total:
        raise HTTPException(status_code=400, detail="No slots available")
        
    new_assignment = Assignment(
        volunteer_id=volunteer.id,
        campaign_id=campaign.id,
        status="UPCOMING"
    )
    
    db.add(new_assignment)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Already joined this campaign")
        
    campaign.slots_filled += 1
    db.commit()
    db.refresh(new_assignment)
    
    return new_assignment
