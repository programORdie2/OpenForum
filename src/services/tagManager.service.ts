import { Post } from "../models/post.model";
import { PostPlus } from "../utils/databaseplus.util";
import { Tag } from "../models/tags.model";
import { TagPlus } from "../utils/databaseplus.util";
import { Op } from "sequelize";

async function findTagNames(offset: number = 0, limit: number = 50, search: string): Promise<string[]> {
    const _data = await TagPlus.find({ offset, limit, where: { name: { [Op.startsWith]: `${search}` } }, attributes: ["name"] }) as Tag[];
    const data = _data.map((tag) => tag.name);
    return data;
}

async function createTag(name: string, description: string): Promise<{ succes: boolean }> {
    await Tag.create({ name, description, postsIds: [] });
    return { succes: true };
}

async function _addPostToTag(tagName: string, postId: string): Promise<{ succes: boolean, message?: string }> {
    const tag = await Tag.findOne({ where: { name: tagName } });
    if (!tag) return { succes: false, message: "Tag does not exist" };

    tag.postsIds.push(postId);
    tag.changed("postsIds", true);
    await tag.save();

    return { succes: true };
}

async function addPostToTags(tagNames: string[], postId: string): Promise<{ succes: boolean, message?: string }> {
    for (const tagName of tagNames) {
        await _addPostToTag(tagName, postId);
    }
    return { succes: true };
}

async function _pullPostFromTag(tagName: string, postId: string): Promise<{ succes: boolean, message?: string }> {
    const tag = await Tag.findOne({ where: { name: tagName } });
    if (!tag) return { succes: false, message: "Tag does not exist" };

    const idx = tag.postsIds.indexOf(postId);
    if (idx < 0) return { succes: false, message: "Post not in tag" };
    tag.postsIds.splice(idx, 1);
    tag.changed("postsIds", true);
    await tag.save();
    return { succes: true };
}

async function pullPostFromTags(tagNames: string[], postId: string): Promise<{ succes: boolean, message?: string }> {
    for (const tagName of tagNames) {
        await _pullPostFromTag(tagName, postId);
    }
    return { succes: true };
}

async function getTagInfo(tagName: string): Promise<{ succes: boolean, message?: string, tag?: { name: string, description: string } }> {
    const tag = await TagPlus.findOne({ where: { name: tagName } }) as Tag;
    if (!tag) return { succes: false, message: "Tag does not exist" };
    return { succes: true, tag: { name: tag.name, description: tag.description } };
}

async function getPostsOfTag(tagName: string, offset: number = 0, limit: number = 50): Promise<{ succes: boolean, message?: string, posts?: any[] }> {
    const tag = await TagPlus.findOne({ where: { name: tagName } }) as Tag;
    if (!tag) return { succes: false, message: "Tag does not exist" };

    // Get the first [offset:limit+offset] public posts
    const posts = [];

    for (const postId of tag.postsIds.slice(offset)) {
        const post = await PostPlus.findOne({ where: { postId: postId } }) as Post;
        if (post && post.public) posts.push({
            id: post.postId,
            title: post.title,
            tags: post.tags,
            updatedAt: post.updatedAt,
            publishedAt: post.publishedAt
        });

        if (posts.length >= limit) break;
    }

    return { succes: true, posts: posts };
}

export { 
    findTagNames,
    createTag,
    addPostToTags,
    pullPostFromTags,
    getTagInfo,
    getPostsOfTag
}