 // Confettis auto au chargement
        window.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#8b5cf6', '#ec4899', '#facc15'] });
            }, 500);
        });

        function toggleMusic() {
            const music = document.getElementById('bgMusic');
            const btn = document.getElementById('musicBtn');
            const container = document.getElementById('playerContainer');
            
            if (music.paused) {
                music.play();
                btn.innerText = "MUSIQUE EN COURS... ⏸";
                container.style.animation = "none"; // Stop pulse
            } else {
                music.pause();
                btn.innerText = "MUSIQUE EN PAUSE ▶️";
            }
        }

        function revealGift() {
            const msg = document.getElementById('secretMessage');
            msg.style.display = 'block';
            
            // Explosion de confettis
            var duration = 3 * 1000;
            var end = Date.now() + duration;

            (function frame() {
              confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#facc15', '#ec4899'] });
              confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#facc15', '#8b5cf6'] });
              if (Date.now() < end) { requestAnimationFrame(frame); }
            }());

            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
