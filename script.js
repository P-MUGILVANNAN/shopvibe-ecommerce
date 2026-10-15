/**
 * Basic E-Commerce Website
 * Vanilla JavaScript (ES6)
 * Fake Store API: https://fakestoreapi.com/products
 * LocalStorage Keys: ecommerce_cart, ecommerce_orders, ecommerce_user
 */

// ============================================================================
// Constants & Configuration
// ============================================================================
const API_BASE = 'https://fakestoreapi.com/products';
const STORAGE_KEYS = {
  CART: 'ecommerce_cart',
  ORDERS: 'ecommerce_orders',
  USER: 'ecommerce_user',
};

// Exchange rate or conversion to Indian Rupees (Fake Store API gives USD)
const USD_TO_INR = 80;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format price in Indian Rupees (INR) using Intl.NumberFormat
 * @param {number} priceInUSD 
 * @returns {string} Formatted currency string
 */
function formatPrice(priceInUSD) {
  const inrAmount = priceInUSD * USD_TO_INR;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(inrAmount);
}

/**
 * Generate star rating markup
 * @param {number} rate - Rating score (0-5)
 * @param {number} count - Total review count
 * @returns {string} HTML string
 */
function renderRatingStars(rate = 0, count = 0) {
  const rounded = Math.round(rate);
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += i <= rounded ? '★' : '☆';
  }
  return `
    <div class="product-rating">
      <span class="rating-stars">${stars}</span>
      <span class="rating-count">(${rate.toFixed(1)} / ${count})</span>
    </div>
  `;
}

/**
 * Escape HTML to prevent basic script injection
 * @param {string} str 
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Show a toast notification
 * @param {string} message 
 * @param {'success'|'danger'|'info'} type 
 */
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'danger' ? '⚠️' : '✓'}</span>
    <div>${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// ============================================================================
// LocalStorage Cart Management
// ============================================================================

/**
 * Retrieve cart items from LocalStorage
 * @returns {Array} Array of cart items
 */
function getCart() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CART);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error reading cart from LocalStorage:', err);
    return [];
  }
}

/**
 * Save cart items to LocalStorage and update nav count
 * @param {Array} cart 
 */
function saveCart(cart) {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    updateNavCartBadge();
  } catch (err) {
    console.error('Error saving cart to LocalStorage:', err);
  }
}

/**
 * Calculate total number of items in cart
 * @returns {number}
 */
function getCartCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.quantity || 1), 0);
}

/**
 * Update the cart badge count in the navigation bar
 */
function updateNavCartBadge() {
  const badge = document.getElementById('nav-cart-count');
  if (!badge) return;

  const count = getCartCount();
  badge.textContent = count;
  
  // Quick bump animation
  badge.classList.remove('bump');
  void badge.offsetWidth; // trigger reflow
  badge.classList.add('bump');
}

/**
 * Add a product to the cart
 * @param {Object} product 
 * @param {number} quantity 
 */
function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existingIndex = cart.findIndex((item) => Number(item.id) === Number(product.id));

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: Number(product.id),
      title: product.title,
      price: Number(product.price),
      image: product.image,
      category: product.category,
      quantity: Number(quantity) || 1,
    });
  }

  saveCart(cart);
  showToast(`Added <strong>${escapeHtml(product.title.slice(0, 24))}...</strong> to cart!`);
}

/**
 * Update quantity of a cart item (+1 or -1)
 * @param {number} productId 
 * @param {number} delta 
 */
function updateCartQuantity(productId, delta) {
  let cart = getCart();
  const itemIndex = cart.findIndex((item) => Number(item.id) === Number(productId));

  if (itemIndex > -1) {
    cart[itemIndex].quantity += delta;
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
      showToast('Item removed from cart', 'info');
    }
    saveCart(cart);
    renderCartPage();
  }
}

/**
 * Remove an item completely from the cart
 * @param {number} productId 
 */
function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter((item) => Number(item.id) !== Number(productId));
  saveCart(cart);
  showToast('Item removed from cart', 'info');
  renderCartPage();
}

