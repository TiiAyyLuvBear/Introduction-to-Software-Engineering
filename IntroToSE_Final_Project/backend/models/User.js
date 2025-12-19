import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
    // MongoDB automatically indexes _id, no need to specify
  },

  fullName: {
    type: String,
    trim: true,
    default: ""
  },

  name: {
    type: String,
    required: true,
  },

  phoneNumber: {
    type: String,
    default: null,
  },

  avatarURL: {
    type: String,
    default: null,
  },

  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    index: true,
    default: ""
  },

  passWordHash: {
    type: String,
    default: null  // Not used with Firebase auth
  },

  roles: {
    type: [String],
    default: ["user"],
  },

},
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

export default mongoose.model("User", userSchema);