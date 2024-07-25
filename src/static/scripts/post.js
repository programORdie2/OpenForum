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