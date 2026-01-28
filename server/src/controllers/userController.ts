import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '../models/types';
// MOCK USER STORE (Shared with Auth ideally, but simplified here)
export let MOCK_USERS_DB: User[] = [
    {
        id: '1',
        role: 'ADMIN',
        email: 'admin@college.edu',
        password_hash: '$2a$10$NotARealHashButWorksForMock',
        is_active: true
    }
];

export const addUser = async (req: Request, res: Response) => {
    const { role, email, registration_number, department, batch, password } = req.body;

    // Validation
    if (role === 'STUDENT' && !registration_number) {
        return res.status(400).json({ message: 'Registration number required for students' });
    }

    // Check existing
    const exists = MOCK_USERS_DB.some(u => u.email === email || (registration_number && u.registration_number === registration_number));
    if (exists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: User = {
        id: Date.now().toString(), // Simple ID
        role: role as UserRole,
        email,
        registration_number,
        department,
        batch,
        password_hash: hashedPassword,
        is_active: true,
        created_at: new Date()
    };

    MOCK_USERS_DB.push(newUser);
    res.status(201).json({ message: 'User created successfully', userId: newUser.id });
};

export const listUsers = (req: Request, res: Response) => {
    // Filter sensitive data
    const users = MOCK_USERS_DB.map(({ password_hash, ...u }) => u);
    res.json(users);
};

export const toggleUserParams = (req: Request, res: Response) => {
    const { id } = req.params;
    const user = MOCK_USERS_DB.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    user.is_active = !user.is_active;
    res.json({ message: `User ${user.is_active ? 'activated' : 'deactivated'}`, userId: user.id });
};
