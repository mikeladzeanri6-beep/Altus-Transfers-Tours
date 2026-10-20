window.ALTUS_PRICES = { /* Fill in a per-day rate to show price estimates in the Tour Builder, e.g. "Toyota Camry (2025)": 250, currency: "GEL" */ };
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var root = document.documentElement;
  var header = $('#top'), btn = $('#menuBtn'), dock = $('#dock');

  /* mobile menu */
  function setMenu(open) {
    header.classList.toggle('open', open);
    document.body.classList.toggle('lock', open);
    document.body.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  btn.addEventListener('click', function () { setMenu(!header.classList.contains('open')); });
  document.querySelectorAll('#menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  var mq = window.matchMedia('(min-width:900px)'), onMq = function () { if (mq.matches) setMenu(false); };
  if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);

  /* header + footer year */
  function onScroll() { header.classList.toggle('solid', window.scrollY > 30); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  $('#yr').textContent = new Date().getFullYear();

  /* scroll reveal */
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    rv.forEach(function (el) { io.observe(el); });
    var bk = $('#bookings');
    new IntersectionObserver(function (es) { dock.classList.toggle('hide', es[0].isIntersecting); }, { threshold: 0.2 }).observe(bk);
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* date: no past dates (local time) */
  var d = new Date(), pad = function (n) { return ('0' + n).slice(-2); };
  $('#date').min = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());

  /* "Reserve this vehicle" preselects fleet */
  document.querySelectorAll('.pick').forEach(function (b) {
    b.addEventListener('click', function () {
      $('#fleetSelect').value = b.getAttribute('data-v');
      $('#bookings').scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* booking form via EmailJS */
  var form = $('#bookingForm'), note = $('#note');
  function say(msg, cls) { note.textContent = msg; note.className = 'note ' + cls; }
  if (window.emailjs) emailjs.init('O6y2mykP0LcqoP5Pa');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.website.value) return; /* honeypot */
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (!window.emailjs) { say('Could not load the mail service. Please reach us on WhatsApp.', 'err'); return; }
    var s = form.querySelector('button[type=submit]'), label = s.textContent;
    s.textContent = 'Sending...'; s.disabled = true; say('', '');
    emailjs.sendForm('service_1zoxixh', 'template_bund6lm', form)
      .then(function () { window.dispatchEvent(new CustomEvent('altus:sent', { detail: { date: form.date.value, v: form.fleetSelect.value } })); say('Thank you. Your request is in and we will reply within hours.', 'ok'); form.reset(); })
      .catch(function () { say('Something went wrong. Please try again or message us on WhatsApp.', 'err'); })
      .then(function () { s.textContent = label; s.disabled = false; });
  });
})();

document.querySelectorAll('.dest').forEach(function (b) {
  b.addEventListener('click', function () {
    document.getElementById('dest').value = b.getAttribute('data-d');
    document.getElementById('bookings').scrollIntoView({ behavior: 'smooth' });
  });
});

