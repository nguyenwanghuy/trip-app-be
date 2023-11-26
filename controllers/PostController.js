import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

import PostModel from '../models/postModel.js';
import UserModel from '../models/user.model.js';

cloudinary.config({
  cloud_name: 'dmlc8hjzu',
  api_key: '463525567462749',
  api_secret: 'gXldLMlEHGYIDKwoKTBaiSxPEZU',
});

//get all post
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const skip = (page - 1) * size;
    const posts = await PostModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .populate({
        path: 'user',
        select: 'username avatar',
      });
    const totalPosts = await PostModel.countDocuments();
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
// create a new post
const PostVisibility = {
  PRIVATE: 'private',
  PUBLIC: 'public',
  FRIENDS: 'friends',
};

const createPost = async (req, res) => {
  try {
    const {
      content,
      description,
      image,
      viewers,
      visibility,
      dateStart,
      dateEnd,
    } = req.body;
    const { id } = req.user;

    const currentUser = await UserModel.findById(id).select('friends');
    if (!currentUser) {
      return res.status(400).json({ message: 'User not found' });
    }

    let postViewers = [];

    switch (visibility) {
      case PostVisibility.PRIVATE:
        postViewers = [id];
        break;
      case PostVisibility.PUBLIC:
        const allUsers = await UserModel.find().select('_id');
        postViewers = allUsers.map((user) => user._id);
        break;
      case PostVisibility.FRIENDS:
        postViewers = [
          id,
          ...currentUser.friends.filter((friend) =>
            viewers.includes(String(friend)),
          ),
        ];
        break;
      default:
        throw new Error('Invalid visibility option');
    }

    const newPost = new PostModel({
      content,
      description,
      image,
      dateStart,
      dateEnd,
      user: id,
      viewers: postViewers,
      visibility,
    });

    await newPost.save();

    return res.status(201).json({
      data: newPost,
      message: 'Success',
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
// upload image
const uploadsImage = async (req, res) => {
  try {
    // const { content, description, image } = req.body;
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

    // url-mongo
    // const updatePost = await PostModel.findOneAndUpdate(
    //   { _id: req.params.id },
    //   {
    //     content,
    //     description,
    //     image: imageUrl
    //   },
    //   {
    //     new: true,
    //   }
    // )
    // return res.json({
    //   message: 'Uploading image successfully',
    //   data: imageUrl
    // })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
// get post by id
const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await PostModel.findById(id).populate({
      path: 'user',
      select: 'username avatar',
    });
    res.status(200).json({
      data: post,
    });
  } catch (error) {
    res.status(404).send({
      message: error.message,
    });
  }
};

//delete post by id
const deletePost = async (req, res) => {
  try {
    const { id } = req.user;
    const existingPost = await PostModel.findByIdAndDelete({
      _id: req.params.id,
      user: id,
    });
    res.json({
      message: 'Delete post successfully',
      data: existingPost,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error while deleting',
    });
  }
};
//like post
const likePost = async (req, res) => {
  try {
    const idPost = req.params.idPost;
    const userId = req.user.id;
    const post = await PostModel.findById(idPost);
    if (!post) {
      return res.status(404).json({
        message: 'Post not found',
      });
    }
    const likedByUser = post.likes.includes(userId);
    if (likedByUser) {
      post.likes.pop(userId);
    } else {
      post.likes.push(userId);
    }
    const updatePost = await post.save();
    res.status(201).json({
      data: updatePost,
      message: 'Like or unlike successfully',
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const checkViewFriend = async (req, res) => {
  const { content, description, image, viewers } = req.body;
  const { id } = req.user;

  const currentUser = await UserModel.findById(id).select('friends');
  if (!currentUser) {
    res.status(400);
    throw new Error('User not found');
  }

  const shareUser = currentUser.friends.filter((friend) =>
    viewers.includes(String(friend)),
  );

  const newPost = new PostModel({
    content,
    description,
    image,
    user: id,
    viewers: shareUser,
  });
  await newPost.save();
  res.send({
    data: newPost,
    message: 'Success',
  });
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.user;
    const {
      content,
      description,
      image,
      viewers,
      visibility,
      dateStart,
      dateEnd,
      location,
    } = req.body;

    const currentUser = await UserModel.findById(id).select('friends');

    const oldPost = await PostModel.findByIdAndUpdate(req.params.id);

    if (!oldPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    let postViewers = [];

    switch (visibility) {
      case PostVisibility.PRIVATE:
        postViewers = [id];
        break;
      case PostVisibility.PUBLIC:
        const allUsers = await UserModel.find().select('_id');
        postViewers = allUsers.map((user) => user._id);
        break;
      case PostVisibility.FRIENDS:
        postViewers = [
          id,
          ...currentUser.friends.filter((friend) =>
            viewers.includes(String(friend)),
          ),
        ];
        break;
      default:
        throw new Error('Invalid visibility option');
    }

    oldPost.content = content;
    oldPost.description = description;
    oldPost.image = image;
    oldPost.viewers = postViewers;
    oldPost.visibility = visibility;
    oldPost.dateStart = dateStart;
    oldPost.dateEnd = dateEnd;
    oldPost.location = location;

    await oldPost.save();

    return res.json({
      success: true,
      data: oldPost,
      message: 'Update successful',
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const postsByUser = await PostModel.find({ user: id }).populate({
      path: 'user',
      select: 'username avatar',
    });
    res.status(200).json({
      posts: postsByUser,
      message: 'Success',
    });
  } catch (error) {
    res.status(404).send({
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

const viewCount = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await PostModel.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true },
    );

    if (!post) {
      return res.status(404).json({
        message: 'Post not found',
      });
    }

    res.status(200).json({
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const PostCtrl = {
  getAllPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  uploadsImage,
  likePost,
  checkViewFriend,
  getPostById,
  uploadVideo,
  viewCount,
};
export default PostCtrl;
