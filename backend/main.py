from fastapi import FastAPI, HTTPException, Depends, status
from typing import Annotated
from sqlalchemy import text
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from database import SessionLocal, engine
import models
import logging

#cors import: since fronted and backend are running on different ports
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In main.py

# --- Pydantic Schemas ---
class DoctorCreate(BaseModel):
    name: str
    password: str
class PatientCreate(BaseModel):
    name: str
    password: str

# Used for Doctor creating a new Prescription/Medicine item
class PrescriptionCreate(BaseModel):
    patient_id: int 
    symptoms: str
    disease: str
    medicine_name: str
    dosage: str
    time_to_take: str
    
# Used for the Patient to tick off the medicine
class PrescriptionUpdateStatus(BaseModel):
    is_taken: bool

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

models.Base.metadata.create_all(bind=engine)


dbdependency = Annotated[Session, Depends(get_db)]

# --- API Endpoints ---
# ...basic

#C
@app.post("/doctor/", status_code=status.HTTP_201_CREATED)
async def create_doctor(post: DoctorCreate, db: dbdependency):
    db_doctor = models.Doctor(**post.dict())
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

@app.post("/patient/", status_code=status.HTTP_201_CREATED)
async def create_patient(post: PatientCreate, db: dbdependency):
    db_patient = models.Patient(**post.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

#R
@app.get("/doctors/", status_code=status.HTTP_200_OK)
async def get_doctors(db: dbdependency):
    doctors = db.query(models.Doctor).all()
    return doctors

@app.get("/patients/", status_code=status.HTTP_200_OK)
async def get_patients(db: dbdependency):
    patients = db.query(models.Patient).all()
    return patients

#U
class DoctorUpdate(BaseModel):
    name: str | None = None
    password: str | None = None

class PatientUpdate(BaseModel):
    name: str | None = None
    password: str | None = None

@app.put("/doctor/{doctor_id}", status_code=status.HTTP_200_OK)
async def update_doctor(doctor_id: int, put: DoctorUpdate, db: dbdependency):
    db_doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not db_doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    if put.name is not None:
        db_doctor.name = put.name
    if put.password is not None:
        db_doctor.password = put.password
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

@app.put("/patient/{patient_id}", status_code=status.HTTP_200_OK)
async def update_patient(patient_id: int, put: PatientUpdate, db: dbdependency):
    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if put.name is not None:
        db_patient.name = put.name
    if put.password is not None:
        db_patient.password = put.password
    db.commit()
    db.refresh(db_patient)
    return db_patient

# ...main work
# 1. Doctor Entry Endpoint (Create Prescription/Medicine Item)
@app.post("/prescriptions/", status_code=status.HTTP_201_CREATED)
async def create_prescription(pres: PrescriptionCreate, db: dbdependency):
    # Check if patient exists (optional but recommended)
    patient = db.query(models.Patient).filter(models.Patient.id == pres.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    db_pres = models.Prescription(**pres.dict())
    db.add(db_pres)
    db.commit()
    db.refresh(db_pres)
    return db_pres

# 2. Patient View Endpoint (Get ALL prescriptions/medicines for a specific patient)
@app.get("/patient/{patient_id}/prescriptions", status_code=status.HTTP_200_OK)
async def get_patient_prescriptions(patient_id: int, db: dbdependency):
    prescriptions = db.query(models.Prescription).filter(models.Prescription.patient_id == patient_id).all()
    if not prescriptions:
        # Instead of 404, return an empty list if the patient exists but has no meds
        return [] 
    return prescriptions

# 3. Patient Tick Endpoint (Update status)
@app.put("/prescriptions/{pres_id}/status", status_code=status.HTTP_200_OK)
async def update_prescription_status(pres_id: int, status_update: PrescriptionUpdateStatus, db: dbdependency):
    db_pres = db.query(models.Prescription).filter(models.Prescription.id == pres_id).first()
    if not db_pres:
        raise HTTPException(status_code=404, detail="Prescription item not found")
        
    db_pres.is_taken = status_update.is_taken
    db.commit()
    db.refresh(db_pres)
    return db_pres