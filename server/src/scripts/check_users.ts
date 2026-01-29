import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const check = async () => {
    console.log('Checking Users...');
    const { data, error } = await supabase.from('users').select('id, email, role');
    if (error) console.error(error);
    else console.table(data);
};

check();
