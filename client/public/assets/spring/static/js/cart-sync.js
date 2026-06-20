/**
 * Cart Sync Handler - YAME BEHAVIOR (Updated)
 * Cart is NOT synced with server for ANY user (guests + authenticated)
 * Each browser has its own independent cart (localStorage only)
 * 
 * BEHAVIOR:
 * - Guest users: localStorage cart
 * - Authenticated users: localStorage cart (NOT database)
 * - Different browsers = different carts (even same account)
 * - Cart only exists in localStorage (never saved to database)
 */

(function() {
    'use strict';
    
    console.log('Cart sync disabled - Yame behavior: localStorage only for ALL users (guests + authenticated)');
    
    // Yame behavior: Cart is browser-specific for everyone
    // - Different browsers = different carts
    // - Same account, different browsers = different carts  
    // - Cart only exists in localStorage (not in database)
    // - Authenticated users do NOT get database cart sync
    
    // Update cart badge on page load
    document.addEventListener('DOMContentLoaded', function() {
        if (window.CartManager) {
            CartManager.updateCartBadge();
            console.log('Cart badge updated from localStorage (all users)');
        }
    });
    
})();
