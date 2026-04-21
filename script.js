import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  limit,
  startAfter,
  serverTimestamp,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let isAdmin = false;

/* 🔑 FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyBdo7NO1PnAa90PhEhuzpllkB1ESGZu3J8",
  authDomain: "harry-undersand.firebaseapp.com",
  projectId: "harry-undersand"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* PROVIDERS */
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const githubProvider = new GithubAuthProvider();

facebookProvider.setCustomParameters({
  display: "popup"
});

githubProvider.setCustomParameters({
  allow_signup: "true"
});

/* ELEMENTS */
const authGuest = document.getElementById("authGuest");
const authUser = document.getElementById("authUser");
const adminPanel = document.getElementById("adminPanel");
const usersTable = document.getElementById("usersTable");
const adminVisits = document.getElementById("adminVisits");

const authModal = document.getElementById("authModal");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const closeModal = document.getElementById("closeModal");
const googleLogin = document.getElementById("googleLogin");
const facebookLogin = document.getElementById("facebookLogin");
const githubLogin = document.getElementById("githubLogin");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeText = document.getElementById("welcomeText");
const userPhoto = document.getElementById("userPhoto");

const emailLogin = document.getElementById("emailLogin");
const emailRegister = document.getElementById("emailRegister");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");

/* =========================
   🔒 FERMETURE MODALE PROPRE
========================= */

function closeAuthModal() {
  authModal.style.display = "none";
}

function showLoginToast() {
  const toast = document.getElementById("loginToast");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}
  
/* BOUTONS */
loginBtn.onclick = () => authModal.style.display = "flex";
registerBtn.onclick = () => authModal.style.display = "flex";
closeModal.onclick = () => authModal.style.display = "none";

googleLogin.onclick = () => signInWithPopup(auth, googleProvider);
facebookLogin.onclick = () => signInWithPopup(auth, facebookProvider);
githubLogin.onclick = () => signInWithPopup(auth, githubProvider);
logoutBtn.onclick = () => signOut(auth);

async function loadTodayClicks() {
  const ref = doc(db, "link_clicks_daily", todayKey());
  const snap = await getDoc(ref);

  const value = snap.exists() ? snap.data().count || 0 : 0;

  console.log("Clics aujourd'hui :", value);
}

function monthKey() {
  const d = new Date();
  return d.toISOString().slice(0, 7); // 2026-02
}

function yearKey() {
  return new Date().getFullYear().toString(); // 2026
}

emailLogin.onclick = async () => {

  const email = emailInput.value;
  const password = passwordInput.value;

  try{

    await signInWithEmailAndPassword(auth, email, password);

  }catch(err){
    alert(err.message);
  }

};

emailRegister.onclick = async () => {

  const email = emailInput.value;
  const password = passwordInput.value;

  try{

    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    await sendEmailVerification(userCred.user);

    alert("Compte créé ! Vérifie ton email 📧");

  }catch(err){
    alert(err.message);
  }

};
/* =========================
   📊 COMPTEUR VISITES STABLE
========================= */

function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

const globalRef = doc(db, "stats", "global");

// 🔴 1️⃣ Incrémentation simple
async function incrementVisit() {

  const today = todayKey();
  const month = monthKey();
  const year = yearKey();

  const batch = [
    setDoc(doc(db, "stats_daily", today), { count: increment(1) }, { merge: true }),
    setDoc(doc(db, "stats_monthly", month), { count: increment(1) }, { merge: true }),
    setDoc(doc(db, "stats_yearly", year), { count: increment(1) }, { merge: true }),
    setDoc(doc(db, "stats_hourly", todayKey()+"_"+new Date().getHours()), { count: increment(1) }, { merge: true }),
    setDoc(doc(db, "stats", "global"), { visits: increment(1) }, { merge: true })
  ];

  await Promise.all(batch);
}

// 🟢 2️⃣ Listener temps réel (plus fiable)
function listenTodayVisits() {

  const dailyRef = doc(db, "stats_daily", todayKey());

  onSnapshot(dailyRef, snap => {
    const value = snap.exists() ? snap.data().count || 0 : 0;
    document.getElementById("todayVisits").textContent = value;
  });

}

