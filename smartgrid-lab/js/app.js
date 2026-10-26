/* LÕI ỨNG DỤNG: cấu hình, điều hướng, thuật ngữ, tìm kiếm, phiếu thiết bị/kết nối dùng chung.
   Mọi chuỗi hiển thị đi qua SG.t (i18n/<lang>/core.js). */
SG.PAGES = ['overview', 'diagram', 'library', 'selector', 'comms', 'io', 'scenarios', 'hmi', 'bom', 'glossary'];
SG.render = {};
SG.store = {
  get(k, d) { try { const v = localStorage.getItem('sglab.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('sglab.' + k, JSON.stringify(v)); } catch (e) { /* bỏ qua */ } }
};
SG.cfg = Object.assign({}, SG.defaultCfg, SG.store.get('cfg', {}));
SG.saveCfg = () => { SG.store.set('cfg', SG.cfg); SG.r = SG.calc(SG.cfg); };
SG.r = SG.calc(SG.cfg);
SG.ui = { detail: SG.store.get('detail', false), page: 'overview', arg: null };

SG.esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/* {{id}} / {{id|chữ}} → thuật ngữ có chú giải; chế độ song ngữ thêm tên ở ngôn ngữ thứ hai */
SG.T = function (str) {
  return String(str == null ? '' : str).replace(/\{\{([a-z0-9_]+)(?:\|([^}]+))?\}\}/g, (m, id, txt) => {
    const g = SG.glossary[id]; if (!g) return txt || id;
    const bl = SG.bilingual !== 'off' && SG.bilingual !== SG.lang ? SG.termName(id, SG.bilingual) : '';
    return `<button type="button" class="term" data-term="${id}">${SG.esc(txt || g.vi)}</button>${bl ? `<span class="bi" lang="${SG.bilingual}"> (${SG.esc(bl)})</span>` : ''}`;
  });
};
SG.fx = (n, d = 1) => (n == null || isNaN(n)) ? '—' : (Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).toLocaleString(SG.loc(), { minimumFractionDigits: d, maximumFractionDigits: d });
SG.dev = id => SG.devices.find(d => d.id === id);
SG.devOn = d => !d.cond || SG.conds[d.cond](SG.cfg);
SG.allLinks = () => SG.links.concat(SG.rs485Links(SG.cfg)).filter(l => (!l.cond || SG.conds[l.cond](SG.cfg)) && SG.devOn(SG.dev(l.a.d)) && SG.devOn(SG.dev(l.b.d)));
SG.link = id => SG.allLinks().find(l => l.id === id) || SG.links.find(l => l.id === id);
SG.lbl = lb => SG.t('lb.long' + lb);
SG.lbChip = lb => `<span class="chip lb${lb}" title="${SG.esc(SG.lbl(lb))}">${SG.t('lb.short' + lb)}</span>`;
SG.stChip = (s, txt) => `<span class="st ${s}">${txt || SG.t('st3.' + s)}</span>`;
SG.specVal = (d, k) => { const v = d.spec && d.spec[k]; if (v == null) return null; try { return typeof v === 'function' ? v(SG.cfg, SG.r) : v; } catch (e) { return '—'; } };
SG.layerName = k => SG.t('layer.' + k);
SG.layerSwatch = (k, w = 34) => { const L = SG.LAYERS[k]; return `<svg width="${w}" height="10" aria-hidden="true"><line x1="1" y1="5" x2="${w - (L.arrow ? 6 : 1)}" y2="5" class="lk-${k}" style="stroke:var(--l-${k});stroke-width:${Math.min(L.w, 3)};stroke-dasharray:${L.dash}"/>${L.arrow ? `<path d="M${w - 7},1 L${w - 1},5 L${w - 7},9z" style="fill:var(--l-${k})"/>` : ''}</svg>`; };
/* tên loại thiết bị ở ngôn ngữ thứ hai (FR khi đang VI/EN, EN khi đang FR) */
SG.typeName = (tid, lang) => { const b = SG._i18nBase.types[tid]; if (lang === 'vi') return b.name; const o = SG.I18D[lang] && SG.I18D[lang].types && SG.I18D[lang].types[tid]; return (o && o.name) || (lang === 'fr' ? b.fr : b.name); };
/* tên phụ hiển thị cạnh tên loại: theo chế độ song ngữ; bản VI giữ tên tiếng Pháp như thiết kế gốc */
SG.typeAltShown = tid => { if (SG.bilingual !== 'off' && SG.bilingual !== SG.lang) return { t: SG.typeName(tid, SG.bilingual), l: SG.bilingual }; return SG.lang === 'vi' ? { t: SG._i18nBase.types[tid].fr, l: 'fr' } : null; };
SG.typeAlt = tid => ['vi', 'en', 'fr'].filter(l => l !== SG.lang).map(l => SG.typeName(tid, l)).join(' / ');
/* nhóm loại thiết bị ổn định (không phụ thuộc ngôn ngữ) */
SG.typeGroup = tid => { const g = SG._i18nBase.types[tid].group; return /Nguồn|Lưu trữ/.test(g) ? 'src' : /Tải/.test(g) ? 'load' : /Đóng cắt|An toàn/.test(g) ? 'sw' : /Đo lường/.test(g) ? 'meas' : /Truyền thông|Giám sát/.test(g) ? 'comm' : /Phụ trợ/.test(g) ? 'aux' : /Phân phối/.test(g) ? 'bus' : 'ctrl'; };

/* ---------- thuật ngữ: tooltip rê chuột / bấm ---------- */
(function () {
  let pinned = null;
  const tip = () => document.getElementById('tip');
  function show(el) {
    const g = SG.glossary[el.dataset.term]; if (!g) return;
    const t = tip(), id = el.dataset.term;
    const others = ['vi', 'en', 'fr'].filter(l => l !== SG.lang).map(l => SG.LANGS[l].s + ': ' + SG.esc(SG.termName(id, l))).join(' · ');
    t.innerHTML = `<b>${SG.esc(g.vi)}${g.abbr ? ' — ' + SG.esc(g.abbr) : ''}</b><i>${others}</i>${SG.esc(g.def)}${g.conf ? '<br><br><span style="opacity:.8">' + SG.t('term.conf') + ' ' + SG.esc(g.conf) + '</span>' : ''}`;
    t.hidden = false;
    const r = el.getBoundingClientRect(); const tw = Math.min(340, window.innerWidth - 24);
    let x = Math.min(window.innerWidth - tw - 12, Math.max(12, r.left)); let y = r.bottom + 8;
    t.style.left = x + 'px'; t.style.top = y + 'px';
    const th = t.offsetHeight; if (y + th > window.innerHeight - 8) t.style.top = Math.max(8, r.top - th - 8) + 'px';
  }
  function hide() { if (!pinned) tip().hidden = true; }
  document.addEventListener('mouseover', e => { const el = e.target.closest('.term'); if (el && !pinned) show(el); });
  document.addEventListener('mouseout', e => { const el = e.target.closest('.term'); if (el) hide(); });
  document.addEventListener('focusin', e => { const el = e.target.closest('.term'); if (el) show(el); });
  document.addEventListener('focusout', e => { const el = e.target.closest('.term'); if (el) hide(); });
  document.addEventListener('click', e => {
    const el = e.target.closest('.term');
    if (el) { e.preventDefault(); e.stopPropagation(); if (pinned === el) { pinned = null; tip().hidden = true; } else { pinned = el; show(el); } return; }
    if (pinned) { pinned = null; tip().hidden = true; }
  }, true);
  window.addEventListener('scroll', () => { if (!pinned) tip().hidden = true; }, true);
})();

/* ---------- điều hướng ---------- */
SG.go = function (page, arg) { SG.ui.arg = arg || null; if (location.hash.slice(1) !== page) { SG._skipHash = true; location.hash = page; } SG.show(page); };
SG.show = function (page, keepScroll) {
  if (!SG.render[page]) page = 'overview';
  if (SG.ui.page === 'hmi' && page !== 'hmi' && SG.hmiTimer) { clearInterval(SG.hmiTimer); SG.hmiTimer = null; }
  SG.ui.page = page;
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.dataset.p === page));
  const el = document.getElementById('page');
  const y = window.scrollY;
  el.innerHTML = '';
  SG.render[page](el, SG.ui.arg);
  SG.ui.arg = null;
  window.scrollTo(0, keepScroll ? y : 0);
};
SG.applyDetail = function () {
  document.body.classList.toggle('basic', !SG.ui.detail);
  document.getElementById('m-basic').classList.toggle('on', !SG.ui.detail);
  document.getElementById('m-detail').classList.toggle('on', SG.ui.detail);
};
/* khung cố định (thanh trên, thanh bên) theo ngôn ngữ */
SG.paintChrome = function () {
  document.title = SG.t('app.title');
  document.documentElement.lang = SG.lang;
  document.getElementById('nav').innerHTML = SG.PAGES.map((p, i) => `<a href="#${p}" data-p="${p}" class="${p === SG.ui.page ? 'on' : ''}"><span class="k">${i + 1}</span>${SG.t('nav.' + p)}</a>`).join('');
  const set = (id, k, attr) => { const e = document.getElementById(id); if (e) { if (attr) e.setAttribute(attr, SG.t(k)); else e.textContent = SG.t(k); } };
  set('brand-sub', 'app.sub'); set('side-foot', 'app.foot'); set('q', 'app.search', 'placeholder'); set('q', 'app.searchAria', 'aria-label');
  set('m-basic', 'app.basic'); set('m-detail', 'app.detail'); set('sim-chip', 'app.chip'); set('lvl-group', 'app.levelAria', 'aria-label');
  set('lang-group', 'app.langAria', 'aria-label'); set('bi-label', 'app.bilingual');
  document.querySelectorAll('#lang-group button').forEach(b => b.classList.toggle('on', b.dataset.lang === SG.lang));
  const bi = document.getElementById('bi-sel');
  if (bi) { bi.innerHTML = `<option value="off">${SG.t('app.biOff')}</option>` + ['vi', 'en', 'fr'].filter(l => l !== SG.lang).map(l => `<option value="${l}">+ ${SG.LANGS[l].s}</option>`).join(''); bi.value = SG.bilingual !== SG.lang && SG.bilingual ? SG.bilingual : 'off'; }
};
SG.afterLang = function () { SG.r = SG.calc(SG.cfg); SG._sugCache = {}; SG._R = null; SG.paintChrome(); SG.show(SG.ui.page, true); };

