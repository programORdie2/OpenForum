const titleInput = document.getElementById("post-title");
const contentInput = document.getElementById("post-content");
const saveButton = document.getElementById("saveChanges");

function checkChanges() {
    if (titleInput.value == "" || contentInput.value == "") {
        return false;
    }
    if (titleInput.value != titleInput.getAttribute("data-value") || contentInput.value != contentInput.getAttribute("data-value")) {
        return true;
    }
    return false;
}

function getChanges() {
    const changes = [];

    if (titleInput.value != titleInput.getAttribute("data-value")) {
        changes.push({ name: "title", value: titleInput.value });
    }
    if (contentInput.value != contentInput.getAttribute("data-value")) {
        changes.push({ name: "content", value: contentInput.value });
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

titleInput.addEventListener("input", onAnyInput);
contentInput.addEventListener("input", onAnyInput);

function saveChanges() {
    const changes = getChanges();

    changes.forEach(async (change) => {
        const res = await fetch(`/api/posts/${postId}/${change.name}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${document.cookie.split("token=")[1].split(";")[0]}`
            },
            body: JSON.stringify({ [change.name]: change.value })
        });

        const data = await res.json();
        console.log(data);

        if (!data.succes) {
            console.log("Failed to save changes of " + change.name);
            alert("Failed to save changes of " + change.name);
        } else {
            if (change.name == "title") {
                titleInput.setAttribute("data-value", titleInput.value);

                const newId = data.post.postId;

                window.location.href = `/posts/${newId}/edit`;
            } else if (change.name == "content") {
                contentInput.setAttribute("data-value", contentInput.value);
            }
        }
    });

    hideUnsavedChanges();
}

saveButton.addEventListener("click", saveChanges);