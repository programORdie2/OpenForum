try {
    document.getElementById("comment-submit").addEventListener("click", (e) => {
        const content = document.getElementById("comment-content").value;
        const succes = submitcomment(e, content, null);

        if (succes) {
            document.getElementById("comment-content").value = "";
        }
    });
} catch (e) {
    // The user is not logged in
}


async function submitcomment(e, commentInput, parentId) {
    e.preventDefault();
    const _res = await fetch("/api/posts/" + postId + "/comments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${document.cookie.split("token=")[1].split(";")[0]}`,
        },
        body: JSON.stringify({
            content: commentInput,
            parentId: parentId,
        }),
    });

    const res = await _res.json();
    console.log(res);

    if (res.succes) {
        if (parentId) {
            const parent = comments.find((comment) => comment.commentId === parentId);
            parent.children.push(res.comment.commentId);
        }

        comments.push(res.comment);

        makeComments();
    }

    return res.succes;
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

    return res.succes;
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

    return res.succes;
}

function findChildren(comment) {
    const childIds = comment.children.map((child) => findChildren(child).push(child.commentId));

    return childIds;
}

function makeCommentTree(comments) {
    if (!comments || comments.length === 0) return [];

    function findCommentById(id) {
        return comments.find((comment) => comment.commentId === id);
    }

    const commentThree = [];
    for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];

        // Replace the ids of children with the child elements
        comment.children = comment.children.map((childId) => {
            if (typeof childId !== "string") return childId;
            const child = findCommentById(childId);
            return child;
        });

        commentThree.push(comment);
    }

    const commentsAsChild = commentThree.map((comment) => comment.children).flat();

    for (let i = 0; i < commentsAsChild.length; i++) {
        const commentId = commentsAsChild[i];
        // Remove the comment from the commentsThree array
        const index = commentThree.findIndex((comment) => comment.commentId === commentId.commentId);
        if (index !== -1) {
            commentThree.splice(index, 1);
        }
    }

    return commentThree;
}

function seralize(string) {
    return string
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderComment(comment) {
    let extraClass = "";
    if (comment.deleted) {
        comment.content = `[${__("comment_deleted")}]`;
        extraClass = "comment-deleted";
    }

    let likeButton = `<button class='like-button'>${__("like")}</button>`;
    if (comment.liked) {
        likeButton = `<button class='like-button liked'>${__("unlike")}</button>`;
    }

    const commentHtml = `
    <div class="comment">
        <div class="comment-inner ${extraClass}" data-comment-id="${comment.commentId}">
            <div class="comment-header">
                <p class="comment-author"><img src="${comment.author.avatar}" alt="${seralize(comment.author.username)}">${seralize(comment.author.displayName)}</p>
                <p class="comment-date">${comment.createdAt}</p>
            </div>
            <p class="comment-content">${seralize(comment.content)}</p>
            <p class="comment-likes flex">${likeButton}<span class="comment-likes-count">${comment.likes}</span></p>
            <button class="reply-button">${__("reply")}</button>
        </div>
        <div class="children">
            ${renderComments(comment.children)}
        </div>
    </div>
    `;
    return commentHtml;
}

function renderComments(comments) {
    let html = "";

    for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        html += renderComment(comment);
    }

    return html;
}

function updateCounter(parentElement, changeCount) {
    const countElement = parentElement.querySelector(".comment-likes-count");
    countElement.innerHTML = parseInt(countElement.innerHTML) + changeCount;
}

function addCommentEventListeners() {
    document.querySelectorAll(".like-button").forEach((button) => {
        button.addEventListener("click", (e) => {
            const commentId = button.parentElement.parentElement.getAttribute("data-comment-id");

            if (button.classList.contains("liked")) {
                const succes = unlikeComment(commentId);

                if (succes) {
                    button.classList.remove("liked");
                    button.innerHTML = `${__("like")}`;
                    updateCounter(button.parentElement, -1);
                }
            } else {
                const succes = likeComment(commentId);

                if (succes) {
                    button.classList.add("liked");
                    button.innerHTML = `${__("unlike")}`;
                    updateCounter(button.parentElement, 1);
                }
            }
        });
    });

    document.querySelectorAll(".reply-button").forEach((button) => {
        button.addEventListener("click", (e) => {
            const commentId = button.parentElement.getAttribute("data-comment-id");
            
            createCommentInput(commentId);
        });
    });
}

function makeComments() {
    const commentTree = makeCommentTree(comments);
    document.getElementById("comments").innerHTML = renderComments(commentTree);

    addCommentEventListeners();
}

function createCommentInput(commentId) {
    const parentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
    const commentWrapper = document.createElement("div");
    commentWrapper.classList.add("new-comment");

    commentWrapper.innerHTML = `
        <input type="text" class="new-comment-content" placeholder="${__("enter_comment")}" />
        <button class="new-comment-submit">${__("post_comment")}</button>
        <button class="new-comment-cancel">${__("cancel")}</button>
    `;

    parentElement.appendChild(commentWrapper);

    const commentInput = commentWrapper.querySelector(".new-comment-content");
    commentInput.focus();

    commentWrapper.querySelector(".new-comment-submit").addEventListener("click", (e) => {
        const succes = submitcomment(e, commentInput.value, commentId);

        if (succes) {
            commentInput.value = "";
        }
    });

    commentWrapper.querySelector(".new-comment-cancel").addEventListener("click", (e) => {
        parentElement.removeChild(commentWrapper);
    });
}


makeComments();

if (highlightedComment !== "") {
    const commentElement = document.querySelector(`[data-comment-id="${highlightedComment}"]`);
    commentElement.classList.add("highlighted");

    setTimeout(() => {
        commentElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 17); // 17ms, to make sure the DOM is rendered

    setTimeout(() => {
        commentElement.classList.remove("highlighted");
    }, 1500);
}