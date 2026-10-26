/* TRANG 1–5 (chuỗi: i18n/<lang>/pages.js, khóa ov.* dg.* lib.* sys.* cm.*) */
SG.mini = function (el, o) {
  el.classList.add('mini');
  el.innerHTML = `<div class="dg-c" style="position:absolute;inset:0"></div><div class="dg-zoom"><button aria-label="${SG.esc(SG.t('dg.zoomIn'))}">+</button><button aria-label="${SG.esc(SG.t('dg.zoomOut'))}">−</button><button aria-label="${SG.esc(SG.t('dg.fit'))}" title="${SG.esc(SG.t('dg.fit'))}">⤢</button></div>`;
  const D = new SG.Diagram(el.firstChild, o);
  D.build(SG.cfg); if (o.values) D.values = o.values; if (o.hl) D.hl = o.hl; D.render();
  const b = el.querySelectorAll('.dg-zoom button'); b[0].onclick = () => D.zoomAt(0.8); b[1].onclick = () => D.zoomAt(1.25); b[2].onclick = () => D.fit();
  return D;
};
SG.head = (eb, title, lead) => `<div class="page-head"><span class="eyebrow">${eb}</span><h1>${title}</h1>${lead ? `<p>${lead}</p>` : ''}</div>`;
SG.headK = p => SG.head(SG.t(p + '.eb'), SG.t(p + '.title'), SG.t(p + '.lead'));

/* ======================= 1. TỔNG QUAN ======================= */
SG.render.overview = function (el) {
  const c = SG.cfg, r = SG.r, ck = SG.checks(c, r), t = SG.t;
  const n = s => ck.filter(x => x.status === s).length;
  const devs = SG.devices.filter(SG.devOn);
  const q = (k, page, arg) => `<div><b>${t('ov.q.' + k)}</b>${t('ov.q.' + k + '.d', { n: devs.length })} <a href="#${page}" data-goto="${page}"${arg ? ` data-arg="${arg}"` : ''}>${t('ov.q.' + k + '.a')} →</a></div>`;
  el.innerHTML = SG.headK('ov') + `
  <div class="overview-hero">
    <div class="stack">
      <div class="question-list">${q('which', 'bom')}${q('where', 'io', 'cab')}${q('what', 'library')}${q('params', 'library', 'QF0')}${q('connect', 'comms')}${q('control', 'scenarios')}</div>
      <div class="card"><h3>${t('ov.status')}</h3>
        <div class="sumrow">${SG.stChip('ok', t('ov.nOk', { n: n('ok') }))}${SG.stChip('ko', t('ov.nKo', { n: n('ko') }))}${SG.stChip('unk', t('ov.nUnk', { n: n('unk') }))}</div>
        <p class="small muted" style="margin-top:8px">${t('ov.example')} ${SG.esc((ck.find(x => x.status === 'ko') || {}).title || '—')}. <a href="#selector" data-goto="selector" data-arg="sys">${t('ov.seeChange')} →</a></p></div>
    </div>
    <div class="card" style="padding:0;overflow:hidden"><div id="ov-dg" style="height:380px;border:0;border-radius:0"></div><div class="small muted" style="padding:8px 12px;border-top:1px solid var(--line)">${t('ov.dgHint')}</div></div>
  </div>
  <div class="grid g3">
    <div class="card"><h3>${t('ov.labels')}</h3><div class="stack small">
      ${[1, 2, 3].map(lb => `<div>${SG.lbChip(lb)} ${t('ov.lb' + lb, { n: devs.filter(d => d.lb === lb).length })}</div>`).join('')}</div></div>
    <div class="card"><h3>${t('ov.sign')}</h3><dl class="kv small">
      <dt>P_GRID</dt><dd>${t('ov.sign.grid')}</dd><dt>P_BAT</dt><dd>${t('ov.sign.bat')}</dd><dt>P_PV, P_GEN</dt><dd>${t('ov.sign.src')}</dd><dt>${t('ov.sign.loadK')}</dt><dd>${t('ov.sign.load')}</dd>
      <dt>${t('ov.sign.balK')}</dt><dd class="mono">P_GRID + P_PV + P_BAT + P_GEN = ΣP_${t('ov.sign.loadSym')}</dd><dt>${t('ov.sign.unitK')}</dt><dd>kW, kWh, V, A, Hz, %</dd></dl></div>
    <div class="card"><h3>${t('ov.limits')}</h3><p class="small">${t('ov.limitsTxt')}</p></div>
  </div>
  <div class="card"><h3>${t('ov.params')}</h3>
    <div class="tbl-wrap" style="margin-top:10px"><table><tr><th>${t('ov.col.group')}</th><th>${t('ov.col.value')}</th><th>${t('ov.col.assume')}</th></tr>
    <tr><td>${t('ov.row.grid')}</td><td>${c.U} V ${c.phases === 3 ? '3P+N' : '1P+N'}, ${c.f} Hz, ${c.Sgrid} kVA</td><td>${t('ov.row.gridA', { imp: c.importLimit }) + ' ' + (c.exportAllowed ? t('ov.row.exp', { v: SG.num(c.exportLimit) }) : t('ov.row.noExp'))}</td></tr>
    <tr><td>PV</td><td>${SG.num(c.Ppv)} kWc, inverter ${SG.num(c.Pinv)} kW 3P</td><td>${t('ov.row.pvA')}</td></tr>
    <tr><td>${t('ov.row.bat')}</td><td>${SG.num(c.Ebat)} kWh LFP, PCS ${SG.num(c.Pcs)} kW ${c.pcsGF ? 'grid-forming' : 'grid-following'}</td><td>${t('ov.row.batA', { a: c.socMin, b: c.socMax })}</td></tr>
    <tr><td>${t('ov.row.gen')}</td><td>${c.gen ? c.Sgen + ' kVA' : t('w.none')}</td><td>${t('ov.row.genA')}</td></tr>
    <tr><td>${t('ov.row.loads')}</td><td>${t('ov.row.loadsV', { m: SG.num(c.Pm), n: c.rlSteps, s: SG.num(c.rlStep), lp: SG.num(c.Plp) })}${c.ev ? '; EV ' + SG.num(c.Pev) + ' kW 1P' : ''}</td><td>${t('ov.row.loadsA')}</td></tr>
    <tr><td>${t('ov.row.ctrl')}</td><td>PLC + ${r.io.modulesTxt}; switch ${r.eth.ports} ${t('w.ports')}</td><td>${t('ov.row.ctrlA', { s: c.spare })}</td></tr></table></div></div>
  <div class="card"><h3>${t('ov.ext')}</h3><p class="small muted">${t('ov.extLead')}</p>
    <div class="tbl-wrap" style="margin-top:10px"><table><tr><th>${t('ov.col.comp')}</th><th>${t('ov.col.inModel')}</th><th>${t('ov.col.reason')}</th></tr>${SG.extensions.map(x => `<tr><td>${SG.esc(x.n)}</td><td><span class="chip">${SG.esc(x.need)}</span></td><td>${SG.esc(x.why)}</td></tr>`).join('')}</table></div></div>`;
  SG.mini(el.querySelector('#ov-dg'), { view: 'power', onSelect: s => { if (s && s.kind === 'dev') SG.go('diagram', s.id); } });
};

