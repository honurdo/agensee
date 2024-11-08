import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';

// JWT payload interface'i
interface JWTPayload {
  id: string;
  userId: string;
  role: UserRole;
  [key: string]: any;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        userId: string;
        role: UserRole;
      };
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'Yetkilendirme başlığı bulunamadı' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token bulunamadı' });
    }

    // Token'ı doğrulayıp decode ediyoruz
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Decoded token'ı request nesnesine ekliyoruz
    req.user = {
      id: decoded.id,
      userId: decoded.userId,
      role: decoded.role
    };
    
    console.log('Auth Middleware - Decoded Token:', decoded);
    console.log('Auth Middleware - User:', req.user);

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      message: 'Geçersiz token veya oturum süresi dolmuş' 
    });
  }
};

export default authMiddleware;