/* ---------- tìm kiếm ---------- */
SG.search = function (q) {
  q = q.trim().toLowerCase(); if (q.length < 2) return [];
  const R = [];
  SG.devices.forEach(d => { const t = SG.types[d.t]; const h = (d.id + ' ' + d.n + ' ' + t.name + ' ' + SG.typeAlt(d.t) + ' ' + t.sym).toLowerCase(); if (h.includes(q)) R.push({ k: SG.t('search.dev'), t: d.id + ' — ' + d.n, go: () => SG.go('library', d.id) }); });
  Object.entries(SG.glossary).forEach(([id, g]) => { const h = ['vi', 'en', 'fr'].map(l => SG.termName(id, l)).join(' ').toLowerCase() + ' ' + (g.abbr || '').toLowerCase(); if (h.includes(q)) R.push({ k: SG.t('search.term'), t: g.vi + (g.abbr ? ' (' + g.abbr + ')' : ''), go: () => SG.go('glossary', id) }); });
  SG.r.io.sig.forEach(s => { if ((s.code + ' ' + s.func).toLowerCase().includes(q)) R.push({ k: SG.t('search.sig', { io: s.io }), t: s.code + ' — ' + s.func, go: () => SG.go('io', s.code) }); });
  SG.comms.forEach(c => { if (c.n.toLowerCase().includes(q)) R.push({ k: SG.t('search.comm'), t: c.n, go: () => SG.go('comms', c.id) }); });
  SG.scenarios.forEach(s => { if (s.n.toLowerCase().includes(q)) R.push({ k: SG.t('search.scen'), t: s.n, go: () => SG.go('scenarios', s.id) }); });
  return R.slice(0, 18);
};

