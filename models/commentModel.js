import mongoose, { Schema } from 'mongoose';

const CommentSchema = new mongoose.Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'users' },
    post: { type: Schema.Types.ObjectId, ref: 'posts' },
    description: { type: String, required: true },
    from: { type: String, required: true },
    replies: [
      {
        rid: { type: mongoose.Schema.Types.ObjectId },
        user: { type: Schema.Types.ObjectId, ref: 'users' },
        from: { type: String },
        replyAt: { type: String },
        description: { type: String },
        created_At: { type: Date, default: Date.now() },
      },
    ],
  },
  { timestamps: true },
);

const CommentModel = mongoose.model('comments', CommentSchema);

export default CommentModel;
