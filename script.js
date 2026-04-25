// --- INITIALISATION & VARIABLES ---
const overlay = document.getElementById('welcome-overlay');
const startBtn = document.getElementById('start-experience');
const closeManual = document.getElementById('manual-close');
const timerSpan = document.querySelector('#auto-close-timer span');
const audio = document.getElementById('bg-audio');
const musicBtn = document.getElementById('play-pause');
const disc = document.querySelector('.disc');

let timeLeft = 10;

// --- GESTION DE L'OVERLAY (FERMETURE & TIMER) ---
const countdown = setInterval(() => {
    timeLeft--;
    timerSpan.innerText = timeLeft;
    if (timeLeft <= 0) {
        closeExperience();
    }
}, 1000);

function closeExperience() {
    clearInterval(countdown);
    overlay.style.opacity = '0';
    overlay.style.transform = 'scale(1.1)';
    
    setTimeout(() => {
        overlay.remove();
        // Lancement auto de la musique et des paillettes
        handleMusic(true);
        launchPremiumConfetti();
    }, 800);
}

startBtn.addEventListener('click', closeExperience);
closeManual.addEventListener('click', closeExperience);

// --- SYSTÈME AUDIO PREMIUM ---
function handleMusic(play) {
    if (play) {
        audio.play();
        musicBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        disc.style.animationPlayState = 'running';
    } else {
        audio.pause();
        musicBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        disc.style.animationPlayState = 'paused';
    }
}

musicBtn.addEventListener('click', () => {
    const isPaused = audio.paused;
    handleMusic(isPaused);
});

// --- EXPLOSION DE PAILLETTES (CANVAS-CONFETTI) ---
function launchPremiumConfetti() {
    const count = 200;
    const defaults = { origin: { y: 0.7 }, zIndex: 10000 };

    function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio),
        }));
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
}

// --- INTERACTIVITÉ DES POSTS (LIKES & VIDÉOS) ---
document.querySelectorAll('.post-card').forEach(card => {
    const video = card.querySelector('video');
    const playBtn = card.querySelector('.video-play-btn');
    const likeBtn = card.querySelector('.like-trigger');
    const countSpan = card.querySelector('.count');
    const input = card.querySelector('.comment-input');
    const commentList = card.querySelector('.comments-list');

    // Lecture vidéo au clic
    if (video) {
        card.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                if(playBtn) playBtn.style.opacity = '0';
            } else {
                video.pause();
                if(playBtn) playBtn.style.opacity = '1';
            }
        });
    }

    // Système de Like
    let likes = 0;
    likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        likes++;
        countSpan.innerText = likes;
        likeBtn.style.color = '#ec4899';
        confetti({ particleCount: 20, spread: 50, origin: { y: 0.8 } });
    });

    // Commentaires "En direct"
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.trim() !== "") {
            const comment = document.createElement('p');
            comment.style.cssText = "font-size: 0.85rem; margin-top: 5px; opacity: 0.8; border-left: 2px solid #ec4899; padding-left: 10px;";
            comment.innerText = input.value;
            commentList.appendChild(comment);
            input.value = "";
        }
    });
});

// Reveal des éléments au scroll
ScrollReveal().reveal('.post-card', { 
    delay: 300, 
    distance: '50px', 
    origin: 'bottom', 
    interval: 100 
});
