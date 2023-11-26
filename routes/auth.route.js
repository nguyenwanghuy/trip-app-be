import express from 'express';
import AuthCtrl from '../controllers/AuthController.js';
import {
  authMiddleware,
  verifyTokenUser,
} from '../middlewares/auth.middleware.js';
import { validationMiddleware } from '../middlewares/validation.middleware.js';
import { loginSchema } from '../validations/loginValidation.js';
import { registerSchema } from '../validations/registerValidation.js';

const router = express.Router();
//http://localhost:8001/trip/auth
router.post('/login', validationMiddleware(loginSchema), AuthCtrl.login); // đăng nhập tài khoản
router.post(
  '/register',
  validationMiddleware(registerSchema),
  AuthCtrl.register,
); // đăng ký tài khoản
router.get('/me', authMiddleware, AuthCtrl.getMe); // vào trang cá nhân
router.put('/me/profile/:id', authMiddleware, AuthCtrl.getMeProfile); // sửa trang cá nhân
router.post('/refresh', AuthCtrl.requestRefreshToken); // refresh token
router.post('/logout', authMiddleware, AuthCtrl.logout); // logout
export default router;
