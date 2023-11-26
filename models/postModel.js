import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    image: {
      type: Array,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    comment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comments',
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
      },
    ],
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
      },
    ],
    visibility: {
      type: String,
      enum: ['private', 'public', 'friends'],
      default: 'public',
    },
    dateStart: {
      type: String,
    },
    dateEnd: {
      type: String,
    },
    location: {
      type: String,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const PostModel = mongoose.model('posts', PostSchema);
export default PostModel;
