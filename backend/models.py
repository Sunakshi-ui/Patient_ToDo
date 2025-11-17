#models.py: wherever your SQLAlchemy models are defined 

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from database import Base


# for ORM table mapping.
# 1. Patient Model (for viewing/ticking)
class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(30), unique=True, index=True) # Used for login/identification
    password = Column(String(10))
    prescriptions = relationship("Prescription", back_populates="patient") 
    #<FKname> = relationship("<ModelName>", back_populates="<related_name_in_other_model>")

# 2. Doctor Model (for entering data)
class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(30), index=True)
    password = Column(String(10))

# 3. Prescription Model
class Prescription(Base):
    __tablename__ = "prescriptions"
    id = Column(Integer, primary_key=True, index=True)
    
    # Doctor's Entry Fields
    symptoms = Column(String(15))
    disease = Column(String(10))
    
    # Medication Details
    medicine_name = Column(String(15)) 
    dosage = Column(String(15))
    no_of_time = Column(Integer) 
    days_to_take = Column(Integer) 
    
    # Patient Association: each prescription is linked to a patient
    patient_id = Column(Integer, ForeignKey("patients.id")) #it's PK of Patient model
    patient = relationship("Patient", back_populates="prescriptions") #it's FKname in Patient model
    
    # Relationship to DailyDoses for tracking completion
    doses = relationship("DailyDose", back_populates="prescription") #it's FKname in DailyDose model

# 4. Daily Dose Tracking Model (for day-wise tracking)
class DailyDose(Base):
    __tablename__ = "daily_doses"
    id = Column(Integer, primary_key=True, index=True)
    
    # Link back to the main prescription: which prescription does this dose belong to
    prescription_id = Column(Integer, ForeignKey("prescriptions.id")) #it's PK of Prescription model
    prescription = relationship("Prescription", back_populates="doses") #it's FKname in Prescription model
    
    # What was scheduled (A copy of the required time/details)
    scheduled_time = Column(String(15)) # E.g., 'Morning' #can i remove this?
    
    # The specific date this dose was due
    due_date = Column(String(15)) # We'll store the date as a string (YYYY-MM-DD)
    
    # Completion status for this specific dose
    is_taken = Column(Boolean, default=False)