import {User} from "../models/user.model";

export async function loadUserProfile(username: string) {
    const user = await User.findOne({ username });
    if (!user) return null;
    return { username: user.username, createdAt: user.createdAt, avatar: user.avatar };
}