function animateCounter(id, endValue) {
  const el = document.getElementById(id);
  const duration = 1000;
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const value = Math.floor(progress * endValue);
    el.textContent = value;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function updateBadge(current, previous, elementId) {

  const badge = document.getElementById(elementId);
  if (!badge) return;

  if (previous === 0) {
    badge.innerHTML = "Nouveau";
    badge.className = "badge-float neutral";
    return;
  }

  const diff = ((current - previous) / previous) * 100;
  const percent = diff.toFixed(1);

  const arrowUp = `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4l6 6h-4v8h-4v-8H6z"/>
    </svg>
  `;

  const arrowDown = `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 20l-6-6h4V6h4v8h4z"/>
    </svg>
  `;

  if (diff > 0) {
    badge.innerHTML = arrowUp + " +" + percent + "%";
    badge.className = "badge-float up";
  } else if (diff < 0) {
    badge.innerHTML = arrowDown + " " + percent + "%";
    badge.className = "badge-float down";
  } else {
    badge.innerHTML = "0%";
    badge.className = "badge-float neutral";
  }
}

async function loadAdvancedStats() {

  const today = todayKey();

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayKey = yesterdayDate.toISOString().slice(0,10);

  const prevMonthDate = new Date();
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
  const prevMonthKey = prevMonthDate.toISOString().slice(0,7);

  const prevYear = (new Date().getFullYear() - 1).toString();

  const todaySnap = await getDoc(doc(db,"stats_daily",today));
  const yesterdaySnap = await getDoc(doc(db,"stats_daily",yesterdayKey));
  const monthSnap = await getDoc(doc(db,"stats_monthly",monthKey()));
  const prevMonthSnap = await getDoc(doc(db,"stats_monthly",prevMonthKey));
  const yearSnap = await getDoc(doc(db,"stats_yearly",yearKey()));
  const prevYearSnap = await getDoc(doc(db,"stats_yearly",prevYear));

  const todayVal = todaySnap.data()?.count || 0;
  const yesterdayVal = yesterdaySnap.data()?.count || 0;
  const monthVal = monthSnap.data()?.count || 0;
  const prevMonthVal = prevMonthSnap.data()?.count || 0;
  const yearVal = yearSnap.data()?.count || 0;
  const prevYearVal = prevYearSnap.data()?.count || 0;

  animateCounter("todayVisitsCard", todayVal);
  animateCounter("monthVisits", monthVal);
  animateCounter("yearVisits", yearVal);

  document.getElementById("todayTable").textContent = todayVal;
  document.getElementById("monthTable").textContent = monthVal;
  document.getElementById("yearTable").textContent = yearVal;

  updateBadge(todayVal, yesterdayVal, "todayBadge");
  updateBadge(monthVal, prevMonthVal, "monthBadge");
  updateBadge(yearVal, prevYearVal, "yearBadge");
}

// 🚀 3️⃣ Lancement automatique
window.addEventListener("DOMContentLoaded", async () => {
  await incrementVisit();
  listenTodayVisits();
  await loadAdvancedStats();
  await loadHeatmap();
  await loadMonthlyComparison();
  await setUserOnline();
  await loadHourlyStats();
  await loadPeriodStats();
});

/* =========================
   🔐 REDIRECTION LOGIN AUTO
========================= */

// Si on arrive avec ?loginRequired=true
const urlParams = new URLSearchParams(window.location.search);
const loginRequired = urlParams.get("loginRequired");

if (loginRequired) {
  // Ouvre automatiquement la modale
  document.getElementById("authModal").style.display = "flex";
}

/* =========================
   🔥 HEATMAP JOURNALIÈRE
========================= */

async function loadHeatmap() {

  const heatmap = document.getElementById("heatmap");
  heatmap.innerHTML = "";

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for(let day = 1; day <= daysInMonth; day++){

    const date = new Date(year, month, day);
    const key = date.toISOString().slice(0,10);

    const snap = await getDoc(doc(db, "stats_daily", key));
    const count = snap.data()?.count || 0;

    const div = document.createElement("div");
    div.classList.add("heatmap-day");

    // 🎨 Couleur selon intensité
    let intensity = Math.min(count / 20, 1); 
    div.style.background = `rgba(139,92,246,${intensity})`;

    div.title = `${key} : ${count} visites`;

    heatmap.appendChild(div);
  }
}

/* =========================
   📊 GRAPHIQUES
========================= */

const monthlyCtx = document.getElementById("monthlyChart");
const realtimeCtx = document.getElementById("realtimeChart");

const monthlyChart = new Chart(monthlyCtx, {
  type: "bar",
  data: {
    labels: [],
    datasets: []
  },
  options: {
    responsive:true,
    animation:{ duration:1500 }
  }
});

const realtimeChart = new Chart(realtimeCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Temps réel",
      data: [],
      borderColor: "#8b5cf6",
      tension: .4
    }]
  },
  options:{
    responsive:true,
    animation:false
  }
});

