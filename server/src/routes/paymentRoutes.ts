// routes/paymentRoutes.ts

import express from 'express';
import * as paymentController from '../controllers/paymentController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

// Tüm route'lar için auth middleware'i kullan
router.use(authMiddleware);

// Route'ları tanımla
router.get('/', paymentController.getPayments);
router.post('/', paymentController.createPayment);
router.get('/customer/:customerId', paymentController.getCustomerPayments);
router.get('/:id', paymentController.getPaymentById);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

export default router;
