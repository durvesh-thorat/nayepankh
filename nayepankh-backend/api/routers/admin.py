from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import func
from api.database import get_db
from api.models import Admin, Volunteer, Campaign, Assignment
from api.schemas import (
    AdminSetup, AdminLogin, AdminOut, Token,
    VolunteerOut, VolunteerWithAssignmentsOut,
    CampaignCreate, CampaignUpdate, CampaignOut,
    AssignmentStatusUpdate, AssignmentOut, SummaryReport, CityCount
)
from api.auth import hash_password, verify_password, create_access_token, get_current_admin
import os

router = APIRouter()

@router.post("/auth/admin/setup", response_model=AdminOut)
def setup_admin(data: AdminSetup, db: Session = Depends(get_db)):
    if db.query(Admin).count() > 0:
        raise HTTPException(status_code=400, detail="Admin already exists")
    
    new_admin = Admin(
        email=data.email,
        password_hash=hash_password(data.password)
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return new_admin

@router.post("/auth/admin/login", response_model=Token)
def login_admin(data: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == data.email).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
        
    if not verify_password(data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")
        
    token = create_access_token({"sub": admin.email, "role": "admin"})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "admin"
    }

@router.get("/admin/volunteers", response_model=List[VolunteerOut])
def list_volunteers(
    city: Optional[str] = None,
    availability: Optional[str] = None,
    search: Optional[str] = None,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Volunteer)
    if city:
        query = query.filter(Volunteer.city.ilike(f"%{city}%"))
    if availability:
        query = query.filter(Volunteer.availability.ilike(f"%{availability}%"))
    if search:
        query = query.filter(
            (Volunteer.full_name.ilike(f"%{search}%")) |
            (Volunteer.email.ilike(f"%{search}%"))
        )
    return query.all()

@router.get("/admin/volunteers/{volunteer_id}", response_model=VolunteerWithAssignmentsOut)
def get_volunteer(volunteer_id: str, admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    vol = db.query(Volunteer).filter(Volunteer.id == volunteer_id).first()
    if not vol:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    return vol

@router.put("/admin/volunteers/{volunteer_id}/deactivate", response_model=VolunteerOut)
def deactivate_volunteer(volunteer_id: str, admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    vol = db.query(Volunteer).filter(Volunteer.id == volunteer_id).first()
    if not vol:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    vol.is_active = False
    db.commit()
    db.refresh(vol)
    return vol

@router.post("/admin/campaigns", response_model=CampaignOut)
def create_campaign(data: CampaignCreate, admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    new_campaign = Campaign(**data.model_dump())
    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)
    return new_campaign

@router.put("/admin/campaigns/{campaign_id}", response_model=CampaignOut)
def update_campaign(campaign_id: str, data: CampaignUpdate, admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(campaign, key, value)
        
    db.commit()
    db.refresh(campaign)
    return campaign

@router.delete("/admin/campaigns/{campaign_id}")
def delete_campaign(campaign_id: str, admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    campaign.is_active = False
    db.commit()
    return {"message": "Campaign deactivated"}

@router.put("/admin/assignments/{assignment_id}/status", response_model=AssignmentOut)
def update_assignment_status(assignment_id: str, data: AssignmentStatusUpdate, admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
        
    assignment.status = data.status
    db.commit()
    db.refresh(assignment)
    return assignment

@router.get("/admin/reports/summary", response_model=SummaryReport)
def get_summary_report(admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    total_volunteers = db.query(Volunteer).count()
    active_campaigns = db.query(Campaign).filter(Campaign.is_active == True).count()
    total_assignments = db.query(Assignment).count()
    
    # assignments_by_type
    type_counts = db.query(Campaign.campaign_type, func.count(Assignment.id))\
        .join(Assignment, Campaign.id == Assignment.campaign_id)\
        .group_by(Campaign.campaign_type).all()
    assignments_by_type = {tc[0]: tc[1] for tc in type_counts}
    
    # top_cities
    city_counts = db.query(Volunteer.city, func.count(Volunteer.id))\
        .filter(Volunteer.city != None)\
        .group_by(Volunteer.city)\
        .order_by(func.count(Volunteer.id).desc())\
        .limit(5).all()
    top_cities = [CityCount(city=cc[0], count=cc[1]) for cc in city_counts]
    
    # recent_registrations
    recent_vols = db.query(Volunteer).order_by(Volunteer.created_at.desc()).limit(5).all()
    
    return SummaryReport(
        total_volunteers=total_volunteers,
        active_campaigns=active_campaigns,
        total_assignments=total_assignments,
        assignments_by_type=assignments_by_type,
        top_cities=top_cities,
        recent_registrations=recent_vols
    )