(function () {
  var g = document.getElementById('guests'), dst = document.getElementById('dest'),
      fl = document.getElementById('fleetSelect'), hint = document.getElementById('hint'),
      f = document.getElementById('bookingForm');
  function suggest() {
    var n = +g.value, t = dst.value.toLowerCase(), v = '', why = '';
    if (n > 4) { v = 'Mercedes-Benz V-Class V250d (2019)'; why = 'Best for groups of ' + n + ' with luggage.'; }
    else if (/kazbegi|svaneti|mountain|pass/.test(t)) { v = 'Jeep Wrangler Rubicon (2017)'; why = 'Our 4x4 is built for mountain routes.'; }
    hint.textContent = v ? 'Suggested: ' + v.split(' (')[0] + '. ' + why : '';
    hint.onclick = null;
    if (v && !fl.value) fl.value = v;
  }
  g.addEventListener('change', suggest);
  dst.addEventListener('input', suggest);
  document.getElementById('waBtn').addEventListener('click', function () {
    var v = function (n) { return f.elements[n].value || '-'; };
    var msg = 'Hello Altus, I would like to inquire.\nName: ' + v('fullName') + '\nService: ' + v('serviceType') +
      '\nVehicle: ' + v('fleetSelect') + '\nDate: ' + v('date') + '\nGuests: ' + v('guests') +
      '\nDestination: ' + v('destination') + '\nNotes: ' + v('message');
    window.open('https://wa.me/995592804401?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });
})();

(function () {
  var $ = function (i) { return document.getElementById(i); };
  var stops = document.querySelectorAll('input[name=stop]'), ints = document.querySelectorAll('input[name=int]');
  function sel(list) { return Array.prototype.filter.call(list, function (x) { return x.checked; }).map(function (x) { return x.value; }); }
  function car(s, n) {
    if ($('bCar').value) return $('bCar').value;
    if (n > 4) return 'Mercedes-Benz V-Class V250d (2019)';
    if (s.indexOf('Kazbegi') > -1 || s.indexOf('Svaneti') > -1) return 'Jeep Wrangler Rubicon (2017)';
    return n <= 3 ? 'Toyota Camry (2025)' : 'Mercedes-Benz V-Class V250d (2019)';
  }
  function plan() {
    var s = sel(stops), i = sel(ints), d = +$('bDays').value, n = +$('bGuests').value, st = $('bStart').value;
    $('bDaysV').textContent = d;
    var route = s.length ? [st].concat(s.filter(function (x) { return x !== st; })).join(' → ') : '';
    $('sRoute').textContent = route || 'Choose your stops';
    var v = car(s, n);
    $('sList').innerHTML = '<li><b>Days</b>' + d + '</li><li><b>Guests</b>' + n + '</li><li><b>Vehicle</b>' + v + '</li>' + (i.length ? '<li><b>Interests</b>' + i.join(', ') + '</li>' : '');
    $('sTip').textContent = s.length > d * 2 ? 'Tip: that is a lot of ground. Consider adding a day for a relaxed pace.' : '';
    var P = window.ALTUS_PRICES || {}, rate = P[v];
    if (rate) $('sList').innerHTML += '<li><b>Estimate</b>from ' + (rate * d) + ' ' + (P.currency || 'GEL') + ', confirmed by our team</li>';
    return { route: route, d: d, n: n, v: v, i: i, s: s, st: st };
  }
  document.querySelectorAll('.bctl input,.bctl select').forEach(function (e) { e.addEventListener('input', plan); e.addEventListener('change', plan); });
  document.querySelectorAll('.cust').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = b.getAttribute('data-t').split('|'), st = p[0].split(','), it = p[2].split(',');
      stops.forEach(function (x) { x.checked = st.indexOf(x.value) > -1; });
      ints.forEach(function (x) { x.checked = it.indexOf(x.value) > -1; });
      $('bDays').value = p[1]; plan();
      $('builder').scrollIntoView({ behavior: 'smooth' });
    });
  });
  function text(p) { return 'Custom tour: ' + (p.route || 'to be decided') + '. Days: ' + p.d + '. Guests: ' + p.n + '. Vehicle: ' + p.v + '. Interests: ' + (p.i.join(', ') || '-') + '.'; }
  $('bUse').addEventListener('click', function () {
    var p = plan();
    $('guests').value = p.n; $('dest').value = p.s.join(', '); $('serviceType').value = 'Private Tour';
    $('fleetSelect').value = p.v; $('message').value = text(p);
    $('bookings').scrollIntoView({ behavior: 'smooth' });
  });
  $('bWa').addEventListener('click', function () {
    window.open('https://wa.me/995592804401?text=' + encodeURIComponent('Hello Altus, I designed a tour. ' + text(plan())), '_blank', 'noopener');
  });
  plan();
})();

