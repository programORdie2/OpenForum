const nameInput = document.getElementById("displayName");
const bioInput = document.getElementById("bio");
const pronounceInput = document.getElementById("pronounce");
const avatarInput = document.getElementById("avatar");
const avatarPreview = document.getElementById("preview-avatar");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const locationInput = document.getElementById("location");
const saveButton = document.getElementById("saveChanges");

let avatarChanged = false;

function checkChanges() {
    if (nameInput.value == "") {
        return false;
    }
    if (nameInput.value != nameInput.getAttribute("data-value") || bioInput.value != bioInput.getAttribute("data-value") || pronounceInput.value != pronounceInput.getAttribute("data-value") || usernameInput.value != usernameInput.getAttribute("data-value") || emailInput.value != emailInput.getAttribute("data-value") || locationInput.value != locationInput.getAttribute("data-value")) {
        return true;
    }
    if (avatarChanged) {
        return true;
    }
    return false;
}

function getChanges() {
    const changes = [];

    if (nameInput.value != nameInput.getAttribute("data-value")) {
        changes.push({ name: "displayname", value: nameInput.value });
    }

    if (bioInput.value != bioInput.getAttribute("data-value")) {
        changes.push({ name: "bio", value: bioInput.value });
    }

    if (pronounceInput.value != pronounceInput.getAttribute("data-value")) {
        changes.push({ name: "pronounce", value: pronounceInput.value });
    }

    if (usernameInput.value != usernameInput.getAttribute("data-value")) {
        changes.push({ name: "username", value: usernameInput.value });
    }

    if (emailInput.value != emailInput.getAttribute("data-value")) {
        changes.push({ name: "email", value: emailInput.value });
    }

    if (locationInput.value != locationInput.getAttribute("data-value")) {
        changes.push({ name: "location", value: locationInput.value });
    }

    if (avatarChanged) {
        changes.push({ name: "avatar", value: avatarPreview.src });
    }

    return changes;
}

function showUnsavedChanges() {
    document.getElementById("unsavedChanges").style.display = "block";
}

function hideUnsavedChanges() {
    document.getElementById("unsavedChanges").style.display = "none";
}

function onAnyInput(e) {
    e.preventDefault();

    if (checkChanges()) {
        showUnsavedChanges();
    } else {
        hideUnsavedChanges();
    }
};

nameInput.addEventListener("input", onAnyInput);
bioInput.addEventListener("input", onAnyInput);
pronounceInput.addEventListener("input", onAnyInput);
usernameInput.addEventListener("input", onAnyInput);
emailInput.addEventListener("input", onAnyInput);
locationInput.addEventListener("input", onAnyInput);

function saveChanges() {
    const changes = getChanges();

    changes.forEach(async (change) => {
        const res = await fetch(`/api/user/${change.name}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${document.cookie.split("token=")[1].split(";")[0]}`
            },
            body: JSON.stringify({ value: change.value })
        });

        const data = await res.json();
        console.log(data);

        if (!data.succes) {
            console.log("Failed to save changes of " + change.name);
            alert("Failed to save changes of " + change.name);
        } else {
            if (change.name == "displayname") {
                nameInput.setAttribute("data-value", nameInput.value);
                document.querySelector(".user-info .username .text").innerText = nameInput.value;
            } else if (change.name == "avatar") {
                avatarPreview.src = change.value;
                avatarChanged = false;
                document.querySelector(".user-info .username img").src = avatarPreview.src;
            } else if (change.name == "username") {
                usernameInput.setAttribute("data-value", usernameInput.value);
                document.querySelector(".user-info .user-actions .profile-link").href = `/@${usernameInput.value}`
            } else if (change.name == "email") {
                emailInput.setAttribute("data-value", emailInput.value);
            } else if (change.name == "location") {
                locationInput.setAttribute("data-value", locationInput.value);
            } else if (change.name == "bio") {
                bioInput.setAttribute("data-value", bioInput.value);
            } else if (change.name == "pronounce") {
                pronounceInput.setAttribute("data-value", pronounceInput.value);
            }
        }
    });

    hideUnsavedChanges();
}

saveButton.addEventListener("click", saveChanges);

avatarInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        avatarPreview.src = reader.result;
        avatarChanged = true;
        onAnyInput(e);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        avatarPreview.onload = () => {
            canvas.width = 200;
            canvas.height = 200;
            ctx.drawImage(avatarPreview, 0, 0, 200, 200);
            const dataURL = canvas.toDataURL("image/png");
            avatarPreview.src = dataURL;
        };
    };
});