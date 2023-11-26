import express from 'express';
import authRouter from './auth.route.js';
import userRouter from './user.route.js';
import postRouter from './post.route.js';
import commentRouter from './comment.route.js';
import ReplyCmtRouter from './replyCmt.route.js';
import testRouter from './test.js';
import albumRouter from './album.route.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/post', postRouter);
router.use('/comment', commentRouter);
router.use('/replyCmt', ReplyCmtRouter);
router.use('/test', testRouter);
router.use('/album', albumRouter);

export default router;
