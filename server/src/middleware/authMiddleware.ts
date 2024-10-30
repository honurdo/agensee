import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import mongoose from 'mongoose';

// Request tipi için interface
interface AuthRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

// Token payload için interface
interface JwtPayload {
  userId: string;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Yetkilendirme gerekli' });
    }

    // Token'ı doğrula ve payload'ı al
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as JwtPayload;
    
    // MongoDB ObjectId ile kullanıcıyı bul
    const user = await User.findOne({ _id: new mongoose.Types.ObjectId(decoded.userId) });

    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    // Request nesnesine user bilgisini ekle
    req.user = { 
      id: user._id.toString(),
      email: user.email,
      role: user.role 
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Lütfen tekrar giriş yapın' });
  }
};