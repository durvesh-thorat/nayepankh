import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, ForeignKey, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from .database import Base

class CampaignType(str, enum.Enum):
    FOOD_DRIVE = "FOOD_DRIVE"
    CLOTHES_DISTRIBUTION = "CLOTHES_DISTRIBUTION"
    EDUCATION = "EDUCATION"
    SANITARY_AID = "SANITARY_AID"

class AssignmentStatus(str, enum.Enum):
    UPCOMING = "UPCOMING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

def generate_uuid():
    return str(uuid.uuid4())

class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    city = Column(String, nullable=True)
    skills = Column(String, nullable=True) # Comma separated
    availability = Column(String, nullable=True) # weekdays/weekends/both
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    assignments = relationship("Assignment", back_populates="volunteer")

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    campaign_type = Column(SQLEnum(CampaignType), nullable=False)
    description = Column(Text, nullable=True)
    city = Column(String, nullable=True)
    date = Column(DateTime(timezone=True), nullable=False)
    slots_total = Column(Integer, default=0)
    slots_filled = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    assignments = relationship("Assignment", back_populates="campaign")

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    volunteer_id = Column(UUID(as_uuid=True), ForeignKey("volunteers.id"), nullable=False)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=False)
    status = Column(SQLEnum(AssignmentStatus), default=AssignmentStatus.UPCOMING)
    assigned_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint('volunteer_id', 'campaign_id', name='_volunteer_campaign_uc'),)

    volunteer = relationship("Volunteer", back_populates="assignments")
    campaign = relationship("Campaign", back_populates="assignments")

class Admin(Base):
    __tablename__ = "admins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
