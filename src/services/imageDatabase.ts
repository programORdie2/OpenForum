import { promises } from "fs";
import sharp from "sharp";
import { UPLOAD_PATH } from "../config";

async function _resizeImage(base64: string, width: number, height: number) {
    const buffer = Buffer.from(base64, 'base64');
    const resizedImage = await sharp(buffer).resize(width, height).png().toBuffer();
    const base64out = resizedImage.toString('base64');
    return base64out;
}

async function uploadAvater(imagePath: string, base64: string) {
    const base64Data = base64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
    const resizedImage = await _resizeImage(base64Data, 200, 200);

    await promises.writeFile(UPLOAD_PATH + imagePath, resizedImage, 'base64');

    return imagePath;
}

async function uploadDefaultAvater(imagePath: string) {
    const defaultAvatars = [
        "/avatars/defaults/1.png",
        "/avatars/defaults/2.png",
        "/avatars/defaults/3.png",
        "/avatars/defaults/4.png",
        "/avatars/defaults/5.png"
    ]

    const randomIndex = Math.floor(Math.random() * defaultAvatars.length);
    const defaultAvatar = defaultAvatars[randomIndex];

    const base64 = await promises.readFile(UPLOAD_PATH + defaultAvatar, 'base64');

    return await uploadAvater(imagePath, base64);
}

export { uploadAvater, uploadDefaultAvater };