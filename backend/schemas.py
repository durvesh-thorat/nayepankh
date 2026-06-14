from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class VolunteerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    skills: Optional[str] = None

class VolunteerOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    skills: Optional[str] = None
    created_at: datetime
    
    class Config:
        orm_mode = True
        from_attributes = True

class CampaignCreate(BaseModel):
    title: str
    description: str
    location: str
    is_active: Optional[bool] = True

class CampaignOut(BaseModel):
    id: int
    title: str
    description: str
    location: str
    is_active: bool
    created_at: datetime
    
    class Config:
        orm_mode = True
        from_attributes = True

class AssignmentOut(BaseModel):
    id: int
    volunteer_id: int
    campaign_id: int
    status: str
    created_at: datetime
    campaign: Optional[CampaignOut] = None
    
    class Config:
        orm_mode = True
        from_attributes = True

class AssignmentDetailOut(BaseModel):
    id: int
    volunteer_id: int
    campaign_id: int
    status: str
    created_at: datetime
    volunteer: Optional[VolunteerOut] = None
    campaign: Optional[CampaignOut] = None
    
    class Config:
        orm_mode = True
        from_attributes = True

class AdminOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime
    
    class Config:
        from_attributes = True