/* ---------- phiếu thiết bị (A–D) ---------- */
SG.flowNeighbors = function (id) {
  const L = SG.allLinks().filter(l => l.layer === 'ac' || l.layer === 'dc' || (l.layer === 'aux' && !l.lane));
  return { before: L.filter(l => l.b.d === id).map(l => l.a.d), after: L.filter(l => l.a.d === id).map(l => l.b.d) };
};
SG.devLinks = id => SG.allLinks().filter(l => l.a.d === id || l.b.d === id);
SG.portGroup = k => SG.t('pg.' + ({ ac: 'power', dc: 'power', aux: 'aux', ai: 'meas', di: 'ctrl', eth: 'comm', rs485: 'comm', can: 'comm', wl: 'comm' }[k]));
SG.devChip = id => { const d = SG.dev(id); return `<button type="button" class="chip" data-goto-dev="${id}" title="${SG.esc(d ? d.n : id)}"><span class="mono">${SG.esc(id)}</span></button>`; };
SG.zoneName = z => SG.t('zone.' + z);

SG.sheet = function (id, opts) {
  opts = opts || {};
  const d = SG.dev(id); if (!d) return '<p>' + SG.t('sheet.notFound') + '</p>';
  const t = SG.types[d.t];
  const tab = opts.tab || 'A';
  const on = SG.devOn(d);
  let h = `<div class="sheet" data-sheet="${id}">
    <div class="sheet-h"><span class="id">${SG.esc(d.id)} · ${SG.esc(t.sym)}</span><h2>${SG.esc(d.n)}</h2>
    <div class="muted">${SG.esc(t.name)}${(a => a ? ` — <i lang="${a.l}">${SG.esc(a.t)}</i>` : '')(SG.typeAltShown(d.t))}</div>
    <div class="row">${SG.lbChip(d.lb)}<span class="chip">${SG.esc(t.group)}</span><span class="chip">${SG.t('sheet.branch')} ${SG.esc(d.br)}</span>${on ? '' : '<span class="st ko">' + SG.t('sheet.notInCfg') + '</span>'}</div></div>
    <div class="tabs" role="tablist">${['A', 'B', 'C', 'D'].map(k => `<button role="tab" data-tab="${k}" class="${k === tab ? 'on' : ''}">${SG.t('sheet.tab' + k)}</button>`).join('')}</div>`;
  if (tab === 'A') {
    h += `<section><dl class="qa">
      <dt>${SG.t('sheet.func')}</dt><dd>${SG.T(t.func)}</dd>
      <dt>${SG.t('sheet.principle')}</dt><dd>${SG.T(t.principle)}</dd>
      <dt>${SG.t('sheet.why')}</dt><dd>${SG.T(d.why)}</dd>
      <dt>${SG.t('sheet.prot')}</dt><dd>${SG.T(d.prot)}</dd>
      <dt>${SG.t('sheet.wo')}</dt><dd>${SG.T(d.wo)}</dd>
      <dt>${SG.t('sheet.notdo')}</dt><dd>${SG.T(t.notdo || '—')}</dd></dl></section>`;
    if (t.confusions && t.confusions.length) h += `<section><div class="sec-t">${SG.t('sheet.conf')}</div><dl class="qa">${t.confusions.map(c => `<dt>${SG.esc(c[0])}</dt><dd>${SG.T(c[1])}</dd>`).join('')}</dl></section>`;
  } else if (tab === 'B') {
    const nb = SG.flowNeighbors(id);
    h += `<section><dl class="qa">
      <dt>${SG.t('sheet.posFunc')}</dt><dd>${SG.t('sheet.branch')} <b>${SG.esc(d.br)}</b>${d.nodiag ? ' ' + SG.t('sheet.noDiag') : ''}</dd>
      <dt>${SG.t('sheet.posPhys')}</dt><dd><b>${SG.esc(d.cab.c)}</b> — ${SG.t('sheet.zone')} ${SG.zoneName(d.cab.z)}${d.cab.pos ? ' · ' + SG.esc(d.cab.pos) : ''} <button class="btn sm" data-goto="io" data-arg="cab:${id}">${SG.t('sheet.seeCab')}</button></dd>
      <dt>${SG.t('sheet.before')}</dt><dd>${nb.before.length ? nb.before.map(SG.devChip).join(' ') : '—'}</dd>
      <dt>${SG.t('sheet.after')}</dt><dd>${nb.after.length ? nb.after.map(SG.devChip).join(' ') : '—'}</dd></dl></section>`;
    const P = t.ports || {};
    const pg = ['power', 'aux', 'meas', 'ctrl', 'comm'].filter(k => P[k]);
    if (pg.length) h += `<section><div class="sec-t">${SG.t('sheet.portGroups')}</div><div class="portgrid">${pg.map(k => `<div class="portrow"><span class="g">${SG.t('pg.' + k)}</span><span>${SG.T(P[k])}</span></div>`).join('')}</div></section>`;
    const L = SG.devLinks(id);
    if (L.length) h += `<section><div class="sec-t">${SG.t('sheet.links')}</div><div class="conn-list">${L.map(l => { const me = l.a.d === id ? 'a' : 'b', ot = me === 'a' ? 'b' : 'a'; return `<div class="conn" data-goto-link="${l.id}">${SG.layerSwatch(l.layer, 20)}<span><b>${SG.portGroup(l.layer)}</b> · ${SG.esc(l[me].p || SG.t('sheet.port'))} ${me === 'a' ? '→' : '←'} <span class="mono">${SG.esc(l[ot].d)}</span>${l[ot].p ? ' (' + SG.esc(l[ot].p) + ')' : ''}<br><span class="muted">${SG.esc(l.label)} · ${SG.esc(l.cable)}</span></span></div>`; }).join('')}</div></section>`;
    const acc = (t.accessories || []).concat(d.acc || []);
    if (acc.length) h += `<section><div class="sec-t">${SG.t('sheet.acc')}</div><ul>${acc.map(a => `<li>${SG.T(a)}</li>`).join('')}</ul></section>`;
    if (t.compat && t.compat.length) h += `<section><div class="sec-t">${SG.t('sheet.compat')}</div><ul>${t.compat.map(a => `<li>${SG.T(a)}</li>`).join('')}</ul></section>`;
    const ck = SG.checks(SG.cfg, SG.r).filter(c => c.devs.includes(id));
    if (ck.length) h += `<section><div class="sec-t">${SG.t('sheet.checks')}</div>${ck.map(c => `<div class="stack" style="gap:3px;margin-bottom:6px">${SG.stChip(c.status)}<b>${SG.esc(c.title)}</b><span class="small">${SG.esc(c.reason)}</span>${c.need.length ? '<span class="small muted">' + SG.t('sheet.need') + ' ' + c.need.map(SG.esc).join('; ') + '</span>' : ''}</div>`).join('')}</section>`;
  } else if (tab === 'C') {
    h += `<p class="small muted">${SG.t('sheet.paramIntro')}</p>`;
    h += (t.params || []).map(p => {
      const v = SG.specVal(d, p.k);
      return `<div class="param${p.adv ? ' adv' : ''}"><div class="ph"><b>${SG.esc(p.n)}</b>${p.u ? `<span class="muted mono small">${SG.esc(p.u)}</span>` : ''}</div>
        ${v ? `<div><span class="small muted">${SG.t('sheet.inModel')} </span><span class="val">${SG.esc(v)}</span></div>` : ''}
        <div class="chain">${p.m ? `<span>${SG.t('sheet.pMeaning')}</span><span>${SG.T(p.m)}</span>` : ''}<span>${SG.t('sheet.pImpact')}</span><span>${SG.T(p.i)}</span>
        <span class="adv">${SG.t('sheet.pHow')}</span><span class="adv">${SG.T(p.h || '—')}</span><span class="adv">${SG.t('sheet.pEx')}</span><span class="adv">${SG.T(p.e || '—')}</span>${p.c ? `<span>${SG.t('sheet.pCheck')}</span><span>${SG.T(p.c)}</span>` : ''}</div></div>`;
    }).join('');
    const extra = Object.keys(d.spec || {}).filter(k => !(t.params || []).some(p => p.k === k));
    if (extra.length) h += `<dl class="kv">${extra.map(k => `<dt>${SG.esc(k)}</dt><dd>${SG.esc(SG.specVal(d, k))}</dd>`).join('')}</dl>`;
  } else {
    const ex = t.example || {};
    h += `<div class="ex">${ex.ok ? `<div class="ok"><b>✓ ${SG.t('sheet.exOk')} ${SG.esc(ex.ok.t)}</b>${SG.T(ex.ok.d)}</div>` : ''}${ex.ko ? `<div class="ko"><b>✕ ${SG.t('sheet.exKo')} ${SG.esc(ex.ko.t)}</b>${SG.T(ex.ko.d)}</div>` : ''}</div>`;
    h += `<div class="note">${SG.t('sheet.verifNote')}</div>`;
    if (t.brands) h += `<p class="small muted">${SG.esc(t.brands)}</p>`;
  }
  h += '</div>';
  return h;
};
SG.bindSheet = function (root, id, opts, rerender) {
  root.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => rerender(Object.assign({}, opts, { tab: b.dataset.tab })));
};

