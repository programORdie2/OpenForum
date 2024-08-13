import { DataTypes, Model } from "sequelize"
import sequelize from "../utils/database.util"

interface Comment {
    userId: string;
    commentId: string;
    content: string;
    parent: string;
    children: string[];
    likes: string[];
    createdAt?: Date;
    updatedAt?: Date;
    deleted: boolean;
}

// Define the Post interface
interface PostAttributes {
    postId: string;
    authorId: string;
    title: string;
    tags: string[];
    createdAt?: Date;
    updatedAt?: Date;
    publishedAt?: Date;
    serializedTitle: string;
    likes: string[];
    content: string;
    public: boolean;
    comments: Comment[];
    views: object;
}

// Define the Post model class
class Post extends Model<PostAttributes> implements PostAttributes {
    public postId!: string;
    public authorId!: string;
    public title!: string;
    public tags!: string[];
    public createdAt?: Date;
    public updatedAt?: Date;
    public publishedAt?: Date;
    public serializedTitle!: string;
    public likes!: string[];
    public content!: string;
    public public!: boolean;
    public comments!: Comment[];
    public views!: object;
}

Post.init({
    authorId: { type: DataTypes.STRING, allowNull: false },
    postId: { type: DataTypes.STRING, allowNull: false, unique: true },
    title: { type: DataTypes.STRING, allowNull: false },
    tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },

    createdAt: { type: DataTypes.DATE, defaultValue: Date.now },
    updatedAt: { type: DataTypes.DATE, defaultValue: Date.now },
    publishedAt: { type: DataTypes.DATE, defaultValue: Date.now },
    content: { type: DataTypes.TEXT, allowNull: false },
    comments: { 
        type: DataTypes.JSONB,
        defaultValue: []
    },
    likes: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },

    public: { type: DataTypes.BOOLEAN, defaultValue: false },
    serializedTitle: { type: DataTypes.STRING, defaultValue: "" },

    views: { type: DataTypes.JSON, defaultValue: {} },
}, {
    sequelize,
    tableName: 'posts',
    indexes: [
        { unique: true, fields: ['postId'] }
    ]
});

export { Post }