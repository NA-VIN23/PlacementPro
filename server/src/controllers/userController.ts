import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '../models/types';
import { supabase } from '../config/supabase';

export const addUser = async (req: Request, res: Response) => {
    const { role, email, registration_number, department, batch, password } = req.body;

    // Validation
    if (role === 'STUDENT' && !registration_number) {
        return res.status(400).json({ message: 'Registration number required for students' });
    }

    try {
        // Check existing
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .or(`email.eq.${email},registration_number.eq.${registration_number}`)
            .single();

        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            role: role as UserRole,
            email,
            registration_number: registration_number || null,
            department,
            batch,
            password_hash: hashedPassword,
            is_active: true
        };

        const { data, error } = await supabase
            .from('users')
            .insert(newUser)
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: 'User created successfully', userId: data.id });
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to create user', error: err.message });
    }
};

export const listUsers = async (req: Request, res: Response) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, role, email, registration_number, department, batch, is_active, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(users);
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to fetch users', error: err.message });
    }
};

export const toggleUserParams = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // Get current status
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('is_active')
            .eq('id', id)
            .single();

        if (fetchError || !user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { error: updateError } = await supabase
            .from('users')
            .update({ is_active: !user.is_active })
            .eq('id', id);

        if (updateError) throw updateError;

        res.json({ message: `User ${!user.is_active ? 'activated' : 'deactivated'}`, userId: id });
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to update user', error: err.message });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.userId;
    const { email, name, department } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const updates: any = { email };
        if (name) updates.name = name;
        if (department) updates.department = department;

        const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId);

        if (error) throw error;
        res.json({ message: 'Profile updated successfully' });
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to update profile', error: err.message });
    }
};

export const getStaffActivityLogs = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.userId;

    try {
        // 1. Fetch created exams
        const { data: exams, error: examError } = await supabase
            .from('exams')
            .select('title, created_at')
            .eq('created_by', userId)
            .order('created_at', { ascending: false })
            .limit(5);

        if (examError) throw examError;

        // 2. Fetch submissions for their exams (Joined query)
        // Since Supabase join syntax can be complex in JS client without foreign key embedding setup perfectly, 
        // we might do two steps or use correct syntax.
        // Let's keep it simple: Just show "Created Exam X" for now to ensure reliability, 
        // or try to fetch submissions if we can.
        // Actually, let's just use exams for now as "Activity", and maybe "Users added" if we had that.
        // For staff, "Created Exam" is the main activity.

        const logs = exams?.map(exam => ({
            action: `Created assessment: ${exam.title}`,
            time: new Date(exam.created_at).toLocaleDateString()
        })) || [];

        res.json(logs);
    } catch (err: any) {
        console.error("Fetch logs error", err);
        res.status(500).json({ message: 'Failed to fetch logs' });
    }
};
