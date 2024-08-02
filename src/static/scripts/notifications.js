const loadMoreButton = document.getElementById("loadMore");

async function markAllAsRead() {
    const result = await fetch("/api/notifications/read", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${document.cookie.split("token=")[1].split(";")[0]}`,
        },
    });

    const res = await result.json();

    console.log(res);
}

markAllAsRead();

async function loadMore() {
    const result = await fetch("/api/notifications?offset=" + loaded, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${document.cookie.split("token=")[1].split(";")[0]}`,
        },
    });

    const res = await result.json();

    console.log(res);
    

    if (!res.succes) return;

    loaded += 50;

    const newNotifications = res.notifications;

    checkHideLoadMoreButton(newNotifications.length);

    for (const newNotification of newNotifications) {
        const notification = document.createElement("div");
        notification.classList.add("notification");
        notification.innerHTML = `<p>${JSON.stringify(newNotification)}</p>`;
        document.getElementById("notifications").appendChild(notification);
    }
}

loadMoreButton.addEventListener("click", loadMore);

function checkHideLoadMoreButton(loaded) {
    if (loaded % 50 !== 0) {
        loadMoreButton.style.display = "none";
    }
}

checkHideLoadMoreButton(loaded);