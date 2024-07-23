import { TOPICS } from "../config";

function validateEmail(email: string) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validatePassword(password: string) {
    const re = /^(?=.*\d)(?=.*[a-zA-Z]).{8,20}$/;
    return re.test(String(password).toLowerCase());
}

function validateUsername(username: string) {
    const re = /^[a-zA-Z0-9]{3,20}$/;
    return re.test(String(username).toLowerCase());
}

function validatePostTitle(title: string) {
    // Lower and uppercase, numbers, spaces, hyphens and underscores, between 3 and 50 characters
    const re = /^[a-zA-Z0-9\s\-_]{3,50}$/;
    return re.test(String(title).toLowerCase());
}

function validateTopic(topic: string) {
    return TOPICS.includes(topic);
}  

export { validateEmail, validatePassword, validateUsername, validatePostTitle, validateTopic };