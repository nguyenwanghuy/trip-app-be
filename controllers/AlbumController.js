import AlbumModel from '../models/album.model.js';
import UserModel from '../models/user.model.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
cloudinary.config({
  cloud_name: 'dmlc8hjzu',
  api_key: '463525567462749',
  api_secret: 'gXldLMlEHGYIDKwoKTBaiSxPEZU',
});

const getAllAlbum = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const skip = (page - 1) * size;
    const posts = await AlbumModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .populate({
        path: 'user',
        select: 'username avatar',
      });
    const totalPosts = await AlbumModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / size);
    res.json({
      data: posts,
      pagination: {
        currentPage: page,
        pageSize: size,
        totalCounts: totalPosts,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const AlbumVisibility = {
  PRIVATE: 'private',
  PUBLIC: 'public',
  FRIENDS: 'friends',
};
const createAlbum = async (req, res) => {
  try {
    const { albumName, description, images, visibility, viewers } = req.body;
    const { id } = req.user;

    const currentUser = await UserModel.findById(id).select('friends');
    if (!currentUser) {
      return res.status(400).json({ message: 'User not found' });
    }

    let albumViewers = [];

    switch (visibility) {
      case AlbumVisibility.PRIVATE:
        albumViewers = [id];
        break;
      case AlbumVisibility.PUBLIC:
        const allUsers = await UserModel.find().select('_id');
        albumViewers = allUsers.map((user) => user._id);
        break;
      case AlbumVisibility.FRIENDS:
        albumViewers = [
          id,
          ...currentUser.friends.filter((friend) =>
            viewers.includes(String(friend)),
          ),
        ];
        break;
      default:
        throw new Error('Invalid visibility option');
    }

    const newAlbum = new AlbumModel({
      albumName,
      images,
      user: id,
      viewers: albumViewers,
      visibility,
    });

    await newAlbum.save();

    return res.status(201).json({
      data: newAlbum,
      message: 'Success',
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const album = await AlbumModel.findById(id).populate({
      path: 'user',
      select: 'username avatar',
    });
    res.status(200).json({
      data: album,
    });
  } catch (error) {
    res.status(404).send({
      message: error.message,
    });
  }
};
const updateAlbum = async (req, res) => {
  try {
    const { albumName, description, images, visibility, viewers } = req.body;
    const { id } = req.user;

    const currentUser = await UserModel.findById(id).select('friends');
    if (!currentUser) {
      return res.status(400).json({ message: 'User not found' });
    }

    const existingAlbum = await AlbumModel.findById(req.params.id);
    if (!existingAlbum) {
      return res.status(404).json({ message: 'Album not found' });
    }

    if (existingAlbum.user.toString() !== id) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    let albumViewers = [];

    switch (visibility) {
      case AlbumVisibility.PRIVATE:
        albumViewers = [id];
        break;
      case AlbumVisibility.PUBLIC:
        const allUsers = await UserModel.find().select('_id');
        albumViewers = allUsers.map((user) => user._id);
        break;
      case AlbumVisibility.FRIENDS:
        albumViewers = [
          id,
          ...currentUser.friends.filter((friend) =>
            viewers.includes(String(friend)),
          ),
        ];
        break;
      default:
        throw new Error('Invalid visibility option');
    }

    existingAlbum.albumName = albumName;
    existingAlbum.description = description;
    existingAlbum.images = images;
    existingAlbum.visibility = visibility;
    existingAlbum.viewers = albumViewers;

    await existingAlbum.save();

    return res.json({
      message: 'Update successfully',
      data: existingAlbum,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
const deleteAlbum = async (req, res) => {
  try {
    const { id } = req.user;
    const existingAlbum = await AlbumModel.findByIdAndDelete({
      _id: req.params.id,
      user: id,
    });
    res.json({
      message: 'Delete post successfully',
      data: existingAlbum,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error while deleting',
    });
  }
};
const uploadsImage = async (req, res) => {
  try {
    //add file
    const files = req.files;
    //upload file to cloudinary server
    const uploadPromises = files.map((f) => {
      return cloudinary.uploader
        .upload(f.path, {
          resource_type: 'auto',
          folder: 'SOCIALMEDIA',
        })
        .then((result) => {
          // Xử lý kết quả từ Cloudinary
          // console.log(result);
          fs.unlinkSync(f.path); // Xóa tệp tạm thời sau khi đã tải lên thành công
          return result;
        });
    });
    Promise.all(uploadPromises)
      .then((results) => {
        const imageUrl = results.map((result) => result.url);
        // Xử lý kết quả từ Cloudinary
        // console.log(results);
        return res
          .status(200)
          .json({ message: 'Upload successful', data: imageUrl });
      })
      .catch((error) => {
        // Xử lý lỗi từ Cloudinary
        console.log(error);
        return res.status(400).json({ error: 'Upload failed' });
      });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
const likeAlbum = async (req, res) => {
  try {
    const idAlbum = req.params.idAlbum;
    const userId = req.user.id;
    const album = await AlbumModel.findById(idAlbum);
    if (!album) {
      return res.status(404).json({
        message: 'Album not found',
      });
    }
    const likedByUser = album.likes.includes(userId);
    if (likedByUser) {
      album.likes.pop(userId);
    } else {
      album.likes.push(userId);
    }
    const updateAlbum = await album.save();
    res.status(201).json({
      data: updateAlbum,
      message: 'Like or unlike successfully',
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
const uploadVideo = async (req, res) => {
  try {
    const file = req.file;
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'auto',
      folder: 'SOCIALMEDIA',
    });
    fs.unlinkSync(file.path);
    const videoUrl = result && result.secure_url;
    return res.status(200).json({
      data: videoUrl,
      message: 'upload video successfully',
    });
  } catch (error) {
    res.status(500).json({ error: 'upload failed' });
  }
};
const getAlbumById = async (req, res) => {
  try {
    const { id } = req.params;
    const albumsByUser = await AlbumModel.find({ user: id }).populate({
      path: 'user',
      select: 'username avatar',
    });
    res.status(200).json({
      albums: albumsByUser,
      message: 'Success',
    });
  } catch (error) {
    res.status(404).send({
      message: error.message,
    });
  }
};

const AlbumCtrl = {
  getAllAlbum,
  createAlbum,
  getAlbum,
  updateAlbum,
  deleteAlbum,
  uploadsImage,
  likeAlbum,
  uploadVideo,
  getAlbumById,
};

export default AlbumCtrl;
