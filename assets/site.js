(function(){
  // clocks
  var els = document.querySelectorAll('[data-tz]');
  function tick(){
    var now = new Date();
    els.forEach(function(el){
      try{ el.textContent = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:el.getAttribute('data-tz')}); }catch(e){}
    });
  }
  tick(); setInterval(tick, 15000);

  // service filter
  var tabs = document.querySelectorAll('.tab'), cards = document.querySelectorAll('#catalog .svc');
  tabs.forEach(function(t){
    t.addEventListener('click', function(){
      tabs.forEach(function(x){ x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
      var f = t.getAttribute('data-f');
      cards.forEach(function(c){ c.hidden = !(f === 'all' || c.getAttribute('data-c') === f); });
    });
  });

  // mobile menu
  var mb = document.querySelector('.menu-btn'), links = document.querySelector('.links');
  if (mb && links) mb.addEventListener('click', function(){ var o = links.classList.toggle('open'); mb.setAttribute('aria-expanded', o ? 'true' : 'false'); });

  // estimator
  var hrs = document.getElementById('hrs'), local = document.getElementById('local');
  function money(n){ return '$' + n.toLocaleString('en-US',{maximumFractionDigits:0}); }
  function best(h){
    var opts = [{n:'Pay as you go', c:h*12}];
    if (h <= 80) opts.push({n:'Part-time assistant', c:799});
    else opts.push({n:'Part-time assistant + extra hours', c:799 + (h-80)*12});
    if (h <= 160) opts.push({n:'Full-time assistant', c:1449});
    opts.sort(function(a,b){ return a.c - b.c; });
    return opts[0];
  }
  function calc(){
    var h = +hrs.value, l = Math.max(0, +local.value || 0), b = best(h);
    document.getElementById('hrsOut').textContent = h;
    document.getElementById('planName').textContent = b.n;
    document.getElementById('cost').textContent = money(b.c);
    document.getElementById('rate').textContent = '$' + (b.c/h).toFixed(2) + ' / hr';
    var lc = l*h;
    document.getElementById('localCost').textContent = l + ' × ' + h + ' = ' + lc.toLocaleString('en-US');
    var s = document.getElementById('save');
    s.textContent = (l > 0 && lc > b.c) ? 'If your local rate is in USD, you save ' + money(lc - b.c) + ' a month.' : '';
  }
  if (hrs && local){ hrs.addEventListener('input', calc); local.addEventListener('input', calc); calc(); }

  // request form
  var form = document.getElementById('quote');
  if (!form) return;
  var formEl = form, out = document.getElementById('status'), pv = document.getElementById('preview'), row = document.getElementById('sendRow'), mailA = document.getElementById('mailReq');
  try { var sv = new URLSearchParams(location.search).get('service'); if (sv) { var sel = document.getElementById('q-svc'); for (var i = 0; i < sel.options.length; i++) if (sel.options[i].text === sv) sel.selectedIndex = i; } } catch (e) {}
  function v(id){ return document.getElementById(id).value.trim(); }
  form.addEventListener('submit', function(e){
    e.preventDefault();
    if (v('q-honey')) return;
    var em = v('q-email');
    if (!v('q-name') || !v('q-work') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){ out.textContent = 'Add your name, a valid email and the work you want to hand over.'; return; }
    var body = 'Hello DeskBridge,\n\nName: ' + v('q-name') + '\nEmail: ' + em + '\nBusiness: ' + (v('q-biz') || '-') + '\nCountry: ' + (v('q-country') || '-') + '\nService: ' + v('q-svc') + '\n\nWork:\n' + v('q-work') + '\n\nI would like the free 5-hour trial.';
    var subject = 'Free trial request - ' + (v('q-biz') || v('q-name'));
    function fallback(){
      pv.textContent = body; pv.hidden = false; row.hidden = false;
      mailA.href = 'mailto:deskbridgeglobal@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      out.textContent = 'We could not send this automatically. Copy your request or open your email app, and send it to deskbridgeglobal@gmail.com.';
      btn.disabled = false; btn.textContent = 'Send my request';
    }
    var btn = document.getElementById('sendBtn');
    btn.disabled = true; btn.textContent = 'Sending…'; out.textContent = '';
    fetch('https://formsubmit.co/ajax/deskbridgeglobal@gmail.com', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: JSON.stringify({ _subject: subject, _template: 'table', _replyto: em, name: v('q-name'), email: em, business: v('q-biz') || '-', country: v('q-country') || '-', service: v('q-svc'), work: v('q-work') })
    }).then(function(r){ return r.json(); }).then(function(d){
      if (d && (d.success === true || d.success === 'true')){
        form.querySelectorAll('input, textarea').forEach(function(el){ if (el.id !== 'q-honey') el.value = ''; });
        pv.hidden = true; row.hidden = true;
        btn.disabled = false; btn.textContent = 'Send my request';
        out.textContent = 'Thank you! Your request has been sent. We will reply to ' + em + ' within one working day.';
      } else { fallback(); }
    }).catch(fallback);
  });
  document.getElementById('copyReq').addEventListener('click', function(){
    var t = pv.textContent;
    function fb(){ var r = document.createRange(); r.selectNodeContents(pv); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); out.textContent = 'Selected. Press Ctrl+C or long-press to copy.'; }
    if (navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(function(){ out.textContent = 'Request copied. Paste it into an email to deskbridgeglobal@gmail.com.'; }, fb); } else { fb(); }
  });
})();
