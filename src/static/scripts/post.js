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
const unlikeButton = document.getElementById("unlike-post");
const likesCount = document.getElementById("likes-count");

likeButton.addEventListener("click", likePost);
unlikeButton.addEventListener("click", unlikePost);

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
        unlikeButton.style.display = "block";

        likesCount.innerHTML = parseInt(likesCount.innerHTML) + 1;
    }
}


async function unlikePost() {
    const _res = await fetch("/api/posts/" + postId + "/unlike", {
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
        unlikeButton.style.display = "none";

        likesCount.innerHTML = parseInt(likesCount.innerHTML) - 1;
    }
}

async function deleteComment(commentId) {
    const _res = await fetch("/api/posts/" + postId + "/comments/" + commentId + "/delete", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${document.cookie.split("token=")[1].split(";")[0]}`,
        },
    });
    const res = await _res.json();
    console.log(res);
}

async function likeComment(commentId) {
    const _res = await fetch("/api/posts/" + postId + "/comments/" + commentId + "/like", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${document.cookie.split("token=")[1].split(";")[0]}`,
        },
    });
    const res = await _res.json();
    console.log(res);
}

async function unlikeComment(commentId) {
    const _res = await fetch("/api/posts/" + postId + "/comments/" + commentId + "/unlike", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${document.cookie.split("token=")[1].split(";")[0]}`,
        },
    });
    const res = await _res.json();
    console.log(res);
}