(function () {
  var ROOT      = window.SITE_ROOT || '';
  var LOGO_HREF = ROOT ? ROOT + 'index.html' : '#inicio';
  var NAV_HREF  = ROOT ? ROOT + 'index.html' : '';
  var ASSETS    = ROOT;
  var ACTIVE    = document.body.dataset.activeNav || '';

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

    // Marcar link activo estático (páginas de blog)
    if (ACTIVE) {
      document.querySelectorAll('.nav-link[data-nav="' + ACTIVE + '"]').forEach(function (el) {
        el.classList.add('nav-link-active');
      });
    }

    // Nav: borde más marcado al hacer scroll (el estilo vive en css/chrome.css)
    var onScroll = function () {
      var n = document.getElementById('nav');
      if (n) n.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Botón flotante del asistente: nunca baja sobre el pie de página.
    // Mientras el pie no se ve, queda en su lugar; cuando aparece, sube y se
    // detiene justo encima de su borde superior. Usa la propiedad `translate`
    // para no pisar el `transform` que el widget pueda usar.
    var GAP = 16;
    var ajustarBoton = function () {
      var boton = document.querySelector('.tn-chat-anchor');
      var pie = document.querySelector('footer');
      if (!boton || !pie) return;
      boton.style.translate = '';
      var base = boton.getBoundingClientRect().bottom;
      var limite = pie.getBoundingClientRect().top - GAP;
      var sobra = base - limite;
      boton.style.translate = sobra > 0 ? '0 ' + (-sobra) + 'px' : '';
    };
    var pendiente = false;
    var pedirAjuste = function () {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(function () { pendiente = false; ajustarBoton(); });
    };
    window.addEventListener('scroll', pedirAjuste, { passive: true });
    window.addEventListener('resize', pedirAjuste);
    window.addEventListener('load', pedirAjuste);
    pedirAjuste();

    // Menú móvil
    var mb = document.getElementById('mb');
    var mm = document.getElementById('mm');
    if (mb && mm) {
      var setOpen = function (open) {
        mm.classList.toggle('hidden', !open);
        mb.setAttribute('aria-expanded', open ? 'true' : 'false');
        mb.textContent = open ? 'Cerrar' : 'Menú';
      };
      mb.addEventListener('click', function () { setOpen(mm.classList.contains('hidden')); });
      // Cualquier enlace del nav (incluido el logo) cierra el menú
      document.querySelectorAll('#nav a').forEach(function (a) {
        a.addEventListener('click', function () { setOpen(false); });
      });
    }

    // Nav activa por scroll (solo en la página raíz)
    if (!ACTIVE) {
      var navLinks   = document.querySelectorAll('.nav-link');
      var sectionIds = ['inicio','servicios','proceso','nosotros','cobertura','faq','blog','contacto'];
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

      window.addEventListener('scroll', updateActiveNav, { passive: true });
      window.addEventListener('load', updateActiveNav);
      updateActiveNav();
    }
  });
})();
