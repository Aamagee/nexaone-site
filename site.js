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
        else { e.preventDefault(); location.href = '/?plan=' + encodeURIComponent(name) + '#contact'; }
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
