// frontend/my-vite-app/src/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000', // Adjust the baseURL as needed
});

export default api;