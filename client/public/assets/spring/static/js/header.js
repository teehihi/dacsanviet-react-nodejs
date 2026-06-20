// Header functionality
document.addEventListener('DOMContentLoaded', function() {
    
    // Header scroll effect with hide/show
    let lastScrollTop = 0;
    let scrollTimeout;
    
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.modern-header');
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        // Clear timeout if scrolling
        clearTimeout(scrollTimeout);
        
        if (currentScroll > lastScrollTop && currentScroll > 100) {
            // Scrolling down - hide header
            header.classList.add('header-hidden');
            header.classList.remove('header-visible');
        } else if (currentScroll < lastScrollTop) {
            // Scrolling up - show header
            header.classList.remove('header-hidden');
            header.classList.add('header-visible');
        }
        
        // If at top, remove all classes
        if (currentScroll <= 50) {
            header.classList.remove('header-hidden', 'header-visible');
        }
        
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
        
        // Show header after scroll stops
        scrollTimeout = setTimeout(() => {
            if (currentScroll > 100) {
                header.classList.remove('header-hidden');
                header.classList.add('header-visible');
            }
        }, 150);
    });
    
    // Active nav link highlighting
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu .nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href === currentPath || (currentPath.includes('/products') && href.includes('/products')))) {
            link.classList.add('active');
        }
    });
    
    // User avatar with name initials
    const avatarTexts = document.querySelectorAll('.avatar-text, .avatar-text-small');
    avatarTexts.forEach(avatar => {
        // This will be handled by Thymeleaf on server side
        // But we can add client-side fallback if needed
        if (!avatar.textContent.trim()) {
            avatar.textContent = 'U';
        }
    });
    
    // Enhanced dropdown animations for user menu (keep click behavior for user dropdown)
    document.querySelectorAll('.user-avatar[data-bs-toggle="dropdown"]').forEach(dropdown => {
        dropdown.addEventListener('show.bs.dropdown', function() {
            const menu = this.nextElementSibling;
            if (menu) {
                menu.style.opacity = '0';
                menu.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    menu.style.transition = 'all 0.3s ease';
                    menu.style.opacity = '1';
                    menu.style.transform = 'translateY(0)';
                }, 10);
            }
        });
    });
    
    // Smooth scrolling for anchor links
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
    
    // Cart icon animation
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) rotate(5deg)';
        });
        
        cartIcon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    }
    
    // Logo animation
    const logoBrand = document.querySelector('.logo-brand');
    if (logoBrand) {
        logoBrand.addEventListener('mouseenter', function() {
            const logoIcon = this.querySelector('.logo-icon img');
            if (logoIcon) {
                logoIcon.style.transform = 'rotate(360deg) scale(1.1)';
            }
        });
        
        logoBrand.addEventListener('mouseleave', function() {
            const logoIcon = this.querySelector('.logo-icon img');
            if (logoIcon) {
                logoIcon.style.transform = 'rotate(0deg) scale(1)';
            }
        });
    }
});

// Function to update cart count (can be called from other scripts)
function updateCartCount(count) {
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
        if (count > 0) {
            cartBadge.textContent = count;
            cartBadge.style.display = 'inline-block';
        } else {
            cartBadge.style.display = 'none';
        }
    }
}

// Function to highlight active nav item
function setActiveNavItem(path) {
    const navLinks = document.querySelectorAll('.nav-menu .nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href && href === path) {
            link.classList.add('active');
        }
    });
}