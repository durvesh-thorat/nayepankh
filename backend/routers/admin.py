from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from typing import List

from backend.database import get_db
from backend.models import Admin, Volunteer, Campaign, Assignment
from backend.schemas import Token, AdminOut, CampaignCreate, CampaignOut, VolunteerOut, AssignmentDetailOut
from backend.auth import hash_password, verify_password, create_access_token, get_current_admin

router = APIRouter()

@router.post("/auth/admin/login", response_model=Token)
def login_admin(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == form_data.username).first()
    if not admin or not verify_password(form_data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": admin.email, "role": "admin"})
    return {"access_token": access_token, "token_type": "bearer"}

# Only active campaigns management
@router.post("/admin/campaigns", response_model=CampaignOut)
def create_campaign(campaign: CampaignCreate, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    new_campaign = Campaign(
        title=campaign.title,
        description=campaign.description,
        location=campaign.location,
        is_active=campaign.is_active
    )
    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)
    return new_campaign

@router.put("/admin/campaigns/{campaign_id}", response_model=CampaignOut)
def update_campaign(campaign_id: int, campaign: CampaignCreate, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    db_campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not db_campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    db_campaign.title = campaign.title
    db_campaign.description = campaign.description
    db_campaign.location = campaign.location
    db_campaign.is_active = campaign.is_active
    db.commit()
    db.refresh(db_campaign)
    return db_campaign

@router.delete("/admin/campaigns/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_campaign(campaign_id: int, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    db_campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not db_campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    db.delete(db_campaign)
    db.commit()

# Volunteers management
@router.get("/admin/volunteers", response_model=List[VolunteerOut])
def get_all_volunteers(current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    return db.query(Volunteer).all()

@router.delete("/admin/volunteers/{volunteer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_volunteer(volunteer_id: int, current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    volunteer = db.query(Volunteer).filter(Volunteer.id == volunteer_id).first()
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    db.delete(volunteer)
    db.commit()

# Reports
@router.get("/admin/reports", response_model=dict)
def get_reports(current_admin: Admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    total_volunteers = db.query(Volunteer).count()
    active_campaigns = db.query(Campaign).filter(Campaign.is_active == True).count()
    total_assignments = db.query(Assignment).count()
    return {
        "total_volunteers": total_volunteers,
        "active_campaigns": active_campaigns,
        "total_assignments": total_assignments
    }
