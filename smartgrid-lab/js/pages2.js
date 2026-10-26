/* TRANG 6–10 (chuỗi: i18n/<lang>/pages.js, khóa io.* cab.* chain.* sc.* hmi.* bom.* gl.*) */

/* ======================= 6. BẢNG I/O & BỐ TRÍ TỦ ======================= */
/* tên tủ: cab.<id>, tên hàng: cab.<id>.<chỉ số> */
SG.CAB = [
  { id: 'TGBT', w: 560, rows: [{ z: 'P', ids: ['QS0', 'QF0', 'SPD', 'KM-PCC', 'KM-GEN', 'QF-GEN'] }, { z: 'P', ids: ['RLY-DEC', 'QF-PV', 'QF-BAT', 'QF-M1', 'QF-RL', 'PM-RL', 'QF-LP', 'PM-LP', 'QF-EV', 'QF-AUX'] }, { z: 'P', ids: ['KM-M1', 'VFD-M1', 'KM-RL', 'CT-PCC'] }, { z: 'P', ids: [] }] },
  { id: 'TDK', w: 520, rows: [{ z: 'C', ids: ['PSU', 'UPS', 'F24'] }, { z: 'C', ids: ['CPU', 'DI', 'DO', 'AIO', 'COM', 'KA', 'KS'] }, { z: 'N', ids: ['SW', 'GW'] }, { z: 'C', ids: [] }] },
  { id: 'DOOR', w: 300, rows: [{ z: 'N', ids: ['HMI', 'ES', 'OP'] }, { z: 'P', ids: ['PM-PCC'] }] },
  { id: 'WALL', w: 300, rows: [{ z: 'P', ids: ['PV-INV', 'PV-DCB', 'PCS', 'EVSE'] }, { z: 'P', ids: ['BAT', 'BMS', 'BAT-DCP'] }] }
];
SG.render.io = function (el, arg) {
  const st = SG.ioState = SG.ioState || { tab: 'io', f: '', type: '' };
  const t = SG.t;
  let hlCode = null, hlDev = null;
  if (arg) { if (arg === 'cab') st.tab = 'cab'; else if (arg.startsWith('cab:')) { st.tab = 'cab'; hlDev = arg.slice(4); } else { st.tab = 'io'; hlCode = arg; st.f = ''; st.type = ''; } }
  el.innerHTML = SG.headK('io') + `<div class="tabs"><button data-t="io">${t('io.tabIo')}</button><button data-t="cab">${t('io.tabCab')}</button><button data-t="chain">${t('io.tabChain')}</button></div><div id="io-body"></div>`;
  const body = el.querySelector('#io-body');
  const tabs = () => el.querySelectorAll('[data-t]').forEach(b => b.classList.toggle('on', b.dataset.t === st.tab));
  el.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { st.tab = b.dataset.t; tabs(); draw(); });
  tabs(); draw();
  function draw() { if (st.tab === 'io') ioTable(); else if (st.tab === 'cab') cab(); else chain(); }
  function ioTable() {
    const r = SG.r; const S = r.io.sig;
    const addr = {}; const ctr = { DI: 0, DO: 0, AI: 0, AO: 0 };
    S.forEach(s => { if (ctr[s.io] != null) { const i = ctr[s.io]++; const per = s.io === 'AI' ? 4 : s.io === 'AO' ? 2 : 16; addr[s.code] = s.io + (Math.floor(i / per) + 1) + '.' + String(i % per).padStart(2, '0'); } else addr[s.code] = '—'; });
    body.innerHTML = `<div class="row" style="margin:12px 0"><input type="text" id="io-f" placeholder="${SG.esc(t('io.filterPh'))}" value="${SG.esc(st.f)}" style="max-width:300px" aria-label="${SG.esc(t('io.filterAria'))}">
      <div class="seg" id="io-ty">${['', 'DI', 'DO', 'AI', 'AO', 'COM'].map(x => `<button data-y="${x}" class="${st.type === x ? 'on' : ''}">${x || t('w.all')} (${x ? S.filter(s => s.io === x).length : S.length})</button>`).join('')}</div>
      <span class="small muted">${t('io.modules', { m: r.io.modulesTxt, s: SG.cfg.spare })}</span></div>
      <div class="tbl-wrap" style="max-height:70vh"><table id="io-t"><thead><tr><th>${t('col.sigCode')}</th><th>${t('col.channel')}</th><th>${t('col.type')}</th><th>${t('col.fromTo')}</th><th>${t('col.sigType')}</th><th>${t('col.func')}</th><th>${t('col.fail')}</th><th></th></tr></thead><tbody></tbody></table></div>
      <p class="small muted" style="margin-top:8px">${t('io.comNote')}</p>`;
    const rows = () => {
      const f = st.f.toLowerCase();
      body.querySelector('#io-t tbody').innerHTML = S.filter(s => (!st.type || s.io === st.type) && (!f || (s.code + s.src + s.dst + s.func + s.type).toLowerCase().includes(f))).map(s => `<tr id="sig-${s.code}" style="${s.code === hlCode ? 'background:var(--accent-soft)' : ''}"><td class="mono"><b>${s.code}</b></td><td class="mono small">${addr[s.code]}</td><td><span class="chip">${s.io}</span></td><td>${SG.devChip(s.src)} → ${SG.devChip(s.dst)}</td><td class="small">${SG.esc(s.type)}</td><td class="small">${SG.esc(s.func)}</td><td class="small">${SG.esc(s.fail)}</td><td>${s.link ? `<button class="btn sm" data-goto="diagram" data-arg="link:${s.link}">${t('w.diagram')}</button>` : ''}</td></tr>`).join('');
    };
    body.querySelector('#io-f').oninput = e => { st.f = e.target.value; rows(); };
    body.querySelectorAll('[data-y]').forEach(b => b.onclick = () => { st.type = b.dataset.y; body.querySelectorAll('[data-y]').forEach(x => x.classList.toggle('on', x === b)); rows(); });
    rows();
    if (hlCode) { const tr = body.querySelector('#sig-' + CSS.escape(hlCode)); if (tr) setTimeout(() => tr.scrollIntoView({ block: 'center' }), 50); }
  }
  function cab() {
    const zc = { P: 'var(--l-ac)', C: 'var(--l-di)', N: 'var(--l-eth)' };
    let x0 = 10, H = 0;
    const blocks = SG.CAB.map(cb => {
      let y = 40; let s = `<text x="${x0}" y="24" style="font:600 13px var(--font-body);fill:var(--ink)">${SG.esc(t('cab.' + cb.id))}</text>`;
      if (cb.id === 'TGBT' || cb.id === 'TDK') s += `<rect x="${x0}" y="32" width="${cb.w}" height="16" rx="2" style="fill:var(--surface2)"/><text x="${x0 + 8}" y="44" style="font:10px var(--font-body);fill:var(--ink2)">${SG.esc(t('cab.' + cb.id + '.vent'))}</text>`, y = 54;
      cb.rows.forEach((row, ri) => {
        const ids = row.ids.filter(id => { const d = SG.dev(id); return d && SG.devOn(d); });
        const rh = ids.length ? 64 : 30;
        s += `<rect x="${x0}" y="${y}" width="${cb.w}" height="${rh}" rx="4" style="fill:var(--surface3);stroke:${zc[row.z]};stroke-width:1.2;stroke-dasharray:${row.z === 'N' ? '5 3' : row.z === 'C' ? '2 2' : '0'}"/>`;
        s += `<text x="${x0 + 6}" y="${y + 13}" style="font:600 10px var(--font-body);fill:var(--ink2)">${SG.esc(t('cab.' + cb.id + '.' + ri))} · ${SG.esc(t('cab.zone', { z: SG.zoneName(row.z) }))}</text>`;
        if (ids.length) {
          const gap = 4, bw = Math.min(90, (cb.w - 12 - gap * (ids.length - 1)) / ids.length);
          ids.forEach((id, i) => {
            const bx = x0 + 6 + i * (bw + gap), hl = id === hlDev;
            s += `<g class="slot" data-dev="${id}"><rect x="${bx}" y="${y + 20}" width="${bw}" height="38" rx="3" style="fill:${hl ? 'var(--accent-soft)' : 'var(--surface)'};stroke:${hl ? 'var(--accent)' : 'var(--line2)'};stroke-width:${hl ? 2.5 : 1}"/><text x="${bx + bw / 2}" y="${y + 43}" text-anchor="middle" style="font:600 ${bw < 55 ? 9 : 10.5}px var(--font-mono);fill:var(--ink)">${id}</text><title>${SG.esc(SG.dev(id).n)}</title></g>`;
          });
          s += `<line x1="${x0 + 4}" x2="${x0 + cb.w - 4}" y1="${y + rh + 5}" y2="${y + rh + 5}" style="stroke:var(--line2);stroke-width:6;opacity:.5"/>`;
        }
        y += rh + 12;
      });
      H = Math.max(H, y);
      const out = s; x0 += cb.w + 24; return out;
    });
    const svg = `<svg viewBox="0 0 ${x0} ${H + 10}" role="img" aria-label="${SG.esc(t('cab.aria'))}">${blocks.join('')}</svg>`;
    const li = k => `<ul class="small">${t(k).split('|').map(x => `<li>${SG.esc(x)}</li>`).join('')}</ul>`;
    body.innerHTML = `<div class="note" style="margin:12px 0">${t('cab.note')}</div>
      <div class="card cab" style="overflow-x:auto"><div style="min-width:1100px">${svg}</div></div>
      <div class="row small" style="margin-top:8px"><span><span style="display:inline-block;width:22px;border-top:2px solid var(--l-ac)"></span> ${t('cab.legP')}</span><span><span style="display:inline-block;width:22px;border-top:2px dotted var(--l-di)"></span> ${t('cab.legC')}</span><span><span style="display:inline-block;width:22px;border-top:2px dashed var(--l-eth)"></span> ${t('cab.legN')}</span><span class="muted">${t('cab.legDuct')}</span></div>
      <div class="grid g3" style="margin-top:14px">
        <div class="card"><h3>${t('cab.auxT')}</h3>${li('cab.auxL')}</div>
        <div class="card"><h3>${t('cab.emcT')}</h3>${li('cab.emcL')}</div>
        <div class="card"><h3>${t('cab.heatT')}</h3><p class="small">${t('cab.heatP', { v: SG.num(SG.cfg.rlSteps * SG.cfg.rlStep) })}</p></div></div>`;
    body.querySelectorAll('.slot').forEach(g => g.onclick = () => SG.go('library', g.dataset.dev));
  }
  function chain() {
    const cs = SG.chainState = SG.chainState || { remote: true, ks: true, qf: true, km: true, flt: false, nofb: false, res: null };
    const conds = [['remote', 'SEL_REMOTE'], ['ks', 'KS_OK'], ['qf', 'QF_M1_OF'], ['km', 'KM_M1_FB']];
    const run = () => {
      const fails = conds.filter(c => !cs[c[0]]).map(c => c[1] + ' = 0'); if (cs.flt) fails.push('VFD_FLT = 1');
      const steps = [['HMI', 'chain.s1']];
      if (fails.length) { steps.push(['CPU', 'chain.s2ko', { f: fails.join(', ') }]); steps.push(['HMI', 'chain.s3ko', { f: fails.join(', ') }]); cs.res = 'ko'; }
      else {
        steps.push(['CPU', 'chain.s2ok']); steps.push(['DO', 'chain.s3ok']);
        if (cs.nofb) { steps.push(['VFD-M1', 'chain.s4nofb']); steps.push(['CPU', 'chain.s5nofb']); steps.push(['HMI', 'chain.s6nofb']); cs.res = 'alarm'; }
        else { steps.push(['VFD-M1', 'chain.s4ok']); steps.push(['DI', 'chain.s5ok']); steps.push(['HMI', 'chain.s6ok']); cs.res = 'ok'; }
      }
      return steps;
    };
    const steps = cs.res ? run() : null;
    body.innerHTML = `<div class="grid g2" style="margin-top:12px;align-items:start"><div class="card stack"><h3>${t('chain.title')}</h3>
      <p class="small muted">${t('chain.lead')}</p>
      ${conds.map(c => `<label class="cb"><input type="checkbox" data-c="${c[0]}" ${cs[c[0]] ? 'checked' : ''}> <span><span class="mono">${c[1]}</span> — ${t('chain.c.' + c[0])}</span></label>`).join('')}
      <label class="cb"><input type="checkbox" data-c="flt" ${cs.flt ? 'checked' : ''}> <span><span class="mono">VFD_FLT</span> — ${t('chain.c.flt')}</span></label>
      <label class="cb"><input type="checkbox" data-c="nofb" ${cs.nofb ? 'checked' : ''}> <span>${t('chain.c.nofb')}</span></label>
      <div class="row"><button class="btn pri" id="ch-run">${t('chain.run')}</button>${cs.res ? SG.stChip(cs.res === 'ok' ? 'ok' : cs.res === 'ko' ? 'unk' : 'ko', t('chain.res.' + cs.res)) : ''}</div>
      <pre class="code">${SG.esc(t('chain.pseudo'))}</pre>
      <div class="note small">${t('chain.estop')}</div></div>
      <div class="stack"><div id="ch-dg" style="height:380px"></div><div class="flow">${steps ? steps.map((s, i) => `<div class="stp"><i>${i + 1}</i><span><span class="mono">${s[0]}</span><br>${SG.esc(t(s[1], s[2]))}</span></div>`).join('') : `<p class="small muted">${t('chain.hint')}</p>`}</div></div></div>`;
    body.querySelectorAll('[data-c]').forEach(cb => cb.onchange = () => { cs[cb.dataset.c] = cb.checked; cs.res = null; chain(); });
    body.querySelector('#ch-run').onclick = () => { cs.res = 'x'; chain(); };
    const ids = new Set(['HMI', 'CPU', 'SW', 'e-hmi', 'e-cpu', 'DO', 'c-do-vfd', 'VFD-M1', 'd-vfd', 'DI', 'm-vfd', 'AIO', 'M1', 'p-m4', 'KS', 'd-ks', 'QF-M1', 'd-qfm1', 'KM-M1', 'd-kmm1', 'OP', 'd-op']);
    const D = SG.mini(body.querySelector('#ch-dg'), { view: 'all', hl: ids });
    D.focus(['HMI', 'VFD-M1', 'KS', 'QF-M1']);
  }
};

