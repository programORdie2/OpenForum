const loadMoreButton = document.getElementById("loadMoreComments");

let commentsLoaded = 0;


function seralize(string) {
    return string
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function loadComments() {
    const _res = await fetch("/api/users/" + username + "/comments?offset=" + commentsLoaded);
    const res = await _res.json();

    if (_res.ok) {
        commentsLoaded += res.length;

        if (res.length < 50) {
            loadMoreButton.style.display = "none";
        }

        if (commentsLoaded === 0) {
            document.getElementById("comments").innerHTML += `<p>${__("no_comments")}</p>`;
            return;
        }

        for (const comment of res) {
            const commentDiv = document.createElement("div");
            commentDiv.classList.add("comment");
            commentDiv.innerHTML = `
                <p>
                    ${__("tags")}: ${comment.tags}, 
                    ${__("created_at")}: ${comment.createdAt}, 
                    ${__("content")}: ${seralize(comment.content)}, 
                    ${__("likes")}: ${comment.likes}, 
                    ${__("post")}: ${seralize(comment.postTitle)}
                </p>`

            document.getElementById("comments").appendChild(commentDiv);
        }
    }
}    

loadComments();

loadMoreButton.addEventListener("click", () => {
    loadComments();
});

const followButton = document.getElementById("follow-user");
let isFollowing = followButton?.getAttribute("data-following") === "true";

async function toggleFollow() {
    if (isFollowing) {
        await unfollowUser();
    } else {
        await followUser();
    }
}

async function followUser() {
    const _res = await fetch("/api/users/" + username + "/follow", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${document.cookie.split("token=")[1].split(";")[0]}`,
        },
    });

    const res = await _res.json();

    console.log(res);

    if (res.succes) {
        followButton.setAttribute("data-is-following", "true");
        followButton.innerText = `${__("unfollow")}`;
        isFollowing = true;
    }
}

async function unfollowUser() {
    const _res = await fetch("/api/users/" + username + "/unfollow", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${document.cookie.split("token=")[1].split(";")[0]}`,
        },
    });

    const res = await _res.json();

    console.log(res);

    if (res.succes) {
        followButton.setAttribute("data-is-following", "false");
        followButton.innerText = `${__("follow")}`;
        isFollowing = false;
    }
}

followButton?.addEventListener("click", toggleFollow);