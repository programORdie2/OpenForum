import * as path from "node:path";
import { existsSync, readFileSync } from "node:fs";

import logger from "../utils/logger.util";

import type CustomRequest from "../types/CustomRequest";
import type { Response } from "express";

interface I18nOptions {
    locales: string[];
    fallbackLng: string;
    locales_path: string;
}

interface language_data {
    [key: string]: string;
}

interface locales_data {
    [key: string]: language_data;
}

class i18n {
    private locales_names: string[];
    private fallbackLng: string;
    private locales_path: string;

    private locales_data: locales_data = {};

    constructor(options: I18nOptions = {
        locales: ["en"],
        fallbackLng: "en",
        locales_path: path.join(__dirname, "../locales"),
    }) {
        this.locales_names = options.locales;
        this.fallbackLng = options.fallbackLng;
        this.locales_path = options.locales_path;

        this.loadAllLocales();
        this.syncKeys();
    }

    private loadLocale(name: string) {
        const filePath = path.join(this.locales_path, `${name}.json`);

        if (!existsSync(filePath)) {
            logger.warn(`Locale ${name} not found`);
            return;
        }

        const data = JSON.parse(readFileSync(filePath, "utf-8"));

        this.locales_data[name] = data;
    }

    private loadAllLocales() {
        for (const name of this.locales_names) {
            this.loadLocale(name);
        }
    }

    private syncKeys() {
        const defaultKeys = Object.keys(this.locales_data[this.fallbackLng]).length;

        for (const name of Object.keys(this.locales_data)) {
            if (name === this.fallbackLng) continue;

            const keys = Object.keys(this.locales_data[name]);
            for (const key of keys) {
                if (!defaultKeys.hasOwnProperty(key)) {
                    logger.warn(`Locale ${name} is missing key ${key}`);
                }
            }
        }
    }

    private findKey(language: string, key: string) {
        const language_keys = this.locales_data[language];
        if (!language_keys) {
            logger.warn(`Locale ${language} not found`);
            return key;
        }

        const value = language_keys[key];
        if (!value) {
            logger.warn(`Locale ${language} is missing key ${key}`);
            return key
        }

        return value
    }

    public init(req: CustomRequest, res: Response) {
        let locale = this.fallbackLng;

        const _locale = req.headers["accept-language"];
        if (_locale) {
            const locales = _locale.split(",");
            for (const localeName of locales) {
                if (this.locales_names.includes(localeName.split(";")[0])) {
                    locale = localeName.split(";")[0];
                    break;
                }
            }
        }

        req.language = locale;

        res.setHeader("Content-Language", locale);
        res.locals.CurrentLocale = locale;
        res.locals.__ = (key: string) => {
            return this.findKey(locale, key);
        }
    }
}

export default new i18n();