/**
 * Clear all items from the cart
 */
function clearCart() {
  if (confirm('Are you sure you want to clear your cart?')) {
    saveCart([]);
    renderCartPage();
    showToast('Shopping cart cleared', 'info');
  }
}

// ============================================================================
// Common UI & Navigation Setup
// ============================================================================

function initNavbar() {
  updateNavCartBadge();

  const toggleBtn = document.getElementById('nav-toggle-btn');
  const navLinks = document.getElementById('nav-links-menu');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
}

// ============================================================================
// Page 1: Home Page (index.html)
// ============================================================================

async function initHomePage() {
  const productContainer = document.getElementById('featured-products-container');
  if (!productContainer) return;

  try {
    productContainer.innerHTML = `
      <div class="loading-container" style="grid-column: 1 / -1;">
        <div class="spinner"></div>
        <p>Loading top picks from Fake Store API...</p>
      </div>
    `;

    const response = await fetch(`${API_BASE}?limit=8`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const products = await response.json();
    renderProductCards(products, productContainer);
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
    productContainer.innerHTML = `
      <div class="error-container" style="grid-column: 1 / -1;">
        <h3>Oops! Failed to load products.</h3>
        <p>Please check your internet connection and try again.</p>
        <button class="btn btn-primary" onclick="initHomePage()">Retry</button>
      </div>
    `;
  }
}

// ============================================================================
// Page 2: Products Page (products.html)
// ============================================================================

let allProductsCache = [];
let activeCategory = 'all';

async function initProductsPage() {
  const container = document.getElementById('all-products-container');
  const searchInput = document.getElementById('product-search-input');
  const sortSelect = document.getElementById('product-sort-select');
  const categoryContainer = document.getElementById('category-pills-container');

  if (!container) return;

  try {
    container.innerHTML = `
      <div class="loading-container" style="grid-column: 1 / -1;">
        <div class="spinner"></div>
        <p>Fetching catalog from Fake Store API...</p>
      </div>
    `;

    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    allProductsCache = await response.json();

    // Check if category passed in URL (e.g. ?category=electronics)
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');
    if (categoryFromUrl) {
      activeCategory = categoryFromUrl.toLowerCase();
    }

    // Render category filter pills
    if (categoryContainer) {
      const categories = ['all', ...new Set(allProductsCache.map((p) => p.category))];
      categoryContainer.innerHTML = categories
        .map((cat) => `
          <button 
            type="button" 
            class="category-pill ${cat === activeCategory ? 'active' : ''}" 
            data-category="${escapeHtml(cat)}">
            ${escapeHtml(cat)}
          </button>
        `)
        .join('');

      categoryContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.category-pill');
        if (!btn) return;
        document.querySelectorAll('.category-pill').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.category;
        filterAndRenderProducts();
      });
    }

    // Search event
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        filterAndRenderProducts();
      });
    }

    // Sort event
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        filterAndRenderProducts();
      });
    }

    // Initial render
    filterAndRenderProducts();
  } catch (error) {
    console.error('Failed to load products:', error);
    container.innerHTML = `
      <div class="error-container" style="grid-column: 1 / -1;">
        <h3>Could not load product catalog.</h3>
        <p>There was an issue fetching data from the Fake Store API.</p>
        <button class="btn btn-primary" onclick="initProductsPage()">Retry</button>
      </div>
    `;
  }
}