/* =========================
   🕒 FREQUENCE PAR HEURE (24H)
========================= */

const hourlyCtx = document.getElementById("hourlyChart");

const hourlyChart = new Chart(hourlyCtx, {
  type: "line",
  data: {
    labels: Array.from({length:24}, (_,i)=> i+"h"),
    datasets: [{
      label: "Connexions par heure",
      data: new Array(24).fill(0),
      borderColor: "#22d3ee",
      backgroundColor: (context)=>{
        const chart = context.chart;
        const {ctx, chartArea} = chart;
        if(!chartArea) return null;
        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0,"rgba(34,211,238,0)");
        gradient.addColorStop(1,"rgba(34,211,238,.5)");
        return gradient;
      },
      fill:true,
      tension:0.4
    }]
  },
  options:{
    responsive:true,
    scales:{
      y:{
        beginAtZero:true,
        grid:{
          color:"rgba(34,211,238,.15)"
        }
      },
      x:{
        grid:{
          color:"rgba(139,92,246,.1)"
        }
      }
    }
  }
});

async function loadHourlyStats(){

  const today = todayKey();
  let hourlyData = new Array(24).fill(0);

  for(let hour=0; hour<24; hour++){

    const key = today + "_" + hour;
    const snap = await getDoc(doc(db,"stats_hourly",key));

    hourlyData[hour] = snap.data()?.count || 0;
  }

  hourlyChart.data.datasets[0].data = hourlyData;
  hourlyChart.update();
}

/* =========================
   📊 FREQUENCE JOUR / MOIS / ANNEE
========================= */

const periodCtx = document.getElementById("periodChart");

const periodChart = new Chart(periodCtx, {
  type:"bar",
  data:{
    labels:["Aujourd’hui","Mois","Année"],
    datasets:[{
      label:"Fréquence",
      data:[0,0,0],
      backgroundColor:[
        "rgba(34,197,94,.7)",   // vert
        "rgba(139,92,246,.7)",  // violet
        "rgba(239,68,68,.7)"    // rouge
      ],
      borderRadius:14
    }]
  },
  options:{
    responsive:true,
    scales:{
      y:{
        beginAtZero:true,
        grid:{
          color:"rgba(239,68,68,.2)"
        }
      },
      x:{
        grid:{
          color:"rgba(34,197,94,.15)"
        }
      }
    }
  }
});

async function loadPeriodStats(){

  const todaySnap = await getDoc(doc(db,"stats_daily",todayKey()));
  const monthSnap = await getDoc(doc(db,"stats_monthly",monthKey()));
  const yearSnap = await getDoc(doc(db,"stats_yearly",yearKey()));

  const todayVal = todaySnap.data()?.count || 0;
  const monthVal = monthSnap.data()?.count || 0;
  const yearVal = yearSnap.data()?.count || 0;

  periodChart.data.datasets[0].data = [todayVal,monthVal,yearVal];
  periodChart.update();
}

