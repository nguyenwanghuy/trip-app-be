import CommentModel from '../models/commentModel.js';

const createReplyCmt = async (req, res) => {
  const id = req.user.id;
  const { description, replyAt, from } = req.body;
  const { idcmt } = req.params;

  if (!description) {
    return res.status(400).json({ message: 'Description is required.' });
  }

  try {
    const commentInfo = await CommentModel.findByIdAndUpdate(idcmt);

    if (!commentInfo) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    commentInfo.replies.push({
      description,
      replyAt,
      from,
      user: id,
      created_At: Date.now(),
    });

    console.log(commentInfo);

    await commentInfo.save();

    res.status(200).json(commentInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const getReplyCmt = async (req, res) => {
  const replyCmt = await ReplyCmtModel.find();
  if (!replyCmt)
    return res.status(400).json({ message: 'ReplyComment not found' });
  res.json({
    data: replyCmt,
  });
};
const updateReplyCmt = async (req, res) => {
  try {
    const { description } = req.body;
    const cmtId = req.params.idCmt;
    const updateReplyCmt = await ReplyCmtModel.findOneAndUpdate(
      { _id: cmtId },
      {
        description: description,
      },
      {
        new: true,
      },
    );
    return res.json({
      message: 'Update successfully',
      data: updateReplyCmt,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
const deleteReplyCmt = async (req, res) => {
  try {
    const { id } = req.user;
    const cmtId = req.params.idCmt;
    const existingReplyCmt = await ReplyCmtModel.findByIdAndDelete({
      _id: cmtId,
      user: id,
    });
    res.json({
      message: 'Delete comment successfully',
      data: existingReplyCmt,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Delete failed',
    });
  }
};

const ReplyCmtCtrl = {
  createReplyCmt,
  getReplyCmt,
  updateReplyCmt,
  deleteReplyCmt,
};
export default ReplyCmtCtrl;
