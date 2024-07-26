const API_ROUTE = "/api";

async function login(email, password) {
    const response = await fetch(`${API_ROUTE}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    
    if (!result.succes) {
        console.log(result);
        return false;
    };

    document.cookie = `token=${result.token}; path=/; max-age=${60 * 60 * 24 * 30};`;

    return true;
}

async function register(email, password, username) {
    const response = await fetch(`${API_ROUTE}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, username }),
    });

    const result = await response.json();
    
    if (!result.succes) return false;

    document.cookie = `token=${result.token}; path=/; max-age=${60 * 60 * 24 * 30};`;

    return true;
}

async function validate() {
    const token = document.cookie.split("token=")[1].split(";")[0];

    const response = await fetch(`${API_ROUTE}/validate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
    });

    const result = await response.json();

    console.log(result);
    
    if (!result.succes) return false;

    document.cookie = `token=${result.token}; path=/; max-age=${60 * 60 * 24 * 30};`;

    return true;
}

function logout() {
    document.cookie = "token=; path=/; max-age=0;";
    window.location.href = "/";
}