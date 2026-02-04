import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// ADMIN: Assign Class Advisor
// Stores assignment in the Staff's 'batch' field as "Batch:Section"
// ADMIN: Assign Staff by RegNo Range
// Stores assignment in the Staff's 'batch' field as "RANGE:StartRegNo:EndRegNo"

// Helper: Smart RegNo Comparison (Handles numeric vs string sorting)
const compareRegNos = (a: string, b: string): number => {
    // Normalize inputs
    const A = (a || '').trim();
    const B = (b || '').trim();

    // Extract prefix and numeric suffix
    const matchA = A.match(/^(.*?)(\d+)$/);
    const matchB = B.match(/^(.*?)(\d+)$/);

    // If both follow the Pattern [Prefix][Number] and have SAME prefix
    if (matchA && matchB && matchA[1] === matchB[1]) {
        const numA = parseInt(matchA[2], 10);
        const numB = parseInt(matchB[2], 10);
        return numA - numB;
    }

    // Default string comparison
    return A.localeCompare(B);
};

export const assignClassAdvisor = async (req: Request, res: Response) => {
    const { staffId } = req.body;
    let { startRegNo, endRegNo, additionalRegNos } = req.body;

    // Normalize
    startRegNo = (startRegNo || '').trim();
    endRegNo = (endRegNo || '').trim();

    // Parse Extras: "A, B, C" -> ["A", "B", "C"]
    let extras: string[] = [];
    if (additionalRegNos && typeof additionalRegNos === 'string') {
        extras = additionalRegNos.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    }

    if (!staffId) {
        return res.status(400).json({ message: 'Staff ID is required' });
    }

    // Require at least a Range OR Extras
    if ((!startRegNo || !endRegNo) && extras.length === 0) {
        return res.status(400).json({ message: 'Either a Registration Number Range or Additional Reg Nos must be provided.' });
    }

    // If Range provided, validate order
    if (startRegNo && endRegNo) {
        if (compareRegNos(startRegNo, endRegNo) > 0) {
            return res.status(400).json({ message: 'Start RegNo must be less than or equal to End RegNo' });
        }
    }

    try {
        // 1. Fetch ALL Staff to check for overlaps
        const { data: allStaff, error: fetchError } = await supabase
            .from('users')
            .select('id, name, batch')
            .ilike('role', 'staff');

        if (fetchError) throw fetchError;

        // 2. Overlap Validation
        for (const staff of allStaff || []) {
            if (staff.id === staffId) continue; // Skip self

            if (staff.batch && staff.batch.startsWith('RANGE:')) {
                // Parse existing assignment
                // Format: "RANGE:Start:End|Extra1,Extra2"
                // OR old format "RANGE:Start:End"

                const mainSplit = staff.batch.split('|');
                const rangePart = mainSplit[0]; // RANGE:Start:End
                const extrasPart = mainSplit[1] || ''; // Extra1,Extra2

                const rangeParts = rangePart.split(':');
                const existingStart = rangeParts[1]; // might be empty string
                const existingEnd = rangeParts[2];   // might be empty string

                const existingExtras = extrasPart ? extrasPart.split(',') : [];

                // A. Check New Range vs Existing Range
                if (startRegNo && endRegNo && existingStart && existingEnd) {
                    if (compareRegNos(startRegNo, existingEnd) <= 0 && compareRegNos(endRegNo, existingStart) >= 0) {
                        return res.status(400).json({
                            message: `Overlap! Range ${startRegNo}-${endRegNo} overlaps with ${staff.name}'s range ${existingStart}-${existingEnd}.`
                        });
                    }
                }

                // B. Check Existing Range vs New Extras
                // (Existing Range contains New Extra?)
                if (existingStart && existingEnd) {
                    for (const newExt of extras) {
                        if (compareRegNos(newExt, existingStart) >= 0 && compareRegNos(newExt, existingEnd) <= 0) {
                            return res.status(400).json({
                                message: `Overlap! Student ${newExt} falls in ${staff.name}'s range ${existingStart}-${existingEnd}.`
                            });
                        }
                    }
                }

                // C. Check New Range vs Existing Extras
                // (New Range contains Existing Extra?)
                if (startRegNo && endRegNo) {
                    for (const ext of existingExtras) {
                        if (compareRegNos(ext, startRegNo) >= 0 && compareRegNos(ext, endRegNo) <= 0) {
                            return res.status(400).json({
                                message: `Overlap! Range includes student ${ext} who is already assigned to ${staff.name}.`
                            });
                        }
                    }
                }

                // D. Check New Extras vs Existing Extras
                for (const newExt of extras) {
                    if (existingExtras.includes(newExt)) {
                        return res.status(400).json({
                            message: `Overlap! Student ${newExt} is already assigned to ${staff.name}.`
                        });
                    }
                }
            }
        }

        // 3. Save Assignment
        // Format: "RANGE:Start:End|Extra1,Extra2"
        let encodedRange = `RANGE:${startRegNo}:${endRegNo}`;
        if (extras.length > 0) {
            encodedRange += `|${extras.join(',')}`;
        }

        const { error } = await supabase
            .from('users')
            .update({
                batch: encodedRange
            })
            .eq('id', staffId)
            .ilike('role', 'staff');

        if (error) throw error;

        res.json({ message: 'Staff assigned successfully' });
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to assign staff', error: err.message });
    }
};

// ADMIN: List Staff
export const listStaff = async (req: Request, res: Response) => {
    try {
        const { data: staff, error } = await supabase
            .from('users')
            .select('id, name, email, department, batch')
            .ilike('role', 'staff')
            .order('name');

        if (error) throw error;

        // Parse batch to show separate fields if needed, or frontend handles it
        // We return raw data
        res.json(staff);
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to fetch staff', error: err.message });
    }
};
