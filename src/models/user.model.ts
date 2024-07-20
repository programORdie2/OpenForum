import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userId: { type: String, required: true },
    secretId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    permissions: { type: Object, default: {mod: false, admin: false} }, 
});

const User = mongoose.model("User", userSchema);
export { User }