import CommentModel from '../models/commentModel.js';
import PostModel from '../models/postModel.js';

const createComment = async (req, res) => {
  try {
    const { description, from } = req.body;
    const post = req.params.id;
    const id = req.user.id;

    if (!description || !post || !id) {
      return res.json({ message: 'Missing data' });
    }

    const newComment = new CommentModel({
      description: description,
      post: post,
      user: id,
      from,
    });

    await newComment.save();

    const updatedPost = await PostModel.findByIdAndUpdate(
      post,
      {
        $push: { comment: newComment._id },
      },
      { new: true },
    );

    res.json({
      message: 'Comment created',
      data: newComment,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

const getComment = async (req, res) => {
  try {
    const comment = await CommentModel.find({ post: req.params.id })
      .populate({
        path: 'user',
        select: 'username avatar',
      })
      .populate({
        path: 'replies.user',
        select: 'username avatar',
      })
      .sort({ _id: -1 });
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.json({
      data: comment,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateComment = async (req, res) => {
  try {
    const { description } = req.body;
    const commentId = req.params.id;

    const updateComment = await CommentModel.findOneAndUpdate(
      { _id: commentId },
      { description: description },
      { new: true },
    );

    if (!updateComment) {
      // If the comment with the given ID is not found
      return res.status(404).json({ message: 'Comment not found' });
    }

    return res.json({
      message: 'Update successful',
      data: updateComment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
const deleteComment = async (req, res) => {
  try {
    const { id } = req.user;
    const commentId = req.params.id;
    const existingComment = await CommentModel.findByIdAndDelete({
      _id: commentId,
      user: id,
    });
    res.json({
      message: 'Delete comment successfully',
      data: existingComment,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Delete failed',
    });
  }
};

export const replyPostComment = async (req, res, next) => {
  const { userId } = req.body.user;
  const { comment, replyAt, from } = req.body;
  const { id } = req.params;

  if (comment === null) {
    return res.status(404).json({ message: 'Comment is required.' });
  }

  try {
    const commentInfo = await Comments.findById(id);

    commentInfo.replies.push({
      comment,
      replyAt,
      from,
      userId,
      created_At: Date.now(),
    });

    commentInfo.save();

    res.status(200).json(commentInfo);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

const CommentCtrl = {
  createComment,
  updateComment,
  deleteComment,
  getComment,
};
export default CommentCtrl;