async function loadMonthlyComparison() {

  const now = new Date();
  const currentMonthKey = monthKey();

  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = prevDate.toISOString().slice(0,7);

  const currentSnap = await getDoc(doc(db,"stats_monthly",currentMonthKey));
  const prevSnap = await getDoc(doc(db,"stats_monthly",prevMonthKey));

  const current = currentSnap.data()?.count || 0;
  const previous = prevSnap.data()?.count || 0;

  const percent = previous ? ((current - previous)/previous)*100 : 0;
console.log("Évolution mensuelle :", percent.toFixed(1)+"%");

  monthlyChart.data.labels = ["Mois précédent","Mois actuel"];
  monthlyChart.data.datasets = [{
      label: "Comparatif visites",
      data: [previous, current],
      backgroundColor:[
        "rgba(100,116,139,.6)",
        "rgba(139,92,246,.8)"
      ],
      borderRadius:12
  }];

  monthlyChart.update();
}

/* =========================
   🟢 VISITEURS EN LIGNE ULTRA STABLE
========================= */

const onlineCollection = collection(db, "online_users");
const sessionId = crypto.randomUUID();
const sessionRef = doc(onlineCollection, sessionId);

// 1️⃣ Marquer actif
async function setUserOnline() {
  await setDoc(sessionRef, {
    lastActive: serverTimestamp()
  });
}

// 2️⃣ Ping toutes les 15 sec
setInterval(() => {
  setDoc(sessionRef, {
    lastActive: serverTimestamp()
  }, { merge: true });
}, 15000);

// 3️⃣ Nettoyage automatique intelligent
async function cleanInactiveUsers() {
  const snapshot = await getDocs(onlineCollection);
  const now = Date.now();

  snapshot.forEach(async (docSnap) => {
    const data = docSnap.data();
    const lastActive = data.lastActive?.toDate()?.getTime();

    if (!lastActive || (now - lastActive > 30000)) {
      await deleteDoc(doc(db, "online_users", docSnap.id));
    }
  });
}

// Nettoyage toutes les 20 sec
setInterval(cleanInactiveUsers, 20000);

// 4️⃣ Listener temps réel
onSnapshot(onlineCollection, (snapshot) => {
  const count = snapshot.size;

  document.getElementById("onlineCount").textContent = count;
  document.getElementById("onlineUsers").textContent = count;
});

/* 🔄 Mise à jour temps réel */
const realtimeDailyRef = doc(db, "stats_daily", todayKey());

onSnapshot(realtimeDailyRef, snap => {

  const value = snap.exists() ? snap.data().count || 0 : 0;

  document.getElementById("todayVisitsCard").textContent = value;
  document.getElementById("todayTable").textContent = value;

  const now = new Date().toLocaleTimeString();
  realtimeChart.data.labels.push(now);
  realtimeChart.data.datasets[0].data.push(value);

  if (realtimeChart.data.labels.length > 15) {
    realtimeChart.data.labels.shift();
    realtimeChart.data.datasets[0].data.shift();
  }

  realtimeChart.update();
});

/* 🔄 Mise à jour horaire temps réel */
const currentHourKey = todayKey()+"_"+new Date().getHours();
const realtimeHourRef = doc(db,"stats_hourly",currentHourKey);

onSnapshot(realtimeHourRef, snap=>{
  const hour = new Date().getHours();
  const value = snap.data()?.count || 0;

  hourlyChart.data.datasets[0].data[hour] = value;
  hourlyChart.update();
});

