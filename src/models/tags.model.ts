import { DataTypes, Model } from "sequelize"
import sequelize from "../utils/database.util"

interface TagAttributes {
    name: string;
    description: string;
    postsIds: string[];
}

class Tag extends Model<TagAttributes> implements TagAttributes {
    name!: string;
    description!: string;
    postsIds!: string[];
}

Tag.init({
    name: { type: DataTypes.STRING, allowNull: false }, 
    description: { type: DataTypes.STRING, allowNull: false },
    postsIds: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
}, {
    sequelize,
    tableName: 'tags',
    indexes: [
        { unique: true, fields: ['name'] }
    ]
});

export { Tag, type TagAttributes }