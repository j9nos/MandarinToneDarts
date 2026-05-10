import api from './api';

const AUTH_URL = '/auth/';


export const register = (username, password) => {
    return api.post(AUTH_URL + 'register', { 
        username, 
        password 
    });
};


export const login = async (username, password) => {
    const response = await api.post(AUTH_URL + 'login', { 
        username, 
        password 
    });

    if (response.data && response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
};


export const logout = () => {
    localStorage.removeItem('user');
};


export const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    if (!user) return null;
    
    try {
        return JSON.parse(user);
    } catch (e) {
        console.error("Error parsing user from localStorage", e);
        return null;
    }
};

