import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
    // We don't exit here to allow the server to start even if config is missing, 
    // but DB operations will fail.
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
