/* IDatabase — interactions : apparitions, mise à l'échelle des écrans, démo du hero, détection, production, console SQL, tutoriel. */
(function () {
  'use strict';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };
  var onView = function (el, fn, threshold) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { io.disconnect(); fn(); }
    }, { threshold: threshold || 0.35 });
    io.observe(el);
  };

  // Apparition progressive.
  var rio = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  document.querySelectorAll('.reveal, .schema').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('is-visible'); });

  // Les écrans reproduits en HTML ont une taille fixe : on les met à l'échelle de leur cadre.
  var scalers = document.querySelectorAll('.scaler');
  var fit = function () {
    scalers.forEach(function (s) {
      var w = parseFloat(getComputedStyle(s).getPropertyValue('--w'));
      if (s.clientWidth && w) s.style.setProperty('--s', s.clientWidth / w);
    });
  };
  fit();
  if ('ResizeObserver' in window) { var ro = new ResizeObserver(fit); scalers.forEach(function (s) { ro.observe(s); }); }
  else window.addEventListener('resize', fit);

  // Hero : la sélection parcourt les lignes et l'inspecteur suit.
  var rows = $('hero-rows');
  if (rows && !reduced) {
    var list = rows.querySelectorAll('.row');
    var picks = [3, 0, 7, 5, 11, 2];
    var k = 0;
    var show = function () {
      var i = picks[k % picks.length];
      list.forEach(function (r, j) { r.classList.toggle('sel', j === i); });
      var c = list[i].children;
      $('ins-title').textContent = 'Ligne ' + (i + 1);
      $('ins-first').textContent = c[2].textContent;
      $('ins-last').textContent = c[3].textContent;
      $('ins-email').textContent = c[4].textContent;
      $('ins-orders').textContent = list[i].getAttribute('data-orders');
      var changed = k % 2 === 0;
      $('ins-email-f').classList.toggle('changed', changed);
      $('ins-badge').style.visibility = changed ? 'visible' : 'hidden';
      k++;
    };
    setInterval(function () { if (!document.hidden) show(); }, 2600);
  }

  // Détection : les fichiers du projet sont reconnus un à un.
  var scan = $('scan');
  if (scan) {
    var items = scan.querySelectorAll('.scan-list li');
    var done = function () { $('scan-prog').textContent = 'Terminé'; };
    if (reduced) { items.forEach(function (li) { li.classList.add('found'); }); done(); }
    else onView(scan, function () {
      items.forEach(function (li, i) { setTimeout(function () { li.classList.add('found'); if (i === items.length - 1) done(); }, 500 + i * 650); });
    });
  }

  // Production : bascule Local / Production.
  var envs = $('envs');
  if (envs) {
    var T = {
      local: { name: 'Boutique · local', tag: 'LOCAL · LECTURE ET ÉCRITURE', title: 'Exécutée · 214 lignes modifiées', text: 'Base locale : tu écris librement.', icon: '<path d="m5 12.5 4.5 4.5L19 7.5"/>' },
      prod: { name: 'Boutique · prod', tag: 'PRODUCTION · LECTURE SEULE', title: 'Arrêtée avant l’envoi', text: 'Cette requête modifie des données et la production est en lecture seule. Autorise l’écriture pour cette session si c’est voulu.', icon: '<rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>' }
    };
    var setEnv = function (env) {
      envs.classList.toggle('prod', env === 'prod');
      envs.querySelectorAll('[data-env]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.env === env)); });
      $('env-name').textContent = T[env].name; $('env-tag').textContent = T[env].tag;
      $('verdict-title').textContent = T[env].title; $('verdict-text').textContent = T[env].text;
      $('verdict-icon').innerHTML = T[env].icon;
    };
    envs.querySelectorAll('[data-env]').forEach(function (b) { b.addEventListener('click', function () { setEnv(b.dataset.env); }); });
  }

  // Console SQL : le résultat arrive, relançable avec le bouton ou ⌘↵.
  var result = $('result');
  if (result) {
    var run = function () {
      result.classList.remove('show'); void result.offsetWidth;
      setTimeout(function () { result.classList.add('show'); }, 180);
    };
    if (reduced) result.classList.add('show'); else onView(result, run, 0.2);
    $('run').addEventListener('click', run);
    var consoleEl = $('console');
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        var r = consoleEl.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) { e.preventDefault(); run(); }
      }
    });
  }

  // Tutoriel interactif.
  var tuto = $('tuto');
  if (tuto) {
    var steps = [
      { t: 'Ouvre une connexion', p: 'Tes bases détectées t’attendent sur l’accueil. Touche « Boutique · local » pour l’ouvrir.',
        d: '<button type="button" class="chip" data-act style="height:52px;padding:0 18px;border-radius:14px;gap:12px"><span class="badge" style="width:30px;height:30px;border-radius:8px;display:grid;place-items:center;background:#173129;color:var(--mint);font:700 12px var(--display)">PG</span><span style="font-weight:600">Boutique · local</span></button>', ok: '<span class="mint">Connecté en 8 ms.</span> 6 tables trouvées.' },
      { t: 'Filtre une table', p: 'Dans customers, ajoute un filtre sur la ville. Touche la puce pour l’appliquer.',
        d: '<button type="button" class="chip" data-act><span class="k" style="color:var(--t-text)">city</span><span class="op">est</span><b>Paris</b></button>', ok: '<span class="mint">412 lignes</span> sur 2 384 correspondent.' },
      { t: 'Inspecte une ligne', p: 'Touche une ligne : l’inspecteur s’ouvre avec chaque champ, prêt à être corrigé.',
        d: '<button type="button" class="chip" data-act style="height:44px;border-radius:12px;font:12.5px var(--mono);gap:14px"><span style="color:var(--t-num)">1088</span><span>Inès Leroy</span><span style="color:var(--t-date)">10 nov.</span></button>', ok: 'Inspecteur ouvert. Modifie, relis, puis <kbd>⌘</kbd><kbd>S</kbd>.' },
      { t: 'Lance une requête', p: 'Ouvre la console avec ⌘K et exécute ta première requête.',
        d: '<button type="button" class="sql-line" data-act style="cursor:pointer;color:inherit;text-align:left"><span class="kw">SELECT</span> <span class="fn">count</span>(*) <span class="kw">FROM</span> customers;</button>', ok: 'Résultat : <span class="num">2384</span> · 4 ms. Ajoutée à l’historique.' },
      { t: 'Protège la production', p: 'Étiquette une connexion Production : elle passe en corail et en lecture seule.',
        d: '<button type="button" class="chip" data-act style="height:44px;border-color:rgba(255,122,107,.45);background:#241414;color:var(--coral-2);font-weight:600">Marquer comme Production</button>', ok: '<span class="coral">Production protégée.</span> Tu es prêt.' }
    ];
    var cur = 0;
    var btns = tuto.querySelectorAll('.steps button');
    var dots = tuto.querySelectorAll('.dots i');
    var demo = $('tuto-demo');
    var render = function () {
      var s = steps[cur];
      $('tuto-title').textContent = s.t; $('tuto-text').textContent = s.p;
      demo.innerHTML = '<div style="display:grid;gap:14px;justify-items:center;text-align:center">' + s.d + '<div class="hint" style="color:var(--text-3);font-size:14px">Touche l’élément ci-dessus</div></div>';
      demo.querySelector('[data-act]').addEventListener('click', function () {
        demo.querySelector('.hint').innerHTML = s.ok;
        demo.querySelector('.hint').style.color = 'var(--text-2)';
        btns[cur].classList.add('done');
      });
      btns.forEach(function (b, i) { if (i === cur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
      dots.forEach(function (d, i) { d.classList.toggle('on', i === cur); });
      $('tuto-prev').disabled = cur === 0;
      $('tuto-next').textContent = cur === steps.length - 1 ? 'Recommencer' : 'Suivant';
    };
    btns.forEach(function (b, i) { b.addEventListener('click', function () { cur = i; render(); }); });
    $('tuto-prev').addEventListener('click', function () { if (cur > 0) { cur--; render(); } });
    $('tuto-next').addEventListener('click', function () {
      if (cur === steps.length - 1) { cur = 0; btns.forEach(function (b) { b.classList.remove('done'); }); } else cur++;
      render();
    });
    render();
  }
})();
