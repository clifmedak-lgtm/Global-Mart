// i18n.js — shared EN/FR translation engine.
// Load this BEFORE app.js on every page. Static text uses data-i18n="key" attributes;
// dynamic text generated in app.js calls t('key') directly.

const TRANSLATIONS = {
  en: {
    // Header / nav
    nav_home: 'Home',
    nav_products: 'Products',
    nav_deals: 'Deals',
    nav_contact: 'Contact',
    nav_account: 'Account',
    nav_sign_in: 'Sign in',
    nav_vendor_sign_in: 'Vendor sign in',
    search_placeholder: 'Search phones, brands, or accessories',
    search_button: 'Search',
    hi_name: 'Hi, {name}',

    // hero 1


    // Cart drawer
    your_cart: 'Your cart',
    cart_review_items: 'Review items before checkout.',
    cart_empty: 'Your cart is empty. Add products to get started.',
    cart_total: 'Total',
    checkout_button: 'Checkout',
    close: 'Close',
    qty: 'Qty',

    // Product cards / actions
    add_to_cart: 'Add to cart',
    add: 'Add',
    view_cart: 'View cart',
    save: '🤍 Save',
    saved: '❤️ Saved',
    in_stock: '{count} in stock',
    out_of_stock: 'Out of stock',
    no_products_found: 'No products matched your search.',
    unable_to_load_products: 'Unable to load products.',
    loading: 'Loading...',

    // Reviews
    customer_reviews: 'Customer reviews',
    leave_a_review: 'Leave a review',
    no_reviews_yet: 'No reviews yet — be the first to review this product.',
    verified_purchase: 'Verified purchase',
    submit_review: 'Submit review',
    sign_in_to_review: 'Sign in to leave a review.',

    // Checkout
    shipping_information: 'Shipping Information',
    payment_method: 'Payment Method',
    place_order: 'Place Order',
    order_summary: 'Order Summary',
    delivery_fee: 'Delivery fee',
    discount: 'Discount',
    coupon_code_placeholder: 'Coupon code',
    apply: 'Apply',
    address: 'Address',
    city: 'City',
    phone_number: 'Phone number',

    // Account
    welcome_back: 'Welcome back',
    sign_in_desc: 'Sign in to see your order history and saved items.',
    new_here: 'New here?',
    create_account: 'Create account',
    order_history: 'Order history',
    wishlist: 'Wishlist',
    sign_out: 'Sign out',
    forgot_password: 'Forgot your password?',

    // Order status
    status_pending_payment: 'Awaiting payment',
    status_processing: 'Processing',
    status_shipped: 'Shipped',
    status_delivered: 'Delivered',
    status_cancelled: 'Cancelled',
  },
  fr: {
    nav_home: 'Accueil',
    nav_products: 'Produits',
    nav_deals: 'Promotions',
    nav_contact: 'Contact',
    nav_account: 'Compte',
    nav_sign_in: 'Connexion',
    nav_vendor_sign_in: 'Espace vendeur',
    search_placeholder: 'Rechercher un téléphone, une marque, un accessoire',
    search_button: 'Rechercher',
    hi_name: 'Bonjour, {name}',

    your_cart: 'Votre panier',
    cart_review_items: 'Vérifiez vos articles avant de commander.',
    cart_empty: 'Votre panier est vide. Ajoutez des produits pour commencer.',
    cart_total: 'Total',
    checkout_button: 'Commander',
    close: 'Fermer',
    qty: 'Qté',

    add_to_cart: 'Ajouter au panier',
    add: 'Ajouter',
    view_cart: 'Voir le panier',
    save: '🤍 Sauvegarder',
    saved: '❤️ Sauvegardé',
    in_stock: '{count} en stock',
    out_of_stock: 'Rupture de stock',
    no_products_found: 'Aucun produit ne correspond à votre recherche.',
    unable_to_load_products: 'Impossible de charger les produits.',
    loading: 'Chargement...',

    customer_reviews: 'Avis clients',
    leave_a_review: 'Laisser un avis',
    no_reviews_yet: 'Aucun avis pour l\'instant — soyez le premier à donner votre avis.',
    verified_purchase: 'Achat vérifié',
    submit_review: 'Envoyer l\'avis',
    sign_in_to_review: 'Connectez-vous pour laisser un avis.',

    shipping_information: 'Informations de livraison',
    payment_method: 'Mode de paiement',
    place_order: 'Passer la commande',
    order_summary: 'Récapitulatif',
    delivery_fee: 'Frais de livraison',
    discount: 'Réduction',
    coupon_code_placeholder: 'Code promo',
    apply: 'Appliquer',
    address: 'Adresse',
    city: 'Ville',
    phone_number: 'Numéro de téléphone',

    welcome_back: 'Bon retour',
    sign_in_desc: 'Connectez-vous pour voir vos commandes et vos articles sauvegardés.',
    new_here: 'Nouveau ici ?',
    create_account: 'Créer un compte',
    order_history: 'Historique des commandes',
    wishlist: 'Liste de souhaits',
    sign_out: 'Se déconnecter',
    forgot_password: 'Mot de passe oublié ?',

    status_pending_payment: 'En attente de paiement',
    status_processing: 'En préparation',
    status_shipped: 'Expédiée',
    status_delivered: 'Livrée',
    status_cancelled: 'Annulée',
  },
};

function getLang() {
  return localStorage.getItem('globalmart-lang') || 'en';
}

function setLang(lang) {
  localStorage.setItem('globalmart-lang', lang);
  applyTranslations();
  document.documentElement.lang = lang;
  updateLangToggleUI();
}

// t('key') or t('key', { name: 'X' }) for strings with {placeholders}
function t(key, vars) {
  const lang = getLang();
  let str = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.en[key] || key;
  if (vars) {
    Object.keys(vars).forEach(k => {
      str = str.replace(`{${k}}`, vars[k]);
    });
  }
  return str;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key));
  });
}

function updateLangToggleUI() {
  const lang = getLang();
  document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
    const isActive = btn.dataset.lang === lang;
    btn.classList.toggle('bg-blue-600', isActive);
    btn.classList.toggle('text-white', isActive);
    btn.classList.toggle('text-slate-500', !isActive);
  });
  const lang1 = getLang();
  document.querySelectorAll('.lang1-toggle-btn').forEach(btn => {
    const isActive = btn.dataset.lang === lang;
    btn.classList.toggle('bg-blue-600', isActive);
    btn.classList.toggle('text-white', isActive);
    btn.classList.toggle('text-slate-500', !isActive);
  });

}

function initLanguageToggle() {
  document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
  updateLangToggleUI();
  document.querySelectorAll('.lang1-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
  updateLangToggleUI();
}

document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
  initLanguageToggle();
  document.documentElement.lang = getLang();
});