(function () {
  var $ = function (s) { return document.querySelector(s); };
  /* progress + back to top */
  var prog = $('#prog'), tt = $('#toTop');
  function sc() {
    var m = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (m > 0 ? scrollY / m * 100 : 0) + '%';
    tt.hidden = scrollY < 700;
  }
  addEventListener('scroll', sc, { passive: true }); sc();
  tt.addEventListener('click', function () { scrollTo({ top: 0, behavior: 'smooth' }); });

  /* live Georgia time and weather */
  var wx = $('#wx'), temp = '';
  function tick() {
    var t = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tbilisi', hour: '2-digit', minute: '2-digit' }).format(new Date());
    wx.textContent = 'Tbilisi now ' + t + temp; wx.hidden = false;
  }
  tick(); setInterval(tick, 60000);
  fetch('https://api.open-meteo.com/v1/forecast?latitude=41.72&longitude=44.79&current=temperature_2m')
    .then(function (r) { return r.json(); })
    .then(function (d) { temp = ' · ' + Math.round(d.current.temperature_2m) + '°C'; tick(); })
    .catch(function () {});

  /* photo lightbox */
  var lb = $('#lb'), li = lb.querySelector('img');
  document.querySelectorAll('.car:not(.trip) .pic img, .gal img').forEach(function (im) {
    im.addEventListener('click', function () { li.src = im.src; li.alt = im.alt; lb.hidden = false; document.body.classList.add('lock'); });
  });
  function closeLb() { lb.hidden = true; document.body.classList.remove('lock'); }
  lb.addEventListener('click', closeLb);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });

  /* interactive map synced with tour builder */
  var stops = document.querySelectorAll('input[name=stop]');
  function sync() {
    document.querySelectorAll('#gmap .city').forEach(function (c) {
      var x = document.querySelector('input[name=stop][value="' + c.dataset.c + '"]');
      c.classList.toggle('on', !!(x && x.checked));
      c.setAttribute('aria-pressed', !!(x && x.checked));
    });
  }
  document.querySelectorAll('#gmap .city').forEach(function (c) {
    function tg() {
      var x = document.querySelector('input[name=stop][value="' + c.dataset.c + '"]');
      x.checked = !x.checked; x.dispatchEvent(new Event('change', { bubbles: true }));
    }
    c.addEventListener('click', tg);
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tg(); } });
  });
  stops.forEach(function (x) { x.addEventListener('change', sync); });
  document.querySelectorAll('.cust').forEach(function (b) { b.addEventListener('click', function () { setTimeout(sync, 0); }); });
  sync();

  /* add to calendar (.ics) after a booking inquiry */
  window.addEventListener('altus:sent', function (e) {
    var dt = e.detail.date; if (!dt) return;
    var s = dt.replace(/-/g, ''), n = new Date(dt + 'T00:00:00Z'); n.setUTCDate(n.getUTCDate() + 1);
    var en = n.toISOString().slice(0, 10).replace(/-/g, '');
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Altus//EN', 'BEGIN:VEVENT', 'UID:' + Date.now() + '@altus', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z',
      'DTSTART;VALUE=DATE:' + s, 'DTEND;VALUE=DATE:' + en, 'SUMMARY:Altus Transfers & Tours (pending confirmation)', 'DESCRIPTION:Vehicle: ' + (e.detail.v || '-'), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = $('#ics'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'altus-trip.ics'; a.hidden = false;
  });

  /* call back request */
  var cb = $('#cbForm'), cn = $('#cbNote');
  cb.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!cb.checkValidity()) { cb.reportValidity(); return; }
    if (!window.emailjs) { cn.textContent = 'Could not load the mail service. Please call or use WhatsApp.'; cn.className = 'note err'; return; }
    var b = cb.querySelector('button'), l = b.textContent; b.disabled = true; b.textContent = 'Sending...';
    emailjs.send('service_1zoxixh', 'template_bund6lm', { fullName: $('#cbName').value, email: '(call back request)', phone: $('#cbPhone').value, serviceType: 'CALL BACK REQUEST', fleetSelect: '-', date: '-', guests: '-', destination: '-', message: 'Please call back. Best time: ' + $('#cbTime').value })
      .then(function () { cn.textContent = 'Thank you. We will call you back soon.'; cn.className = 'note ok'; cb.reset(); })
      .catch(function () { cn.textContent = 'Something went wrong. Please call us directly.'; cn.className = 'note err'; })
      .then(function () { b.disabled = false; b.textContent = l; });
  });
})();

(function () {
  var info = document.getElementById('mInfo');
  var MAIN = { Kazbegi: 'Alpine passes and mountain villages, best reached in our Jeep.', Svaneti: 'Medieval tower villages high in the Caucasus, a true 4x4 expedition.', Kakheti: 'Private cellar visits and tastings in Georgia\'s wine country.', Tbilisi: 'The capital, rich in culture and food, easy to pair with Kakheti.', Batumi: 'The Black Sea coast, ideal for a slower, relaxed pace.', Kutaisi: 'The gateway to western Georgia, linking the coast and the capital.' };
  function show(t, d) { info.innerHTML = ''; var b = document.createElement('b'), s = document.createElement('span'); b.textContent = t; s.textContent = d; info.appendChild(b); info.appendChild(s); }
  document.querySelectorAll('#gmap .city').forEach(function (c) { c.addEventListener('click', function () { show(c.dataset.c, MAIN[c.dataset.c] + ' Added to your tour builder.'); }); });
  document.querySelectorAll('#gmap .spot').forEach(function (s) {
    function go() { document.querySelectorAll('#gmap .spot').forEach(function (x) { x.classList.remove('on'); }); s.classList.add('on'); show(s.dataset.n, s.dataset.i + ' We can take you there, just mention it in your request.'); }
    s.addEventListener('click', go);
    s.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
})();

(function () {
  var v = document.getElementById('hv'); if (!v) return;
  var c = navigator.connection || {};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || c.saveData) { v.remove(); return; }
  function play() { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  v.muted = true; play();
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es[0].isIntersecting ? play() : v.pause(); }, { threshold: 0.05 }).observe(v);
})();

(function () {
  var dc = document.getElementById('dockChat');
  if (dc) dc.addEventListener('click', function () { var b = document.getElementById('chatBtn'); if (b) b.click(); });
  var vs = document.querySelectorAll('.rf video'); if (!vs.length) return;
  var c = navigator.connection || {};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || c.saveData || !('IntersectionObserver' in window)) { vs.forEach(function (v) { v.controls = true; }); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { var v = e.target; if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
  }, { threshold: 0.4 });
  vs.forEach(function (v) { v.muted = true; io.observe(v); });
})();
