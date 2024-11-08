import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';

const userController = {
  async getUsers(req: Request, res: Response) {
    try {
      const users = await User.find().select('-password');
      res.json(users);
    } catch (error) {
      console.error('Kullanıcı listesi hatası:', error);
      res.status(500).json({ message: 'Kullanıcılar listelenirken bir hata oluştu' });
    }
  },

  async getUserById(req: Request, res: Response) {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }
      res.json(user);
    } catch (error) {
      console.error('Kullanıcı detayı hatası:', error);
      res.status(500).json({ message: 'Kullanıcı bilgileri alınırken bir hata oluştu' });
    }
  },

  async createUser(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Email kontrolü
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Bu email adresi zaten kullanılıyor' });
      }

      // Şifre hash'leme
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        active: true
      });

      await user.save();

      const userResponse = user.toObject();
      const { password: _, ...userWithoutPassword } = userResponse;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Kullanıcı oluşturma hatası:', error);
      res.status(500).json({ message: 'Kullanıcı oluşturulurken bir hata oluştu' });
    }
  },

  async updateUser(req: Request, res: Response) {
    try {
      const { password, ...updateData } = req.body;

      // Eğer şifre güncelleniyorsa hash'le
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      res.json(user);
    } catch (error) {
      console.error('Kullanıcı güncelleme hatası:', error);
      res.status(500).json({ message: 'Kullanıcı güncellenirken bir hata oluştu' });
    }
  },

  async updateUserStatus(req: Request, res: Response) {
    try {
      const { active } = req.body;
      
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { active },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      res.json(user);
    } catch (error) {
      console.error('Kullanıcı durum güncelleme hatası:', error);
      res.status(500).json({ message: 'Kullanıcı durumu güncellenirken bir hata oluştu' });
    }
  },

  async deleteUser(req: Request, res: Response) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }

      res.json({ message: 'Kullanıcı başarıyla silindi' });
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      res.status(500).json({ message: 'Kullanıcı silinirken bir hata oluştu' });
    }
  }
};

export default userController;