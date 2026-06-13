from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional, List, Dict
from datetime import datetime

class VolunteerBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    city: Optional[str] = None
    skills: Optional[str] = None
    availability: Optional[str] = None

class VolunteerRegister(VolunteerBase):
    password: str

class VolunteerLogin(BaseModel):
    email: EmailStr
    password: str

class VolunteerOut(VolunteerBase):
    id: str
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class VolunteerUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    skills: Optional[str] = None
    availability: Optional[str] = None

class CampaignBase(BaseModel):
    title: str
    campaign_type: str
    description: Optional[str] = None
    city: Optional[str] = None
    date: Optional[datetime] = None
    slots_total: Optional[int] = 0

class CampaignCreate(CampaignBase):
    pass

class CampaignUpdate(BaseModel):
    title: Optional[str] = None
    campaign_type: Optional[str] = None
    description: Optional[str] = None
    city: Optional[str] = None
    date: Optional[datetime] = None
    slots_total: Optional[int] = None
    slots_filled: Optional[int] = None
    is_active: Optional[bool] = None

class CampaignOut(CampaignBase):
    id: str
    slots_filled: int
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AssignmentOut(BaseModel):
    id: str
    volunteer_id: str
    campaign_id: str
    status: str
    assigned_at: datetime
    campaign: CampaignOut
    model_config = ConfigDict(from_attributes=True)

class VolunteerWithAssignmentsOut(VolunteerOut):
    assignments: List[AssignmentOut] = []
    model_config = ConfigDict(from_attributes=True)

class AdminSetup(BaseModel):
    email: EmailStr
    password: str

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class AdminOut(BaseModel):
    id: str
    email: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    email: str
    role: str

class AssignmentStatusUpdate(BaseModel):
    status: str

class CityCount(BaseModel):
    city: str
    count: int

class SummaryReport(BaseModel):
    total_volunteers: int
    active_campaigns: int
    total_assignments: int
    assignments_by_type: Dict[str, int]
    top_cities: List[CityCount]
    recent_registrations: List[VolunteerOut]
