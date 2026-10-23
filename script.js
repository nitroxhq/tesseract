/* Tesseract site script
   ---------------------
   1. Hero typewriter — vanilla, no library, no network
   2. Navbar injection — loads navbar.html, needs HTTP (file:// will fail)
   3. Active link state — computed from the current file, not authored per page
   4. Mobile menu — toggle, Escape, outside click, focus returns to the toggle
   5. Theme picker — device / dark / light, saved under the shared nitrox key
*/
(function () {
  const THEME_KEY = 'nitrox-theme';

  /* ---------- typewriter ---------- */

  /* Replaces the old Typed.js CDN dependency. Everything is local: the phrases
     live here and the animation is plain setTimeout, so it runs with no
     network at all (file:// included). */
  function initTypewriter() {
    const target = document.getElementById('typeWriter');
    if (!target) return;

    /* Wording matches archive/script.js. index.html's ghost + sr-only copy
       assume the last phrase is the one that takes the most room. */
    const phrases = [
      'idea inbox.',
      'focus frontier.',
      'study space.',
      'creativity catalyst.',
      'productivity supertool.',
    ];

    const TYPE_MS = 55;
    const ERASE_MS = 28;
    const HOLD_MS = 2200;
    const GAP_MS = 350;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    /* Reduced motion: land on the full sentence, no looping. */
    const settle = () => {
      target.textContent = phrases[phrases.length - 1];
    };
    if (reduceMotion.matches) {
      settle();
      return;
    }

    let phrase = 0;
    let visible = 0;
    let erasing = false;
    let timer;

    const tick = () => {
      const text = phrases[phrase];

      if (!erasing) {
        visible += 1;
        target.textContent = text.slice(0, visible);
        if (visible === text.length) {
          erasing = true;
          timer = setTimeout(tick, HOLD_MS);
        } else {
          timer = setTimeout(tick, TYPE_MS);
        }
        return;
      }

      visible -= 1;
      target.textContent = text.slice(0, visible);
      if (visible === 0) {
        erasing = false;
        phrase = (phrase + 1) % phrases.length;
        timer = setTimeout(tick, GAP_MS);
      } else {
        timer = setTimeout(tick, ERASE_MS);
      }
    };

    timer = setTimeout(tick, 600);

    /* If the OS setting flips mid-session, stop cleanly on the full sentence. */
    const onMotionChange = () => {
      if (!reduceMotion.matches) return;
      clearTimeout(timer);
      settle();
    };
    if (reduceMotion.addEventListener) {
      reduceMotion.addEventListener('change', onMotionChange);
    } else {
      reduceMotion.addListener(onMotionChange);
    }

    /* The timer chain stops itself when this tab is closed; nothing to clean up. */
  }

  /* ---------- nav ---------- */

  function initNav() {
    const nav = document.querySelector('.nitrox-nav');
    if (!nav) return;

    /* active link: compare the link's file with the current file. A link that
       points at a hash on the current page is only active when that hash is.
       Re-run on hashchange so in-page anchors update the marker without a
       reload (e.g. home -> features). */
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';

    const markActive = () => {
      const currentHash = window.location.hash.replace('#', '');
      nav.querySelectorAll('.nav-buttons').forEach((link) => {
        const href = (link.getAttribute('href') || '').replace(/^\.\//, '');
        const [file, hash = ''] = href.split('#');
        const match = file === currentFile && hash === currentHash;
        link.classList.toggle('active', match);
        if (match) {
          link.setAttribute('aria-current', hash ? 'location' : 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    };

    markActive();
    window.addEventListener('hashchange', markActive);

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

    const wideScreen = window.matchMedia('(min-width: 951px)');
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
    initTypewriter();

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
