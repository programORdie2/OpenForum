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