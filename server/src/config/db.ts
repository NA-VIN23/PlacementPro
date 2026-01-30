import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
    try {
        // TODO: Implement actual DB connection (Supabase/PostgreSQL)
        console.log('Database connected successfully (Mock)');
    } catch (error) {
        console.error('Database connection failed', error);
        process.exit(1);
    }
};
