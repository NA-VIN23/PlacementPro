import React, { createContext, useContext, useState } from 'react';
import type { UserRole } from '../types';

// Data Types
export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    batch?: string; // Student
    department?: string; // Staff/Student
    status: 'Active' | 'Inactive';
    avatar?: string;
}

export interface Question {
    id: number;
    text: string;
    type: 'mcq' | 'code';
    options?: string[];
    correctAnswer?: string;
    explanation?: string;
}

export interface Assessment {
    id: string;
    title: string;
    type: 'Aptitude' | 'Logical' | 'Technical' | 'Coding';
    source: 'Manual' | 'QuestionBank' | 'AI_PDF';
    purpose: 'Practice' | 'Evaluation';

    // Evaluation Parameters
    duration: number; // minutes
    questions: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    attemptLimit: number;
    accessCode?: string;

    // Scheduling
    status: 'Pending' | 'Completed' | 'Missed' | 'Active';
    startDate?: string;
    dueDate: string;

    // Content
    questionList?: Question[];
    assignedTo: {
        type: 'Batch' | 'Department' | 'Individual';
        value: string;
    }[];
}

export interface Submission {
    id: string;
    studentId: string;
    studentName: string;
    assessmentId: string;
    assessmentTitle: string;
    submittedAt: string;
    score?: number; // if graded
    maxScore: number;
    status: 'Pending' | 'Graded';
    answers: any[];
}

interface DataContextType {
    users: User[];
    assessments: Assessment[];
    submissions: Submission[];
    addUser: (user: Omit<User, 'id'>) => void;
    deleteUser: (id: string) => void;
    addAssessment: (assessment: Omit<Assessment, 'id'>) => void;
    submitAssessment: (submission: Submission) => void;
    gradeSubmission: (id: string, score: number) => void;
    getStudentStats: (studentId: string) => { testsTaken: number; avgScore: number; pending: number };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Mock Initial Data
    const [users, setUsers] = useState<User[]>([
        { id: '1', name: 'Rahul Kumar', email: 'rahul@college.edu', role: 'STUDENT', batch: '2024', department: 'CSE', status: 'Active' },
        { id: '2', name: 'Priya Sharma', email: 'priya@college.edu', role: 'STUDENT', batch: '2025', department: 'ECE', status: 'Active' },
        { id: '3', name: 'Dr. Amit Verma', email: 'amit@college.edu', role: 'STAFF', department: 'CSE', status: 'Active' },
        { id: '4', name: 'Admin User', email: 'admin@college.edu', role: 'ADMIN', status: 'Active' },
    ]);

    const [assessments, setAssessments] = useState<Assessment[]>([
        {
            id: '1',
            title: 'Java Core Fundamentals',
            type: 'Technical',
            source: 'Manual',
            purpose: 'Evaluation',
            duration: 45,
            questions: 25,
            difficulty: 'Medium',
            attemptLimit: 1,
            status: 'Active',
            dueDate: '2024-02-10',
            assignedTo: [{ type: 'Batch', value: '2024' }]
        },
        {
            id: '2',
            title: 'Data Structures 101',
            type: 'Technical',
            source: 'QuestionBank',
            purpose: 'Practice',
            duration: 60,
            questions: 30,
            difficulty: 'Hard',
            attemptLimit: 3,
            status: 'Pending',
            dueDate: '2024-02-15',
            assignedTo: [{ type: 'Department', value: 'CSE' }]
        },
        {
            id: '3',
            title: 'Verbal Reasoning',
            type: 'Aptitude',
            source: 'Manual',
            purpose: 'Practice',
            duration: 30,
            questions: 20,
            difficulty: 'Easy',
            attemptLimit: 5,
            status: 'Pending',
            dueDate: '2024-02-05',
            assignedTo: [{ type: 'Batch', value: 'All' }]
        },
    ]);

    const [submissions, setSubmissions] = useState<Submission[]>([
        {
            id: 'sub1',
            studentId: '1',
            studentName: 'Rahul Kumar',
            assessmentId: 'mock1',
            assessmentTitle: 'Mock Interview Prep',
            submittedAt: 'Jan 28, 2024 • 10:30 AM',
            maxScore: 100,
            status: 'Pending',
            answers: []
        },
        {
            id: 'sub2',
            studentId: '2',
            studentName: 'Priya Sharma',
            assessmentId: '1',
            assessmentTitle: 'Java Core Fundamentals',
            submittedAt: 'Jan 27, 2024 • 02:15 PM',
            score: 85,
            maxScore: 100,
            status: 'Graded',
            answers: []
        }
    ]);

    // Actions
    const addUser = (userData: Omit<User, 'id'>) => {
        const newUser = { ...userData, id: Math.random().toString(36).substr(2, 9) };
        setUsers([...users, newUser]);
    };

    const deleteUser = (id: string) => {
        setUsers(users.filter(u => u.id !== id));
    };

    const addAssessment = (assessmentData: Omit<Assessment, 'id'>) => {
        const newAssessment = { ...assessmentData, id: Math.random().toString(36).substr(2, 9) };
        setAssessments([...assessments, newAssessment]);
    };

    const submitAssessment = (submission: Submission) => {
        setSubmissions([...submissions, submission]);
    };

    const gradeSubmission = (id: string, score: number) => {
        setSubmissions(submissions.map(sub =>
            sub.id === id ? { ...sub, score, status: 'Graded' } : sub
        ));
    };

    const getStudentStats = (studentId: string) => {
        const studentSubmissions = submissions.filter(s => s.studentId === studentId && s.status === 'Graded');
        const pending = assessments.length - submissions.filter(s => s.studentId === studentId).length;

        let totalScore = 0;
        studentSubmissions.forEach(s => totalScore += (s.score || 0));

        return {
            testsTaken: studentSubmissions.length,
            avgScore: studentSubmissions.length ? Math.round(totalScore / studentSubmissions.length) : 0,
            pending: pending > 0 ? pending : 0
        };
    };

    return (
        <DataContext.Provider value={{
            users, assessments, submissions,
            addUser, deleteUser, addAssessment, submitAssessment, gradeSubmission, getStudentStats
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
