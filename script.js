import { auth, provider } from "./auth-config.js";
import { onAuthStateChanged, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

/**
 * 1. GESTION DE L'AUTHENTIFICATION & PROTECTION DES PAGES
 */
onAuthStateChanged(auth, (user) => {
    const isDashboard = window.location.pathname.includes("dashboard.html");
    const btnConnexion = document.querySelector(".btn-connexion");

    if (user) {
        // Si l'utilisateur est sur l'accueil, on adapte le bouton de connexion
        if (btnConnexion) {
            btnConnexion.textContent = "Mon Dashboard";
            btnConnexion.onclick = () => window.location.href = "dashboard.html";
        }
        
        // Mise à jour du nom d'utilisateur si l'élément existe (ex: sur le dashboard)
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) userNameEl.textContent = user.displayName;
        
    } else {
        // Redirection forcée si un utilisateur non-connecté tente d'accéder au dashboard
        if (isDashboard) {
            window.location.href = "index.html";
        }
    }
});

// Fonctions globales de connexion/déconnexion
window.loginGoogle = () => {
    signInWithPopup(auth, provider)
        .then(() => window.location.href = "dashboard.html")
        .catch(err => console.error("Erreur de connexion Google:", err));
};

window.loginWhatsApp = () => {
    window.location.href = "https://wa.me/242066973413?text=Je%20souhaite%20me%20connecter%20au%20Studio";
};

window.logout = () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    });
};

/**
 * 2. INTERFACE UTILISATEUR & ANIMATIONS
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Animation d'apparition au défilement (Intersection Observer) ---
    const fadeElements = document.querySelectorAll('.fade-in, .card, .hero, .cta');
    const appearanceOptions = {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearanceObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                // Optionnel : styles directs si les classes CSS ne sont pas encore prêtes
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, appearanceOptions);

    fadeElements.forEach(el => {
        // État initial pour l'animation
        el.style.opacity = "0";
        el.style.transform = "translateY(40px)";
        el.style.transition = "all 0.8s ease";
        appearanceObserver.observe(el);
    });

    // --- Navigation Fluide (Smooth Scroll) ---
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId.startsWith("#")) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // --- Effet visuel du Header et du fond au défilement ---
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (header) {
            if (window.scrollY > 50) {
                header.style.padding = "15px 10%";
                header.style.background = "rgba(15, 23, 42, 0.95)";
            } else {
                header.style.padding = "20px 10%";
                header.style.background = "rgba(15, 23, 42, 0.8)";
            }
        }
    });

    // --- Chargement dynamique du Footer ---
    loadFooter();
    
    // --- Gestion de la Modal de connexion ---
    const modal = document.getElementById("loginModal");
    const btnConnexionHeader = document.querySelector(".btn-connexion");
    const spanClose = document.querySelector(".close-modal");

    if (btnConnexionHeader && modal) {
        btnConnexionHeader.onclick = () => modal.style.display = "flex";
    }
    if (spanClose) {
        spanClose.onclick = () => modal.style.display = "none";
    }
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = "none";
    };
});

/**
 * 3. FONCTION DE CHARGEMENT DU FOOTER
 */
function loadFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    
    if (footerPlaceholder) {
        fetch('footer.html')
            .then(response => {
                if (!response.ok) throw new Error("Erreur de chargement du footer");
                return response.text();
            })
            .then(data => {
                footerPlaceholder.innerHTML = data;
            })
            .catch(error => {
                console.error('Erreur:', error);
                // Affichage de secours avec les informations légales
                footerPlaceholder.innerHTML = `
                    <footer>
                        <p>© 2026 Harry Undersand Studio - Tous droits réservés</p>
                        <p style="font-size: 0.8em; color: #64748b;">RCCM: CG-BZV-01-2026-B12-XXXXX | NIU: M XXXXXXX X</p>
                    </footer>`;
            });
    }
}
