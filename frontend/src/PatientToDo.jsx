// PatientToDo.jsx
import React, { useState, useEffect } from 'react';
import api from './api';

// For demonstration, use a fixed patient ID (1)
const PATIENT_ID = 1; 

// Helper to generate a date N days from now
const getDateString = (dayOffset) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return date.toLocaleDateString(
    'en-US', 
    { weekday: 'short', month: 'short', day: 'numeric' }
  );
};

const transformTasks = (flatTasks) => {
    const tasks = {};
    flatTasks.forEach(task => {
        // Use due_date from BE as the key
        const dateKey = task.due_date; 
        if (!tasks[dateKey]) {
            tasks[dateKey] = [];
        }
        tasks[dateKey].push(task);
    });
    return tasks;
};


const PatientToDo = () => {
    const [schedule, setSchedule] = useState({}); // Flat list from BE
    const [dayWiseTasks, setDayWiseTasks] = useState({}); // Transformed list for rendering

    const fetchSchedule = async () => {
        try {
            // CALL THE NEW ENDPOINT
            const response = await api.get(`/patient/${PATIENT_ID}/schedule`);
            const flatSchedule = response.data;
            setSchedule(flatSchedule);
            setDayWiseTasks(transformTasks(flatSchedule));
        } catch (error) {
            console.error('Error fetching patient schedule:', error);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, []);

    const handleToggleTaken = async (doseId, currentStatus) => {
        const newStatus = !currentStatus;
        try {
            // CALL THE NEW DOSE ENDPOINT
            await api.put(`/doses/${doseId}/status`, { is_taken: newStatus });
            
            // OPTIMISTIC UPDATE: Update the state locally
            const updatedSchedule = schedule.map(dose => 
                dose.dose_id === doseId ? { ...dose, is_taken: newStatus } : dose
            );

            setSchedule(updatedSchedule);
            setDayWiseTasks(transformTasks(updatedSchedule)); // Re-transform for display

        } catch (error) {
            console.error('Error updating dose status:', error);
            alert('Failed to update status.');
        }
    };

  const dates = Object.keys(dayWiseTasks).sort((a, b) => new Date(a) - new Date(b));

  return (
   <div className="container mt-5">
       <h2>Patient Medication Schedule (Patient ID: {PATIENT_ID})</h2>
       <p>This schedule covers the next few days based on your prescriptions.</p>
 
      {dates.length === 0 ? (
          <p>No active prescriptions found.</p>
      ) : (
          dates.map(date => (
              <div key={date} className="card mb-4 border-info">
                  <div className="card-header bg-info text-white">
                      <h4 className="mb-0">🗓️ {date}</h4>
                  </div>
                  <ul className="list-group list-group-flush">
                      {dayWiseTasks[date].map(task => (
                          <li 
                              key={task.dose_id} 
                              className={`list-group-item d-flex justify-content-between align-items-center ${task.is_taken ? 'list-group-item-success' : ''}`}
                              style={{textDecoration: task.is_taken ? 'line-through' : 'none'}}
                          >
                              <div>
                                  <strong>{task.time_to_take}:</strong> {task.medicine_name} ({task.dosage}) 
                                  <small className='text-muted ms-2'> - for {task.disease}</small>
                              </div>
                              <input
                                  type="checkbox"
                                  checked={task.is_taken}
                                  // This update will globally mark the entire prescription as taken/not taken
                                  // until the backend is updated for day-wise tracking.
                                  onChange={() => handleToggleTaken(task.dose_id, task.is_taken)}
                              />
                          </li>
                      ))}
                  </ul>
              </div>
          ))
      )}
    </div>
  );
};

export default PatientToDo;