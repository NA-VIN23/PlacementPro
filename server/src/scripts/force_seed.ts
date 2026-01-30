import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

console.log('Connecting to Supabase:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

const forceSeed = async () => {
    console.log('Starting Force Seed...');

    // Users to create
    const users = [
        { email: 'staff@college.edu', role: 'STAFF', name: 'Prof. X' },
        { email: 'student@college.edu', role: 'STUDENT', name: 'Peter Parker' }
    ];

    for (const u of users) {
        console.log(`Processing ${u.email}...`);

        // Check availability
        const { data: existing, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', u.email);

        if (fetchError) {
            console.error(`Error checking ${u.email}:`, fetchError);
            continue;
        }

        if (existing && existing.length > 0) {
            console.log(`User ${u.email} already exists (ID: ${existing[0].id}).`);
            continue;
        }

        console.log(`User ${u.email} not found. Creating...`);

        const hash = await bcrypt.hash(u.role === 'STAFF' ? 'staff123' : 'student123', 10);

        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
                email: u.email,
                role: u.role,
                name: u.name,
                password_hash: hash,
                is_active: true
            })
            .select();

        if (insertError) {
            console.error(`FAILED to create ${u.email}:`, insertError);
        } else {
            console.log(`SUCCESS: Created ${u.email}`, newUser);
        }
    }
};

forceSeed();
