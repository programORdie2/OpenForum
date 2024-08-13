import { UserPlus } from "../services/databaseplus.service";
import { User } from "../models/user.model";
import type Notification from "../types/Notification";

async function createNotification(fromId: string, toId: string[], title: string, content: string) {
    const notification: Notification = {
        fromId,
        title,
        content,
        at: new Date(),
    };

    const users = await User.findAll({ where: { userId: toId } });
    if (!users || users.length === 0) {
        return { success: false, message: "User does not exist" };
    }

    users.forEach(async (user) => {
        user.unreadNotifications.push(notification);
        user.changed('unreadNotifications', true);
        await user.save();
    });
}

async function getNotifications(userId: string, offset = 0, limit = 50): Promise<{ succes: boolean, notifications?: Notification[], message?: string }> {
    const user = await UserPlus.findOne({ where: { userId: userId } });
    if (!user) {
        return { succes: false, message: "User does not exist" };
    }

    const _notifications = [...user.notifications.map((notification: Notification) => { return { ...notification, read: true } }), ...user.unreadNotifications.map((notification: Notification) => { return { ...notification, read: false } })].reverse();
    const notifications = _notifications.slice(offset, offset + limit);

    return { succes: true, notifications: notifications };
}

async function markAllAsRead(userId: string): Promise<{ succes: boolean, message?: string }> {
    const user = await User.findOne({ where: { userId: userId } });
    if (!user) {
        return { succes: false, message: "User does not exist" };
    }

    const unreadNotifications = user.unreadNotifications;
    user.unreadNotifications = [];
    user.notifications = [...user.notifications, ...unreadNotifications];
    if (user.notifications.length > 250) {
        user.notifications = user.notifications.slice(250);
    }
    user.changed('unreadNotifications', true);
    user.changed('notifications', true);
    await user.save();
    return { succes: true };
}

async function createFollowNotification(fromId: string, toId: string) {
    return createNotification(fromId, [toId], "Follow", `You have been followed by ${fromId}`);
}

async function createLikeNotification(fromId: string, toId: string, postId: string) {
    return createNotification(fromId, [toId], "Like", `Your post ${postId} have been liked by ${fromId}`);
}

async function createCommentNotification(fromId: string, toId: string, postId: string, commentId: string) {
    return createNotification(fromId, [toId], "Comment", `Your post ${postId} have been commented on by ${fromId}`);
}

async function createLikeCommentNotification(fromId: string, toId: string, postId: string, commentId: string) {
    return createNotification(fromId, [toId], "Like", `Your comment ${commentId} on post ${postId} have been liked by ${fromId}`);
}

async function createReplyNotification(fromId: string, toId: string, postId: string, commentId: string) {
    return createNotification(fromId, [toId], "Reply", `Your comment ${commentId} on post ${postId} have been replied by ${fromId}`);
}

async function createPostNotification(fromId: string, toId: string[], postId: string) {
    return createNotification(fromId, toId, "Post", `${fromId} has posted a new post${postId}`);
}

export {
    getNotifications,
    markAllAsRead,

    createFollowNotification,
    createLikeNotification,
    createCommentNotification,
    createLikeCommentNotification,
    createReplyNotification,
    createPostNotification,
};