/* AUTH STATE */
onAuthStateChanged(auth, async user => {

  if (!user) {
    authGuest.style.display = "flex";
    authUser.style.display = "none";
    adminPanel.style.display = "none";
    return;
  }

  authGuest.style.display = "none";
  authUser.style.display = "flex";

  closeAuthModal();   // 🔒 ferme la popup
  showToast("Connexion réussie","success");   // 🎉 affiche notification
  addNotification("Connexion réussie");
  
  welcomeText.textContent = "Bienvenue " + user.displayName;
  userPhoto.src = user.photoURL;

  const userRef = doc(db, "users", user.uid);
  let snap = await getDoc(userRef);

  /* CRÉATION UTILISATEUR */
  if (!snap.exists()) {
    await setDoc(userRef, {
      name: user.displayName,
      email: user.email,
      role: "user",
      blocked: false,
      createdAt: serverTimestamp()
    });
    snap = await getDoc(userRef);
  }

  const data = snap.data();

  /* BLOCAGE */
  if (data.blocked) {
    alert("⛔ Compte bloqué");
    await signOut(auth);
    return;
  }

  /* ADMIN */
 if (data.role === "admin") {
  isAdmin = true;
  adminPanel.style.display = "block";
  loadUsers();
  loadStats();
} else {
  isAdmin = false;
  adminPanel.style.display = "none";
}

  /* 🔁 Redirection après connexion */
  const redirectPage = sessionStorage.getItem("redirectAfterLogin");

  if (redirectPage) {
    sessionStorage.removeItem("redirectAfterLogin");
    window.location.href = redirectPage;
  }
});

/* 📊 STATS */
async function loadStats() {
  const ref = doc(db, "stats", "global");
  const snap = await getDoc(ref);
  adminVisits.textContent = snap.data()?.visits || 0;
}

/* 👥 UTILISATEURS */
async function loadUsers() {
  usersTable.innerHTML = "";
  const snap = await getDocs(collection(db, "users"));

  snap.forEach(d => {
    const u = d.data();
    usersTable.innerHTML += `
      <tr>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>${u.blocked ? "⛔" : "✅"}</td>
        <td>
          <button onclick="toggleBlock('${d.id}', ${u.blocked})">
            ${u.blocked ? "Débloquer" : "Bloquer"}
          </button>
        </td>
      </tr>
    `;
  });
}

/* =========================
   📊 COMPTEUR DE CLICS LIEN
========================= */

window.registerLinkClick = async function () {

  const today = todayKey();
  const clickKey = "clicked_" + today;

  if (localStorage.getItem(clickKey)) return;

  localStorage.setItem(clickKey, "true");

  const clickRef = doc(db, "link_clicks_daily", today);

  await setDoc(clickRef, {
    count: increment(1)
  }, { merge: true });

  loadTodayClicks();
};

/* ACTION ADMIN */
window.toggleBlock = async (uid, blocked) => {
  await setDoc(doc(db, "users", uid), { blocked: !blocked }, { merge: true });
  loadUsers();
};

/* ⭐ COMMENTAIRES & ÉTOILES */
const commentForm = document.getElementById("comment-form");
const commentsList = document.getElementById("comments-list");
const avgRating = document.getElementById("avg-rating");
const ratingCount = document.getElementById("rating-count");
const ratingInput = document.getElementById("rating");
const usernameInput = document.getElementById("username");
const commentInput = document.getElementById("comment");
const loadMoreBtn = document.getElementById("loadMoreComments");

let commentsLimit = 10;
let lastVisible = null;
let selectedRating = 0;

/* Gestion étoiles */
document.querySelectorAll(".stars span").forEach(star => {
  star.onclick = () => {
    selectedRating = Number(star.dataset.value);
    ratingInput.value = selectedRating;
    document.querySelectorAll(".stars span").forEach(s =>
      s.classList.toggle("active", s.dataset.value <= selectedRating)
    );
  };
});

/* Envoi commentaire */
commentForm.addEventListener("submit", async e => {
  e.preventDefault();

  if (!selectedRating) {
    alert("Choisis une note ⭐");
    return;
  }

  await addDoc(collection(db, "comments"), {
    name: usernameInput.value,
    comment: commentInput.value,
    rating: selectedRating,
    createdAt: serverTimestamp()
  });

  commentForm.reset();
  selectedRating = 0;
  document.querySelectorAll(".stars span").forEach(s => s.classList.remove("active"));
});

