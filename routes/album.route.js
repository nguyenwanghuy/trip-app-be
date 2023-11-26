import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import AlbumCtrl from '../controllers/AlbumController.js';
import uploadFile from '../configs/upload.multer.js';
const router = express.Router();
router.use(authMiddleware);
//http://localhost:8001/trip/album
router.get('/', AlbumCtrl.getAllAlbum);
router.post('/', AlbumCtrl.createAlbum );
router.put('/:id',AlbumCtrl.updateAlbum);
router.delete('/:id',AlbumCtrl.deleteAlbum);
router.post('/video', AlbumCtrl.uploadVideo)
router.post('/like/:idAlbum',AlbumCtrl.likeAlbum)
router.get('/users/:id',AlbumCtrl.getAlbum);
router.get('/:id',AlbumCtrl.getAlbumById);
router.post('/image', uploadFile.array('image', 5), AlbumCtrl.uploadsImage); // upload image tối đa 5 ảnh



export default router;
