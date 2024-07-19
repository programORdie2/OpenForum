const API_ROUTE = "/api";
const LOGIN_ROUTE = API_ROUTE + "/login";
const REGISTER_ROUTE = API_ROUTE + "/register";
const VALIDATE_ROUTE = API_ROUTE + "/validate";

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const response = await fetch(LOGIN_ROUTE, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    console.log(result);
}

async function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const username = document.getElementById("username").value;
    const response = await fetch(REGISTER_ROUTE, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, username }),
    });

    const result = await response.json();
    console.log(result);
}

async function validate() {
    const token = document.getElementById("token").value;

    const response = await fetch(VALIDATE_ROUTE, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
    });

    const result = await response.json();
    console.log(result);
}