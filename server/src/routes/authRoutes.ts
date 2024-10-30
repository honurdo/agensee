// server/src/routes/authRoutes.ts
import { Router, Request, Response } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

// Kayıt route'u
router.post('/register', async function(req: Request, res: Response) {
    await authController.register(req, res);
});

// Giriş route'u
router.post('/login', async function(req: Request, res: Response) {
    await authController.login(req, res);
});

export default router;