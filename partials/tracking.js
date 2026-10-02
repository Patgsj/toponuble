// ==========================================
// MEDICIÓN DE CAPTACIÓN DE LEADS
// ==========================================
// Único lugar donde viven los eventos de contacto del sitio. A diferencia de los
// sitios hermanos, acá el snippet de gtag ya está inline en el <head> de las cinco
// páginas: este módulo solo agrega los eventos.
//
// Los enlaces se detectan por delegación en `document`, así que sirve igual para el
// home, para los artículos del blog y para el footer que se inyecta después. Antes
// la función de conversión vivía inline en index.html: los WhatsApp de los cuatro
// artículos no la tenían ni definida y eran invisibles para Ads.
(function () {
  'use strict';

  var SITIO = 'toponuble';
  var CONVERSION_ADS = 'AW-18107428909/KslRCLDVlaMcEK3gpbpD';

  function gtagDisponible() {
    return typeof window.gtag === 'function';
  }

  function registrar(evento, datos) {
    if (!gtagDisponible()) return;

    var parametros = { sitio: SITIO, pagina: location.pathname };
    for (var clave in datos) {
      if (Object.prototype.hasOwnProperty.call(datos, clave)) parametros[clave] = datos[clave];
    }
    window.gtag('event', evento, parametros);

    // Google Ads cuenta una sola conversión de contacto, sea cual sea el canal.
    window.gtag('event', 'conversion', {
      send_to: CONVERSION_ADS,
      value: 1.0,
      currency: 'CLP'
    });
  }

  window.registrarLead = registrar;

  function seccionDe(elemento) {
    var marco = elemento.closest('header, footer, nav, aside, article');
    if (marco) return marco.id || marco.tagName.toLowerCase();

    var seccion = elemento.closest('section[id], div[id]');
    if (seccion && seccion.id) return seccion.id;

    return 'sin-seccion';
  }

  function etiquetaDe(elemento) {
    var texto = (elemento.getAttribute('aria-label') || elemento.textContent || '')
      .replace(/\s+/g, ' ')
      .trim();
    return texto ? texto.slice(0, 60) : 'sin-texto';
  }

  var CANALES = [
    ['contacto_whatsapp', /wa\.me|api\.whatsapp\.com/i],
    ['contacto_telefono', /^tel:/i],
    ['contacto_email', /^mailto:/i]
  ];

  document.addEventListener('click', function (e) {
    var enlace = e.target.closest && e.target.closest('a[href]');
    if (!enlace) return;

    var destino = enlace.getAttribute('href') || '';
    for (var i = 0; i < CANALES.length; i++) {
      if (CANALES[i][1].test(destino)) {
        registrar(CANALES[i][0], { seccion: seccionDe(enlace), cta: etiquetaDe(enlace) });
        return;
      }
    }
  }, true);

  // El chat vive en un iframe de otro origen: el widget reemite el aviso como evento
  // del DOM cuando el worker ya mandó los correos del lead.
  document.addEventListener('chatbot:lead', function (e) {
    var tipo = (e.detail && e.detail.lead) || 'consulta';
    registrar('chatbot_lead', { seccion: 'asistente', cta: tipo });
  });

  // Apertura desde la píldora flotante: es del widget, no del sitio, y antes quedaba
  // invisible. Va con gtag directo y no con registrar() porque abrir el chat no es un
  // contacto y no debe contar como conversión de Ads (igual que los CTA de abajo).
  document.addEventListener('chatbot:abierto', function () {
    if (!gtagDisponible()) return;
    window.gtag('event', 'asistente_abierto', {
      sitio: SITIO,
      pagina: location.pathname,
      seccion: 'boton-flotante',
      cta: 'pildora'
    });
  });

  // CTA del sitio que abren el asistente. Si el widget todavía no cargó, el CTA no
  // queda muerto: baja al formulario de contacto.
  document.addEventListener('click', function (e) {
    var boton = e.target.closest && e.target.closest('[data-abrir-asistente]');
    if (!boton) return;

    e.preventDefault();
    var chat = window.chatAsistente || window.TopoNubleChat;
    var abrir = chat && (chat.abrir || chat.open);
    if (abrir) {
      abrir.call(chat);
      if (gtagDisponible()) {
        window.gtag('event', 'asistente_abierto', {
          sitio: SITIO,
          pagina: location.pathname,
          seccion: seccionDe(boton),
          cta: etiquetaDe(boton)
        });
      }
    } else {
      window.location.href = (window.SITE_ROOT || '') + 'index.html#contacto';
    }
  });
}());
