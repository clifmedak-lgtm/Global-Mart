(() => {
  const THEME_KEY = 'globalmart-theme';
  const LANG_KEY = 'globalmart-lang';
  const getTheme = () => localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
  const getLang = () => localStorage.getItem(LANG_KEY) === 'fr' ? 'fr' : 'en';

  function setTheme(theme) {
    const nextTheme = theme === 'dark' ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    updateControls();
  }

  document.documentElement.dataset.theme = getTheme();

  function updateControls() {
    const host = document.querySelector('.theme-controls');
    if (!host) return;
    const lang = getLang();
    const dark = getTheme() === 'dark';
    const labels = lang === 'fr'
      ? { light: 'Activer le thème clair', dark: 'Activer le thème sombre', language: 'Langue' }
      : { light: 'Switch to light theme', dark: 'Switch to dark theme', language: 'Language' };
    const themeButton = host.querySelector('.theme-controls__theme');
    host.querySelector('.theme-controls__panel').setAttribute('aria-label', lang === 'fr' ? 'Réglages d’affichage' : 'Appearance settings');
    themeButton.innerHTML = dark
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/></svg>';
    themeButton.setAttribute('aria-label', dark ? labels.light : labels.dark);
    themeButton.setAttribute('title', dark ? labels.light : labels.dark);
    themeButton.setAttribute('aria-pressed', dark ? 'true' : 'false');
    host.querySelector('.theme-controls__label')?.replaceChildren(document.createTextNode(labels.language));
    host.querySelectorAll('.theme-controls__lang').forEach(button => {
      button.setAttribute('aria-pressed', button.dataset.lang === lang ? 'true' : 'false');
    });
  }

  function mountControls() {
    if (document.querySelector('.theme-controls')) return;
    const existingLanguageToggle = document.querySelector('.lang-toggle-btn');
    const dashboardSidebar = document.querySelector('#vendor-sidebar, #admin-sidebar');
    const host = document.createElement('aside');
    host.className = `theme-controls${existingLanguageToggle ? ' theme-controls--theme-only' : ''}${dashboardSidebar && !existingLanguageToggle ? ' theme-controls--sidebar' : ''}`;
    host.dataset.noTranslate = 'true';
    host.innerHTML = existingLanguageToggle
      ? '<div class="theme-controls__panel"><button class="theme-controls__theme" type="button" aria-pressed="false"></button></div>'
      : `<div class="theme-controls__panel" aria-label="Appearance settings">
          <div class="theme-controls__language-group">
            <span class="theme-controls__label">Language</span>
            <div class="theme-controls__languages">
              <button class="theme-controls__lang" type="button" data-lang="en" aria-pressed="false">EN</button>
              <button class="theme-controls__lang" type="button" data-lang="fr" aria-pressed="false">FR</button>
            </div>
          </div>
          <button class="theme-controls__theme" type="button" aria-pressed="false"></button>
        </div>`;

    if (existingLanguageToggle) {
      const group = existingLanguageToggle.parentElement;
      group.parentElement.insertBefore(host, group.nextSibling);
    } else if (dashboardSidebar) {
      dashboardSidebar.append(host);
    } else {
      const cartButton = document.querySelector('header #cart-open-button');
      const target = cartButton?.parentElement;
      if (target) target.insertBefore(host, cartButton);
      else if (document.querySelector('header')) {
        const brand = document.querySelector('header a[href="index.html"]');
        if (brand?.parentElement) brand.parentElement.append(host);
        else host.classList.add('theme-controls--floating-top'), document.body.append(host);
      } else {
        host.classList.add('theme-controls--floating-top');
        document.body.append(host);
      }
    }
    host.querySelectorAll('.theme-controls__lang').forEach(button => {
      button.addEventListener('click', () => {
        if (typeof setLang === 'function') setLang(button.dataset.lang);
        updateControls();
      });
    });
    host.querySelector('.theme-controls__theme').addEventListener('click', () => {
      setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    });
    updateControls();
    mountBackToTop();
  }

  function mountBackToTop() {
    if (document.querySelector('.back-to-top')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'back-to-top';
    button.dataset.noTranslate = 'true';
    button.setAttribute('aria-label', getLang() === 'fr' ? 'Retour en haut' : 'Back to top');
    button.title = getLang() === 'fr' ? 'Retour en haut' : 'Back to top';
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 14 7-7 7 7M12 7v12"/></svg>';
    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.append(button);
    const updateVisibility = () => button.classList.toggle('back-to-top--visible', window.scrollY > 280);
    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountControls, { once: true });
  else mountControls();
  window.addEventListener('storage', event => {
    if (event.key === THEME_KEY) setTheme(event.newValue);
    if (event.key === LANG_KEY) updateControls();
  });
  window.addEventListener('globalmart:languagechange', () => {
    updateControls();
    const button = document.querySelector('.back-to-top');
    if (button) {
      const label = getLang() === 'fr' ? 'Retour en haut' : 'Back to top';
      button.setAttribute('aria-label', label);
      button.title = label;
    }
  });
})();
