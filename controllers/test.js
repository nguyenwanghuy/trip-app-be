import FriendRequest from '../models/friendRequest.js';
import UserModel from '../models/user.model.js';

export const getUser = async (req, res) => {
  try {
    const id = req.user.id;
    console.log(id);
    const { UserId } = req.params;

    const user = await UserModel.findById(UserId ?? id).populate({
      path: 'friends',
      select: '-password',
    });

    if (!user) {
      return res.status(200).send({
        message: 'User Not Found',
        success: false,
      });
    }

    user.password = undefined;

    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'auth error',
      success: false,
      error: error.message,
    });
  }
};

export const friendRequest = async (req, res) => {
  try {
    const { requestTo } = req.body;
    const requestFrom = req.user.id;

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { requestFrom, requestTo },
        { requestFrom: requestTo, requestTo: requestFrom },
      ],
    });

    if (existingRequest) {
      await FriendRequest.findByIdAndDelete(existingRequest._id);
    }

    const existingFriendship = await FriendRequest.findOne({
      $or: [
        {
          requestFrom: requestTo,
          requestTo: requestFrom,
          requestStatus: 'Accepted',
        },
        {
          requestFrom: requestFrom,
          requestTo: requestTo,
          requestStatus: 'Accepted',
        },
      ],
    });

    if (existingFriendship) {
      return res.status(409).json({
        success: false,
        message: 'Already friends.',
      });
    }

    const newRequest = await FriendRequest.create({
      requestTo,
      requestFrom,
    });

    res.status(201).json({
      success: true,
      message: 'Friend Request sent successfully',
      data: newRequest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

export const getFriendRequest = async (req, res) => {
  try {
    const id = req.user.id;

    const requests = await FriendRequest.find({
      requestTo: id,
      requestStatus: 'Pending',
    })
      .populate({
        path: 'requestFrom',
        select: 'username avatar',
      })
      .limit(10)
      .sort({ _id: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

export const acceptRequest = async (req, res, next) => {
  try {
    const id = req.user.id;
    const { rid, status } = req.body;

    const requestExist = await FriendRequest.findById(rid);

    if (!requestExist) {
      next('No Friend Request Found.');
      return;
    }

    const newRes = await FriendRequest.findByIdAndUpdate(
      { _id: rid },
      { requestStatus: status },
    );

    if (status === 'Accepted') {
      const user = await UserModel.findById(id);

      user.friends.push(newRes?.requestFrom);

      await user.save();

      const friend = await UserModel.findById(newRes?.requestFrom);

      friend.friends.push(newRes?.requestTo);

      await friend.save();
    }

    res.status(201).json({
      success: true,
      message: 'Friend Request ' + status,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'auth error',
      success: false,
      error: error.message,
    });
  }
};

// export const deleteFriend = async (req, res) => {
//   try {
//     const id = req.user.id;
//     const { friendId } = req.body;

//     // Check if the friendId is valid
//     if (!friendId) {
//       return res.status(400).json({
//         success: false,
//         message: 'FriendId is required for deletion.',
//       });
//     }

//     // Find the user and friend documents
//     const user = await UserModel.findById(id);
//     const friend = await UserModel.findById(friendId);

//     // Check if the friend is not found
//     if (!friend) {
//       return res.status(404).json({
//         success: false,
//         message: 'Friend not found.',
//       });
//     }

//     // Remove friendId from user's friends
//     user.friends = user.friends.filter((f) => f.toString() !== friendId);
//     await user.save();

//     // Remove userId from friend's friends
//     friend.friends = friend.friends.filter((f) => f.toString() !== id);
//     await friend.save();

//     // Delete any friend request records
//     await FriendRequest.deleteMany({
//       $or: [
//         { requestFrom: id, requestTo: friendId },
//         { requestFrom: friendId, requestTo: id },
//       ],
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Friend deleted successfully',
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal Server Error',
//       error: error.message,
//     });
//   }
// };
