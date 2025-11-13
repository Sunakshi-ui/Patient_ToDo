#models.py: wherever your SQLAlchemy models are defined

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from database import Base

# 1. Patient Model (for viewing/ticking)
class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(30), unique=True, index=True) # Used for login/identification
    # You might want a password field here in a real app
    password = Column(String(10))
    prescriptions = relationship("Prescription", back_populates="patient")

# 2. Doctor Model (for entering data)
class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(30), index=True)
    # You might want a password field here in a real app
    password = Column(String(10))

# 3. Prescription Model
class Prescription(Base):
    __tablename__ = "prescriptions"
    id = Column(Integer, primary_key=True, index=True)
    
    # Doctor's Entry Fields
    symptoms = Column(String(30))
    disease = Column(String(15))
    prescription_text = Column(String(50)) # The actual medicine/instructions
    
    # Patient Association
    patient_id = Column(Integer, ForeignKey("patients.id"))
    patient = relationship("Patient", back_populates="prescriptions")
    
    # To-Do List Tracking (Added by the Patient via frontend)
    medicine_name = Column(String(50)) # E.g., 'Amoxicillin' - one item per entry for the To-Do list
    dosage = Column(String(10))
    time_to_take = Column(String(10)) # E.g., 'Morning, Noon, Night'
    
    # Track completion status
    is_taken = Column(Boolean, default=False)

