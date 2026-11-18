// Nexa — shared page behavior
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) { return '$' + n.toLocaleString('en-US'); };

  /* ---------- Fade sections in as they scroll into view ---------- */
  var items = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Sticky nav, scroll progress, back-to-top ---------- */
  var nav = $('.nav'), bar = $('.progress'), top = $('.to-top');
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    if (nav) nav.classList.toggle('scrolled', y > 30);
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    if (top) top.classList.toggle('show', y > 900);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---------- Hero parallax: sun sets behind the mountains on scroll ---------- */
  var hero = $('.hero'), sun = $('.hero-sun');
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (hero && sun && !still) {
    var ticking = false;
    var paint = function () {
      ticking = false;
      var start = Math.max(hero.offsetTop - window.innerHeight * 0.35, 0);
      var y = Math.min(Math.max(window.scrollY - start, 0), hero.offsetHeight);
      hero.style.setProperty('--sun-y', (y * 0.45).toFixed(1) + 'px');
      hero.style.setProperty('--r1-y', (y * 0.16).toFixed(1) + 'px');
      hero.style.setProperty('--r2-y', (y * 0.07).toFixed(1) + 'px');
      hero.style.setProperty('--arc-rot', (y * 0.02).toFixed(2) + 'deg');
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(paint); }
    }, { passive: true });
    paint();
  }

  /* ---------- Page gradient: blobs drift with scroll and lean toward the cursor ---------- */
  var blobs = $$('.page-glow i');
  if (blobs.length && !still) {
    var gx = 0, gy = 0, gcx = 0, gcy = 0, sp = 0, scp = 0;
    var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    if (finePointer) {
      window.addEventListener('pointermove', function (e) {
        gx = e.clientX / window.innerWidth - 0.5;
        gy = e.clientY / window.innerHeight - 0.5;
      }, { passive: true });
    }
    var glowRunning = false;
    var glowLoop = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      sp = h > 0 ? window.scrollY / h : 0;
      gcx += (gx - gcx) * 0.06; gcy += (gy - gcy) * 0.06; scp += (sp - scp) * 0.1;
      var vw = window.innerWidth, vh = window.innerHeight, a = scp * Math.PI * 2;
      blobs[0].style.transform = 'translate3d(' + (gcx * vw * 0.22 + Math.sin(a) * vw * 0.12).toFixed(1) + 'px,' + (gcy * vh * 0.22 + scp * vh * 0.5).toFixed(1) + 'px,0) scale(' + (1 + Math.sin(a) * 0.15).toFixed(3) + ')';
      blobs[1].style.transform = 'translate3d(' + (gcx * vw * -0.16 - Math.sin(a * 0.8) * vw * 0.18).toFixed(1) + 'px,' + (gcy * vh * -0.16 + Math.cos(a) * vh * 0.2).toFixed(1) + 'px,0)';
      blobs[2].style.transform = 'translate3d(' + (gcx * vw * 0.3 + Math.cos(a * 1.3) * vw * 0.15).toFixed(1) + 'px,' + (gcy * vh * 0.3 - scp * vh * 0.4).toFixed(1) + 'px,0) scale(' + (1.1 - Math.cos(a) * 0.15).toFixed(3) + ')';
      // only keep animating while something is still settling
      if (Math.abs(gx - gcx) > 0.002 || Math.abs(gy - gcy) > 0.002 || Math.abs(sp - scp) > 0.0005) requestAnimationFrame(glowLoop);
      else glowRunning = false;
    };
    var wakeGlow = function () { if (!glowRunning) { glowRunning = true; requestAnimationFrame(glowLoop); } };
    window.addEventListener('scroll', wakeGlow, { passive: true });
    if (finePointer) window.addEventListener('pointermove', wakeGlow, { passive: true });
    wakeGlow();
  }

  /* ---------- Interactive header: glow follows the cursor, rings + sun drift ---------- */
  var homeHero = $('.hero.home');
  if (homeHero && !still && window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
    var tx = 0, ty = 0, cx = 0, cy = 0, moving = false;
    var drift = function () {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      homeHero.style.setProperty('--px', cx.toFixed(4));
      homeHero.style.setProperty('--py', cy.toFixed(4));
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) requestAnimationFrame(drift);
      else moving = false;
    };
    homeHero.addEventListener('pointermove', function (e) {
      var r = homeHero.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      homeHero.style.setProperty('--mx', x + 'px');
      homeHero.style.setProperty('--my', y + 'px');
      homeHero.classList.add('pointer-on');
      tx = x / r.width - 0.5; ty = y / r.height - 0.5;
      if (!moving) { moving = true; requestAnimationFrame(drift); }
    });
    homeHero.addEventListener('pointerleave', function () {
      homeHero.classList.remove('pointer-on');
      tx = 0; ty = 0;
      if (!moving) { moving = true; requestAnimationFrame(drift); }
    });
  }

  /* ---------- Homepage walkthrough: highlight the service on screen, build its visual ---------- */
  var steps = $$('.tour-step'), tourLinks = $$('.tour-nav a');
  if (steps.length) {
    var setOn = function (id) {
      tourLinks.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + id); });
    };
    var tourGrid = $('.tour-grid');
    var pinned = function () { return window.matchMedia('(min-width: 1001px)').matches; };
    var activeIdx = -1;
    var activate = function (i) {
      if (i === activeIdx) return;
      activeIdx = i;
      steps.forEach(function (s, j) {
        s.classList.toggle('active', j === i);
        clearTimeout(s._built);
        if (j === i) {
          if (still) s.classList.add('seen', 'built');
          else {
            setTimeout(function () { s.classList.add('seen'); }, 30);
            s._built = setTimeout(function () { s.classList.add('built'); }, 2600);
          }
        } else if (!still) s.classList.remove('seen', 'built'); // replay its build-in next time
      });
      if (i >= 0) setOn(steps[i].id);
    };
    /* sky: a day passes as you scroll the services (dawn -> sunrise -> midday -> golden hour -> dusk) */
    var sky = $('.tour-sky'), skySun = $('.sky-sun');
    var SKY = [
      [0.00, '#4a2c4a', '#c0605a', '#ffb48a', '#5a3044', '#3a1e2c'],
      [0.22, '#ffb999', '#ffd0a6', '#ffeacc', '#c98a6a', '#a8684c'],
      [0.50, '#ffe7c2', '#fff1d9', '#fff9ef', '#e8b48c', '#d49a70'],
      [0.78, '#ff9f5a', '#ffc07a', '#ffe0b0', '#b8603c', '#8e4428'],
      [1.00, '#3a1f2e', '#b8452a', '#ff8c48', '#4a2418', '#2a1810']
    ];
    var hex = function (h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; };
    var mix = function (a, b, t) {
      var x = hex(a), y = hex(b);
      return 'rgb(' + Math.round(x[0] + (y[0] - x[0]) * t) + ',' + Math.round(x[1] + (y[1] - x[1]) * t) + ',' + Math.round(x[2] + (y[2] - x[2]) * t) + ')';
    };
    var paintSky = function (p) {
      if (!sky) return;
      var i = 0;
      while (i < SKY.length - 2 && p > SKY[i + 1][0]) i++;
      var a = SKY[i], b = SKY[i + 1], t = (p - a[0]) / (b[0] - a[0]);
      t = t * t * (3 - 2 * t); // ease between stops so the blend feels smooth
      ['--s1', '--s2', '--s3', '--h1', '--h2'].forEach(function (k, j) { sky.style.setProperty(k, mix(a[j + 1], b[j + 1], t)); });
      if (skySun) {
        var w = sky.clientWidth, h = sky.clientHeight;
        var x = w * (0.06 + 0.88 * p), y = h * (0.9 - Math.sin(Math.PI * p) * 0.8);
        skySun.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + (1.15 - Math.sin(Math.PI * p) * 0.3).toFixed(3) + ')';
      }
    };
    var skyTicking = false;
    /* opening logo: first fifth of the scroll track; its sun flies into slide one's sun */
    var stage = $('.tour-stage'), intro = $('.tour-intro'), introOrb = $('.intro-orb'), flySun = $('.fly-sun');
    var targetSun = $('#tour-web .ms-sun');
    var INTRO = intro && flySun ? 0.2 : 0;
    if (INTRO && stage) stage.classList.add('has-fly');
    var flyTo = function (t) {
      if (!flySun || !introOrb || !targetSun || !stage) return;
      var s = stage.getBoundingClientRect(), a = introOrb.getBoundingClientRect(), b = targetSun.getBoundingClientRect();
      var e = t * t * (3 - 2 * t);
      var w0 = a.width || 1;
      var x = (a.left - s.left) + ((b.left - s.left) - (a.left - s.left)) * e;
      var y = (a.top - s.top) + ((b.top - s.top) - (a.top - s.top)) * e;
      var k = (w0 + (b.width - w0) * e) / w0;
      flySun.style.width = w0 + 'px'; flySun.style.height = w0 + 'px';
      flySun.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + k.toFixed(4) + ')';
    };
    var tourScroll = function () {
      if (!pinned() || !tourGrid) return;
      var r = tourGrid.getBoundingClientRect(), track = r.height - window.innerHeight;
      var p = track > 0 ? Math.min(Math.max(-r.top / track, 0), 0.9999) : 0;
      if (INTRO && p < INTRO) {
        var t = p / INTRO;
        stage.style.setProperty('--intro-o', Math.max(0, 1 - Math.max(0, t - 0.1) / 0.45).toFixed(3));
        stage.style.setProperty('--intro-t', (t * t * (3 - 2 * t)).toFixed(3));
        stage.classList.add('intro');
        activate(t >= 0.7 ? 0 : -1);
        flySun.classList.remove('gone');
        flyTo(t);
      } else {
        if (INTRO) {
          stage.style.setProperty('--intro-o', '0');
          stage.classList.remove('intro');
          flySun.classList.add('gone');
        }
        var q = INTRO ? (p - INTRO) / (1 - INTRO) : p;
        activate(Math.min(steps.length - 1, Math.floor(q * steps.length)));
      }
      var skyP = INTRO ? Math.max(0, (p - INTRO) / (1 - INTRO)) : p;
      if (!skyTicking) { skyTicking = true; requestAnimationFrame(function () { skyTicking = false; paintSky(skyP); }); }
    };
    tourLinks.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        if (!pinned() || !tourGrid) return;
        e.preventDefault();
        var top = tourGrid.getBoundingClientRect().top + window.scrollY;
        var track = tourGrid.offsetHeight - window.innerHeight;
        window.scrollTo({ top: top + track * (i + 0.5) / steps.length, behavior: still ? 'auto' : 'smooth' });
      });
    });
    window.addEventListener('scroll', tourScroll, { passive: true });
    window.addEventListener('resize', function () {
      if (!pinned()) { activeIdx = -1; steps.forEach(function (s) { s.classList.remove('active'); s.classList.add('seen'); }); }
      tourScroll();
    });
    if (pinned()) {
      activate(INTRO ? -1 : 0);
      tourScroll();
    } else if ('IntersectionObserver' in window && !still) {
      var seen = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('seen'); seen.unobserve(e.target); }
        });
      }, { threshold: 0.3 });
      var current = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) setOn(e.target.id); });
      }, { rootMargin: '-45% 0px -50% 0px' });
      steps.forEach(function (s) { seen.observe(s); current.observe(s); });
    } else {
      steps.forEach(function (s) { s.classList.add('seen'); });
    }
    setOn(steps[0].id);
  }

  /* ---------- Walkthrough visuals: tilt toward the cursor, layers shift by depth ---------- */
  if (!still && window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
    $$('.tour-visual').forEach(function (v) {
      var tx = 0, ty = 0, cx = 0, cy = 0, running = false;
      var step = function () {
        cx += (tx - cx) * 0.1; cy += (ty - cy) * 0.1;
        v.style.setProperty('--vx', cx.toFixed(4));
        v.style.setProperty('--vy', cy.toFixed(4));
        if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) requestAnimationFrame(step);
        else running = false;
      };
      var kick = function () { if (!running) { running = true; requestAnimationFrame(step); } };
      v.addEventListener('pointermove', function (e) {
        var r = v.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width - 0.5;
        ty = (e.clientY - r.top) / r.height - 0.5;
        kick();
      });
      v.addEventListener('pointerleave', function () { tx = 0; ty = 0; kick(); });
    });
  }

  /* ---------- Headings rise in word by word, subtext fades up after ---------- */
  if (!still && 'IntersectionObserver' in window) {
    var skip = '.tour-visual, .tour-step, .statement, .plan, .choice, .estimator, .industry-panel, form';
    var fxHeads = $$('main h1, main h2, main h3').filter(function (el) { return !el.closest(skip); });
    var fxSubs = $$('main p, main li').filter(function (el) {
      return !el.closest(skip) && !el.closest('.nav') && el.textContent.trim();
    });
    fxHeads.forEach(function (h) {
      h.classList.add('fx-head');
      if (h.tagName === 'H3') return;
      var i = 0;
      Array.prototype.slice.call(h.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span');
            s.className = 'fx-word';
            s.style.setProperty('--i', i++);
            s.textContent = part;
            frag.appendChild(s);
          });
          h.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          child.classList.add('fx-word');
          child.style.setProperty('--i', i++);
        }
      });
      h.classList.add('fx-split');
    });
    fxSubs.forEach(function (p) { p.classList.add('fx-sub'); });
    var fxIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('fx-in'); fxIO.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    fxHeads.concat(fxSubs).forEach(function (el) { fxIO.observe(el); });
  }

  /* ---------- Statement: words light up as it scrolls through the screen ---------- */
  var statement = $('[data-words]');
  if (statement) {
    var wrapWords = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span');
            s.className = 'w';
            s.textContent = part;
            frag.appendChild(s);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          wrapWords(child);
        }
      });
    };
    wrapWords(statement);
    var words = $$('.w', statement);
    if (still) {
      words.forEach(function (w) { w.classList.add('lit'); });
    } else {
      var wordsTicking = false;
      var light = function () {
        wordsTicking = false;
        var r = statement.getBoundingClientRect(), vh = window.innerHeight;
        var start = vh * 0.85, end = vh * 0.3;
        var p = (start - r.top) / (start - end + r.height * 0.5);
        var n = Math.round(Math.min(Math.max(p, 0), 1) * words.length);
        words.forEach(function (w, i) { w.classList.toggle('lit', i < n); });
      };
      window.addEventListener('scroll', function () {
        if (!wordsTicking) { wordsTicking = true; requestAnimationFrame(light); }
      }, { passive: true });
      window.addEventListener('resize', light);
      light();
    }
  }

  /* ---------- Mobile menu ---------- */
  var toggle = $('.menu-toggle');
  function closeMenu() {
    if (!nav) return;
    nav.classList.remove('open');
    if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open menu'); }
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      if (open) nav.classList.add('scrolled');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    $$('.nav-links a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    document.addEventListener('click', function (e) { if (nav.classList.contains('open') && !nav.contains(e.target)) closeMenu(); });
  }

  /* ---------- Highlight the nav link for the section on screen ---------- */
  var links = $$('.nav-links a:not(.btn)');
  var sections = links.map(function (a) {
    var id = a.getAttribute('href').split('#')[1];
    return id && location.pathname === '/' ? document.getElementById(id) : null;
  });
  if ('IntersectionObserver' in window && sections.some(Boolean)) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var i = sections.indexOf(e.target);
        if (i > -1 && e.isIntersecting) links.forEach(function (l, j) { l.classList.toggle('active', j === i); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { if (s) spy.observe(s); });
  }

  /* ---------- Contact form: chosen plan pill + service chips ---------- */
  var form = $('.form');
  var planField = $('#plan-field'), pillRow = $('.plan-pill-row');
  function setPlan(name) {
    if (!planField) return;
    planField.value = name || '';
    if (pillRow) {
      pillRow.hidden = !name;
      $('strong', pillRow).textContent = name || '';
    }
    $$('.plan[data-plan-card]').forEach(function (c) {
      c.classList.toggle('match', !!name && name.indexOf(c.getAttribute('data-plan-card')) === 0);
    });
  }
  if (pillRow) $('.plan-clear', pillRow).addEventListener('click', function () { setPlan(''); });
  $$('.plan-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { setPlan(btn.getAttribute('data-plan')); });
  });
  // Arriving from a service page with ?plan=...
  try {
    var qp = new URLSearchParams(location.search).get('plan');
    if (qp) setPlan(qp);
  } catch (e) {}

  var servicesField = $('#services-field');
  $$('.needs input[type="checkbox"]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      servicesField.value = $$('.needs input:checked').map(function (x) { return x.value; }).join(', ');
    });
  });

  /* ---------- Website estimator ---------- */
  var est = $('#estimator');
  if (est) {
    var seg = $$('.seg button', est), range = $('#pages', est);
    var cur = seg[0];
    function calc() {
      var base = +cur.getAttribute('data-base'), pages = +range.value, sum = base + pages * 100;
      $('#pages-out', est).textContent = pages;
      $('.est-base-name', est).textContent = cur.textContent + ' build';
      $('.est-base', est).textContent = money(base);
      $('.est-pages-label', est).textContent = pages + (pages === 1 ? ' page' : ' pages') + ' × $100';
      $('.est-pages', est).textContent = money(pages * 100);
      var total = $('.est-sum', est);
      total.textContent = money(sum);
      total.classList.remove('bump'); void total.offsetWidth; total.classList.add('bump');
      range.style.setProperty('--fill', ((pages - 1) / (range.max - 1)) * 100 + '%');
      est._summary = cur.getAttribute('data-name') + ', ' + pages + (pages === 1 ? ' page' : ' pages') + ' (est. ' + money(sum) + ' + $30/mo)';
    }
    seg.forEach(function (b) {
      b.addEventListener('click', function () {
        cur = b;
        seg.forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
        calc();
      });
    });
    range.addEventListener('input', calc);
    $('.est-btn', est).addEventListener('click', function () { setPlan(est._summary); });
    calc();
  }

  /* ---------- Custom Systems: business-type picker ---------- */
  $$('[data-industry]').forEach(function (box) {
    var sel = $('select', box);
    sel.addEventListener('change', function () {
      $$('.industry-panel', box).forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== sel.value; });
    });
    $$('.industry-btn', box).forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var name = btn.getAttribute('data-plan');
        if (form) setPlan(name);
        else { e.preventDefault(); location.href = '/pricing/?plan=' + encodeURIComponent(name) + '#contact'; }
      });
    });
  });

  /* ---------- Form validation + sending state ---------- */
  if (form) {
    $$('input[required], textarea[required]', form).forEach(function (el) {
      el.addEventListener('blur', function () { el.classList.add('touched'); });
    });
    form.addEventListener('submit', function (e) {
      var bad = $$('input[required], textarea[required]', form).filter(function (el) { return !el.checkValidity(); });
      $$('.err', form).forEach(function (x) { x.remove(); });
      if (bad.length) {
        e.preventDefault();
        bad.forEach(function (el) {
          el.classList.add('touched');
          var m = document.createElement('span');
          m.className = 'err';
          m.textContent = el.type === 'email' && el.value ? 'Please enter a valid email.' : 'This one is needed.';
          el.parentNode.appendChild(m);
        });
        bad[0].focus();
        return;
      }
      var btn = $('button[type="submit"]', form);
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Sending…';
    });
  }

  /* ---------- Email: copy to clipboard ---------- */
  $$('.copy-email').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var email = btn.getAttribute('data-email');
      function show() {
        btn.textContent = 'Copied to clipboard!';
        setTimeout(function () { btn.textContent = email; }, 2500);
      }
      if (navigator.clipboard) navigator.clipboard.writeText(email).then(show, show); else show();
    });
  });

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