/* ======================= 2. SƠ ĐỒ ======================= */
SG.render.diagram = function (el, arg) {
  const st = SG.dgState = SG.dgState || { view: 'power', layers: Object.keys(SG.LAYERS), loc: 'func', tab: 'A' };
  const t = SG.t;
  el.innerHTML = SG.headK('dg') + `
  <div class="dg-wrap">
    <div class="dg-stage">
      <div class="dg-tool">
        <div class="seg" id="dg-view">${Object.keys(SG.VIEWS).map(k => `<button data-v="${k}">${t('view.' + k)}</button>`).join('')}</div>
        <div class="seg" id="dg-loc"><button data-l="func">${t('dg.locFunc')}</button><button data-l="cab">${t('dg.locCab')}</button></div>
        <select id="dg-trace" style="width:auto;max-width:280px" aria-label="${SG.esc(t('dg.traceAria'))}"><option value="">${t('dg.tracePh')}</option>${SG.traces.map(x => `<option value="${x.id}">${SG.esc(x.kind)}: ${SG.esc(x.n)}</option>`).join('')}</select>
      </div>
      <div class="dg-canvas" id="dg-c"></div>
      <div class="dg-zoom" style="bottom:52px"><button id="z-in" aria-label="${SG.esc(t('dg.zoomIn'))}">+</button><button id="z-out" aria-label="${SG.esc(t('dg.zoomOut'))}">−</button><button id="z-fit" aria-label="${SG.esc(t('dg.fit'))}" title="${SG.esc(t('dg.fit'))}">⤢</button></div>
      <div class="legend" id="dg-legend"></div>
    </div>
    <aside class="dg-side" id="dg-side"></aside>
  </div>`;
  const side = el.querySelector('#dg-side');
  const D = new SG.Diagram(el.querySelector('#dg-c'), { view: st.view, layers: st.layers, onSelect: s => select(s) });
  D.build(SG.cfg);
  const locVals = () => { const v = {}; if (st.loc === 'cab') D.devs.forEach(d => { if (d.id !== 'BUS') v[d.id] = d.cab.c; }); return v; };
  D.values = locVals();
  D.render();
  const legend = () => {
    el.querySelector('#dg-legend').innerHTML = Object.keys(SG.LAYERS).map(k => {
      const v = SG.VIEWS[st.view]; const vis = st.view === 'all' ? st.layers.includes(k) : v.on.includes(k);
      return st.view === 'all' ? `<label><input type="checkbox" data-ly="${k}" ${vis ? 'checked' : ''}>${SG.layerSwatch(k)}${SG.layerName(k)}</label>` : `<label style="${vis ? '' : 'opacity:.45'}">${SG.layerSwatch(k)}${SG.layerName(k)}</label>`;
    }).join('') + `<span class="muted">${t('dg.legendNote')}</span>`;
    el.querySelectorAll('[data-ly]').forEach(cb => cb.onchange = () => { st.layers = [...el.querySelectorAll('[data-ly]:checked')].map(x => x.dataset.ly); D.setView('all', st.layers); });
  };
  const segs = () => { el.querySelectorAll('#dg-view button').forEach(b => b.classList.toggle('on', b.dataset.v === st.view)); el.querySelectorAll('#dg-loc button').forEach(b => b.classList.toggle('on', b.dataset.l === st.loc)); };
  el.querySelectorAll('#dg-view button').forEach(b => b.onclick = () => { st.view = b.dataset.v; D.setView(st.view, st.layers); segs(); legend(); });
  el.querySelectorAll('#dg-loc button').forEach(b => b.onclick = () => { st.loc = b.dataset.l; D.values = locVals(); D.render(); segs(); if (st.loc === 'cab') side.insertAdjacentHTML('afterbegin', `<div class="note info small">${t('dg.cabNote')}</div>`); });
  el.querySelector('#z-in').onclick = () => D.zoomAt(0.8); el.querySelector('#z-out').onclick = () => D.zoomAt(1.25); el.querySelector('#z-fit').onclick = () => D.fit();
  el.querySelector('#dg-trace').onchange = e => { if (e.target.value) select({ kind: 'trace', id: e.target.value }); else select(null); };
  segs(); legend();

  function help() {
    side.innerHTML = `<h3>${t('dg.help')}</h3><div class="stack small">${['dev', 'link', 'port', 'view', 'trace'].map(k => `<p>• ${t('dg.help.' + k)}</p>`).join('')}</div>
      <div class="note info small">${t('dg.try')} <button class="btn sm" data-try="RLY-DEC">${t('dg.try.dec')}</button> <button class="btn sm" data-try="trace:P_PV">${t('dg.try.pv')}</button> <button class="btn sm" data-try="trace:CMD_M1">${t('dg.try.m1')}</button> <button class="btn sm" data-try="link:c-ka-mx">${t('dg.try.mx')}</button></div>`;
    side.querySelectorAll('[data-try]').forEach(b => b.onclick = () => { const v = b.dataset.try; if (v.startsWith('trace:')) select({ kind: 'trace', id: v.slice(6) }); else if (v.startsWith('link:')) select({ kind: 'link', id: v.slice(5) }); else select({ kind: 'dev', id: v }); });
  }
  const clearBtn = () => `<div class="row"><button class="btn sm" id="sd-clear">✕ ${t('dg.clear')}</button>`;
  function select(s) {
    SG.dgSel = s;
    if (!s) { D.setHighlight(null); help(); el.querySelector('#dg-trace').value = ''; return; }
    if (s.kind === 'dev') {
      if (!D.node[s.id]) { side.innerHTML = `<div class="note ko">${t('dg.notInCfg', { id: SG.esc(s.id) })}</div>` + SG.sheet(s.id, { tab: st.tab }); return; }
      D.setHighlight(D.related(s.id), s.id);
      const draw = (o) => { st.tab = o.tab; side.innerHTML = clearBtn() + `<button class="btn sm" data-goto="library" data-arg="${s.id}">${t('dg.openLib')}</button></div>` + SG.sheet(s.id, o); side.querySelector('#sd-clear').onclick = () => select(null); SG.bindSheet(side, s.id, o, draw); };
      draw({ tab: st.tab });
    } else if (s.kind === 'link' || s.kind === 'port') {
      const l = D.links.find(x => x.id === s.id); if (!l) { side.innerHTML = `<div class="note ko">${t('dg.linkNotInCfg')}</div>`; return; }
      if (st.view !== 'all' && !SG.VIEWS[st.view].on.includes(l.layer)) { st.view = 'all'; if (!st.layers.includes(l.layer)) st.layers.push(l.layer); D.opt.view = 'all'; D.opt.layers = st.layers; segs(); legend(); }
      D.setHighlight(new Set([l.id, l.a.d, l.b.d]), l.id);
      side.innerHTML = clearBtn() + '</div>' + SG.linkSheet(s.id, s.kind === 'port' ? s.end : null);
      side.querySelector('#sd-clear').onclick = () => select(null);
    } else if (s.kind === 'trace') {
      const tr = SG.traces.find(x => x.id === s.id);
      const ids = new Set(); tr.steps.forEach(x => { ids.add(x.d); if (x.l) ids.add(x.l); });
      st.view = 'all'; st.layers = Object.keys(SG.LAYERS); D.opt.view = 'all'; D.opt.layers = st.layers; segs(); legend();
      D.setHighlight(ids); el.querySelector('#dg-trace').value = tr.id;
      side.innerHTML = clearBtn() + `</div><span class="eyebrow">${SG.esc(tr.kind)}</span><h2>${SG.esc(tr.n)}</h2><div class="flow">${tr.steps.map((x, i) => `<div class="stp" data-i="${i}"><i>${i + 1}</i><span><span class="mono">${x.d}</span>${x.l ? ' <span class="muted small">' + t('dg.via', { v: SG.esc((D.links.find(l => l.id === x.l) || { label: x.l }).label) }) + '</span>' : ''}<br>${SG.T(x.t)}</span></div>`).join('')}</div>`;
      side.querySelector('#sd-clear').onclick = () => select(null);
      side.querySelectorAll('.stp').forEach(p => p.onclick = () => { const x = tr.steps[+p.dataset.i]; side.querySelectorAll('.stp').forEach(q => q.classList.toggle('cur', q === p)); const set = new Set([x.d]); if (x.l) { set.add(x.l); const l = D.links.find(k => k.id === x.l); if (l) { set.add(l.a.d); set.add(l.b.d); } } D.setHighlight(set, x.d); });
    }
  }
  SG.diagramSelect = select;
  if (arg) { if (arg.startsWith('link:')) select({ kind: 'link', id: arg.slice(5) }); else if (arg.startsWith('trace:')) select({ kind: 'trace', id: arg.slice(6) }); else { select({ kind: 'dev', id: arg }); D.focus([arg]); } }
  else if (SG.dgSel) select(SG.dgSel); else help();
};

