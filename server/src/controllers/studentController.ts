import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getStudentProfile = async (req: Request, res: Response) => {
    try {
        const studentId = (req as any).user.id;

        // Fetch all data in parallel
        const [profile, internships, projects, education, certifications] = await Promise.all([
            supabase.from('student_profiles').select('*').eq('student_id', studentId).single(),
            supabase.from('profile_internships').select('*').eq('student_id', studentId),
            supabase.from('profile_projects').select('*').eq('student_id', studentId),
            supabase.from('profile_education').select('*').eq('student_id', studentId),
            supabase.from('profile_certifications').select('*').eq('student_id', studentId)
        ]);

        // Combine data
        const fullProfile = {
            ...(profile.data || {}),
            internships: internships.data || [],
            projects: projects.data || [],
            education: education.data || [],
            certifications: certifications.data || []
        };

        res.json(fullProfile);

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

export const updateStudentProfile = async (req: Request, res: Response) => {
    try {
        const studentId = (req as any).user.id;
        const { bio, linkedin, github, skills, internships, projects, education, certifications } = req.body;

        // 1. Upsert Main Profile
        const { error: profileError } = await supabase
            .from('student_profiles')
            .upsert({
                student_id: studentId,
                bio,
                linkedin,
                github,
                skills,
                updated_at: new Date()
            });

        if (profileError) throw profileError;

        // 2. Full Replace Strategy for Lists
        // 2. Full Replace Strategy for Lists
        // Helper to replace items
        const replaceItems = async (table: string, items: any[], mapFn?: (item: any) => any) => {
            // Delete existing
            const { error: deleteError } = await supabase.from(table).delete().eq('student_id', studentId);
            if (deleteError) {
                console.error(`Error deleting from ${table}:`, deleteError);
                throw deleteError;
            }

            // Insert new (if any)
            if (items && items.length > 0) {
                const itemsToInsert = items.map(item => {
                    const mapped = mapFn ? mapFn(item) : item;
                    return { ...mapped, student_id: studentId };
                });

                const { error: insertError } = await supabase.from(table).insert(itemsToInsert);
                if (insertError) {
                    console.error(`Error inserting into ${table}:`, insertError);
                    throw insertError;
                }
            }
        };

        await Promise.all([
            replaceItems('profile_internships', internships),
            replaceItems('profile_projects', projects, (p) => ({
                title: p.title,
                description: p.description,
                tech_stack: p.techStack, // Map camelCase to snake_case
                link: p.link
            })),
            replaceItems('profile_education', education),
            replaceItems('profile_certifications', certifications)
        ]);

        res.json({ message: 'Profile updated successfully' });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
