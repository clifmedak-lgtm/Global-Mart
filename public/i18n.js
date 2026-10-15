// i18n.js — shared EN/FR translation engine.
// Load this BEFORE app.js on every page. Static text uses data-i18n="key" attributes;
// dynamic text generated in app.js calls t('key') directly.

const TRANSLATIONS = {
  en: {
    // Header / nav
    nav_home: 'Home',
    language_label: 'Language',
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
    language_label: 'Langue',
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

// Covers copy across the full storefront and both dashboards, including text
// produced later by inline scripts. Unknown text stays in its source language.
const PAGE_TRANSLATIONS = {
  "Skip to content": "Aller au contenu",
  "Sign in / Account": "Connexion / Compte",
  "Sign in or register to manage orders and save your cart.": "Connectez-vous ou créez un compte pour gérer vos commandes et enregistrer votre panier.",
  "Sign in to see your order history and saved items.": "Connectez-vous pour consulter vos commandes et vos articles enregistrés.",
  "Email": "E-mail", "Email address": "Adresse e-mail", "Password": "Mot de passe",
  "Admin password": "Mot de passe administrateur", "Enter your password": "Saisissez votre mot de passe",
  "Sign in": "Se connecter", "Login": "Connexion", "Logout": "Déconnexion", "Register": "S'inscrire",
  "Forgot your password?": "Mot de passe oublié ?", "Enter your account email": "Saisissez l’e-mail de votre compte",
  "Send reset link": "Envoyer le lien de réinitialisation", "New here?": "Nouveau ici ?",
  "Create an account": "Créer un compte", "Create account": "Créer un compte", "Full name": "Nom complet",
  "Order history": "Historique des commandes", "Loading your orders…": "Chargement de vos commandes…",
  "Wishlist": "Liste de souhaits", "Loading your wishlist…": "Chargement de vos favoris…",
  "Your cart": "Votre panier", "Review items before checkout.": "Vérifiez vos articles avant de commander.",
  "Review items and checkout securely.": "Vérifiez vos articles et payez en toute sécurité.",
  "Your cart is empty. Add products to get started.": "Votre panier est vide. Ajoutez des produits pour commencer.",
  "Close": "Fermer", "Total": "Total", "Checkout": "Commander", "Loading items...": "Chargement des articles…",
  "A trusted marketplace for electronics, gaming gear, and accessories.": "Une marketplace de confiance pour l’électronique, le gaming et les accessoires.",
  "Support": "Assistance", "Contact": "Contact", "Quick links": "Liens rapides", "Shop": "Boutique",
  "My account": "Mon compte", "Recommendations": "Recommandations",
  "The Global Marketplace for Everything.": "La marketplace mondiale pour tout trouver.",
  "Connect with thousands of verified vendors. Source everything from premium electronics to bulk networking gear with secure payments and global delivery.": "Trouvez des milliers de vendeurs vérifiés. Achetez des appareils électroniques haut de gamme et du matériel réseau en gros, avec des paiements sécurisés et une livraison internationale.",
  "Start Shopping": "Découvrir la boutique", "Open a Vendor Store": "Ouvrir une boutique vendeur",
  "Featured Phone": "Téléphone à la une", "Ultra-thin display, fast charging, pro camera.": "Écran ultrafin, charge rapide et appareil photo professionnel.",
  "Flash Sale": "Vente flash", "Up to 40% Off": "Jusqu’à -40 %", "New Arrivals": "Nouveautés",
  "Shop Latest Tech": "Voir les nouveautés tech", "Filter by product name, vendor, category, or price range.": "Filtrez par produit, vendeur, catégorie ou prix.",
  "Search product catalog": "Rechercher dans le catalogue", "Price range (CFA)": "Fourchette de prix (FCFA)",
  "Minimum price": "Prix minimum", "Maximum price": "Prix maximum", "Flash Sales": "Ventes flash",
  "See all deals": "Voir toutes les offres", "Top Categories": "Catégories principales",
  "Filter products by category or browse our best sellers.": "Filtrez les produits par catégorie ou découvrez nos meilleures ventes.",
  "All": "Tout", "Phones": "Téléphones", "Consoles": "Consoles", "Cases": "Coques",
  "Accessories": "Accessoires", "Audio": "Audio", "Smartphones": "Smartphones",
  "Flagship and budget devices.": "Des modèles premium et abordables.", "Chargers, cases, headphones.": "Chargeurs, coques et écouteurs.",
  "Gaming Gear": "Équipement gaming", "Controllers, accessories, and phones.": "Manettes, accessoires et téléphones.",
  "Earbuds, speakers, sound gear.": "Écouteurs, enceintes et matériel audio.",
  "Featured products": "Produits à la une", "Browse real phones with pricing, vendor info, and quick cart actions.": "Découvrez des téléphones avec prix, informations vendeur et ajout rapide au panier.",
  "Secure": "Sécurisé", "Fast delivery": "Livraison rapide", "Add to cart": "Ajouter au panier",
  "Explore more gadget collections": "Explorer d’autres collections", "real images and live prices.": "des photos réelles et des prix à jour.",
  "Recommended for you": "Recommandé pour vous", "Top-rated products selected automatically from our marketplace.": "Une sélection automatique des produits les mieux notés de notre marketplace.",
  "Refresh recommendations": "Actualiser les recommandations", "Loading recommendations...": "Chargement des recommandations…",
  "The premier multi-vendor marketplace connecting global suppliers with local buyers.": "La marketplace multi-vendeurs qui relie les fournisseurs internationaux aux acheteurs locaux.",
  "Customer Service": "Service client", "Help Center": "Centre d’aide", "Track Your Order": "Suivre ma commande",
  "Return Policy": "Politique de retour", "Dispute Resolution": "Résolution des litiges", "Make Money with Us": "Vendez avec nous",
  "Sell on GlobalMart": "Vendre sur GlobalMart", "Become an Affiliate": "Devenir affilié", "Vendor Support Hub": "Assistance vendeurs",
  "Wholesale Dashboard": "Espace grossiste", "Secure Payments": "Paiements sécurisés",
  "We support secure local and international payment methods.": "Nous acceptons des moyens de paiement locaux et internationaux sécurisés.",
  "All rights reserved. Built for scale.": "Tous droits réservés. Une plateforme conçue pour grandir.",
  "Vendor Sign In": "Connexion vendeur", "Access your vendor dashboard and manage listings.": "Accédez à votre espace vendeur et gérez vos annonces.",
  "Store name": "Nom de la boutique", "Product details": "Détails du produit", "Find the right product for your business.": "Trouvez le produit qu’il vous faut.",
  "Fast checkout, verified sellers, and product information all in one experience.": "Une commande rapide, des vendeurs vérifiés et toutes les informations produit au même endroit.",
  "Shipping Information": "Informations de livraison", "Address": "Adresse", "City": "Ville", "Phone number": "Numéro de téléphone",
  "Payment Method": "Mode de paiement", "MTN Mobile Money": "MTN Mobile Money", "Orange Money": "Orange Money",
  "Credit / Debit Card (Visa, Mastercard)": "Carte de crédit / débit (Visa, Mastercard)",
  "You'll be redirected to a secure NotchPay payment page to complete your payment. For Mobile Money, the operator (MTN or Orange) is detected automatically from the phone number you use to pay.": "Vous serez redirigé vers une page de paiement NotchPay sécurisée. Pour Mobile Money, l’opérateur (MTN ou Orange) est détecté automatiquement à partir du numéro utilisé.",
  "Place Order": "Valider la commande", "Order Summary": "Récapitulatif de la commande", "Apply": "Appliquer",
  "Delivery fee": "Frais de livraison", "Discount": "Réduction", "Set a new password": "Définir un nouveau mot de passe",
  "Choose a new password for your account.": "Choisissez un nouveau mot de passe pour votre compte.",
  "New password": "Nouveau mot de passe", "Confirm new password": "Confirmer le nouveau mot de passe",
  "Update password": "Mettre à jour le mot de passe", "Dashboard": "Tableau de bord", "Customers": "Clients",
  "Vendors": "Vendeurs", "Products": "Produits", "Orders": "Commandes", "Coupons": "Codes promo",
  "My Products": "Mes produits", "Revenue": "Revenus", "Available balance": "Solde disponible",
  "Total earned minus what's already been paid out to you": "Total gagné moins les sommes déjà versées.",
  "Payout history": "Historique des versements", "No payouts yet.": "Aucun versement pour le moment.",
  "Mobile Money account": "Compte Mobile Money", "This is where the platform sends your money — make sure it's your own number.": "C’est le compte sur lequel la plateforme vous verse vos gains. Vérifiez qu’il s’agit de votre numéro.",
  "Save": "Enregistrer", "Recent Orders": "Commandes récentes", "Add Product": "Ajouter un produit",
  "Add New Product": "Ajouter un produit", "Full description (as long as you need — features, why it's great, specs...)": "Description complète (caractéristiques, avantages, spécifications…)",
  "Key features — one per line (shown as bullet points, like \"About this item\")": "Caractéristiques principales — une par ligne.",
  "Drag & drop an image, or click to browse": "Déposez une image ici ou cliquez pour la choisir.",
  "Product": "Produit", "Cancel": "Annuler", "Loading products...": "Chargement des produits…",
  "Loading orders...": "Chargement des commandes…", "Edit product": "Modifier le produit", "Delete": "Supprimer",
  "Tap any card to see the details.": "Sélectionnez une carte pour afficher les détails.", "Orders (paid)": "Commandes (payées)",
  "Total sales (GMV)": "Ventes totales (GMV)", "Platform revenue": "Revenus de la plateforme", "New Coupon": "Nouveau code promo",
  "Percent off": "Pourcentage de réduction", "Fixed amount off (CFA)": "Réduction fixe (FCFA)", "Create Coupon": "Créer le code promo",
  "Search customers...": "Rechercher des clients…", "Search products...": "Rechercher des produits…",
  "Loading...": "Chargement…", "Waiting for customer payment": "En attente du paiement du client",
  "Awaiting payment": "En attente de paiement", "Processing": "En préparation", "Shipped": "Expédiée", "Delivered": "Livrée", "Cancelled": "Annulée",
  "Bright": "Clair", "Dark": "Sombre", "Language": "Langue", "Theme": "Thème", "Open appearance menu": "Ouvrir le menu d’affichage",
  "Home": "Accueil", "Deals": "Promotions", "Search": "Rechercher", "Search products": "Rechercher des produits",
  "Vendor sign in": "Connexion vendeur", "Primary navigation": "Navigation principale", "Open cart": "Ouvrir le panier",
  "B2B & B2C": "B2B et B2C", "E-Commerce": "Commerce en ligne", "Everything.": "Tout.",
  "See all deals": "Voir toutes les offres", "Android phones": "Téléphones Android", "iPhones": "iPhone",
  "Phone cases": "Coques de téléphone", "PlayStation 5 deals": "Offres PlayStation 5",
  "10 console options with instant cart action.": "10 consoles à ajouter directement au panier.",
  "10 modern Android handsets with reliable pricing.": "10 smartphones Android récents à prix compétitifs.",
  "10 Apple models with premium finishes and deals.": "10 modèles Apple haut de gamme à prix avantageux.",
  "10 protective and stylish cases for every phone.": "10 coques élégantes et protectrices pour tous les téléphones.",
  "256GB, pro camera and fast charging.": "256 Go, appareil photo professionnel et charge rapide.",
  "512GB, titanium finish and ProMotion display.": "512 Go, finition titane et écran ProMotion.",
  "256GB, ultra-fast charging and clean Android.": "256 Go, charge ultra-rapide et Android épuré.",
  "128GB, AI camera and clean Android experience.": "128 Go, appareil photo IA et expérience Android épurée.",
  "Order #": "Commande n°", "Customer": "Client", "Quantity": "Quantité", "Status": "Statut",
  "Update status": "Mettre à jour le statut", "Product name": "Nom du produit", "Category": "Catégorie",
  "Price": "Prix", "Stock": "Stock", "Description": "Description", "Image": "Image",
  "No products yet": "Aucun produit pour le moment", "No orders yet": "Aucune commande pour le moment",
  "No customers found.": "Aucun client trouvé.", "No vendors found.": "Aucun vendeur trouvé.",
  "No products found.": "Aucun produit trouvé.", "No orders found.": "Aucune commande trouvée.",
  "No coupons yet.": "Aucun code promo pour le moment.", "Are you sure?": "Voulez-vous continuer ?",
  "Save changes": "Enregistrer les modifications", "Update": "Mettre à jour", "View": "Voir", "Remove": "Retirer",
  "Copied": "Copié", "Copy": "Copier", "Continue shopping": "Continuer les achats",
  "Your order has been placed.": "Votre commande a été enregistrée.", "Order placed successfully.": "Commande enregistrée avec succès.",
  "Payment failed. Please try again.": "Le paiement a échoué. Veuillez réessayer.", "Something went wrong. Please try again.": "Une erreur est survenue. Veuillez réessayer."
};

const translatedTextNodes = new WeakMap();
const translatedAttributes = new WeakMap();

Object.assign(PAGE_TRANSLATIONS, {
  "Sign": "Connexion", "Guest": "Invité", "Retry": "Réessayer", "Edit": "Modifier", "Close": "Fermer",
  "No customers yet.": "Aucun client pour le moment.", "No vendors yet.": "Aucun vendeur pour le moment.",
  "in stock": "en stock", "Out of stock": "Rupture de stock", "owed": "dus", "earned": "gagné", "paid out": "versé",
  "Subtotal:": "Sous-total :", "Delivery:": "Livraison :", "Coupon ": "Code promo ", "Total:": "Total :", "Ref:": "Réf. :",
  "Deactivate": "Désactiver", "Activate": "Activer", "INACTIVE": "INACTIF", "EXPIRED": "EXPIRÉ", "USED UP": "ÉPUISÉ", "ACTIVE": "ACTIF",
  "Send via Mobile Money": "Envoyer par Mobile Money", "Record payout manually": "Enregistrer le versement manuellement",
  "Confirm payout sent": "Confirmer le versement", "No Mobile Money number registered yet": "Aucun numéro Mobile Money enregistré pour le moment",
  "Amount (CFA)": "Montant (FCFA)", "Method (e.g. MTN MoMo)": "Méthode (ex. MTN MoMo)",
  "Reference / phone number": "Référence / numéro de téléphone", "Payout recorded!": "Versement enregistré !",
  "Products": "Produits", "Orders": "Commandes", "Vendor Login": "Connexion vendeur", "Vendor Registration": "Inscription vendeur",
  "Primary navigation": "Navigation principale", "Open mobile menu": "Ouvrir le menu de navigation",
  "Search products...": "Rechercher des produits…", "Search customers...": "Rechercher des clients…",
  "Open appearance menu": "Ouvrir le menu d’affichage", "Choose a new password for your account.": "Choisissez un nouveau mot de passe pour votre compte."
});

function translateDynamicPhrase(text) {
  if (getLang() !== 'fr') return text;
  let match = text.match(/^(\d+) in stock$/);
  if (match) return `${match[1]} en stock`;
  match = text.match(/^\(after ([\d.]+)% platform fee\)$/);
  if (match) return `(après ${match[1]} % de commission plateforme)`;
  match = text.match(/^(\d+) orders?$/);
  if (match) return `${match[1]} commande${Number(match[1]) > 1 ? 's' : ''}`;
  match = text.match(/^(\d+) products$/);
  if (match) return `${match[1]} produits`;
  match = text.match(/^(\d+) products — earned ([\d,]+) CFA — paid out ([\d,]+) CFA$/);
  if (match) return `${match[1]} produits — gagné ${match[2]} FCFA — déjà versé ${match[3]} FCFA`;
  match = text.match(/^(.+) — joined (.+)$/);
  if (match) return `${match[1]} — inscrit le ${match[2]}`;
  match = text.match(/^([\d,]+) CFA owed$/);
  if (match) return `${match[1]} FCFA dus`;
  match = text.match(/^Amount \(CFA\) — up to ([\d,]+) owed$/);
  if (match) return `Montant (FCFA) — jusqu’à ${match[1]} dus`;
  match = text.match(/^(.+) off — used (.+) — min order ([\d,]+) CFA(?: — expires (.+))?$/);
  if (match) return `${match[1]} de réduction — utilisé ${match[2]} — commande minimum ${match[3]} FCFA${match[4] ? ` — expiration : ${match[4]}` : ''}`;
  match = text.match(/^Send how much to this vendor via Mobile Money\? \(up to ([\d,]+) CFA owed\)$/);
  if (match) return `Quel montant envoyer à ce vendeur par Mobile Money ? (jusqu’à ${match[1]} FCFA dus)`;
  match = text.match(/^This will send ([\d,]+) CFA to the vendor's real Mobile Money account right now\. Continue\?$/);
  if (match) return `Le montant de ${match[1]} FCFA sera envoyé maintenant sur le compte Mobile Money du vendeur. Continuer ?`;
  match = text.match(/^(Login error|Registration error|Unable to update status|Transfer failed|Delete error|Error):\s*(.*)$/);
  if (match) {
    const prefixes = { 'Login error': 'Erreur de connexion', 'Registration error': 'Erreur d’inscription', 'Unable to update status': 'Impossible de mettre à jour le statut', 'Transfer failed': 'Échec du transfert', 'Delete error': 'Erreur de suppression', Error: 'Erreur' };
    return `${prefixes[match[1]]} : ${match[2]}`;
  }
  return text;
}
Object.assign(PAGE_TRANSLATIONS, {
  "Search customers...": "Rechercher des clients…", "Search products...": "Rechercher des produits…",
  "CODE (e.g. LAUNCH10)": "CODE (ex. PROMO10)", "Value (e.g. 10)": "Valeur (ex. 10)",
  "Max uses (blank = unlimited)": "Utilisations max. (vide = illimité)", "Minimum order (CFA, optional)": "Commande minimale (FCFA, facultatif)",
  "Expires in days (blank = never)": "Expire dans (jours, vide = jamais)", "Store name": "Nom de la boutique",
  "GlobalMart | Account": "GlobalMart | Compte", "Admin | GlobalMart": "Administration | GlobalMart",
  "Checkout | GlobalMart": "Commande | GlobalMart", "GlobalMart | The Global Marketplace": "GlobalMart | La marketplace mondiale",
  "GlobalMart | Product details": "GlobalMart | Détails du produit", "GlobalMart | Reset password": "GlobalMart | Réinitialiser le mot de passe",
  "Vendor Dashboard - GlobalMart": "Espace vendeur - GlobalMart",
  "Support": "Assistance", "Create an account to save orders and checkout faster.": "Créez un compte pour enregistrer vos commandes et commander plus rapidement.",
  "The Global Marketplace for Everything.": "La marketplace mondiale pour tout trouver.",
  "Browse consoles, Android phones, iPhones, and protective cases with": "Découvrez des consoles, téléphones Android, iPhone et coques avec",
  "© 2026 GlobalMart Marketplace. All rights reserved. Built for scale.": "© 2026 GlobalMart Marketplace. Tous droits réservés. Une plateforme conçue pour grandir.",
  "No account? Register": "Pas encore de compte ? Inscrivez-vous", "Vendor Registration": "Inscription vendeur",
  "Orange": "Orange Money", "Money": "Mobile Money", "Credit / Debit": "Crédit / Débit", "Card (Visa, Mastercard)": "Carte (Visa, Mastercard)",
  "This link is missing its reset token. Please request a new password reset from the account page.": "Le jeton de réinitialisation manque dans ce lien. Demandez un nouveau lien depuis la page de votre compte.",
  "Search phones, brands, or accessories": "Rechercher des téléphones, marques ou accessoires",
  "© 2026 GlobalMart Marketplace. All rights reserved. Built for scale.": "© 2026 GlobalMart Marketplace. Tous droits réservés. Une plateforme conçue pour grandir.",
  "Vendor Login": "Connexion vendeur", "Loading…": "Chargement…", "Loading...": "Chargement…",
  "No products match your search.": "Aucun produit ne correspond à votre recherche.", "No description provided.": "Aucune description fournie.",
  "Please choose an image file.": "Veuillez choisir un fichier image.", "Uploading...": "Envoi en cours…", "Image uploaded ✓": "Image envoyée ✓",
  "Upload failed. Try again.": "Échec de l’envoi. Réessayez.", "Saved!": "Enregistré !", "Delete this product?": "Supprimer ce produit ?",
  "Login failed": "Échec de la connexion", "Registration failed": "Échec de l’inscription", "Failed to save": "Échec de l’enregistrement",
  "Failed to delete": "Échec de la suppression", "Delete error:": "Erreur lors de la suppression :", "Error:": "Erreur :",
  "Coupon created!": "Code promo créé !", "Payout recorded!": "Versement enregistré !", "Transfer initiated successfully!": "Transfert lancé avec succès !",
  "Transfer failed:": "Échec du transfert :", "Please select a star rating.": "Veuillez choisir une note.",
  "Unable to load reviews.": "Impossible de charger les avis.", "Product not found.": "Produit introuvable.",
  "Unable to load product details.": "Impossible de charger les détails du produit.", "Failed to submit review.": "Échec de l’envoi de l’avis.",
  "Sign in to view your order history.": "Connectez-vous pour consulter l’historique de vos commandes.",
  "No orders yet. Make a purchase to see your order history.": "Aucune commande. Passez une commande pour consulter votre historique ici.",
  "Unable to load orders at this time.": "Impossible de charger les commandes pour le moment.",
  "Sign in to view your wishlist.": "Connectez-vous pour consulter vos favoris.", "No saved products yet. Tap 🤍 Save on any product to add it here.": "Aucun favori pour le moment. Appuyez sur 🤍 Enregistrer sur un produit pour l’ajouter ici.",
  "Unable to load wishlist at this time.": "Impossible de charger vos favoris pour le moment.", "Logging in...": "Connexion en cours…",
  "Payment confirmed! Your order is being prepared.": "Paiement confirmé ! Votre commande est en préparation.",
  "Payment failed or was cancelled. Please try again.": "Le paiement a échoué ou a été annulé. Veuillez réessayer.",
  "Waiting for payment confirmation...": "En attente de confirmation du paiement…", "Checking your payment...": "Vérification du paiement…",
  "Still waiting for payment confirmation. Check your order history shortly.": "Toujours en attente de confirmation. Consultez bientôt l’historique de vos commandes.",
  "Unable to verify payment status.": "Impossible de vérifier le statut du paiement.", "Please sign in to checkout.": "Connectez-vous pour commander.",
  "Sign in or create an account": "Connectez-vous ou créez un compte", "Coupon applied!": "Code promo appliqué !",
  "Invalid coupon code": "Code promo invalide", "Creating your order...": "Création de votre commande…",
  "Redirecting to secure payment...": "Redirection vers le paiement sécurisé…",
  "Failed to place order. Try again.": "Échec de la commande. Réessayez.", "Recommendations are unavailable.": "Les recommandations sont indisponibles.",
  "Unable to load deals.": "Impossible de charger les offres.", "Tap any card to see the details.": "Sélectionnez une carte pour afficher les détails."
});

Object.assign(PAGE_TRANSLATIONS, {
  "GlobalMart Admin": "Administration GlobalMart", "This link is missing its reset token. Please": "Le jeton de réinitialisation manque dans ce lien. Veuillez",
  "request a new password reset from the": "demander un nouveau lien de réinitialisation depuis la", "account page": "page de votre compte",
  "Something went wrong loading this.": "Une erreur est survenue pendant le chargement.", "Request failed": "Échec de la requête",
  "Please adjust your cart.": "Veuillez modifier votre panier.", "Not enough stock:": "Stock insuffisant :", "Please try again.": "Veuillez réessayer.",
  "This field is required.": "Ce champ est obligatoire.", "Enter a valid email address.": "Saisissez une adresse e-mail valide.",
  "Password reset successful.": "Mot de passe réinitialisé avec succès.", "If that email is registered, a reset link has been sent.": "Si cette adresse e-mail est enregistrée, un lien de réinitialisation a été envoyé.",
  "PENDING_PAYMENT": "En attente de paiement", "PROCESSING": "En préparation", "SHIPPED": "Expédiée", "DELIVERED": "Livrée", "CANCELLED": "Annulée",
  "PAID": "Payée", "UNPAID": "Non payée", "FAILED": "Échouée", "INACTIVE": "Inactif", "EXPIRED": "Expiré", "USED UP": "Épuisé", "ACTIVE": "Actif"
});

function translateUiMessage(message) {
  const text = String(message ?? "").trim().replace(/\s+/g, " ");
  if (getLang() !== "fr") return text;
  const phraseKey = Object.keys(TRANSLATIONS.en).find(key => TRANSLATIONS.en[key] === text);
  return PAGE_TRANSLATIONS[text] || (phraseKey ? TRANSLATIONS.fr[phraseKey] : null) || translateDynamicPhrase(text);
}
const nativeAlert = window.alert.bind(window);
const nativeConfirm = window.confirm.bind(window);
const nativePrompt = window.prompt.bind(window);
window.alert = message => nativeAlert(translateUiMessage(message));
window.confirm = message => nativeConfirm(translateUiMessage(message));
window.prompt = (message, value = "") => nativePrompt(translateUiMessage(message), value);
function translateTextTree(root = document) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.parentElement?.closest('script, style, textarea, [data-no-translate], .theme-controls')
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }
  });
  let node;
  while ((node = walker.nextNode())) {
    const base = translatedTextNodes.get(node) ?? node.nodeValue;
    if (!base.trim()) continue;
    translatedTextNodes.set(node, base);
    const leading = base.match(/^\s*/)?.[0] || '';
    const trailing = base.match(/\s*$/)?.[0] || '';
    const content = base.trim().replace(/\s+/g, ' ');
    const phraseKey = Object.keys(TRANSLATIONS.en).find(key => TRANSLATIONS.en[key] === content);
    const translated = getLang() === 'fr'
      ? (PAGE_TRANSLATIONS[content] || (phraseKey ? TRANSLATIONS.fr[phraseKey] : null) || translateDynamicPhrase(content))
      : content;
    const next = `${leading}${translated}${trailing}`;
    if (node.nodeValue !== next) node.nodeValue = next;
  }

  root.querySelectorAll?.('[placeholder], [title], [aria-label]').forEach(el => {
    ['placeholder', 'title', 'aria-label'].forEach(attr => {
      if (!el.hasAttribute(attr)) return;
      let originals = translatedAttributes.get(el);
      if (!originals) { originals = {}; translatedAttributes.set(el, originals); }
      const current = el.getAttribute(attr);
      if (!(attr in originals) || (current !== originals[attr] && current !== PAGE_TRANSLATIONS[originals[attr]])) originals[attr] = current;
      const value = getLang() === 'fr' ? (PAGE_TRANSLATIONS[originals[attr]] || originals[attr]) : originals[attr];
      if (current !== value) el.setAttribute(attr, value);
    });
  });
}

function getLang() {
  return localStorage.getItem('globalmart-lang') === 'fr' ? 'fr' : 'en';
}

function setLang(lang) {
  lang = lang === 'fr' ? 'fr' : 'en';
  localStorage.setItem('globalmart-lang', lang);
  applyTranslations();
  document.documentElement.lang = lang;
  updateLangToggleUI();
  window.dispatchEvent(new Event('globalmart:languagechange'));
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
  translateTextTree();
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
  const observer = new MutationObserver(records => {
    records.forEach(record => {
      if (record.type === 'characterData') translateTextTree(record.target.parentElement || document);
      record.addedNodes?.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) translateTextTree(node);
        else if (node.nodeType === Node.TEXT_NODE) translateTextTree(node.parentElement || document);
      });
    });
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true });
});
