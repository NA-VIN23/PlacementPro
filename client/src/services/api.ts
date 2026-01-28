/**
 * API Service Placeholder
 * 
 * Future integration points:
 * - Axios instance configuration
 * - Request interceptors for attaching tokens
 * - Response interceptors for handling errors (401, 403)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Example generic fetcher
export const apiClient = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const method = options.method || 'GET';
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return mock data for now
    console.log(`[API Call] ${method} ${endpoint}`);
    return {} as T;
};

export const authService = {
    login: async (credentials: any) => {
        // Post to /auth/login
    },
    logout: async () => {
        // Post to /auth/logout
    }
};

export const studentService = {
    getDashboardStats: async () => {
        // Get /student/stats
    },
    getAssessments: async () => {
        // Get /assessments/student
    }
};
