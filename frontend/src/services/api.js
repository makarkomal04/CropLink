import axios from 'axios';

export const apiBaseUrl = window.location.origin.includes('localhost')
    ? 'http://13.127.154.240:5000'
    : '';

const api = axios.create({
    baseURL: `${apiBaseUrl}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to headers
api.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('user');
        if (user) {
            const token = JSON.parse(user).token;
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