/* Lecture commentaires en temps réel */
function loadComments() {
  const q = query(
    collection(db, "comments"),
    orderBy("createdAt", "desc"),
    limit(commentsLimit)
  );

  onSnapshot(q, snap => {
    commentsList.innerHTML = "";
    let total = 0;

    snap.forEach(d => {
      const c = d.data();
      total += c.rating;

      const date = c.createdAt?.toDate();
      const formattedDate = date
        ? date.toLocaleDateString("fr-FR") + " à " +
          date.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit"
          })
        : "Date inconnue";

      commentsList.innerHTML += `
        <div class="comment-card">
          <h4>${c.name}</h4>
          <div class="stars-display">${"⭐".repeat(c.rating)}</div>
          <p>${c.comment}</p>
          <small class="comment-date">🕒 ${formattedDate}</small>
          ${isAdmin ? `<button class="delete-comment" data-id="${d.id}">Supprimer</button>` : ""}
        </div>
      `;
    });

    ratingCount.textContent = snap.size;
    avgRating.textContent = snap.size
      ? (total / snap.size).toFixed(1)
      : "0.0";

    if (snap.size < commentsLimit) {
      loadMoreBtn.style.display = "none";
    } else {
      loadMoreBtn.style.display = "inline-block";
    }
  });
}

loadMoreBtn.addEventListener("click", () => {
  commentsLimit += 10;
  loadComments();
});

loadComments();

document.addEventListener("click", async e => {
  if (!e.target.classList.contains("delete-comment")) return;

  if (!confirm("Supprimer ce commentaire ?")) return;

  const id = e.target.dataset.id;
  await deleteDoc(doc(db, "comments", id));
});

const drawerLinks = document.querySelector(".drawer-links");

function updateDrawerShadow(){
  if(drawerLinks.scrollHeight > drawerLinks.clientHeight){
    drawerLinks.classList.add("can-scroll");
  } else {
    drawerLinks.classList.remove("can-scroll");
  }
}

drawerLinks.addEventListener("scroll", updateDrawerShadow);
window.addEventListener("resize", updateDrawerShadow);

updateDrawerShadow();

/* ✨ ANIMATION AU SCROLL */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll(".service-card").forEach(card => {
  observer.observe(card);
});

window.openDrawer = function(){
  document.querySelector(".drawer").classList.add("open");
  document.querySelector(".drawer-overlay").classList.add("show")
  document.body.style.overflow = "hidden";
};

window.closeDrawer = function(){
  document.querySelector(".drawer").classList.remove("open");
  document.querySelector(".drawer-overlay").classList.remove("show");
  document.body.style.overflow = "";
};

document.querySelectorAll(".drawer-links a").forEach(link=>{
  link.addEventListener("click", ()=>{
    closeDrawer();
  });
});

const searchInput = document.getElementById("drawerSearch");
const drawerItems = document.querySelectorAll(".drawer-links a");

