import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    username_lowercase: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    userId: { type: String, required: true },
    secretId: { type: String, required: true },

    createdAt: { type: Date, default: Date.now },
    permissions: { type: Object, default: {mod: false, admin: false} },

    posts: { type: Array, default: [] },
    comments: { type: Array, default: [] },

    pronounce: { type: String, default: "" },
    bio: { type: String, default: "" },
    avatar: { type: String, required: true },

    following: { type: Array, default: [] },
    followers: { type: Array, default: [] },
});

const User = mongoose.model("User", userSchema);
export { User }