import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import PostModel from '../models/postModel.js';
import UserModel from '../models/user.model.js';
import Vacation from '../models/vacationModel.js';

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
    const { content, description, image, milestoneId } = req.body;
    const { id } = req.user;
    console.log(req.body);

    const currentUser = await UserModel.findById(id).select('friends');
    if (!currentUser) {
      return res.status(400).json({ message: 'User not found' });
    }

    const newPost = new PostModel({
      content,
      description,
      image,
      user: id,
      milestone: milestoneId,
    });

    await newPost.save();

    const vacation = await Vacation.findOneAndUpdate(
      { 'milestones._id': milestoneId },
      { $push: { 'milestones.$.posts': newPost } },
      { new: true },
    );

    if (!vacation) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    return res.status(201).json({
      data: newPost,
      message: 'Success',
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.user;
    console.log(id);
    const { content, description, image } = req.body;

    console.log(req.body);

    const vacation = await Vacation.findOne({
      'milestones.posts._id': req.params.id,
    });

    console.log(vacation);

    if (!vacation) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const milestone = vacation.milestones.find((milestone) =>
      milestone.posts.some((post) => post._id == req.params.id),
    );

    if (!milestone) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = milestone.posts.find((post) => post._id == req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== id) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    post.content = content;
    post.description = description;
    post.image = image;

    await vacation.save();

    return res.status(200).json({
      data: post,
      message: 'Post updated successfully',
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
          fs.unlinkSync(f.path);
          return result;
        });
    });
    Promise.all(uploadPromises)
      .then((results) => {
        const imageUrl = results.map((result) => result.url);

        return res
          .status(200)
          .json({ message: 'Upload successful', data: imageUrl });
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json({ error: 'Upload failed' });
      });
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
    const { id: userId } = req.user;
    const postId = req.params.id;

    const vacation = await Vacation.findOne({
      'milestones.posts': postObjectId,
    });

    if (!vacation) {
      return res.status(404).json({
        message: 'Post not found in any vacation',
      });
    }

    // Find the milestone containing the post
    const milestone = vacation.milestones.find((milestone) =>
      milestone.posts.some((post) => post.equals(postObjectId)),
    );

    if (!milestone) {
      return res.status(404).json({
        message: 'Milestone containing the post not found',
      });
    }

    // Update the milestone by removing the post
    milestone.posts.pull(postObjectId);

    // Save the updated vacation document
    await vacation.save();

    return res.status(200).json({
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Error while deleting',
      error: error.message,
    });
  }
};

//like post
const likePost = async (req, res) => {
  try {
    const postId = req.params.idPost;
    const userId = req.user.id;

    const vacation = await Vacation.findOne({ 'milestones.posts._id': postId });

    if (!vacation) {
      return res.status(404).json({
        message: 'Post not found',
      });
    }

    const milestone = vacation.milestones.find((milestone) =>
      milestone.posts.some((post) => post._id.equals(postId)),
    );

    if (!milestone) {
      return res.status(404).json({
        message: 'Post not found',
      });
    }

    const post = milestone.posts.find((post) => post._id.equals(postId));

    if (!post) {
      return res.status(404).json({
        message: 'Post not found',
      });
    }

    const likedByUser = post.likes.includes(userId);

    if (likedByUser) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await vacation.save();

    res.status(201).json({
      data: post,
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
