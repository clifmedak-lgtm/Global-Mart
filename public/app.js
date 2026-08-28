const storage = {
  cart: 'globalmart-cart',
  auth: 'globalmart-auth',
  user: 'globalmart-user',
};

const pageName = document.body.dataset.page || 'index';
let currentAuth = loadAuth();
let selectedCategory = 'all';

function loadAuth() {
  try { return JSON.parse(localStorage.getItem(storage.auth) || 'null'); } catch { return null; }
}

function saveAuth(auth) {
  localStorage.setItem(storage.auth, JSON.stringify(auth));
}

function clearAuth() {
  localStorage.removeItem(storage.auth);
}

// keep in-memory auth updated when saved/cleared
function setAuth(auth) {
  currentAuth = auth;
  if (auth) saveAuth(auth);
  else clearAuth();
}

function loadCart() {
  try { return JSON.parse(localStorage.getItem(storage.cart) || '[]'); } catch { return []; }
}

function saveCart(items) {
  localStorage.setItem(storage.cart, JSON.stringify(items));
}

function formatMoney(value) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 })
    .format(value);
}

function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (currentAuth?.token) headers.Authorization = `Bearer ${currentAuth.token}`;
  return fetch(path, { ...options, headers }).then(async response => {
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err = new Error(body?.message || 'API error');
      err.body = body;
      throw err;
    }
    return body;
  });
}

function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function setUserDisplay() {
  const accountButton = document.getElementById('account-button');
  const mobileAccountButton = document.getElementById('mobile-account-button');
  const label = currentAuth?.user ? `Hi, ${currentAuth.user.fullName.split(' ')[0]}` : 'Sign in';
  if (accountButton) {
    accountButton.textContent = label;
    accountButton.href = 'account.html';
  }
  if (mobileAccountButton) {
    mobileAccountButton.textContent = label;
    mobileAccountButton.href = 'account.html';
  }
}

function updateCartCounter() {
  const count = loadCart().reduce((sum, item) => sum + item.quantity, 0);
  const cartCount = document.getElementById('cart-count');
  if (cartCount) cartCount.textContent = String(count);
}

function toggleCartDrawer(open) {
  const drawer = document.getElementById('cart-drawer');
  if (!drawer) return;
  if (open) {
    drawer.classList.remove('hidden');
    drawer.classList.add('open');
    drawer.removeAttribute('aria-hidden');
  } else {
    drawer.classList.remove('open');
    drawer.classList.add('hidden');
    drawer.setAttribute('aria-hidden', 'true');
  }
}

