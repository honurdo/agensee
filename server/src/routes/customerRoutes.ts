// server/src/routes/customerRoutes.ts

import express, { Request, Response, NextFunction } from 'express';
import { customerController } from '../controllers/customerController';
import authMiddleware from '../middleware/authMiddleware'; // düzeltilmiş import
import { UserRole } from '../models/User';

interface AuthRequest extends Request {
  user?: {
    id: string;
    userId: string;
    role: UserRole;
  };
}

const router = express.Router();

// Normal rotalar
router.get('/', authMiddleware, customerController.getCustomers);
router.get('/:id', authMiddleware, customerController.getCustomerById);
router.post('/', authMiddleware, customerController.createCustomer);
router.put('/:id', authMiddleware, customerController.updateCustomer);
router.delete('/:id', authMiddleware, customerController.deleteCustomer);
router.post('/bulk-status', authMiddleware, customerController.bulkUpdateStatus);

// Cleanup route - admin kontrolü
router.post('/cleanup', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ 
        message: 'Bu işlem için admin yetkisi gereklidir' 
      });
    }
    next();
  } catch (error) {
    next(error);
  }
}, customerController.cleanupInvalidCustomers);

export default router;
