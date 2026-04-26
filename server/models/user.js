// server/models/User.js
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String,required:true },
  password:{
    type:String,required:true
  },
  profilePicture: { type: String },
  // isVerified: { type: Boolean, required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema)