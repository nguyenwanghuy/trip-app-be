import jwt, { decode } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import UserModel from '../models/user.model.js';
import RefreshTokenModel from '../models/refreshTokenModel.js';
import crypto from 'crypto';
const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(400).json({
        message: 'Missing required keys',
      });
    }
    const existingUser = await UserModel.findOne({ username });
    if (!existingUser) {
      return res.status(400).json({
        message: 'Invalid credentials!',
      });
    }
    // console.log(existingUser)
    //check password
    const isMatchPassword = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isMatchPassword) {
      return res.status(401).json({
        message: 'Invalid credentials!',
      });
    }
    //token
    const jwtPayload = {
      id: existingUser.id,
      username: existingUser.username,
      password: existingUser.password,
    };
    const token = jwt.sign(jwtPayload, process.env.SECRET_KEY, {
      expiresIn: '7s',
    });
    const refreshToken = jwt.sign(
      jwtPayload,
      process.env.SECRET_KEY_REFRESH_TOKEN,
      {
        expiresIn: '7d',
      },
    );
    //STORE REFRESH TOKEN IN COOKIE
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // khi nào deploy thì chuyển thành true
      path: '/',
      sameSite: 'strict',
    });

    res.json({
      token: token,
      user: existingUser,
      refreshToken: refreshToken,
      message: 'Login successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const register = async (req, res) => {
  const { fullname, email, username, password, isAdmin } = req.body;
  try {
    if (!fullname || !email || !username || !password) {
      return res.status(400).json({
        message: 'Missing required keys',
      });
    }
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.json({
        message: 'User has already exist',
      });
    }
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    //create new user
    const newUser = new UserModel({
      fullname,
      email,
      username,
      password: hashPassword,
      admin: isAdmin ? true : false,
    });

    await newUser.save();
    res.status(200).json({
      message: 'Register new user successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};
const getMe = async (req, res) => {
  try {
    const { id } = req.user;
    const currentUser = await UserModel.findById(id)
      .populate({
        path: 'friends',
        select: '-password',
      })
      .select('-password');
    if (!currentUser) {
      res.status(401);
      throw new Error('user not found');
    }

    res.send({
      userInfo: currentUser,
      message: 'success',
    });
  } catch (error) {
    res.status(500).json(error);
  }
};
const getMeProfile = async (req, res) => {
  try {
    const {
      // avatar,
      fullname,
      age,
      dateOfBirth,
      gender,
      description,
      location,
      profession,
      // password,
    } = req.body;
    const { id } = req.user;
    const salt = await bcrypt.genSalt(10);
    // const hashPassword = await bcrypt.hash(password, salt);
    // Tìm người dùng trong cơ sở dữ liệu và cập nhật thông tin cá nhân
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: id },
      {
        // avatar,
        fullname,
        age,
        dateOfBirth,
        gender,
        description,
        location,
        profession,
        // password: hashPassword,
      },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      updateMeProfile: updatedUser,
      message: 'Your profile has been updated',
    });
  } catch (error) {
    res.status(500).json(error);
  }
};
const requestRefreshToken = async (req, res) => {
  // Khi nào access token hết hạn thì lấy refresh token để tạo một access token mới
  // Lấy refresh token từ cookies
  const refreshToken = req.cookies.refreshToken;
  // console.log(refreshToken);
  if (!refreshToken) {
    return res.status(401).json({
      message: 'You are not authenticated',
    });
  }

  try {
    // Xác minh refresh token
    jwt.verify(
      refreshToken,
      process.env.SECRET_KEY_REFRESH_TOKEN,
      async (err, decoded) => {
        if (err) {
          return res.status(401).json({
            message: 'Invalid refresh token',
          });
        }
        // Tạo access token mới
        const jwtPayload = {
          id: decoded.id,
          username: decoded.username,
          password: decoded.password,
        };
        const newAccessToken = jwt.sign(jwtPayload, process.env.SECRET_KEY, {
          expiresIn: '1h',
        });

        // Tạo refresh token mới
        const newRefreshToken = jwt.sign(
          jwtPayload,
          process.env.SECRET_KEY_REFRESH_TOKEN,
          {
            expiresIn: '7d',
          },
        );
        // Lưu trữ refresh token mới trong cookie
        res.cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: false, // Khi triển khai, hãy chuyển thành true
          path: '/',
          sameSite: 'strict',
        });

        try {
          // Lưu refresh token mới trong db
          const refreshTokenEntry = new RefreshTokenModel({
            refreshToken: newRefreshToken,
            userId: decoded.id,
          });
          await refreshTokenEntry.save();

          res.status(200).json({
            token: newAccessToken,
          });
        } catch (error) {
          console.log(error);
          res.status(500).json(error);
        }
      },
    );
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};
const logout = async (req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).json({
    message: 'Logged out',
  });
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const transporter = nodemailer.createTransport({});

    const mailOptions = {
      from: 'your-email@example.com',
      to: email,
      subject: 'Password Reset',
      text: `Click on the following link to reset your password: ${process.env.CLIENT_URL}/reset-password/${resetToken}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to send reset email' });
      }
      console.log(`Email sent: ${info.response}`);
      res.status(200).json({ message: 'Reset email sent successfully' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
const AuthCtrl = {
  login,
  register,
  getMe,
  getMeProfile,
  requestRefreshToken,
  logout,
};
export default AuthCtrl;
