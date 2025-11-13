import React, { useState } from 'react';
// Assuming DoctorForm.jsx and PatientToDo.jsx were created as suggested previously
import DoctorForm from './DoctorForm';
import PatientToDo from './PatientToDo';
import './App.css'; // Your custom styles

const App = () => {
  // State to switch between views: 'doctor' or 'patient'
  const [viewMode, setViewMode] = useState('doctor'); 

  // Function to determine which component to render
  const renderView = () => {
    switch (viewMode) {
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
      <nav className='navbar navbar-expand-lg navbar-dark bg-dark'>
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Rx Tracker</a>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <button 
                  className={`btn btn-link nav-link ${viewMode === 'doctor' ? 'text-warning' : 'text-white'}`} 
                  onClick={() => setViewMode('doctor')}
                >
                  🧑‍⚕️ Doctor Mode (Data Entry)
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`btn btn-link nav-link ${viewMode === 'patient' ? 'text-warning' : 'text-white'}`}
                  onClick={() => setViewMode('patient')}
                >
                  💊 Patient Mode (To-Do List)
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      
      {/* --- Main Content Area --- */}
      <div className="container mt-4">
        {renderView()}
      </div>
    </div>
  );
};

export default App;