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

  // Téléchargement direct : le bouton du DMG s'active tout seul dès qu'une release « mac-v… »
  // de kmcapitalgroup/icode-site contient iCode.dmg.
  var ready = function (a, href) {
    a.href = href; a.removeAttribute('aria-disabled'); a.removeAttribute('tabindex');
    var lbl = a.querySelector('.lbl');
    if (lbl && a.dataset.ready) lbl.textContent = a.dataset.ready;
  };
  var dmg = document.querySelectorAll('a[data-dmg]');
  if (dmg.length && window.fetch) {
    fetch('https://api.github.com/repos/kmcapitalgroup/icode-site/releases?per_page=30').then(function (r) { return r.ok ? r.json() : []; }).then(function (list) {
      var rel = (list || []).filter(function (x) { return !x.draft && /^mac-v/.test(x.tag_name); })[0];
      var asset = rel && (rel.assets || []).filter(function (x) { return x.name === 'iCode.dmg'; })[0];
      if (!asset) return;
      var version = rel.tag_name.replace(/^mac-v/, '');
      dmg.forEach(function (a) { ready(a, asset.browser_download_url); });
      document.querySelectorAll('[data-version]').forEach(function (el) { el.textContent = version; });
      document.querySelectorAll('[data-when-ready]').forEach(function (el) { el.hidden = false; });
      document.querySelectorAll('[data-when-waiting]').forEach(function (el) { el.hidden = true; });
    }).catch(function () {});
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

  // Galerie iPad / iPhone, portrait / paysage, avec transitions et défilement automatique.
  var gallery = document.getElementById('gallery');
  var data = window.ICODE_GALLERY;
  if (gallery && data) {
    var tabs = gallery.querySelector('.gallery-tabs');
    var frame = document.getElementById('gallery-frame');
    var screen = frame.querySelector('.screen');
    var caption = document.getElementById('gallery-caption');
    var base = screen.querySelector('img').getAttribute('src').replace(/[^/]+$/, '');
    var prefix = { ipad: { land: 'ipadl', port: 'ipad' }, iphone: { land: 'iphonel', port: 'iphone' }, mac: { land: 'mac', port: 'mac' } };
    var state = { device: data.ipad ? 'ipad' : Object.keys(data)[0], ori: { ipad: 'land', iphone: 'port', mac: 'land' }, index: 0 };
    var cache = {};
    var busy = Promise.resolve();
    var DWELL = 5200;
    var load = function (src) {
      if (!cache[src]) cache[src] = new Promise(function (ok) {
        var im = new Image(); im.decoding = 'async';
        im.onload = function () { ok(im); }; im.onerror = function () { ok(null); };
        im.src = src;
      });
      return cache[src];
    };
    var srcFor = function (i, device, ori) {
      return base + prefix[device || state.device][ori || state.ori[state.device]] + '-' + data[device || state.device][i][0] + '.webp';
    };
    var wait = function (ms) { return new Promise(function (ok) { setTimeout(ok, reduced ? 0 : ms); }); };
    var frameClass = function () {
      if (state.device === 'mac') return 'frame mac-frame land';
      return 'frame ' + (state.device === 'ipad' ? 'tablet' : 'phone') + ' ' + state.ori[state.device];
    };
    var place = function (im, alt, dir) {
      var old = screen.querySelector('img.is-on');
      var img = document.createElement('img');
      img.src = im.src; img.width = im.naturalWidth; img.height = im.naturalHeight; img.alt = alt;
      img.className = 'is-in ' + (dir < 0 ? 'from-left' : dir > 0 ? 'from-right' : 'from-none');
      screen.appendChild(img);
      screen.style.aspectRatio = im.naturalWidth + ' / ' + im.naturalHeight;
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        img.className = 'is-on';
        if (old) { old.className = 'is-out ' + (dir < 0 ? 'to-right' : dir > 0 ? 'to-left' : 'to-none'); setTimeout(function () { old.remove(); }, 700); }
      }); });
      screen.querySelectorAll('img').forEach(function (x) { if (x !== img && x !== old) x.remove(); });
    };
    // Prochain écran dans le même cadre : glissé et fondu, dans le sens de la navigation.
    var go = function (i, dir) {
      busy = busy.then(function () {
        var item = data[state.device][i];
        state.index = i;
        tabs.querySelectorAll('button').forEach(function (t, k) { t.setAttribute('aria-selected', String(k === i)); });
        caption.classList.add('swap');
        return load(srcFor(i)).then(function (im) {
          if (!im) return;
          place(im, item[2], dir);
          caption.textContent = item[2]; caption.classList.remove('swap');
          load(srcFor((i + 1) % data[state.device].length));
        });
      });
      return busy;
    };
    // L'appareil tourne d'un quart de tour, puis l'écran se redessine dans le nouveau sens.
    var rotate = function (ori) {
      if (state.device === 'mac' || state.ori[state.device] === ori) return;
      busy = busy.then(function () {
        var before = frame.getBoundingClientRect();
        var toPortrait = ori === 'port';
        state.ori[state.device] = ori;
        syncSeg();
        return load(srcFor(state.index)).then(function (im) {
          if (!im) return;
          screen.querySelectorAll('img').forEach(function (x) { x.classList.add('dim'); });
          frame.style.transition = 'none';
          screen.style.transition = 'none';
          frame.className = frameClass() + ' turning';
          screen.style.aspectRatio = im.naturalWidth + ' / ' + im.naturalHeight;
          var after = frame.getBoundingClientRect();
          var s = before.width / after.height;
          screen.style.transition = '';
          frame.style.transform = 'rotate(' + (toPortrait ? -90 : 90) + 'deg) scale(' + s.toFixed(3) + ')';
          frame.getBoundingClientRect();
          frame.style.transition = '';
          frame.style.transform = '';
          place(im, data[state.device][state.index][2], 0);
          return wait(760).then(function () { frame.classList.remove('turning'); });
        });
      });
    };
    // iPad ⇄ iPhone : l'appareil s'efface et l'autre arrive.
    var switchDevice = function (device) {
      if (device === state.device) return;
      busy = busy.then(function () {
        frame.classList.add('leaving');
        return Promise.all([wait(320), load(srcFor(0, device, state.ori[device]))]).then(function (r) {
          state.device = device; state.index = 0;
          build();
          screen.innerHTML = '';
          frame.className = frameClass() + ' entering';
          var im = r[1];
          if (im) { place(im, data[device][0][2], 0); caption.textContent = data[device][0][2]; }
          frame.getBoundingClientRect();
          frame.classList.remove('entering');
          return wait(420);
        });
      });
    };
    var segDevice = gallery.querySelectorAll('[data-device]');
    var segOri = gallery.querySelectorAll('[data-ori]');
    var syncSeg = function () {
      segDevice.forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.device === state.device)); });
      segOri.forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.ori === state.ori[state.device])); });
      var oriGroup = gallery.querySelector('.seg-ori');
      if (oriGroup) oriGroup.classList.toggle('is-off', state.device === 'mac');
    };
    var build = function () {
      tabs.innerHTML = '';
      data[state.device].forEach(function (item, i) {
        var b = document.createElement('button');
        b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(i === state.index));
        b.innerHTML = '<span></span>'; b.firstChild.textContent = item[1];
        b.addEventListener('click', function () { stop(true); if (i !== state.index) go(i, i > state.index ? 1 : -1); });
        tabs.appendChild(b);
      });
      syncSeg();
    };
    // Défilement automatique tant que la galerie est visible ; il s'arrête dès qu'on choisit soi-même.
    var timer = null, visible = false, manual = false, paused = false;
    var tick = function () {
      clearTimeout(timer);
      tabs.querySelectorAll('button').forEach(function (t) { t.classList.remove('run'); });
      if (reduced || manual || paused || !visible) return;
      var cur = tabs.querySelectorAll('button')[state.index];
      if (cur) { cur.style.setProperty('--dwell', DWELL + 'ms'); cur.getBoundingClientRect(); cur.classList.add('run'); }
      timer = setTimeout(function () {
        go((state.index + 1) % data[state.device].length, 1).then(tick);
      }, DWELL);
    };
    var stop = function (forever) { if (forever) manual = true; tick(); };
    segDevice.forEach(function (b) { b.addEventListener('click', function () { stop(true); switchDevice(b.dataset.device); }); });
    segOri.forEach(function (b) { b.addEventListener('click', function () { stop(true); rotate(b.dataset.ori); }); });
    frame.addEventListener('click', function () { stop(true); go((state.index + 1) % data[state.device].length, 1); });
    gallery.addEventListener('mouseenter', function () { paused = true; tick(); });
    gallery.addEventListener('mouseleave', function () { paused = false; tick(); });
    // Balayage horizontal sur mobile.
    var x0 = null;
    frame.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    frame.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) < 40) return;
      stop(true);
      var n = data[state.device].length;
      go(dx < 0 ? (state.index + 1) % n : (state.index - 1 + n) % n, dx < 0 ? 1 : -1);
    }, { passive: true });
    tabs.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var n = data[state.device].length, d = e.key === 'ArrowRight' ? 1 : -1, i = (state.index + d + n) % n;
      stop(true); go(i, d); tabs.querySelectorAll('button')[i].focus();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; tick(); }, { threshold: 0.35 }).observe(frame);
    }
    build();
    frame.className = frameClass();
    go(0, 0);
  }
})();