/* ======================= 3. THƯ VIỆN ======================= */
SG.render.library = function (el, arg) {
  const st = SG.libState = SG.libState || { q: '', lb: 0, only: false, sel: 'QF0', tab: 'A', mode: 'dev' };
  const t = SG.t;
  if (arg) { st.sel = arg; st.mode = 'dev'; }
  el.innerHTML = SG.headK('lib') + `<div class="tabs"><button data-m="dev">${t('lib.tabDev')}</button><button data-m="cmp">${t('lib.tabCmp')}</button></div><div id="lib-body"></div>`;
  const body = el.querySelector('#lib-body');
  const tabs = () => el.querySelectorAll('[data-m]').forEach(b => b.classList.toggle('on', b.dataset.m === st.mode));
  el.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { st.mode = b.dataset.m; tabs(); draw(); });
  tabs(); draw();
  function draw() {
    if (st.mode === 'cmp') {
      body.innerHTML = '<div class="stack" style="gap:16px">' + SG.compare.map(cp => `<div class="card"><h3>${SG.esc(cp.n)}</h3><div class="tbl-wrap" style="margin-top:10px"><table><tr>${cp.cols.map(c => `<th>${SG.esc(c)}</th>`).join('')}</tr>${cp.rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${SG.esc(c)}</td>` : `<td><b>${SG.esc(c)}</b></td>`).join('')}</tr>`).join('')}</table></div></div>`).join('') + '</div>';
      return;
    }
    body.innerHTML = `<div class="lib"><div class="stack"><div class="card stack" style="padding:10px">
      <input id="lib-q" type="text" placeholder="${SG.esc(t('lib.filterPh'))}" value="${SG.esc(st.q)}" aria-label="${SG.esc(t('lib.filterAria'))}">
      <select id="lib-lb" aria-label="${SG.esc(t('lib.lbAria'))}"><option value="0">${t('lib.allLabels')}</option>${[1, 2, 3].map(lb => `<option value="${lb}">${SG.lbl(lb)}</option>`).join('')}</select>
      <label class="cb"><input type="checkbox" id="lib-only" ${st.only ? 'checked' : ''}> ${t('lib.onlyCfg')}</label></div>
      <div class="lib-list" id="lib-list"></div></div><div class="card" id="lib-sheet"></div></div>`;
    body.querySelector('#lib-lb').value = st.lb;
    const list = () => {
      const q = st.q.toLowerCase();
      const items = SG.devices.filter(d => (!st.only || SG.devOn(d)) && (!st.lb || d.lb == st.lb) && (!q || (d.id + d.n + SG.types[d.t].name + SG.typeAlt(d.t)).toLowerCase().includes(q)));
      const groups = {}; items.forEach(d => { const g = SG.types[d.t].group; (groups[g] = groups[g] || []).push(d); });
      body.querySelector('#lib-list').innerHTML = Object.entries(groups).map(([g, ds]) => `<div class="gh">${SG.esc(g)}</div>` + ds.map(d => `<button data-id="${d.id}" class="${d.id === st.sel ? 'on' : ''}" style="${SG.devOn(d) ? '' : 'opacity:.55'}"><span class="id">${d.id}</span><span>${SG.esc(d.n)}</span><span class="chip lb${d.lb}" style="padding:0 6px">${d.lb}</span></button>`).join('')).join('') || `<p class="muted small" style="padding:8px">${t('w.noResult')}</p>`;
      body.querySelectorAll('#lib-list [data-id]').forEach(b => b.onclick = () => { st.sel = b.dataset.id; list(); sheet({ tab: st.tab }); });
    };
    const sheet = (o) => { st.tab = o.tab; const box = body.querySelector('#lib-sheet'); const d = SG.dev(st.sel); box.innerHTML = `<div class="row" style="justify-content:flex-end">${d && !d.nodiag ? `<button class="btn sm" data-goto="diagram" data-arg="${st.sel}">${t('lib.onDiagram')} →</button>` : ''}<button class="btn sm" data-goto="bom" data-arg="${st.sel}">${t('lib.bomLine')} →</button></div>` + SG.sheet(st.sel, o); SG.bindSheet(box, st.sel, o, sheet); };
    body.querySelector('#lib-q').oninput = e => { st.q = e.target.value; list(); };
    body.querySelector('#lib-lb').onchange = e => { st.lb = +e.target.value; list(); };
    body.querySelector('#lib-only').onchange = e => { st.only = e.target.checked; list(); };
    list(); sheet({ tab: st.tab });
  }
};

