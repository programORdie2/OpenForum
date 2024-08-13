import { Tag, TagAttributes } from "../models/tags.model";
import { TagPlus } from "../services/databaseplus.service";
import { Op } from "sequelize";

async function findTagNames(offset: number = 0, limit: number = 50, search: string): Promise<string[]> {
    const _data: TagAttributes[] = await TagPlus.find({ offset, limit, where: { name: { [Op.startsWith]: `${search}` } }, attributes: ["name"] });
    const data = _data.map((tag) => tag.name);
    return data;
}

async function createTag(name: string, description: string): Promise<{ succes: boolean }> {
    await Tag.create({ name, description, postsIds: [] });
    return { succes: true };
}

export { 
    findTagNames,
    createTag
}