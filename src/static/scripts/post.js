try {
    document.getElementById("comment-submit").addEventListener("click", submitcomment);
} catch (e) {
    // The user is not logged in
}


async function submitcomment(e) {
    e.preventDefault();
    const content = document.getElementById("comment-content").value;
    const _res = await fetch("/api/posts/" + postId + "/comments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${document.cookie.split("token=")[1].split(";")[0]}`,
        },
        body: JSON.stringify({
            content: content,
            parentId: document.getElementById("comment-parent").value,
        }),
    });

    const res = await _res.json();
    console.log(res);
}

const likeButton = document.getElementById("like-post");
const dislikeButton = document.getElementById("unlike-post");
const likesCount = document.getElementById("likes-count");

likeButton.addEventListener("click", likePost);
dislikeButton.addEventListener("click", dislikePost);

async function likePost() {
    const _res = await fetch("/api/posts/" + postId + "/like", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${document.cookie.split("token=")[1].split(";")[0]}`,
        },
    });
    const res = await _res.json();
    console.log(res);

    if (res.succes) {
        likeButton.style.display = "none";
        dislikeButton.style.display = "block";

        likesCount.innerHTML = parseInt(likesCount.innerHTML) + 1;
    }
}


async function dislikePost() {
    const _res = await fetch("/api/posts/" + postId + "/dislike", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${document.cookie.split("token=")[1].split(";")[0]}`,
        },
    });
    const res = await _res.json();
    console.log(res);

    if (res.succes) {
        likeButton.style.display = "block";
        dislikeButton.style.display = "none";

        likesCount.innerHTML = parseInt(likesCount.innerHTML) - 1;
    }
}