
let cartCount = 0;

// Function to create toast notification
function showToastNotification(productName) {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  // Create toast element
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
  
  // Trigger animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Function to update cart count display
function updateCartCount() {
  const cartLink = document.querySelector('.cart-link');
  if (cartLink) {
    const countBadge = cartLink.querySelector('.cart-badge');
    if (countBadge) {
      countBadge.textContent = cartCount;
      countBadge.classList.add('show');
    } else if (cartCount > 0) {
      // Create badge if it doesn't exist
      const badge = document.createElement('span');
      badge.className = 'cart-badge show';
      badge.textContent = cartCount;
      cartLink.appendChild(badge);
    }
  }
}

// Main add to cart animation function
function addToCartWithAnimation(button, productId) {
  // Prevent multiple clicks
  if (button.classList.contains('adding')) return;
  
  button.classList.add('adding');
  const card = button.closest('.watch-card');
  const productImage = card.querySelector('.watch-image img');
  const productName = card.querySelector('.watch-title').textContent;
  const cartLink = document.querySelector('.cart-link');
  
  if (!productImage || !cartLink) {
    console.error('Required elements not found');
    button.classList.remove('adding');
    return;
  }

  // Get positions
  const imageRect = productImage.getBoundingClientRect();
  const cartRect = cartLink.getBoundingClientRect();
  
  // Create flying image clone
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
  
  // Clone the image
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
  
  // Trigger animation on next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Move to cart
      flyingImage.style.left = `${cartRect.left + cartRect.width / 2}px`;
      flyingImage.style.top = `${cartRect.top + cartRect.height / 2}px`;
      flyingImage.style.opacity = '0';
      flyingImage.style.transform = 'translate(-50%, -50%) scale(0.1)';
    });
  });

  // Animate cart icon bounce and show notification
  setTimeout(() => {
    cartLink.style.animation = 'cartBounce 0.5s ease';
    cartCount++;
    updateCartCount();
    
    // Show toast notification
    showToastNotification(productName);
    
    setTimeout(() => {
      cartLink.style.animation = '';
    }, 500);
  }, 600);

  // Clean up and reset button
  setTimeout(() => {
    flyingImage.remove();
    button.textContent = 'ADDED ✓';
    button.style.background = '#00b894';
    button.classList.remove('adding');
    
    // Reset button after delay
    setTimeout(() => {
      button.textContent = 'ADD TO CART';
      button.style.background = '';
    }, 2000);
  }, 800);

  // Add success particles effect
  createParticles(button);
}

// Particle effect for extra flair
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

// Update the renderProducts function to include the animation
// Replace the button onclick with this:
function renderProductsWithAnimation(productsToShow) {
  const grid = document.getElementById('catalogGrid');
  const noResults = document.getElementById('noResults');
  const resultsCount = document.getElementById('resultsCount');

  if (productsToShow.length === 0) {
    grid.style.display = 'none';
    noResults.style.display = 'block';
    resultsCount.textContent = '';
    return;
  }

  grid.style.display = 'grid';
  noResults.style.display = 'none';
  resultsCount.textContent = `Showing ${productsToShow.length} watch${productsToShow.length !== 1 ? 'es' : ''}`;

  grid.innerHTML = productsToShow.map(product => {
    const stars = '★'.repeat(product.rating) + (product.rating < 5 ? '<span class="star-empty">★</span>'.repeat(5 - product.rating) : '');
    const stockClass = !product.inStock ? 'out-of-stock' : '';
    
    return `
      <article class="watch-card ${stockClass}" onclick="window.location.href='${product.buyLink}'">
        <div class="watch-image">
          ${!product.inStock ? '<div class="stock-badge">Out of Stock</div>' : ''}
          <img src="${product.image}" alt="${product.name}" onerror="this.src='${product.fallbackImage}'" />
        </div>
        <div class="watch-info">
          <h3 class="watch-title">${product.name}</h3>
          <p class="watch-description">${product.description}</p>
          <div class="rating">${stars}</div>
          <p class="watch-price">
            PHP ${product.price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            ${product.onSale ? '<span class="sale-badge">SALE</span>' : ''}
          </p>
          <button 
            class="add-to-cart-btn" 
            ${!product.inStock ? 'disabled' : ''} 
            onclick="event.stopPropagation(); ${product.inStock ? `addToCartWithAnimation(this, ${product.id})` : ''}"
          >
            ${product.inStock ? 'ADD TO CART' : 'OUT OF STOCK'}
          </button>
        </div>
      </article>
    `;
  }).join('');
}