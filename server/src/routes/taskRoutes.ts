import { Router } from 'express';
import { taskController } from '../controllers/taskController';
import authMiddleware from '../middleware/authMiddleware'; // düzeltilmiş import

const router = Router();
router.use(authMiddleware);

// Tüm görevleri getir
router.get('/', taskController.getTasks);

// Kullanıcıya ait görevleri getir
router.get('/user/:userId', taskController.getTasksByUser);

// Yeni görev oluştur
router.post('/', taskController.createTask);

// Görevi güncelle
router.put('/:id', taskController.updateTask);

// Görev durumunu güncelle
router.patch('/:id/status', taskController.updateTaskStatus);

// Görevi sil
router.delete('/:id', taskController.deleteTask);

export default router;