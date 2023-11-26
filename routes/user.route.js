import express from 'express';
import UserCtrl from '../controllers/UserController.js';
import uploadFile from '../configs/upload.multer.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();
//http://localhost:8001/trip/user
router.get('/:id', authMiddleware, UserCtrl.getUser); // lấy id theo cá nhân kiểu vào trang cá nhân của họ
router.put('/:id/:friendId', authMiddleware, UserCtrl.addRemoveFriend); // add or remove friend
router.put(
  '/upload-avatar',
  authMiddleware,
  uploadFile.single('avatar'),
  UserCtrl.uploadAvatar,
); // upload avatar
router.get('/search/s', authMiddleware, UserCtrl.searchUsers); //search users by username
router.get('/suggest/u', authMiddleware, UserCtrl.suggestUser);

export default router;
