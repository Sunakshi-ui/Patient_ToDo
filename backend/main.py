from fastapi import FastAPI, HTTPException, Depends, status
from typing import Annotated
from sqlalchemy import text
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from database import SessionLocal, engine
from datetime import datetime, timedelta
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

# Used for data validation and serialization, i.e. to define the expected structure of requests and responses.

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
    no_of_time: int
    days_to_take: int  

# for updating a specific DailyDose status
class DailyDoseUpdateStatus(BaseModel):
    is_taken: bool
    
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

# D
@app.delete("/doctor/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_doctor(doctor_id: int, db: dbdependency):
    db_doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not db_doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    db.delete(db_doctor)
    db.commit()
    return

@app.delete("/patient/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(patient_id: int, db: dbdependency):    
    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    db.delete(db_patient)
    db.commit()
    return

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

SCHEDULE_TIMES = ["Morning", "Noon", "Evening", "Night", "Extra Dose 1", "Extra Dose 2"]

# 2. Patient View Endpoint (Get ALL prescriptions/medicines for a specific patient)
@app.get("/patient/{patient_id}/schedule", status_code=status.HTTP_200_OK)
async def get_patient_prescriptions(patient_id: int, db: dbdependency):
    # Retrieve all parent prescriptions for the patient
    prescriptions = db.query(models.Prescription).filter(models.Prescription.patient_id == patient_id).all()
    
    if not prescriptions:
        return []

    all_doses = []
    today = datetime.now().date()
    
    # Loop through prescriptions and generate/retrieve daily dose records
    for pres in prescriptions:
        # 1. Get the number of times (e.g., 2)
        dose_count = pres.no_of_time # This is an Integer (e.g., 2)
        
        # Safety check: Ensure the count is within bounds and positive
        if dose_count <= 0 or dose_count > len(SCHEDULE_TIMES):
            # Log a warning or skip this prescription if the count is invalid
            continue
            
        # 2. Extract the actual time names (e.g., ["Morning", "Noon"])
        times_of_day = SCHEDULE_TIMES[:dose_count]

        # 1. Generate Due Dates
        # Iterate for the duration (days_to_take)
        for day_offset in range(pres.days_to_take):
            due_date = today + timedelta(days=day_offset)
            due_date_str = due_date.strftime('%Y-%m-%d') # Standard format for BE storage
            
            
            for scheduled_time in times_of_day:
                
                # 2. Check if DailyDose record already exists for this date/time
                dose = db.query(models.DailyDose).filter(
                    models.DailyDose.prescription_id == pres.id,
                    models.DailyDose.due_date == due_date_str,
                    models.DailyDose.scheduled_time == scheduled_time
                ).first()

                # 3. If dose doesn't exist, create it (This is the critical step!)
                if not dose:
                    dose = models.DailyDose(
                        prescription_id=pres.id,
                        scheduled_time=scheduled_time,
                        due_date=due_date_str,
                        is_taken=False
                    )
                    db.add(dose)
                    db.flush() # Ensure the new ID is available
                
                # 4. Compile the full task details to return to the frontend
                all_doses.append({
                    "dose_id": dose.id, # Unique ID for PUT request
                    "due_date": due_date_str, 
                    "scheduled_time": scheduled_time,
                    "is_taken": dose.is_taken,
                    "medicine_name": pres.medicine_name,
                    "dosage": pres.dosage,
                    "disease": pres.disease,
                    # Add any other required prescription details
                })
    
    db.commit() # Commit any newly created DailyDose records
    return all_doses

# 3. Patient Tick Endpoint (Update status)
@app.put("/doses/{dose_id}/status", status_code=status.HTTP_200_OK)
async def update_prescription_status(dose_id: int, status_update: DailyDoseUpdateStatus, db: dbdependency):
    # Find the specific DailyDose record
    db_dose = db.query(models.DailyDose).filter(models.DailyDose.id == dose_id).first()
    if not db_dose:
        raise HTTPException(status_code=404, detail="Daily dose item not found")
        
    db_dose.is_taken = status_update.is_taken
    db.commit()
    db.refresh(db_dose)
    
    # Return the updated dose ID and status to the frontend
    return {"dose_id": db_dose.id, "is_taken": db_dose.is_taken}