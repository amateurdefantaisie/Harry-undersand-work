// 1. Explosion de paillettes au chargement
window.onload = function() {
    // Explosion centrale initiale
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF69B4', '#8E44AD', '#FFFFFF'] // Rose, Violet, Blanc
    });

    // Petites explosions aléatoires pendant 5 secondes
    let duration = 5 * 1000;
    let animationEnd = Date.now() + duration;
    let defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    let interval = setInterval(function() {
        let timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        let particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { 
            particleCount, 
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
        }));
        confetti(Object.assign({}, defaults, { 
            particleCount, 
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
        }));
    }, 250);

    // 2. Gestion de l'overlay (Message de remerciement)
    const overlay = document.getElementById('welcome-overlay');
    
    // On attend 10 secondes (10000ms) avant de lancer l'animation de sortie
    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 1000); // Temps de la transition CSS
    }, 10000);
};

// 3. Logique simplifiée pour les Likes (en attendant la DB complète)
document.querySelectorAll('.btn-rose').forEach(button => {
    button.addEventListener('click', function() {
        if(this.innerText.includes('Like')) {
            this.innerText = '❤️ Liké !';
            this.style.background = '#8E44AD'; // Devient violet au clic
        }
    });
});
