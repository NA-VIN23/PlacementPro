import axios from 'axios';
import type { Exam, Question } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Attach Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('placement_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Handle Errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('placement_token');
            localStorage.removeItem('placement_user');
            // Optional: Redirect to login
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: async (identifier: string, password: string) => {
        const response = await api.post('/auth/login', { identifier, password });
        return response.data; // { token, role }
    }
};



export const studentService = {
    getAvailableExams: async (): Promise<Exam[]> => {
        const response = await api.get('/exams');
        return response.data;
    },
    getExamQuestions: async (examId: string): Promise<{ exam: Exam, questions: Question[] }> => {
        const response = await api.get(`/exams/${examId}/take`);
        return response.data;
    },
    submitExam: async (examId: string, answers: Record<string, string>, terminated?: boolean, violations?: any[]): Promise<{
        message: string;
        score: number;
        total: number;
        maxScore?: number;
        reviewDetails?: any[];
        gradingDetails?: any;
    }> => {
        const response = await api.post(`/exams/${examId}/submit`, { answers, terminated, violations });
        return response.data;
    },
    getStudentResults: async (): Promise<any[]> => {
        const response = await api.get('/exams/student/results');
        return response.data;
    },
    getDashboardStats: async () => {
        const response = await api.get('/exams/student/dashboard-stats');
        return response.data;
    },
    getAssessmentPageData: async () => {
        const response = await api.get('/exams/student/assessment-page');
        return response.data;
    },
    async startInterview(type: 'HR' | 'TECHNICAL') {
        const response = await api.post('/mock-interviews/start', { type });
        return response.data;
    },
    async chatInterview(interviewId: string, message: string) {
        const response = await api.post('/mock-interviews/chat', { interviewId, message });
        return response.data;
    },
    async endInterview(interviewId: string) {
        const response = await api.post('/mock-interviews/end', { interviewId });
        return response.data;
    },
    async getProfile() {
        const response = await api.get('/student/profile');
        return response.data;
    },
    async updateProfile(profileData: any) {
        const response = await api.post('/student/profile', profileData);
        return response.data;
    },
    async runCode(language: string, version: string, code: string, question_id: string, customInput?: string) {
        const response = await api.post('/exams/run-code', { language, version, code, question_id, customInput });
        return response.data;
    },
    async saveCode(exam_id: string, question_id: string, language: string, code: string) {
        return api.post('/exams/save-code', { exam_id, question_id, language, code });
    },
    async getExamAnalysis(examId: string) {
        const response = await api.get(`/exams/${examId}/analysis`);
        return response.data;
    }
};

export const staffService = {
    createExam: async (examData: Partial<Exam> & { questions: any[] }) => {
        const response = await api.post('/exams', examData);
        return response.data;
    },
    getStats: async () => {
        const response = await api.get('/exams/stats/dashboard');
        return response.data;
    },
    getAllSubmissions: async (): Promise<any[]> => {
        const response = await api.get('/exams/staff/submissions');
        return response.data;
    },
    extractPdf: async (file: File) => {
        const formData = new FormData();
        formData.append('pdf', file);
        const response = await api.post('/exams/extract-pdf', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    getStudents: async () => {
        const response = await api.get('/users/students');
        return response.data;
    }
};

export const adminService = {
    getUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    },
    addUser: async (userData: any) => {
        const response = await api.post('/users/add', userData);
        return response.data;
    },
    toggleUserStatus: async (userId: string, isActive: boolean) => {
        const response = await api.patch(`/users/${userId}/toggle-active`, { isActive });
        return response.data;
    },
    updateProfile: async (data: { email: string; name?: string; department?: string }) => {
        const response = await api.patch('/users/profile', data);
        return response.data;
    },
    getLogs: async () => {
        const response = await api.get('/users/logs');
        return response.data;
    },
    bulkImportUsers: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/users/import-bulk', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    deleteUser: async (userId: string) => {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
    },
    assignClassAdvisor: async (data: { staffId: string, batch: string, section: string, department: string }) => {
        const response = await api.post('/users/staff/assign-class-advisor', data);
        return response.data;
    },
    getStaffList: async () => {
        const response = await api.get('/users/staff/list');
        return response.data;
    }
};

export const hodService = {
    getStats: async () => {
        const response = await api.get('/hod/stats');
        return response.data;
    },
    getStaff: async () => {
        const response = await api.get('/hod/staff');
        return response.data;
    },
    getStudents: async () => {
        const response = await api.get('/hod/students');
        return response.data;
    },
    getAnalytics: async () => {
        const response = await api.get('/hod/analytics');
        return response.data;
    },
    getStaffPerformance: async (staffId: string) => {
        const response = await api.get(`/hod/staff/${staffId}/performance`);
        return response.data;
    },
    compareClasses: async (classA: string, classB: string) => {
        const response = await api.post('/hod/compare-classes', { classA, classB });
        return response.data;
    },
    getStaffStudents: async (staffId: string) => {
        const response = await api.get(`/hod/staff-students/${staffId}`);
        return response.data;
    }
};
