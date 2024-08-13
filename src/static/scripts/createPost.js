const titleInput = document.getElementById("post-title");
const contentInput = document.getElementById("post-content");
const allTagsElement = document.getElementById("select-tags");
const suggestedTagsElement = document.getElementById("suggested-tags");
const tagInput = document.getElementById("current-tag");
const createPostButton = document.getElementById("create-post");

const _tags = {};
let suggestionsLowerCase = [];

async function getTags(query) {
    if (_tags[query]) {
        return _tags[query];
    }

    const _res = await fetch(`/api/tag_autocomplete?name=${query}`);
    const res = await _res.json();

    if (!_res.ok || !res) {
        return [];
    }

    _tags[query] = res.tags;

    const keys = Object.keys(_tags);
    if (keys.length > 100) {
        const key = keys[keys.length];
        delete _tags[key]
    }

    return res.tags;
}

async function onTagInput(e) {
    const query = tagInput.value;

    if (!query) {
        suggestedTagsElement.innerHTML = "";
        return;
    }

    const suggestions = await getTags(query);
    suggestionsLowerCase = suggestions.map((suggestion) => suggestion.toLowerCase());

    let html = "";
    for (const suggestion of suggestions) {
        html += `<il class="suggestion">${suggestion}</il>`;
    }
    suggestedTagsElement.innerHTML = html;

    document.querySelectorAll(".suggestion").forEach((suggestion) => {
        suggestion.addEventListener("click", () => {
            tagInput.value = suggestion.textContent;
            onTagEnd();
        });
    });

    if (e.key === "Enter" || e.key === " ") {
        onTagEnd();
    }
}

function onTagEnd() {
    const tag = tagInput.value;
    if (!tag) {
        return;
    }

    if (suggestionsLowerCase.includes(tag.toLowerCase())) {
        const newElement = document.createElement("p");
        newElement.innerHTML = `${tag}`;
        newElement.classList.add("tag-value");
        allTagsElement.appendChild(newElement);

        tagInput.value = "";
        suggestedTagsElement.innerHTML = "";
    } else {
        const element = document.querySelector(".suggestion")?.textContent;

        if (!element) {
            tagInput.value = "";
            suggestedTagsElement.innerHTML = "";
            return;
        }

        tagInput.value = element;
        onTagEnd();
    }
}

tagInput.addEventListener("keyup", onTagInput);
tagInput.addEventListener("blur", onTagEnd);

async function createPost(e) {
    e.preventDefault();

    const _tagValues = allTagsElement.querySelectorAll(".tag-value");
    const tagValues = Array.from(_tagValues).map((tagValue) => tagValue.textContent);

    if (!titleInput.value || !contentInput.value || !tagValues.length > 0) {
        alert("Please fill in all fields");
        return;
    }

    const _res = await fetch("/api/posts/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${document.cookie.split("token=")[1].split(";")[0]}`
        },
        body: JSON.stringify({
            title: titleInput.value,
            content: contentInput.value,
            tags: tagValues
        })
    });

    const res = await _res.json();

    console.log(res);
}

createPostButton.addEventListener("click", createPost)