function renderCartItems() {
  const cartItems = loadCart();
  const container = document.getElementById('cart-items');
  const totalLabel = document.getElementById('cart-total');
  if (!container || !totalLabel) return;
  if (cartItems.length === 0) {
    container.innerHTML = '<p class="text-sm text-gray-500">Your cart is empty. Add products from the store.</p>';
    totalLabel.textContent = '0 CFA';
    return;
  }

  container.innerHTML = '';
  let total = 0;
  cartItems.forEach((item, index) => {
    total += item.price * item.quantity;
    const row = document.createElement('div');
    row.className = 'rounded-3xl border border-gray-200 p-4 mb-4';
    const imgHtml = item.image
      ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="w-16 h-16 rounded-2xl object-cover flex-shrink-0">`
      : `<div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-2xl">📦</div>`;
    row.innerHTML = `
      <div class="flex items-start gap-4">
        ${imgHtml}
        <div class="flex-1 flex items-start justify-between gap-2">
          <div>
            <p class="text-xs text-gray-500">${escapeHtml(item.vendor)}</p>
            <h3 class="font-semibold text-gray-900 text-sm leading-tight">${escapeHtml(item.name)}</h3>
            <p class="mt-1 text-xs text-gray-500">Qty: ${item.quantity}</p>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="font-semibold text-gray-900 text-sm">${formatMoney(item.price * item.quantity)}</p>
            <button data-id="${escapeHtml(item.id)}" class="remove-cart-item mt-2 text-xs text-red-600 hover:text-red-800">Remove</button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(row);
  });


  totalLabel.textContent = formatMoney(total);
  // delegate removal to container
  container.querySelectorAll('.remove-cart-item').forEach(button => {
    button.addEventListener('click', event => {
      const id = event.currentTarget.dataset.id;
      if (!id) return;
      const items = loadCart();
      const newItems = items.filter(it => String(it.id) !== String(id));
      saveCart(newItems);
      renderCartItems();
      updateCartCounter();
    });
  });
}

function addToCart(product) {
  const items = loadCart();
  const existing = items.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    items.push({ ...product, quantity: 1 });
  }
  saveCart(items);
  updateCartCounter();
  renderCartItems();
}

function uploadImage(file) {
  if (!file) return Promise.reject(new Error('No file provided'));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      apiFetch('/api/upload/image', {
        method: 'POST',
        body: JSON.stringify({ image: reader.result })
      }).then(resolve).catch(reject);
    };
    reader.onerror = () => reject(new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });
}
function renderProductCard(product) {
  const name = escapeHtml(product.name);
  const vendor = escapeHtml(product.vendor);
  const description = escapeHtml(product.description);
  const image = escapeHtml(product.image || '');
  const id = escapeHtml(product.id);
  const imageHtml = image
    ? `<img loading="lazy" src="${image}" alt="${name}" class="h-64 w-full object-cover transition duration-500 group-hover:scale-105">`
    : `<div class="h-64 w-full bg-gray-100 flex items-center justify-center text-4xl text-gray-400">📦</div>`;

  return `
    <article class="group rounded-3xl overflow-hidden bg-white shadow-sm transition hover:shadow-lg">
      <a href="product.html?id=${product.id}" class="block">
        ${imageHtml}
      </a>
      <div class="p-5">
        <a href="product.html?id=${id}" class="text-sm text-gray-500 hover:text-blue-600">${vendor}</a>
        <h3 class="mt-3 text-lg font-semibold text-gray-900"><a href="product.html?id=${id}">${name}</a></h3>
        <p class="mt-2 text-sm text-gray-500 line-clamp-3">${description}</p>
        <div class="mt-4 flex items-center justify-between gap-2">
          <div>
            <span class="text-lg font-extrabold text-blue-600">${formatMoney(product.price)}</span>
            ${product.rating ? `<span class="ml-2 text-xs text-yellow-600">${product.rating.toFixed(1)} ★</span>` : ''}
          </div>
          <button data-id="${id}" class="add-cart-btn rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">Add</button>
        </div>
      </div>
    </article>
  `;
}

// Use event delegation for product list buttons to handle dynamic content and fewer listeners
function initProductListDelegation() {
  const productsList = document;
  productsList.addEventListener('click', async (event) => {
    const btn = event.target.closest('.add-cart-btn, .add-cart');
    if (!btn) return;
    event.preventDefault();
    try {
      const id = btn.dataset.id;
      if (id) {
        const product = await apiFetch(`/api/products?id=${encodeURIComponent(id)}`);
        addToCart(product);
      }
      if (document.getElementById('cart-drawer')) toggleCartDrawer(true);
    } catch (err) {
      console.error('Add to cart failed', err);
      alert(err.body?.message || err.message || 'Unable to add to cart');
    }
  });
}

function updateCategoryButtons(activeCategory) {
  document.querySelectorAll('.category-filter, .category-filter-btn').forEach(btn => {
    const category = btn.dataset.category;
    const selected = category === activeCategory;
    btn.classList.toggle('bg-blue-600', selected);
    btn.classList.toggle('text-white', selected);
    btn.classList.toggle('border-blue-600', selected);
    btn.classList.toggle('bg-white', !selected);
    btn.classList.toggle('text-gray-700', !selected);
  });
}

async function loadProducts(listNode, searchInput, category = 'all') {
  const query = searchInput?.value?.trim().toLowerCase() || '';
  const categoryQuery = category !== 'all' ? `&category=${encodeURIComponent(category)}` : '';
  const priceMin = document.getElementById('price-min-input')?.value;
  const priceMax = document.getElementById('price-max-input')?.value;
  const priceQuery = `${priceMin ? `&priceMin=${encodeURIComponent(priceMin)}` : ''}${priceMax ? `&priceMax=${encodeURIComponent(priceMax)}` : ''}`;
  let products = [];

  // Show skeleton while loading
  if (listNode) {
    listNode.innerHTML = Array(4).fill('').map(() => `
      <div class="animate-pulse rounded-3xl overflow-hidden bg-white shadow-sm">
        <div class="h-64 w-full bg-gray-200"></div>
        <div class="p-5 space-y-3">
          <div class="h-3 bg-gray-200 rounded w-1/3"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 rounded w-full"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3"></div>
          <div class="h-10 bg-gray-200 rounded-full mt-4"></div>
        </div>
      </div>
    `).join('');
  }

  try {
    // Server handles both search and category filtering — no need to filter again on client
    products = await apiFetch(`/api/products?search=${encodeURIComponent(query)}${categoryQuery}${priceQuery}`);
  } catch (err) {
    if (listNode) listNode.innerHTML = '<div class="col-span-full rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-red-500">Unable to load products.</div>';
    return;
  }

  if (!listNode) return;
  if (products.length === 0) {
    listNode.innerHTML = '<div class="col-span-full rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">No products matched your search.</div>';
    return;
  }

  listNode.innerHTML = products.map(renderProductCard).join('');
}

function clearChildren(id) {
  const node = document.getElementById(id);
  if (node) node.innerHTML = '';
}

function attachCategoryFilters() {
  document.querySelectorAll('.category-filter').forEach(btn => {
    btn.addEventListener('click', async () => {
      const category = btn.dataset.category || 'all';
      selectedCategory = category;
      updateCategoryButtons(category);
      await loadProducts(document.getElementById('products-list'), document.getElementById('search-input'), category);
      await loadRecommendations(document.getElementById('recommendations-list'), category);
    });
  });
}

async function loadRecommendations(node, category = 'all') {
  if (!node) return;
  try {
    const query = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
    const recommended = await apiFetch(`/api/recommendations${query}`);
    node.innerHTML = recommended.map(product => renderProductCard(product)).join('');
  } catch {
    node.innerHTML = '<div class="col-span-full rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Recommendations are unavailable.</div>';
  }
}

async function initIndexPage() {
  attachCategoryFilters();
  // debounce search input
  const searchInput = document.getElementById('search-input');
  const debounce = (fn, wait = 250) => {
    let t = null;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  };
  searchInput?.addEventListener('input', debounce(async () => {
    await loadProducts(document.getElementById('products-list'), document.getElementById('search-input'), selectedCategory);
  }, 200));
  const rerunSearch = debounce(async () => {
    await loadProducts(document.getElementById('products-list'), document.getElementById('search-input'), selectedCategory);
  }, 300);
  document.getElementById('price-min-input')?.addEventListener('input', rerunSearch);
  document.getElementById('price-max-input')?.addEventListener('input', rerunSearch);
  document.getElementById('refresh-recommendations')?.addEventListener('click', async () => {
    await loadRecommendations(document.getElementById('recommendations-list'), selectedCategory);
  });
  if (window.location.protocol !== 'file:') {
    await loadProducts(document.getElementById('products-list'), document.getElementById('search-input'), selectedCategory);
    await loadRecommendations(document.getElementById('recommendations-list'), selectedCategory);
    await loadProducts(document.getElementById('ps5-list'), null, 'consoles');
    await loadProducts(document.getElementById('android-list'), null, 'android');
    await loadProducts(document.getElementById('iphone-list'), null, 'iphone');
    await loadProducts(document.getElementById('cases-list'), null, 'cases');
    await loadFlashSale();
  } else {
    console.log('Running locally without a server. Using hardcoded HTML layout.');
  }
}

async function loadFlashSale() {
  const node = document.getElementById('flash-sale-list');
  if (!node) return;
  try {
    const products = await apiFetch('/api/recommendations');
    node.innerHTML = products.slice(0, 4).map(renderProductCard).join('');
  } catch (err) {
    node.innerHTML = '<div class="col-span-full text-center text-sm text-red-500">Unable to load deals.</div>';
  }
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function initProductPage() {
  const productId = getQueryParam('id');
  const detailNode = document.getElementById('product-detail');
  if (!detailNode) return;
  if (!productId) {
    detailNode.innerHTML = '<p class="text-center text-sm text-red-600">Product not found.</p>';
    return;
  }
  try {
   const product = await apiFetch(`/api/products?id=${encodeURIComponent(productId)}`);
    const imageHtml = product.image
      ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="h-96 w-full object-cover">`
      : `<div class="h-96 w-full bg-gray-100 flex items-center justify-center text-6xl text-gray-400">📦</div>`;

    detailNode.innerHTML = `
      <div class="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
        <div class="overflow-hidden rounded-3xl bg-white shadow-sm">
          ${imageHtml}
        </div>
        <div class="space-y-6">
          <div class="rounded-3xl bg-white p-6 shadow-sm">
            <span class="badge-pill bg-blue-50 text-blue-700">${escapeHtml(product.category)}</span>
            <h1 class="mt-4 text-3xl font-bold text-slate-900">${escapeHtml(product.name)}</h1>
            <p class="mt-3 text-sm text-slate-500">${escapeHtml(product.description)}</p>
            <div class="mt-6 flex items-center gap-4">
              <span class="text-3xl font-extrabold text-blue-600">${formatMoney(product.price)}</span>
              ${product.rating ? `<span class="text-sm text-yellow-600">${product.rating.toFixed(1)} ★</span>` : ''}
            </div>
            <div class="mt-6 flex flex-wrap gap-3">
              <button id="product-add-cart" class="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition">Add to cart</button>
              <button id="view-cart-button" class="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:border-blue-600 hover:text-blue-600 transition">View cart</button>
              <button id="wishlist-toggle" class="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:border-pink-500 hover:text-pink-600 transition">🤍 Save</button>
            </div>
          </div>
          <div class="rounded-3xl bg-white p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-slate-900">Vendor details</h2>
            <p class="mt-3 text-sm text-slate-500">Sold by <strong>${escapeHtml(product.vendor)}</strong>. Secure payment, verified seller of electronics and accessories.</p>
          </div>
        </div>
      </div>
      <div id="product-reviews" class="mt-10 rounded-3xl bg-white p-6 shadow-sm"></div>
    `;
    document.getElementById('product-add-cart')?.addEventListener('click', () => {
      addToCart(product);
      toggleCartDrawer(true);
    });
    document.getElementById('view-cart-button')?.addEventListener('click', () => {
      toggleCartDrawer(true);
    });
    initWishlistButton(productId);
    initProductReviews(productId);
    await loadRecommendations(document.getElementById('recommendations-list'));
  } catch (error) {
    detailNode.innerHTML = '<p class="text-center text-sm text-red-600">Unable to load product details.</p>';
    console.error(error);
  }
}

async function initWishlistButton(productId) {
  const btn = document.getElementById('wishlist-toggle');
  if (!btn) return;

  if (!currentAuth?.token) {
    btn.addEventListener('click', () => {
      window.location.href = 'account.html';
    });
    return;
  }

  let isSaved = false;
  try {
    const wishlist = await apiFetch('/api/wishlist');
    isSaved = wishlist.some(p => p.id === productId);
  } catch (err) {
    // If this fails, leave the button in its default (not saved) state — non-critical.
  }

  const render = () => {
    btn.textContent = isSaved ? '❤️ Saved' : '🤍 Save';
  };
  render();

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    try {
      if (isSaved) {
        await apiFetch(`/api/wishlist/${encodeURIComponent(productId)}`, { method: 'DELETE' });
      } else {
        await apiFetch(`/api/wishlist/${encodeURIComponent(productId)}`, { method: 'POST' });
      }
      isSaved = !isSaved;
      render();
    } catch (err) {
      alert(err.body?.message || err.message || 'Something went wrong.');
    } finally {
      btn.disabled = false;
    }
  });
}

