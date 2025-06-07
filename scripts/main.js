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
    
    // VEREINFACHTER LINK-HANDLER - NUR CLICK EVENTS
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
    
    // OBSERVER NUR FÜR NICHT-FOOTER ELEMENTE
    
    // Standard Observer für die meisten Sektionen
    const standardObserverOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px 50px 0px'
    };
    
    // Spezieller Observer für Contact-Sektion
    const contactObserverOptions = {
        threshold: 0.05,
        rootMargin: '0px 0px 150px 0px'
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
    
    // Beobachte nur Elemente AUSSERHALB des Footers
    document.querySelectorAll('.animate-on-scroll').forEach((element) => {
        // FOOTER KOMPLETT AUSSCHLIESSEN
        const isInFooter = element.closest('.footer');
        
        if (!isInFooter) {
            // Prüfe ob das Element in der Contact-Sektion ist
            const isContactSection = element.closest('.contact-section');
            
            if (isContactSection) {
                contactObserver.observe(element);
            } else {
                standardObserver.observe(element);
            }
        }
        // Footer-Elemente werden NICHT beobachtet = keine Animationen
    });
    
    // Header background on scroll
    const header = document.querySelector('.header');
    
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
    
    updateHeader();
    window.addEventListener('scroll', updateHeader);
    window.addEventListener('resize', updateHeader);
    
    // ACTIVE LINK TRACKING
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    function updateActiveNavLink() {
        const scrollPosition = window.scrollY + 150;
        let activeSection = null;
        
        // Entferne alle aktiven Klassen
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Finde die aktuelle Sektion
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                activeSection = section.getAttribute('id');
            }
        });
        
        // Spezielle Behandlung für Kontakt-Sektion auf Desktop
        const contactSection = document.querySelector('#contact');
        if (contactSection && window.innerWidth >= 1025) {
            const contactTop = contactSection.offsetTop - 200;
            const contactBottom = contactTop + contactSection.offsetHeight;
            
            if (scrollPosition >= contactTop && scrollPosition < contactBottom) {
                activeSection = 'contact';
            }
        }
        
        // Aktiviere nur den entsprechenden Link
        if (activeSection) {
            navLinks.forEach(link => {
                const linkTarget = link.getAttribute('href').substring(1);
                if (linkTarget === activeSection) {
                    link.classList.add('active');
                }
            });
        }
        
        // Fallback: Wenn ganz oben, aktiviere "Start"
        if (scrollPosition < 200) {
            navLinks.forEach(link => {
                if (link.getAttribute('href') === '#home') {
                    link.classList.add('active');
                }
            });
        }
    }
    
    // Throttle function
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(updateActiveNavLink, 10);
    });
    
    updateActiveNavLink();
    
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
