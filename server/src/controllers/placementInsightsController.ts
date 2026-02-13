import { Request, Response } from 'express';

// MOCK DATA (Since we cannot modify existing database tables and no placement tables exist)
const COMPANIES = [
    {
        id: 'c1',
        name: 'Mphasis',
        logo: 'https://ui-avatars.com/api/?name=M&background=0D8ABC&color=fff',
        type: 'IT Services / MNC',
        website: 'https://www.mphasis.com',
        description: 'Cloud and AI-driven IT services company focused on banking, insurance, and enterprise digital transformation.',
        visitFrequency: 'High',
        avgPackage: '4-6 LPA',
        roles: ['Associate Software Engineer'],
        locations: ['Bangalore', 'Chennai', 'Pune'],
        yearsVisited: [2023, 2024],
        placedCount: 45,
        criteria: {
            minCGPA: 6.0,
            branches: ['CSE', 'IT', 'ECE'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Online Test', duration: '60 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: '1:1', duration: '30 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '20 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Aptitude', 'Java', 'SQL'],
        avoidTopics: [],
        insights: ['Focus on communication skills and basic coding.'],
        prepMaterial: []
    },
    {
        id: 'c2',
        name: 'Rhein Brücke',
        logo: 'https://ui-avatars.com/api/?name=RB&background=6b21a8&color=fff',
        type: 'SAP Consulting',
        website: 'https://www.rheincs.com',
        description: 'SAP implementation and enterprise digital transformation consulting company.',
        visitFrequency: 'Medium',
        avgPackage: '5-7 LPA',
        roles: ['SAP Consultant Trainee'],
        locations: ['Chennai'],
        yearsVisited: [2024],
        placedCount: 10,
        criteria: {
            minCGPA: 6.5,
            branches: ['CSE', 'IT', 'Mech'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Online Test', duration: '60 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: '1:1', duration: '30 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '20 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Aptitude', 'Database', 'Logic'],
        avoidTopics: [],
        insights: ['Knowledge of SAP modules is a plus.'],
        prepMaterial: []
    },
    {
        id: 'c3',
        name: 'Vinsinfo',
        logo: 'https://ui-avatars.com/api/?name=V&background=10b981&color=fff',
        type: 'Software Development',
        website: 'https://www.vinsinfo.com',
        description: 'Web and mobile application development company working with startups and SMEs.',
        visitFrequency: 'Medium',
        avgPackage: '3-5 LPA',
        roles: ['Software Developer'],
        locations: ['Chennai'],
        yearsVisited: [2023, 2024],
        placedCount: 15,
        criteria: {
            minCGPA: 6.0,
            branches: ['CSE', 'IT'],
            backlogsAllowed: 1
        },
        recruitmentPattern: [
            { stage: 'Coding', type: 'Hands-on', duration: '90 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: '1:1', duration: '30 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '15 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Web Development', 'JavaScript', 'React'],
        avoidTopics: [],
        insights: ['Practical coding skills are prioritized.'],
        prepMaterial: []
    },
    {
        id: 'c4',
        name: 'VA Tech WABAG',
        logo: 'https://ui-avatars.com/api/?name=VW&background=f59e0b&color=fff',
        type: 'Core Engineering (Water Technology)',
        website: 'https://www.wabag.com',
        description: 'Water treatment and environmental engineering company.',
        visitFrequency: 'Medium',
        avgPackage: '4-6 LPA',
        roles: ['Graduate Engineer Trainee'],
        locations: ['Chennai', 'Global'],
        yearsVisited: [2023, 2024],
        placedCount: 8,
        criteria: {
            minCGPA: 7.0,
            branches: ['Civil', 'Chem', 'Mech'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Online Test', duration: '60 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: 'Core Subjects', duration: '30 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '20 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Water Treatment', 'Environmental Engineering', 'Fluid Mechanics'],
        avoidTopics: ['Coding'],
        insights: ['Strong core knowledge is essential.'],
        prepMaterial: []
    },
    {
        id: 'c5',
        name: 'TCS',
        logo: 'https://ui-avatars.com/api/?name=TCS&background=ef4444&color=fff',
        type: 'IT Services / MNC',
        website: 'https://www.tcs.com',
        description: 'Global IT consulting and services company.',
        visitFrequency: 'High',
        avgPackage: '3.36 - 7 LPA',
        roles: ['Ninja', 'Digital', 'Prime'],
        locations: ['Pan India'],
        yearsVisited: [2022, 2023, 2024],
        placedCount: 150,
        criteria: {
            minCGPA: 6.0,
            branches: ['All'],
            backlogsAllowed: 1
        },
        recruitmentPattern: [
            { stage: 'Online Test', type: 'NQT', duration: '90 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: '1:1', duration: '30 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '20 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Aptitude', 'Coding Basics', 'Communication'],
        avoidTopics: [],
        insights: ['NQT score is crucial for shortlisting.'],
        prepMaterial: []
    },
    {
        id: 'c6',
        name: 'Nexware',
        logo: 'https://ui-avatars.com/api/?name=N&background=8b5cf6&color=fff',
        type: 'Software / IT Services',
        website: 'https://www.nexware-global.com/',
        description: 'Provides enterprise software and IT consulting solutions.',
        visitFrequency: 'Low',
        avgPackage: '3-4 LPA',
        roles: ['Software Trainee'],
        locations: ['Chennai'],
        yearsVisited: [2024],
        placedCount: 6,
        criteria: {
            minCGPA: 6.0,
            branches: ['CSE', 'IT'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Online', duration: '60 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: '1:1', duration: '30 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '15 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Java', '.NET', 'SQL'],
        avoidTopics: [],
        insights: ['Specific technology stack knowledge helps.'],
        prepMaterial: []
    },
    {
        id: 'c7',
        name: 'LTIMindtree',
        logo: 'https://ui-avatars.com/api/?name=LTI&background=ec4899&color=fff',
        type: 'IT Services / MNC',
        website: 'https://www.ltimindtree.com',
        description: 'Digital transformation and consulting company.',
        visitFrequency: 'High',
        avgPackage: '4-6.5 LPA',
        roles: ['Software Engineer'],
        locations: ['Pan India'],
        yearsVisited: [2023, 2024],
        placedCount: 40,
        criteria: {
            minCGPA: 6.5,
            branches: ['CSE', 'IT', 'ECE'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Aptitude + Coding', type: 'Online', duration: '90 mins', difficulty: 'Medium/Hard' },
            { stage: 'Technical Interview', type: '1:1', duration: '40 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '20 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['DSA', 'Java', 'SQL'],
        avoidTopics: [],
        insights: ['Coding round is significant.'],
        prepMaterial: []
    },
    {
        id: 'c8',
        name: 'Infosys',
        logo: 'https://ui-avatars.com/api/?name=Inf&background=06b6d4&color=fff',
        type: 'IT Services / MNC',
        website: 'https://www.infosys.com',
        description: 'Global IT consulting and outsourcing company.',
        visitFrequency: 'High',
        avgPackage: '3.6 - 9.5 LPA',
        roles: ['Systems Engineer', 'Specialist Programmer'],
        locations: ['Pan India'],
        yearsVisited: [2022, 2023, 2024],
        placedCount: 120,
        criteria: {
            minCGPA: 6.0,
            branches: ['All'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Online', duration: '90 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: '1:1', duration: '30 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '20 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Aptitude', 'Pseudocode', 'Communication'],
        avoidTopics: [],
        insights: ['Consistent academic performance is valued.'],
        prepMaterial: []
    },
    {
        id: 'c9',
        name: 'Modpro',
        logo: 'https://ui-avatars.com/api/?name=Mo&background=14b8a6&color=fff',
        type: 'Engineering Services / Software',
        website: 'https://modproengineers.com/',
        description: 'Engineering design and digital engineering solutions company.',
        visitFrequency: 'Low',
        avgPackage: '3-4 LPA',
        roles: ['Design Engineer'],
        locations: ['Chennai', 'Bangalore'],
        yearsVisited: [2024],
        placedCount: 5,
        criteria: {
            minCGPA: 6.5,
            branches: ['Mech', 'Civil', 'EEE'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Technical', type: 'Written/Interview', duration: '60 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '20 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Core Engineering Subjects', 'CAD'],
        avoidTopics: [],
        insights: ['Design tool knowledge (AutoCAD, SolidWorks) is beneficial.'],
        prepMaterial: []
    },
    {
        id: 'c10',
        name: 'MRF',
        logo: 'https://ui-avatars.com/api/?name=MRF&background=f43f5e&color=fff',
        type: 'Manufacturing',
        website: 'https://www.mrftyres.com',
        description: 'India’s largest tyre manufacturing company.',
        visitFrequency: 'Medium',
        avgPackage: '5-6 LPA',
        roles: ['Production Engineer'],
        locations: ['Chennai', 'Pan India'],
        yearsVisited: [2023, 2024],
        placedCount: 12,
        criteria: {
            minCGPA: 7.0,
            branches: ['Mech', 'EEE', 'Chem'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Pen & Paper', duration: '60 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: '1:1', duration: '30 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '20 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Thermodynamics', 'Manufacturing Processes'],
        avoidTopics: [],
        insights: ['Strong physical fitness and core knowledge required.'],
        prepMaterial: []
    },
    {
        id: 'c11',
        name: 'Rane',
        logo: 'https://ui-avatars.com/api/?name=Ra&background=3b82f6&color=fff',
        type: 'Automotive Manufacturing',
        website: 'https://www.ranegroup.com',
        description: 'Automotive component manufacturing company.',
        visitFrequency: 'Medium',
        avgPackage: '4-5 LPA',
        roles: ['GET'],
        locations: ['Chennai', 'Remote'],
        yearsVisited: [2023, 2024],
        placedCount: 15,
        criteria: {
            minCGPA: 7.0,
            branches: ['Mech', 'Auto'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Online', duration: '60 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: '1:1', duration: '30 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '20 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Automobile Engineering', 'Manufacturing'],
        avoidTopics: [],
        insights: ['Core manufacturing concepts are key.'],
        prepMaterial: []
    },
    {
        id: 'c12',
        name: 'Avalon Technologies',
        logo: 'https://ui-avatars.com/api/?name=Av&background=6366f1&color=fff',
        type: 'Electronics Manufacturing',
        website: 'https://www.avalontec.com',
        description: 'Electronic manufacturing services provider.',
        visitFrequency: 'Medium',
        avgPackage: '3-4.5 LPA',
        roles: ['Production Engineer'],
        locations: ['Chennai'],
        yearsVisited: [2024],
        placedCount: 8,
        criteria: {
            minCGPA: 6.5,
            branches: ['ECE', 'EEE'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Online', duration: '60 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: '1:1', duration: '30 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '20 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Electronics', 'Circuit Theory'],
        avoidTopics: [],
        insights: ['Knowledge of PCB and electronics assembly is good.'],
        prepMaterial: []
    },
    {
        id: 'c13',
        name: 'Harmony',
        logo: 'https://ui-avatars.com/api/?name=Ha&background=84cc16&color=fff',
        type: 'IT Services',
        website: 'https://www.harmonytech.com',
        description: 'Software solutions and IT consulting company.',
        visitFrequency: 'Low',
        avgPackage: '3-4 LPA',
        roles: ['Developer'],
        locations: ['Chennai'],
        yearsVisited: [2024],
        placedCount: 5,
        criteria: {
            minCGPA: 6.0,
            branches: ['CSE', 'IT'],
            backlogsAllowed: 1
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Online', duration: '60 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: '1:1', duration: '30 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '15 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Basic Coding', 'SQL'],
        avoidTopics: [],
        insights: ['Good attitude and learning ability.'],
        prepMaterial: []
    },
    {
        id: 'c14',
        name: 'Zoho',
        logo: 'https://ui-avatars.com/api/?name=Z&background=eab308&color=fff',
        type: 'Product-Based Software Company',
        website: 'https://www.zoho.com',
        description: 'SaaS company building CRM and business software.',
        visitFrequency: 'High',
        avgPackage: '6-12 LPA',
        roles: ['Software Developer'],
        locations: ['Chennai', 'Tenkasi'],
        yearsVisited: [2022, 2023, 2024],
        placedCount: 30,
        criteria: {
            minCGPA: 6.0,
            branches: ['All'],
            backlogsAllowed: 2
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Online', duration: '60 mins', difficulty: 'High' },
            { stage: 'Coding', type: 'rounds 1-5', duration: 'Multi-stage', difficulty: 'Hard' },
            { stage: 'Technical Interview', type: 'Deep Dive', duration: '45 mins', difficulty: 'Hard' },
            { stage: 'HR Interview', type: 'Fitment', duration: '20 mins', difficulty: 'Medium' }
        ],
        focusTopics: ['C', 'Java', 'DSA', 'Problem Solving'],
        avoidTopics: ['Frameworks (initially)'],
        insights: ['Heavy focus on problem solving and logic, not just syntax.'],
        prepMaterial: []
    },
    {
        id: 'c15',
        name: 'Mei Team Detailing Solution',
        logo: 'https://ui-avatars.com/api/?name=MT&background=d946ef&color=fff',
        type: 'Engineering Services',
        website: 'https://www.meiteam.com',
        description: 'Mechanical design and detailing services company.',
        visitFrequency: 'Low',
        avgPackage: '3 LPA',
        roles: ['Detailer'],
        locations: ['Chennai'],
        yearsVisited: [2024],
        placedCount: 4,
        criteria: {
            minCGPA: 6.0,
            branches: ['Mech', 'Civil'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Technical', type: 'Drawing/Test', duration: '60 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '15 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Engineering Drawing', 'Detailing Standards'],
        avoidTopics: [],
        insights: ['Accuracy in drawing/reading plans is key.'],
        prepMaterial: []
    },
    {
        id: 'c16',
        name: 'Hexaware',
        logo: 'https://ui-avatars.com/api/?name=He&background=0284c7&color=fff',
        type: 'IT Services / MNC',
        website: 'https://www.hexaware.com',
        description: 'Automation-driven IT services company.',
        visitFrequency: 'Medium',
        avgPackage: '4-6 LPA',
        roles: ['PGET'],
        locations: ['Chennai', 'Pune'],
        yearsVisited: [2023, 2024],
        placedCount: 25,
        criteria: {
            minCGPA: 6.0,
            branches: ['CSE', 'IT', 'ECE'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Online', duration: '60 mins', difficulty: 'Medium' },
            { stage: 'Coding', type: 'Online', duration: '45 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: '1:1', duration: '30 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '15 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['SQL', 'Java', 'Communication'],
        avoidTopics: [],
        insights: ['Good communication is a strong differentiator.'],
        prepMaterial: []
    },
    {
        id: 'c17',
        name: 'Aqua Group',
        logo: 'https://ui-avatars.com/api/?name=Aq&background=0ea5e9&color=fff',
        type: 'Manufacturing',
        website: 'https://www.aquagroup.in',
        description: 'Pump and motor manufacturing company.',
        visitFrequency: 'Medium',
        avgPackage: '3.5-5 LPA',
        roles: ['Engineer'],
        locations: ['Coimbatore', 'Pan India'],
        yearsVisited: [2023, 2024],
        placedCount: 10,
        criteria: {
            minCGPA: 6.5,
            branches: ['Mech', 'EEE'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Test', duration: '60 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: '1:1', duration: '30 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '15 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Fluid Mechanics', 'Machines'],
        avoidTopics: [],
        insights: ['Technical knowledge on pumps and motors.'],
        prepMaterial: []
    },
    {
        id: 'c18',
        name: 'Softsquare',
        logo: 'https://ui-avatars.com/api/?name=So&background=fbbf24&color=fff',
        type: 'Software Development',
        website: 'https://www.softsquare.biz/',
        description: 'Application development and IT services company.',
        visitFrequency: 'Low',
        avgPackage: '3-5 LPA',
        roles: ['Developer'],
        locations: ['Chennai'],
        yearsVisited: [2024],
        placedCount: 5,
        criteria: {
            minCGPA: 6.0,
            branches: ['CSE', 'IT'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Coding', type: 'Task', duration: '90 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: '1:1', duration: '30 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '15 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Salesforce', 'Java', 'Web Tech'],
        avoidTopics: [],
        insights: ['Salesforce ecosystem knowledge is a bonus.'],
        prepMaterial: []
    },
    {
        id: 'c19',
        name: 'Focus R',
        logo: 'https://ui-avatars.com/api/?name=Fo&background=f97316&color=fff',
        type: 'Software Development',
        website: 'https://www.focusrtech.com',
        description: 'Enterprise software solutions company.',
        visitFrequency: 'Low',
        avgPackage: '3-4.5 LPA',
        roles: ['Trainee'],
        locations: ['Chennai'],
        yearsVisited: [2024],
        placedCount: 6,
        criteria: {
            minCGPA: 6.0,
            branches: ['CSE', 'IT'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Online', duration: '60 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: '1:1', duration: '30 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '15 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Oracle', 'Database', 'Java'],
        avoidTopics: [],
        insights: ['ERP knowledge is valued.'],
        prepMaterial: []
    },
    {
        id: 'c20',
        name: 'CTS (Cognizant)',
        logo: 'https://ui-avatars.com/api/?name=CTS&background=10b981&color=fff',
        type: 'IT Services / MNC',
        website: 'https://www.cognizant.com',
        description: 'Multinational IT consulting company.',
        visitFrequency: 'High',
        avgPackage: '4-6.75 LPA',
        roles: ['GenC', 'GenC Next'],
        locations: ['Pan India'],
        yearsVisited: [2022, 2023, 2024],
        placedCount: 180,
        criteria: {
            minCGPA: 6.0,
            branches: ['All'],
            backlogsAllowed: 1
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Online', duration: '90 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: '1:1', duration: '40 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '20 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Aptitude', 'Java', 'Communication'],
        avoidTopics: [],
        insights: ['Communication and basic coding skills are key.'],
        prepMaterial: []
    },
    {
        id: 'c21',
        name: 'Tessolve',
        logo: 'https://ui-avatars.com/api/?name=Te&background=a855f7&color=fff',
        type: 'Semiconductor Engineering',
        website: 'https://www.tessolve.com',
        description: 'Semiconductor testing and product engineering company.',
        visitFrequency: 'Medium',
        avgPackage: '4-6 LPA',
        roles: ['Test Engineer'],
        locations: ['Bangalore', 'Coimbatore'],
        yearsVisited: [2023, 2024],
        placedCount: 12,
        criteria: {
            minCGPA: 6.5,
            branches: ['ECE', 'EEE'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Online', duration: '60 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: '1:1', duration: '40 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '20 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Digital Electronics', 'VLSI', 'Circuits'],
        avoidTopics: [],
        insights: ['Strong fundamentals in digital electronics required.'],
        prepMaterial: []
    },
    {
        id: 'c22',
        name: 'Codingmart',
        logo: 'https://ui-avatars.com/api/?name=CM&background=ef4444&color=fff',
        type: 'Software Development',
        website: 'https://www.codingmart.com',
        description: 'Custom software development company.',
        visitFrequency: 'Medium',
        avgPackage: '4-8 LPA',
        roles: ['Product Engineer'],
        locations: ['Coimbatore', 'Bangalore'],
        yearsVisited: [2023, 2024],
        placedCount: 15,
        criteria: {
            minCGPA: 7.0,
            branches: ['CSE', 'IT'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Coding', type: 'Online', duration: '2-3 hrs', difficulty: 'Hard' },
            { stage: 'Technical Interview', type: '1:1', duration: '60 mins', difficulty: 'Hard' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '20 mins', difficulty: 'Medium' }
        ],
        focusTopics: ['DSA', 'Competitive Programming'],
        avoidTopics: [],
        insights: ['High bar for coding skills.'],
        prepMaterial: []
    },
    {
        id: 'c23',
        name: 'KaarTech',
        logo: 'https://ui-avatars.com/api/?name=K&background=22c55e&color=fff',
        type: 'SAP Consulting',
        website: 'https://www.kaartech.com',
        description: 'SAP implementation partner company.',
        visitFrequency: 'Medium',
        avgPackage: '5-8 LPA',
        roles: ['SAP Consultant'],
        locations: ['Chennai'],
        yearsVisited: [2023, 2024],
        placedCount: 20,
        criteria: {
            minCGPA: 7.0,
            branches: ['All'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Online', duration: '60 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: '1:1', duration: '30 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '20 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Aptitude', 'Database', 'Business Logic'],
        avoidTopics: [],
        insights: ['SAP interest and logic are evaluated.'],
        prepMaterial: []
    },
    {
        id: 'c24',
        name: 'Profit.co',
        logo: 'https://ui-avatars.com/api/?name=Pr&background=3b82f6&color=fff',
        type: 'SaaS Product Company',
        website: 'https://www.profit.co',
        description: 'OKR management platform company.',
        visitFrequency: 'Medium',
        avgPackage: '5-9 LPA',
        roles: ['Software Engineer'],
        locations: ['Chennai', 'Remote'],
        yearsVisited: [2023, 2024],
        placedCount: 10,
        criteria: {
            minCGPA: 7.0,
            branches: ['CSE', 'IT'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Coding', type: 'Online', duration: '90 mins', difficulty: 'Hard' },
            { stage: 'Technical Interview', type: '1:1', duration: '45 mins', difficulty: 'Hard' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '20 mins', difficulty: 'Medium' }
        ],
        focusTopics: ['React', 'Node.js', 'DSA'],
        avoidTopics: [],
        insights: ['Product thinking and full-stack skills are good.'],
        prepMaterial: []
    },
    {
        id: 'c25',
        name: 'Tata Electronics',
        logo: 'https://ui-avatars.com/api/?name=TE&background=069669&color=fff',
        type: 'Electronics Manufacturing',
        website: 'https://www.tataelectronics.co.in',
        description: 'Semiconductor and electronics manufacturing company.',
        visitFrequency: 'Medium',
        avgPackage: '5-7 LPA',
        roles: ['GET'],
        locations: ['Hosur', 'Bangalore'],
        yearsVisited: [2024],
        placedCount: 25,
        criteria: {
            minCGPA: 6.5,
            branches: ['ECE', 'EEE', 'Mech'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Online', duration: '60 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: 'Core', duration: '30 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '20 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Semiconductors', 'Manufacturing'],
        avoidTopics: [],
        insights: ['Interest in core manufacturing is essential.'],
        prepMaterial: []
    },
    {
        id: 'c26',
        name: 'HCL',
        logo: 'https://ui-avatars.com/api/?name=HCL&background=6366f1&color=fff',
        type: 'IT Services / MNC',
        website: 'https://www.hcltech.com',
        description: 'Global IT services and consulting company.',
        visitFrequency: 'High',
        avgPackage: '3.5-5.5 LPA',
        roles: ['Software Engineer'],
        locations: ['Pan India'],
        yearsVisited: [2022, 2023, 2024],
        placedCount: 100,
        criteria: {
            minCGPA: 6.0,
            branches: ['All'],
            backlogsAllowed: 1
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Online', duration: '60 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: '1:1', duration: '30 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '20 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Aptitude', 'C++', 'Java'],
        avoidTopics: [],
        insights: ['Standard service based company process.'],
        prepMaterial: []
    },
    {
        id: 'c27',
        name: 'Taff',
        logo: 'https://ui-avatars.com/api/?name=Ta&background=f87171&color=fff',
        type: 'IT Services',
        website: 'https://www.taffinc.com',
        description: 'Software development and consulting company.',
        visitFrequency: 'Low',
        avgPackage: '3-4.5 LPA',
        roles: ['Developer'],
        locations: ['Chennai'],
        yearsVisited: [2024],
        placedCount: 5,
        criteria: {
            minCGPA: 6.0,
            branches: ['CSE', 'IT'],
            backlogsAllowed: 1
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Online', duration: '60 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: '1:1', duration: '30 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '15 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Basic Coding', 'Web'],
        avoidTopics: [],
        insights: ['Willingness to learn new tech.'],
        prepMaterial: []
    },
    {
        id: 'c28',
        name: '3PR Power Engineers',
        logo: 'https://ui-avatars.com/api/?name=3PR&background=e11d48&color=fff',
        type: 'Electrical Engineering',
        website: 'https://www.prpowerengineers.com/',
        description: 'Power systems engineering and electrical solutions company.',
        visitFrequency: 'Low',
        avgPackage: '3-4 LPA',
        roles: ['Electrical Engineer'],
        locations: ['Chennai'],
        yearsVisited: [2024],
        placedCount: 4,
        criteria: {
            minCGPA: 6.0,
            branches: ['EEE'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Technical', type: 'Interview', duration: '45 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '20 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Power Systems', 'Circuit Theory'],
        avoidTopics: [],
        insights: ['Core electrical knowledge is tested.'],
        prepMaterial: []
    },
    {
        id: 'c29',
        name: 'Deloitte',
        logo: 'https://ui-avatars.com/api/?name=De&background=000000&color=fff',
        type: 'Consulting / IT / Finance',
        website: 'https://www.deloitte.com',
        description: 'One of the Big Four consulting firms.',
        visitFrequency: 'High',
        avgPackage: '6-9 LPA',
        roles: ['Analyst'],
        locations: ['Bangalore', 'Hyderabad'],
        yearsVisited: [2023, 2024],
        placedCount: 20,
        criteria: {
            minCGPA: 6.5,
            branches: ['All'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Online', duration: '60 mins', difficulty: 'High' },
            { stage: 'Technical Interview', type: '1:1', duration: '40 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '20 mins', difficulty: 'Medium' }
        ],
        focusTopics: ['Aptitude', 'Communication', 'Case Studies'],
        avoidTopics: [],
        insights: ['Excellent communication and presentation skills needed.'],
        prepMaterial: []
    },
    {
        id: 'c30',
        name: 'Terv',
        logo: 'https://ui-avatars.com/api/?name=Tr&background=8b5cf6&color=fff',
        type: 'IT Services',
        website: 'https://www.terv.pro',
        description: 'Software development and IT solutions provider.',
        visitFrequency: 'Low',
        avgPackage: '3-4 LPA',
        roles: ['Developer'],
        locations: ['Chennai'],
        yearsVisited: [2024],
        placedCount: 5,
        criteria: {
            minCGPA: 6.0,
            branches: ['CSE', 'IT'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Online', duration: '60 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: '1:1', duration: '30 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '15 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Coding Basics'],
        avoidTopics: [],
        insights: ['Good entry level company.'],
        prepMaterial: []
    },
    {
        id: 'c31',
        name: 'Coforge',
        logo: 'https://ui-avatars.com/api/?name=Co&background=14b8a6&color=fff',
        type: 'IT Services / MNC',
        website: 'https://www.coforge.com',
        description: 'Digital services and IT consulting company.',
        visitFrequency: 'Medium',
        avgPackage: '4.5-6 LPA',
        roles: ['Software Engineer'],
        locations: ['Noida', 'Bangalore'],
        yearsVisited: [2023, 2024],
        placedCount: 20,
        criteria: {
            minCGPA: 6.0,
            branches: ['CSE', 'IT'],
            backlogsAllowed: 0
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Online', duration: '60 mins', difficulty: 'Medium' },
            { stage: 'Technical Interview', type: '1:1', duration: '30 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '15 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Java', 'SQL'],
        avoidTopics: [],
        insights: ['Standard MNC process.'],
        prepMaterial: []
    },
    {
        id: 'c32',
        name: 'Vee Technologies',
        logo: 'https://ui-avatars.com/api/?name=VT&background=f59e0b&color=fff',
        type: 'BPO / IT Services',
        website: 'https://www.veetechnologies.com',
        description: 'Business process outsourcing and IT services company.',
        visitFrequency: 'Medium',
        avgPackage: '3-4 LPA',
        roles: ['Process Associate'],
        locations: ['Bangalore', 'Salem'],
        yearsVisited: [2023, 2024],
        placedCount: 30,
        criteria: {
            minCGPA: 6.0,
            branches: ['All'],
            backlogsAllowed: 2
        },
        recruitmentPattern: [
            { stage: 'Aptitude', type: 'Online', duration: '45 mins', difficulty: 'Easy' },
            { stage: 'Communication', type: 'GD/JAM', duration: '30 mins', difficulty: 'Medium' },
            { stage: 'HR Interview', type: 'Behavioral', duration: '15 mins', difficulty: 'Easy' }
        ],
        focusTopics: ['Communication', 'English'],
        avoidTopics: [],
        insights: ['Communication skills are the primary criteria.'],
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
        company: 'Kaar Technologies (KaarTech)',
        date: '2026-01-27',
        role: 'SAP Consultant / Software Engineer',
        eligibility: 'All Branches, > 7.0 CGPA',
        status: 'Upcoming',
        type: 'On-Campus'
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
