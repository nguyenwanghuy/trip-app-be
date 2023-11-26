import mongoose, { Schema } from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, 'Full Name is Required!'],
    },
    username: {
      type: String,
      required: [true, 'User Name is Required!'],
    },
    email: {
      type: String,
      required: [true, ' Email is Required!'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is Required!'],
      minlength: [6, 'Password length should be greater than 6 characters'],
      select: true,
    },
    avatar: {
      type: String,
      default:
        'https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png',
    },
    age: {
      type: Number,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
    },
    description: {
      type: String,
    },
    location: {
      type: String,
    },
    profession: {
      type: String,
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'users',
      },
    ],
    admin:{
      type: Boolean,
      default: false,
  },
  },
  { timestamps: true },
);

const UserModel = mongoose.model('users', UserSchema);
export default UserModel;
