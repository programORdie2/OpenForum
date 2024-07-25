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
    comments: { 
        type: [{
            userId: { type: String, required: true },
            commentId: { type: String, required: true },

            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now },

            content: { type: String, required: true },
            parent: { type: String, default: "" },
            children: { type: Array, default: [] },

            likes: { type: Array, default: [] },

            deleted: { type: Boolean, default: false },
        }],
        default: []
    },
    likes: { type: Array, default: [] },

    public: { type: Boolean, default: false },
    serializedTitle: { type: String, default: "" },

    views: { type: Map, of: Number, default: {} },
});

const Post = mongoose.model("Post", postSchema);
export { Post }