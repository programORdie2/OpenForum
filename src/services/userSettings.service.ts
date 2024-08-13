import { User } from "../models/user.model";
import { UserPlus } from "../services/databaseplus.service";
import { uploadAvater } from "./imageDatabase.service";
import { validateEmail, validateUsername } from "../utils/validator.util";


async function setSetting(id: string, settingsName: string, settingsValue: string): Promise<boolean> {
    // If the user changes their avatar, just upload it
    if (settingsName === "avatar") {
        await uploadAvater(`avatars/${id}.png`, settingsValue);
        return true;
    }

    // If the user changes their username, make sure it's unique and then update it
    if (settingsName === "username") {
        if (!validateUsername(settingsValue)) return false;

        // Make sure username is unique
        const existingUser = await UserPlus.findOne({ where: { username_lowercase: settingsValue.toLowerCase() } });
        if (existingUser) return false;

        const [affectedCount] = await User.update({ username: settingsValue, username_lowercase: settingsValue.toLowerCase() }, { where: { userId: id } });
        if (affectedCount > 0) {
            return true;
        }
        return false;
    }

    // If the user changes their email, make sure it's unique and then update it
    if (settingsName === "email") {
        if (!validateEmail(settingsValue)) return false;

        // Make sure email is unique
        const existingUser = await UserPlus.findOne({ where: { email: settingsValue } });
        if (existingUser) return false;

        const [affectedCount] = await User.update({ email: settingsValue.toLowerCase() }, { where: { userId: id } });
        if (affectedCount > 0) {
            return true;
        }

        return false;
    }

    // Else, just update the setting
    const [affectedCount] = await User.update({ [settingsName]: settingsValue }, { where: { userId: id } });
    if (affectedCount > 0) {
        return true;
    }

    return false;
}

export { setSetting }