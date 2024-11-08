import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import UserModel, { IUser, UserRole } from '../models/User';

// Token oluşturma fonksiyonu
const generateToken = (user: IUser): string => {
    return jwt.sign(
      {
        id: user._id,
        userId: user._id,
        role: user.role as UserRole // Role'ü UserRole enum'u olarak belirtiyoruz
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );
  };  

class AuthController {
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, firstName, lastName, role } = req.body;

            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                res.status(400).json({ 
                    message: 'Bu email adresi zaten kullanılıyor' 
                });
                return;
            }

            const user = new UserModel({
                email,
                password,
                firstName,
                lastName,
                role
            });

            await user.save();

            const token = generateToken(user);

            res.status(201).json({
                message: 'Kayıt başarılı',
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                }
            });

        } catch (error) {
            console.error('Kayıt hatası:', error);
            res.status(500).json({ 
                message: 'Kayıt işlemi sırasında bir hata oluştu' 
            });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            const user = await UserModel.findOne({ email });
            if (!user) {
                res.status(401).json({ 
                    message: 'Geçersiz email veya şifre' 
                });
                return;
            }

            const isValidPassword = await user.comparePassword(password);
            if (!isValidPassword) {
                res.status(401).json({ 
                    message: 'Geçersiz email veya şifre' 
                });
                return;
            }

            const token = generateToken(user);

            // Son giriş tarihini güncelle
            user.lastLogin = new Date();
            await user.save();

            res.json({
                message: 'Giriş başarılı',
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                }
            });

        } catch (error) {
            console.error('Giriş hatası:', error);
            res.status(500).json({ 
                message: 'Giriş işlemi sırasında bir hata oluştu' 
            });
        }
    }
}

export const authController = new AuthController();