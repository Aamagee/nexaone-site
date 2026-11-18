// PREVIEW ONLY: palette switcher for reviewing the redesign.
// Delete this file and its <script> tag in each page before going live.
(function () {
  var root = document.documentElement;
  var groups = [
    { key: 'nexa-palette', attr: 'data-palette', label: 'Palette', opts: [['sunset', 'Sunset'], ['earthy', 'Earthy']] }
  ];
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function apply(g, v) {
    if (!v || v === g.opts[0][0]) root.removeAttribute(g.attr); else root.setAttribute(g.attr, v);
  }
  groups.forEach(function (g) { apply(g, get(g.key)); });

  document.addEventListener('DOMContentLoaded', function () {
    var wrap = document.createElement('div');
    wrap.setAttribute('style', 'position:fixed;left:16px;bottom:16px;z-index:999;display:flex;flex-direction:column;gap:6px;align-items:flex-start;font:600 13px/1 system-ui,sans-serif');
    groups.forEach(function (g) {
      var bar = document.createElement('div');
      bar.setAttribute('style', 'display:flex;gap:4px;align-items:center;padding:6px;border-radius:999px;background:rgba(20,12,20,.88);color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.3)');
      bar.innerHTML = '<span style="padding:0 8px 0 10px;opacity:.7">' + g.label + '</span>';
      var btns = [];
      g.opts.forEach(function (p) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = p[1];
        b.setAttribute('style', 'border:0;border-radius:999px;padding:8px 14px;font:inherit;cursor:pointer');
        b._paint = function () {
          var cur = root.getAttribute(g.attr) || g.opts[0][0];
          b.style.background = cur === p[0] ? '#fff' : 'transparent';
          b.style.color = cur === p[0] ? '#1e0f1c' : '#fff';
        };
        b.addEventListener('click', function () {
          apply(g, p[0]); set(g.key, p[0]);
          btns.forEach(function (x) { x._paint(); });
        });
        b._paint();
        btns.push(b);
        bar.appendChild(b);
      });
      wrap.appendChild(bar);
    });
    document.body.appendChild(wrap);
  });
})();
