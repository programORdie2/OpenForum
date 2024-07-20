const nameInput = document.getElementById("displayName");
const bioInput = document.getElementById("bio");
const pronounceInput = document.getElementById("pronounce");

const saveButton = document.getElementById("saveChanges");

function checkChanges() {
    if (nameInput.value == "") {
        return false;
    }
    if (nameInput.value != nameInput.getAttribute("data-value") || bioInput.value != bioInput.getAttribute("data-value") || pronounceInput.value != pronounceInput.getAttribute("data-value")) {
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

        if (!res.ok) {
            console.log("Failed to save changes");
            alert("Failed to save changes");
        }
    });

    nameInput.setAttribute("data-value", nameInput.value);
    bioInput.setAttribute("data-value", bioInput.value);
    pronounceInput.setAttribute("data-value", pronounceInput.value);
    hideUnsavedChanges();

    document.querySelector(".user-info .username .text").innerText = nameInput.value;
}

saveButton.addEventListener("click", saveChanges);