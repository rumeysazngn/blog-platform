import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller';


const router = Router();

// Yeni kullanıcı kaydı
router.post('/register', ctrl.register);

// Giriş yapma
router.post('/login', ctrl.login);

// Çıkış yapma (opsiyonel - token silme vs.)
router.post('/logout', ctrl.logout);

export default router;
