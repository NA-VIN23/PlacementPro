import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as xlsx from 'xlsx';
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

export const getStudents = async (req: Request, res: Response) => {
    try {
        const { data: students, error } = await supabase
            .from('users')
            .select('id, role, email, registration_number, department, batch, name, created_at')
            .eq('role', 'STUDENT')
            .order('registration_number', { ascending: true });

        if (error) throw error;
        res.json(students);
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to fetch students', error: err.message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // 1. Verify User exists and is a STUDENT
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('role')
            .eq('id', id)
            .single();

        if (fetchError || !user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'STUDENT') {
            return res.status(403).json({ message: 'Only Student accounts can be deleted via this endpoint' });
        }

        // 2. Cascade Delete: Delete related data first
        // Order: Resumes -> Submissions -> User (Parent)
        // We do this sequentially to ensure parent is deleted last.

        // Delete Resumes
        const { error: resumeError } = await supabase
            .from('resumes')
            .delete()
            .eq('student_id', id);

        if (resumeError) {
            console.error("Failed to delete resumes:", resumeError);
            throw new Error("Failed to delete student resumes.");
        }

        // Delete Submissions (Scores, Answers, Results)
        const { error: subError } = await supabase
            .from('submissions')
            .delete()
            .eq('student_id', id);

        if (subError) {
            console.error("Failed to delete submissions:", subError);
            throw new Error("Failed to delete student submissions.");
        }

        // 3. Delete User Record
        const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (deleteError) {
            throw deleteError;
        }

        res.json({ message: 'Student and all related data deleted successfully (Hard Delete)' });

    } catch (err: any) {
        console.error("Delete user error", err);
        res.status(500).json({ message: 'Failed to delete user', error: err.message });
    }
};

const validateAndDeriveStudent = (row: any) => {
    const { RegNo, RollNo, Name, Email, Password } = row;
    const errors: string[] = [];

    if (!RegNo) errors.push("Missing RegNo");
    if (!RollNo) errors.push("Missing RollNo");
    if (!Name) errors.push("Missing Name");
    if (!Email) errors.push("Missing Email");
    if (!Password) errors.push("Missing Password");

    // RegNo Validation: 8115U23IT001
    const regRegex = /^(\d{4})([A-Z])(\d{2})([A-Z]{2})(\d{3})$/;
    const regMatch = RegNo ? String(RegNo).match(regRegex) : null;

    // RollNo Validation: ITA2301
    const rollRegex = /^([A-Z]{2})([A-Z])(\d{2})(\d{2})$/;
    const rollMatch = RollNo ? String(RollNo).match(rollRegex) : null;

    if (RegNo && !regMatch) {
        errors.push("Invalid RegNo Format (Expected e.g., 8115U23IT001)");
    }
    if (RollNo && !rollMatch) {
        errors.push("Invalid RollNo Format (Expected e.g., ITA2301)");
    }

    if (errors.length > 0) return { error: errors.join(", ") };

    // Derivation
    // RegNo: 8115 U 23 IT 001
    const [_, collegeCode, programCode, batchYearShort, deptCode, deptRoll] = regMatch!;
    const batchStart = 2000 + parseInt(batchYearShort);
    const batchEnd = batchStart + 4; // Assuming 4 years for UG
    const batch = `${batchStart}-${batchEnd}`;
    const program = programCode === 'U' ? 'UG' : 'PG';

    // RollNo: IT A 23 01
    const [__, rollDept, section, rollBatch, sectionRoll] = rollMatch!;

    // Cross-check
    if (deptCode !== rollDept) errors.push("Mismatch in Department between RegNo and RollNo");
    if (batchYearShort !== rollBatch) errors.push("Mismatch in Batch Year between RegNo and RollNo");

    if (errors.length > 0) return { error: errors.join(", ") };

    // Derived Data
    // We strictly prepare fields that match the User Table schema primarily,
    // but we can try to include others or store them if possible. 
    // Based on schema check, we have: department, batch, name, email, registration_number, role, is_active, password_hash
    // We will map 'section' if possible, otherwise it might be lost if DB doesn't support it.

    return {
        success: true,
        user: {
            name: Name,
            email: Email,
            registration_number: RegNo,
            department: deptCode,
            batch: batch,
            role: 'STUDENT',
            is_active: true,
            // Extra fields that we ideally want to store (might need DB schema update)
            // For now, we put them here. Supabase insert might ignore extra fields or error.
            // We'll handle error in the loop logic.
            // section: section,
            // college_code: collegeCode,
            // program: program
        },
        password: Password,
        derivedMeta: {
            section,
            collegeCode,
            program
        }
    };
};

export const bulkImportUsers = async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[] = xlsx.utils.sheet_to_json(sheet);

        let successCount = 0;
        let failureCount = 0;
        const errors: any[] = [];

        // Single transaction approach is hard with Supabase client-side library loop.
        // We will process row by row. "Transaction-safe" per row.

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 2; // +2 taking header into account (1-based + 1 header)

            const validation = validateAndDeriveStudent(row);
            if (validation.error || !validation.user) {
                failureCount++;
                errors.push({ row: rowNum, reason: validation.error });
                continue;
            }

            const { user, password, derivedMeta } = validation;

            try {
                // Check existing
                const { data: existing } = await supabase
                    .from('users')
                    .select('id')
                    .eq('registration_number', user.registration_number)
                    .single();

                if (existing) {
                    throw new Error(`User with RegNo ${user.registration_number} already exists`);
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                const userToSave = {
                    ...user,
                    password_hash: hashedPassword
                    // Attempt to add derived meta if DB allows, otherwise we might retry without them?
                    // Safe bet: stick to known schema to ensure production stability as per "ABSOLUTE RULES"
                    // If we strictly MUST store section, we'd need to confirm schema. 
                    // Given we can't change schema, we'll store confirmed fields.
                };

                const { error } = await supabase.from('users').insert(userToSave);

                if (error) {
                    // Unique violation might happen on Email too
                    if (error.code === '23505') throw new Error('Duplicate Email or RegNo');
                    throw error;
                }

                successCount++;
            } catch (err: any) {
                failureCount++;
                errors.push({ row: rowNum, reason: err.message });
            }
        }

        res.json({
            totalRows: rows.length,
            successCount,
            failureCount,
            errors
        });

    } catch (err: any) {
        console.error("Bulk Import Error", err);
        res.status(500).json({ message: 'Failed to process file', error: err.message });
    }
};
