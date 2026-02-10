import { Request, Response } from 'express';

// MOCK DATA (Since we cannot modify existing database tables and no placement tables exist)
const COMPANIES = [
    {
        id: 'c1',
        name: 'TechCorp Solutions',
        logo: 'https://ui-avatars.com/api/?name=TC&background=0D8ABC&color=fff',
        type: 'Product',
        website: 'https://techcorp.com',
        description: 'Leading provider of cloud-based enterprise solutions.',
        visitFrequency: 'High',
        avgPackage: '12 LPA',
        roles: ['SDE-1', 'Data Analyst'],
        locations: ['Bangalore', 'Hyderabad'],
        yearsVisited: [2022, 2023, 2024],
        placedCount: 45,
        criteria: {
            minCGPA: 7.5,
            branches: ['CSE', 'IT', 'ECE'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'MCQ', duration: '60 mins', difficulty: 'Medium' },
            { stage: 'Coding', type: 'DSC + Algo', duration: '90 mins', difficulty: 'Hard' },
            { stage: 'Technical Interview', type: '1:1', duration: '45 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '30 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Dynamic Programming', 'Graph Theory', 'SQL', 'OS Concepts'],
        avoidTopics: ['Networking', 'Compiler Design'],
        insights: [
            'Focus heavily on Graphs and DP for the coding round.',
            'System design basics are asked in the technical round.',
            'Be prepared for "Why TechCorp?" in HR.'
        ],
        prepMaterial: [
            { title: 'TechCorp SDE Sheet', url: '#' },
            { title: 'Past Interview Experiences', url: '#' }
        ]
    },
    {
        id: 'c2',
        name: 'InnoVate Systems',
        logo: 'https://ui-avatars.com/api/?name=IS&background=6b21a8&color=fff',
        type: 'Service',
        website: 'https://innovate.com',
        description: 'Global IT services and consulting company.',
        visitFrequency: 'Medium',
        avgPackage: '6.5 LPA',
        roles: ['System Engineer'],
        locations: ['Pune', 'Chennai'],
        yearsVisited: [2021, 2023],
        placedCount: 120,
        criteria: {
            minCGPA: 6.0,
            branches: ['All'],
            backlogsAllowed: 1
        },
        recruitmentPattern: [
            { stage: 'Online Assessment', type: 'Aptitude + Verbal', duration: '90 mins', difficulty: 'Easy' },
            { stage: 'Technical Interview', type: 'Basics', duration: '30 mins', difficulty: 'Easy' },
            { stage: 'HR Interview', type: 'General', duration: '15 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Java Basics', 'OOPs', 'DBMS', 'Communication Skills'],
        avoidTopics: ['Advanced DSA', 'System Design'],
        insights: [
            'Good communication skills are key.',
            'Know your project thoroughly.',
            'Basics of SQL and Java are sufficient.'
        ],
        prepMaterial: [
            { title: 'Aptitude Practice', url: '#' }
        ]
    },
    {
        id: 'c3',
        name: 'DataFlow Analytics',
        logo: 'https://ui-avatars.com/api/?name=DA&background=10b981&color=fff',
        type: 'Startup',
        website: 'https://dataflow.io',
        description: 'Fast-growing analytics startup.',
        visitFrequency: 'Low',
        avgPackage: '18 LPA',
        roles: ['Data Scientist', 'ML Engineer'],
        locations: ['Remote', 'Bangalore'],
        yearsVisited: [2024],
        placedCount: 5,
        criteria: {
            minCGPA: 8.0,
            branches: ['CSE', 'IT'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Resume Shortlisting', type: 'Manual', duration: '-', difficulty: 'High' },
            { stage: 'Take-home Assignment', type: 'ML Model', duration: '48 hours', difficulty: 'Hard' },
            { stage: 'Technical Deep Dive', type: '1:1', duration: '60 mins', difficulty: 'Hard' }
        ],
        focusTopics: ['Machine Learning', 'Python', 'Statistics', 'Data Visualization'],
        avoidTopics: ['Web Development', 'App Development'],
        insights: [
            'Have a strong portfolio of projects.',
            'Be ready to explain the math behind your models.'
        ],
        prepMaterial: []
    }
];

const PLACEMENT_HISTORY = [
    { year: 2024, company: 'TechCorp Solutions', studentsPlaced: 15, avgPackage: '12 LPA', role: 'SDE-1' },
    { year: 2024, company: 'DataFlow Analytics', studentsPlaced: 5, avgPackage: '18 LPA', role: 'Data Scientist' },
    { year: 2023, company: 'TechCorp Solutions', studentsPlaced: 12, avgPackage: '11.5 LPA', role: 'SDE-1' },
    { year: 2023, company: 'InnoVate Systems', studentsPlaced: 55, avgPackage: '6 LPA', role: 'System Engineer' },
    { year: 2022, company: 'TechCorp Solutions', studentsPlaced: 18, avgPackage: '10 LPA', role: 'SDE-1' },
    { year: 2021, company: 'InnoVate Systems', studentsPlaced: 65, avgPackage: '5.5 LPA', role: 'System Engineer' }
];

const UPCOMING_DRIVES = [
    {
        id: 'd1',
        company: 'CloudFirst',
        date: '2026-03-15',
        role: 'Cloud Engineer',
        eligibility: 'All Branches, > 7.0 CGPA',
        status: 'Upcoming',
        type: 'On-Campus'
    },
    {
        id: 'd2',
        company: 'FinTech Global',
        date: '2026-03-20',
        role: 'Analyst',
        eligibility: 'CSE/IT, > 8.0 CGPA',
        status: 'Upcoming',
        type: 'On-Campus'
    },
    {
        id: 'd3',
        company: 'AutoMotive Giants',
        date: '2026-04-05',
        role: 'Graduate Engineer Trainee',
        eligibility: 'Mech/Auto/EEE, > 6.5 CGPA',
        status: 'Tentative',
        type: 'Off-Campus'
    }
];

export const getOverview = async (req: Request, res: Response) => {
    try {
        // Calculate mock stats
        const totalCompanies = COMPANIES.length;
        const totalPlaced = PLACEMENT_HISTORY.reduce((acc, curr) => acc + curr.studentsPlaced, 0);
        // Mock avg CGPA logic
        const avgCGPA = 7.8;

        const recentCompanies = PLACEMENT_HISTORY.slice(0, 5);

        res.json({
            kpi: {
                totalCompanies,
                studentsPlaced: totalPlaced,
                avgCGPA
            },
            placementHistory: PLACEMENT_HISTORY,
            recentCompanies,
            upcomingDrives: UPCOMING_DRIVES
        });
    } catch (error) {
        console.error('Error fetching placement overview:', error);
        res.status(500).json({ error: 'Failed to fetch overview' });
    }
};

export const getCompanies = async (req: Request, res: Response) => {
    try {
        // Filters can be applied here using req.query if needed, simplified for now
        res.json(COMPANIES);
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
};

export const getCompanyDetail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const company = COMPANIES.find(c => c.id === id);

        if (!company) {
            res.status(404).json({ error: 'Company not found' });
            return;
        }

        const history = PLACEMENT_HISTORY.filter(h => h.company === company.name);

        res.json({
            ...company,
            history
        });
    } catch (error) {
        console.error('Error fetching company detail:', error);
        res.status(500).json({ error: 'Failed to fetch company detail' });
    }
};

export const getUpcomingDrives = async (req: Request, res: Response) => {
    try {
        res.json(UPCOMING_DRIVES);
    } catch (error) {
        console.error('Error fetching upcoming drives:', error);
        res.status(500).json({ error: 'Failed to fetch drives' });
    }
};
