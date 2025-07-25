const express = require('express');
const router = express.Router();
const Reply = require('../../models/Reply');

// GET replies of a comment
router.get('/:commentId', async (req, res) => {
  try {
    const replies = await Reply.find({ parentCommentId: req.params.commentId }).sort({ createdAt: 1 });
    res.status(200).json(replies);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get replies' });
  }
});

// POST reply to a comment
router.post('/', async (req, res) => {
  const { parentCommentId, author, message } = req.body;
  if (!parentCommentId || !author || !message) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const reply = new Reply({ parentCommentId, author, message });
    await reply.save();
    res.status(201).json(reply);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create reply' });
  }
});

// DELETE a reply
router.delete('/:replyId', async (req, res) => {
  const { replyId } = req.params;

  try {
    const deletedReply = await Reply.findByIdAndDelete(replyId);
    if (!deletedReply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    res.status(200).json({ message: 'Reply deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete reply' });
  }
});


module.exports = router;
