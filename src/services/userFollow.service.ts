import { User } from "../models/user.model";
import { UserPlus } from "../services/databaseplus.service";
import { createFollowNotification } from "./notification.service";

async function followUser(userId: string, followName: string): Promise<{ success: boolean, message?: string }> {
    const user = await User.findOne({ where: { userId: userId } });
    const follow = await User.findOne({ where: { username_lowercase: followName.toLowerCase() } });

    if (!user || !follow) {
        return { success: false, message: "User does not exist" };
    }

    const followId = follow.userId;

    if (userId === followId) {
        return { success: false, message: "Cannot follow yourself" };
    }

    if (user.following.includes(followId)) {
        return { success: false, message: "Already following" };
    }

    user.following.push(followId);
    follow.followers.push(userId);

    user.changed('following', true);
    follow.changed('followers', true);

    await user.save();
    await follow.save();

    await createFollowNotification(userId, followId);

    return { success: true };
}

async function unfollowUser(userId: string, followName: string): Promise<{ success: boolean, message?: string }> {
    const user = await User.findOne({ where: { userId: userId } });
    const follow = await User.findOne({ where: { username_lowercase: followName.toLowerCase() } });

    if (!user || !follow) {
        return { success: false, message: "User does not exist" };
    }

    const followId = follow.userId;

    if (!user.following.includes(followId)) {
        return { success: false, message: "Not following" };
    }

    user.following.splice(user.following.indexOf(followId), 1);
    follow.followers.splice(follow.followers.indexOf(userId), 1);

    user.changed('following', true);
    follow.changed('followers', true);

    await user.save();
    await follow.save();

    return { success: true };
}

export { followUser, unfollowUser };