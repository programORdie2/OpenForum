import { TOPICS } from "../config";

function validateEmail(email: string): boolean {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validatePassword(password: string): boolean {
    const re = /^(?=.*\d)(?=.*[a-zA-Z]).{8,20}$/;
    return re.test(String(password).toLowerCase());
}

function validateUsername(username: string): boolean {
    const re = /^[a-zA-Z0-9]{3,20}$/;
    return re.test(String(username).toLowerCase());
}

function validatePostTitle(title: string): boolean {
    return title.length >= 3 && title.length <= 80;
}

function validateTopic(topic: string): boolean {
    return TOPICS.includes(topic);
}  

export { validateEmail, validatePassword, validateUsername, validatePostTitle, validateTopic };