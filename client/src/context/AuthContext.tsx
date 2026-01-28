import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (role: UserRole) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    // Check local storage on mount (simulated persistence)
    useEffect(() => {
        const storedUser = localStorage.getItem('placement_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (role: UserRole) => {
        let mockUser: User;

        switch (role) {
            case 'STUDENT':
                mockUser = {
                    id: 's1',
                    name: 'Rahul Kumar',
                    role: 'STUDENT',
                    email: 'rahul@college.edu',
                    rollNumber: 'CS2024001'
                };
                break;
            case 'STAFF':
                mockUser = {
                    id: 'st1',
                    name: 'Prof. Sharma',
                    role: 'STAFF',
                    email: 'sharma@college.edu'
                };
                break;
            case 'ADMIN':
                mockUser = {
                    id: 'a1',
                    name: 'Administrator',
                    role: 'ADMIN',
                    email: 'admin@college.edu'
                };
                break;
            default:
                return;
        }

        setUser(mockUser);
        localStorage.setItem('placement_user', JSON.stringify(mockUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('placement_user');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
