// Cursor Trail Effect
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Trail particles
    const particles = [];
    const maxParticles = 50;
    
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 3 + 2;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * 2 - 1;
            this.life = 1;
            this.decay = Math.random() * 0.02 + 0.01;
            
            // Use primary color with gradient
            this.hue = Math.random() * 30 + 20; // Orange/brown hues (20-50)
            this.saturation = Math.random() * 30 + 60; // 60-90%
            this.lightness = Math.random() * 20 + 50; // 50-70%
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life -= this.decay;
            this.size *= 0.97;
        }
        
        draw() {
            ctx.save();
            ctx.globalAlpha = this.life;
            
            // Create gradient for each particle
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.size
            );
            gradient.addColorStop(0, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, 1)`);
            gradient.addColorStop(0.5, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness - 10}%, 0.5)`);
            gradient.addColorStop(1, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness - 20}%, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    // Mouse position
    let mouseX = 0;
    let mouseY = 0;
    let isMoving = false;
    let moveTimeout;
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMoving = true;
        
        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(() => {
            isMoving = false;
        }, 100);
        
        // Create new particles
        if (particles.length < maxParticles) {
            for (let i = 0; i < 2; i++) {
                particles.push(new Particle(mouseX, mouseY));
            }
        }
    });
    
    // Animation loop
    function animate() {
        // Clear canvas completely (transparent)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            
            // Remove dead particles
            if (particles[i].life <= 0 || particles[i].size <= 0.5) {
                particles.splice(i, 1);
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Optional: Add cursor glow effect
    const cursorGlow = document.createElement('div');
    cursorGlow.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(210, 105, 30, 0.4) 0%, rgba(210, 105, 30, 0) 70%);
        pointer-events: none;
        z-index: 9998;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s ease;
        opacity: 0;
    `;
    document.body.appendChild(cursorGlow);
    
    document.addEventListener('mousemove', function(e) {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
        cursorGlow.style.opacity = '1';
    });
    
    document.addEventListener('mouseleave', function() {
        cursorGlow.style.opacity = '0';
    });
});
