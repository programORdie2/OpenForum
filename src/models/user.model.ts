import type Notification from "../types/Notification";
import sequelize from "../utils/database.util";
import { Model, DataTypes } from "sequelize";

// Define the User interface
interface UserAttributes {
    username: string;
    username_lowercase: string;
    email: string;
    password: string;

    userId: string;
    secretId: string;

    createdAt: Date;
    permissions: {mod: boolean, admin: boolean};

    posts: string[];
    comments: {postId: string, commentId: string, at: Date}[];
    likes: string[];

    pronounce: string;
    bio: string;
    avatar: string;
    displayName: string;
    location: string;

    following: string[];
    followers: string[];

    notifications: Notification[];
    unreadNotifications: Notification[];
}


// Define the User model class
class User extends Model<UserAttributes> implements UserAttributes {
    public username!: string;
    public username_lowercase!: string;
    public email!: string;
    public password!: string;

    public userId!: string;
    public secretId!: string;

    public createdAt!: Date;
    public permissions!: {mod: boolean, admin: boolean};

    public posts!: string[];
    public comments!: {postId: string, commentId: string, at: Date}[];
    public likes!: string[];

    public pronounce!: string;
    public bio!: string;
    public avatar!: string;
    public displayName!: string;
    public location!: string;

    public following!: string[];
    public followers!: string[];

    public notifications!: Notification[];
    public unreadNotifications!: Notification[];
}


// Initialize the User model
User.init({
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username_lowercase: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    secretId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: Date.now
    },
    permissions: {
        type: DataTypes.JSON,
        defaultValue: {mod: false, admin: false}
    },
    posts: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    comments: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    likes: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    pronounce: {
        type: DataTypes.STRING
    },
    bio: {
        type: DataTypes.STRING
    },
    avatar: {
        type: DataTypes.STRING
    },
    displayName: {
        type: DataTypes.STRING
    },
    location: {
        type: DataTypes.STRING
    },
    following: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    followers: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    notifications: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    unreadNotifications: {
        type: DataTypes.JSONB,
        defaultValue: []
    }
}, {
    sequelize,
    tableName: 'users',
    indexes: [
        {
            unique: true,
            fields: ['userId']
        },
        {
            unique: true,
            fields: ['username_lowercase']
        }
    ]
});

export { User }