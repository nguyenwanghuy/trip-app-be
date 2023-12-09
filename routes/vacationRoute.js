import express from 'express';
import {
  authMiddleware,
  verifyTokenPost,
} from '../middlewares/auth.middleware.js';
import uploadFile from '../configs/upload.multer.js';
import VacationCtrl from '../controllers/vacationController.js';

const router = express.Router();
router.use(authMiddleware);
//http://localhost:8001/trip/post
router.get('/', VacationCtrl.getAllVacations); // lất tất cả bài post
router.post('/like/:idPost', VacationCtrl.likeVacation); // like post
router.post('/', VacationCtrl.createVacation); // tạo 1 bài post
router.get('/users/:id', VacationCtrl.getVacation); // get  id post user
router.get('/:id', VacationCtrl.getVacationsById); // get post by user
router.put('/:id', VacationCtrl.updateVacation); // update post
router.delete('/:id', VacationCtrl.deleteVacation); // delete post
router.post(
  '/image',
  uploadFile.array('image', 5),
  VacationCtrl.uploadVacationImage,
); // upload image tối đa 5 ảnh
router.post('/view/:id', authMiddleware, VacationCtrl.viewCountVacation);

export default router;
