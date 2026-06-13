from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from .models import CampaignType, AssignmentStatus

# Volunteer
class VolunteerBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    city: Optional[str] = None
    skills: Optional[str] = None
    availability: Optional[str] = None

class VolunteerCreate(VolunteerBase):
    password: str

class VolunteerUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    skills: Optional[str] = None
    availability: Optional[str] = None

class VolunteerResponse(VolunteerBase):
    id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Campaign
class CampaignBase(BaseModel):
    title: str
    campaign_type: CampaignType
    description: Optional[str] = None
    city: Optional[str] = None
    date: datetime
    slots_total: int

class CampaignCreate(CampaignBase):
    pass

class CampaignUpdate(BaseModel):
    title: Optional[str] = None
    campaign_type: Optional[CampaignType] = None
    description: Optional[str] = None
    city: Optional[str] = None
    date: Optional[datetime] = None
    slots_total: Optional[int] = None
    is_active: Optional[bool] = None

class CampaignResponse(CampaignBase):
    id: UUID
    slots_filled: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Assignment
class AssignmentBase(BaseModel):
    status: AssignmentStatus

class AssignmentResponse(AssignmentBase):
    id: UUID
    volunteer_id: UUID
    campaign_id: UUID
    assigned_at: datetime

    class Config:
        from_attributes = True

class CampaignInAssignment(CampaignResponse):
    pass

class AssignmentWithCampaignResponse(AssignmentResponse):
    campaign: CampaignInAssignment

class VolunteerWithAssignmentsResponse(VolunteerResponse):
    assignments: List[AssignmentWithCampaignResponse] = []

# Admin
class AdminCreate(BaseModel):
    email: EmailStr
    password: str

class AdminSetup(AdminCreate):
    setup_key: Optional[str] = None

# Auth
class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class VolunteerAuthResponse(BaseModel):
    access_token: str
    volunteer: VolunteerResponse

class AdminAuthResponse(BaseModel):
    access_token: str
    role: str = "admin"
