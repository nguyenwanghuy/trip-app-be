import mongoose, { Schema } from 'mongoose';

const requestSchema = Schema(
  {
    requestTo: { type: Schema.Types.ObjectId, ref: 'users' },
    requestFrom: { type: Schema.Types.ObjectId, ref: 'users' },
    requestStatus: { type: String, default: 'Pending' },
  },
  { timestamps: true },
);

const FriendRequest = mongoose.model('FriendRequest', requestSchema);

export default FriendRequest;
