import { PRODUCTION } from '../config';
import fs from 'fs';
import path from 'path';

const logLevels = ["info", "warn", "error", "critical", "debug", "http"];
const logDirectory = path.join(__dirname, '../../', 'logs');

// Ensure the logs directory exists
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

function _addToLog(message: string, logName: string) {
    const file = path.join(logDirectory, (logName + '.log'));
    try {
        fs.appendFileSync(file, message + '\n');
    } catch (err) {
        console.error('Failed to write to log file:', err);
    }
}

function makeSureDoubleNumber(num: number) {
    return num < 10 ? '0' + num : num;
}

function getFormattedDate() {
    // yyyy-mm-dd hh:mm:ss
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${year}-${makeSureDoubleNumber(month)}-${makeSureDoubleNumber(day)} ${makeSureDoubleNumber(hours)}:${makeSureDoubleNumber(minutes)}:${makeSureDoubleNumber(seconds)}`
}

function _log(message: string, level: "info" | "warn" | "error" | "debug" | "critical" | "http", logs: Array<string> = ["log"]) {
    const timestamp = getFormattedDate();
    const formattedMessage = `[${timestamp}] [${level}] ${message}`;

    logs.forEach((log) => {
        _addToLog(formattedMessage, log);
    });

    if (logLevels.includes(level)) {
        if (level === "critical" || level === "error") {
            console.error(formattedMessage);
        } else if (level === "warn") {
            console.warn(formattedMessage);
        } else if (level === "http"){
            if (PRODUCTION) return;
            console.log(formattedMessage);
        } else {
            console.log(formattedMessage);
        }
    }
}

function log(...args: any[]) {
    const message = args.join(" ");
    _log(message, "info", ["log"]);
}

function warn(...args: any[]) {
    const message = args.join(" ");
    _log(message, "warn", ["log", "warnings"]);
}

function error(...args: any[]) {
    const message = args.join(" ");
    _log(message, "error", ["log", "errors"]);
}

function critical(...args: any[]) {
    const message = args.join(" ");
    _log(message, "critical", ["log", "errors"]);
}

function http(...args: any[]) {
    const message = args.join(" ");
    _log(message, "http", ["http_log"]);
}

function debug(...args: any[]) {
    const message = args.join(" ");
    _log(message, "debug", ["debug_log"]);
}

const logger = { log, warn, error, critical, debug, http };

export default logger;