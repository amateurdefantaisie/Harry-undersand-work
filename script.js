// CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBdo7NO1PnAa90PhEhuzpllkB1ESGZu3J8",
  authDomain: "harry-undersand.firebaseapp.com",
  projectId: "harry-undersand"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// WELCOME SCREEN (10 secondes
const welcome = document.getElementById("welcome-screen");
const closeBtn = document.getElementById("close-welcome");
const countdownEl = document.getElementById("countdown");

let timeLeft = 2;

const timer = setInterval(() => {
  timeLeft--;
  countdownEl.innerText = `Fermeture dans ${timeLeft}s...`;

  if (timeLeft <= 0) {
    closeWelcome();
  }
}, 1000);

function closeWelcome() {
  welcome.style.display = "none";
  clearInterval(timer);
  launchFireworks();
}

closeBtn.addEventListener("click", closeWelcome);

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
setInterval(() => {
  const emoji = document.createElement("div");
  const emojis = ["💖","✨","🎉","🎊","💫"];

  emoji.innerText = emojis[Math.floor(Math.random()*emojis.length)];

  emoji.style.position = "fixed";
  emoji.style.top = "-20px";
  emoji.style.left = Math.random() * window.innerWidth + "px";
  emoji.style.fontSize = "20px";
  emoji.style.zIndex = 999;

  document.body.appendChild(emoji);

  emoji.animate([
    { transform: "translateY(0px)", opacity: 1 },
    { transform: "translateY(100vh)", opacity: 0 }
  ], {
    duration: 3000,
    easing: "linear"
  });

  setTimeout(() => emoji.remove(), 3000);
}, 200);

function launchFireworks() {
  for (let i = 0; i < 30; i++) {
    createFirework();
  }
}

function createFirework() {
  const firework = document.createElement("div");

  firework.style.position = "fixed";
  firework.style.width = "8px";
  firework.style.height = "8px";
  firework.style.background = `hsl(${Math.random()*360},100%,50%)`;
  firework.style.borderRadius = "50%";
  firework.style.top = "50%";
  firework.style.left = "50%";
  firework.style.zIndex = 9999;

  document.body.appendChild(firework);

  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * 200 + 50;

  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;

  firework.animate([
    { transform: "translate(0,0)", opacity: 1 },
    { transform: `translate(${x}px, ${y}px)`, opacity: 0 }
  ], {
    duration: 1000,
    easing: "ease-out"
  });

  setTimeout(() => firework.remove(), 1000);
}
