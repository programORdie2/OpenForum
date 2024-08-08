document.addEventListener("click", (e) => {
    if (e.target === document.querySelector(".user-info .username") || document.querySelector(".user-info .username")?.contains(e.target)) {
        document.querySelector(".user-info .user-actions")?.classList.toggle("active");
    } else {
        document.querySelector(".user-info .user-actions")?.classList.remove("active");
    }
})