import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
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
    milestoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone' },
  },
  { timestamps: true },
);

const PostModel = mongoose.model('posts', postSchema);

export default PostModel;
