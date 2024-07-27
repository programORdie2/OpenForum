import { promises as fs, existsSync, mkdirSync } from "fs";
import path from "path";
import logger from "./logger.util";

import minify from "@node-minify/core";
import minifyCss from "@node-minify/clean-css";
import minifyJs from "@node-minify/terser";

// Check the dirs and create them if they don't exist
if (!existsSync(path.join(__dirname, "../static/min"))) {
    mkdirSync(path.join(__dirname, "../static/min"));
}
if (!existsSync(path.join(__dirname, "../static/min/css"))) {
    mkdirSync(path.join(__dirname, "../static/min/css"));
}
if (!existsSync(path.join(__dirname, "../static/min/scripts"))) {
    mkdirSync(path.join(__dirname, "../static/min/scripts"));
}


async function _findAllAssets(): Promise<string[]> {
    const cssAssets = await fs.readdir(path.join(__dirname, "../static/css"));
    const jsAssets = await fs.readdir(path.join(__dirname, "../static/scripts"));

    const assets = [...cssAssets, ...jsAssets];
    return assets;
}

async function _getAllMinifiedAssets(): Promise<string[]> {
    const cssAssets = await fs.readdir(path.join(__dirname, "../static/min/css"));
    const jsAssets = await fs.readdir(path.join(__dirname, "../static/min/scripts"));

    const assets = [...cssAssets, ...jsAssets];
    return assets;
}

async function _getNotMinifiedAssets(): Promise<string[]> {
    const assets = await _findAllAssets();
    const minifiedAssets = await _getAllMinifiedAssets();

    const notMinifiedAssets = assets.filter((asset) => (!minifiedAssets.includes(asset) && (asset.endsWith(".css") || asset.endsWith(".js")) && !asset.endsWith("vars.css") && !asset.endsWith("navbar.css")));
    return notMinifiedAssets;
}

async function _minify(asset: string, outPath: string, type: "css" | "js"): Promise<void> {
    const compressor = type === "css" ? minifyCss : minifyJs;
    const options = type === "css" ? {} : {};

    if (asset.endsWith("vars.css") || asset.endsWith("navbar.css")) return;

    let files = [asset];
    if (asset.endsWith("main.css")) {
        files = ["vars.css", "main.css", "navbar.css"].map((file) => path.join(__dirname, "../static/css/", file));
    }

    await minify({
        input: files,
        output: outPath,
        compressor: compressor,
        options: options,
    });

    logger.log(`Asset ${asset} minified to ${outPath}`);
}

async function _minifyAsset(asset: string): Promise<void> {
    const type = asset.endsWith(".css") ? "css" : asset.endsWith(".js") ? "js" : null;

    if (!type) {
        logger.warn(`Asset ${path} is not a valid type`);
        return;
    }

    const newPathPre = type === "css" ? "/css/" : "/scripts/";
    asset = path.join(__dirname, "../static/" + newPathPre + asset);

    let pathParts = asset.split("/");
    if (pathParts.length === 1) {
        pathParts = asset.split("\\");
    }

    const name = pathParts.pop();
    pathParts.pop();

    const newPath = pathParts.join("/") + "/min/" + newPathPre + name;

    await _minify(asset, newPath, type);
}

export async function minifyAllAssets(): Promise<void> {
    const notMinifiedAssets = await _getNotMinifiedAssets();
    if (notMinifiedAssets.length === 0) {
        logger.log("✅ Assets are already minified!");
        return;
    }

    logger.log(`⏳ Minifying ${notMinifiedAssets.length} assets...`);

    for (const asset of notMinifiedAssets) {
        await _minifyAsset(asset);
    }

    logger.log("✅ Assets minified!");
}