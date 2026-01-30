import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (identifier: string, password: string, requiredRole?: string) => Promise<boolean>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check local storage on mount (simulated persistence)
    useEffect(() => {
        const storedUser = localStorage.getItem('placement_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (identifier: string, password: string, requiredRole?: string) => {
        try {
            const data = await authService.login(identifier, password);

            // Validate Role if specified
            if (requiredRole && data.role !== requiredRole) {
                throw new Error(`Access Denied: You must be a ${requiredRole} to login here.`);
            }

            // Decode user info from token (or just store minimal info)
            // For now, we manually reconstruct user object or fetch profile if needed
            // But backend validates token, so we just need valid token.
            const user: User = {
                id: data.id || 'sub-from-token',
                role: data.role,
                name: data.name,
                email: data.email || identifier,
                department: data.department,
                batch: data.batch,
                registration_number: data.registration_number,
                is_active: true
            };

            setUser(user);
            localStorage.setItem('placement_token', data.token);
            localStorage.setItem('placement_user', JSON.stringify(user));
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('placement_user');
        localStorage.removeItem('placement_token');
        // Force full page reload to clear memory/state and prevent "back" button navigation
        window.location.replace('/');
    };

    const updateUser = (updates: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('placement_user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading: loading, login, logout, updateUser }}>
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
