/* iCode — démo animée du hero, dans une fenêtre Mac. Deux projets se relaient : une app Swift
   (on écrit une méthode avec l'autocomplétion, on lance les tests dans le terminal intégré, puis on
   valide et on pousse depuis Git) et une API TypeScript (on écrit une route et on lance le serveur). */
(function () {
  'use strict';
  var root = document.getElementById('demo');
  if (!root) return;
  var fr = document.documentElement.lang !== 'en';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var L = fr ? {
    files: 'EXPLORATEUR', search: 'Fichier, symbole, commande', current: 'Branche actuelle', changes: 'Modifications · 3',
    summary: 'Résumé du commit', commit: 'Valider 3 fichiers', push: 'Pousser 2 commits', pushSub: 'origin, récupéré il y a 2 min',
    committed: 'Commit a71e0d4', pushing: 'Push vers origin…', pushingSub: '3 commits', pushed: 'Poussé sur origin',
    unused: '« code » n’est jamais lu', fix: 'Corriger', line: 'Ligne', col: 'col.', terminal: 'Terminal', run: 'Exécuter',
    testsOk: 'Tests réussis', serverOn: 'Serveur lancé'
  } : {
    files: 'EXPLORER', search: 'File, symbol, command', current: 'Current branch', changes: 'Changes · 3',
    summary: 'Commit summary', commit: 'Commit 3 files', push: 'Push 2 commits', pushSub: 'origin, fetched 2 min ago',
    committed: 'Commit a71e0d4', pushing: 'Pushing to origin…', pushingSub: '3 commits', pushed: 'Pushed to origin',
    unused: '“code” is never read', fix: 'Fix', line: 'Ln', col: 'Col', terminal: 'Terminal', run: 'Run',
    testsOk: 'Tests passed', serverOn: 'Server running'
  };

  var I = {
    branch: '<svg viewBox="0 0 24 24"><circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 7v10M18 10c0 4-6 3-6 7"/></svg>',
    folder: '<svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    warn: '<svg viewBox="0 0 24 24"><path d="M12 4l9 16H3z"/><path d="M12 10v5M12 17.5v.5"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"/></svg>',
    term: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 9 3 3-3 3M12 15h5"/></svg>',
    spark: '<svg viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>',
    chev: '<svg viewBox="0 0 24 24" style="width:10px;height:10px"><path d="m9 6 6 6-6 6"/></svg>'
  };

  // Coloration façon iCode (Swift et TypeScript).
  var KW = /^(import|from|export|default|struct|class|enum|case|func|function|var|let|const|return|if|else|guard|throw|throws|try|in|self|some|private|static|mutating|nil|async|await|new|type|interface)$/;
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

  var SW = ['#FF8A4C', 'S'], TS = ['#3178C6', 'TS'], JS = ['#F7DF1E', 'JS'], MD = ['#C9D1DC', 'M'], JN = ['#FFD23F', '{}'];
  var scenes = [
    {
      lang: 'Swift', project: fr ? 'boutique' : 'shop', branch: fr ? 'feature/panier' : 'feature/cart',
      crumbs: ['Models', 'Cart.swift', 'Cart'], scope: 'subtotal', scopeAfter: 'total(promo:)',
      tabs: ['Cart.swift', 'Promo.swift', 'CartTests.swift'],
      tree: [['d', 'Sources'], ['f', SW, 'Cart.swift', 'm', true], ['f', SW, 'Promo.swift', 'a'], ['d', 'Tests'], ['f', SW, 'CartTests.swift', 'm'], ['f', JS, 'Package.swift'], ['f', MD, 'README.md']],
      base: ['import Foundation', '', 'struct Cart {', '    var lines: [Line] = []', '', '    var subtotal: Double {', '        lines.reduce(0) { $0 + $1.total }', '    }', '', ''],
      typed: [
        { text: '    func total(promo code: String) throws -> Double {', lens: true },
        { text: '        guard let promo = Promo.all[code] else {', clear: true },
        { text: '            throw CartError.unknownCode' },
        { text: '        }' },
        { text: '        return promo.ap', complete: { word: 'apply', list: [['f', '#A9B7FF', 'apply(to:)', 'Double'], ['p', '#6BDFFF', 'percent', 'Double'], ['p', '#6BDFFF', 'expires', 'Date'], ['p', '#6BDFFF', 'label', 'String']] }, after: '(to: subtotal)' },
        { text: '    }' },
        { text: '}' }
      ],
      cmd: 'swift test',
      out: [
        ['dim', 'Building for debugging...'],
        ['dim', '[14/14] Compiling Boutique Cart.swift'],
        ['', 'Build complete! (2.84s)'],
        ['ok', '✔ CartTests.testPromoApplies (0.002s)'],
        ['ok', '✔ CartTests.testUnknownCodeThrows (0.001s)'],
        ['ok', 'Executed 6 tests, with 0 failures (0.012s)']
      ],
      done: [L.testsOk, '6/6 · 2,8 s'],
      git: { message: fr ? 'Ajoute les codes promo au panier' : 'Add promo codes to the cart', desc: fr ? 'Nouvelle méthode total(promo:).' : 'New total(promo:) method.', files: [['Cart.swift', SW, '+7'], ['Promo.swift', SW, '+22'], ['CartTests.swift', SW, '+14']] }
    },
    {
      lang: 'TypeScript', project: 'shop-api', branch: 'main',
      crumbs: ['src', 'server.ts', 'app'], scope: 'app', scopeAfter: 'GET /api/products',
      tabs: ['server.ts', 'db.ts', 'package.json'],
      tree: [['d', 'src'], ['f', TS, 'server.ts', 'm', true], ['f', TS, 'db.ts'], ['f', JN, 'package.json'], ['f', JN, 'tsconfig.json'], ['f', MD, 'README.md']],
      base: ['import express from \'express\'', 'import { db } from \'./db\'', '', 'const app = express()', 'app.use(express.json())', '', ''],
      typed: [
        { text: 'app.get(\'/api/products\', async (req, res) => {' },
        { text: '  const items = await db.product.find', complete: { word: 'findMany', list: [['f', '#A9B7FF', 'findMany(args)', 'Promise<Product[]>'], ['f', '#A9B7FF', 'findFirst(args)', 'Promise<Product>'], ['f', '#A9B7FF', 'findUnique(args)', 'Promise<Product>'], ['f', '#A9B7FF', 'count(args)', 'Promise<number>']] }, after: '({ orderBy: { price: \'asc\' } })' },
        { text: '  res.json(items)' },
        { text: '})' },
        { text: '' },
        { text: 'app.listen(3000)' }
      ],
      cmd: 'npm run dev',
      out: [
        ['dim', '> shop-api@1.0.0 dev'],
        ['dim', '> tsx watch src/server.ts'],
        ['', ''],
        ['ok', '➜  Server ready on http://localhost:3000'],
        ['', 'GET /api/products 200 · 4 ms']
      ],
      done: [L.serverOn, 'localhost:3000']
    }
  ];

  function tag(t) { return '<span class="tg" style="background:' + t[0] + '">' + t[1] + '</span>'; }
  function seg(icon, on, badge) { return '<span' + (on ? ' class="on"' : '') + '>' + icon + (badge ? '<em>' + badge + '</em>' : '') + '</span>'; }

  root.innerHTML =
    '<div class="code"></div>' +
    '<div class="crumbs"></div>' +
    '<div class="minimap" aria-hidden="true"></div>' +
    '<aside class="side dg">' +
      '<div class="proj"><span class="pi"></span><span><strong class="pn"></strong><small class="dim row pb" style="gap:4px"></small></span></div>' +
      '<div class="seg4">' + seg(I.folder, true) + seg(I.search) + seg(I.branch, false, '3') + seg(I.warn) + '</div>' +
      '<div class="panes">' +
        '<div class="pane" data-pane="files"><h6>' + L.files + '</h6><div class="tree"></div>' +
          '<div class="cta" style="margin-top:auto;justify-content:flex-start;padding:0 12px">' + I.up + '<span>' + L.push + '<small>' + L.pushSub + '</small></span></div>' +
        '</div>' +
        '<div class="pane hidden" data-pane="git">' +
          '<div class="branch">' + I.branch.replace('<svg', '<svg style="color:#64B5FF"') + '<span><small>' + L.current + '</small><strong class="gb"></strong></span></div>' +
          '<div class="seg4" style="margin-bottom:6px"><span class="on" style="font-size:10.5px;font-weight:600">' + L.changes + '</span></div>' +
          '<div class="gfiles"></div>' +
          '<div class="msg"><strong class="msg-t" data-placeholder="' + L.summary + '"></strong><small class="msg-d"></small></div>' +
          '<div class="cta off commit">' + I.check + L.commit + '</div>' +
        '</div>' +
      '</div>' +
    '</aside>' +
    '<div class="topbar">' +
      '<div class="dg tabs"></div>' +
      '<div class="dg srch">' + I.search + L.search + '</div>' +
      '<div class="dg acts"><span class="ib2 run" title="' + L.run + '">' + I.play + '</span><span class="ib2">' + I.term + '</span><span class="ib2">' + I.spark + '</span></div>' +
    '</div>' +
    '<div class="popup"></div>' +
    '<div class="term dg"><div class="term-bar">' + I.term + '<b>' + L.terminal + '</b><span class="term-tab on">zsh</span><span class="term-tab">+</span></div><div class="term-body"></div></div>' +
    '<div class="spill"><div class="dg">' +
      '<span class="it">' + I.branch + '<span class="sb"></span> <span class="up">↑2</span></span><span class="sep"></span>' +
      '<span class="it diag"></span><span class="sep"></span>' +
      '<span class="it dim pos"></span><span class="sep hide-sm"></span>' +
      '<span class="it dim hide-sm lang"></span>' +
    '</div></div>' +
    '<div class="toast"><span class="ring"></span><span><span class="t1"></span><small class="t2"></small></span></div>';

  var $ = function (s) { return root.querySelector(s); };
  var codeEl = $('.code'), popup = $('.popup'), pos = $('.pos'), diag = $('.diag'), toast = $('.toast');
  var msg = $('.msg-t'), commitBtn = $('.commit'), mini = $('.minimap'), term = $('.term'), termBody = $('.term-body'), runBtn = $('.run');
  var sc = scenes[0], lines = [], start = 0, lensOn = false, scopeEl;

  function setScene(s) {
    sc = s; start = s.base.length - 1;
    $('.crumbs').innerHTML = s.crumbs[0] + I.chev + s.crumbs[1] + I.chev + '<i>' + s.crumbs[2] + '</i>' + I.chev + '<b class="scope"></b>';
    scopeEl = $('.scope'); scopeEl.textContent = s.scope;
    $('.pi').textContent = s.project.charAt(0).toUpperCase();
    $('.pn').textContent = s.project; $('.pb').textContent = s.branch; $('.gb').textContent = s.branch; $('.sb').textContent = s.branch;
    $('.lang').textContent = s.lang;
    $('.tabs').innerHTML = s.tabs.map(function (t, i) { return '<span class="chip2' + (i === 0 ? ' on' : '') + '">' + (i === 0 ? '<i></i>' : '') + t + '</span>'; }).join('');
    $('.tree').innerHTML = s.tree.map(function (n) {
      if (n[0] === 'd') return '<div class="fi dim">' + I.folder.replace('<svg', '<svg style="color:#64B5FF"') + n[1] + '</div>';
      return '<div class="fi in' + (n[4] ? ' sel' : '') + '">' + tag(n[1]) + n[2] + (n[3] ? '<span class="bdg ' + n[3] + '">' + n[3].toUpperCase() + '</span>' : '') + '</div>';
    }).join('');
    if (s.git) {
      $('.gfiles').innerHTML = s.git.files.map(function (f, i) {
        return '<div class="fi' + (i === 0 ? ' sel' : '') + '"><span class="ck">' + I.check + '</span>' + tag(f[1]) + f[0] + '<span class="dstat"><b>' + f[2] + '</b></span></div>';
      }).join('');
      $('.msg-d').textContent = s.git.desc;
    }
  }

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
      return '<div' + (i === 0 ? ' class="on"' : '') + '>' + tag([it[1], it[0]]) + it[2] + '<em>' + it[3] + '</em></div>';
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
  function termLine(cls, html) {
    var d = document.createElement('div');
    d.className = 'tl ' + cls; d.innerHTML = html || '&nbsp;';
    termBody.appendChild(d);
  }

  function script(s) {
    var steps = [];
    setScene(s); // fixe « start » avant de construire les étapes de frappe
    steps.push(step(function () {
      lines = s.base.slice(); lensOn = false; pane('files'); msg.textContent = '';
      commitBtn.className = 'cta off commit'; toast.classList.remove('show'); popup.classList.remove('show');
      term.classList.remove('show'); termBody.innerHTML = '';
      setDiag(0); render(start, 0);
    }));
    steps.push(wait(800));
    s.typed.forEach(function (t, k) {
      var li = start + k;
      steps.push(step(function () { if (k > 0) lines.splice(li, 0, ''); render(li, 0); }));
      steps.push(typeInto(li, '', t.text, 34));
      if (t.lens) steps.push(step(function () { lensOn = true; scopeEl.textContent = s.scopeAfter; setDiag(1); render(li, lines[li].length); }));
      if (k === 0 && !t.lens) steps.push(step(function () { scopeEl.textContent = s.scopeAfter; }));
      if (t.clear) steps.push(step(function () { lensOn = false; setDiag(0); render(li, lines[li].length); }));
      if (t.complete) {
        var c = t.complete;
        steps.push(step(function () { showPopup(c.list); }));
        steps.push(wait(900));
        steps.push(step(function () {
          popup.classList.remove('show');
          lines[li] = t.text.replace(/[\w$]+$/, '') + c.word; render(li, lines[li].length);
        }));
        steps.push(wait(240));
        steps.push(function (next) { typeInto(li, lines[li], lines[li] + t.after, 30)(next); });
      }
      steps.push(wait(140));
    });
    steps.push(wait(700));
    // ▶︎ Exécuter : le terminal intégré monte et lance la commande du projet.
    steps.push(step(function () { runBtn.classList.add('pressed'); }));
    steps.push(wait(180));
    steps.push(step(function () { runBtn.classList.remove('pressed'); term.classList.add('show'); termLine('cmd', '<i>~/' + s.project + '</i> <b>❯</b> '); }));
    steps.push(wait(350));
    steps.push(function (next) {
      var el = termBody.lastChild, n = 0, base = el.innerHTML;
      (function tick() {
        if (!running) return;
        el.innerHTML = base + esc(s.cmd.slice(0, n));
        if (n++ < s.cmd.length) timer = setTimeout(tick, 55); else next();
      })();
    });
    s.out.forEach(function (o, i) {
      steps.push(wait(i === 0 ? 400 : 260 + Math.random() * 260));
      steps.push(step(function () { termLine(o[0], esc(o[1])); }));
    });
    steps.push(step(function () { showToast(s.done[0], s.done[1], true); }));
    steps.push(wait(2000));
    steps.push(step(function () { toast.classList.remove('show'); }));
    if (s.git) {
      steps.push(wait(400));
      steps.push(step(function () { term.classList.remove('show'); pane('git'); }));
      steps.push(wait(700));
      steps.push(function (next) {
        var n = 0;
        (function tick() {
          if (!running) return;
          msg.textContent = s.git.message.slice(0, n);
          if (n++ < s.git.message.length) timer = setTimeout(tick, 40); else next();
        })();
      });
      steps.push(step(function () { commitBtn.classList.remove('off'); }));
      steps.push(wait(600));
      steps.push(step(function () { commitBtn.classList.add('pressed'); }));
      steps.push(wait(160));
      steps.push(step(function () { commitBtn.classList.remove('pressed'); showToast(L.committed, s.branch, true); }));
      steps.push(wait(1400));
      steps.push(step(function () { showToast(L.pushing, L.pushingSub, false); }));
      steps.push(wait(1400));
      steps.push(step(function () { showToast(L.pushed, s.branch, true); }));
      steps.push(wait(2000));
      steps.push(step(function () { toast.classList.remove('show'); }));
    } else {
      steps.push(wait(1400));
    }
    steps.push(wait(700));
    return steps;
  }

  var inView = false, which = 0;
  function loop() { run(script(scenes[which]), function () { which = (which + 1) % scenes.length; if (running) loop(); }); }
  function start_() { if (running) return; running = true; loop(); }
  function stop() { running = false; clearTimeout(timer); }

  setScene(scenes[0]);
  lines = sc.base.slice(); setDiag(0);
  if (reduced) {
    lines = sc.base.slice(0, start).concat(sc.typed.map(function (t) { return t.complete ? t.text.replace(/[\w$]+$/, '') + t.complete.word + t.after : t.text; }), ['']);
    scopeEl.textContent = sc.scopeAfter;
    render(lines.length - 1, 0);
    term.classList.add('show');
    termLine('cmd', '<i>~/' + sc.project + '</i> <b>❯</b> ' + esc(sc.cmd));
    sc.out.forEach(function (o) { termLine(o[0], esc(o[1])); });
    return;
  }
  render(start, 0);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { inView = en[0].isIntersecting; inView ? start_() : stop(); }, { threshold: 0.15 }).observe(root);
  } else { inView = true; start_(); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (inView) start_(); });
})();