SG.linkSheet = function (id, end) {
  const l = SG.link(id); if (!l) return '<p>' + SG.t('link.notFound') + '</p>';
  const L = SG.LAYERS[l.layer];
  const sigs = SG.r.io.sig.filter(s => s.link === l.id);
  const cm = SG.comms.filter(c => c.used.some(u => u === l.id || (u.endsWith('-') && l.id.startsWith(u))));
  let h = `<div class="sheet"><div class="sheet-h"><span class="id">${SG.layerSwatch(l.layer)} ${SG.esc(SG.layerName(l.layer))}</span><h2>${SG.esc(l.label)}</h2></div>`;
  if (end) { const e = l[end]; h += `<div class="note info">${SG.t('link.selPort')} <b class="mono">${SG.esc(e.d)}</b> — ${SG.esc(e.p || SG.t('link.portOf', { g: SG.portGroup(l.layer).toLowerCase() }))}</div>`; }
  h += `<dl class="qa"><dt>${SG.t('link.from')}</dt><dd>${SG.devChip(l.a.d)} ${SG.esc(l.a.p || '')}</dd><dt>${SG.t('link.to')}</dt><dd>${SG.devChip(l.b.d)} ${SG.esc(l.b.p || '')}</dd>
    <dt>${SG.t('link.type')}</dt><dd>${SG.esc(SG.layerName(l.layer))}${L.arrow ? ' — ' + SG.t('link.arrow') : ''}</dd><dt>${SG.t('link.cable')}</dt><dd>${SG.esc(l.cable)}</dd>${l.desc ? `<dt>${SG.t('link.note')}</dt><dd>${SG.T(l.desc)}</dd>` : ''}</dl>`;
  if (sigs.length) h += `<section><div class="sec-t">${SG.t('link.sigs')}</div><div class="tbl-wrap"><table><tr><th>${SG.t('col.code')}</th><th>${SG.t('col.type')}</th><th>${SG.t('col.func')}</th></tr>${sigs.map(s => `<tr><td class="mono">${SG.esc(s.code)}</td><td>${s.io} · ${SG.esc(s.type)}</td><td>${SG.esc(s.func)}</td></tr>`).join('')}</table></div></section>`;
  if (cm.length) h += `<section><div class="sec-t">${SG.t('link.kind')}</div>${cm.map(c => `<button class="btn sm" data-goto="comms" data-arg="${c.id}">${SG.esc(c.n)} →</button>`).join(' ')}</section>`;
  if (l.layer === 'ac' || l.layer === 'dc') h += `<div class="note">${SG.t('link.cableNote')}</div>`;
  return h + '</div>';
};

