import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from api.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    city = Column(String, nullable=True)
    skills = Column(String, nullable=True)
    availability = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    assignments = relationship("Assignment", back_populates="volunteer")

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    campaign_type = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    city = Column(String, nullable=True)
    date = Column(DateTime, nullable=True)
    slots_total = Column(Integer, default=0)
    slots_filled = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    assignments = relationship("Assignment", back_populates="campaign")

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    volunteer_id = Column(String(36), ForeignKey("volunteers.id"), nullable=False)
    campaign_id = Column(String(36), ForeignKey("campaigns.id"), nullable=False)
    status = Column(String, default="UPCOMING")
    assigned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint('volunteer_id', 'campaign_id', name='_volunteer_campaign_uc'),)

    volunteer = relationship("Volunteer", back_populates="assignments")
    campaign = relationship("Campaign", back_populates="assignments")

class Admin(Base):
    __tablename__ = "admins"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
