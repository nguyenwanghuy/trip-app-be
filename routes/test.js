import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validationMiddleware } from '../middlewares/validation.middleware.js';
import {
  acceptRequest,
  friendRequest,
  getFriendRequest,
  getUser,
} from '../controllers/test.js';

const router = express.Router();
router.use(authMiddleware);
//http://localhost:8001/trip/test
router.post('/get-user/:id?', getUser);
router.post('/friend-request', friendRequest);
router.post('/get-friend-request', getFriendRequest);
router.post('/accept-request', acceptRequest);
// router.delete('/delete-friend', deleteFriend);

export default router;
