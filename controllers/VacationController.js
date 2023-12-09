import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import Vacation from '../models/vacationModel.js';
import UserModel from '../models/user.model.js';

cloudinary.config({
  cloud_name: 'dmlc8hjzu',
  api_key: '463525567462749',
  api_secret: 'gXldLMlEHGYIDKwoKTBaiSxPEZU',
});

const VacationVisibility = {
  PRIVATE: 'private',
  PUBLIC: 'public',
  FRIENDS: 'friends',
};

// Get all vacations
const getAllVacations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const skip = (page - 1) * size;
    const vacations = await Vacation.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size)
      .populate({
        path: 'user',
        select: 'username avatar',
      });
    const totalVactions = await Vacation.countDocuments();
    const totalPages = Math.ceil(totalVactions / size);
    res.json({
      data: vacations,
      pagination: {
        currentPage: page,
        pageSize: size,
        totalCounts: totalVactions,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new vacation
const createVacation = async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      participants,
      milestones,
      viewers,
      location,
      visibility,
      startDate,
      endDate,
    } = req.body;
    const { id } = req.user;

    const currentUser = await UserModel.findById(id).select('friends');
    if (!currentUser) {
      return res.status(400).json({ message: 'User not found' });
    }

    let vacationViewers = [];

    switch (visibility) {
      case VacationVisibility.PRIVATE:
        vacationViewers = [id];
        break;
      case VacationVisibility.PUBLIC:
        const allUsers = await UserModel.find().select('_id');
        vacationViewers = allUsers.map((user) => user._id);
        break;
      case VacationVisibility.FRIENDS:
        vacationViewers = [
          id,
          ...currentUser.friends.filter((friend) =>
            viewers.includes(String(friend)),
          ),
        ];
        break;
      default:
        throw new Error('Invalid visibility option');
    }

    const newVacation = new Vacation({
      title,
      description,
      location,
      image,
      participants,
      milestones,
      viewers: vacationViewers,
      user: id,
      visibility,
      startDate,
      endDate,
      location,
    });

    await newVacation.save();

    return res.status(201).json({
      data: newVacation,
      message: 'Success',
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Upload image for vacation
const uploadVacationImage = async (req, res) => {
  try {
    const files = req.files;
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

// Get vacation by ID
const getVacation = async (req, res) => {
  try {
    const { id } = req.params;
    const vacation = await Vacation.findById(id)
      .populate({
        path: 'user',
        select: 'username avatar',
      })
      .populate({
        path: 'milestones.posts.user',
        select: 'username avatar',
      });

    res.status(200).json({
      data: vacation,
    });
  } catch (error) {
    res.status(404).send({
      message: error.message,
    });
  }
};

// Delete vacation by ID
const deleteVacation = async (req, res) => {
  try {
    const { id } = req.user;
    const existingVacation = await Vacation.findByIdAndDelete({
      _id: req.params.id,
      user: id,
    });
    res.json({
      message: 'Delete post successfully',
      data: existingVacation,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error while deleting',
    });
  }
};

// Like vacation
const likeVacation = async (req, res) => {
  try {
    const idVacation = req.params.idVacation;
    const userId = req.user.id;
    const vacation = await Vacation.findById(idVacation);
    if (!vacation) {
      return res.status(404).json({
        message: 'vacation not found',
      });
    }
    const likedByUser = vacation.likes.includes(userId);
    if (likedByUser) {
      vacation.likes.pop(userId);
    } else {
      vacation.likes.push(userId);
    }
    const updateVacation = await vacation.save();
    res.status(201).json({
      data: updateVacation,
      message: 'Like or unlike successfully',
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// Update vacation
const updateVacation = async (req, res) => {
  try {
    const { id } = req.user;
    const {
      title,
      description,
      participants,
      viewers,
      visibility,
      startDate,
      endDate,
      location,
    } = req.body;

    const currentUser = await UserModel.findById(id).select('friends');

    const oldVacation = await Vacation.findByIdAndUpdate(req.params.id);

    if (!oldVacation) {
      return res.status(404).json({ message: 'vacation not found' });
    }

    let vacationViewers = [];

    switch (visibility) {
      case VacationVisibility.PRIVATE:
        vacationViewers = [id];
        break;
      case VacationVisibility.PUBLIC:
        const allUsers = await UserModel.find().select('_id');
        vacationViewers = allUsers.map((user) => user._id);
        break;
      case VacationVisibility.FRIENDS:
        vacationViewers = [
          id,
          ...currentUser.friends.filter((friend) =>
            viewers.includes(String(friend)),
          ),
        ];
        break;
      default:
        throw new Error('Invalid visibility option');
    }

    oldVacation.title = title;
    oldVacation.description = description;
    oldVacation.participants = participants;
    oldVacation.viewers = vacationViewers;
    oldVacation.visibility = visibility;
    oldVacation.startDate = startDate;
    oldVacation.endDate = endDate;
    oldVacation.location = location;

    await oldVacation.save();

    return res.json({
      success: true,
      data: oldVacation,
      message: 'Update successful',
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get vacations by user ID
const getVacationsById = async (req, res) => {
  try {
    const { id } = req.params;
    const vacationsByUser = await Vacation.find({ user: id }).populate({
      path: 'user',
      select: 'username avatar',
    });
    res.status(200).json({
      vacations: vacationsByUser,
      message: 'Success',
    });
  } catch (error) {
    res.status(404).send({
      message: error.message,
    });
  }
};

// View count for vacation
const viewCountVacation = async (req, res) => {
  try {
    const { id } = req.params;

    const vacation = await Vacation.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true },
    );

    if (!vacation) {
      return res.status(404).json({
        message: 'vacation not found',
      });
    }

    res.status(200).json({
      data: vacation,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const VacationCtrl = {
  getAllVacations,
  createVacation,
  getVacation,
  updateVacation,
  deleteVacation,
  uploadVacationImage,
  likeVacation,
  getVacationsById,
  viewCountVacation,
};

export default VacationCtrl;
