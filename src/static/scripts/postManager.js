try {
    document.getElementById("publish-post").addEventListener("click", publishPost);
} catch (e) {
    // The post is already published
    document.getElementById("unpublish-post").addEventListener("click", unpublishPost);
}

document.getElementById("delete-post").addEventListener("click", deletePost);


async function publishPost() {
    const _res = await fetch("/api/posts/" + postId + "/publish", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${document.cookie.split("token=")[1].split(";")[0]}`
        }
    });

    const res = await _res.json();

    console.log(res);
}

async function unpublishPost() {
    const _res = await fetch("/api/posts/" + postId + "/unpublish", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${document.cookie.split("token=")[1].split(";")[0]}`
        }
    });

    const res = await _res.json();

    console.log(res);
}

async function deletePost() {
    const _res = await fetch("/api/posts/" + postId + "/delete", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${document.cookie.split("token=")[1].split(";")[0]}`
        }
    });

    const res = await _res.json();

    console.log(res);
}