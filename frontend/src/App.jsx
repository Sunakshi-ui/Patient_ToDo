import React, { useState, useEffect } from 'react';
// Assuming DoctorForm.jsx and PatientToDo.jsx were created as suggested previously
import DoctorForm from './DoctorForm';
import PatientToDo from './PatientToDo';
import  Register  from './Register';
import './App.css'; // Your custom styles

const App = () => {
  // State to switch between views: 'doctor' or 'patient'
  const [viewMode, setViewMode] = useState('doctor'); 

  // Function to determine which component to render
  const renderView = () => {
    switch (viewMode) {
      case 'register':
        return <Register />;
      case 'doctor':
        // The Doctor view is the data entry form
        return <DoctorForm />;
      case 'patient':
        // The Patient view is the interactive To-Do list
        return <PatientToDo />;
      default:
        return <div>Select a user mode.</div>;
    }
  };

  return (
    <div>
      {/* --- Navigation Bar (User Mode Selector) --- */}
      <nav className='navbar'>
              <a className="nav-item">
                <button 
                  onClick={() => setViewMode('register')}
                >
                  Admin
                </button>
              </a>
              <a className="nav-item">
                <button 
                  onClick={() => setViewMode('doctor')}
                >
                  Doctor Mode (Data Entry)
                </button>
              </a>
              <a className="nav-item">
                <button 
                  onClick={() => setViewMode('patient')}
                >
                  Patient Mode (To-Do List)
                </button>
              </a>

      </nav>
      
      {/* --- Main Content Area --- */}
      <div className="contain">
        {renderView()}
      </div>
    </div>
  );
};

export default App;