function highlight(text, query){
  if(!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

searchInput.addEventListener("input", ()=>{
  const value = searchInput.value.toLowerCase();

  drawerItems.forEach(item=>{
    if(!item.dataset.label){
      item.dataset.label = item.textContent.trim();
    }

    const label = item.dataset.label;
    const match = label.toLowerCase().includes(value);

    item.style.display = match ? "flex" : "none";
    item.innerHTML = highlight(label, value);
  });
});

/* =========================
   🟢 BADGE ULTRA DRAG PRO
========================= */

const badge = document.getElementById("draggableBadge");

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

/* 🔹 RESTORE POSITION */
function restorePosition() {
  const saved = localStorage.getItem("badgePosition");
  if (!saved) return;

  const pos = JSON.parse(saved);
  badge.style.left = pos.x + "px";
  badge.style.top = pos.y + "px";
  badge.style.right = "auto";
  badge.style.bottom = "auto";
}

restorePosition();

/* 🔹 SAVE POSITION */
function savePosition(x, y) {
  localStorage.setItem("badgePosition", JSON.stringify({ x, y }));
}

/* 🔹 START DRAG (MOUSE + TOUCH) */
function startDrag(clientX, clientY) {
  isDragging = true;

  const rect = badge.getBoundingClientRect();
  offsetX = clientX - rect.left;
  offsetY = clientY - rect.top;

  badge.style.transition = "none";
  badge.style.cursor = "grabbing";
}

/* 🔹 MOVE */
function drag(clientX, clientY) {
  if (!isDragging) return;

  let x = clientX - offsetX;
  let y = clientY - offsetY;

  badge.style.left = x + "px";
  badge.style.top = y + "px";
  badge.style.right = "auto";
  badge.style.bottom = "auto";
}

/* 🔹 STOP DRAG + MAGNETIC SNAP */
function stopDrag() {
  if (!isDragging) return;
  isDragging = false;

  const rect = badge.getBoundingClientRect();
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const magnet = 80; // distance magnétique

  let x = rect.left;
  let y = rect.top;

  /* AIMANT GAUCHE / DROITE */
  if (x < magnet) x = 20;
  else if (x + rect.width > screenW - magnet)
    x = screenW - rect.width - 20;

  /* AIMANT HAUT / BAS */
  if (y < magnet) y = 20;
  else if (y + rect.height > screenH - magnet)
    y = screenH - rect.height - 20;

  badge.style.transition = "all .35s cubic-bezier(.34,1.56,.64,1)";
  badge.style.left = x + "px";
  badge.style.top = y + "px";

  savePosition(x, y);

  badge.style.cursor = "grab";
}

/* =========================
   ⏳ COMPTE À REBOURS FIN JOURNÉE
========================= */

function startDayCountdown(){

  function updateCountdown(){

    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setHours(24,0,0,0);

    const diff = tomorrow - now;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById("countHours").textContent =
      hours.toString().padStart(2,"0");

    document.getElementById("countMinutes").textContent =
      minutes.toString().padStart(2,"0");

    document.getElementById("countSeconds").textContent =
      seconds.toString().padStart(2,"0");
  }

  updateCountdown();
  setInterval(updateCountdown,1000);
}

startDayCountdown();

// 🖱️ MOUSE
badge.addEventListener("mousedown", e => {
  startDrag(e.clientX, e.clientY);
});

document.addEventListener("mousemove", e => {
  drag(e.clientX, e.clientY);
});

document.addEventListener("mouseup", stopDrag);

// 📱 TOUCH
badge.addEventListener("touchstart", e => {
  const touch = e.touches[0];
  startDrag(touch.clientX, touch.clientY);
}, { passive: true });

document.addEventListener("touchmove", e => {
  if (!isDragging) return;
  const touch = e.touches[0];
  drag(touch.clientX, touch.clientY);
}, { passive: true });

document.addEventListener("touchend", stopDrag);

/* 🔹 PETITE ANIMATION AU CLIC */
badge.addEventListener("click", () => {
  badge.style.transform = "scale(1.1)";
  setTimeout(() => {
    badge.style.transform = "scale(1)";
  }, 150);
});

function showToast(message,type="info",duration=3000){

  const container=document.getElementById("toastContainer");

  const toast=document.createElement("div");
  toast.className="toast "+type;

  let icon="ℹ️";

  if(type==="success") icon="✅";
  if(type==="error") icon="❌";
  if(type==="warning") icon="⚠️";

  toast.innerHTML=`<span>${icon}</span> ${message}`;

  const barDuration=duration/1000;

  toast.style.setProperty("animation-duration",".4s, "+barDuration+"s");

  container.appendChild(toast);

  setTimeout(()=>{
    toast.style.animation="toastOut .4s forwards";
    setTimeout(()=>toast.remove(),400);
  },duration);
}

let notifications=[];

function addNotification(message){

notifications.unshift(message);

updateNotificationUI();

}

function updateNotificationUI(){

const list=document.getElementById("notifList");
const count=document.getElementById("notifCount");

count.innerText=notifications.length;

if(notifications.length===0){

list.innerHTML="Aucune notification";
return;

}

list.innerHTML="";

notifications.forEach(n=>{

const div=document.createElement("div");

div.className="notificationItem";

div.innerText=n;

list.appendChild(div);

});

}

function toggleNotifications(){

const panel=document.getElementById("notifPanel");

panel.style.display =
panel.style.display==="block" ? "none" : "block";

}
</script>

<script>

const cards = document.querySelectorAll(".platform-card");

const observer = new IntersectionObserver(entries=>{
entries.forEach(entry=>{
if(entry.isIntersecting){
entry.target.style.opacity="1";
entry.target.style.transform="translateY(0)";
}
});
},{threshold:.2});

cards.forEach(card=>{
card.style.opacity="0";
card.style.transform="translateY(40px)";
card.style.transition="all .6s ease";
observer.observe(card);
});

</script>

<script src="https://cdn.botpress.cloud/webchat/v3.5/inject.js" defer></script>
<script src="https://files.bpcontent.cloud/2025/12/10/23/20251210230142-FSLKPSBI.js" defer></script>

<section id="projet-transitaire" style="padding:60px 20px; text-align:center;">
  <h2>🚢 Projet : Jeune Transitaire</h2>
  <p>
    Plateforme spécialisée dans le transit, la logistique et le commerce international.
  </p>
 <a href="https://jeunetransitaire.vercel.app"
   target="_blank"
   onclick="registerLinkClick()"
   style="display:inline-block;padding:12px 25px;background:#2563eb;color:white;border-radius:8px;text-decoration:none;">
   Visiter mon site
 </a>
</section>
  
<!-- 🍪 Bandeau Cookies -->
<div id="cookie-banner" class="cookie-banner">
  <div class="cookie-content">
    <p>
      🍪 Ce site utilise des cookies pour améliorer votre expérience.
      En continuant, vous acceptez notre utilisation des cookies.
    </p>
    <div class="cookie-buttons">
      <button id="accept-cookies">Accepter</button>
      <button id="reject-cookies">Refuser</button>
    </div>
  </div>
</div>

<script src="cookies.js"></script>

<script src="cookies.js"></script>

<script>
async function openMarket() {

  const user = firebase.auth().currentUser;

  if (!user) {
    alert("Vous devez être connecté.");
    return;
  }

  const token = await user.getIdToken();

  const container = document.getElementById("market-container");

  container.innerHTML = `
    <div style="position:fixed;inset:0;background:#000;z-index:9999;">
      <button onclick="closeMarket()" 
        style="position:absolute;top:20px;right:20px;padding:10px 20px;background:#ff4444;color:white;border:none;border-radius:10px;cursor:pointer;z-index:10000;">
        ✖ Fermer
      </button>

      <iframe 
        id="marketFrame"
        src="https://undersand-market.vercel.app"
        allow="fullscreen"
        style="
          width:100%;
          height:100%;
          border:none;
          border-radius:16px;
          box-shadow:0 20px 50px rgba(0,0,0,0.3);
        ">
      </iframe>
    </div>
  `;

  container.style.display = "block";

  // envoyer le token après chargement
  const frame = document.getElementById("marketFrame");

  frame.onload = () => {
    frame.contentWindow.postMessage({
      type: "firebase-login",
      token: token
    }, "https://undersand-market.vercel.app");
  };
}

function closeMarket() {
  document.getElementById("market-container").innerHTML = "";
}
</script>

<script>
const observer = new IntersectionObserver(entries=>{
entries.forEach(entry=>{
if(entry.isIntersecting){
entry.target.classList.add("visible")
}
})
})

document.querySelectorAll(".card, section, .hero").forEach(el=>{
el.classList.add("fade-up")
observer.observe(el)
})
</script>

<script>
const observer = new IntersectionObserver(entries=>{
entries.forEach(entry=>{
if(entry.isIntersecting){
entry.target.classList.add("show")
}
})
})

document.querySelectorAll(".service-card").forEach(el=>{
observer.observe(el)
})
</script>
