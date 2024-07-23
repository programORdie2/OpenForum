const titleInput = document.getElementById("post-title");
const contentInput = document.getElementById("post-content");
const topicInput = document.getElementById("post-topic");
const createPostButton = document.getElementById("create-post");

async function createPost(e) {
    e.preventDefault();
    
    if (!titleInput.value || !contentInput.value || !topicInput.value) {
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
            topic: topicInput.value
        })
    });

    const res = await _res.json();

    console.log(res);
}

createPostButton.addEventListener("click", createPost)