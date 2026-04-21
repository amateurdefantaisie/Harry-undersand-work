import { auth, provider } from "./auth-config.js";
import { onAuthStateChanged, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

/**
 * 1. GESTION DE L'AUTHENTIFICATION & PROTECTION DES PAGES
 */
onAuthStateChanged(auth, (user) => {
    const isDashboard = window.location.pathname.includes("dashboard.html");
    const authBtn = document.getElementById('auth-trigger-btn'); // Le bouton Connexion
    const profileMenu = document.getElementById('user-profile-menu'); // Le nouveau menu icône
    const avatar = document.getElementById('user-avatar');

    if (user) {
        // Masquer connexion, afficher profil
        if (authBtn) authBtn.style.display = 'none';
        if (profileMenu) profileMenu.style.display = 'block';
        if (avatar && user.photoURL) avatar.src = user.photoURL;
        
        // Stockage local pour la page profil
        localStorage.setItem('user_info', JSON.stringify({
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
            provider: user.providerData[0].providerId
        }));

        const userNameEl = document.getElementById('user-name');
        if (userNameEl) userNameEl.textContent = user.displayName;
    } else {
        if (authBtn) authBtn.style.display = 'block';
        if (profileMenu) profileMenu.style.display = 'none';
        if (isDashboard) window.location.href = "index.html";
    }
});

// Fonctions globales de connexion/déconnexion
// Connexion Google stabilisée
window.loginGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        if (result.user) window.location.href = "dashboard.html";
    } catch (err) {
        console.error("Erreur Google:", err);
    }
};

// Menu Dropdown
window.toggleDropdown = () => {
    const dropdown = document.getElementById('dropdown-content');
    dropdown.classList.toggle('show');
};

// Gestion du Thème (Sombre / Clair / Système)
window.changeTheme = (theme) => {
    const body = document.body;
    if (theme === 'light') {
        body.classList.add('light-theme');
    } else if (theme === 'dark') {
        body.classList.remove('light-theme');
    } else {
        // Détection auto du système
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        body.classList.toggle('light-theme', !isDark);
    }
    localStorage.setItem('theme-pref', theme);
};

// Gestion de la Langue
window.changeLanguage = (lang) => {
    console.log("Langue changée en :", lang);
    localStorage.setItem('lang-pref', lang);
    // Ici on pourra ajouter une logique de traduction plus tard
};

// Déconnexion
window.logout = () => {
    signOut(auth).then(() => {
        localStorage.removeItem('user_info');
        window.location.href = "index.html";
    });
};

// Fermer le menu profil si on clique en dehors
    window.addEventListener('click', (e) => {
        const dropdown = document.getElementById('dropdown-content');
        const profileBtn = document.querySelector('.profile-icon-btn');
        if (dropdown && !profileBtn.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
    
    // Appliquer le thème sauvegardé au démarrage
    const savedTheme = localStorage.getItem('theme-pref') || 'dark';
    window.changeTheme(savedTheme);

// Pour WhatsApp (Ouvrir le panneau de scan)
window.loginWhatsApp = () => {
    const authSelection = document.getElementById('auth-selection');
    const waPanel = document.getElementById('whatsapp-auth-panel');
    if (authSelection && waPanel) {
        authSelection.style.display = 'none';
        waPanel.style.display = 'block';
    }
};

// Fonction pour revenir au choix initial (Google/WhatsApp)
window.backToAuthSelection = () => {
    document.getElementById('auth-selection').style.display = 'block';
    document.getElementById('whatsapp-auth-panel').style.display = 'none';
};

// Alterne entre l'affichage du QR Code et du Code d'appariement
window.switchWamethod = (method) => {
    const tabs = document.querySelectorAll('.tab-btn');
    const qrContainer = document.getElementById('wa-qr-container');
    const codeContainer = document.getElementById('wa-code-container');

    tabs.forEach(tab => tab.classList.remove('active'));

    if (method === 'qr') {
        tabs[0].classList.add('active');
        qrContainer.style.display = 'block';
        codeContainer.style.display = 'none';
    } else {
        tabs[1].classList.add('active');
        qrContainer.style.display = 'none';
        codeContainer.style.display = 'block';
    }
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
    btnConnexionHeader.onclick = () => {
        modal.style.display = "flex";
        // On s'assure de montrer le menu principal de la modal à l'ouverture
        if(typeof window.backToAuthSelection === "function") window.backToAuthSelection();
    };
}
    if (spanClose) {
        spanClose.onclick = () => modal.style.display = "none";
    }
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = "none";
    };
});

window.generatePairingCode = () => {
    const phone = document.getElementById('phone-number').value;
    if (!phone) {
        alert("Veuillez entrer votre numéro de téléphone");
        return;
    }
    
    const display = document.getElementById('display-pairing-code');
    display.textContent = "CHARGEMENT...";

    // Simulation d'appel API vers un bot (ex: Baileys)
    setTimeout(() => {
        // Logique de génération de code aléatoire pour l'exemple
        const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        display.textContent = randomCode.match(/.{1,4}/g).join('-');
    }, 1500);
};

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
