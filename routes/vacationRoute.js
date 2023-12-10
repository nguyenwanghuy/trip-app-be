import express from 'express';
import {
  authMiddleware,
  verifyTokenPost,
} from '../middlewares/auth.middleware.js';
import uploadFile from '../configs/upload.multer.js';
import VacationCtrl from '../controllers/VacationController.js';

const router = express.Router();
router.use(authMiddleware);
//http://localhost:8001/trip/post
router.get('/', VacationCtrl.getAllVacations);
router.post('/like/:idVacation', VacationCtrl.likeVacation);
router.post('/', VacationCtrl.createVacation);
router.get('/users/:id', VacationCtrl.getVacation);
router.get('/:id', VacationCtrl.getVacationsById);
router.put('/:id', VacationCtrl.updateVacation);
router.delete('/:id', VacationCtrl.deleteVacation);
router.post(
  '/image',
  uploadFile.array('image', 5),
  VacationCtrl.uploadVacationImage,
); // upload image tối đa 5 ảnh
router.post('/view/:id', authMiddleware, VacationCtrl.viewCountVacation);
router.post('/milestones/:id', VacationCtrl.addMilestone);
router.delete('/milestones/:id/:milestoneId', VacationCtrl.deleteMilestone);

export default router;
