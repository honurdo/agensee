import { Request, Response } from 'express';
import { Customer } from '../models/Customer';

interface AuthRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

export const customerController = {
  // Müşteri listesi
  async getCustomers(req: AuthRequest, res: Response) {
    try {
      const customers = await Customer.find({ createdBy: req.user?.id })
        .sort({ createdAt: -1 });
      res.json(customers);
    } catch (error) {
      console.error('Müşteri listesi alınırken hata:', error);
      res.status(500).json({ message: 'Müşteriler getirilirken bir hata oluştu' });
    }
  },

  // Tek müşteri getirme
  async getCustomerById(req: AuthRequest, res: Response) {
    try {
      const customer = await Customer.findOne({
        _id: req.params.id,
        createdBy: req.user?.id
      });

      if (!customer) {
        return res.status(404).json({ message: 'Müşteri bulunamadı' });
      }

      res.json(customer);
    } catch (error) {
      console.error('Müşteri detayı alınırken hata:', error);
      res.status(500).json({ message: 'Müşteri detayı getirilirken bir hata oluştu' });
    }
  },

  // Yeni müşteri oluşturma
  async createCustomer(req: AuthRequest, res: Response) {
    try {
      console.log('Gelen veri:', req.body); // Debug için
      console.log('User ID:', req.user?.id); // Debug için

      const newCustomer = new Customer({
        ...req.body,
        createdBy: req.user?.id
      });

      await newCustomer.save();
      res.status(201).json(newCustomer);
    } catch (error) {
      console.error('Müşteri oluşturulurken hata:', error);
      res.status(500).json({ 
        message: 'Müşteri oluşturulurken bir hata oluştu',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  },

  // Müşteri güncelleme
  async updateCustomer(req: AuthRequest, res: Response) {
    try {
      const customer = await Customer.findOneAndUpdate(
        { _id: req.params.id, createdBy: req.user?.id },
        req.body,
        { new: true, runValidators: true }
      );

      if (!customer) {
        return res.status(404).json({ message: 'Müşteri bulunamadı' });
      }

      res.json(customer);
    } catch (error) {
      console.error('Müşteri güncellenirken hata:', error);
      res.status(500).json({ message: 'Müşteri güncellenirken bir hata oluştu' });
    }
  },

  // Müşteri silme
  async deleteCustomer(req: AuthRequest, res: Response) {
    try {
      const customer = await Customer.findOneAndDelete({
        _id: req.params.id,
        createdBy: req.user?.id
      });

      if (!customer) {
        return res.status(404).json({ message: 'Müşteri bulunamadı' });
      }

      res.json({ message: 'Müşteri başarıyla silindi' });
    } catch (error) {
      console.error('Müşteri silinirken hata:', error);
      res.status(500).json({ message: 'Müşteri silinirken bir hata oluştu' });
    }
  }
};