// server/models/User.js
const bcrypt = require("bcryptjs");
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


userSchema.pre('save',async function(next){
  if(!this.isModified('password')){
    return next();
  }
  this.password= await bcrypt.hash(this.password,10);
  next();
})

module.exports = mongoose.model('User', userSchema)