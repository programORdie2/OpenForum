export default function normalizeEmail(email: string): string {
    email = email.toLowerCase();

    if (!email.includes("@")) return email;
    if (!email.includes("+")) return email;

    const [_username, domain] = email.split("@");
    const username = _username.split("+")[0];
    return `${username}@${domain}`;
}