class MobileNavigation {
    constructor() {
        this.hamburger = document.querySelector('.hamburger');
        this.navLinks = document.querySelector('.nav-links');
        this.overlay = this.createOverlay();
        this.isOpen = false;
        
        this.init();
    }

    init() {
        if (!this.hamburger || !this.navLinks) return;

        // Add click event to hamburger
        this.hamburger.addEventListener('click', () => this.toggleMenu());

        // Close menu when clicking a link
        this.navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close menu when clicking overlay
        this.overlay.addEventListener('click', () => this.closeMenu());

        // Close menu when pressing Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });

        // Prevent scrolling when menu is open
        document.body.addEventListener('touchmove', (e) => {
            if (this.isOpen) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
        return overlay;
    }

    toggleMenu() {
        this.isOpen = !this.isOpen;
        this.hamburger.classList.toggle('active');
        this.navLinks.classList.toggle('active');
        this.overlay.classList.toggle('active');
        
        // Toggle body scroll
        document.body.style.overflow = this.isOpen ? 'hidden' : '';
    }

    closeMenu() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.hamburger.classList.remove('active');
        this.navLinks.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Initialize Mobile Navigation
document.addEventListener('DOMContentLoaded', () => {
    new MobileNavigation();
}); 