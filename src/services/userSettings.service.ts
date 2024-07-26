import { User } from "../models/user.model";
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
        const existingUser = await User.findOne({ username_lowercase: settingsValue.toLowerCase() });
        if (existingUser) return false;

        const res = await User.updateOne({ userId: id }, { username: settingsValue, username_lowercase: settingsValue.toLowerCase() });
        if (res.modifiedCount > 0) {
            return true;
        }
        return false;
    }

    // If the user changes their email, make sure it's unique and then update it
    if (settingsName === "email") {
        if (!validateEmail(settingsValue)) return false;

        // Make sure email is unique
        const existingUser = await User.findOne({ email: settingsValue });
        if (existingUser) return false;

        const res = await User.updateOne({ userId: id }, { email: settingsValue.toLowerCase() });
        if (res.modifiedCount > 0) {
            return true;
        }

        return false;
    }

    // Else, just update the setting
    const res = await User.updateOne({ userId: id }, { [settingsName]: settingsValue });
    if (res.modifiedCount > 0) {
        return true;
    }
    
    // If no changes were made
    console.log("User: " + id + " not found in database");
    return false;
}

export { setSetting }