function renderStars(rating) {
  const full = Math.round(rating || 0);
  return Array.from({ length: 5 }, (_, i) => i < full ? '★' : '☆').join('');
}

async function initProductReviews(productId) {
  const container = document.getElementById('product-reviews');
  if (!container) return;

  async function renderReviews() {
    let data;
    try {
      data = await apiFetch(`/api/products/${encodeURIComponent(productId)}/reviews`);
    } catch (err) {
      container.innerHTML = '<p class="text-sm text-red-600">Unable to load reviews.</p>';
      return;
    }

    const summaryHtml = data.summary.count
      ? `<div class="flex items-center gap-2 mb-6">
           <span class="text-2xl text-yellow-500">${renderStars(data.summary.average)}</span>
           <span class="text-sm text-slate-600">${data.summary.average.toFixed(1)} out of 5 (${data.summary.count} review${data.summary.count > 1 ? 's' : ''})</span>
         </div>`
      : '<p class="text-sm text-slate-500 mb-6">No reviews yet — be the first to review this product.</p>';

    const reviewsHtml = data.reviews.map(r => `
      <div class="border-b border-slate-100 py-4 last:border-0">
        <div class="flex items-center gap-2">
          <span class="text-yellow-500">${renderStars(r.rating)}</span>
          <span class="text-sm font-semibold text-slate-900">${escapeHtml(r.reviewerName)}</span>
          ${r.verifiedPurchase ? '<span class="text-xs text-green-600 bg-green-50 rounded-full px-2 py-0.5">Verified purchase</span>' : ''}
        </div>
        ${r.comment ? `<p class="mt-2 text-sm text-slate-600">${escapeHtml(r.comment)}</p>` : ''}
        <p class="mt-1 text-xs text-slate-400">${new Date(r.createdAt).toLocaleDateString()}</p>
      </div>
    `).join('');

    const formHtml = currentAuth?.token ? `
      <form id="review-form" class="mt-6 rounded-2xl border border-slate-200 p-4 space-y-3">
        <p class="text-sm font-semibold text-slate-900">Leave a review</p>
        <div class="flex gap-1" id="review-star-input">
          ${[1, 2, 3, 4, 5].map(n => `<button type="button" data-value="${n}" class="review-star text-2xl text-slate-300">★</button>`).join('')}
        </div>
        <input type="hidden" name="rating" required />
        <textarea name="comment" rows="3" placeholder="Optional comment..." class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"></textarea>
        <button type="submit" class="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">Submit review</button>
        <p id="review-form-status" class="text-sm"></p>
      </form>
    ` : `<p class="mt-6 text-sm text-slate-500"><a href="account.html" class="text-blue-600 underline">Sign in</a> to leave a review.</p>`;

    container.innerHTML = `<h2 class="text-lg font-semibold text-slate-900 mb-2">Customer reviews</h2>${summaryHtml}${reviewsHtml}${formHtml}`;

    const starButtons = container.querySelectorAll('.review-star');
    const ratingInput = container.querySelector('input[name="rating"]');
    starButtons.forEach(star => {
      star.addEventListener('click', () => {
        const value = parseInt(star.dataset.value);
        ratingInput.value = value;
        starButtons.forEach(s => {
          s.classList.toggle('text-yellow-500', parseInt(s.dataset.value) <= value);
          s.classList.toggle('text-slate-300', parseInt(s.dataset.value) > value);
        });
      });
    });

    container.querySelector('#review-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = container.querySelector('#review-form-status');
      if (!ratingInput.value) {
        status.textContent = 'Please select a star rating.';
        status.className = 'text-sm text-red-600';
        return;
      }
      try {
        await apiFetch(`/api/products/${encodeURIComponent(productId)}/reviews`, {
          method: 'POST',
          body: JSON.stringify({ rating: ratingInput.value, comment: e.target.querySelector('textarea[name="comment"]').value })
        });
        await renderReviews(); // refresh list + summary in place
      } catch (err) {
        status.textContent = err.body?.message || err.message || 'Failed to submit review.';
        status.className = 'text-sm text-red-600';
      }
    });
  }

  await renderReviews();
}

