try{document.getElementById("publish-post").addEventListener("click",publishPost)}catch(t){document.getElementById("unpublish-post").addEventListener("click",unpublishPost)}async function publishPost(){const t=await fetch("/api/posts/"+postId+"/publish",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`${document.cookie.split("token=")[1].split(";")[0]}`}}),o=await t.json();console.log(o)}async function unpublishPost(){const t=await fetch("/api/posts/"+postId+"/unpublish",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`${document.cookie.split("token=")[1].split(";")[0]}`}}),o=await t.json();console.log(o)}async function deletePost(){const t=await fetch("/api/posts/"+postId+"/delete",{method:"DELETE",headers:{"Content-Type":"application/json",Authorization:`${document.cookie.split("token=")[1].split(";")[0]}`}}),o=await t.json();console.log(o)}document.getElementById("delete-post").addEventListener("click",deletePost);