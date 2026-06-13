from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional, Any
from ..database import get_db
from ..models import Admin, Volunteer, Campaign, Assignment, CampaignType, AssignmentStatus
from ..schemas import (
    VolunteerResponse, CampaignCreate, CampaignUpdate, CampaignResponse, 
    VolunteerWithAssignmentsResponse, AssignmentResponse
)
from ..auth import get_current_admin
from pydantic import BaseModel

router = APIRouter()

# Schemas for this router only
class AssignmentStatusUpdate(BaseModel):
    status: AssignmentStatus

@router.get("/volunteers")
def get_volunteers(
    city: Optional[str] = None,
    availability: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Volunteer)
    if city:
        query = query.filter(Volunteer.city.ilike(f"%{city}%"))
    if availability:
        query = query.filter(Volunteer.availability.ilike(f"%{availability}%"))
    if search:
        query = query.filter(or_(
            Volunteer.full_name.ilike(f"%{search}%"),
            Volunteer.email.ilike(f"%{search}%")
        ))
    
    total = query.count()
    volunteers = query.offset(skip).limit(limit).all()
    # Manual serialization since it is paginated
    items = [VolunteerResponse.model_validate(v).model_dump() for v in volunteers]
    
    return {"total": total, "items": items, "skip": skip, "limit": limit}

@router.get("/volunteers/{id}", response_model=VolunteerWithAssignmentsResponse)
def get_volunteer(id: str, admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    volunteer = db.query(Volunteer).filter(Volunteer.id == id).first()
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    return volunteer

@router.put("/volunteers/{id}/deactivate", response_model=VolunteerResponse)
def deactivate_volunteer(id: str, admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    volunteer = db.query(Volunteer).filter(Volunteer.id == id).first()
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    volunteer.is_active = False
    db.commit()
    db.refresh(volunteer)
    return volunteer

@router.post("/campaigns", response_model=CampaignResponse)
def create_campaign(campaign_in: CampaignCreate, admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    campaign = Campaign(**campaign_in.model_dump())
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign

@router.put("/campaigns/{id}", response_model=CampaignResponse)
def update_campaign(id: str, update_data: CampaignUpdate, admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(campaign, key, value)
        
    db.commit()
    db.refresh(campaign)
    return campaign

@router.delete("/campaigns/{id}")
def delete_campaign(id: str, admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    campaign.is_active = False
    db.commit()
    return {"message": "Campaign deleted successfully"}

@router.put("/assignments/{id}/status", response_model=AssignmentResponse)
def update_assignment_status(id: str, update_data: AssignmentStatusUpdate, admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    assignment = db.query(Assignment).filter(Assignment.id == id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    if update_data.status not in [AssignmentStatus.COMPLETED, AssignmentStatus.CANCELLED]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    assignment.status = update_data.status
    db.commit()
    db.refresh(assignment)
    return assignment

@router.get("/reports/summary")
def get_summary(admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    total_volunteers = db.query(Volunteer).count()
    active_campaigns = db.query(Campaign).filter(Campaign.is_active == True).count()
    total_assignments = db.query(Assignment).count()
    
    # Assignments by type
    assignments_by_type_query = (
        db.query(Campaign.campaign_type, func.count(Assignment.id))
        .join(Assignment, Campaign.id == Assignment.campaign_id)
        .group_by(Campaign.campaign_type)
        .all()
    )
    assignments_by_type = {c_type.value: count for c_type, count in assignments_by_type_query}
    
    # Top cities from volunteers
    top_cities_query = (
        db.query(Volunteer.city, func.count(Volunteer.id).label('count'))
        .filter(Volunteer.city != None)
        .group_by(Volunteer.city)
        .order_by(func.count(Volunteer.id).desc())
        .limit(5)
        .all()
    )
    top_cities = [{"city": c, "count": count} for c, count in top_cities_query]
    
    # Recent registrations
    recent_volunteers = db.query(Volunteer).order_by(Volunteer.created_at.desc()).limit(5).all()
    recent_v_list = [VolunteerResponse.model_validate(v).model_dump() for v in recent_volunteers]
    
    return {
        "total_volunteers": total_volunteers,
        "active_campaigns": active_campaigns,
        "total_assignments": total_assignments,
        "assignments_by_type": assignments_by_type,
        "top_cities": top_cities,
        "recent_registrations": recent_v_list
    }
