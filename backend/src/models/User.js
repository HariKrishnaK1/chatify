import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 },
    profilePic: { type: String, default: "" },
    about: { type: String, default: "I'm using Chatify!" },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationCodeExpiresAt: { type: Date },
  },
  { timestamps: true } // createdAt & updatedAt
);

const User = mongoose.model("User", userSchema);

export default User;
