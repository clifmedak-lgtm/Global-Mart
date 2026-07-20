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
  if (!file) return;
  const formData = new FormData();
  formData.append('image', file);
  return fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  }).then(response => {
    if (!response.ok) throw new Error('Image upload failed');
    return response.json();
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
  const productsList = document.getElementById('products-list') || document;
  productsList.addEventListener('click', async (event) => {
    const btn = event.target.closest('.add-cart-btn, .add-cart');
    if (!btn) return;
    event.preventDefault();
    try {
      const id = btn.dataset.id;
      if (id) {
        const product = await apiFetch(`/api/product?id=${encodeURIComponent(id)}`);
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
  let products = [];
  try {
    products = await apiFetch(`/api/products?search=${encodeURIComponent(query)}${categoryQuery}`);
  } catch (err) {
    if (listNode) listNode.innerHTML = '<div class="col-span-full rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-red-500">Unable to load products.</div>';
    return;
  }
  const filtered = products.filter(product => {
    if (!query) return true;
    return [product.name, product.vendor, product.category]
      .some(value => value.toLowerCase().includes(query));
  });

  if (!listNode) return;
  if (filtered.length === 0) {
    listNode.innerHTML = '<div class="col-span-full rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">No products matched your search.</div>';
    return;
  }

  listNode.innerHTML = filtered.map(renderProductCard).join('');
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
  document.getElementById('refresh-recommendations')?.addEventListener('click', async () => {
    await loadRecommendations(document.getElementById('recommendations-list'), selectedCategory);
  });
  if (window.location.protocol !== 'file:') {
    await loadProducts(document.getElementById('products-list'), document.getElementById('search-input'), selectedCategory);
    await loadRecommendations(document.getElementById('recommendations-list'), selectedCategory);
  } else {
    console.log('Running locally without a server. Using hardcoded HTML layout.');
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
    const product = await apiFetch(`/api/product?id=${encodeURIComponent(productId)}`);
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
            </div>
          </div>
          <div class="rounded-3xl bg-white p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-slate-900">Vendor details</h2>
            <p class="mt-3 text-sm text-slate-500">Sold by <strong>${escapeHtml(product.vendor)}</strong>. Secure payment, verified seller of electronics and accessories.</p>
          </div>
        </div>
      </div>
    `;
    document.getElementById('product-add-cart')?.addEventListener('click', () => {
      addToCart(product);
      toggleCartDrawer(true);
    });
    document.getElementById('view-cart-button')?.addEventListener('click', () => {
      toggleCartDrawer(true);
    });
    await loadRecommendations(document.getElementById('recommendations-list'));
  } catch (error) {
    detailNode.innerHTML = '<p class="text-center text-sm text-red-600">Unable to load product details.</p>';
    console.error(error);
  }
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
              <p class="text-sm font-semibold text-slate-900">${item.name}</p>
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

  // Mobile menu toggle
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

async function initCheckoutPage() {
  const itemsContainer = document.getElementById('checkout-items');
  const totalContainer = document.getElementById('checkout-total');
  const form = document.getElementById('checkout-form');
  const status = document.getElementById('checkout-status');

  if (!itemsContainer || !totalContainer) return;

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


  totalContainer.textContent = formatMoney(total);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (status) {
      status.textContent = 'Processing order...';
      status.className = 'mt-2 text-center text-sm font-medium text-blue-600';
    }

    try {
      if (currentAuth?.token) {
        await apiFetch('/api/checkout', { // Corrected endpoint to /api/checkout
          method: 'POST',
          body: JSON.stringify({ items: cartItems, totalAmount: total })
        });
      } else {
        await new Promise(r => setTimeout(r, 1000));
      }

      saveCart([]);
      updateCartCounter();
      if (status) {
        status.textContent = 'Order placed successfully!';
        status.className = 'mt-2 text-center text-sm font-medium text-green-600';
      }
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    } catch (err) {
      if (status) {
        status.textContent = 'Failed to place order. Try again.';
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
