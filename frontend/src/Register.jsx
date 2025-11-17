//React form → send data to FastAPI → FastAPI saves to database via SQLAlchemy.

import React, { useState } from 'react';
import api from './api';
import ListAll from './ListAll';


const Register = () => {
      // State to switch between views: 'doctor' or 'patient'
  const [viewMode, setViewMode] = useState('Rdoctor'); 
     
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    }
    );

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (viewMode === 'Rdoctor') {
                await api.post('/doctor/', formData); //calling the backend register endpoint
            } 

            else if (viewMode === 'Rpatient') {
                await api.post('/patient/', formData); //calling the backend register endpoint
            }
            alert('Registration successful!');
        } catch (error) {
            console.error('Error during registration:', error);
            alert('Registration failed. Please try again.');
        }
    };

    return (
        <div className="container mt-5">
            <h2>User Registration</h2>
            <select className='form-select mb-4' 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            >
                <option value="Rdoctor">Register a Doctor</option>
                <option value="Rpatient">Register a Patient</option>
            </select>

            <form onSubmit = {handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Name</label>
                    <input
                        type="text"
                        className="form-control"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                    />

                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <button type="submit" className="btn btn-primary">Register</button>
                    
                </div>
            </form>
            <ListAll />
        </div>
    )
}


export default Register;