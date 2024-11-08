import { Router } from 'express';
import userController from '../controllers/userController';
import authMiddleware from '../middleware/authMiddleware'; // düzeltilmiş import

const router = Router();

// Tüm route'ları auth middleware'i ile koru
router.use(authMiddleware);

// User routes
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.patch('/:id/status', userController.updateUserStatus);

export default router;