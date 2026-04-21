document.addEventListener('DOMContentLoaded', () => {
    
    // --- ANIMATION D'APPARITION (Intersection Observer) ---
    const fadeElements = document.querySelectorAll('.fade-in');

    const appearanceOptions = {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearanceObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                // On arrête d'observer une fois l'élément affiché
                observer.unobserve(entry.target);
            }
        });
    }, appearanceOptions);

    fadeElements.forEach(el => {
        appearanceObserver.observe(el);
    });

    // --- NAVIGATION FLUIDE (Smooth Scroll) ---
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // --- EFFET SUR LE HEADER AU SCROLL ---
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.style.padding = "15px 10%";
            header.style.background = "rgba(15, 23, 42, 0.95)";
        } else {
            header.style.padding = "20px 10%";
            header.style.background = "rgba(15, 23, 42, 0.8)";
        }
    });

});

// --- CHARGEMENT DYNAMIQUE DU FOOTER ---
function loadFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    
    if (footerPlaceholder) {
        fetch('footer.html')
            .then(response => {
                if (!response.ok) throw new Error("Erreur lors du chargement du footer");
                return response.text();
            })
            .then(data => {
                footerPlaceholder.innerHTML = data;
            })
            .catch(error => {
                console.error('Erreur:', error);
                footerPlaceholder.innerHTML = "<footer><p>© 2026 Harry Undersand Studio</p></footer>";
            });
    }
}

// Appeler la fonction au chargement du document
document.addEventListener('DOMContentLoaded', loadFooter);