async function loadOrderHistory() {
  const ordersContainer = document.getElementById('order-history');
  if (!ordersContainer) return;
  if (!currentAuth?.token) {
    ordersContainer.innerHTML = '<p class="text-sm text-gray-500">Sign in to view your order history.</p>';
    return;
  }
  try {
    const orders = await apiFetch('/api/orders');
    if (orders.length === 0) {
      ordersContainer.innerHTML = '<p class="text-sm text-gray-500">No orders yet. Make a purchase to see your order history.</p>';
      return;
    }
    ordersContainer.innerHTML = orders.map(order => `
      <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm mb-4">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-sm text-gray-500">Order ID: ${order.id}</p>
            <p class="mt-2 text-lg font-semibold text-slate-900">${order.status}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">Placed ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p class="mt-2 text-lg font-semibold text-blue-600">${formatMoney(order.totalAmount)}</p>
          </div>
        </div>
        <div class="mt-4 grid gap-2 sm:grid-cols-2">
          ${order.items.map(item => `
            <div class="rounded-2xl bg-slate-50 p-4">
              <p class="text-sm font-semibold text-slate-900">${escapeHtml(item.product?.name || 'Product')}</p>
              <p class="mt-1 text-xs text-slate-500">Qty: ${item.quantity}</p>
              <p class="mt-2 text-sm text-slate-700">${formatMoney(item.price)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  } catch (error) {
    ordersContainer.innerHTML = '<p class="text-sm text-red-600">Unable to load orders at this time.</p>';
  }
}

async function loadWishlist() {
  const container = document.getElementById('wishlist-items');
  if (!container) return;
  if (!currentAuth?.token) {
    container.innerHTML = '<p class="text-sm text-gray-500">Sign in to view your wishlist.</p>';
    return;
  }
  try {
    const products = await apiFetch('/api/wishlist');
    if (products.length === 0) {
      container.innerHTML = '<p class="text-sm text-gray-500 col-span-full">No saved products yet. Tap 🤍 Save on any product to add it here.</p>';
      return;
    }
    container.innerHTML = products.map(p => `
      <div class="rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
        ${p.image ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" class="w-16 h-16 rounded-xl object-cover flex-shrink-0">` : '<div class="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0">📦</div>'}
        <div class="flex-1 min-w-0">
          <a href="product.html?id=${encodeURIComponent(p.id)}" class="text-sm font-semibold text-slate-900 hover:text-blue-600 truncate block">${escapeHtml(p.name)}</a>
          <p class="text-sm text-blue-600 font-semibold mt-1">${formatMoney(p.price)}</p>
        </div>
        <button data-remove-wishlist="${p.id}" class="text-slate-400 hover:text-red-600 text-lg flex-shrink-0" aria-label="Remove from wishlist">✕</button>
      </div>
    `).join('');

    container.querySelectorAll('[data-remove-wishlist]').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await apiFetch(`/api/wishlist/${encodeURIComponent(btn.dataset.removeWishlist)}`, { method: 'DELETE' });
          await loadWishlist();
        } catch (err) {
          alert(err.body?.message || err.message || 'Failed to remove item.');
        }
      });
    });
  } catch (error) {
    container.innerHTML = '<p class="text-sm text-red-600 col-span-full">Unable to load wishlist at this time.</p>';
  }
}

async function initAccountPage() {
  const authArea = document.getElementById('auth-area');
  const profileArea = document.getElementById('profile-area');
  const signOutButton = document.getElementById('signout-button');

  if (currentAuth?.user) {
    if (authArea) authArea.classList.add('hidden');
    if (profileArea) profileArea.classList.remove('hidden');
    const profileNameEl = document.getElementById('profile-name');
    if (profileNameEl) profileNameEl.textContent = currentAuth.user.fullName;

    const profileEmailEl = document.getElementById('profile-email');
    if (profileEmailEl) profileEmailEl.textContent = currentAuth.user.email;
    loadOrderHistory();
    loadWishlist();
    signOutButton?.addEventListener('click', () => {
      clearAuth();
      window.location.reload();
    });
    return;
  }

  if (authArea) authArea.classList.remove('hidden');
  if (profileArea) profileArea.classList.add('hidden');
  document.getElementById('login-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[name="email"]').value;
    const password = form.querySelector('input[name="password"]').value;
    try {
      const result = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      setAuth(result);
      window.location.reload();
    } catch (err) {
      alert(err.body?.message || err.message || 'Login failed');
    }
  });
  document.getElementById('signup-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.target;
    const fullName = form.querySelector('input[name="fullName"]').value;
    const email = form.querySelector('input[name="email"]').value;
    const password = form.querySelector('input[name="password"]').value;
    try {
      const result = await apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ fullName, email, password }) });
      setAuth(result);
      window.location.reload();
    } catch (err) {
      alert(err.body?.message || err.message || 'Registration failed');
    }
  });

  const forgotForm = document.getElementById('forgot-password-form');
  document.getElementById('forgot-password-toggle')?.addEventListener('click', () => {
    forgotForm?.classList.toggle('hidden');
  });
  forgotForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[name="email"]').value;
    const status = document.getElementById('forgot-password-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    try {
      const result = await apiFetch('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
      if (status) {
        status.textContent = result.message || 'If that email is registered, a reset link has been sent.';
        status.className = 'text-sm text-center text-green-600';
      }
    } catch (err) {
      if (status) {
        status.textContent = err.body?.message || err.message || 'Something went wrong. Try again.';
        status.className = 'text-sm text-center text-red-600';
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

function initHeaderEvents() {
  document.getElementById('cart-open-button')?.addEventListener('click', () => {
    renderCartItems();
    toggleCartDrawer(true);
  });
  document.getElementById('close-cart-drawer')?.addEventListener('click', () => toggleCartDrawer(false));
  document.getElementById('checkout-button')?.addEventListener('click', () => {
    window.location.href = 'checkout.html';
  });

  // Header search bars (desktop + mobile) redirect into the real search panel input
  function wireHeaderSearch(formId, inputId) {
    const form = document.getElementById(formId);
    const input = document.getElementById(inputId);
    if (!form || !input) return;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const mainSearchInput = document.getElementById('search-input');
      if (mainSearchInput) {
        mainSearchInput.value = input.value;
        document.getElementById('search-panel')?.scrollIntoView({ behavior: 'smooth' });
        await loadProducts(document.getElementById('products-list'), mainSearchInput, selectedCategory);
      } else {
        // Not on the home page: send them to the home page with the query
        window.location.href = `index.html?search=${encodeURIComponent(input.value)}#products`;
      }
    });
  }
  wireHeaderSearch('desktop-search', 'desktop-search-input');
  wireHeaderSearch('mobile-search', 'mobile-search-input');

  const mobileButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileButton && mobileMenu) {
    mobileButton.addEventListener('click', () => {
      const expanded = mobileButton.getAttribute('aria-expanded') === 'true';
      mobileButton.setAttribute('aria-expanded', String(!expanded));
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Vendor modal (basic open/close + Escape key)
  const vendorModal = document.getElementById('vendor-modal');
  let _prevFocus = null;
  function openVendorModal() {
    if (!vendorModal) return;
    _prevFocus = document.activeElement;
    vendorModal.classList.remove('hidden');
    vendorModal.querySelector('input, button, [tabindex]')?.focus();
    document.addEventListener('keydown', vendorKeyHandler);
  }
  function closeVendorModal() {
    if (!vendorModal) return;
    vendorModal.classList.add('hidden');
    _prevFocus?.focus?.();
    document.removeEventListener('keydown', vendorKeyHandler);
  }

  document.querySelectorAll('.open-vendor-modal').forEach(btn => btn.addEventListener('click', openVendorModal));
  document.getElementById('close-vendor-modal')?.addEventListener('click', closeVendorModal);
  // trap focus within modal while open
  function vendorKeyHandler(e) {
    if (e.key === 'Escape') return closeVendorModal();
    if (e.key !== 'Tab') return;
    const focusable = vendorModal.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const vendorForm = document.getElementById('vendor-signin-form');
  if (vendorForm) {
    vendorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = document.getElementById('vendor-status');
      if (status) {
        status.textContent = 'Logging in...';
      }

      const storeName = document.getElementById('vendor-store')?.value || '';
      localStorage.setItem('globalmart_vendor', JSON.stringify({
        store: storeName
      }));

      setTimeout(() => {
        window.location.href = 'vendor-dashboard.html';
      }, 500);
    });
  }
}

function enableLazyImages() {
  try {
    document.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    });
  } catch (e) {
    // noop
  }
}

