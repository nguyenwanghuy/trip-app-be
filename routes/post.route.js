import express from 'express';
import PostCtrl from '../controllers/PostController.js';
import {
  authMiddleware,
  verifyTokenPost,
} from '../middlewares/auth.middleware.js';
import uploadFile from '../configs/upload.multer.js';
import { validationMiddleware } from '../middlewares/validation.middleware.js';
import { postSchema } from '../validations/postValidation.js';

const router = express.Router();
router.use(authMiddleware);
//http://localhost:8001/trip/post
router.get('/', PostCtrl.getAllPosts); // lất tất cả bài post
router.post('/like/:idPost', PostCtrl.likePost); // like post
router.post('/', validationMiddleware(postSchema), PostCtrl.createPost); // tạo 1 bài post
router.get('/users/:id', PostCtrl.getPost); // get  id post user
router.get('/:id', PostCtrl.getPostById); // get post by user
router.put('/:id', verifyTokenPost, PostCtrl.updatePost); // update post
router.delete('/:id', verifyTokenPost, PostCtrl.deletePost); // delete post
router.post('/image', uploadFile.array('image', 5), PostCtrl.uploadsImage); // upload image tối đa 5 ảnh
router.post('/viewFriend', PostCtrl.checkViewFriend); // chọn bạn để được xem
router.post('/video', uploadFile.single('video'), PostCtrl.uploadVideo);
router.post('/view/:id', authMiddleware, PostCtrl.viewCount);

export default router;
