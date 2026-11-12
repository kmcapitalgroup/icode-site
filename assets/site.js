/* iCode — interactions du site : apparitions, scène du hero, clavier, graphe Git, Dynamic Island, galerie. */
(function () {
  'use strict';
  var fr = document.documentElement.lang !== 'en';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Apparition progressive des sections.
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  document.querySelectorAll('.reveal, .graph').forEach(function (el) { io ? io.observe(el) : el.classList.add('is-visible'); });

  // L'iPad se redresse au défilement, l'iPhone arrive.
  var stage = document.getElementById('stage');
  if (stage) {
    requestAnimationFrame(function () { setTimeout(function () { stage.classList.add('is-ready'); }, 250); });
    var flatten = function () { stage.classList.toggle('is-flat', window.scrollY > 40); };
    window.addEventListener('scroll', flatten, { passive: true });
    flatten();
  }

  // Halo qui suit le doigt ou la souris sur les cartes.
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // Raccourcis : la carte correspondante s'allume quand on tape la combinaison.
  var keys = document.getElementById('keys');
  if (keys) {
    var section = document.getElementById('clavier');
    var inView = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { inView = en[0].isIntersecting; }, { threshold: 0.25 }).observe(section);
    }
    var flash = function (el) {
      el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit');
      clearTimeout(el._t); el._t = setTimeout(function () { el.classList.remove('hit'); }, 900);
    };
    document.addEventListener('keydown', function (e) {
      if (!inView) return;
      var k = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
      if (e.code && /^Key[A-Z]$/.test(e.code)) k = e.code.slice(3).toLowerCase();
      if (e.code && /^Digit\d$/.test(e.code)) k = e.code.slice(5);
      if (!(e.metaKey || e.ctrlKey)) return;
      var combo;
      if (k === 'g' && e.shiftKey) combo = 'ctrl+shift+g';
      else {
        var mods = ['meta'];
        if (e.altKey) mods.push('alt');
        if (e.shiftKey) mods.push('shift');
        combo = mods.concat(k).join('+');
      }
      var el = keys.querySelector('[data-combo="' + combo + '"]');
      if (el) { e.preventDefault(); flash(el); }
    });
    keys.querySelectorAll('.key').forEach(function (el) { el.addEventListener('click', function () { flash(el); }); });
  }

  // Dynamic Island : compacte, étendue, progression, terminé, en boucle.
  var island = document.getElementById('island');
  if (island) {
    var bar = document.getElementById('island-bar');
    var pct = document.getElementById('island-pct');
    var title = document.getElementById('island-title');
    var meta = document.getElementById('island-meta');
    var T = fr
      ? { push: 'Push vers origin', done: 'Push terminé', meta: '3 commits · 24 objets', ok: 'origin/feature/panier à jour' }
      : { push: 'Pushing to origin', done: 'Push complete', meta: '3 commits · 24 objects', ok: 'origin/feature/cart is up to date' };
    var timers = [];
    var at = function (ms, fn) { timers.push(setTimeout(fn, ms)); };
    var cycle = function () {
      island.className = 'island';
      bar.style.transition = 'none'; bar.style.width = '0'; pct.textContent = '0 %';
      title.textContent = T.push; meta.textContent = T.meta;
      at(700, function () { island.classList.add('compact'); });
      var n = 0;
      at(1000, function () { var iv = setInterval(function () { n = Math.min(100, n + 7); pct.textContent = n + ' %'; if (n >= 100) clearInterval(iv); }, 120); timers.push(iv); });
      at(2600, function () { island.classList.add('expanded'); bar.style.transition = ''; requestAnimationFrame(function () { bar.style.width = '100%'; }); });
      at(5200, function () { island.classList.add('done'); title.textContent = T.done; meta.textContent = T.ok; });
      at(7600, function () { island.classList.remove('expanded'); });
      at(8600, function () { island.classList.remove('compact', 'done'); });
      at(10000, cycle);
    };
    if (reduced) { island.classList.add('expanded', 'done'); bar.style.width = '100%'; title.textContent = T.done; meta.textContent = T.ok; }
    else if ('IntersectionObserver' in window) {
      var running = false;
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting && !running) { running = true; cycle(); }
        else if (!en[0].isIntersecting && running) { running = false; timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); timers = []; }
      }, { threshold: 0.3 }).observe(island);
    } else cycle();
  }

  // Galerie iPad / iPhone.
  var gallery = document.getElementById('gallery');
  var data = window.ICODE_GALLERY;
  if (gallery && data) {
    var tabs = gallery.querySelector('.gallery-tabs');
    var img = document.getElementById('gallery-img');
    var frame = document.getElementById('gallery-frame');
    var caption = document.getElementById('gallery-caption');
    var base = img.getAttribute('src').replace(/[^/]+$/, '');
    var device = 'ipad';
    var show = function (item) {
      var src = base + item[0] + '.webp';
      img.style.opacity = 0;
      var next = new Image();
      next.onload = function () {
        frame.className = 'frame ' + (item[3] || (device === 'ipad' ? 'tablet' : 'phone'));
        img.src = src; img.width = next.naturalWidth; img.height = next.naturalHeight; img.alt = item[2]; img.style.opacity = 1;
      };
      next.src = src;
      caption.textContent = item[2];
    };
    var build = function () {
      tabs.innerHTML = '';
      data[device].forEach(function (item, i) {
        var b = document.createElement('button');
        b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(i === 0)); b.textContent = item[1];
        b.addEventListener('click', function () {
          tabs.querySelectorAll('button').forEach(function (t) { t.setAttribute('aria-selected', String(t === b)); });
          show(item);
        });
        tabs.appendChild(b);
      });
      show(data[device][0]);
    };
    gallery.querySelectorAll('.seg button').forEach(function (b) {
      b.addEventListener('click', function () {
        device = b.dataset.device;
        gallery.querySelectorAll('.seg button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        build();
      });
    });
    build();
  }
})();
