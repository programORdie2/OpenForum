try {
    document.getElementById("reaction-submit").addEventListener("click", submitReaction);
} catch (e) {
    // The user is not logged in
}


async function submitReaction(e) {
    e.preventDefault();
    const content = document.getElementById("reaction-content").value;
    const _res = await fetch("/api/posts/" + postId + "/reactions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${document.cookie.split("token=")[1].split(";")[0]}`,
        },
        body: JSON.stringify({
            content: content,
            parentId: document.getElementById("reaction-parent").value,
        }),
    });

    const res = await _res.json();
    console.log(res);
}