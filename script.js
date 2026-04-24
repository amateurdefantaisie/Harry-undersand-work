// CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBdo7NO1PnAa90PhEhuzpllkB1ESGZu3J8",
  authDomain: "harry-undersand.firebaseapp.com",
  projectId: "harry-undersand"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// WELCOME SCREEN (10 secondes)
window.onload = () => {
  setTimeout(() => {
    document.getElementById("welcome-screen").style.display = "none";
  }, 10000);
};

// LIKES SIMPLES
const likeButtons = document.querySelectorAll(".actions button:first-child");

likeButtons.forEach((btn, index) => {
  let count = 0;
  btn.addEventListener("click", () => {
    count++;
    btn.innerText = `❤️ ${count}`;
  });
});

// COMMENTAIRES SIMPLES AVEC FIREBASE
const posts = document.querySelectorAll(".post");

posts.forEach((post, index) => {
  const input = post.querySelector("input");

  input.addEventListener("keypress", async (e) => {
    if (e.key === "Enter" && input.value.trim() !== "") {
      const comment = input.value;

      await db.collection("comments").add({
        postId: index,
        text: comment,
        createdAt: new Date()
      });

      const p = document.createElement("p");
      p.textContent = comment;
      post.appendChild(p);

      input.value = "";
    }
  });
});

// EFFET PAILLETTES (simple)
const sparkleContainer = document.createElement("div");
document.body.appendChild(sparkleContainer);

setInterval(() => {
  const sparkle = document.createElement("div");
  sparkle.style.position = "fixed";
  sparkle.style.width = "5px";
  sparkle.style.height = "5px";
  sparkle.style.background = "white";
  sparkle.style.top = Math.random() * window.innerHeight + "px";
  sparkle.style.left = Math.random() * window.innerWidth + "px";
  sparkle.style.opacity = Math.random();
  sparkle.style.borderRadius = "50%";
  sparkle.style.zIndex = 1000;

  document.body.appendChild(sparkle);

  setTimeout(() => sparkle.remove(), 1000);
}, 100);
