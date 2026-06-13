from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Campaign, Volunteer, Assignment, CampaignType, AssignmentStatus
from ..schemas import CampaignResponse, AssignmentResponse
from ..auth import get_current_volunteer
from sqlalchemy.exc import IntegrityError

router = APIRouter()

@router.get("", response_model=List[CampaignResponse])
def get_campaigns(
    city: Optional[str] = None,
    campaign_type: Optional[CampaignType] = None,
    is_active: Optional[bool] = Query(True),
    db: Session = Depends(get_db)
):
    query = db.query(Campaign)
    if city:
        query = query.filter(Campaign.city.ilike(f"%{city}%"))
    if campaign_type:
        query = query.filter(Campaign.campaign_type == campaign_type)
    if is_active is True:
        query = query.filter(Campaign.is_active == True)
        
    return query.order_by(Campaign.date.asc()).all()

@router.get("/{id}", response_model=CampaignResponse)
def get_campaign(id: str, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@router.post("/{id}/join", response_model=AssignmentResponse)
def join_campaign(id: str, volunteer: Volunteer = Depends(get_current_volunteer), db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == id, Campaign.is_active == True).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Active campaign not found")
        
    if campaign.slots_filled >= campaign.slots_total:
        raise HTTPException(status_code=400, detail="Campaign is full")
        
    assignment = Assignment(
        volunteer_id=volunteer.id,
        campaign_id=campaign.id,
        status=AssignmentStatus.UPCOMING
    )
    
    try:
        db.add(assignment)
        campaign.slots_filled += 1
        db.commit()
        db.refresh(assignment)
        return assignment
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Already joined this campaign")
