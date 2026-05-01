// server/routes/auth.js
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs');
const User = require('../models/user');




router.post('/register', body('name')
  .trim().notEmpty().withMessage('Name is required')
  .isLength({ min: 3 }).withMessage('Name must be at least 3 characters.'),

  body('email').isEmail().withMessage('Valid email is required.')
    .normalizeEmail(),

  body("password").isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
  , async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        })
      }

      const { name, email, password } = req.body;
      // const email = req.body.email.toLowerCase();
      if (!name || !email || !password) {
        return res.status(400).send({ message: "All fields are required." });
      }

      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).send({ message: "User already exists with this email." });
      }

      user = new User({
        name,
        email,
        password
      });
      await user.save();
      res.json({ user: { id: user._id, name: user.name } });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });



router.post('/login', body('email').isEmail().withMessage('Valid email is required.')
  .normalizeEmail(),

  body("password").isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        })
      }

      const { email, password } = req.body;

      // if (!email || !password) {
      //   return res.status(401).send({
      //     message: "All fields are required.",
      //     status: false
      //   });
      // }

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // const isMatch = await bcrypt.compare(password, user.password);
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      // Set cookie
      res.cookie("token", token, {
        httpOnly: true,       // can't access via JS
        secure: true, // HTTPS only in prod
        sameSite: "none",   // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return res.status(200).send({
        message: "Login successfully.",
        status: true,
        user: {
          id: user._id,
          name: user.name
        }
      });

    } catch (error) {
      console.error("Error in login :", error.message);
      // res.status(500).send({
      //   message: "Error in server.",
      //   status: false
      // });
       res.status(500).json({ error: e.message });
    }
  });

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ status: true });
});

module.exports = router;