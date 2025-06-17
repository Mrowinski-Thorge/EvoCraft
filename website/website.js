// EvoCraft Website JavaScript - Komplett überarbeitet

document.addEventListener('DOMContentLoaded', function() {
    // Scroll-Animationen
    initScrollAnimations();
    
    // Mobile Navigation
    initMobileNavigation();
    
    // FAQ Funktionalität
    initFAQ();
    
    // Smooth Scrolling für Navigation
    initSmoothScrolling();
    
    // Active Navigation Link
    initActiveNavigation();
});

// Scroll-Animationen
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                // Entferne visible für wiederholbare Animationen
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Mobile Navigation - Hamburger Menu
function initMobileNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('mobile-open');
            
            // Verhindere Body-Scroll wenn Menu offen ist
            if (navMenu.classList.contains('mobile-open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Schließe Menu wenn auf Link geklickt wird
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navMenu.classList.remove('mobile-open');
                document.body.style.overflow = '';
            });
        });
        
        // Schließe Menu bei Fenster-Resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('mobile-open');
                document.body.style.overflow = '';
            }
        });
    }
}

// FAQ Aufklapp-Funktionalität
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            question.addEventListener('click', function() {
                const isActive = item.classList.contains('active');
                
                // Schließe alle anderen FAQ Items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        if (otherAnswer) {
                            otherAnswer.style.maxHeight = '0';
                        }
                    }
                });
                
                // Toggle aktuelles Item
                if (isActive) {
                    item.classList.remove('active');
                    answer.style.maxHeight = '0';
                } else {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        }
    });
}

// Smooth Scrolling für Navigation
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Active Navigation basierend auf Scroll-Position
function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    function updateActiveNav() {
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // Initial check
    updateActiveNav();
    
    // Update on scroll
    window.addEventListener('scroll', updateActiveNav);
}

// Header Scroll-Effekt
function initHeaderScrollEffect() {
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.style.background = 'rgba(13, 20, 33, 0.98)';
            header.style.backdropFilter = 'blur(25px)';
        } else {
            header.style.background = 'rgba(13, 20, 33, 0.95)';
            header.style.backdropFilter = 'blur(20px)';
        }
        
        lastScrollTop = scrollTop;
    });
}

// Parallax-Effekt für Hero Background (optional)
function initParallaxEffect() {
    const heroBackground = document.querySelector('.hero-background-image');
    
    if (heroBackground) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            
            heroBackground.style.transform = `translateY(${parallax}px)`;
        });
    }
}

// Button Hover-Effekte verstärken
function initButtonEffects() {
    const buttons = document.querySelectorAll('.cta-button, .contact-link');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform += ' scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = this.style.transform.replace(' scale(1.05)', '');
        });
    });
}

// Performance Optimierung: Debounce für Scroll-Events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimierte Scroll-Handler
const optimizedScrollHandler = debounce(function() {
    // Hier können weitere scroll-basierte Funktionen hinzugefügt werden
}, 10);

window.addEventListener('scroll', optimizedScrollHandler);

// Lazy Loading für Bilder (falls weitere Bilder hinzugefügt werden)
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Preload kritische Ressourcen
function preloadCriticalResources() {
    const criticalImages = [
        'website/assets/images/Hero.png',
        'website/assets/icons/logo.png',
        'website/assets/icons/lettering.png'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Initialisiere zusätzliche Features wenn gewünscht
// initHeaderScrollEffect();
// initParallaxEffect();
// initButtonEffects();
// initLazyLoading();
preloadCriticalResources();

// Error Handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});

// Console-Nachricht für Entwickler
console.log('%c🎮 EvoCraft Website geladen!', 'color: #FF6B35; font-size: 16px; font-weight: bold;');
console.log('%cEntwickelt mit ♥ für die Wissenschaft', 'color: #FFA726; font-size: 12px;');
