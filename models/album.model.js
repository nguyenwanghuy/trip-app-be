import mongoose from 'mongoose';

const AlbumSchema = new mongoose.Schema(
  {
    albumName: {
      type: String,
      required: true,
    },
    images: [],
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
  },
  { timestamps: true },
);
const AlbumModel = mongoose.model('albums', AlbumSchema);
export default AlbumModel;
