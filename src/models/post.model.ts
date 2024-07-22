import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    authorId: { type: String, required: true },
    postId: { type: String, required: true },
    title: { type: String, required: true },
    topic: { type: String, required: true },

    createdAt: { type: Date, default: Date.now },
    content: { type: String, required: true },
    reactions: { type: Array, default: [] },
    likes: { type: Array, default: [] },
});

const Post = mongoose.model("Post", postSchema);
export { Post }