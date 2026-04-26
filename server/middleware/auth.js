const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports=async (req, res, next)=> {


  try {
    const token = req.cookies.token;

  

    if (!token) {
      return res.status(401).json({ error: 'No token' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded:", decoded);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      console.log("User not found in DB");
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;

    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};