/* ---------- liên kết toàn cục ---------- */
document.addEventListener('click', e => {
  const g = e.target.closest('[data-goto]'); if (g) { e.preventDefault(); SG.go(g.dataset.goto, g.dataset.arg || null); return; }
  const gd = e.target.closest('[data-goto-dev]'); if (gd && !e.target.closest('.dg')) { e.preventDefault(); if (SG.ui.page === 'diagram' && SG.diagramSelect) SG.diagramSelect({ kind: 'dev', id: gd.dataset.gotoDev }); else SG.go('library', gd.dataset.gotoDev); return; }
  const gl = e.target.closest('[data-goto-link]'); if (gl) { e.preventDefault(); if (SG.ui.page === 'diagram' && SG.diagramSelect) SG.diagramSelect({ kind: 'link', id: gl.dataset.gotoLink }); else SG.go('diagram', 'link:' + gl.dataset.gotoLink); }
});

SG.start = function () {
  SG.paintChrome();
  document.getElementById('m-basic').onclick = () => { SG.ui.detail = false; SG.store.set('detail', false); SG.applyDetail(); };
  document.getElementById('m-detail').onclick = () => { SG.ui.detail = true; SG.store.set('detail', true); SG.applyDetail(); };
  document.querySelectorAll('#lang-group button').forEach(b => b.onclick = () => SG.setLang(b.dataset.lang));
  document.getElementById('bi-sel').onchange = e => { SG.bilingual = e.target.value; try { localStorage.setItem('sglab.bilingual', JSON.stringify(SG.bilingual)); } catch (x) { /* bỏ qua */ } SG.show(SG.ui.page, true); };
  SG.applyDetail();
  const q = document.getElementById('q'), sres = document.getElementById('sres');
  let res = [];
  q.addEventListener('input', () => { res = SG.search(q.value); sres.hidden = !res.length; sres.innerHTML = res.map((r, i) => `<button data-i="${i}">${SG.esc(r.t)}<small>${SG.esc(r.k)}</small></button>`).join(''); });
  sres.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; res[+b.dataset.i].go(); sres.hidden = true; q.value = ''; });
  q.addEventListener('keydown', e => { if (e.key === 'Enter' && res[0]) { res[0].go(); sres.hidden = true; q.value = ''; } if (e.key === 'Escape') sres.hidden = true; });
  document.addEventListener('click', e => { if (!e.target.closest('.search')) sres.hidden = true; });
  window.addEventListener('hashchange', () => { if (SG._skipHash) { SG._skipHash = false; return; } SG.ui.arg = null; SG.show(location.hash.slice(1)); });
  SG.show(location.hash.slice(1) || 'overview');
};
