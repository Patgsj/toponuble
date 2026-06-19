(function () {
  var ROOT      = window.SITE_ROOT || '';
  var LOGO_HREF = ROOT ? ROOT + 'index.html' : '#inicio';
  var NAV_HREF  = ROOT ? ROOT + 'index.html' : '';
  var ASSETS    = ROOT;
  var ACTIVE    = document.body.dataset.activeNav || '';

  // Inyectar estilos de animación una sola vez
  var style = document.createElement('style');
  style.textContent = [
    '@keyframes prtl-nav-in{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:translateY(0)}}',
    '.prtl-nav-in{animation:prtl-nav-in .5s cubic-bezier(.22,.68,0,1.2) forwards}',
    '.prtl-footer-hidden{opacity:0;transform:translateY(20px);transition:opacity .7s ease-out,transform .7s ease-out}',
    '.prtl-footer-in{opacity:1!important;transform:translateY(0)!important}'
  ].join('');
  document.head.appendChild(style);

  function replace(html) {
    return html
      .replace(/\{\{LOGO_HREF\}\}/g, LOGO_HREF)
      .replace(/\{\{NAV_HREF\}\}/g,  NAV_HREF)
      .replace(/\{\{ASSETS\}\}/g,    ASSETS);
  }

  function inject(id, html) {
    var el = document.getElementById(id);
    if (el) el.outerHTML = html;
  }

  Promise.all([
    fetch(ROOT + 'partials/nav.html').then(function (r) { return r.text(); }),
    fetch(ROOT + 'partials/footer.html').then(function (r) { return r.text(); })
  ]).then(function (results) {
    inject('nav-placeholder', replace(results[0]));
    inject('footer-placeholder', replace(results[1]));

    // Animación nav: fade + slide desde arriba
    var navEl = document.getElementById('nav');
    if (navEl) navEl.classList.add('prtl-nav-in');

    // Animación footer: fade + slide desde abajo al entrar al viewport
    var footerEl = document.querySelector('footer');
    if (footerEl) {
      footerEl.classList.add('prtl-footer-hidden');
      var foObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('prtl-footer-in');
            foObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.05 });
      foObs.observe(footerEl);
    }

    // Marcar link activo estático (páginas de blog)
    if (ACTIVE) {
      document.querySelectorAll('.nav-link[data-nav="' + ACTIVE + '"]').forEach(function (el) {
        el.classList.add('nav-link-active');
        el.classList.remove('hover:text-gold');
      });
    }

    // Nav: fondo al hacer scroll
    window.addEventListener('scroll', function () {
      var n = document.getElementById('nav');
      if (!n) return;
      if (window.scrollY > 40) {
        n.style.background     = 'rgba(10,10,10,.95)';
        n.style.backdropFilter = 'blur(14px)';
        n.style.borderBottom   = '1px solid rgba(255,255,255,.05)';
      } else {
        n.style.background     = '';
        n.style.backdropFilter = '';
        n.style.borderBottom   = '';
      }
    });

    // Menú móvil
    var mb = document.getElementById('mb');
    var mm = document.getElementById('mm');
    if (mb && mm) {
      mb.addEventListener('click', function () { mm.classList.toggle('hidden'); });
      mm.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { mm.classList.add('hidden'); });
      });
    }

    // Nav activa por scroll (solo en la página raíz)
    if (!ACTIVE) {
      var navLinks   = document.querySelectorAll('.nav-link');
      var sectionIds = ['inicio','servicios','valores','proceso','nosotros','cobertura','faq','blog','contacto'];
      var sections   = sectionIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);

      var setActiveNav = function (id) {
        navLinks.forEach(function (link) {
          link.classList.toggle('nav-link-active', link.getAttribute('href') === '#' + id);
        });
      };

      var updateActiveNav = function () {
        var marker  = window.scrollY + window.innerHeight * 0.35;
        var current = 'inicio';
        sections.forEach(function (s) { if (marker >= s.offsetTop) current = s.id; });
        setActiveNav(current);
      };

      window.addEventListener('scroll', updateActiveNav);
      window.addEventListener('load', updateActiveNav);
      updateActiveNav();
    }
  });
})();
