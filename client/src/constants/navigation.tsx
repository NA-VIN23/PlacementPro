import {
    LayoutDashboard,
    FileText,
    MessageSquare,
    Trophy,
    User,
    Users,
    ClipboardList,
    BarChart,
    Settings
} from 'lucide-react';

export const STUDENT_NAV = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    { label: 'Assessment', icon: FileText, path: '/student/assessment' },
    { label: 'Communication AI', icon: MessageSquare, path: '/student/communication' },
    { label: 'Leaderboard', icon: Trophy, path: '/student/leaderboard' },
    { label: 'Profile', icon: User, path: '/student/profile' },
];

export const STAFF_NAV = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/staff/dashboard' },
    { label: 'Assign Assessment', icon: ClipboardList, path: '/staff/assign-assessment' },
    { label: 'Assign Mock Interview', icon: MessageSquare, path: '/staff/assign-interview' },
    { label: 'Student Analysis', icon: BarChart, path: '/staff/analysis' },
    { label: 'Profile', icon: User, path: '/staff/profile' },
];

export const ADMIN_NAV = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'User Management', icon: Users, path: '/admin/users' },
    { label: 'Profile', icon: User, path: '/admin/profile' },
];