async function pollPaymentStatus(orderId, status, attempt = 0) {
  try {
    const result = await apiFetch(`/api/payment/status/${encodeURIComponent(orderId)}`);
    if (result.paymentStatus === 'PAID') {
      saveCart([]);
      updateCartCounter();
      if (status) {
        status.textContent = 'Payment confirmed! Your order is being prepared.';
        status.className = 'mt-2 text-center text-sm font-medium text-green-600';
      }
      setTimeout(() => { window.location.href = 'account.html'; }, 2500);
      return;
    }
    if (result.paymentStatus === 'FAILED') {
      if (status) {
        status.textContent = 'Payment failed or was cancelled. Please try again.';
        status.className = 'mt-2 text-center text-sm font-medium text-red-600';
      }
      return;
    }
    // still UNPAID/pending - keep polling for up to ~2 minutes (mobile money confirmation can be slow)
    if (attempt < 24) {
      if (status) {
        status.textContent = 'Waiting for payment confirmation...';
        status.className = 'mt-2 text-center text-sm font-medium text-blue-600';
      }
      setTimeout(() => pollPaymentStatus(orderId, status, attempt + 1), 5000);
    } else if (status) {
      status.textContent = 'Still waiting for payment confirmation. Check your order history shortly.';
      status.className = 'mt-2 text-center text-sm font-medium text-yellow-600';
    }
  } catch (err) {
    if (status) {
      status.textContent = 'Unable to verify payment status.';
      status.className = 'mt-2 text-center text-sm font-medium text-red-600';
    }
  }
}

