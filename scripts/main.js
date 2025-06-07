// EvoCraft Website Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Navigation Mobile Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // VERSCHIEDENE OBSERVER FÜR VERSCHIEDENE SEKTIONEN
    
    // Standard Observer für die meisten Sektionen
    const standardObserverOptions = {
        threshold: 0.05,
        rootMargin: '0px 0px 30px 0px'
    };
    
    // Spezieller Observer für Contact-Sektion (früher)
    const contactObserverOptions = {
        threshold: 0.02, // Noch niedriger
        rootMargin: '0px 0px 100px 0px' // Doppelt so früh
    };
    
    const standardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                standardObserver.unobserve(entry.target);
            }
        });
    }, standardObserverOptions);
    
    const contactObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                contactObserver.unobserve(entry.target);
            }
        });
    }, contactObserverOptions);
    
    // Beobachte alle Elemente mit animate-on-scroll
    document.querySelectorAll('.animate-on-scroll').forEach((element) => {
        // Prüfe ob das Element in der Contact-Sektion oder im Footer ist
        const isContactSection = element.closest('.contact-section') || element.closest('.footer');
        
        if (isContactSection) {
            contactObserver.observe(element); // Frühere Animation für Kontakt
        } else {
            standardObserver.observe(element); // Standard Animation für Rest
        }
    });
    
    // Header background on scroll - SOFORTIGE ANPASSUNG
    const header = document.querySelector('.header');
    
    // Funktion für Header-Update
    function updateHeader() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            header.style.background = 'rgba(26, 26, 30, 0.95)';
            header.style.backdropFilter = 'blur(20px)';
        } else {
            header.style.background = 'var(--nav-bg)';
            header.style.backdropFilter = 'blur(10px)';
        }
    }
    
    // Sofort ausführen beim Laden
    updateHeader();
    
    // Bei Scroll ausführen
    window.addEventListener('scroll', updateHeader);
    
    // Bei Resize ausführen (für Layout-Änderungen)
    window.addEventListener('resize', updateHeader);
    
    // Add active class to nav links based on scroll position
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    function updateActiveNavLink() {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNavLink);
    
    // Button hover effects with ripple
    document.querySelectorAll('.cta-button, .contact-link').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.3)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.pointerEvents = 'none';
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add ripple animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .cta-button, .contact-link {
            position: relative;
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);
});
