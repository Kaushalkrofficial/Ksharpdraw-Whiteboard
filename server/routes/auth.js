// server/routes/auth.js
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs');
const crypto =require('crypto')
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


// --------------------forgot password----------------
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(401).json({ error: 'Enter required fields.' })
    }
    const user = await User.findOne({ email, accountVerified: true });
    if (!user) {
      // Security: Don't reveal if a user exists or not.
      return res.status(200).send({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;
    let message;

      message = `<p>You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the following link, or paste this into your browser to complete the process within 15 minutes:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`;
    

    // console.log(user.isAdmin)
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      html: message,
    });

    res.status(200).send({ message: 'If an account with that email exists, a password reset link has been sent.' });

  } catch (error) {
    console.error(error);
    // Clear tokens on error to prevent locked accounts
    if (req.body.email) {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
      }
    }
    res.status(500).send({ message: 'Error sending email.' });
  }
})

// -------------------Reset Password----------------

router.put('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;

    // Validate password  (min 8, max 128, upper, lower, number, special, no spaces)
    // const validationError = validatePassword(password);
    // if (validationError) {
    //   return res.status(400).json({ message: validationError });
    // }

    if(!password){
      return res.status(400).json({message: 'Enter required field.'})
    }
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset token is invalid or has expired.' });
    }

    // Set new password (it will be hashed by the pre-save hook)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successful.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to reset password.' });
  }
});


module.exports = router;