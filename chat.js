/* Altus Concierge. Works offline from a built-in knowledge base.
   Optional: set window.ALTUS_CHAT = { endpoint: "https://your-worker.workers.dev" } (see chat-worker.js)
   to let an AI model answer open-ended questions. */
(function () {
  var CFG = window.ALTUS_CHAT || {};
  var WA = 'https://wa.me/995592804401';
  var PL = {
    Kazbegi: { t: ['mountains', 'photography', 'adventure'], d: 'alpine passes and mountain villages, best reached in our Jeep' },
    Svaneti: { t: ['mountains', 'culture', 'adventure', 'photography'], d: 'medieval tower villages high in the Caucasus, a true 4x4 expedition' },
    Kakheti: { t: ['wine', 'food', 'culture'], d: 'private cellar visits and tastings in the heart of wine country' },
    Tbilisi: { t: ['culture', 'food', 'wine'], d: 'the capital, rich in culture and food, easy to pair with Kakheti' },
    Batumi: { t: ['coast', 'relaxation', 'food'], d: 'the Black Sea coast, ideal for a slower, relaxed pace' },
    Kutaisi: { t: ['culture', 'relaxation'], d: 'the gateway to western Georgia and a natural link between coast and capital' }
  };
  var INTS = [['Wine & food', ['wine', 'food']], ['Mountains', ['mountains']], ['Culture & history', ['culture']], ['Photography', ['photography']], ['Coast & relaxation', ['coast', 'relaxation']], ['Adventure', ['adventure']]];
  var KEYS = [[/wine|vineyard|winery|tasting|qvevri/, ['wine']], [/food|eat|cuisine|restaurant|khachapuri/, ['food']], [/mountain|hik|alpine|snow|peak/, ['mountains']], [/photo|view|scenery|landscape|instagram/, ['photography']], [/cultur|histor|museum|church|monaster|architect|old town/, ['culture']], [/sea\b|beach|coast|relax|spa|swim/, ['coast', 'relaxation']], [/adventure|off.?road|4x4|jeep|extreme/, ['adventure']]];
  var TYPES = {
    alps: { pl: ['Svaneti', 'Kazbegi'], ints: ['mountains', 'photography', 'adventure'], line: 'Svaneti and Kazbegi: snow-capped Caucasus peaks that rival the Alps, with stone tower villages and high mountain passes.' },
    wine: { pl: ['Kakheti', 'Tbilisi'], ints: ['wine', 'food', 'culture'], line: 'Kakheti: rolling vineyards beneath the mountains, where wine is still made in clay qvevri jars as it has been for thousands of years.' },
    sea: { pl: ['Batumi', 'Kutaisi'], ints: ['coast', 'relaxation'], line: 'Batumi and the Adjara coast: Black Sea beaches and a lively boulevard, with subtropical green mountains right behind.' },
    canyon: { pl: ['Kutaisi'], ints: ['adventure', 'photography'], line: 'The Kutaisi area: turquoise canyons such as Okatse and Martvili, with caves and waterfalls an easy day trip away.' },
    desert: { pl: ['Kakheti'], ints: ['photography', 'culture'], line: 'David Gareja in Kakheti: a semi-desert of painted hills and a cliffside monastery on the Azerbaijan border.' },
    oldtown: { pl: ['Tbilisi', 'Kakheti'], ints: ['culture', 'food'], line: 'Tbilisi and Sighnaghi: old-town lanes with carved wooden balconies, and a walled hilltop town above the Alazani Valley.' },
    lakes: { pl: ['Svaneti'], ints: ['mountains', 'photography'], line: 'Svaneti and Borjomi: alpine lakes such as Koruldi, high meadows and deep green forests.' }
  };
  var HOME = [
    [/\b(switzerland|swiss|austria|austrian|tyrol|alps|alpine|chamonix|dolomites|slovenia|nepal|himalaya\w*|norway|norwegian|sweden|swedish|finland|finnish|iceland|banff|rockies|colorado|bavaria|kyrgyzstan|tajikistan|pakistan)\b/, ['alps', 'lakes']],
    [/\b(italy|italian|tuscany|piedmont|sicily)\b/, ['wine', 'oldtown', 'alps']],
    [/\b(france|french|provence|bordeaux|burgundy)\b/, ['wine', 'alps', 'oldtown']],
    [/\b(spain|spanish|rioja|portugal|portuguese|douro)\b/, ['wine', 'sea', 'oldtown']],
    [/\b(germany|german|netherlands|dutch|holland|belgium|belgian|luxembourg)\b/, ['oldtown', 'wine', 'alps']],
    [/\b(uk|england|english|britain|british|scotland|scottish|ireland|irish|wales)\b/, ['lakes', 'oldtown', 'sea']],
    [/\b(greece|greek|croatia|croatian|malta|cyprus|montenegro|albania|bulgaria|bulgarian|romania|romanian|serbia)\b/, ['sea', 'oldtown', 'alps']],
    [/\b(turkey|turkish|turkiye|istanbul|cappadocia)\b/, ['canyon', 'sea', 'oldtown']],
    [/\b(israel|israeli|jordan|egypt|egyptian|lebanon|morocco|tunisia)\b/, ['sea', 'desert', 'oldtown']],
    [/\b(uae|emirates|dubai|abu dhabi|saudi|qatar|kuwait|bahrain|oman|iraq)\b/, ['sea', 'alps', 'lakes']],
    [/\b(usa|america|american|united states|california|texas|canada|canadian|mexico)\b/, ['alps', 'wine', 'canyon']],
    [/\b(poland|polish|czech|prague|hungary|hungarian|slovakia|estonia|latvia|lithuania|baltic|denmark|danish)\b/, ['oldtown', 'lakes', 'sea']],
    [/\b(russia|russian|ukraine|ukrainian|belarus|kazakhstan|uzbekistan|moscow|petersburg)\b/, ['alps', 'sea', 'lakes']],
    [/\b(india|indian|sri lanka|bangladesh)\b/, ['alps', 'lakes']],
    [/\b(china|chinese|japan|japanese|korea|korean|taiwan|vietnam|thailand|malaysia|singapore|indonesia|philippines)\b/, ['lakes', 'alps', 'oldtown']],
    [/\b(australia|australian|new zealand|south africa|chile|argentina|brazil|peru|colombia)\b/, ['wine', 'alps', 'sea']],
    [/\b(iran|iranian|armenia|armenian|azerbaijan|azerbaijani)\b/, ['alps', 'oldtown', 'wine']]
  ];
  var LAND = [[/desert|dunes?/, ['desert']], [/canyon|gorge|waterfall/, ['canyon']], [/beach|seaside|mediterranean|riviera|\bsea\b|coast/, ['sea']], [/\blakes?\b|fjord|forest/, ['lakes']], [/medieval|old town|castle/, ['oldtown']], [/vineyard|wine/, ['wine']], [/mountain/, ['alps']]];
  var LCH = [['Alpine mountains', 'alps'], ['Wine country', 'wine'], ['Sea & coast', 'sea'], ['Canyons & waterfalls', 'canyon'], ['Desert landscapes', 'desert'], ['Old towns & castles', 'oldtown'], ['Lakes & forests', 'lakes']];
  var KB = [
    [/all of georgia|whole georgia|entire|anywhere|other (city|place|region|town)|tusheti|borjomi|vardzia|sighnaghi|mtskheta|gudauri|ushguli|racha|david gareja|martvili|abkhaz|region/, 'Yes, we operate tours and transfers across all of Georgia: from Batumi and the Black Sea to Tbilisi, Kakheti, Kazbegi and Svaneti, and lesser-known places such as Tusheti, Vardzia, Borjomi and Sighnaghi. Tell me where you would like to go and our team will plan it.'],
    [/price|cost|how much|rate|fee|cheap|expens|quote/, 'Pricing depends on the route, vehicle, duration and group size, so we quote each journey individually. Share your plan and our team will confirm a price before anything is arranged.'],
    [/pay|card|cash|deposit/, 'Payment details are confirmed together with your booking confirmation. If you have a preference, mention it in your inquiry.'],
    [/cancel|refund|reschedul|change my/, 'Terms are confirmed with your reservation, and we always do our best to accommodate changes. Please tell us as early as you can.'],
    [/flight|delay|airport|pick ?up|arriv|meet/, 'Airport transfers include a private meet-and-greet and flight tracking, so your chauffeur adapts to the real arrival time. We serve Tbilisi, Kutaisi and Batumi. Please share your flight number when you inquire.'],
    [/luggage|bag|suitcase/, 'The V-Class carries full luggage for up to 7 guests. The C43 AMG, the Camry and the Jeep each take 2 cases. If you carry more, tell us and we will plan accordingly.'],
    [/child|kid|baby|famil|infant|seat/, 'Families are very welcome. Please mention the children\'s ages in your inquiry so we can confirm the right arrangements.'],
    [/vehicle|\bcar\b|\bvan\b|jeep|suv|sedan|fleet|mercedes|camry|wrangler|v-class/, 'Our fleet: Mercedes-Benz V-Class (up to 7, full luggage), C43 AMG (up to 3, executive city), Jeep Wrangler Rubicon (up to 4, mountain 4x4) and Toyota Camry (up to 3, country tours). Tell me your group size and plans and I will suggest one.'],
    [/book|reserve|reservation|how do i|how to/, 'Booking is simple: send the inquiry form, use the Tour Builder, or message us on WhatsApp. Our team confirms availability within hours.'],
    [/language|speak|english|russian|georgian/, 'Please mention your preferred language in your inquiry and our team will confirm what we can arrange.'],
    [/season|weather|when|best time|winter|summer|harvest/, 'Wine tours are most atmospheric around the harvest, and alpine routes depend on season and road conditions. Tell me your dates and our team will advise honestly on what is realistic.'],
    [/phone|call|whatsapp|email|contact|human|agent|person|talk/, 'You can reach our team on WhatsApp, by phone at +995 592 804 401, or at reservations@altustours.ge. We reply within hours.']
  ];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var hist = [], st = { ints: [], guests: 2, days: 3 }, busy = false;

  /* ---------- UI ---------- */
  var btn = document.createElement('button');
  btn.id = 'chatBtn'; btn.setAttribute('aria-label', 'Open chat'); btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-5.4A8 8 0 1 1 21 12z"/></svg><span>Ask Altus</span>';
  var box = document.createElement('section');
  box.id = 'chat'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Altus Concierge');
  box.innerHTML = '<header><div><b>Altus Concierge</b><small>Trip ideas and quick answers</small></div><button type="button" aria-label="Close chat">&times;</button></header><div id="cLog" aria-live="polite"></div><form id="cForm" autocomplete="off"><input id="cIn" type="text" placeholder="Ask anything, or tell me what you enjoy..." aria-label="Your message" maxlength="400"><button type="submit" aria-label="Send">&rarr;</button></form><p class="cnote">Automated assistant. Our team confirms every booking.</p>';
  document.body.appendChild(btn); document.body.appendChild(box);
  var log = $('#cLog', box), inp = $('#cIn', box);

  function open(o) {
    box.hidden = !o; btn.hidden = o;
    document.body.classList.toggle('chatopen', o);
    if (o) { if (!log.children.length) hello(); setTimeout(function () { inp.focus({ preventScroll: true }); }, 50); }
  }
  btn.addEventListener('click', function () { open(true); });
  $('header button', box).addEventListener('click', function () { open(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) open(false); });

  function scroll() { log.scrollTop = log.scrollHeight; }
  function msg(text, who) { var m = document.createElement('div'); m.className = 'm ' + who; m.textContent = text; log.appendChild(m); scroll(); return m; }
  function row(items, multi, cb) {
    var r = document.createElement('div'); r.className = 'cr'; var picked = [];
    items.forEach(function (it) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = it.l;
      b.addEventListener('click', function () {
        if (multi) { b.classList.toggle('on'); var i = picked.indexOf(it); i > -1 ? picked.splice(i, 1) : picked.push(it); }
        else { r.remove(); msg(it.l, 'u'); cb(it); }
      });
      r.appendChild(b);
    });
    if (multi) {
      var d = document.createElement('button'); d.type = 'button'; d.className = 'go'; d.textContent = 'Done';
      d.addEventListener('click', function () { if (!picked.length) return; r.remove(); msg(picked.map(function (p) { return p.l; }).join(', '), 'u'); cb(picked); });
      r.appendChild(d);
    }
    log.appendChild(r); scroll();
  }
  function say(text, then, ms) {
    var t = msg('...', 'm typing'); busy = true;
    setTimeout(function () { t.className = 'm b'; t.textContent = text; busy = false; hist.push({ role: 'assistant', content: text }); scroll(); if (then) then(); }, ms || 550);
  }
  var menu = [{ l: 'Recommend a trip', k: 'rec' }, { l: 'Which vehicle?', k: 'veh' }, { l: 'Airport transfer', k: 'air' }, { l: 'Pricing', k: 'price' }, { l: 'Somewhere like home', k: 'home' }, { l: 'Talk to a human', k: 'human' }];
  function hello() { say('Hello, I am the Altus concierge. Tell me what you enjoy, or where you are from, and I will suggest where to go. You can also ask me anything about our transfers and tours.', function () { row(menu, false, menuPick); }); }
  function menuPick(it) {
    if (it.k === 'rec') return startRec();
    if (it.k === 'home') return askHome();
    var q = { veh: 'vehicle', air: 'airport transfer', price: 'price', human: 'contact human' }[it.k];
    answer(q);
  }
  function more() { row([{ l: 'Recommend a trip', k: 'rec' }, { l: 'Talk to a human', k: 'human' }], false, menuPick); }
  function human() {
    var r = document.createElement('div'); r.className = 'cr';
    [['WhatsApp', WA], ['Call us', 'tel:+995592804401']].forEach(function (x) { var a = document.createElement('a'); a.href = x[1]; a.textContent = x[0]; if (x[0] === 'WhatsApp') { a.target = '_blank'; a.rel = 'noopener'; } r.appendChild(a); });
    log.appendChild(r); scroll();
  }

  /* ---------- recommendation engine ---------- */
  function vehicle(stops, n) {
    if (n > 4) return 'Mercedes-Benz V-Class V250d (2019)';
    if (stops.indexOf('Kazbegi') > -1 || stops.indexOf('Svaneti') > -1) return 'Jeep Wrangler Rubicon (2017)';
    return n <= 3 ? 'Toyota Camry (2025)' : 'Mercedes-Benz V-Class V250d (2019)';
  }
  function recommend() {
    var tags = st.ints, sc = Object.keys(PL).map(function (k) { return { k: k, s: PL[k].t.filter(function (t) { return tags.indexOf(t) > -1; }).length }; });
    sc = sc.filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s; });
    if (!sc.length) sc = [{ k: 'Tbilisi' }, { k: 'Kakheti' }];
    var n = st.days <= 1 ? 1 : st.days <= 3 ? 2 : 3, pick = (st.stops && st.stops.length ? st.stops : sc.map(function (x) { return x.k; })).slice(0, n);
    var v = vehicle(pick, st.guests);
    var text = (st.home ? 'To give you a taste of home, here is what I would suggest for ' : 'Based on your interests, here is what I would suggest for ') + st.days + ' day' + (st.days > 1 ? 's' : '') + ' and ' + st.guests + ' guest' + (st.guests > 1 ? 's' : '') + ':\n\n' +
      pick.map(function (k) { return k + ': ' + PL[k].d; }).join('\n') + '\n\nSuggested vehicle: ' + v.split(' (')[0] + '.';
    say(text, function () {
      row([{ l: 'Open in Tour Builder', k: 'b' }, { l: 'Request this tour', k: 'r' }, { l: 'Somewhere like home', k: 'h' }, { l: 'Start over', k: 's' }], false, function (it) {
        if (it.k === 's') return startRec();
        if (it.k === 'h') return askHome();
        applyPlan(pick, it.k === 'r'); open(false);
      });
    }, 900);
    st.last = pick;
  }
  function applyPlan(stops, submit) {
    var ch = function (el, v) { el.checked = v; el.dispatchEvent(new Event('change', { bubbles: true })); };
    document.querySelectorAll('input[name=stop]').forEach(function (x) { ch(x, stops.indexOf(x.value) > -1); });
    var map = { wine: 'Wine & food', food: 'Wine & food', mountains: 'Mountains', adventure: 'Mountains', culture: 'Culture & history', photography: 'Photography' };
    var want = st.ints.map(function (t) { return map[t]; });
    document.querySelectorAll('input[name=int]').forEach(function (x) { ch(x, want.indexOf(x.value) > -1); });
    var d = document.getElementById('bDays'), g = document.getElementById('bGuests');
    d.value = Math.min(7, st.days); d.dispatchEvent(new Event('input', { bubbles: true }));
    g.value = Math.min(7, st.guests); g.dispatchEvent(new Event('change', { bubbles: true }));
    if (submit) document.getElementById('bUse').click(); else document.getElementById('builder').scrollIntoView({ behavior: 'smooth' });
  }
  function askGD(cb) {
    say('How many guests are travelling?', function () {
      row([1, 2, 3, 4, 6].map(function (n) { return { l: n === 6 ? '5+' : String(n), v: n }; }), false, function (g) {
        st.guests = g.v;
        say('And how many days do you have?', function () {
          row([1, 2, 3, 5, 7].map(function (n) { return { l: n === 5 ? '4-5' : n === 7 ? '6-7' : String(n), v: n }; }), false, function (d) { st.days = d.v; cb(); });
        });
      });
    });
  }
  function askHome() {
    st = { ints: [], guests: 2, days: 3, awaitHome: true };
    say('Where are you from? Type your country or city, or a place whose scenery you love, and I will find the closest match in Georgia. You can also pick what you miss most.', function () { landRow(); });
  }
  function landRow() {
    row(LCH.map(function (x) { return { l: x[0], k: x[1] }; }), true, function (sel) { homeRec(sel.map(function (s) { return s.k; }), ''); });
  }
  function cap(s) { return s.length <= 3 ? s.toUpperCase() : s.replace(/\b\w/g, function (m) { return m.toUpperCase(); }); }
  function matchHome(t, loose) {
    for (var i = 0; i < HOME.length; i++) { var m = t.match(HOME[i][0]); if (m) return { types: HOME[i][1], name: cap(m[0]) }; }
    if (loose) for (var j = 0; j < LAND.length; j++) if (LAND[j][0].test(t)) return { types: LAND[j][1], name: '' };
    return null;
  }
  function homeRec(types, name) {
    var keep = { guests: st.guests || 2, days: st.days || 3, known: st.known };
    st = { ints: [], stops: [], guests: keep.guests, days: keep.days, known: keep.known, home: name || 'home' };
    var lines = [];
    types.slice(0, 3).forEach(function (k) {
      var T = TYPES[k]; lines.push(T.line);
      T.ints.forEach(function (i) { if (st.ints.indexOf(i) < 0) st.ints.push(i); });
      T.pl.forEach(function (p) { if (st.stops.indexOf(p) < 0) st.stops.push(p); });
    });
    say((name ? 'Coming from ' + name + '? ' : '') + 'Here is where I think you would feel right at home in Georgia:\n\n' + lines.join('\n\n'), function () { if (st.known) recommend(); else askGD(recommend); }, 900);
  }
  function startRec() {
    st = { ints: [], guests: 2, days: 3 };
    say('Lovely. What do you enjoy most? Pick all that apply.', function () {
      row(INTS.map(function (i) { return { l: i[0], t: i[1] }; }), true, function (sel) {
        sel.forEach(function (s) { s.t.forEach(function (t) { if (st.ints.indexOf(t) < 0) st.ints.push(t); }); });
        askGD(recommend);
      });
    });
  }

  /* ---------- free text ---------- */
  function detect(text) {
    var out = []; KEYS.forEach(function (k) { if (k[0].test(text)) k[1].forEach(function (t) { if (out.indexOf(t) < 0) out.push(t); }); }); return out;
  }
  function answer(text) {
    var t = text.toLowerCase(), found = detect(t);
    if (/^(hi|hello|hey|salam|gamarjoba|good (morning|evening|afternoon))\b/.test(t)) return say('Hello! How can I help you plan your trip to Georgia?', function () { row(menu, false, menuPick); });
    if (/thank|thx/.test(t)) return say('You are very welcome. Is there anything else I can help with?', more);
    if (/where are you (from|based|located)|where is (your|the) (office|company)|your location|where do you (operate|work)/.test(t)) {
      st = { ints: [], guests: 2, days: 3, awaitHome: true };
      return say('Altus is based in Batumi, and we travel across all of Georgia. And you, where are you from? Tell me and I can suggest places here that feel like home.', function () { landRow(); });
    }
    var origin = /\b(i am from|i'm from|im from|we are from|we're from|from|i live in|we live in|living in|based in|come from|coming from|my country|my home|back home|at home)\b/.test(t);
    var like = /(similar|looks? like|look like|remind|resembl|same as|feels? like|just like|miss|like my|like our|like home)/.test(t);
    var hm = matchHome(t, like || st.awaitHome);
    if (hm && (st.awaitHome || origin || like || t.split(/\s+/).length <= 3)) {
      var dd = t.match(/(\d+)\s*(day|night)/), gg = t.match(/(\d+)\s*(people|persons|guests|of us|adults|travel)/);
      if (dd || gg) { st.days = dd ? Math.min(7, +dd[1]) : (st.days || 3); st.guests = gg ? Math.min(7, +gg[1]) : (st.guests || 2); st.known = true; }
      return homeRec(hm.types, hm.name);
    }
    var wantsRec = /recommend|suggest|where (should|to|can)|what (to|should) (see|do|visit)|itinerary|ideas|what do you (offer|suggest)|first time|never been/.test(t);
    if (found.length || wantsRec) {
      if (!found.length) return startRec();
      var d = t.match(/(\d+)\s*(day|night)/), g = t.match(/(\d+)\s*(people|persons|guests|of us|adults|travel)/);
      st = { ints: found, guests: g ? Math.min(7, +g[1]) : 2, days: d ? Math.min(7, +d[1]) : 3 };
      return say('Great choice. Here is my suggestion' + (d || g ? '.' : ' (I assumed 2 guests and 3 days, you can change that in the builder).'), recommend, 500);
    }
    for (var i = 0; i < KB.length; i++) if (KB[i][0].test(t)) {
      var a = KB[i][1], hm = /contact|human|agent|call|whatsapp/.test(KB[i][0].source);
      return say(a, function () { hm ? human() : more(); });
    }
    if (st.awaitHome) return say('I did not quite catch that place. Which landscapes do you love most at home?', landRow);
    if (CFG.endpoint) {
      var tp = msg('...', 'm typing'); busy = true;
      return fetch(CFG.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: hist.slice(-10) }) })
        .then(function (r) { return r.json(); })
        .then(function (d) { tp.remove(); busy = false; say(d.reply || 'Let me connect you with our team.', human, 100); })
        .catch(function () { tp.remove(); busy = false; fallback(); });
    }
    fallback();
  }
  function fallback() { say('I am not certain about that one, and I would rather not guess. Our team can answer it personally within hours.', human); }

  $('#cForm', box).addEventListener('submit', function (e) {
    e.preventDefault(); var v = inp.value.trim(); if (!v || busy) return;
    inp.value = ''; msg(v, 'u'); hist.push({ role: 'user', content: v }); answer(v);
  });
})();
