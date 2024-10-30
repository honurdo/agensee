import { Router } from 'express';
import { customerController } from '../controllers/customerController';
import { auth } from '../middleware/authMiddleware';

const router = Router();

// Tüm route'ları auth middleware'i ile koru
router.use(auth);

// Customer routes
router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

export default router;