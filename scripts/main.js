// Main JavaScript für die Landing Page
document.addEventListener('DOMContentLoaded', function() {
    // Navigation Toggle für Mobile
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Smooth Scrolling für Navigation
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Intersection Observer für Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Beobachte alle Feature Cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        observer.observe(card);
    });
    
    // Header Scroll Effect - NEUE FARBE VERWENDEN
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollY = currentScrollY;
    });
    
    // Language Switch
    const languageSelect = document.querySelector('.language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            // Hier würde die Sprachenwechsel-Logik implementiert werden
            console.log('Sprache gewechselt zu:', this.value);
        });
    }
});

// CSS für Animationen hinzufügen - MIT NEUEN FARBEN
const animationStyles = `
    .feature-card {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    
    .feature-card.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .header.scrolled {
        background: #1A1A1E !important;
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
        border-bottom: 1px solid #2A2A2E;
    }
    
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            top: 72px;
            left: 0;
            right: 0;
            background: #1A1A1E !important;
            backdrop-filter: blur(20px);
            flex-direction: column;
            padding: 20px;
            transform: translateY(-100%);
            opacity: 0;
            transition: transform 0.3s ease-out, opacity 0.3s ease-out;
            z-index: 1000;
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
            border-top: 1px solid #2A2A2E;
        }
        
        .nav-menu.active {
            transform: translateY(0);
            opacity: 1;
        }
        
        .nav-menu li {
            margin: 8px 0;
        }
    }
`;

// Styles zum Dokument hinzufügen
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);
