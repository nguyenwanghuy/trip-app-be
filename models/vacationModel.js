import mongoose, { Schema } from 'mongoose';
import PostModel from './postModel.js';

const milestoneSchema = new Schema({
  date: { type: Date, required: true },
  description: { type: String, required: true },
  posts: [PostModel.schema],
});

const vacationSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  location: { type: String, required: true },
  milestones: [milestoneSchema],
  visibility: {
    type: String,
    enum: ['private', 'public', 'friends'],
    default: 'public',
  },
  viewers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
  ],
  image: {
    type: Array,
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  comment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
}, { timestamps: true },);

const Vacation = mongoose.model('Vacation', vacationSchema);

export default Vacation;
