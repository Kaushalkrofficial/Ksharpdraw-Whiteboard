// server/routes/auth.js
const router = require('express').Router();
const jwt = require('jsonwebtoken');
// const User = require('../models/User');
const bcrypt = require('bcryptjs');
const user = require('../models/User');
// const User = require('../models/User');

// const User = require('../models/User');



router.post('/register', async (req, res) => {
  try {
    const user = await user.create(req.body);
    res.json({ token: sign(user._id), user: { id: user._id, name: user.name } });
  } catch (e) { 
    res.status(400).json({ error: e.message }); 
  }
});



router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        message: "All fields are required.",
        status: false
      });
    }

    const user = await user.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // const isMatch = await bcrypt.compare(password, user.password);
    const isMatch = password == user.password;

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,       // can't access via JS
      secure: false, // HTTPS only in prod
      // sameSite: "strict",   // CSRF protection
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
    res.status(500).send({
      message: "Error in server.",
      status: false
    });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ status: true });
});

module.exports = router;