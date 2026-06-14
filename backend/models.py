from backend.database import Base
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

class Volunteer(Base):
    __tablename__ = "volunteers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    password_hash = Column(String)
    skills = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    assignments = relationship("Assignment", back_populates="volunteer", cascade="all, delete-orphan")

class Campaign(Base):
    __tablename__ = "campaigns"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    location = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    assignments = relationship("Assignment", back_populates="campaign", cascade="all, delete-orphan")

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, index=True)
    volunteer_id = Column(Integer, ForeignKey("volunteers.id"))
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    status = Column(String, default="joined")
    created_at = Column(DateTime, default=datetime.utcnow)
    volunteer = relationship("Volunteer", back_populates="assignments")
    campaign = relationship("Campaign", back_populates="assignments")

class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
