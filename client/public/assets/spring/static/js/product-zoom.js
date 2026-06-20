/**
 * Product Image Zoom Effect - Magnifying Glass Style
 * Provides magnifying glass zoom functionality that follows mouse cursor
 */

class ProductImageZoom {
    constructor() {
        this.zoomLevel = 2.5;
        this.lensSize = 150;
        this.resultSize = 320;
        this.isInitialized = false;
        this.magnifyingMode = true; // Enable magnifying glass mode
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupZoom());
        } else {
            this.setupZoom();
        }
    }

    setupZoom() {
        const mainImageContainer = document.querySelector('.main-image-container');
        const mainImage = document.querySelector('.main-image');
        
        if (!mainImageContainer || !mainImage) {
            console.log('Product zoom: Main image elements not found');
            return;
        }

        // Check if we're on a touch device
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isTouchDevice) {
            // On touch devices, use simple zoom on tap
            this.setupTouchZoom(mainImageContainer, mainImage);
        } else {
            // On desktop, use magnifying glass zoom
            if (this.magnifyingMode) {
                this.setupMagnifyingGlass(mainImageContainer, mainImage);
            } else {
                this.setupDesktopZoom(mainImageContainer, mainImage);
            }
        }

        // Setup thumbnail click handlers
        this.setupThumbnailHandlers();
        
        // Setup keyboard navigation
        this.setupKeyboardNavigation();
        
        this.isInitialized = true;
    }

    setupMagnifyingGlass(container, image) {
        // Create magnifying glass elements
        const zoomLens = document.createElement('div');
        zoomLens.className = 'zoom-lens';
        
        const zoomResult = document.createElement('div');
        zoomResult.className = 'zoom-result';
        
        const zoomImage = document.createElement('img');
        zoomImage.src = image.src;
        zoomImage.alt = image.alt;
        zoomImage.loading = 'eager';
        zoomResult.appendChild(zoomImage);

        // Add zoom elements to container
        container.classList.add('zoom-container');
        container.appendChild(zoomLens);
        container.appendChild(zoomResult);

        // Calculate zoom ratios
        let imageLoaded = false;
        let containerRect = null;
        
        const updateZoomRatios = () => {
            containerRect = container.getBoundingClientRect();
            if (imageLoaded && containerRect) {
                this.zoomX = zoomImage.offsetWidth / containerRect.width;
                this.zoomY = zoomImage.offsetHeight / containerRect.height;
            }
        };

        // Wait for image to load
        zoomImage.onload = () => {
            imageLoaded = true;
            updateZoomRatios();
        };

        // Mouse move handler with magnifying glass effect
        let animationId = null;
        const handleMouseMove = (e) => {
            if (animationId) return;
            
            animationId = requestAnimationFrame(() => {
                if (!containerRect) {
                    containerRect = container.getBoundingClientRect();
                }
                
                const x = e.clientX - containerRect.left;
                const y = e.clientY - containerRect.top;

                // Position lens at cursor
                zoomLens.style.left = x + 'px';
                zoomLens.style.top = y + 'px';

                // Calculate the area to show in zoom result
                if (imageLoaded) {
                    // Calculate what part of the image to show
                    const percentX = x / containerRect.width;
                    const percentY = y / containerRect.height;
                    
                    // Position the zoomed image to show the area under cursor
                    const zoomX = percentX * zoomImage.offsetWidth;
                    const zoomY = percentY * zoomImage.offsetHeight;

                    // Center the zoomed area in the result window
                    zoomImage.style.left = -zoomX + this.resultSize / 2 + 'px';
                    zoomImage.style.top = -zoomY + this.resultSize / 2 + 'px';
                }

                // Apply magnifying effect to main image
                const scaleX = 1 + (this.zoomLevel - 1) * (x / containerRect.width);
                const scaleY = 1 + (this.zoomLevel - 1) * (y / containerRect.height);
                
                // Transform origin follows cursor
                const originX = (x / containerRect.width) * 100;
                const originY = (y / containerRect.height) * 100;
                
                image.style.transformOrigin = `${originX}% ${originY}%`;
                image.style.transform = `scale(${Math.min(scaleX, scaleY)})`;
                
                animationId = null;
            });
        };

        // Event listeners
        container.addEventListener('mousemove', handleMouseMove);
        
        container.addEventListener('mouseenter', (e) => {
            zoomLens.style.opacity = '1';
            zoomResult.style.opacity = '1';
            updateZoomRatios();
            
            // Initial position
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            zoomLens.style.left = x + 'px';
            zoomLens.style.top = y + 'px';
        });

        container.addEventListener('mouseleave', () => {
            zoomLens.style.opacity = '0';
            zoomResult.style.opacity = '0';
            
            // Reset image transform
            image.style.transform = 'scale(1)';
            image.style.transformOrigin = 'center center';
            
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            containerRect = null;
            updateZoomRatios();
        });

        // Update zoom image when main image changes
        this.updateZoomImage = (newSrc) => {
            imageLoaded = false;
            zoomImage.src = newSrc;
        };
    }

    setupDesktopZoom(container, image) {
        // Fallback to simple zoom
        container.classList.add('simple-zoom');
    }

    setupTouchZoom(container, image) {
        let isZoomed = false;
        let startDistance = 0;
        let startScale = 1;
        
        const toggleZoom = (e) => {
            e.preventDefault();
            
            if (isZoomed) {
                image.style.transform = 'scale(1)';
                image.style.transformOrigin = 'center center';
                container.style.cursor = 'zoom-in';
                container.classList.remove('zoomed');
                isZoomed = false;
            } else {
                // Get touch position for zoom origin
                const rect = container.getBoundingClientRect();
                const x = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
                const y = e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
                
                const originX = (x / rect.width) * 100;
                const originY = (y / rect.height) * 100;
                
                image.style.transformOrigin = `${originX}% ${originY}%`;
                image.style.transform = 'scale(2)';
                container.style.cursor = 'zoom-out';
                container.classList.add('zoomed');
                isZoomed = true;
            }
        };

        // Handle pinch zoom
        const handleTouchStart = (e) => {
            if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                startDistance = Math.hypot(
                    touch1.clientX - touch2.clientX,
                    touch1.clientY - touch2.clientY
                );
                startScale = isZoomed ? 2 : 1;
            }
        };

        const handleTouchMove = (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const distance = Math.hypot(
                    touch1.clientX - touch2.clientX,
                    touch1.clientY - touch2.clientY
                );
                
                const scale = Math.max(1, Math.min(3, startScale * (distance / startDistance)));
                
                // Calculate center point for transform origin
                const rect = container.getBoundingClientRect();
                const centerX = ((touch1.clientX + touch2.clientX) / 2 - rect.left) / rect.width * 100;
                const centerY = ((touch1.clientY + touch2.clientY) / 2 - rect.top) / rect.height * 100;
                
                image.style.transformOrigin = `${centerX}% ${centerY}%`;
                image.style.transform = `scale(${scale})`;
                
                if (scale > 1.1) {
                    container.classList.add('zoomed');
                    isZoomed = true;
                } else {
                    container.classList.remove('zoomed');
                    isZoomed = false;
                }
            }
        };

        container.addEventListener('click', toggleZoom);
        container.addEventListener('touchstart', handleTouchStart, { passive: false });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        
        // Reset zoom when image changes
        this.resetTouchZoom = () => {
            image.style.transform = 'scale(1)';
            image.style.transformOrigin = 'center center';
            container.style.cursor = 'zoom-in';
            container.classList.remove('zoomed');
            isZoomed = false;
        };
    }

    setupThumbnailHandlers() {
        const thumbnails = document.querySelectorAll('.thumbnail-horizontal');
        const mainImage = document.querySelector('.main-image');
        
        if (!thumbnails.length || !mainImage) return;

        thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => {
                // Update main image with fade effect
                mainImage.style.opacity = '0.5';
                
                setTimeout(() => {
                    mainImage.src = thumbnail.src;
                    mainImage.alt = thumbnail.alt;
                    
                    // Update zoom image if zoom is active
                    if (this.updateZoomImage) {
                        this.updateZoomImage(thumbnail.src);
                    }
                    
                    // Reset touch zoom if active
                    if (this.resetTouchZoom) {
                        this.resetTouchZoom();
                    }
                    
                    // Reset main image transform
                    mainImage.style.transform = 'scale(1)';
                    mainImage.style.transformOrigin = 'center center';
                    
                    mainImage.style.opacity = '1';
                }, 150);
                
                // Update active thumbnail
                thumbnails.forEach(t => t.classList.remove('active'));
                thumbnail.classList.add('active');
            });

            // Add keyboard support
            thumbnail.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    thumbnail.click();
                }
            });

            // Make thumbnails focusable
            thumbnail.setAttribute('tabindex', '0');
            thumbnail.setAttribute('role', 'button');
            thumbnail.setAttribute('aria-label', `View image ${index + 1}`);
        });
    }

    setupKeyboardNavigation() {
        const thumbnails = document.querySelectorAll('.thumbnail-horizontal');
        if (!thumbnails.length) return;

        document.addEventListener('keydown', (e) => {
            const activeElement = document.activeElement;
            const currentIndex = Array.from(thumbnails).indexOf(activeElement);
            
            if (currentIndex === -1) return;

            let nextIndex = currentIndex;
            
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : thumbnails.length - 1;
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextIndex = currentIndex < thumbnails.length - 1 ? currentIndex + 1 : 0;
                    break;
                case 'Home':
                    e.preventDefault();
                    nextIndex = 0;
                    break;
                case 'End':
                    e.preventDefault();
                    nextIndex = thumbnails.length - 1;
                    break;
            }
            
            if (nextIndex !== currentIndex) {
                thumbnails[nextIndex].focus();
            }
        });
    }

    // Public methods
    destroy() {
        if (!this.isInitialized) return;
        
        const container = document.querySelector('.zoom-container');
        if (container) {
            container.classList.remove('zoom-container');
            const lens = container.querySelector('.zoom-lens');
            const result = container.querySelector('.zoom-result');
            if (lens) lens.remove();
            if (result) result.remove();
        }
        
        // Reset main image
        const mainImage = document.querySelector('.main-image');
        if (mainImage) {
            mainImage.style.transform = 'scale(1)';
            mainImage.style.transformOrigin = 'center center';
        }
        
        this.isInitialized = false;
    }

    refresh() {
        this.destroy();
        this.setupZoom();
    }

    // Toggle between magnifying and simple zoom modes
    toggleMagnifyingMode() {
        this.magnifyingMode = !this.magnifyingMode;
        this.refresh();
    }
}

// Initialize zoom functionality
const productZoom = new ProductImageZoom();

// Export for potential external use
window.ProductImageZoom = ProductImageZoom;

// Auto-refresh on image changes (for dynamic content)
if (window.MutationObserver) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'src' && 
                mutation.target.classList.contains('main-image')) {
                // Small delay to ensure image is loaded
                setTimeout(() => productZoom.refresh(), 100);
            }
        });
    });

    const mainImage = document.querySelector('.main-image');
    if (mainImage) {
        observer.observe(mainImage, { attributes: true });
    }
}