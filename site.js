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
    if (nav) nav.classList.toggle('scrolled', y > 30 || nav.classList.contains('open'));
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
    onScroll();
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      onScroll();
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

  /* ---------- Custom Systems: business-type picker ---------- */
  $$('[data-industry]').forEach(function (box) {
    var sel = $('select', box);
    sel.addEventListener('change', function () {
      $$('.industry-panel', box).forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== sel.value; });
    });
  });

  /* ---------- Quote builder (cart) ---------- */
  var form = $('#quote-form');
  var PRICES = { static: 500, full: 1000, page: 100, maint: 30, adSetup: 100, google: 100, meta: 100 };

  function addToCart(keys, type) {
    if (!form) {
      // On a service page: carry the selection to the homepage builder
      var q = '?add=' + encodeURIComponent(keys) + (type ? '&type=' + encodeURIComponent(type) : '');
      location.href = '/' + q + '#contact';
      return;
    }
    keys.split(',').forEach(function (k) {
      if (k === 'static' || k === 'full') {
        var r = $('input[name="site"][value="' + k + '"]', form);
        if (r) r.checked = true;
      } else {
        var cb = $('[data-item="' + k + '"]', form);
        if (cb) cb.checked = true;
      }
    });
    if (type) { var s = $('#cs-type'); if (s) s.value = type; }
    update();
    var cart = $('.cart', form);
    cart.classList.remove('flash'); void cart.offsetWidth; cart.classList.add('flash');
  }

  // Any "Add to my quote" button
  $$('[data-add]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var keys = btn.getAttribute('data-add'), type = btn.getAttribute('data-type');
      if (!form) e.preventDefault();
      addToCart(keys, type);
    });
  });

  var pages = 1;
  function update() {
    if (!form) return;
    var site = ($('input[name="site"]:checked', form) || {}).value || 'none';
    var on = function (k) { var el = $('[data-item="' + k + '"]', form); return !!(el && el.checked); };
    var lines = [], once = 0, month = 0, quoteItems = false;

    $('.pages-row', form).hidden = site === 'none';
    $('.site-note', form).hidden = site === 'none';
    $('#page-count').textContent = pages;
    $('[data-step="-1"]', form).disabled = pages <= 1;

    if (site !== 'none') {
      var base = PRICES[site];
      lines.push([site === 'static' ? 'Static Site build' : 'Full-Service Site build', money(base)]);
      lines.push([pages + (pages === 1 ? ' page' : ' pages') + ' × $100', money(pages * PRICES.page)]);
      lines.push(['Website maintenance', money(PRICES.maint) + '/mo']);
      once += base + pages * PRICES.page;
      month += PRICES.maint;
    }
    var ads = on('google') || on('meta');
    if (ads) { lines.push(['Ad account setup', money(PRICES.adSetup)]); once += PRICES.adSetup; }
    if (on('google')) { lines.push(['Google Ads management', money(PRICES.google) + '/mo']); month += PRICES.google; }
    if (on('meta')) { lines.push(['Facebook & Instagram ads management', money(PRICES.meta) + '/mo']); month += PRICES.meta; }
    if (on('social')) { lines.push(['Social media management', 'Quote', 'q']); quoteItems = true; }

    var customType = $('#cs-type');
    $('.custom-type', form).hidden = !on('custom');
    if (on('custom')) {
      var label = customType && customType.value ? customType.options[customType.selectedIndex].text : '';
      lines.push(['Custom system' + (label ? ' (' + label + ')' : ''), 'Quote', 'q']);
      quoteItems = true;
    }

    var ul = $('.cart-lines', form);
    ul.innerHTML = '';
    if (!lines.length) {
      ul.innerHTML = '<li class="cart-empty">Pick what you need and your quote shows up here.</li>';
    } else {
      lines.forEach(function (l) {
        var li = document.createElement('li');
        if (l[2]) li.className = l[2];
        var a = document.createElement('span'); a.textContent = l[0];
        var b = document.createElement('span'); b.textContent = l[1];
        li.appendChild(a); li.appendChild(b); ul.appendChild(li);
      });
    }
    $('.t-once', form).textContent = money(once);
    $('.t-month', form).innerHTML = money(month) + '<small>/mo</small>';
    $('.quote-note', form).hidden = !quoteItems;
    $('.ads-note', form).hidden = !ads;

    // What gets emailed
    $('#q-summary').value = lines.length ? lines.map(function (l) { return l[0] + ': ' + l[1]; }).join(' | ') + (ads ? ' | Ad spend not included' : '') : 'Nothing selected (see message)';
    $('#q-once').value = money(once);
    $('#q-month').value = money(month) + '/mo';

    // Message is only required when nothing is picked
    var msg = $('#message');
    msg.required = !lines.length;
    $('.msg-opt', form).hidden = !lines.length;
    form._hasItems = !!lines.length;
  }

  if (form) {
    $$('input[name="site"], [data-item]', form).forEach(function (el) { el.addEventListener('change', update); });
    var cs = $('#cs-type'); if (cs) cs.addEventListener('change', update);
    $$('.step-btn', form).forEach(function (b) {
      b.addEventListener('click', function () {
        pages = Math.max(1, Math.min(50, pages + +b.getAttribute('data-step')));
        update();
      });
    });

    // Arriving from a service page with ?add=...
    try {
      var p = new URLSearchParams(location.search);
      if (p.get('add')) addToCart(p.get('add'), p.get('type'));
    } catch (e) {}
    update();

    // Validation + sending state
    $$('input[required], textarea', form).forEach(function (el) {
      el.addEventListener('blur', function () { el.classList.add('touched'); });
    });
    form.addEventListener('submit', function (e) {
      update();
      $$('.err', form).forEach(function (x) { x.remove(); });
      var bad = $$('input[required], textarea[required]', form).filter(function (el) { return !el.checkValidity(); });
      if (bad.length) {
        e.preventDefault();
        bad.forEach(function (el) {
          el.classList.add('touched');
          var m = document.createElement('span');
          m.className = 'err';
          m.textContent = el.type === 'email' && el.value ? 'Please enter a valid email.'
            : el.id === 'message' ? "Pick something above, or tell me what you need here." : 'This one is needed.';
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
