import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    authorId: { type: String, required: true },
    postId: { type: String, required: true },
    title: { type: String, required: true },
    topic: { type: String, required: true },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    publischedAt: { type: Date },
    content: { type: String, required: true },
    reactions: { type: Array, default: [] },
    likes: { type: Array, default: [] },

    public: { type: Boolean, default: false },
    serializedTitle: { type: String, default: "" },

    views: { type: Map, of: Number, default: {} },
});

const Post = mongoose.model("Post", postSchema);
export { Post }