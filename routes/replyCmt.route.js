import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import ReplyCmtCtrl from '../controllers/ReplyCmtController.js';
import { validationMiddleware } from '../middlewares/validation.middleware.js';

const router = express.Router();
router.use(authMiddleware);
//http://localhost:8001/trip/replyCmt
router.get('/', ReplyCmtCtrl.getReplyCmt); // lấy tất cả replycomment có thể không dùng đến
router.post('/:idcmt', ReplyCmtCtrl.createReplyCmt); // đăng theo id bài cmt
router.put('/:idcmt', ReplyCmtCtrl.updateReplyCmt); // update comment theo id cmt
router.delete('/:idcmt', ReplyCmtCtrl.deleteReplyCmt); // delete comment theo id cmt

export default router;
