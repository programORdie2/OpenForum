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