/* ======================= 4. CẤU HÌNH HỆ THỐNG (tab đầu của trang Chọn thiết bị) =======================
   nhóm: form.<g>, nhãn: fld.<k>, tùy chọn: opt.<k>.<v> (nếu có) */
SG.FORM = [
  ['grid', [['U', 'num', 'V'], ['phases', 'sel', '', [3, 1]], ['f', 'sel', 'Hz', [50, 60]], ['Sgrid', 'num', 'kVA'], ['Icc', 'num', 'kA'], ['qf0Icu', 'num', 'kA'], ['importLimit', 'num', 'kW'], ['exportAllowed', 'chk'], ['exportLimit', 'num', 'kW']]],
  ['pv', [['Ppv', 'num', 'kWc'], ['Pinv', 'num', 'kW'], ['pvNs', 'num', ''], ['pvVoc', 'num', 'V'], ['pvBeta', 'num', '%/°C'], ['pvTmin', 'num', '°C'], ['invVdcMax', 'num', 'V'], ['invMpptMin', 'num', 'V'], ['invMpptMax', 'num', 'V'], ['invRegMap', 'chk']]],
  ['bat', [['Ebat', 'num', 'kWh'], ['batV', 'num', 'V'], ['batImax', 'num', 'A'], ['Pcs', 'num', 'kW'], ['socMin', 'num', '%'], ['socMax', 'num', '%'], ['pcsGF', 'chk'], ['pcsResync', 'chk'], ['bmsCompat', 'chk']]],
  ['gen', [['gen', 'chk'], ['Sgen', 'num', 'kVA'], ['genSync', 'chk'], ['genParallel', 'chk']]],
  ['loads', [['Pm', 'num', 'kW'], ['rlSteps', 'num', ''], ['rlStep', 'num', 'kW'], ['Plp', 'num', 'kW'], ['ev', 'chk'], ['Pev', 'num', 'kW']]],
  ['func', [['island', 'chk'], ['ups', 'chk'], ['remoteBreaker', 'chk'], ['remoteBreakerClose', 'chk'], ['breakerMotor', 'chk'], ['pyr', 'chk'], ['cabtemp', 'chk'], ['lora', 'chk']]],
  ['comm', [['pccComm', 'sel', '', ['tcp', 'rtu']], ['rtuVia', 'sel', '', ['module', 'gw', 'none']]]],
  ['wiring', [['doType', 'sel', '', ['transistor', 'relay']], ['useKA', 'chk'], ['coilV', 'sel', '', ['230VAC', '24VDC']], ['vfdDiLogic', 'sel', '', ['PNP', 'NPN']], ['ctOut', 'sel', '', ['5A', '1A', '333mV']], ['meterIn', 'sel', '', ['5A', '1A', '333mV']], ['pyrOut', 'sel', '', ['4-20', '0-10']], ['aiPyrCh', 'sel', '', ['4-20', '0-10']], ['psuA', 'num', 'A'], ['spare', 'num', '%']]]
];
SG.optName = (k, v) => { const key = 'opt.' + k + '.' + v; const s = SG.t(key); return s === key ? String(v) : s; };
SG.render.selector = function (el) {
  const t = SG.t;
  el.innerHTML = `<div class="note small">${t('sys.note')}</div>
  <div class="grid" style="grid-template-columns:minmax(0,380px) minmax(0,1fr);align-items:start" id="sel-grid">
    <div class="stack" id="sel-form"></div><div class="stack" id="sel-res" style="gap:14px"></div></div>`;
  if (window.innerWidth < 1000) el.querySelector('#sel-grid').style.gridTemplateColumns = '1fr';
  const form = el.querySelector('#sel-form');
  form.innerHTML = `<div class="row"><button class="btn" id="sel-reset">${t('sys.reset')}</button></div>` + SG.FORM.map(([g, fs], gi) => `<details class="card" ${gi < 2 || gi === 5 ? 'open' : ''}><summary>${t('form.' + g)}</summary><div class="grid g2" style="margin-top:10px">${fs.map(([k, ty, u, opts]) => {
    const v = SG.cfg[k], n = t('fld.' + k);
    const lk = SG.SYNCED && SG.SYNCED.includes(k) ? ` disabled title="${SG.esc(t('sys.locked'))}"` : '';
    if (ty === 'chk') return `<label class="cb" style="grid-column:1/-1"><input type="checkbox" id="f-${k}" data-k="${k}" ${v ? 'checked' : ''}${lk}> ${n}</label>`;
    if (ty === 'sel') return `<label class="f">${n}<select id="f-${k}" data-k="${k}"${lk}>${opts.map(o => `<option value="${o}" ${String(o) === String(v) ? 'selected' : ''}>${SG.esc(SG.optName(k, o))}</option>`).join('')}</select></label>`;
    return `<label class="f">${n}${u ? ' (' + u + ')' : ''}<input type="number" step="any" id="f-${k}" data-k="${k}" value="${v == null ? '' : v}"${lk}></label>`;
  }).join('')}</div></details>`).join('');
  form.querySelectorAll('[data-k]').forEach(inp => inp.onchange = () => {
    const k = inp.dataset.k; let v;
    if (inp.type === 'checkbox') v = inp.checked;
    else if (inp.tagName === 'SELECT') v = isNaN(+inp.value) ? inp.value : +inp.value;
    else v = inp.value === '' ? null : +inp.value;
    if (k === 'rlSteps' && v != null) v = Math.max(1, Math.min(6, Math.round(v)));
    SG.cfg[k] = v; SG.saveCfg(); results();
  });
  form.querySelector('#sel-reset').onclick = () => { SG.cfg = Object.assign({}, SG.defaultCfg); SG.syncProj(); SG.renderSys(el); };
  results();
  function results() {
    const c = SG.cfg, r = SG.r, ck = SG.checks(c, r), res = el.querySelector('#sel-res');
    const cnt = s => ck.filter(x => x.status === s).length;
    const devs = SG.devices.filter(SG.devOn);
    const U3 = `(√3 × ${c.U}`, Uph = Math.round(c.U / Math.sqrt(3));
    const ib = [['pcc', r.Ib.PCC, c.phases === 3 ? `${c.Sgrid} kVA / ${U3} V)` : `${c.Sgrid} kVA / ${Uph} V`],
      ['pv', r.Ib.PV, `${SG.num(c.Pinv)} kW / ${U3} × ${SG.num(1, 1)})`], ['bat', r.Ib.BAT, `${SG.num(c.Pcs)} kW / ${U3} × ${SG.num(1, 1)})`],
      ['m1', r.Ib.M1, `${SG.num(c.Pm)} / ${SG.num(0.85)} kW / ${U3} × ${SG.num(0.82)})`], ['rl', r.Ib.RL, `${c.rlSteps} × ${SG.num(c.rlStep)} kW / ${U3})`],
      ['lp', r.Ib.LP, `${SG.num(c.Plp)} kW / ${U3} × ${SG.num(0.95)})`]].concat(c.ev ? [['ev', r.Ib.EV, `${SG.num(c.Pev)} kW / ${Uph} V`]] : []).concat(c.gen ? [['gen', r.Ib.GEN, `${c.Sgen} kVA / ${U3})`]] : []);
    const noon = SG.solve(c, { mode: 'GRID', irr: 0.9, soc: 50, rlOn: 1, auto: true });
    const night = SG.solve(c, { mode: 'GRID', irr: 0, soc: c.socMin, rlOn: c.rlSteps, m1Run: true, m1Spd: 100, evOn: c.ev, auto: true });
    const isl = c.island && c.pcsGF ? SG.solve(c, { mode: 'ISLAND', irr: 0.3, soc: 60, m1Run: true, m1Spd: 100, auto: true }) : null;
    const bal = (o) => `<td class="num">${SG.fx(o.pv)}</td><td class="num">${SG.fx(o.bat)}</td><td class="num">${SG.fx(o.grid)}</td><td class="num">${SG.fx(o.loads.total)}</td><td>${o.shed > 0 ? t('sys.shed', { v: SG.fx(o.shed) }) : o.curtail > 0 ? t('sys.curtail', { v: SG.fx(o.curtail) }) : '—'}</td>`;
    const missing = ck.filter(x => x.status === 'ko');
    const unk = ck.filter(x => x.status === 'unk');
    res.innerHTML = `
    <div class="card"><h3>${t('sys.results')}</h3><div class="sumrow">${SG.stChip('ok', t('ov.nOk', { n: cnt('ok') }))}${SG.stChip('ko', t('ov.nKo', { n: cnt('ko') }))}${SG.stChip('unk', t('ov.nUnk', { n: cnt('unk') }))}</div>
      <p class="small muted" style="margin-top:6px">${t('sys.sameBrand')}</p></div>
    <div class="tbl-wrap"><table><tr><th style="width:130px">${t('col.status')}</th><th>${t('col.check')}</th><th>${t('col.reasonNeed')}</th></tr>${ck.map(x => `<tr><td>${SG.stChip(x.status, t('st3s.' + x.status))}</td><td><b>${SG.esc(x.title)}</b><div class="small muted">${SG.esc(x.cat)} · ${x.devs.filter(id => SG.dev(id) && SG.devOn(SG.dev(id))).map(SG.devChip).join(' ')}</div></td><td class="small">${SG.esc(x.reason)}${x.need.length ? `<div style="margin-top:4px"><b>${t('sheet.need')}</b> ${x.need.map(SG.esc).join('; ')}</div>` : ''}${x.fix ? `<div style="margin-top:4px"><b>${t('sys.fix')}</b> ${SG.esc(x.fix)}</div>` : ''}</td></tr>`).join('')}</table></div>
    <div class="grid g2">
      <div class="card"><h3>${t('sys.missingAcc')}</h3>${missing.length ? '<ul class="small">' + missing.map(x => `<li><b>${SG.esc(x.title)}</b>: ${SG.esc(x.fix || x.reason)}</li>`).join('') + '</ul>' : `<p class="small muted">${t('sys.noKo')}</p>`}</div>
      <div class="card"><h3>${t('sys.unkTitle')}</h3><ul class="small">${unk.map(x => `<li><b>${SG.esc(x.title)}</b>: ${x.need.map(SG.esc).join('; ') || SG.esc(x.reason)}</li>`).join('')}</ul></div>
    </div>
    <div class="card"><h3>${t('sys.ib')}</h3><p class="small muted">${t('sys.ibNote')}</p>
      <div class="tbl-wrap" style="margin-top:8px"><table><tr><th>${t('col.branch')}</th><th class="num">Ib (A)</th><th>${t('col.formula')}</th></tr>${ib.map(x => `<tr><td>${t('ib.' + x[0])}</td><td class="num mono">${SG.fx(x[1])}</td><td class="mono small">${x[2]}</td></tr>`).join('')}</table></div>
      ${c.ev ? `<div class="note small" style="margin-top:8px">${t('sys.evPhase', { a: SG.fx(r.Ib.EV), b: SG.fx(r.Ib.worstPhase) })}</div>` : ''}
      <div class="note small" style="margin-top:8px">${t('sys.cableNote')}</div></div>
    <div class="card"><h3>${t('sys.bal')}</h3><p class="small muted">${t('sys.balNote')}</p>
      <div class="tbl-wrap" style="margin-top:8px"><table><tr><th>${t('col.case')}</th><th class="num">P_PV</th><th class="num">P_BAT</th><th class="num">P_GRID</th><th class="num">Σ</th><th>${t('col.emsAction')}</th></tr>
      <tr><td>${t('sys.case.noon')}</td>${bal(noon)}</tr><tr><td>${t('sys.case.night')}</td>${bal(night)}</tr>${isl ? `<tr><td>${t('sys.case.isl')}</td>${bal(isl)}</tr>` : `<tr><td>${t('sys.case.islShort')}</td><td colspan="5" class="muted">${t('sys.case.na')}</td></tr>`}</table></div></div>
    <div class="grid g2">
      <div class="card"><h3>${t('sys.ioTitle')}</h3><dl class="kv small"><dt>DI</dt><dd>${t('sys.ioDI', { n: r.io.DI, m: r.io.mDI, s: c.spare })}</dd><dt>DO</dt><dd>${t('sys.ioDO', { n: r.io.DO, m: r.io.mDO })}</dd><dt>AI / AO</dt><dd>${r.io.AI} / ${r.io.AO}</dd><dt>${t('sys.ka')}</dt><dd>${r.io.KA} KA</dd><dt>${t('sys.com')}</dt><dd>${t('sys.comN', { n: r.io.COM })}</dd><dt>Ethernet</dt><dd>${t('sys.eth', { n: r.eth.n, p: r.eth.ports })}</dd><dt>RS485</dt><dd>${r.rs485.master ? r.rs485.master + ' → ' + r.rs485.slaves.join(' → ') : `<b style="color:var(--ko)">${t('sys.noMaster')}</b>`}</dd></dl><button class="btn sm" data-goto="io" style="margin-top:8px">${t('sys.fullIo')} →</button></div>
      <div class="card"><h3>${t('sys.aux')}</h3><div class="tbl-wrap"><table>${r.aux.list.map(x => `<tr><td>${SG.esc(x[0])}</td><td class="num mono">${SG.fx(x[1], 2)} A</td></tr>`).join('')}<tr><td><b>${t('w.total')}</b></td><td class="num mono"><b>${SG.fx(r.aux.I, 2)} A</b></td></tr></table></div><p class="small muted" style="margin-top:6px">${t('sys.auxNote')}</p></div>
    </div>
    <div class="card"><h3>${t('sys.groups', { n: devs.length })}</h3><div class="grid g3" style="margin-top:8px">${[1, 2, 3].map(lb => `<div><h4>${SG.lbl(lb)}</h4><div class="row" style="margin-top:6px">${devs.filter(d => d.lb === lb).map(d => SG.devChip(d.id)).join('')}</div></div>`).join('')}</div></div>`;
  }
};

