/* iCode — démo animée du hero, avec la nouvelle interface : le code occupe tout l'écran,
   barre latérale, onglets et pastille d'état flottent en verre. On écrit une méthode avec
   l'autocomplétion et une erreur signalée en direct, puis on valide et on pousse depuis Git. */
(function () {
  'use strict';
  var root = document.getElementById('demo');
  if (!root) return;
  var fr = document.documentElement.lang !== 'en';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var L = fr ? {
    project: 'boutique', branch: 'feature/panier', files: 'FICHIERS', search: 'Fichier, symbole, commande',
    current: 'Branche actuelle', changes: 'Modifications · 3', summary: 'Résumé du commit', desc: 'Nouvelle méthode applyPromo.',
    commit: 'Valider 3 fichiers', push: 'Pousser 2 commits', pushSub: 'origin, récupéré il y a 2 min',
    message: 'Ajoute les codes promo au panier', committed: 'Commit a71e0d4', committedSub: 'sur feature/panier',
    pushing: 'Push vers origin…', pushingSub: '3 commits', pushed: 'Poussé sur origin', pushedSub: 'feature/panier est à jour',
    unused: '« code » n’est jamais lu', fix: 'Corriger', line: 'Ligne', col: 'col.', err: '"Code inconnu"'
  } : {
    project: 'shop', branch: 'feature/cart', files: 'FILES', search: 'File, symbol, command',
    current: 'Current branch', changes: 'Changes · 3', summary: 'Commit summary', desc: 'New applyPromo method.',
    commit: 'Commit 3 files', push: 'Push 2 commits', pushSub: 'origin, fetched 2 min ago',
    message: 'Add promo codes to the cart', committed: 'Commit a71e0d4', committedSub: 'on feature/cart',
    pushing: 'Pushing to origin…', pushingSub: '3 commits', pushed: 'Pushed to origin', pushedSub: 'feature/cart is up to date',
    unused: '“code” is never read', fix: 'Fix', line: 'Ln', col: 'Col', err: '"Unknown code"'
  };

  var I = {
    branch: '<svg viewBox="0 0 24 24"><circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 7v10M18 10c0 4-6 3-6 7"/></svg>',
    folder: '<svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    warn: '<svg viewBox="0 0 24 24"><path d="M12 4l9 16H3z"/><path d="M12 10v5M12 17.5v.5"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"/></svg>',
    preview: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 9h18"/></svg>',
    spark: '<svg viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>',
    chev: '<svg viewBox="0 0 24 24" style="width:10px;height:10px"><path d="m9 6 6 6-6 6"/></svg>'
  };

  // Coloration façon iCode (JavaScript).
  var KW = /^(import|from|export|class|function|const|let|return|if|else|new|this|throw|constructor|null)$/;
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function hl(src) {
    if (/^\s*\/\//.test(src)) { var i = src.indexOf('//'); return esc(src.slice(0, i)) + '<span class="c">' + esc(src.slice(i)) + '</span>'; }
    var out = '', re = /("[^"]*"?|'[^']*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|([^\sA-Za-z_$\d"']+)/g, m;
    while ((m = re.exec(src))) {
      if (m[1]) out += '<span class="s">' + esc(m[1]) + '</span>';
      else if (m[2]) out += '<span class="n">' + m[2] + '</span>';
      else if (m[3]) {
        var w = m[3], rest = src.slice(re.lastIndex);
        if (KW.test(w)) out += '<span class="k">' + w + '</span>';
        else if (/^[A-Z]/.test(w)) out += '<span class="t">' + w + '</span>';
        else if (/^\s*\(/.test(rest)) out += '<span class="f">' + w + '</span>';
        else out += w;
      } else out += esc(m[0]);
    }
    return out;
  }

  var base = [
    'import { promos } from "./promo.js";',
    '',
    'const TVA = 0.2;',
    '',
    'export class Cart {',
    '  constructor(items = []) {',
    '    this.items = items;',
    '  }',
    '',
    '  subtotal() {',
    '    return this.items.reduce((s, i) => s + i.price * i.qty, 0);',
    '  }',
    '',
    ''
  ];
  var typed = [
    { text: '  applyPromo(code) {', lens: true },
    { text: '    const promo = promos[code];' },
    { text: '    if (!promo) throw new Error(' + L.err + ');' },
    { text: '    return promo.ap', complete: { word: 'apply', list: [['f', '#A9B7FF', 'apply(total)', 'number'], ['p', '#6BDFFF', 'percent', 'number'], ['p', '#6BDFFF', 'expires', 'Date'], ['p', '#6BDFFF', 'label', 'string']] }, after: '(this.subtotal());' },
    { text: '  }' },
    { text: '}' }
  ];

  function tag(bg, t) { return '<span class="tg" style="background:' + bg + '">' + t + '</span>'; }
  function seg(icon, on, badge) { return '<span' + (on ? ' class="on"' : '') + '>' + icon + (badge ? '<em>' + badge + '</em>' : '') + '</span>'; }

  root.innerHTML =
    '<div class="code"></div>' +
    '<div class="crumbs">src' + I.chev + 'cart.js' + I.chev + '<i>Cart</i>' + I.chev + '<b class="scope">subtotal()</b></div>' +
    '<div class="minimap" aria-hidden="true"></div>' +
    '<aside class="side dg">' +
      '<div class="proj"><span>' + L.project.charAt(0) + '</span><span><strong>' + L.project + '</strong><small class="dim row" style="gap:4px">' + L.branch + '</small></span></div>' +
      '<div class="seg4">' + seg(I.folder, true) + seg(I.search) + seg(I.branch, false, '3') + seg(I.warn) + '</div>' +
      '<div class="panes">' +
        '<div class="pane" data-pane="files"><h6>' + L.files + '</h6>' +
          '<div class="fi dim">' + I.folder.replace('<svg', '<svg style="color:#64B5FF"') + 'src</div>' +
          '<div class="fi in sel">' + tag('#F7DF1E', 'JS') + 'cart.js<span class="bdg m">M</span></div>' +
          '<div class="fi in">' + tag('#F7DF1E', 'JS') + 'promo.js<span class="bdg a">A</span></div>' +
          '<div class="fi in">' + tag('#64B5FF', '#') + 'styles.css<span class="bdg m">M</span></div>' +
          '<div class="fi in">' + tag('#FF8A65', '&lt;&gt;') + 'index.html</div>' +
          '<div class="fi">' + tag('#8FD694', '{}') + 'package.json</div>' +
          '<div class="fi">' + tag('#C9D1DC', 'M') + 'README.md</div>' +
          '<div class="cta" style="margin-top:auto;justify-content:flex-start;padding:0 12px">' + I.up + '<span>' + L.push + '<small>' + L.pushSub + '</small></span></div>' +
        '</div>' +
        '<div class="pane hidden" data-pane="git">' +
          '<div class="branch">' + I.branch.replace('<svg', '<svg style="color:#64B5FF"') + '<span><small>' + L.current + '</small><strong>' + L.branch + '</strong></span></div>' +
          '<div class="seg4" style="margin-bottom:6px"><span class="on" style="font-size:10.5px;font-weight:600">' + L.changes + '</span></div>' +
          '<div class="fi sel"><span class="ck">' + I.check + '</span>' + tag('#F7DF1E', 'JS') + 'cart.js<span class="dstat"><b>+7</b></span></div>' +
          '<div class="fi"><span class="ck">' + I.check + '</span>' + tag('#F7DF1E', 'JS') + 'promo.js<span class="dstat"><b>+22</b></span></div>' +
          '<div class="fi"><span class="ck">' + I.check + '</span>' + tag('#64B5FF', '#') + 'styles.css<span class="dstat"><b>+6</b><i>−1</i></span></div>' +
          '<div class="msg"><strong class="msg-t" data-placeholder="' + L.summary + '"></strong><small>' + L.desc + '</small></div>' +
          '<div class="cta off commit">' + I.check + L.commit + '</div>' +
        '</div>' +
      '</div>' +
    '</aside>' +
    '<div class="topbar">' +
      '<div class="dg"><span class="chip2 on"><i></i>cart.js</span><span class="chip2">promo.js</span><span class="chip2">styles.css</span></div>' +
      '<div class="dg srch">' + I.search + L.search + '</div>' +
      '<div class="dg acts"><span class="ib2 run">' + I.play + '</span><span class="ib2">' + I.preview + '</span><span class="ib2">' + I.spark + '</span></div>' +
    '</div>' +
    '<div class="popup"></div>' +
    '<div class="spill"><div class="dg">' +
      '<span class="it">' + I.branch + L.branch + ' <span class="up">↑2</span></span><span class="sep"></span>' +
      '<span class="it diag"></span><span class="sep"></span>' +
      '<span class="it dim pos"></span><span class="sep hide-sm"></span>' +
      '<span class="it dim hide-sm">JavaScript</span>' +
    '</div></div>' +
    '<div class="toast"><span class="ring"></span><span><span class="t1"></span><small class="t2"></small></span></div>';

  var $ = function (s) { return root.querySelector(s); };
  var codeEl = $('.code'), popup = $('.popup'), pos = $('.pos'), diag = $('.diag'), toast = $('.toast');
  var msg = $('.msg-t'), commitBtn = $('.commit'), scope = $('.scope'), mini = $('.minimap');
  var lines = [], start = base.length - 1, lensOn = false;

  function setDiag(n) {
    diag.className = 'it diag ' + (n ? 'warn' : 'ok');
    diag.innerHTML = (n ? I.warn + n : I.check + '0');
  }

  function render(cur, col) {
    var html = '';
    lines.forEach(function (t, i) {
      var body = i === cur ? hl(t.slice(0, col)) + '<span class="caret"></span>' + hl(t.slice(col)) : hl(t);
      if (i === start && lensOn) body += '<span class="lens">' + L.unused + '<u>' + L.fix + '</u></span>';
      html += '<div class="ln' + (i >= start && t ? ' add' : '') + (i === cur ? ' cur' : '') + '"><b>' + (i + 1) + '</b><span>' + (body || ' ') + '</span></div>';
    });
    codeEl.innerHTML = html;
    pos.textContent = L.line + ' ' + (cur + 1) + ', ' + L.col + ' ' + (col + 1);
    mini.innerHTML = lines.map(function (t, i) {
      var w = Math.min(100, t.trim().length * 2.4);
      return '<i style="width:' + w + '%;' + (i >= start && t ? 'background:#30D158' : '') + '"></i>';
    }).join('');
  }

  // Petit moteur de minuterie annulable.
  var running = false, timer = null;
  function wait(ms) { return function (next) { timer = setTimeout(next, ms); }; }
  function step(fn) { return function (next) { fn(); next(); }; }
  function run(steps, done) {
    var i = 0;
    (function go() { if (!running) return; if (i >= steps.length) return done && done(); steps[i++](go); })();
  }
  function typeInto(li, from, to, speed) {
    return function (next) {
      var n = from.length;
      (function tick() {
        if (!running) return;
        if (n > to.length) return next();
        lines[li] = to.slice(0, n); render(li, n); n++;
        timer = setTimeout(tick, speed + Math.random() * speed * 0.8);
      })();
    };
  }
  function showPopup(list) {
    popup.innerHTML = list.map(function (it, i) {
      return '<div' + (i === 0 ? ' class="on"' : '') + '>' + tag(it[1], it[0]) + it[2] + '<em>' + it[3] + '</em></div>';
    }).join('');
    var caret = codeEl.querySelector('.caret');
    if (caret) {
      var cr = caret.getBoundingClientRect(), pr = root.getBoundingClientRect();
      popup.style.left = Math.max(8, Math.min(cr.left - pr.left - 30, pr.width - popup.offsetWidth - 12)) + 'px';
      popup.style.top = (cr.bottom - pr.top + 5) + 'px';
    }
    popup.classList.add('show');
  }
  function showToast(t1, t2, ok) {
    toast.querySelector('.t1').textContent = t1;
    toast.querySelector('.t2').textContent = t2;
    var ring = toast.querySelector('.ring');
    ring.classList.toggle('ok', !!ok);
    ring.innerHTML = ok ? I.check : I.up;
    toast.classList.add('show');
  }
  function pane(name) {
    root.querySelectorAll('.pane').forEach(function (p) { p.classList.toggle('hidden', p.dataset.pane !== name); });
    root.querySelectorAll('.side > .seg4 span').forEach(function (s, i) { s.classList.toggle('on', name === 'git' ? i === 2 : i === 0); });
  }

  function script() {
    var steps = [];
    steps.push(step(function () {
      lines = base.slice(); lensOn = false; pane('files'); msg.textContent = '';
      commitBtn.className = 'cta off commit'; toast.classList.remove('show'); popup.classList.remove('show');
      scope.textContent = 'subtotal()'; setDiag(0); render(start, 0);
    }));
    steps.push(wait(800));
    typed.forEach(function (t, k) {
      var li = start + k;
      steps.push(step(function () { if (k > 0) lines.splice(li, 0, ''); render(li, 0); }));
      steps.push(typeInto(li, '', t.text, 36));
      if (t.lens) steps.push(step(function () { lensOn = true; scope.textContent = 'applyPromo(code)'; setDiag(1); render(li, lines[li].length); }));
      if (k === 1) steps.push(step(function () { lensOn = false; setDiag(0); render(li, lines[li].length); }));
      if (t.complete) {
        var c = t.complete;
        steps.push(step(function () { showPopup(c.list); }));
        steps.push(wait(900));
        steps.push(step(function () {
          popup.classList.remove('show');
          lines[li] = t.text.replace(/[\w$]+$/, '') + c.word; render(li, lines[li].length);
        }));
        steps.push(wait(240));
        steps.push(function (next) { typeInto(li, lines[li], lines[li] + t.after, 32)(next); });
      }
      steps.push(wait(160));
    });
    steps.push(wait(900));
    steps.push(step(function () { pane('git'); }));
    steps.push(wait(700));
    steps.push(function (next) {
      var n = 0;
      (function tick() {
        if (!running) return;
        msg.textContent = L.message.slice(0, n);
        if (n++ < L.message.length) timer = setTimeout(tick, 40); else next();
      })();
    });
    steps.push(step(function () { commitBtn.classList.remove('off'); }));
    steps.push(wait(600));
    steps.push(step(function () { commitBtn.classList.add('pressed'); }));
    steps.push(wait(160));
    steps.push(step(function () { commitBtn.classList.remove('pressed'); showToast(L.committed, L.committedSub, true); }));
    steps.push(wait(1500));
    steps.push(step(function () { showToast(L.pushing, L.pushingSub, false); }));
    steps.push(wait(1500));
    steps.push(step(function () { showToast(L.pushed, L.pushedSub, true); }));
    steps.push(wait(2200));
    steps.push(step(function () { toast.classList.remove('show'); }));
    steps.push(wait(800));
    return steps;
  }

  var inView = false;
  function loop() { run(script(), function () { if (running) loop(); }); }
  function start_() { if (running) return; running = true; loop(); }
  function stop() { running = false; clearTimeout(timer); }

  lines = base.slice(); setDiag(0);
  if (reduced) {
    lines = base.slice(0, start).concat(['  applyPromo(code) {', '    const promo = promos[code];', '    if (!promo) throw new Error(' + L.err + ');', '    return promo.apply(this.subtotal());', '  }', '}', '']);
    scope.textContent = 'applyPromo(code)';
    render(lines.length - 1, 0);
    return;
  }
  render(start, 0);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { inView = en[0].isIntersecting; inView ? start_() : stop(); }, { threshold: 0.15 }).observe(root);
  } else { inView = true; start_(); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (inView) start_(); });
})();
