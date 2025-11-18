
import React, { use, useState, useEffect } from 'react';
import api from './api';

const ListAll = () => {
    const [allDoc, setAllDoc] = useState([]); // All Doctor IDs from BE
    const [allPat, setAllPat] = useState([]); // All Patient IDs from BE

    const [listMode, setListMode] = useState('Ldoctor'); 

    //to handle edits
    const [editUser, setEditUser] = useState(null); // track which user is being edited
    const [editData, setEditData] = useState({ username: "", password: "" });

    
    //useEffect to fetch list asap the component loads
    useEffect(() => {
    const fetchAllDoctors = async () => {
        try {
            if (listMode === 'Ldoctor') {
        const response = await api.get('/doctors'); // backend endpoint
        setAllDoc(response.data); // assuming response.data is an array of doctors
        }
        else if (listMode === 'Lpatient') {
        const response = await api.get('/patients'); // backend endpoint
        setAllPat(response.data); // assuming response.data is an array of patients
        }
        } catch (error) {
        console.error('Error fetching list:', error);
        }
    };
    fetchAllDoctors();
    }, [listMode]);

    const handleInputChange = (e) => {
        setListMode(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    };

    //edit function
    const handleEdit = async (id) => {
        try {
            if (listMode === 'Ldoctor') {
            await api.put(`/doctor/${id}`, editData); // calling the backend edit endpoint
            setAllDoc(allDoc.map(
                (doc) => doc.id === id ? 
                { ...doc, username: editData.username } // Update username (t)
                : doc   // No change (f)
            ))
        }
            else if (listMode === 'Lpatient') {
            await api.put(`/patient/${id}`); // calling the backend edit endpoint
            setAllPat(allPat.map(
                (pat) => pat.id === id ? 
                { ...pat, username: editData.username }
                : pat
            ))
            }
            alert('Edit successful!');
            setEditUser(null); // exit edit mode
            setEditData({ username: "", password: "" }); // reset edit data
        } catch (error) {
            console.error('Error during edit:', error);
            alert('Edit failed. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        try {
            if (listMode === 'Ldoctor') {
            await api.delete(`/doctor/${id}`); // calling the backend delete endpoint
            setAllDoc(allDoc.filter(doc => doc.id !== id)); // Update local state
            }
            else if (listMode === 'Lpatient') {
            await api.delete(`/patient/${id}`); // calling the backend delete endpoint
            setAllPat(allPat.filter(pat => pat.id !== id)); // Update local state
            }
            alert('Deletion successful!');
        } catch (error) {
            console.error('Error during deletion:', error);
            alert('Deletion failed. Please try again.');
        }
    };
    return (
        <div className="contain">
            <h2>List All Users</h2>
            <select className='form-select mb-4' 
            value={listMode}
            onChange={(e) => setListMode(e.target.value)}
            >
                <option value="Ldoctor">List All Doctors</option>
                <option value="Lpatient">List All Patients</option>
            </select>
            {listMode === 'Ldoctor' && (
                <div>
                    <h3>All Doctors</h3>
                    <ul className="list-group">
                        {allDoc.map((doc) => (
                            <li key={doc.id} className="list-group-item">
                                ID: {doc.id}, Name: {doc.username}
                                {editUser === doc.id ? (
                                    // Render edit form
                                    <div>
                                        <input
                                            type="text"
                                            className="form-control mb-2"
                                            name="username"
                                            value={editData.username}
                                            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                            placeholder="New Username"
                                        />
                                        <input
                                            type="password"
                                            className="form-control mb-2"
                                            name="password"
                                            value={editData.password}
                                            onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                                            placeholder="New Password"
                                        />
                                        <button
                                            className="btn btn-success btn-sm mx-2"
                                            onClick={() =>
                                                handleEdit(doc.id)

                                            }
                                        >
                                            Save
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className="btn btn-warning btn-sm mx-2 float-end"
                                        onClick={() => setEditUser(doc.id)} // enter edit mode
                                    >
                                        Edit   
                                    </button>
                                )}  

                                <button
                                    className="btn btn-danger btn-sm float-end"
                                    onClick={() => handleDelete(doc.id)}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {listMode === 'Lpatient' && (
                <div>
                    <h3>All Patients</h3>
                    <ul className="list-group">
                        {allPat.map((pat) => (
                            <li key={pat.id} className="list-group-item">
                                ID: {pat.id}, Name: {pat.username}
                                <button
                                    className = "btn btn-warning btn-sm mx-2 float-end"
                                    //edit function
                                    onClick={() => handleEdit(pat.id)}
                                >
                                    Edit   
                                </button>
                                <button
                                    className="btn btn-danger btn-sm float-end"
                                    onClick={() => handleDelete(pat.id)}
                                >
                                    Delete
                                </button>

                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ListAll;
