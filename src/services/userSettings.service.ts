import { User } from "../models/user.model";

async function setSetting(email: string, settingsName: string, settingsValue: string) {
    const res = await User.updateOne({ email }, { [settingsName]: settingsValue });
    
    if (res.modifiedCount > 0) {
        return true;
    }
    return false;
}

export { setSetting }