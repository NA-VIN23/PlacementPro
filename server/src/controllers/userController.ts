import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import xlsx from 'xlsx';
import { User, UserRole } from '../models/types';
import { supabase } from '../config/supabase';

// Trigger restart
export const addUser = async (req: Request, res: Response) => {
    const { role, email, name, registration_number, department, batch, password } = req.body;

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
            name,
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
            .select('id, role, email, name, registration_number, department, batch, is_active, created_at')
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
    // @ts-ignore
    const userRole = req.user?.role?.toUpperCase();
    // @ts-ignore
    const userId = req.user?.userId;

    try {
        console.log(`Fetching students for User: ${userId}, Role: ${userRole}`);

        let query = supabase
            .from('users')
            .select('id, role, email, registration_number, department, batch, name, created_at')
            .eq('role', 'STUDENT')
            .order('registration_number', { ascending: true });

        const { data: students, error } = await query;
        if (error) throw error;

        // If Admin, return all
        if (userRole === 'ADMIN') {
            return res.json(students);
        }

        // If Staff, Filter by Assigned RegNo Range
        if (userRole === 'STAFF') {
            // 1. Get Staff Assignment (Stored in 'batch' as "RANGE:Start:End")
            const { data: staff } = await supabase
                .from('users')
                .select('batch')
                .eq('id', userId)
                .single();

            if (!staff || !staff.batch || !staff.batch.startsWith('RANGE:')) {
                // Not assigned or invalid format -> Return empty
                return res.json([]);
            }

            // Parse Assignment: "RANGE:Start:End|Extra1,Extra2"
            const mainSplit = staff.batch.split('|');
            const rangePart = mainSplit[0];
            const extrasPart = mainSplit[1] || '';
            const parts = rangePart.split(':'); // renamed to parts to match next usage if needed, but I'll update next lines too
            if (parts.length !== 3) return res.json([]);

            const startRegNo = parts[1];
            const endRegNo = parts[2];

            // 2. Filter Students by Range
            const filteredStudents = students.filter((student: any) => {
                const regNo = student.registration_number;
                if (!regNo) return false;

                // String comparison works for RegNo format like "8115U23IT001"
                return regNo >= startRegNo && regNo <= endRegNo;
            });

            return res.json(filteredStudents);
        }

        // Default: Return empty to prevent data leak
        res.json([]);
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to fetch students', error: err.message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // 1. Verify User exists
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('role')
            .eq('id', id)
            .single();

        if (fetchError || !user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const role = user.role?.toUpperCase();

        // Helper for safe deletion (logs but continues, assumes manual cleanup if critical)
        const safeDelete = async (table: string, column: string, value: string) => {
            const { error } = await supabase.from(table).delete().eq(column, value);
            if (error) {
                // Ignore "relation does not exist" (code 42P01) or Supabase/PostgREST missing table (PGRST205)
                const ignoredCodes = ['42P01', 'PGRST205'];
                if (!ignoredCodes.includes(error.code)) {
                    console.warn(`Warning during delete ${table}:`, error.message, error);
                }
            }
        };

        // 2. Cascade Delete based on Role
        if (role === 'STUDENT') {
            // Delete Profile Data
            const profileTables = [
                'profile_internships',
                'profile_projects',
                'profile_education',
                'profile_certifications'
            ];

            for (const table of profileTables) {
                await safeDelete(table, 'student_id', id as string);
            }

            await safeDelete('student_profiles', 'student_id', id as string);

            // Delete Resumes & Mock Interviews
            await safeDelete('resumes', 'student_id', id as string);
            await safeDelete('mock_interviews', 'student_id', id as string);

            // Delete Submissions
            await safeDelete('submissions', 'student_id', id as string);

        } else if (role === 'STAFF') {
            // Cascade Delete for Staff: Exams -> Questions -> Submissions
            const { data: exams } = await supabase
                .from('exams')
                .select('id')
                .eq('created_by', id);

            const examIds = exams?.map(e => e.id) || [];

            if (examIds.length > 0) {
                // Delete Submissions for these exams
                const { error: subError } = await supabase
                    .from('submissions')
                    .delete()
                    .in('exam_id', examIds);
                if (subError) console.warn("Staff clean submissions error:", subError.message);

                // Delete Questions for these exams
                const { error: qError } = await supabase
                    .from('questions')
                    .delete()
                    .in('exam_id', examIds);
                if (qError) console.warn("Staff clean questions error:", qError.message);

                // Delete Exams
                const { error: examDeleteError } = await supabase
                    .from('exams')
                    .delete()
                    .in('id', examIds);
                if (examDeleteError) console.warn("Staff clean exams error:", examDeleteError.message);
            }
        }

        // 3. Delete User Record
        const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (deleteError) {
            throw deleteError;
        }

        res.json({ message: 'User deleted successfully' });

    } catch (err: any) {
        console.error("Delete user error", err);
        // Include specific DB error message for debugging
        res.status(500).json({ message: 'Failed to delete user', error: err.message, details: err.details || err.hint });
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

    // RollNo Validation: ITA2301 or LITA2301 (Lateral)
    const rollRegex = /^(L)?([A-Z]{2})([A-Z])(\d{2})(\d{2})$/;
    const rollMatch = RollNo ? String(RollNo).match(rollRegex) : null;

    if (RegNo && !regMatch) {
        errors.push("Invalid RegNo Format (Expected e.g., 8115U23IT001)");
    }
    if (RollNo && !rollMatch) {
        errors.push("Invalid RollNo Format (Expected e.g., ITA2301 or LITA2363)");
    }

    if (errors.length > 0) return { error: errors.join(", ") };

    // Derivation
    // RegNo: 8115 U 23 IT 001
    const [_, collegeCode, programCode, batchYearShort, deptCode, deptRoll] = regMatch!;
    const batchStart = 2000 + parseInt(batchYearShort);
    const batchEnd = batchStart + 4; // Assuming 4 years for UG
    const batch = `${batchStart}-${batchEnd}`;
    const program = programCode === 'U' ? 'UG' : 'PG';

    // RollNo: (L) IT A 23 01
    const [__, isLateral, rollDept, section, rollBatch, sectionRoll] = rollMatch!;

    // Cross-check
    if (deptCode !== rollDept) errors.push("Mismatch in Department between RegNo and RollNo");
    if (batchYearShort !== rollBatch) errors.push("Mismatch in Batch Year between RegNo and RollNo");

    if (errors.length > 0) return { error: errors.join(", ") };

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

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 2;

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
                };

                const { error } = await supabase.from('users').insert(userToSave);

                if (error) {
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