function filterAndRenderProducts() {
  const container = document.getElementById('all-products-container');
  const searchInput = document.getElementById('product-search-input');
  const sortSelect = document.getElementById('product-sort-select');
  const countDisplay = document.getElementById('products-count');

  if (!container) return;

  const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const sortMode = sortSelect ? sortSelect.value : 'default';

  let filtered = allProductsCache.filter((product) => {
    const matchesCategory = activeCategory === 'all' || product.category.toLowerCase() === activeCategory;
    const matchesSearch = product.title.toLowerCase().includes(searchTerm) ||
                          product.description.toLowerCase().includes(searchTerm) ||
                          product.category.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  // Sorting
  if (sortMode === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortMode === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortMode === 'rating') {
    filtered.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
  }

  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} product${filtered.length === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🔍</div>
        <h3>No matching products found</h3>
        <p>Try searching for a different keyword or choose another category.</p>
        <button class="btn btn-secondary" onclick="resetFilters()">Clear Filters</button>
      </div>
    `;
    return;
  }

  renderProductCards(filtered, container);
}

function resetFilters() {
  const searchInput = document.getElementById('product-search-input');
  if (searchInput) searchInput.value = '';
  activeCategory = 'all';
  document.querySelectorAll('.category-pill').forEach((b) => {
    b.classList.toggle('active', b.dataset.category === 'all');
  });
  filterAndRenderProducts();
}

/**
 * Render an array of products into cards inside target container
 * @param {Array} products 
 * @param {HTMLElement} container 
 */
function renderProductCards(products, container) {
  container.innerHTML = products
    .map((product) => {
      const priceText = formatPrice(product.price);
      const ratingHtml = renderRatingStars(product.rating?.rate || 0, product.rating?.count || 0);

      return `
        <div class="product-card" data-id="${product.id}">
          <div class="product-image-container">
            <span class="product-category-tag">${escapeHtml(product.category)}</span>
            <a href="product-details.html?id=${product.id}">
              <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" class="product-image" loading="lazy">
            </a>
          </div>
          <div class="product-info">
            <h3 class="product-title">
              <a href="product-details.html?id=${product.id}" title="${escapeHtml(product.title)}">
                ${escapeHtml(product.title)}
              </a>
            </h3>
            ${ratingHtml}
            <div class="product-price-row">
              <span class="product-price">${priceText}</span>
            </div>
            <div class="card-actions">
              <a href="product-details.html?id=${product.id}" class="btn btn-secondary btn-sm" style="flex:1;">
                Details
              </a>
              <button 
                type="button" 
                class="btn btn-primary btn-sm add-to-cart-btn" 
                data-id="${product.id}" 
                style="flex:1;">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  // Attach Add to Cart event listeners
  container.querySelectorAll('.add-to-cart-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const id = Number(button.dataset.id);
      const found = products.find((p) => Number(p.id) === id) || allProductsCache.find((p) => Number(p.id) === id);
      if (found) {
        addToCart(found, 1);
      }
    });
  });
}

// ============================================================================
// Page 3: Product Details Page (product-details.html)
// ============================================================================

