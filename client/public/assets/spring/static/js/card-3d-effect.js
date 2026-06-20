// 3D Card Effect on Mouse Move
document.addEventListener('DOMContentLoaded', function() {
    // Select all product cards and feature cards
    const cards = document.querySelectorAll('.product-card, .feature-card, .category-card, .card-3d, .card-modern');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);
    });
    
    function handleMouseMove(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        
        // Calculate mouse position relative to card center
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate rotation angles (max 15 degrees)
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        
        // Apply 3D transform
        card.style.transform = `
            perspective(1000px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            translateY(-10px)
            scale3d(1.02, 1.02, 1.02)
        `;
        
        // Add subtle shadow based on rotation
        const shadowX = rotateY * 2;
        const shadowY = -rotateX * 2;
        card.style.boxShadow = `
            ${shadowX}px ${shadowY}px 40px rgba(0, 0, 0, 0.2),
            0 10px 20px rgba(0, 0, 0, 0.1)
        `;
    }
    
    function handleMouseLeave(e) {
        const card = e.currentTarget;
        
        // Reset transform with smooth transition
        card.style.transform = `
            perspective(1000px)
            rotateX(0deg)
            rotateY(0deg)
            translateY(0)
            scale3d(1, 1, 1)
        `;
        
        // Reset shadow
        card.style.boxShadow = '';
    }
});