/* ======================= 5. TRUYỀN THÔNG ======================= */
SG.render.comms = function (el, arg) {
  const st = SG.comState = SG.comState || { sel: 'mbrtu', trace: 'P_PV' };
  const t = SG.t;
  if (arg) st.sel = arg;
  el.innerHTML = SG.headK('cm') + `
  <div class="layers4">${SG.commLayers.map(l => `<div><span class="n">${SG.esc(l.n)}</span><b>${SG.esc(l.q)}</b><span class="small">${SG.esc(l.ex)}</span><span class="small muted">${SG.T(l.note)}</span></div>`).join('')}</div>
  <div class="grid" style="grid-template-columns:260px minmax(0,1fr);align-items:start" id="cm-grid">
    <div class="card" style="padding:8px"><div class="scen-list" id="cm-list"></div></div><div class="card" id="cm-det"></div></div>
  <div class="card"><h3>${t('cm.trace')}</h3><p class="small muted">${t('cm.traceLead')}</p>
    <div class="row" style="margin:10px 0" id="tr-btns">${SG.traces.map(x => `<button class="btn sm" data-t="${x.id}">${SG.esc(x.n)}</button>`).join('')}</div>
    <div class="grid g2" style="align-items:start"><div id="tr-dg" style="height:460px"></div><div class="flow" id="tr-steps"></div></div></div>`;
  if (window.innerWidth < 900) el.querySelector('#cm-grid').style.gridTemplateColumns = '1fr';
  const list = el.querySelector('#cm-list'), det = el.querySelector('#cm-det');
  const drawList = () => { list.innerHTML = SG.comms.map((c, i) => `<button data-c="${c.id}" class="${c.id === st.sel ? 'on' : ''}"><span class="n">${i + 1}</span><span>${SG.esc(c.n)}</span>${c.ext ? `<span class="chip lb3">${t('cm.ext')}</span>` : ''}</button>`).join(''); list.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { st.sel = b.dataset.c; drawList(); drawDet(); }); };
  const ul = a => `<ul class="small">${a.map(x => `<li>${SG.esc(x)}</li>`).join('')}</ul>`;
  const drawDet = () => {
    const c = SG.comms.find(x => x.id === st.sel);
    const used = SG.allLinks().filter(l => c.used.some(u => u === l.id || (u.endsWith('-') && l.id.startsWith(u))));
    det.innerHTML = `<h2>${SG.esc(c.n)}</h2>${c.why ? `<div class="note" style="margin-top:8px">${SG.esc(c.why)}</div>` : ''}
      <div class="tbl-wrap" style="margin-top:10px"><table>${SG.commLayers.map(l => `<tr><th style="width:190px">${SG.esc(l.n)}</th><td>${SG.esc(c.lv[l.id])}</td></tr>`).join('')}</table></div>
      <div class="grid g2" style="margin-top:12px">
        <div class="stack"><h4>${t('cm.ends')}</h4>${ul(c.ends)}<h4>${t('cm.cable')}</h4><p class="small">${SG.esc(c.cable)}</p><h4>${t('cm.roles')}</h4><p class="small">${SG.esc(c.roles)}</p><h4>${t('cm.data')}</h4>${ul(c.data)}<h4>${t('cm.extra')}</h4><p class="small">${SG.esc(c.extra)}</p></div>
        <div class="stack"><h4>${t('cm.params')}</h4>${ul(c.params)}<h4>${t('cm.limits')}</h4>${ul(c.limits)}<h4>${t('cm.errors')}</h4>${ul(c.errors)}</div></div>
      ${used.length ? `<h4 style="margin-top:12px">${t('cm.used')}</h4><div class="row" style="margin-top:6px">${used.map(l => `<button class="btn sm" data-goto="diagram" data-arg="link:${l.id}">${SG.esc(l.a.d)} → ${SG.esc(l.b.d)}</button>`).join('')}</div>` : `<p class="small muted" style="margin-top:12px">${t('cm.notUsed')}</p>`}`;
  };
  drawList(); drawDet();
  const D = SG.mini(el.querySelector('#tr-dg'), { view: 'all' });
  const drawTrace = () => {
    const tr = SG.traces.find(x => x.id === st.trace);
    el.querySelectorAll('#tr-btns [data-t]').forEach(b => b.classList.toggle('on', b.dataset.t === st.trace));
    const ids = new Set(); tr.steps.forEach(x => { ids.add(x.d); if (x.l) ids.add(x.l); });
    D.setHighlight(ids); D.focus([...ids].filter(i => D.node[i]));
    el.querySelector('#tr-steps').innerHTML = tr.steps.map((x, i) => `<div class="stp"><i>${i + 1}</i><span><span class="mono">${x.d}</span><br>${SG.T(x.t)}</span></div>`).join('');
  };
  el.querySelectorAll('#tr-btns [data-t]').forEach(b => b.onclick = () => { st.trace = b.dataset.t; drawTrace(); });
  drawTrace();
};