async function initProductDetailsPage() {
  const container = document.getElementById('product-details-container');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>No Product Selected</h3>
        <p>Please browse our store catalog and select a product.</p>
        <a href="products.html" class="btn btn-primary">Browse Products</a>
      </div>
    `;
    return;
  }

  try {
    container.innerHTML = `
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Loading product details...</p>
      </div>
    `;

    const response = await fetch(`${API_BASE}/${productId}`);
    if (!response.ok) {
      throw new Error(`Product not found (Status: ${response.status})`);
    }

    const product = await response.json();
    if (!product || !product.id) {
      throw new Error('Product not found');
    }

    // Set page title
    document.title = `${product.title} - Basic E-Commerce`;

    const breadcrumbCategory = document.getElementById('details-breadcrumb-cat');
    if (breadcrumbCategory) {
      breadcrumbCategory.textContent = product.category;
      breadcrumbCategory.href = `products.html?category=${encodeURIComponent(product.category)}`;
    }

    container.innerHTML = `
      <div class="details-wrapper">
        <div class="details-image-box">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" id="main-product-img">
        </div>
        <div class="details-info-box">
          <span class="details-category">${escapeHtml(product.category)}</span>
          <h1 class="details-title">${escapeHtml(product.title)}</h1>
          ${renderRatingStars(product.rating?.rate || 0, product.rating?.count || 0)}
          <div class="details-price">${formatPrice(product.price)}</div>
          <p class="details-description">${escapeHtml(product.description)}</p>
          
          <div class="details-actions">
            <div class="quantity-control">
              <button type="button" class="qty-btn" id="qty-decrease">-</button>
              <input type="number" id="detail-qty-input" class="qty-input" value="1" min="1" max="99">
              <button type="button" class="qty-btn" id="qty-increase">+</button>
            </div>
            <button type="button" class="btn btn-primary" id="detail-add-cart-btn" style="flex: 1; padding: 0.85rem 1.5rem;">
              🛒 Add to Cart
            </button>
            <button type="button" class="btn btn-secondary" id="detail-buy-now-btn" style="padding: 0.85rem 1.5rem;">
              ⚡ Buy Now
            </button>
          </div>

          <div style="margin-top: 1.5rem; font-size: 0.85rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.4rem;">
            <div>🚚 <strong>Free Shipping:</strong> On all orders above ₹499</div>
            <div>🔄 <strong>7 Days Return:</strong> Easy no-questions-asked returns</div>
            <div>🛡️ <strong>Secure Checkout:</strong> SSL encrypted demo payment</div>
          </div>
        </div>
      </div>
    `;

    // Quantity controls
    const qtyInput = document.getElementById('detail-qty-input');
    const btnDecrease = document.getElementById('qty-decrease');
    const btnIncrease = document.getElementById('qty-increase');
    const btnAddToCart = document.getElementById('detail-add-cart-btn');
    const btnBuyNow = document.getElementById('detail-buy-now-btn');

    btnDecrease.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      if (val > 1) qtyInput.value = val - 1;
    });

    btnIncrease.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = val + 1;
    });

    qtyInput.addEventListener('change', () => {
      let val = parseInt(qtyInput.value, 10);
      if (isNaN(val) || val < 1) qtyInput.value = 1;
    });

    btnAddToCart.addEventListener('click', () => {
      const qty = parseInt(qtyInput.value, 10) || 1;
      addToCart(product, qty);
    });

    btnBuyNow.addEventListener('click', () => {
      const qty = parseInt(qtyInput.value, 10) || 1;
      addToCart(product, qty);
      window.location.href = 'checkout.html';
    });

  } catch (error) {
    console.error('Error fetching product details:', error);
    container.innerHTML = `
      <div class="error-container">
        <h3>Could not load product details</h3>
        <p>${escapeHtml(error.message)}</p>
        <a href="products.html" class="btn btn-primary">Return to Catalog</a>
      </div>
    `;
  }
}

// ============================================================================
// Page 4: Cart Page (cart.html)
// ============================================================================

function initCartPage() {
  renderCartPage();
}

function renderCartPage() {
  const container = document.getElementById('cart-page-container');
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <h3>Your Shopping Cart is Empty</h3>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <a href="products.html" class="btn btn-primary">Start Shopping</a>
      </div>
    `;
    return;
  }

  let subtotalUSD = 0;
  const itemsHtml = cart
    .map((item) => {
      const itemSubtotal = item.price * item.quantity;
      subtotalUSD += itemSubtotal;

      return `
        <tr>
          <td>
            <div class="cart-item-info">
              <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" class="cart-item-img">
              <div>
                <a href="product-details.html?id=${item.id}" class="cart-item-title">
                  ${escapeHtml(item.title)}
                </a>
                <span class="cart-item-category">${escapeHtml(item.category || '')}</span>
              </div>
            </div>
          </td>
          <td class="cart-price-cell">${formatPrice(item.price)}</td>
          <td>
            <div class="quantity-control">
              <button type="button" class="qty-btn" onclick="updateCartQuantity(${item.id}, -1)">-</button>
              <span class="qty-input" style="display:flex;align-items:center;justify-content:center;">${item.quantity}</span>
              <button type="button" class="qty-btn" onclick="updateCartQuantity(${item.id}, 1)">+</button>
            </div>
          </td>
          <td class="cart-subtotal-cell">${formatPrice(itemSubtotal)}</td>
          <td style="text-align: right;">
            <button 
              type="button" 
              class="btn btn-danger btn-sm" 
              onclick="removeFromCart(${item.id})" 
              title="Remove product">
              ✕
            </button>
          </td>
        </tr>
      `;
    })
    .join('');

  const shippingUSD = 0; // Free demo shipping
  const grandTotalUSD = subtotalUSD + shippingUSD;

  container.innerHTML = `
    <div class="cart-layout">
      <div class="cart-items-box">
        <div class="cart-header-bar">
          <h2>Items in Your Cart (${getCartCount()})</h2>
          <button type="button" class="btn btn-outline btn-sm" onclick="clearCart()">Clear Cart</button>
        </div>
        <div class="cart-table-wrapper">
          <table class="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>
        <div class="cart-actions-row">
          <a href="products.html" class="btn btn-secondary">← Continue Shopping</a>
        </div>
      </div>

      <div class="cart-summary-box">
        <h3>Order Summary</h3>
        <div style="margin: 1.25rem 0;">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>${formatPrice(subtotalUSD)}</span>
          </div>
          <div class="summary-row">
            <span>Standard Shipping</span>
            <span style="color: var(--success-color); font-weight: 600;">FREE</span>
          </div>
          <div class="summary-row">
            <span>Estimated Tax</span>
            <span>${formatPrice(0)}</span>
          </div>
          <div class="summary-row total-row">
            <span>Grand Total</span>
            <span>${formatPrice(grandTotalUSD)}</span>
          </div>
        </div>

        <a href="checkout.html" class="btn btn-primary btn-block" style="padding: 0.9rem;">
          Proceed to Checkout →
        </a>

        <div style="margin-top: 1rem; text-align: center; font-size: 0.8rem; color: var(--text-muted);">
          🔒 Guaranteed Safe & Demo Checkout
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// Page 5: Checkout Page (checkout.html)
// ============================================================================

function initCheckoutPage() {
  const cart = getCart();
  const summaryItemsContainer = document.getElementById('checkout-items-list');
  const summaryTotalDisplay = document.getElementById('checkout-total-amount');
  const checkoutForm = document.getElementById('checkout-form');

  // If cart is empty, alert and redirect back to cart
  if (!cart || cart.length === 0) {
    const container = document.querySelector('.main-content .container');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <h3>Your Cart is Empty</h3>
          <p>Please add products to your cart before proceeding to checkout.</p>
          <a href="products.html" class="btn btn-primary">Browse Products</a>
        </div>
      `;
    }
    return;
  }

  // Populate Order Summary
  let totalUSD = 0;
  if (summaryItemsContainer) {
    summaryItemsContainer.innerHTML = cart
      .map((item) => {
        const itemTotal = item.price * item.quantity;
        totalUSD += itemTotal;
        return `
          <div class="preview-item">
            <div class="preview-item-info">
              <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" class="preview-item-img">
              <div>
                <div class="preview-item-text" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Qty: ${item.quantity} × ${formatPrice(item.price)}</div>
              </div>
            </div>
            <span style="font-weight: 600; font-size: 0.85rem;">${formatPrice(itemTotal)}</span>
          </div>
        `;
      })
      .join('');
  }

  if (summaryTotalDisplay) {
    summaryTotalDisplay.textContent = formatPrice(totalUSD);
  }

  // Auto-fill customer details from LocalStorage if available
  try {
    const savedUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
    if (savedUser) {
      if (document.getElementById('cust-name')) document.getElementById('cust-name').value = savedUser.name || '';
      if (document.getElementById('cust-email')) document.getElementById('cust-email').value = savedUser.email || '';
      if (document.getElementById('cust-phone')) document.getElementById('cust-phone').value = savedUser.phone || '';
      if (document.getElementById('cust-address')) document.getElementById('cust-address').value = savedUser.address || '';
      if (document.getElementById('cust-city')) document.getElementById('cust-city').value = savedUser.city || '';
      if (document.getElementById('cust-zip')) document.getElementById('cust-zip').value = savedUser.zip || '';
    }
  } catch (err) {
    console.error('Error pre-filling user data:', err);
  }

  // Handle Form Submission
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateCheckoutForm()) {
        return;
      }

      // Collect form data
      const customerData = {
        name: document.getElementById('cust-name').value.trim(),
        email: document.getElementById('cust-email').value.trim(),
        phone: document.getElementById('cust-phone').value.trim(),
        address: document.getElementById('cust-address').value.trim(),
        city: document.getElementById('cust-city').value.trim(),
        zip: document.getElementById('cust-zip').value.trim(),
      };

      const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'Cash on Delivery';

      // Save user profile for next time
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(customerData));

      // Generate Demo Order
      const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      const newOrder = {
        orderId: orderId,
        orderDate: new Date().toISOString(),
        customer: customerData,
        paymentMethod: paymentMethod,
        items: cart,
        totalUSD: totalUSD,
        totalINR: totalUSD * USD_TO_INR,
      };

      // Save order in ecommerce_orders
      try {
        const existingOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS)) || [];
        existingOrders.unshift(newOrder);
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(existingOrders));
      } catch (err) {
        console.error('Failed to save order in LocalStorage:', err);
      }

      // Clear Cart
      localStorage.removeItem(STORAGE_KEYS.CART);
      updateNavCartBadge();

      // Show Success Modal
      showOrderSuccessModal(orderId, customerData, newOrder.totalINR);
    });
  }
}