/* ======================= 7. KỊCH BẢN ======================= */
SG.scenState = function (sc, upto, c) {
  let s = Object.assign({ mode: 'GRID', irr: 0.6, soc: 50, m1Run: false, m1Spd: 100, rlOn: 1, rlFault: false, evOn: false, evA: 32, auto: true }, sc.base || {});
  const v = sc.variant ? sc.variant(c) : null;
  const steps = sc.steps.filter(x => !x.v || x.v === v);
  for (let i = 0; i <= upto && i < steps.length; i++) if (steps[i].s) s = Object.assign({}, s, steps[i].s);
  if (!c.ev) s.evOn = false;
  return { s, steps, v };
};
SG.modeName = m => SG.t('mode.' + m);
SG.render.scenarios = function (el, arg) {
  const st = SG.scState = SG.scState || { sel: 'pv-surplus', i: 0 };
  const t = SG.t;
  if (arg) { st.sel = arg; st.i = 0; }
  const c = SG.cfg;
  el.innerHTML = SG.headK('sc') + `
  <div class="grid" style="grid-template-columns:270px minmax(0,1fr);align-items:start" id="sc-grid"><div class="card" style="padding:8px"><div class="scen-list" id="sc-list"></div></div><div class="stack" id="sc-main" style="gap:14px"></div></div>
  <div class="card"><h3>${t('sc.roles')}</h3><div class="tbl-wrap" style="margin-top:8px"><table><tr><th></th><th>${t('sc.r.prot')}</th><th>${t('sc.r.safe')}</th><th>${t('sc.r.plc')}</th></tr>
    ${['ex', 'dep', 'time', 'sees'].map(k => `<tr><td><b>${t('sc.r.' + k)}</b></td>${t('sc.r.' + k + '.v').split('|').map(x => `<td>${SG.esc(x)}</td>`).join('')}</tr>`).join('')}</table></div>
    <p class="small muted" style="margin-top:8px">${t('sc.more')} <a href="#library" data-goto="library">${t('sc.moreLink')}</a>.</p></div>`;
  if (window.innerWidth < 900) el.querySelector('#sc-grid').style.gridTemplateColumns = '1fr';
  const list = el.querySelector('#sc-list'), main = el.querySelector('#sc-main');
  const lockOf = sc => sc.lock ? sc.lock(c) : null;
  list.innerHTML = SG.scenarios.map((sc, i) => `<button data-s="${sc.id}" class="${sc.id === st.sel ? 'on' : ''}"><span class="n">${i + 1}</span><span>${SG.esc(sc.n)}</span>${lockOf(sc) ? `<span class="chip" title="${SG.esc(t('sc.locked'))}">🔒 ${t('sc.lockShort')}</span>` : ''}</button>`).join('');
  list.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { st.sel = b.dataset.s; st.i = 0; SG.render.scenarios(el); });
  const sc = SG.scenarios.find(x => x.id === st.sel);
  const lock = lockOf(sc);
  if (lock) {
    main.innerHTML = `<div class="card stack"><h2>${SG.esc(sc.n)}</h2><div class="note ko lock"><span style="font-size:18px">🔒</span><div><b>${t('sc.lockedTitle')}</b><br>${SG.esc(lock)}</div></div><div class="row"><button class="btn" data-goto="selector" data-arg="sys">${t('sc.changeCfg')} →</button><button class="btn" data-goto="library" data-arg="KM-GEN">${t('sc.kmgen')} →</button></div></div>`;
    return;
  }
  const { steps, v } = SG.scenState(sc, 0, c);
  st.i = Math.min(st.i, steps.length - 1);
  const cur = steps[st.i];
  const { s } = SG.scenState(sc, st.i, c);
  const o = SG.solve(c, s);
  const txt = x => typeof x.t === 'function' ? x.t(c) : x.t;
  const states = { 'KM-PCC': s.mode === 'GRID' ? 'on' : 'off', 'KM-GEN': s.mode === 'GEN' ? 'on' : 'off', 'QF-RL': s.rlFault ? 'trip' : 'on', 'KM-RL': s.rlOn > 0 && !s.rlFault ? 'on' : 'off', 'VFD-M1': s.m1Run ? 'on' : 'off', QF0: 'on' };
  const vals = { 'PV-INV': SG.fx(o.pv) + ' kW', PCS: SG.fx(o.bat) + ' kW', BAT: 'SOC ' + Math.round(s.soc) + ' %', LP: SG.fx(o.loads.lp) + ' kW', RL: SG.fx(o.loads.rl) + ' kW', M1: SG.fx(o.loads.m1) + ' kW' };
  if (s.mode === 'GRID' && SG.dev('PM-PCC')) vals['PM-PCC'] = 'P_GRID ' + SG.fx(o.grid) + ' kW';
  if (c.gen) vals.GEN = SG.fx(o.gen) + ' kW';
  if (c.ev) vals.EVSE = SG.fx(o.loads.ev) + ' kW';
  const table = steps.slice(0, st.i + 1).map((x, i) => { const S = SG.scenState(sc, i, c).s, O = SG.solve(c, S); return `<tr style="${i === st.i ? 'background:var(--accent-soft)' : ''}"><td>${i + 1}. ${SG.phaseName(x.ph)}</td><td><span class="mode-pill mode-${S.mode}">${SG.modeName(S.mode)}</span></td><td class="num">${SG.fx(O.pv)}</td><td class="num">${SG.fx(O.bat)}</td><td class="num">${SG.fx(O.grid)}</td><td class="num">${SG.fx(O.gen)}</td><td class="num">${SG.fx(O.loads.total)}</td><td class="num">${Math.round(S.soc)}</td><td class="num">${O.f ? SG.fx(O.f, 1) : '—'}</td></tr>`; }).join('');
  main.innerHTML = `<div class="card stack"><div class="row" style="justify-content:space-between"><h2>${SG.esc(sc.n)}</h2>${v ? `<span class="chip">${t('sc.variant')} <b>${t('sc.v.' + v)}</b></span>` : ''}</div>
    <div class="phases">${[0, 1, 2, 3, 4, 5, 6].map(i => `<span class="${i === cur.ph ? 'on' : i < cur.ph ? 'done' : ''}">${SG.phaseName(i)}</span>`).join('')}</div>
    <div class="note info"><b>${t('sc.step', { i: st.i + 1, n: steps.length, p: SG.phaseName(cur.ph) })}</b> ${SG.T(txt(cur))}</div>
    <div class="row"><button class="btn" id="sc-prev" ${st.i === 0 ? 'disabled' : ''}>← ${t('sc.prev')}</button><button class="btn pri" id="sc-next" ${st.i >= steps.length - 1 ? 'disabled' : ''}>${t('sc.next')} →</button><button class="btn" id="sc-reset">${t('sc.reset')}</button><button class="btn" data-goto="hmi">${t('sc.tryHmi')} →</button></div>
    ${o.notes.length ? `<div class="small muted">${t('sc.simNote')} ${o.notes.map(SG.esc).join(' ')}</div>` : ''}</div>
  <div id="sc-dg" style="height:440px"></div>
  <div class="card"><h3>${t('sc.table')}</h3><p class="small muted">${t('sc.tableNote')}</p><div class="tbl-wrap" style="margin-top:8px"><table><tr><th>${t('col.step')}</th><th>${t('col.mode')}</th><th class="num">P_PV</th><th class="num">P_BAT</th><th class="num">P_GRID</th><th class="num">P_GEN</th><th class="num">Σ</th><th class="num">SOC %</th><th class="num">f Hz</th></tr>${table}</table></div></div>
  <div class="grid g2"><div class="card"><h3>${t('sc.logic')}</h3><pre class="code" style="margin-top:8px">${SG.esc(sc.pseudo)}</pre></div><div class="card stack"><h3>${t('sc.all')}</h3><div class="flow">${steps.map((x, i) => `<div class="stp ${i === st.i ? 'cur' : ''}" data-i="${i}" style="cursor:pointer"><i>${i + 1}</i><span><b>${SG.phaseName(x.ph)}</b> — ${SG.T(txt(x))}</span></div>`).join('')}</div>${sc.note ? `<div class="note small">${SG.esc(sc.note)}</div>` : ''}</div></div>`;
  const D = SG.mini(main.querySelector('#sc-dg'), { view: 'all', hl: new Set(cur.hl || []), values: vals });
  D.states = states; D.render();
  const focus = (cur.hl || []).filter(id => D.node[id]); if (focus.length) D.focus(focus);
  main.querySelector('#sc-prev').onclick = () => { st.i--; SG.render.scenarios(el); };
  main.querySelector('#sc-next').onclick = () => { st.i++; SG.render.scenarios(el); };
  main.querySelector('#sc-reset').onclick = () => { st.i = 0; SG.render.scenarios(el); };
  main.querySelectorAll('.stp[data-i]').forEach(p => p.onclick = () => { st.i = +p.dataset.i; SG.render.scenarios(el); });
};