async function initCheckoutPage() {
  const itemsContainer = document.getElementById('checkout-items');
  const totalContainer = document.getElementById('checkout-total');
  const form = document.getElementById('checkout-form');
  const status = document.getElementById('checkout-status');

  if (!itemsContainer || !totalContainer) return;

  // Returning from CinetPay's return_url? Show payment confirmation instead of the form.
  const returningOrderId = getQueryParam('order');
  if (returningOrderId) {
    if (form) form.classList.add('hidden');
    itemsContainer.innerHTML = '<p class="text-sm text-gray-500">Checking your payment...</p>';
    if (!currentAuth?.token) {
      if (status) status.textContent = 'Sign in to confirm your payment status.';
      return;
    }
    await pollPaymentStatus(returningOrderId, status);
    return;
  }

  if (!currentAuth?.token) {
    itemsContainer.innerHTML = '<p class="text-sm text-gray-500">Please sign in to checkout.</p>';
    totalContainer.textContent = '0 CFA';
    if (form) form.classList.add('hidden');
    if (status) {
      status.innerHTML = '<a href="account.html" class="text-blue-600 underline">Sign in or create an account</a> to place your order.';
      status.className = 'mt-2 text-center text-sm font-medium text-slate-600';
    }
    return;
  }

  const cartItems = loadCart();
  if (cartItems.length === 0) {
    itemsContainer.innerHTML = '<p class="text-sm text-gray-500">Your cart is empty.</p>';
    totalContainer.textContent = '0 CFA';
    if (form) {
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
      }
    }
    return;
  }

  let total = 0;
  itemsContainer.innerHTML = cartItems.map(item => {
    total += item.price * item.quantity;
    const imgHtml = item.image
      ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="w-14 h-14 rounded-xl object-cover flex-shrink-0">`
      : `<div class="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-xl">📦</div>`;
    return `
      <div class="flex items-center gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
        ${imgHtml}
        <div class="flex-1 flex items-center justify-between gap-2">
          <div>
            <h3 class="font-semibold text-gray-900 text-sm leading-tight">${escapeHtml(item.name)}</h3>
            <p class="text-xs text-gray-500 mt-0.5">Qty: ${item.quantity}</p>
          </div>
          <p class="font-semibold text-gray-900 text-sm flex-shrink-0">${formatMoney(item.price * item.quantity)}</p>
        </div>
      </div>
    `;
  }).join('');

  // Fetch the current delivery fee so what's shown matches what the server will actually charge.
  let deliveryFee = 0;
  try {
    const config = await apiFetch('/api/config');
    deliveryFee = config.deliveryFeeXaf || 0;
  } catch (err) {
    // If this fails, fall back to showing items-only total — the real total (with delivery)
    // is still authoritative from the server once the order is created.
  }

  const summaryContainer = document.getElementById('checkout-delivery-fee');
  if (summaryContainer) summaryContainer.textContent = formatMoney(deliveryFee);
  totalContainer.textContent = formatMoney(total + deliveryFee);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    if (status) {
      status.textContent = 'Creating your order...';
      status.className = 'mt-2 text-center text-sm font-medium text-blue-600';
    }

    const shippingAddress = document.getElementById('shipping-address')?.value?.trim() || '';
    const shippingCity = document.getElementById('shipping-city')?.value?.trim() || '';
    const shippingPhone = document.getElementById('shipping-phone')?.value?.trim() || '';
    const paymentMethod = form.querySelector('input[name="paymentMethod"]:checked')?.value || 'MOMO';

    try {
      const checkoutResult = await apiFetch('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({ items: cartItems, shippingAddress, shippingCity, shippingPhone })
      });

      if (status) {
        status.textContent = 'Redirecting to secure payment...';
      }

      const paymentResult = await apiFetch('/api/payment/initiate', {
        method: 'POST',
        body: JSON.stringify({ orderId: checkoutResult.order.id, paymentMethod })
      });

      window.location.href = paymentResult.paymentUrl;
    } catch (err) {
      if (submitBtn) submitBtn.disabled = false;
      if (status) {
        if (err.body?.outOfStock?.length) {
          const list = err.body.outOfStock.map(i => `${escapeHtml(i.name)} (only ${i.available} left, you asked for ${i.requested})`).join(', ');
          status.textContent = `Not enough stock: ${list}. Please adjust your cart.`;
        } else {
          status.textContent = err.body?.message || err.message || 'Failed to place order. Try again.';
        }
        status.className = 'mt-2 text-center text-sm font-medium text-red-600';
      }
    }
  });
}

function initPage() {
  setUserDisplay();
  updateCartCounter();
  initHeaderEvents();
  initProductListDelegation();
  if (document.getElementById('cart-items')) renderCartItems();
  if (pageName === 'index') initIndexPage();
  if (pageName === 'product') initProductPage();
  if (pageName === 'account') initAccountPage();
  if (pageName === 'checkout') initCheckoutPage();
  enableLazyImages();
}

window.addEventListener('DOMContentLoaded', initPage);
