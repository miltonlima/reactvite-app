import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
                localStorage.setItem('token', token);
            } catch (error) {
                console.error('Invalid token');
                setToken(null);
                setUser(null);
                localStorage.removeItem('token');
            }
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    const login = async (username, password) => {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const { token } = await response.json();
            setToken(token);
        } else {
            // Handle error
            console.error('Login failed');
        }
    };

    const register = async (username, password) => {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            // Handle successful registration
            console.log('Registration successful');
        } else {
            // Handle error
            console.error('Registration failed');
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
