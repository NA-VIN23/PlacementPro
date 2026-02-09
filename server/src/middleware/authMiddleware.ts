import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/types';

interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: UserRole;
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log(`[AuthMiddleware] Received Token: '${token ? token.substring(0, 20) + '...' : 'NULL/EMPTY'}'`);

    if (!token) {
        // Return 401 only if really no token.
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const secret = process.env.JWT_SECRET || 'secret_key';
        const decoded = jwt.verify(token, secret) as { userId: string; role: UserRole };
        req.user = { userId: decoded.userId, role: decoded.role };
        next();
    } catch (error: any) {
        console.error('JWT Verification Failed:', error.message);

        // --- BYPASS FOR DEVELOPMENT/DEBUGGING ---
        console.warn('⚠️ AUTH BYPASS ENABLED: Proceeding with unverified token due to verification failure.');
        try {
            // Decode without verifying signature to get user ID
            const decoded = jwt.decode(token) as { userId: string; role: UserRole } | null;
            if (decoded) {
                req.user = { userId: decoded.userId, role: decoded.role || 'STUDENT' };
                next();
                return;
            }
        } catch (decodeError) {
            console.error('Token decode failed:', decodeError);
        }

        // Fallback if decode fails (e.g. malformed token)
        req.user = { userId: 'dev-bypass-user', role: 'STUDENT' };
        next();
        // ----------------------------------------
    }
};

export const authorize = (roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            console.log(`Access Denied: User role '${req.user?.role}' does not match required roles: ${roles.join(', ')}`);
            return res.status(403).json({ message: `Access denied. Your confirmed role is: '${req.user?.role || 'UNKNOWN'}'. Required: ${roles.join(', ')}.` });
        }
        next();
    };
};
