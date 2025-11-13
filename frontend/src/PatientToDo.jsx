// PatientToDo.jsx
import React, { useState, useEffect } from 'react';
import api from './api';

// For demonstration, use a fixed patient ID (1)
const PATIENT_ID = 1; 

const PatientToDo = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patientName, setPatientName] = useState('Patient Name'); // Placeholder

  const fetchPrescriptions = async () => {
    try {
      const response = await api.get(`/patient/${PATIENT_ID}/prescriptions`);
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching patient prescriptions:', error);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleToggleTaken = async (presId, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      // 1. Send PUT request to update status
      await api.put(`/prescriptions/${presId}/status`, { is_taken: newStatus });
      
      // 2. Update state optimistically (without re-fetching everything)
      setPrescriptions(prescriptions.map(pres => 
        pres.id === presId ? { ...pres, is_taken: newStatus } : pres
      ));
      
    } catch (error) {
      console.error('Error updating prescription status:', error);
      alert('Failed to update status.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>💊 Patient To-Do List (Patient ID: {PATIENT_ID})</h2>
      <p>Click the checkbox when you've taken your medicine.</p>
      
      <table className="table table-striped table-hover table-bordered">
        <thead className="table-info">
          <tr>
            <th>Medicine</th>
            <th>Dosage</th>
            <th>Time</th>
            <th>Taken?</th>
          </tr>
        </thead>
        <tbody>
          {prescriptions.length === 0 ? (
            <tr>
              <td colSpan="4">No active prescriptions found.</td>
            </tr>
          ) : (
            prescriptions.map((pres) => (
              <tr 
                key={pres.id} 
                className={pres.is_taken ? 'table-success' : ''} 
                style={{textDecoration: pres.is_taken ? 'line-through' : 'none'}}
              >
                <td>{pres.medicine_name}</td>
                <td>{pres.dosage}</td>
                <td>{pres.time_to_take}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={pres.is_taken}
                    onChange={() => handleToggleTaken(pres.id, pres.is_taken)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PatientToDo;