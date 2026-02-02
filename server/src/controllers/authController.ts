import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/types';

import { supabase } from '../config/supabase';

export const login = async (req: Request, res: Response) => {
    const { identifier, password } = req.body; // identifier can be email or reg number

    try {
        // 1. Check if user exists
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .or(`email.eq.${identifier},registration_number.eq.${identifier}`)
            .single();

        if (error || !user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.is_active) {
            return res.status(403).json({ message: 'Account is deactivated. Contact Admin.' });
        }

        // 2. Validate Password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 3. Generate Token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            department: user.department,
            batch: user.batch,
            registration_number: user.registration_number
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
