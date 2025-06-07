// EvoCraft Website Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // VEREINFACHTER LINK-HANDLER
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

    // Rest des JavaScript-Codes bleibt unverändert...
    // WIEDERHOLBARE OBSERVER FÜR ANIMATIONEN
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
            }
        });
    }, standardObserverOptions);
    
    const contactObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, contactObserverOptions);
    
    // RESET ANIMATIONEN BEI SEITENLADUNG
    function resetAnimations() {
        document.querySelectorAll('.animate-on-scroll').forEach(element => {
            element.classList.remove('visible');
        });
    }
    
    // Reset bei Seitenladung (für Zurück-Navigation)
    resetAnimations();
    
    // Beobachte nur Elemente AUSSERHALB des Footers
    document.querySelectorAll('.animate-on-scroll').forEach((element) => {
        const isInFooter = element.closest('.footer');
        
        if (!isInFooter) {
            const isContactSection = element.closest('.contact-section');
            
            if (isContactSection) {
                contactObserver.observe(element);
            } else {
                standardObserver.observe(element);
            }
        }
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

    // SCROLL-EVENT-LISTENER
    let ticking = false;
    
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateHeader();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', onScroll);
    
    // Initial calls
    updateHeader();

    // TOUCH HORIZONTAL SCROLL PREVENTION
    let startX = 0;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
    });
    
    document.addEventListener('touchmove', function(e) {
        const currentX = e.touches[0].clientX;
        const diffX = Math.abs(currentX - startX);
        
        // Verhindert horizontales Scrollen wenn mehr horizontal als vertikal bewegt wird
        if (diffX > 10) {
            e.preventDefault();
        }
    }, { passive: false });

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
            ripple.style.background = 'rgba(255, 255, 255, 0.6)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.pointerEvents = 'none';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        });
    });
});