function validateCheckoutForm() {
  let isValid = true;

  const fields = [
    { id: 'cust-name', errorId: 'cust-name-error', validate: (v) => v.length >= 2 },
    { id: 'cust-email', errorId: 'cust-email-error', validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
    { id: 'cust-phone', errorId: 'cust-phone-error', validate: (v) => /^[0-9+\s-]{10,15}$/.test(v) },
    { id: 'cust-address', errorId: 'cust-address-error', validate: (v) => v.length >= 5 },
    { id: 'cust-city', errorId: 'cust-city-error', validate: (v) => v.length >= 2 },
    { id: 'cust-zip', errorId: 'cust-zip-error', validate: (v) => v.length >= 4 },
  ];

  fields.forEach(({ id, errorId, validate }) => {
    const input = document.getElementById(id);
    const errSpan = document.getElementById(errorId);
    if (!input) return;

    if (!validate(input.value.trim())) {
      input.classList.add('error');
      if (errSpan) errSpan.classList.add('show');
      isValid = false;
    } else {
      input.classList.remove('error');
      if (errSpan) errSpan.classList.remove('show');
    }
  });

  return isValid;
}

function showOrderSuccessModal(orderId, customer, totalINR) {
  const modal = document.getElementById('order-success-modal');
  const orderIdSpan = document.getElementById('success-order-id');
  const custNameSpan = document.getElementById('success-cust-name');
  const totalSpan = document.getElementById('success-order-total');

  if (orderIdSpan) orderIdSpan.textContent = orderId;
  if (custNameSpan) custNameSpan.textContent = customer.name;
  if (totalSpan) {
    totalSpan.textContent = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(totalINR);
  }

  if (modal) {
    modal.classList.add('open');
  }
}

// ============================================================================
// Initialization on DOMContentLoaded
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();

  // Detect which page is loaded via elements or URL pathname
  if (document.getElementById('featured-products-container')) {
    initHomePage();
  } else if (document.getElementById('all-products-container')) {
    initProductsPage();
  } else if (document.getElementById('product-details-container')) {
    initProductDetailsPage();
  } else if (document.getElementById('cart-page-container')) {
    initCartPage();
  } else if (document.getElementById('checkout-form')) {
    initCheckoutPage();
  } else {
    // Fallback based on pathname
    const path = window.location.pathname.toLowerCase();
    if (path.endsWith('products.html')) {
      initProductsPage();
    } else if (path.endsWith('product-details.html')) {
      initProductDetailsPage();
    } else if (path.endsWith('cart.html')) {
      initCartPage();
    } else if (path.endsWith('checkout.html')) {
      initCheckoutPage();
    } else {
      initHomePage();
    }
  }
});
