import {
    LayoutDashboard,
    FileText,
    MessageSquare,
    Trophy,
    User,
    Users,
    ClipboardList,
    BarChart,
    BookOpen,
    Briefcase
} from 'lucide-react';

export const STUDENT_NAV = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    { label: 'Assessment', icon: FileText, path: '/student/assessment' },
    { label: 'Learning', icon: BookOpen, path: '/student/learning' },
    { label: 'Communication AI', icon: MessageSquare, path: '/student/communication' },
    { label: 'Leaderboard', icon: Trophy, path: '/student/leaderboard' },
    { label: 'Resume Builder (ATS)', icon: ClipboardList, path: '/student/resume-builder' },
    { label: 'Placement Insights', icon: Briefcase, path: '/student/placement-insights' },
];

export const STAFF_NAV = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/staff/dashboard' },
    { label: 'Assign Assessment', icon: ClipboardList, path: '/staff/assign-assessment' },
    { label: 'Student Database', icon: Users, path: '/staff/students' },
    { label: 'Student Analysis', icon: BarChart, path: '/staff/analysis' },
    { label: 'Profile', icon: User, path: '/staff/profile' },
];

export const HOD_NAV = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/hod/dashboard' },
    { label: 'Staff', icon: Users, path: '/hod/staff' },
    { label: 'Students', icon: Users, path: '/hod/students' },
    { label: 'Department Analytics', icon: BarChart, path: '/hod/analytics' },
];

export const ADMIN_NAV = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'User Management', icon: Users, path: '/admin/users' },
    { label: 'Class Advisors', icon: ClipboardList, path: '/admin/staff-assignment' },
    { label: 'Profile', icon: User, path: '/admin/profile' },
];
