/* Tesseract site script
   ---------------------
   1. Navbar injection — loads navbar.html, needs HTTP (file:// will fail)
   2. Active link state — computed from the current file, not authored per page
   3. Mobile menu — toggle, Escape, outside click, focus returns to the toggle
   4. Theme picker — device / dark / light, saved under the shared nitrox key
*/
(function () {
  const THEME_KEY = 'nitrox-theme';

  /* ---------- nav ---------- */

  function initNav() {
    const nav = document.querySelector('.nitrox-nav');
    if (!nav) return;

    /* active link: compare the link's file with the current file. A link that
       points at a hash on the current page is only active when that hash is. */
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const currentHash = window.location.hash.replace('#', '');

    nav.querySelectorAll('.nav-buttons').forEach((link) => {
      const href = (link.getAttribute('href') || '').replace(/^\.\//, '');
      const [file, hash = ''] = href.split('#');
      if (file !== currentFile) return;
      if (hash !== currentHash) return;
      link.classList.add('active');
      link.setAttribute('aria-current', hash ? 'location' : 'page');
    });

    /* mobile menu */
    const toggle = nav.querySelector('.nav-toggle');
    const menu = nav.querySelector('.nav-menu');
    if (!toggle || !menu) return;

    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));

    nav.querySelectorAll('.nav-buttons').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('click', (event) => {
      if (!nav.classList.contains('is-open')) return;
      if (!nav.contains(event.target)) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !nav.classList.contains('is-open')) return;
      setOpen(false);
      toggle.focus();
    });

    const wideScreen = window.matchMedia('(min-width: 901px)');
    const closeOnWide = (event) => {
      if (event.matches) setOpen(false);
    };
    if (wideScreen.addEventListener) {
      wideScreen.addEventListener('change', closeOnWide);
    } else {
      wideScreen.addListener(closeOnWide);
    }
  }

  /* ---------- theme ---------- */

  function initTheme() {
    const root = document.documentElement;
    const buttons = document.querySelectorAll('.theme-btn');
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    /* theme.js already applied the saved preference before paint; read it back
       from the element instead of touching storage a second time. */
    const current = () => {
      const value = root.dataset.theme;
      return value === 'dark' || value === 'light' ? value : 'device';
    };

    const resolved = (value) => {
      if (value === 'dark' || value === 'light') return value;
      return prefersDark.matches ? 'dark' : 'light';
    };

    const sync = (value) => {
      buttons.forEach((btn) => {
        btn.setAttribute('aria-pressed', String(btn.dataset.themeValue === value));
      });
      if (themeMeta) {
        themeMeta.setAttribute('content', resolved(value) === 'dark' ? '#0f0f0f' : '#f4effc');
      }
    };

    sync(current());

    if (!buttons.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.themeValue;
        root.dataset.theme = value;
        try {
          localStorage.setItem(THEME_KEY, value);
        } catch (error) {
          /* private mode: the theme still applies for this page */
        }
        sync(value);
      });
    });

    const onSchemeChange = () => {
      if (current() === 'device') sync('device');
    };
    if (prefersDark.addEventListener) {
      prefersDark.addEventListener('change', onSchemeChange);
    } else {
      prefersDark.addListener(onSchemeChange);
    }
  }

  /* ---------- boot ---------- */

  document.addEventListener('DOMContentLoaded', () => {
    const placeholder = document.getElementById('nav-placeholder');
    if (!placeholder) {
      initTheme();
      return;
    }

    fetch('./navbar.html')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.text();
      })
      .then((markup) => {
        placeholder.outerHTML = markup;
        initNav();
        initTheme();
      })
      .catch((err) => {
        console.error('Failed to load navbar:', err);
        initTheme();
      });
  });
})();
