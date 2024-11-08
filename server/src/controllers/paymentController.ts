// controllers/paymentController.ts

import { Request, Response } from 'express';
import Payment from '../models/Payment';

const VAT_RATE = 20; // %20 KDV

export const createPayment = async (req: Request, res: Response) => {
  try {
    console.log('Gelen ödeme verisi:', req.body);

    const paymentData = req.body;
    
    // Net tutarı hesapla
    let netAmount = paymentData.amount;
    
    // Komisyon varsa düş
    if (paymentData.hasCommission && paymentData.commissionAmount) {
      netAmount -= paymentData.commissionAmount;
    }

    // KDV hesaplaması
    let vatAmount = 0;
    if (paymentData.hasVAT && !paymentData.isVATExempt) {
      vatAmount = (paymentData.amount * VAT_RATE) / 100;
    }

    // Payment objesini oluştur
    const payment = new Payment({
      ...paymentData,
      netAmount,
      vatAmount,
      totalAmount: paymentData.hasVAT && !paymentData.isVATExempt 
        ? paymentData.amount + vatAmount 
        : paymentData.amount
    });

    const savedPayment = await payment.save();
    console.log('Kaydedilen ödeme:', savedPayment);
    
    res.status(201).json(savedPayment);
  } catch (error: any) {
    console.error('Ödeme oluşturma hatası:', error);
    
    // Validation hatası kontrolü
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validasyon hatası',
        details: Object.values(error.errors).map((err: any) => err.message)
      });
    }

    // Mongoose hatası kontrolü
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Bu ödeme zaten kaydedilmiş'
      });
    }

    res.status(400).json({
      message: 'Ödeme kaydedilirken bir hata oluştu',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getPayments = async (req: Request, res: Response) => {
    try {
        console.log('Get Payments - User:', req.user); // Kullanıcı bilgisini kontrol et
      const payments = await Payment.find()
        .populate({
          path: 'customerId',
          select: '_id company',
          model: 'Customer'
        })
        .sort({ createdAt: -1 });
        console.log('Raw payments:', JSON.stringify(payments, null, 2));

      // Verileri frontend'in beklediği formata dönüştür
      const formattedPayments = payments.map(payment => {
        const paymentObj = payment.toObject();
        return {
          ...paymentObj,
          customer: paymentObj.customerId // customerId'yi customer olarak yeniden adlandır
        };
      });
      console.log('Formatted payments:', JSON.stringify(formattedPayments, null, 2));

      res.json(formattedPayments);
    } catch (error: any) {
      console.error('Ödemeleri getirme hatası:', error);
      res.status(500).json({ 
        message: error.message || 'Ödemeler getirilirken bir hata oluştu'
      });
    }
  };

export const getCustomerPayments = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find({ customerId: req.params.customerId })
      .populate('customerId', 'company')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error: any) {
    console.error('Müşteri ödemelerini getirme hatası:', error);
    res.status(500).json({ 
      message: error.message || 'Müşteri ödemeleri getirilirken bir hata oluştu'
    });
  }
};

// Tekil ödeme getirme
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('customerId', 'company');
    
    if (!payment) {
      return res.status(404).json({ message: 'Ödeme bulunamadı' });
    }
    
    res.json(payment);
  } catch (error: any) {
    console.error('Ödeme getirme hatası:', error);
    res.status(500).json({ 
      message: error.message || 'Ödeme getirilirken bir hata oluştu'
    });
  }
};

// Ödeme güncelleme
export const updatePayment = async (req: Request, res: Response) => {
  try {
    const paymentData = req.body;
    
    // Net tutarı hesapla
    let netAmount = paymentData.amount;
    
    if (paymentData.hasCommission && paymentData.commissionAmount) {
      netAmount -= paymentData.commissionAmount;
    }

    let vatAmount = 0;
    if (paymentData.hasVAT && !paymentData.isVATExempt) {
      vatAmount = (paymentData.amount * VAT_RATE) / 100;
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        ...paymentData,
        netAmount,
        vatAmount,
        totalAmount: paymentData.hasVAT && !paymentData.isVATExempt 
          ? paymentData.amount + vatAmount 
          : paymentData.amount
      },
      { new: true, runValidators: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ message: 'Ödeme bulunamadı' });
    }

    res.json(updatedPayment);
  } catch (error: any) {
    console.error('Ödeme güncelleme hatası:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validasyon hatası',
        details: Object.values(error.errors).map((err: any) => err.message)
      });
    }

    res.status(400).json({
      message: 'Ödeme güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Ödeme silme
export const deletePayment = async (req: Request, res: Response) => {
  try {
    const deletedPayment = await Payment.findByIdAndDelete(req.params.id);
    
    if (!deletedPayment) {
      return res.status(404).json({ message: 'Ödeme bulunamadı' });
    }

    res.json({ message: 'Ödeme başarıyla silindi', payment: deletedPayment });
  } catch (error: any) {
    console.error('Ödeme silme hatası:', error);
    res.status(500).json({ 
      message: error.message || 'Ödeme silinirken bir hata oluştu'
    });
  }
};
