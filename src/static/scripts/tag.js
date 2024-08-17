const postsElemnt = document.getElementById("posts");
const loadMoreButton = document.getElementById("load-more-posts");

let loadedPosts = 0;

async function loadPosts() {
    const _res = await fetch(`/api/tag/${tagName}/posts?offset=${loadedPosts}`);
    const res = await _res.json();

    if (!_res.ok || !res) {
        return;
    }

    const newPosts = res.posts;
    loadedPosts += newPosts.length;

    if (loadedPosts % 50) {
        loadMoreButton.style.display = "none";
    }

    for (const post of newPosts) {
        const postElement = createPostElement(post);
        postsElemnt.appendChild(postElement);
    }
}

function createPostElement(post) {
    const postElement = document.createElement("a");
    postElement.href = `/posts/${post.id}`
    postElement.classList.add("post");
    postElement.innerHTML = `
        <h2>${post.title}</h2>
        <span>${post.publishedAt}</span>
        <span>${post.updatedAt}</span>
        <p>${post.tags}</p>
    `;
    return postElement;
}

loadPosts()

loadMoreButton.addEventListener("click", loadPosts)