/* ======================= 8. HMI ======================= */
/* tên: hmi.src.<k>, cách lấy: hmi.src.<k>.how */
SG.SOURCES = {
  pv: { dev: 'PV-INV', trace: 'P_PV', link: 'e-inv' }, bat: { dev: 'PCS', trace: 'SOC', link: 'e-pcs' }, soc: { dev: 'BMS', trace: 'SOC', link: 'n-bms' },
  grid: { dev: 'PM-PCC', trace: 'P_GRID', link: 'e-pm' }, gen: { dev: 'GEN-CTRL', trace: null, link: null }, lp: { dev: 'PM-LP', trace: null, link: null },
  rl: { dev: 'PM-RL', trace: 'P_RL', link: null }, m1: { dev: 'VFD-M1', trace: 'CMD_M1', link: 'e-vfd' }, ev: { dev: 'EVSE', trace: null, link: 'e-ev' }, uf: { dev: 'PM-PCC', trace: 'P_GRID', link: 'e-pm' }
};
SG.render.hmi = function (el) {
  const c = SG.cfg, t = SG.t;
  if (!SG.simObj || SG.simObj.cfgKey !== JSON.stringify(c)) { SG.simObj = new SG.Sim(c); SG.simObj.cfgKey = JSON.stringify(c); }
  const S = SG.simObj; const ui = S.ui;
  const hs = SG.hmiSt = SG.hmiSt || { run: true, speed: 60, src: null, cmd: null };
  el.innerHTML = SG.headK('hmi') + `
  <div class="card row" style="justify-content:space-between">
    <div class="row"><span class="mono" style="font-size:20px;font-weight:600" id="h-clock"></span><span id="h-mode"></span>
      <button class="btn" id="h-run"></button><select id="h-speed" style="width:auto" aria-label="${SG.esc(t('hmi.speedAria'))}"><option value="1">${t('hmi.sp1')}</option><option value="60">${t('hmi.sp60')}</option><option value="600">${t('hmi.sp600')}</option></select>
      <select id="h-time" style="width:auto" aria-label="${SG.esc(t('hmi.timeAria'))}"><option value="">${t('hmi.setTime')}</option>${[6, 9, 12, 15, 18, 21].map(h => `<option value="${h}">${h}:00</option>`).join('')}</select><button class="btn" id="h-reset">${t('hmi.restart')}</button></div>
    <div class="row"><span class="small muted">${t('hmi.selectors')}</span><div class="seg"><button id="sa-auto">Auto</button><button id="sa-man">Manu</button></div><div class="seg"><button id="sl-rem">${t('hmi.remote')}</button><button id="sl-loc">${t('hmi.local')}</button></div></div></div>
  <div class="kpi" id="h-kpi"></div>
  <div class="grid" style="grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);align-items:start" id="h-grid">
    <div class="stack" style="gap:14px">
      <div class="card"><div class="row" style="justify-content:space-between"><h3>${t('hmi.chartP')}</h3><span class="small muted" id="h-legend"></span></div><svg class="chart" id="h-chart" role="img" aria-label="${SG.esc(t('hmi.chartP'))}"></svg>
        <h3 style="margin-top:8px">SOC (%)</h3><svg class="chart" id="h-soc" style="height:110px" role="img" aria-label="SOC"></svg></div>
      <div id="h-dg" style="height:420px"></div>
    </div>
    <div class="stack" style="gap:14px">
      <div class="card" id="h-src"></div>
      <div class="card stack"><h3>${t('hmi.cmds')}</h3>
        <div class="row"><b style="width:100px">${t('hmi.m1')}</b><button class="btn" data-cmd="m1start">${t('hmi.run')}</button><button class="btn" data-cmd="m1stop">${t('hmi.stop')}</button><label class="f" style="flex:1;min-width:120px">${t('hmi.speed')} <input type="range" min="20" max="100" step="5" id="h-spd" value="${S.s.m1Spd}"></label></div>
        <div class="row"><b style="width:100px">${t('hmi.rl')}</b>${Array.from({ length: c.rlSteps + 1 }, (_, i) => `<button class="btn sm" data-cmd="rl${i}">${t('hmi.nSteps', { n: i })}</button>`).join('')}</div>
        ${c.ev ? `<div class="row"><b style="width:100px">EV</b><button class="btn" data-cmd="evon">${t('hmi.charge')}</button><button class="btn" data-cmd="evoff">${t('hmi.stop')}</button><select id="h-eva" style="width:auto" aria-label="${SG.esc(t('hmi.evAria'))}">${[6, 10, 16, 24, 32].map(a => `<option ${a === ui.evAreq ? 'selected' : ''}>${a}</option>`).join('')}</select> A</div>` : ''}
        <div class="row"><b style="width:100px">${t('hmi.batMan')}</b><input type="range" min="${-c.Pcs}" max="${c.Pcs}" step="0.5" id="h-bat" value="${S.s.batSet}" style="flex:1" aria-label="${SG.esc(t('hmi.batMan'))}"><span class="mono small" id="h-batv"></span></div>
        <div class="row"><b style="width:100px">${t('hmi.alarms')}</b><button class="btn" data-cmd="reset">${t('hmi.ack')}</button></div>
        <div id="h-cmd"></div></div>
      <div class="card stack"><h3>${t('hmi.sim')}</h3>
        <label class="cb"><input type="checkbox" id="x-grid" ${!ui.gridAvail ? 'checked' : ''}> ${t('hmi.x.grid')}</label>
        <label class="f">${t('hmi.x.cloud')} <input type="range" min="0" max="90" step="10" id="x-cloud" value="${ui.cloud}"></label>
        <label class="cb"><input type="checkbox" id="x-cpm" ${ui.commPM ? 'checked' : ''}> ${t('hmi.x.cpm')}</label>
        <label class="cb"><input type="checkbox" id="x-cinv" ${ui.commInv ? 'checked' : ''}> ${t('hmi.x.cinv')}</label>
        <label class="cb"><input type="checkbox" id="x-rl" ${ui.rlFault ? 'checked' : ''}> ${t('hmi.x.rl')}</label>
        <label class="cb"><input type="checkbox" id="x-m1" ${ui.m1FailInject ? 'checked' : ''}> ${t('hmi.x.m1')}</label></div>
      <div class="card"><h3>${t('hmi.sw')}</h3><div class="tbl-wrap" style="margin-top:8px"><table id="h-sw"></table></div></div>
      <div class="card"><h3>${t('hmi.alarms')}</h3><div id="h-alarms" class="small" style="margin-top:6px"></div><h3 style="margin-top:12px">${t('hmi.log')}</h3><div class="log" id="h-log"></div></div>
    </div></div>`;
  if (window.innerWidth < 1000) el.querySelector('#h-grid').style.gridTemplateColumns = '1fr';
  const $ = s => el.querySelector(s);
  const D = SG.mini($('#h-dg'), { view: 'power', onSelect: x => { if (x && x.kind === 'dev') SG.go('diagram', x.id); } });
  $('#h-speed').value = hs.speed;
  $('#h-run').onclick = () => { hs.run = !hs.run; paint(); };
  $('#h-speed').onchange = e => { hs.speed = +e.target.value; };
  $('#h-time').onchange = e => { if (e.target.value) { S.t = +e.target.value * 3600; S.event('ev.setTime', 'info', { h: e.target.value }); S.step(0); paint(); } e.target.value = ''; };
  $('#h-reset').onclick = () => { S.reset(); SG.render.hmi(el); };
  $('#sa-auto').onclick = () => { ui.autoSel = true; S.event('ev.sa1Auto', 'info'); paint(); };
  $('#sa-man').onclick = () => { ui.autoSel = false; S.event('ev.sa1Man', 'info'); paint(); };
  $('#sl-rem').onclick = () => { ui.remoteSel = true; S.event('ev.sa2Rem', 'info'); paint(); };
  $('#sl-loc').onclick = () => { ui.remoteSel = false; S.event('ev.sa2Loc', 'info'); paint(); };
  $('#x-grid').onchange = e => { ui.gridAvail = !e.target.checked; S.event(e.target.checked ? 'ev.xGridLost' : 'ev.xGridBack', 'warn'); };
  $('#x-cloud').oninput = e => { ui.cloud = +e.target.value; };
  $('#x-cpm').onchange = e => { ui.commPM = e.target.checked; };
  $('#x-cinv').onchange = e => { ui.commInv = e.target.checked; };
  $('#x-rl').onchange = e => { ui.rlFault = e.target.checked; if (!e.target.checked) S.event('ev.rlFixed', 'info'); };
  $('#x-m1').onchange = e => { ui.m1FailInject = e.target.checked; };
  $('#h-spd').oninput = e => { S.s.m1Spd = +e.target.value; };
  $('#h-bat').oninput = e => { S.s.batSet = +e.target.value; };
  if ($('#h-eva')) $('#h-eva').onchange = e => { ui.evAreq = +e.target.value; if (!S.s.auto || S.s.evA > ui.evAreq) S.s.evA = ui.evAreq; };
  el.querySelectorAll('[data-cmd]').forEach(b => b.onclick = () => command(b.dataset.cmd));

  /* lệnh lưu khóa + biến → hiển thị đúng ngôn ngữ kể cả sau khi đổi ngôn ngữ */
  function command(k) {
    const s = S.s, o = S.lastSolve, conds = [];
    const ctrl = s.mode !== 'BLACKOUT' || c.ups;
    conds.push(['cmd.c.ctrl', null, ctrl]);
    if (k !== 'reset') conds.push(['cmd.c.remote', null, ui.remoteSel]);
    let tk, tv = null, ok, path = [], fk = '';
    if (k === 'm1start') {
      tk = 'cmd.m1start';
      conds.push(['cmd.c.ks', null, true], ['cmd.c.qfm1', null, true], ['cmd.c.vfdflt', null, true], ['cmd.c.bus', null, s.mode !== 'BLACKOUT']);
      if (s.mode === 'ISLAND' || s.mode === 'GEN') { const head = (s.mode === 'ISLAND' ? c.Pcs : c.Sgen * 0.8) - (o.loads.total - o.pv); conds.push(['cmd.c.reserve', { v: SG.fx(head) }, head >= c.Pm / 0.85]); }
      path = ['cmd.p.m1.1', 'cmd.p.m1.2', 'cmd.p.m1.3', 'cmd.p.m1.4']; fk = 'cmd.f.m1start';
      ok = conds.every(x => x[2]); if (ok) ui.m1Req = true;
    } else if (k === 'm1stop') {
      tk = 'cmd.m1stop'; path = ['cmd.p.stop.1', 'cmd.p.stop.2', 'cmd.p.stop.3', 'cmd.p.stop.4']; fk = 'cmd.f.m1stop';
      ok = conds.every(x => x[2]); if (ok) ui.m1Req = false;
    } else if (k.startsWith('rl')) {
      const n = +k.slice(2); tk = 'cmd.rl'; tv = { n };
      conds.push(['cmd.c.rlsd', null, !s.rlFault], ['cmd.c.notIsl', null, s.mode !== 'ISLAND' || n === 0]);
      if (s.auto && s.mode === 'GRID') conds.push(['cmd.c.autoShed', null, true]);
      path = ['cmd.p.rl.1', 'cmd.p.rl.2', 'cmd.p.rl.3']; fk = 'cmd.f.rl';
      ok = conds.slice(0, 4).every(x => x[2]); if (ok) { ui.rlReq = n; if (!s.auto) s.rlOn = n; }
    } else if (k === 'evon' || k === 'evoff') {
      tk = k === 'evon' ? 'cmd.evon' : 'cmd.evoff'; conds.push(['cmd.c.notIslEv', null, s.mode !== 'ISLAND' || k === 'evoff']);
      path = ['cmd.p.ev.1', 'cmd.p.ev.2', 'cmd.p.ev.3', 'cmd.p.ev.4']; fk = 'cmd.f.ev';
      ok = conds.every(x => x[2]); if (ok) ui.evReq = k === 'evon';
    } else if (k === 'reset') {
      tk = 'cmd.reset'; conds.push(['cmd.c.cause', null, !ui.rlFault]);
      path = ['cmd.p.reset.1', 'cmd.p.reset.2']; fk = 'cmd.f.reset';
      ok = conds[0][2]; if (ok) { if (!ui.rlFault && s.rlFault) { s.rlFault = false; S.event('ev.rlUnlock', 'info'); } S.clear('m1'); S.clear('rl'); S.clear('pcs'); S.alarms.forEach(a => a.ack = true); }
    }
    if (!ok) S.event('ev.cmdRejected', 'warn', { tk, tv, fails: conds.filter(x => !x[2]).map(x => [x[0], x[1]]) }); else S.event('ev.cmdAccepted', 'info', { tk, tv });
    hs.cmd = { tk, tv, conds, path, fk, ok };
    paint();
  }
  function tile(key, label, val, unit, sub, cls) { return `<button class="tile ${cls || ''}" data-src="${key}"><span class="k">${label}</span><span class="v">${val}<small>${unit}</small></span><span class="s">${sub || ''}</span></button>`; }
  function chart() {
    const H = S.hist.slice(-120); const svg = $('#h-chart'); if (!svg) return;
    const series = [['grid', t('hmi.s.grid'), 1], ['pv', 'PV', 2], ['bat', t('hmi.s.bat'), 3]].concat(c.gen ? [['gen', t('hmi.s.gen'), 4]] : []).concat([['load', t('hmi.s.load'), 5]]);
    const W = svg.clientWidth || 600, Hh = svg.clientHeight || 220, pl = 36, pr = Math.max(72, 14 + 6.5 * Math.max(...series.map(s => s[1].length))), pt = 10, pb = 22;
    const vals = H.flatMap(h => series.map(s => h[s[0]])); let lo = Math.min(-2, ...vals), hi = Math.max(4, ...vals); lo = Math.floor(lo / 2) * 2; hi = Math.ceil(hi / 2) * 2;
    const X = i => pl + (W - pl - pr) * (H.length < 2 ? 0 : i / (H.length - 1)), Y = v => pt + (Hh - pt - pb) * (hi - v) / (hi - lo);
    let g = '';
    for (let v = lo; v <= hi; v += (hi - lo > 16 ? 4 : 2)) g += `<line x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}" class="gl" ${v === 0 ? 'style="stroke:var(--ink3)"' : ''}/><text x="${pl - 6}" y="${Y(v) + 3}" text-anchor="end" class="ax">${SG.num(v)}</text>`;
    const fmt = x => { const h = Math.floor(x / 3600) % 24, m = Math.floor(x / 60) % 60; return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); };
    if (H.length) g += `<text x="${pl}" y="${Hh - 6}" class="ax">${fmt(H[0].t)}</text><text x="${W - pr}" y="${Hh - 6}" text-anchor="end" class="ax">${fmt(H[H.length - 1].t)}</text>`;
    const last = H[H.length - 1], lab = [];
    series.forEach(s => { if (H.length < 2) return; g += `<path d="M${H.map((h, i) => X(i).toFixed(1) + ',' + Y(h[s[0]]).toFixed(1)).join(' L')}" fill="none" stroke="var(--s${s[2]})" stroke-width="2" ${s[0] === 'load' ? 'stroke-dasharray="5 3"' : ''}/>`; g += `<circle cx="${X(H.length - 1)}" cy="${Y(last[s[0]])}" r="3" fill="var(--s${s[2]})" stroke="var(--surface)" stroke-width="2"/>`; lab.push({ t: s[1], y: Y(last[s[0]]) + 3 }); });
    lab.sort((p, q) => p.y - q.y); for (let i = 1; i < lab.length; i++) if (lab[i].y - lab[i - 1].y < 11) lab[i].y = lab[i - 1].y + 11;
    lab.forEach(l => { g += `<text x="${W - pr + 6}" y="${l.y}" class="ax" style="fill:var(--ink2)">${SG.esc(l.t)}</text>`; });
    g += `<line id="h-x" x1="0" x2="0" y1="${pt}" y2="${Hh - pb}" style="stroke:var(--ink3);display:none"/><rect x="${pl}" y="${pt}" width="${W - pl - pr}" height="${Hh - pt - pb}" fill="transparent" id="h-hit"/>`;
    svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`); svg.innerHTML = g;
    $('#h-legend').innerHTML = series.map(s => `<span style="display:inline-flex;align-items:center;gap:4px;margin-left:10px"><svg width="16" height="6"><line x1="0" y1="3" x2="16" y2="3" stroke="var(--s${s[2]})" stroke-width="2" ${s[0] === 'load' ? 'stroke-dasharray="4 2"' : ''}/></svg>${SG.esc(s[1])}</span>`).join('');
    const hit = $('#h-hit'); const tipEl = document.getElementById('tip');
    hit.onmousemove = e => { const r = svg.getBoundingClientRect(); const x = (e.clientX - r.left) * W / r.width; const i = Math.max(0, Math.min(H.length - 1, Math.round((x - pl) / (W - pl - pr) * (H.length - 1)))); const h = H[i]; if (!h) return; const xl = $('#h-x'); xl.setAttribute('x1', X(i)); xl.setAttribute('x2', X(i)); xl.style.display = ''; tipEl.innerHTML = `<b>${fmt(h.t)}</b>` + series.map(s => `${SG.esc(s[1])}: ${SG.fx(h[s[0]])} kW`).join('<br>') + `<br>SOC: ${SG.fx(h.soc)} %`; tipEl.hidden = false; tipEl.style.left = Math.min(window.innerWidth - 200, e.clientX + 14) + 'px'; tipEl.style.top = (e.clientY + 14) + 'px'; };
    hit.onmouseleave = () => { $('#h-x').style.display = 'none'; tipEl.hidden = true; };
    const s2 = $('#h-soc'); const W2 = s2.clientWidth || 600, H2 = 110; const Y2 = v => 8 + (H2 - 26) * (100 - v) / 100;
    let g2 = [0, 50, 100].map(v => `<line x1="${pl}" x2="${W2 - pr}" y1="${Y2(v)}" y2="${Y2(v)}" class="gl"/><text x="${pl - 6}" y="${Y2(v) + 3}" text-anchor="end" class="ax">${v}</text>`).join('');
    g2 += `<line x1="${pl}" x2="${W2 - pr}" y1="${Y2(c.socMin)}" y2="${Y2(c.socMin)}" style="stroke:var(--ko);stroke-dasharray:3 3"/><text x="${W2 - pr + 6}" y="${Y2(c.socMin) + 3}" class="ax">min ${c.socMin}</text><line x1="${pl}" x2="${W2 - pr}" y1="${Y2(c.socMax)}" y2="${Y2(c.socMax)}" style="stroke:var(--ink3);stroke-dasharray:3 3"/><text x="${W2 - pr + 6}" y="${Y2(c.socMax) + 3}" class="ax">max ${c.socMax}</text>`;
    const X2 = i => pl + (W2 - pl - pr) * (H.length < 2 ? 0 : i / (H.length - 1));
    if (H.length > 1) g2 += `<path d="M${pl},${Y2(0)} L${H.map((h, i) => X2(i).toFixed(1) + ',' + Y2(h.soc).toFixed(1)).join(' L')} L${X2(H.length - 1)},${Y2(0)}Z" style="fill:var(--s3);opacity:.12"/><path d="M${H.map((h, i) => X2(i).toFixed(1) + ',' + Y2(h.soc).toFixed(1)).join(' L')}" fill="none" stroke="var(--s3)" stroke-width="2"/>`;
    s2.setAttribute('viewBox', `0 0 ${W2} ${H2}`); s2.innerHTML = g2;
  }
  const evText = l => { if (l.k === 'ev.cmdRejected') return t('ev.cmdRejected', { c: t(l.v.tk, l.v.tv), f: l.v.fails.map(f => t(f[0], f[1])).join('; ') }); if (l.k === 'ev.cmdAccepted') return t('ev.cmdAccepted', { c: t(l.v.tk, l.v.tv) }); return t(l.k, l.v); };
  function paint() {
    const s = S.s, o = S.lastSolve, dead = s.mode === 'BLACKOUT', ctrlDead = dead && !c.ups;
    $('#h-clock').textContent = S.clock();
    $('#h-mode').innerHTML = `<span class="mode-pill mode-${s.mode}">${SG.modeName(s.mode)}</span>`;
    $('#h-run').textContent = hs.run ? '❚❚ ' + t('hmi.pause') : '▶ ' + t('hmi.play');
    $('#sa-auto').classList.toggle('on', ui.autoSel); $('#sa-man').classList.toggle('on', !ui.autoSel); $('#sl-rem').classList.toggle('on', ui.remoteSel); $('#sl-loc').classList.toggle('on', !ui.remoteSel);
    $('#h-batv').textContent = (s.auto ? 'Auto (EMS) — ' : t('hmi.setPt') + ' ') + SG.fx(s.auto ? o.bat : s.batSet) + ' kW';
    $('#h-bat').disabled = s.auto;
    const bal = o.grid + o.pv + o.bat + o.gen - o.loads.total;
    const inv = x => ctrlDead ? 'inval' : x;
    const socPct = s.soc;
    $('#h-kpi').innerHTML = [
      tile('pv', 'P_PV', SG.fx(o.pv), 'kW', s.commInv ? t('hmi.k.pvLost') : (o.curtail > 0 ? t('hmi.k.limit', { v: SG.fx(o.curtail) }) : t('hmi.k.avail', { v: SG.fx(o.pvAvail) })), inv(s.commInv ? 'inval' : '')),
      tile('bat', 'P_BAT', SG.fx(o.bat), 'kW', t(o.bat > 0.05 ? 'hmi.k.dis' : o.bat < -0.05 ? 'hmi.k.chg' : 'hmi.k.idle'), inv('')),
      `<button class="tile ${inv('')}" data-src="soc"><span class="k">SOC</span><span class="v">${SG.fx(socPct, 0)}<small>%</small></span><div class="bar" title="${SG.esc(t('hmi.k.socLim', { a: c.socMin, b: c.socMax }))}"><i style="left:0;width:${socPct}%"></i><b style="left:${c.socMin}%"></b><b style="left:${c.socMax}%"></b></div><span class="s">${t('hmi.k.socLim', { a: c.socMin, b: c.socMax })}</span></button>`,
      tile('grid', 'P_GRID', s.commPM ? '—' : SG.fx(o.grid), 'kW', s.commPM ? t('hmi.k.pmLost') : t(o.grid > 0.05 ? 'hmi.k.imp' : o.grid < -0.05 ? 'hmi.k.exp' : 'hmi.k.zero') + ' · ' + t('hmi.k.impLim', { v: c.importLimit }), (s.commPM ? 'inval' : o.grid > c.importLimit ? 'bad' : '')),
      c.gen ? tile('gen', 'P_GEN', SG.fx(o.gen), 'kW', t(S.gen.req ? (S.gen.ready ? 'hmi.k.genReady' : 'hmi.k.genStart') : 'hmi.k.stopped'), inv('')) : '',
      tile('lp', t('hmi.k.lp'), SG.fx(o.loads.lp), 'kW', t('hmi.k.noShed'), inv('')),
      tile('m1', t('hmi.m1'), SG.fx(o.loads.m1), 'kW', s.m1Run ? (S.m1Fb ? t('hmi.k.running', { v: s.m1Spd }) : t('hmi.k.waitFb')) : t('hmi.k.stopped'), inv('')),
      tile('rl', t('hmi.rl'), SG.fx(o.loads.rl), 'kW', s.rlFault ? 'QF-RL TRIP' : t('hmi.k.steps', { a: s.rlOn, b: c.rlSteps }), inv(s.rlFault ? 'bad' : '')),
      c.ev ? tile('ev', 'EV', SG.fx(o.loads.ev), 'kW', s.evOn ? t('hmi.k.evLim', { v: s.evA }) : t('hmi.k.evOff'), inv('')) : '',
      tile('uf', t('hmi.k.uf'), o.U ? o.U : '0', 'V', o.f ? SG.fx(o.f, 2) + ' Hz' : '—', inv(dead ? 'bad' : '')),
      `<div class="tile" style="cursor:default"><span class="k">${t('hmi.k.bal')}</span><span class="v">${SG.fx(Math.abs(bal) < 0.005 ? 0 : bal, 2)}<small>kW</small></span><span class="s mono" style="overflow-wrap:anywhere;font-size:10.5px">P_GRID + P_PV + P_BAT + P_GEN − Σ</span></div>`
    ].join('');
    el.querySelectorAll('[data-src]').forEach(b => b.onclick = () => { hs.src = b.dataset.src; source(); });
    const sw = [['QF0', 'hmi.sw.qf0', 'I', 'OF'], c.island || c.gen ? ['KM-PCC', 'hmi.sw.pcc', s.mode === 'GRID' ? 'I' : 'O', 'KM_PCC_FB'] : null, c.gen ? ['KM-GEN', 'hmi.sw.gen', s.mode === 'GEN' ? 'I' : 'O', 'KM_GEN_FB'] : null, ['QF-RL', 'hmi.sw.qfrl', s.rlFault ? 'TRIP' : 'I', 'QF_RL_SD'], ...Array.from({ length: c.rlSteps }, (_, i) => ['KM-RL' + (i + 1), ['hmi.sw.step', { n: i + 1 }], i < s.rlOn && !s.rlFault ? 'I' : 'O', 'KM_RL' + (i + 1) + '_FB']), ['KM-M1', 'hmi.sw.kmm1', 'I', 'KM_M1_FB'], ['VFD-M1', 'hmi.sw.vfd', s.m1Run ? (S.m1Fb ? 'RUN' : 'WAIT') : 'STOP', 'VFD_RUN_FB']].filter(Boolean);
    const stTxt = x => ({ I: t('hmi.st.closed'), O: t('hmi.st.open'), TRIP: 'TRIP', RUN: t('hmi.st.run'), WAIT: t('hmi.st.wait'), STOP: t('hmi.st.stop') }[x]);
    $('#h-sw').innerHTML = `<tr><th>${t('col.device')}</th><th>${t('col.status')}</th><th>${t('col.fbDi')}</th></tr>` + sw.map(x => `<tr><td><span class="mono">${x[0]}</span> <span class="small muted">${Array.isArray(x[1]) ? t(x[1][0], x[1][1]) : t(x[1])}</span></td><td><span class="st ${x[2] === 'TRIP' ? 'ko' : x[2] === 'I' || x[2] === 'RUN' ? 'ok' : x[2] === 'WAIT' ? 'unk' : ''}" style="${x[2] === 'O' || x[2] === 'STOP' ? 'background:var(--surface2);color:var(--ink2)' : ''}">${stTxt(x[2])}</span></td><td class="mono small">${x[3]}</td></tr>`).join('');
    $('#h-alarms').innerHTML = S.alarms.length ? S.alarms.map(a => `<div class="st ko" style="margin:2px 0;display:flex">${a.t} · ${SG.esc(t(a.k, a.v))}${a.ack ? ' (' + t('hmi.acked') + ')' : ''}</div>`).join('') : `<span class="muted">${t('hmi.noAlarm')}</span>`;
    $('#h-log').innerHTML = S.log.map(l => `<div><span class="t">${l.t}</span><span class="${l.lvl}">${SG.esc(evText(l))}</span></div>`).join('');
    const cmd = hs.cmd;
    $('#h-cmd').innerHTML = cmd ? `<div class="note ${cmd.ok ? 'info' : 'ko'} small" style="margin-top:6px"><b>${SG.esc(t(cmd.tk, cmd.tv))} — ${t(cmd.ok ? 'hmi.accepted' : 'hmi.rejected')}</b><div style="margin-top:4px"><b>${t('hmi.conds')}</b>${cmd.conds.map(x => `<div>${x[2] ? '✓' : '✕'} ${SG.esc(t(x[0], x[1]))}</div>`).join('')}</div><div style="margin-top:4px"><b>${t('hmi.path')}</b> ${cmd.path.map(p => SG.esc(t(p))).join(' → ')}</div>${cmd.fk ? `<div style="margin-top:4px"><b>${t('hmi.fb')}</b> ${SG.esc(t(cmd.fk))}</div>` : ''}</div>` : `<p class="small muted">${t('hmi.cmdHint')}</p>`;
    const vals = { 'PV-INV': SG.fx(o.pv) + ' kW', PCS: SG.fx(o.bat) + ' kW', BAT: Math.round(s.soc) + ' %', LP: SG.fx(o.loads.lp) + ' kW', RL: SG.fx(o.loads.rl) + ' kW', M1: SG.fx(o.loads.m1) + ' kW' };
    if (SG.dev('PM-PCC')) vals['PM-PCC'] = SG.fx(o.grid) + ' kW'; if (c.gen) vals.GEN = SG.fx(o.gen) + ' kW'; if (c.ev) vals.EVSE = SG.fx(o.loads.ev) + ' kW';
    D.values = vals; D.states = { 'KM-PCC': s.mode === 'GRID' ? 'on' : 'off', 'KM-GEN': s.mode === 'GEN' ? 'on' : 'off', 'QF-RL': s.rlFault ? 'trip' : 'on', 'KM-RL': s.rlOn > 0 && !s.rlFault ? 'on' : 'off', 'VFD-M1': s.m1Run ? 'on' : 'off' }; D.render();
    chart();
  }
  function source() {
    const k = hs.src; const box = $('#h-src');
    if (!k) { box.innerHTML = `<h3>${t('hmi.srcT')}</h3><p class="small muted" style="margin-top:6px">${t('hmi.srcHint')}</p>`; return; }
    const x = SG.SOURCES[k]; const d = SG.dev(x.dev); const l = x.link ? SG.link(x.link) : null; const s = S.s;
    const bad = (k === 'grid' || k === 'uf') && s.commPM || k === 'pv' && s.commInv;
    box.innerHTML = `<h3>${t('hmi.srcOf', { n: t('hmi.src.' + k) })}</h3><dl class="kv small" style="margin-top:8px"><dt>${t('hmi.srcDev')}</dt><dd>${SG.devChip(x.dev)} ${SG.esc(d ? d.n : '')}</dd><dt>${t('hmi.srcLink')}</dt><dd>${l ? SG.esc(l.label) : t('hmi.srcRtu')}</dd><dt>${t('hmi.srcHow')}</dt><dd>${SG.esc(t('hmi.src.' + k + '.how'))}</dd><dt>${t('hmi.srcQ')}</dt><dd>${bad ? SG.stChip('ko', t('hmi.srcBad')) : SG.stChip('ok', t('hmi.srcGood'))}</dd></dl><div class="row" style="margin-top:8px">${x.trace ? `<button class="btn sm" data-goto="diagram" data-arg="trace:${x.trace}">${t('hmi.srcTrace')} →</button>` : `<button class="btn sm" data-goto="diagram" data-arg="${x.dev}">${t('hmi.srcDevBtn')} →</button>`}</div>`;
  }
  source(); paint();
  if (SG.hmiTimer) clearInterval(SG.hmiTimer);
  SG.hmiTimer = setInterval(() => { if (!document.body.contains($('#h-kpi'))) { clearInterval(SG.hmiTimer); return; } if (hs.run) { S.step(hs.speed * 0.5); paint(); } }, 500);
};

/* ======================= 9. BOM ======================= */
SG.bomQty = function (d) {
  const c = SG.cfg, r = SG.r;
  return { 'CT-PCC': c.phases === 3 ? 3 : 1, 'KM-RL': c.rlSteps, KA: r.io.KA, DI: r.io.mDI, DO: r.io.mDO, AIO: r.io.mAI, ES: 2, 'LORA-S': 3 }[d.id] || 1;
};
SG.render.bom = function (el, arg) {
  const st = SG.bomState = SG.bomState || { lb: 0, br: '' };
  const t = SG.t;
  const devs = SG.devices.filter(SG.devOn);
  const r = SG.r;
  const extra = [
    ['ACC-1', 'cab', { di: r.io.DI, do: r.io.DO, a: r.io.AI + r.io.AO }], ['ACC-2', 'cab'], ['ACC-3', 'comm', { e: r.eth.n, s: r.rs485.slaves.length }], ['ACC-4', 'ctrl'], ['ACC-5', 'cab']
  ];
  /* BOM giữ nhánh theo mã ổn định (nhánh gốc tiếng Việt) để bộ lọc không phụ thuộc ngôn ngữ */
  const brKey = d => (SG._i18nBase.devices.find(x => x.id === d.id) || d).br;
  const brs = [...new Set(devs.map(brKey))];
  el.innerHTML = SG.headK('bom') + `
  <div class="row"><select id="b-lb" style="width:auto" aria-label="${SG.esc(t('lib.lbAria'))}"><option value="0">${t('lib.allLabels')}</option>${[1, 2, 3].map(lb => `<option value="${lb}">${t('lb.short' + lb)}</option>`).join('')}</select>
  <select id="b-br" style="width:auto" aria-label="${SG.esc(t('bom.brAria'))}"><option value="">${t('bom.allBr')}</option>${brs.map(b => `<option value="${SG.esc(b)}">${SG.esc(devs.find(d => brKey(d) === b).br)}</option>`).join('')}</select>
  <button class="btn" id="b-copy">${t('bom.copy')}</button><span class="small muted" id="b-msg"></span></div>
  <div class="sumrow">${[1, 2, 3].map(lb => `<span class="chip lb${lb}">${SG.lbl(lb)}: ${devs.filter(d => d.lb === lb).length}</span>`).join('')}</div>
  <div class="tbl-wrap"><table id="b-t"></table></div>
  <div class="card"><h3>${t('bom.acc')}</h3><div class="tbl-wrap" style="margin-top:8px"><table><tr><th>${t('col.code')}</th><th>${t('col.item')}</th><th>${t('col.group')}</th><th>${t('col.func')}</th><th>${t('col.req')}</th><th>${t('col.verif')}</th></tr>${extra.map(x => `<tr><td class="mono">${x[0]}</td><td>${SG.esc(t('bom.' + x[0] + '.n'))}</td><td>${t('bom.grp.' + x[1])}</td><td class="small">${SG.esc(t('bom.' + x[0] + '.f'))}</td><td class="small">${SG.esc(t('bom.' + x[0] + '.r', x[2]))}</td><td><span class="st unk">${t('bom.toCheck')}</span></td></tr>`).join('')}</table></div></div>`;
  el.querySelector('#b-lb').value = st.lb; el.querySelector('#b-br').value = st.br;
  const keySpec = d => { const ty = SG.types[d.t]; return (ty.params || []).filter(p => !p.adv).map(p => { const v = SG.specVal(d, p.k); return v ? p.n + ': ' + v : null; }).filter(Boolean).slice(0, 3).join(' · ') || Object.keys(d.spec || {}).slice(0, 2).map(k => SG.specVal(d, k)).join(' · '); };
  const rows = () => devs.filter(d => (!st.lb || d.lb == st.lb) && (!st.br || brKey(d) === st.br) && d.id !== 'BUS' || (d.id === 'BUS' && !st.lb && !st.br));
  const draw = () => {
    el.querySelector('#b-t').innerHTML = `<tr><th>${t('col.code')}</th><th>${t('col.device')}</th><th>${t('col.label')}</th><th class="num">${t('col.qty')}</th><th>${t('col.func')}</th><th>${t('col.specReq')}</th><th>${t('col.acc')}</th><th>${t('col.verif')}</th><th></th></tr>` + rows().map(d => { const ty = SG.types[d.t]; const acc = (ty.accessories || []).concat(d.acc || []); return `<tr style="${d.id === arg ? 'background:var(--accent-soft)' : ''}" id="bom-${d.id}"><td class="mono"><b>${d.id}</b></td><td>${SG.esc(d.n)}${(a => a ? `<div class="small muted"><i lang="${a.l}">${SG.esc(a.t)}</i></div>` : '')(SG.typeAltShown(d.t))}</td><td>${SG.lbChip(d.lb)}</td><td class="num mono">${SG.bomQty(d)}</td><td class="small">${SG.T(d.why)}</td><td class="small">${SG.esc(keySpec(d))}</td><td class="small">${acc.slice(0, 3).map(a => SG.T(a)).join('<br>')}</td><td><span class="st unk">${t('bom.assumed')}</span></td><td><div class="stack" style="gap:4px">${d.nodiag ? '' : `<button class="btn sm" data-goto="diagram" data-arg="${d.id}">${t('w.diagram')}</button>`}<button class="btn sm" data-goto="library" data-arg="${d.id}">${t('w.sheet')}</button></div></td></tr>`; }).join('');
  };
  el.querySelector('#b-lb').onchange = e => { st.lb = +e.target.value; draw(); };
  el.querySelector('#b-br').onchange = e => { st.br = e.target.value; draw(); };
  el.querySelector('#b-copy').onclick = () => {
    const strip = s => String(s).replace(/<[^>]+>/g, '').replace(/\{\{[a-z0-9_]+\|?([^}]*)\}\}/g, '$1').replace(/"/g, '""');
    const head = [t('col.code'), t('col.device'), t('bom.altName'), t('col.label'), t('col.qty'), t('col.func'), t('col.specReq'), t('col.verif')].join(';');
    const csv = [head].concat(rows().map(d => [d.id, d.n, SG.typeAlt(d.t), d.lb, SG.bomQty(d), strip(d.why), strip(keySpec(d)), t('bom.assumed')].map(x => '"' + strip(x) + '"').join(';'))).join('\n');
    const msg = el.querySelector('#b-msg');
    navigator.clipboard && navigator.clipboard.writeText(csv).then(() => { msg.textContent = t('bom.copied', { n: rows().length }); }).catch(() => { msg.textContent = t('bom.copyFail'); });
  };
  draw();
  if (arg) setTimeout(() => { const tr = el.querySelector('#bom-' + CSS.escape(arg)); if (tr) tr.scrollIntoView({ block: 'center' }); }, 50);
};

/* ======================= 10. THUẬT NGỮ ======================= */
SG.render.glossary = function (el, arg) {
  const t = SG.t;
  const cats = [...new Set(Object.values(SG.glossary).map(g => g.cat))];
  el.innerHTML = SG.headK('gl') + `
  <div class="row"><input type="text" id="g-q" placeholder="${SG.esc(t('gl.filterPh'))}" style="max-width:300px" aria-label="${SG.esc(t('gl.filterPh'))}"><select id="g-c" style="width:auto" aria-label="${SG.esc(t('gl.catAria'))}"><option value="">${t('gl.allCats')}</option>${cats.map(c => `<option>${SG.esc(c)}</option>`).join('')}</select></div>
  <div class="tbl-wrap"><table id="g-t"></table></div>
  <div class="card"><h3>${t('gl.refs')}</h3><p class="small muted">${t('gl.refsLead')}</p>
    <div class="grid g2" style="margin-top:10px">${SG.refs.map(g => `<div><h4>${SG.esc(g.g)}</h4><ul class="small">${g.items.map(i => `<li><b>${SG.esc(i[0])}</b> — ${SG.esc(i[1])}${i[2] ? ` · <a href="${i[2]}" target="_blank" rel="noopener">${i[2].replace('https://', '')}</a>` : ''}</li>`).join('')}</ul></div>`).join('')}</div></div>`;
  const order = ['vi', 'en', 'fr'].sort((a, b) => (a === SG.lang ? -1 : b === SG.lang ? 1 : 0));
  const draw = () => {
    const q = el.querySelector('#g-q').value.toLowerCase(), cat = el.querySelector('#g-c').value;
    el.querySelector('#g-t').innerHTML = `<tr>${order.map(l => `<th lang="${l}">${SG.LANGS[l].n}</th>`).join('')}<th>${t('gl.abbr')}</th><th>${t('gl.def')}</th><th>${t('gl.conf')}</th></tr>` + Object.entries(SG.glossary).filter(([id, g]) => (!cat || g.cat === cat) && (!q || (order.map(l => SG.termName(id, l)).join(' ') + g.abbr + g.def).toLowerCase().includes(q))).map(([id, g]) => `<tr id="term-${id}" style="${id === arg ? 'background:var(--accent-soft)' : ''}">${order.map((l, i) => i === 0 ? `<td lang="${l}"><b>${SG.esc(SG.termName(id, l))}</b><div class="small muted">${SG.esc(g.cat)}</div></td>` : `<td lang="${l}"><i>${SG.esc(SG.termName(id, l))}</i></td>`).join('')}<td class="mono small">${SG.esc(g.abbr)}</td><td class="small">${SG.esc(g.def)}</td><td class="small">${SG.esc(g.conf || '')}</td></tr>`).join('');
  };
  el.querySelector('#g-q').oninput = draw; el.querySelector('#g-c').onchange = draw; draw();
  if (arg) setTimeout(() => { const tr = el.querySelector('#term-' + arg); if (tr) tr.scrollIntoView({ block: 'center' }); }, 50);
};
