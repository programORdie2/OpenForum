import { User } from "../models/user.model";
import { uploadAvater } from "./imageDatabase.service";

async function setSetting(id: string, settingsName: string, settingsValue: string) {
    if (settingsName === "avatar") {
        await uploadAvater(`avatars/${id}.png`, settingsValue);
        return true;
    }

    const res = await User.updateOne({ userId: id }, { [settingsName]: settingsValue });
    
    if (res.modifiedCount > 0) {
        return true;
    }
    return false;
}

export { setSetting }