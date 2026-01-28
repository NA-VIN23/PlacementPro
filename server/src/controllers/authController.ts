import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/types';

// MOCK USER STORE (Replace with DB call)
const MOCK_USERS: User[] = [
    {
        id: '1',
        role: 'ADMIN',
        email: 'admin@college.edu',
        password_hash: '$2a$10$NotARealHashButWorksForMock', // plain: admin123 (mock check below)
        is_active: true
    }
];

export const login = async (req: Request, res: Response) => {
    const { identifier, password } = req.body; // identifier can be email or reg number

    // TODO: Replace with DB lookup
    // const user = await getUserByEmailOrRegNo(identifier);
    const user = MOCK_USERS.find(u => u.email === identifier || u.registration_number === identifier);

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // TODO: Replace with bcrypt.compare(password, user.password_hash)
    // For mock, just checking crude equality if mock hash wasn't used, but let's simulate
    const isValidPassword = password === 'admin123'; // Mock check

    if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '1h' }
    );

    res.json({ token, role: user.role });
};
