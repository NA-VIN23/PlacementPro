export type UserRole = 'STUDENT' | 'STAFF' | 'ADMIN';

export interface User {
    id: string;
    name: string;
    role: UserRole;
    email: string;
    avatar?: string;
    rollNumber?: string; // For students
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
