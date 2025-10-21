// cart-sync.js - Shared cart functionality across all pages
// This replaces cart-animation.js with localStorage support

// Initialize cart from localStorage
let cart = JSON.parse(localStorage.getItem('easywatch_cart') || '[]');
let cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('easywatch_cart', JSON.stringify(cart));
  updateCartCount();
  updateCartBadge();
}

// Add item to cart
function addToCart(productId, productName, productPrice, productImage) {
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({
      id: productId,
      name: productName,
      price: productPrice,
      image: productImage,
      qty: 1
    });
  }
  
  cartCount++;
  saveCart();
  showToastNotification(productName);
}

// Update cart count display
function updateCartCount() {
  cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartBadges = document.querySelectorAll('.cart-badge, .cart-count');
  cartBadges.forEach(badge => {
    badge.textContent = cartCount > 0 ? cartCount : '0';
    if (badge.classList.contains('cart-badge')) {
      badge.classList.toggle('show', cartCount > 0);
    }
  });
}

// Update cart badge in navigation
function updateCartBadge() {
  const cartLink = document.querySelector('.cart-link, .cart-btn');
  if (!cartLink) return;
  
  let badge = cartLink.querySelector('.cart-badge');
  if (!badge && cartCount > 0) {
    badge = document.createElement('span');
    badge.className = 'cart-badge show';
    cartLink.appendChild(badge);
  }
  
  if (badge) {
    badge.textContent = cartCount;
    badge.classList.toggle('show', cartCount > 0);
  }
}

// Toast notification
function showToastNotification(productName) {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <div class="toast-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6L9 17l-5-5"></path>
      </svg>
    </div>
    <div class="toast-content">
      <div class="toast-title">Added to cart!</div>
      <div class="toast-message">${productName}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;
  
  toastContainer.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Main add to cart animation function
function addToCartWithAnimation(button, productId) {
  if (button.classList.contains('adding')) return;
  
  button.classList.add('adding');
  const card = button.closest('.watch-card, .product-card');
  const productImage = card.querySelector('.watch-image img, .product-image img');
  const productName = card.querySelector('.watch-title, .product-title').textContent;
  const priceText = card.querySelector('.watch-price, .product-price').textContent;
  const productPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));
  const cartLink = document.querySelector('.cart-link, .cart-btn');
  
  if (!productImage || !cartLink) {
    console.error('Required elements not found');
    button.classList.remove('adding');
    return;
  }

  // Add to cart data
  addToCart(productId, productName, productPrice, productImage.src);

  // Get positions for animation
  const imageRect = productImage.getBoundingClientRect();
  const cartRect = cartLink.getBoundingClientRect();
  
  // Create flying image
  const flyingImage = document.createElement('div');
  flyingImage.className = 'flying-product';
  flyingImage.style.cssText = `
    position: fixed;
    width: ${imageRect.width * 0.3}px;
    height: ${imageRect.height * 0.3}px;
    left: ${imageRect.left + imageRect.width / 2}px;
    top: ${imageRect.top + imageRect.height / 2}px;
    transform: translate(-50%, -50%);
    z-index: 9999;
    pointer-events: none;
    transition: all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
    opacity: 1;
  `;
  
  const imgClone = productImage.cloneNode(true);
  imgClone.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.3);
  `;
  flyingImage.appendChild(imgClone);
  document.body.appendChild(flyingImage);

  // Animate button
  button.textContent = 'ADDING...';
  button.style.background = '#495667';
  
  // Trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      flyingImage.style.left = `${cartRect.left + cartRect.width / 2}px`;
      flyingImage.style.top = `${cartRect.top + cartRect.height / 2}px`;
      flyingImage.style.opacity = '0';
      flyingImage.style.transform = 'translate(-50%, -50%) scale(0.1)';
    });
  });

  // Animate cart icon
  setTimeout(() => {
    cartLink.style.animation = 'cartBounce 0.5s ease';
    setTimeout(() => cartLink.style.animation = '', 500);
  }, 600);

  // Clean up
  setTimeout(() => {
    flyingImage.remove();
    button.textContent = 'ADDED ✓';
    button.style.background = '#00b894';
    button.classList.remove('adding');
    
    setTimeout(() => {
      button.textContent = 'ADD TO CART';
      button.style.background = '';
    }, 2000);
  }, 800);

  createParticles(button);
}

// Particle effect
function createParticles(button) {
  const rect = button.getBoundingClientRect();
  const particleCount = 6;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'success-particle';
    particle.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: #00b894;
      border-radius: 50%;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top + rect.height / 2}px;
      pointer-events: none;
      z-index: 9998;
    `;
    document.body.appendChild(particle);
    
    const angle = (Math.PI * 2 * i) / particleCount;
    const velocity = 50 + Math.random() * 50;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;
    
    particle.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
    ], {
      duration: 600,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
    }).onfinish = () => particle.remove();
  }
}

// Cart badge animation keyframes (add to CSS)
const style = document.createElement('style');
style.textContent = `
  @keyframes cartBounce {
    0%, 100% { transform: scale(1); }
    25% { transform: scale(1.25) rotate(-5deg); }
    50% { transform: scale(0.95) rotate(5deg); }
    75% { transform: scale(1.15) rotate(-3deg); }
  }
  
  .cart-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #e74c3c;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    opacity: 0;
    transform: scale(0);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  
  .cart-badge.show {
    opacity: 1;
    transform: scale(1);
  }
  
  .cart-link, .cart-btn {
    position: relative;
  }
`;
document.head.appendChild(style);

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  updateCartBadge();
});