// server/src/controllers/authController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

class AuthController {
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, name, company } = req.body;

            // Email kontrolü
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.status(400).json({ 
                    message: 'Bu email adresi zaten kullanılıyor' 
                });
                return;
            }

            // Yeni kullanıcı oluştur
            const user = new User({
                email,
                password,
                name,
                company
            });

            await user.save();

            // Token oluştur
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET || 'default-secret',
                { expiresIn: '24h' }
            );

            res.status(201).json({
                message: 'Kayıt başarılı',
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    company: user.company,
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

            // Kullanıcıyı bul
            const user = await User.findOne({ email });
            if (!user) {
                res.status(401).json({ 
                    message: 'Geçersiz email veya şifre' 
                });
                return;
            }

            // Şifreyi kontrol et
            const isValidPassword = await user.comparePassword(password);
            if (!isValidPassword) {
                res.status(401).json({ 
                    message: 'Geçersiz email veya şifre' 
                });
                return;
            }

            // Token oluştur
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET || 'default-secret',
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Giriş başarılı',
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    company: user.company,
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