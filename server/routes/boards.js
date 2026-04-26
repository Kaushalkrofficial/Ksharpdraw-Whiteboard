// server/routes/boards.js
const router = require('express').Router();
const cookieParser = require('cookie-parser');
const auth = require('../middleware/auth');
const Board = require('../models/board');
const { default: mongoose } = require('mongoose');
// const board = require('../models/Board');


router.get('/', auth, async (req, res) => {
  try {
    const token = req.cookies.token;

    const boards = await Board.find({
      $or: [{ owner: req.user._id }, { collaborators: req.user._id }]
    }).sort('-updatedAt');
    res.json(boards);
  } catch (error) {
    console.error("Boards error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.get('/join/:token', auth, async (req, res) => {
  const board = await Board.findOne({ inviteToken: req.params.token });
  if (!board) return res.status(404).json({ error: 'Invalid link' });
  if (!board.collaborators.includes(req.user._id))
    board.collaborators.push(req.user._id);
  await board.save();
  res.json({ boardId: board._id });
});

router.post('/:id/invite', auth, async (req, res) => {
  try {
    // const token = crypto.randomBytes(12).toString('hex');
    // await Board.findByIdAndUpdate(req.params.id, { inviteToken: token });

    const id = req.params.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: "not found"
      })
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
  return res.status(400).json({ error: 'not found' });
}
    const token = await Board.findById(id);
    console.log(token._id);
    if (!token) {
      return res.status(404).send({
        success: false,
        message: "Token not found"
      })
    }

    res.status(201).send({ link: `${process.env.CLIENT_URL}/join/${token._id}` });
  } catch (error) {
    console.log("Error in generate link ", error)
  }
});

// ---
router.post('/', auth, async (req, res) => {
  const board = await Board.create(
    { ...req.body, owner: req.user._id },
  );
  res.json(board);
});

router.get('/:id', auth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'not found' });
  }
  const board = await Board.findById(req.params.id);
  res.json(board);
});

router.put('/:id', auth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'not found' });
  }
  const board = await Board.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(board);
});

router.delete('/:id', auth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  return res.status(400).json({ error: 'Invalid Board ID' });
}
  await Board.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
