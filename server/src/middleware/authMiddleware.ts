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
        return res.status(401).json({ message: 'Access denied. Invalid token.' });
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
