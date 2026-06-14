fetch("posts.json")
  .then(res => res.json())
  .then(posts => {

    const container = document.getElementById("posts");

    posts.forEach(post => {

      container.innerHTML += `
        <div class="post">
          <div class="date">${post.date}</div>
          <div class="text">${post.text}</div>
          ${post.image ? `<img src="${post.image}" class="img">` : ""}
        </div>
      `;

    });

  })
  .catch(err => console.log("Error loading posts.json:", err));
