const commentElements = document.querySelectorAll(".comments .comment");
const postData = {};

async function getPostData(postId) {
    if (postData[postId]) {
        return postData[postId];
    }

    const _post = await fetch("/api/posts/" + postId);
    const post = await _post.json();

    if (!post || !post.succes || !post.post) {
        return null;
    }

    const data = {
        title: post.post.title,
        topic: post.post.topic,
    }

    postData[postId] = data;
    return data;
}


commentElements.forEach(async (commentElement) => {
    const postId = commentElement.getAttribute("data-post-id");
    const data = await getPostData(postId);
    
    commentElement.querySelector(".post-title").innerText = data.title;
    commentElement.querySelector(".post-topic").innerText = data.topic;
});

const followButton = document.getElementById("follow-user");
let isFollowing = followButton.getAttribute("data-following") === "true";

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
        followButton.innerText = "Unfollow";
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
        followButton.innerText = "Follow";
        isFollowing = false;
    }
}

followButton.addEventListener("click", toggleFollow);