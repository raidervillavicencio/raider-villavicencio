/* ============================================================
   RAIDER VILLAVICENCIO — interacciones
   ============================================================ */
(function(){
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Imágenes que aún no existen ----------
     Mientras no subas tus fotos a la carpeta /img, cada hueco
     muestra el nombre del archivo que debes colocar. */
  $$('img').forEach(img => {
    img.addEventListener('error', () => {
      const marco = img.closest('.media') || img.closest('.hero__media');
      if (!marco || marco.classList.contains('media--vacia')) return;
      if (marco.classList.contains('hero__media')) {
        marco.style.background = 'repeating-linear-gradient(135deg,#131714 0 14px,#1A201C 14px 28px)';
        img.style.display = 'none';
        return;
      }
      marco.classList.add('media--vacia');
      img.style.display = 'none';
      const aviso = document.createElement('span');
      aviso.className = 'media__aviso';
      aviso.innerHTML = 'Coloca tu foto aquí<b>' + img.getAttribute('src') + '</b>';
      marco.appendChild(aviso);
    });
    if (img.complete && img.naturalWidth === 0) img.dispatchEvent(new Event('error'));
  });

  /* ---------- 2. Barra de navegación ---------- */
  const nav = $('#nav');
  const btnMenu = $('#btnMenu');
  const menu = $('#menu');
  const arriba = $('#arriba');

  const cerrarMenu = () => {
    menu.classList.remove('abierto');
    btnMenu.setAttribute('aria-expanded', 'false');
    btnMenu.setAttribute('aria-label', 'Abrir menú');
    document.body.classList.remove('is-locked');
  };

  btnMenu.addEventListener('click', () => {
    const abierto = menu.classList.toggle('abierto');
    btnMenu.setAttribute('aria-expanded', String(abierto));
    btnMenu.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('is-locked', abierto);
  });

  $$('#menu a').forEach(a => a.addEventListener('click', cerrarMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarMenu(); });

  const alScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-fija', y > 40);
    arriba.classList.toggle('visible', y > 700);
  };
  window.addEventListener('scroll', alScroll, { passive:true });
  alScroll();

  arriba.addEventListener('click', () => window.scrollTo({ top:0, behavior: sinMovimiento ? 'auto' : 'smooth' }));

  /* ---------- 3. Enlace activo según la sección visible ---------- */
  const enlaces = $$('.menu__links a');
  const secciones = enlaces
    .map(a => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);

  if ('IntersectionObserver' in window && secciones.length) {
    const obsNav = new IntersectionObserver(entradas => {
      entradas.forEach(e => {
        if (!e.isIntersecting) return;
        enlaces.forEach(a => a.classList.toggle('activo', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin:'-45% 0px -50% 0px' });
    secciones.forEach(s => obsNav.observe(s));
  }

  /* ---------- 4. Revelado suave al entrar en pantalla ---------- */
  const reveladores = $$('.rev');
  if ('IntersectionObserver' in window && !sinMovimiento) {
    const obsRev = new IntersectionObserver((entradas, obs) => {
      entradas.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold:0.14 });
    reveladores.forEach(el => obsRev.observe(el));
  } else {
    reveladores.forEach(el => el.classList.add('visible'));
  }

  /* ---------- 5. Contadores de cifras ---------- */
  const cifras = $$('.cifra strong');
  const animarCifra = el => {
    const meta = parseInt(el.dataset.valor, 10) || 0;
    const pre = el.dataset.prefijo || '';
    const suf = el.dataset.sufijo || '';
    if (sinMovimiento) { el.innerHTML = '<em>' + pre + '</em>' + meta + '<em>' + suf + '</em>'; return; }
    const inicio = performance.now();
    const dur = 1400;
    const paso = ahora => {
      const p = Math.min((ahora - inicio) / dur, 1);
      const suave = 1 - Math.pow(1 - p, 3);
      el.innerHTML = '<em>' + pre + '</em>' + Math.round(meta * suave) + '<em>' + suf + '</em>';
      if (p < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  };

  if ('IntersectionObserver' in window) {
    const obsCifras = new IntersectionObserver((entradas, obs) => {
      entradas.forEach(e => { if (e.isIntersecting) { animarCifra(e.target); obs.unobserve(e.target); } });
    }, { threshold:0.6 });
    cifras.forEach(c => obsCifras.observe(c));
  } else {
    cifras.forEach(animarCifra);
  }

  /* ---------- 6. Visor de galería ---------- */
  const fotos   = $$('#galeria .media, .nosotros__fotos .media');
  const visor   = $('#visor');
  const visorImg = $('#visorImg');
  const visorPie = $('#visorPie');
  let indice = 0;

  const mostrar = i => {
    const total = fotos.length;
    indice = (i + total) % total;
    const img = fotos[indice].querySelector('img');
    visorImg.src = img.getAttribute('src');
    visorImg.alt = img.alt;
    visorPie.textContent = img.alt + '  (' + (indice + 1) + ' de ' + total + ')';
  };

  const abrirVisor = i => {
    mostrar(i);
    visor.classList.add('abierto');
    document.body.classList.add('is-locked');
    $('#visorCerrar').focus();
  };
  const cerrarVisor = () => {
    visor.classList.remove('abierto');
    document.body.classList.remove('is-locked');
  };

  fotos.forEach((f, i) => {
    f.addEventListener('click', () => abrirVisor(i));
    f.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirVisor(i); }
    });
  });

  $('#visorCerrar').addEventListener('click', cerrarVisor);
  $('#visorAnt').addEventListener('click', () => mostrar(indice - 1));
  $('#visorSig').addEventListener('click', () => mostrar(indice + 1));
  visor.addEventListener('click', e => { if (e.target === visor) cerrarVisor(); });
  document.addEventListener('keydown', e => {
    if (!visor.classList.contains('abierto')) return;
    if (e.key === 'Escape') cerrarVisor();
    if (e.key === 'ArrowLeft') mostrar(indice - 1);
    if (e.key === 'ArrowRight') mostrar(indice + 1);
  });

  /* ---------- 7. Cuenta regresiva de la próxima rodada ---------- */
  const reloj = $('#reloj');
  if (reloj) {
    const objetivo = new Date(reloj.dataset.fecha).getTime();
    const dd = reloj.querySelector('[data-d]'), hh = reloj.querySelector('[data-h]');
    const mm = reloj.querySelector('[data-m]'), ss = reloj.querySelector('[data-s]');
    const dosDigitos = n => String(n).padStart(2, '0');

    const tic = () => {
      const falta = objetivo - Date.now();
      if (isNaN(objetivo) || falta <= 0) {
        dd.textContent = hh.textContent = mm.textContent = ss.textContent = '00';
        return;
      }
      dd.textContent = dosDigitos(Math.floor(falta / 86400000));
      hh.textContent = dosDigitos(Math.floor(falta / 3600000) % 24);
      mm.textContent = dosDigitos(Math.floor(falta / 60000) % 60);
      ss.textContent = dosDigitos(Math.floor(falta / 1000) % 60);
    };
    tic();
    setInterval(tic, 1000);
  }

  /* ---------- 8. Preguntas frecuentes ---------- */
  $$('.faq__btn').forEach(btn => {
    const panel = btn.nextElementSibling;
    btn.addEventListener('click', () => {
      const abierto = btn.getAttribute('aria-expanded') === 'true';
      $$('.faq__btn').forEach(otro => {
        otro.setAttribute('aria-expanded', 'false');
        otro.nextElementSibling.style.maxHeight = null;
      });
      if (!abierto) {
        btn.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ---------- 9. Formulario ---------- */
  const form = $('#formulario');
  if (form) {
    const marcarError = (campo, hay) => campo.classList.toggle('error', hay);

    form.addEventListener('submit', e => {
      e.preventDefault();
      let valido = true;

      $$('.campo', form).forEach(campo => {
        const control = campo.querySelector('input, select, textarea');
        if (!control || !control.required) return;
        let malo = !control.value.trim();
        if (control.id === 'telefono') {
          malo = control.value.replace(/\D/g, '').length < 7;
        }
        marcarError(campo, malo);
        if (malo && valido) { control.focus(); }
        if (malo) valido = false;
      });

      const acepta = $('#acepta');
      if (!acepta.checked) {
        valido = false;
        acepta.focus();
        acepta.parentElement.style.color = '#ff8b80';
      } else {
        acepta.parentElement.style.color = '';
      }

      if (!valido) return;

      const datos = {
        nombre: $('#nombre').value.trim(),
        telefono: $('#telefono').value.trim(),
        ciudad: $('#ciudad').value.trim(),
        moto: $('#moto').value.trim(),
        experiencia: $('#experiencia').value,
        mensaje: $('#mensaje').value.trim()
      };

      const texto =
        'Hola Raider Villavicencio, quiero ser parte del grupo.\n\n' +
        'Nombre: ' + datos.nombre + '\n' +
        'WhatsApp: ' + datos.telefono + '\n' +
        'Ciudad: ' + datos.ciudad + '\n' +
        'Moto: ' + datos.moto + '\n' +
        'Tiempo rodando: ' + datos.experiencia +
        (datos.mensaje ? '\n\n' + datos.mensaje : '');

      const numero = form.dataset.whatsapp;
      window.open('https://wa.me/' + numero + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');

      $('#formOk').classList.add('visible');
      form.reset();
    });

    /* quita el aviso de error en cuanto la persona corrige */
    $$('.campo input, .campo select, .campo textarea', form).forEach(control => {
      control.addEventListener('input', () => marcarError(control.closest('.campo'), false));
      control.addEventListener('change', () => marcarError(control.closest('.campo'), false));
    });
  }

  /* ---------- 10. Año del pie ---------- */
  $('#anio').textContent = new Date().getFullYear();

})();