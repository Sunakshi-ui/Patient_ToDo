//React form → send data to FastAPI → FastAPI saves to database via SQLAlchemy.

import React, { useState } from 'react';
import api from './api';

const Register = () => {
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
            await api.post('/patient/', formData); //calling the backend register endpoint
            alert('Registration successful!');
        } catch (error) {
            console.error('Error during registration:', error);
            alert('Registration failed. Please try again.');
        }
    };

    return (
        <div className="container mt-5">
            <h2>User Registration</h2>
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
        </div>
    )
}

export default Register;