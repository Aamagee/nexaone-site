// Nexa — shared page behavior
(function () {
  // Fade sections in as they scroll into view
  var items = document.querySelectorAll('.reveal');
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

  // Choosing a plan pre-fills the contact form
  document.querySelectorAll('.plan-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var msg = document.getElementById('message');
      if (msg && !msg.value) msg.value = "I'm interested in the " + btn.getAttribute('data-plan') + ' plan. ';
    });
  });

  // Email: copy to clipboard (mailto does nothing without an email app set up)
  document.querySelectorAll('.copy-email').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var email = btn.getAttribute('data-email');
      function show() {
        btn.textContent = 'Copied to clipboard!';
        setTimeout(function () { btn.textContent = email; }, 2500);
      }
      if (navigator.clipboard) navigator.clipboard.writeText(email).then(show, show); else show();
    });
  });

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
