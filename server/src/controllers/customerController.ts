import { Request, Response } from 'express';
import { Customer } from '../models/Customer';
import { UserRole } from '../models/User';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    id: string;
    userId: string;
    role: UserRole;
    [key: string]: any;
  }
}
interface MongooseValidationError extends Error {
  errors: {
    [key: string]: {
      path: string;
      message: string;
    }
  };
  name: 'ValidationError';
}

export const customerController = {
  getCustomers: async (req: Request, res: Response) => {
    try {
      console.log('getCustomers çağrıldı');
      console.log('User:', req.user);
      
      const customers = await Customer.find()
        .sort({ createdAt: -1 }); // En son eklenenler önce gelsin

      console.log('Bulunan müşteri sayısı:', customers.length);
      console.log('Örnek müşteri veri yapısı:', customers[0]); // Debug için
      
      res.json(customers);
    } catch (error) {
      console.error('Müşteri listesi hatası:', error);
      res.status(500).json({ message: 'Müşteriler yüklenirken bir hata oluştu' });
    }
  },

  getCustomerById: async (req: Request, res: Response) => {
    try {
      const customer = await Customer.findOne({
        _id: req.params.id,
        createdBy: req.user?.id
      });

      if (!customer) {
        return res.status(404).json({ message: 'Müşteri bulunamadı' });
      }

      console.log('Müşteri detayı:', customer); // Debug için
      res.json(customer);
    } catch (error) {
      console.error('Müşteri detayı alınırken hata:', error);
      res.status(500).json({ message: 'Müşteri detayı getirilirken bir hata oluştu' });
    }
  },

  createCustomer: async (req: AuthRequest, res: Response) => {
    try {
      console.log('Creating customer with data:', JSON.stringify(req.body, null, 2));
      console.log('User ID:', req.user?.id);

      if (!req.body) {
        return res.status(400).json({ message: 'Veri gönderilmedi' });
      }

      if (req.body.commissionTiers) {
        console.log('Commission tiers:', JSON.stringify(req.body.commissionTiers, null, 2));
        
        for (const tier of req.body.commissionTiers) {
          if (tier.feeType === 'PERCENTAGE' && (tier.rate < 0 || tier.rate > 100)) {
            return res.status(400).json({ 
              message: 'Komisyon oranı 0-100 arasında olmalıdır',
              tier
            });
          }
          if (tier.feeType === 'FIXED' && tier.fixedAmount < 0) {
            return res.status(400).json({ 
              message: 'Sabit ücret 0\'dan büyük olmalıdır',
              tier
            });
          }
        }
      }

      const newCustomer = new Customer({
        ...req.body,
        createdBy: req.user?.id
      });

      console.log('Customer model before save:', newCustomer.toObject());

      try {
        await newCustomer.validate();
      } catch (validationError) {
        if (validationError instanceof Error) {
          console.error('Validation error:', validationError);
          return res.status(400).json({
            message: 'Validasyon hatası',
            errors: (validationError as MongooseValidationError).errors
          });
        }
      }

      await newCustomer.save();
      console.log('Customer saved successfully:', newCustomer._id);
      
      res.status(201).json(newCustomer);
    } catch (error: unknown) { // error tipini unknown olarak belirtiyoruz
      console.error('Detailed error in createCustomer:', error);
      
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        // Mongoose validation hatası kontrolü
        if (error.name === 'ValidationError') {
          return res.status(400).json({
            message: 'Validasyon hatası',
            errors: Object.values((error as MongooseValidationError).errors).map(err => ({
              field: err.path,
              message: err.message
            }))
          });
        }

        return res.status(500).json({ 
          message: 'Müşteri oluşturulurken bir hata oluştu',
          error: {
            name: error.name,
            message: error.message
          }
        });
      }

      // Eğer error bir Error instance'ı değilse
      res.status(500).json({ 
        message: 'Müşteri oluşturulurken bilinmeyen bir hata oluştu'
      });
    }
  },

  updateCustomer: async (req: AuthRequest, res: Response) => {
    try {
      console.log('Update request:', {
        id: req.params.id,
        body: req.body,
        userId: req.user?.id
      });

      // Komisyon aralıklarını kontrol et
      if (req.body.commissionTiers) {
        // Aralıkları sırala
        req.body.commissionTiers.sort((a: any, b: any) => a.minAmount - b.minAmount);
        
        // Aralıkların geçerliliğini kontrol et
        for (let i = 0; i < req.body.commissionTiers.length - 1; i++) {
          const currentTier = req.body.commissionTiers[i];
          const nextTier = req.body.commissionTiers[i + 1];
          
          if (currentTier.maxAmount && nextTier.minAmount) {
            if (currentTier.maxAmount >= nextTier.minAmount) {
              return res.status(400).json({ 
                message: 'Komisyon aralıkları çakışıyor veya geçersiz sıralamada' 
              });
            }
          }
        }
      }
  
      const customer = await Customer.findOne({
        _id: req.params.id
      });
  
      if (!customer) {
        console.log('Customer not found');
        return res.status(404).json({ message: 'Müşteri bulunamadı' });
      }
  
      Object.assign(customer, req.body);
      await customer.save();
  
      console.log('Güncellenmiş müşteri:', customer); // Debug için
      res.json(customer);
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ message: 'Müşteri güncellenirken bir hata oluştu' });
    }
  },

  bulkUpdateStatus: async (req: Request, res: Response) => {
    try {
      const { ids, status } = req.body;
      
      const updates = await Promise.all(
        ids.map((id: string) => Customer.findByIdAndUpdate(
          id,
          { status },
          { new: true }
        ))
      );
   
      console.log('Toplu güncelleme sonuçları:', updates); // Debug için
      res.json(updates);
    } catch (error) {
      console.error('Bulk update error:', error);
      res.status(500).json({ message: 'Toplu güncelleme sırasında bir hata oluştu' });
    }
  },

  deleteCustomer: async (req: AuthRequest, res: Response) => {
    try {
      // Önce customer'ı bulalım
      const customerId = req.params.id;
      
      console.log('Attempting to delete customer:', customerId);

      // undefined kontrolü ekleyelim
      if (!customerId || customerId === 'undefined') {
        return res.status(400).json({ message: 'Geçersiz müşteri ID' });
      }

      // Silme işlemini deneyelim
      const customer = await Customer.findOneAndDelete({
        _id: customerId,
      });

      // Bulunamadıysa
      if (!customer) {
        console.log('Customer not found for deletion');
        return res.status(404).json({ message: 'Müşteri bulunamadı' });
      }

      console.log('Customer deleted successfully:', customer);
      res.json({ message: 'Müşteri başarıyla silindi', deletedCustomer: customer });

    } catch (error) {
      console.error('Error in deleteCustomer:', error);
      
      // MongoDB hata kodlarını kontrol et
      if (error instanceof Error) {
        if ((error as any).name === 'CastError') {
          return res.status(400).json({ 
            message: 'Geçersiz müşteri ID formatı',
            error: error.message 
          });
        }
      }

      res.status(500).json({ 
        message: 'Müşteri silinirken bir hata oluştu',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  },

  // Veritabanını temizlemek için yeni bir metod ekleyelim
  cleanupInvalidCustomers: async (req: AuthRequest, res: Response) => {
    try {
      // Geçersiz kayıtları bul ve sil
      const result = await Customer.deleteMany({
        $or: [
          { _id: null },
          { _id: 'undefined' },
          { company: null },
          { company: undefined }
        ]
      });

      console.log('Cleanup result:', result);
      res.json({ 
        message: 'Geçersiz müşteriler temizlendi',
        deletedCount: result.deletedCount 
      });
    } catch (error) {
      console.error('Cleanup error:', error);
      res.status(500).json({ message: 'Temizleme işlemi sırasında hata oluştu' });
    }
  }
};
