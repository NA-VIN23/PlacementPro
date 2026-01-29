import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const seed = async () => {
    console.log('Seeding Database...');

    // 1. Create Admin
    const email = 'admin@college.edu';
    const password = 'admin123';

    // Check if exists
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();

    if (existing) {
        console.log('Admin already exists.');
    } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { error } = await supabase.from('users').insert({
            role: 'ADMIN',
            email,
            password_hash: hashedPassword,
            is_active: true
        });

        if (error) console.error('Failed to create Admin:', error);
        else console.log('Admin user created (email: admin@college.edu, pass: admin123)');
    }

    // 2. Create Staff
    const staffEmail = 'staff@college.edu';
    const { data: existingStaff } = await supabase.from('users').select('id').eq('email', staffEmail).single();
    if (!existingStaff) {
        const hashedPassword = await bcrypt.hash('staff123', 10);
        await supabase.from('users').insert({
            role: 'STAFF',
            email: staffEmail,
            name: 'Prof. X',
            password_hash: hashedPassword,
            is_active: true
        });
        console.log('Staff user created (staff@college.edu / staff123)');
    }

    // 3. Create Student
    const studentEmail = 'student@college.edu';
    const { data: existingStudent } = await supabase.from('users').select('id').eq('email', studentEmail).single();
    if (!existingStudent) {
        const hashedPassword = await bcrypt.hash('student123', 10);
        await supabase.from('users').insert({
            role: 'STUDENT',
            email: studentEmail,
            name: 'Peter Parker',
            password_hash: hashedPassword,
            is_active: true
        });
        console.log('Student user created (student@college.edu / student123)');
    }
};

seed();
