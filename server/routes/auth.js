// server/routes/auth.js
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { generateVerificationCode } = require('../utils/generateVerificationCode');
const { generateEmailTemplate } = require('../utils/emailTemplet');
const { sendEmail } = require('../utils/sendEmail');




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
      // Generate verification code
      const { code, expires } = generateVerificationCode();
      const message = generateEmailTemplate(code);
      user = new User({
        name,
        email,
        password,
        verificationCode: code,
        verificationCodeExpire: expires,
      });

      // Send verification email
      const emailHtml = message;
      //  `<p>Your verification code is: <strong>${code}</strong></p><p>It will expire in 10 minutes.</p>`;
      await sendEmail({
        email: user.email,
        subject: "Email Verification Code",
        html: emailHtml
      });
      await user.save(); // Correctly awaiting the save operation
      res.status(201).send({
        success: true,
        message: `Verification email sent to ${user.email}. Please check your inbox.`,
      });
      // await user.save();
      // res.json({ user: { id: user._id, name: user.name } });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

//---------- Verify OTP ----------
router.post('/verify-otp',
  //-------Validate ------
  [body('email').notEmpty().withMessage("Required fiels.")
    .isEmail().withMessage("Valid Email is required.")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        })
      }
      const { email, otp } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).send({ message: 'Invalid OTP.' });
      }
      //-----------Count attempt -------------

      if (user.otpAttempts >= 5) {
        return res.status(429).send({ message: "Too many attempts" });
      }

      if (user.verificationCode !== otp) {
        user.otpAttempts += 1;
        await user.save();
        return res.status(400).send({ message: "Invalid OTP." });
      }

      if (user.verificationCode !== otp) {
        return res.status(400).send({ message: 'Invalid OTP.' });
      }
      if (Date.now() > user.verificationCodeExpire) {
        return res.status(400).send({ message: 'OTP has expired. Please request a new one.' });
      }

      user.accountVerified = true;
      user.verificationCode = undefined;
      user.verificationCodeExpire = undefined;
      await user.save();

      // Optionally, log the user in immediately by sending a token
      // const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '24h' });

      res.status(200).send({
        message: "Email verified successfully.",
        // token,
        user: { id: user._id, name: user.name, email: user.email }
      });

    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  }
)


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

      const user = await User.findOne({ email }).select(`+password`);

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      if (!user.accountVerified) {
        return res.status(403).send({ message: "Account not verified. Please check your email for the OTP." });
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