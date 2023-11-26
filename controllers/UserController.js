import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import UserModel from '../models/user.model.js';
import PostModel from '../models/postModel.js';

cloudinary.config({
  cloud_name: 'dxsyy0ocl',
  api_key: '719715235574389',
  api_secret: 'ICZrIwcuhpQr24efU2DZ6CjAEIQ',
});
const uploadAvatar = async (req, res) => {
  try {
    const { id } = req.user;

    // Retrieve the avatar URL from the request body
    const { avatar } = req.body;
    console.log(avatar);

    // Update the user's avatar in the database
    const updateUser = await UserModel.findOneAndUpdate(
      { _id: id },
      { avatar },
      { new: true },
    ).select('-password');

    return res.json({
      message: 'Uploading avatar successfully',
      data: updateUser,
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).send(error);
  }
};
// get user by id
const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id).select('-password').populate({
      path: 'friends',
      select: 'avatar username',
    });
    res.status(200).json({
      data: user,
      message: 'User here',
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await UserModel.findById(id);
    const friend = await UserModel.findById(friendId);
    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = friend.friends.filter((id) => id !== id);
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }
    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((id) => UserModel.findById(id)),
    );
    const formatFriend = friends.map(({ _id, fullname, username, avatar }) => {
      return { _id, fullname, username, avatar };
    });
    res.status(200).json({
      data: formatFriend,
      message: 'Add and remove friend',
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const searchUsers = async (req, res) => {
  try {
    const searchTerm = req.query.term?.toString();
    const searchUsers = await UserModel.find({
      username: { $regex: searchTerm },
    }).select('username avatar');
    if (!searchUsers)
      return res.status(404).json({ message: 'User not found' });
    const searchContent = await PostModel.find({
      content: { $regex: searchTerm },
    }).populate({
      path: 'user',
      select: 'username avatar',
    });
    if (!searchContent)
      return res.status(404).json({ message: 'Post not found' });
    res.status(200).json({
      searchUsers: searchUsers,
      searchContent: searchContent,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const suggestUser = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await UserModel.findById(id);
    const users = await UserModel.find().select('username avatar -password');

    const nonFriend = users.filter(
      (u) => u.id !== user.id && !user.friends.includes(u.id),
    );
    const randomUsers = getRandomElements(nonFriend, 2);
    res.status(200).send({
      data: randomUsers,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
// Hàm lấy ngẫu nhiên các phần tử từ một mảng
function getRandomElements(array, count) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
const UserCtrl = {
  uploadAvatar,
  getUser,
  addRemoveFriend,
  searchUsers,
  suggestUser,
};

export default UserCtrl;
