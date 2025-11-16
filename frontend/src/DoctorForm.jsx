// DoctorForm.jsx
import React, { useState } from 'react';
import api from './api';

const DoctorForm = ({ onPrescriptionAdded }) => {
  // Assuming you can get the Patient IDs somehow (e.g., fetching a list of patients)
  // For simplicity, we assume the doctor inputs the Patient ID.
  const [formData, setFormData] = useState({
    patient_id: '',
    symptoms: '',
    disease: '',
    medicine_name: '',
    dosage: '',
    no_of_time: '',
    days_to_take: '',
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      patient_id: parseInt(formData.patient_id, 10),
      no_of_time: parseInt(formData.no_of_time, 10),
      days_to_take: parseInt(formData.days_to_take, 10),
    };

    if (
      Number.isNaN(payload.patient_id) ||
      Number.isNaN(payload.no_of_time) ||
      Number.isNaN(payload.days_to_take)
    ) {
      alert('Please enter valid integers for Patient ID, No. of Times and Days to Take.');
      return;
    }

    try {
      await api.post('/prescriptions/', payload);
      alert('Prescription entry saved successfully!');
      // Clear form after success
      setFormData({ 
        patient_id: '', 
        symptoms: '', 
        disease: '', 
        medicine_name: '', 
        dosage: '', 
        no_of_time: '' , 
        days_to_take: ''
      });
      if (onPrescriptionAdded) onPrescriptionAdded();
    } catch (error) {
      console.error('Error saving prescription:', error);
      console.error('Backend response:', error.response?.data);
      alert('Error saving prescription. Check required fields and types.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Doctor Entry: New Prescription</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Patient ID</label>
          <input type="number" className='form-control' name='patient_id' onChange={handleInputChange} value={formData.patient_id} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Symptoms</label>
          <input type="text" className='form-control' name='symptoms' onChange={handleInputChange} value={formData.symptoms} />
        </div>
        <div className="mb-3">
          <label className="form-label">Disease/Condition</label>
          <input type="text" className='form-control' name='disease' onChange={handleInputChange} value={formData.disease} />
        </div>
        <div className="row">
          <div className="col-4 mb-3">
            <label className="form-label">Medicine Name</label>
            <input type="text" className='form-control' name='medicine_name' onChange={handleInputChange} value={formData.medicine_name} required />
          </div>
          <div className="col-4 mb-3">
            <label className="form-label">Dosage (e.g., 500mg)</label>
            <input type="text" className='form-control' name='dosage' onChange={handleInputChange} value={formData.dosage} required />
          </div>
          <div className="col-4 mb-3">
            <label className="form-label">No. of Times to Take</label>
            <input type="number" className='form-control' name='no_of_time' onChange={handleInputChange} value={formData.no_of_time} required />
          </div>
          <div className="col-3 mb-3">
            <label className="form-label">Days to Take</label>
            <input type="number" className='form-control' name='days_to_take' onChange={handleInputChange} value={formData.days_to_take} required />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Save Prescription Item</button>
      </form>
    </div>
  );
};

export default DoctorForm;