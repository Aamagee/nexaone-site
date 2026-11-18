// PREVIEW ONLY: palette switcher for reviewing the redesign.
// Delete this file and its <script> tag in each page before going live.
(function () {
  var KEY = 'nexa-palette';
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === 'earthy') root.setAttribute('data-palette', 'earthy');

  document.addEventListener('DOMContentLoaded', function () {
    var bar = document.createElement('div');
    bar.setAttribute('style', 'position:fixed;left:16px;bottom:16px;z-index:999;display:flex;gap:4px;align-items:center;padding:6px;border-radius:999px;background:rgba(20,12,20,.88);color:#fff;font:600 13px/1 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.3)');
    bar.innerHTML = '<span style="padding:0 8px 0 10px;opacity:.7">Palette</span>';
    [['sunset', 'Sunset'], ['earthy', 'Earthy']].forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = p[1];
      b.setAttribute('style', 'border:0;border-radius:999px;padding:8px 14px;font:inherit;cursor:pointer');
      function paint() {
        var on = (root.getAttribute('data-palette') || 'sunset') === p[0];
        b.style.background = on ? '#fff' : 'transparent';
        b.style.color = on ? '#1e0f1c' : '#fff';
      }
      b.addEventListener('click', function () {
        if (p[0] === 'sunset') root.removeAttribute('data-palette'); else root.setAttribute('data-palette', p[0]);
        try { localStorage.setItem(KEY, p[0]); } catch (e) {}
        bar.querySelectorAll('button').forEach(function (x) { x._paint(); });
      });
      b._paint = paint;
      paint();
      bar.appendChild(b);
    });
    document.body.appendChild(bar);
  });
})();
