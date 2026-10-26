/* TRANG 4 MỞ RỘNG: Cấu hình hệ thống · Thiết bị đầu vào · Gợi ý sản phẩm · Tương thích theo cặp · I/O & truyền thông · Xuất
   (chuỗi: i18n/<lang>/pages.js, khóa sel.* in.* pdf.* sg.* pp.* tio.* ex.*) */
SG.SELTABS = ['sys', 'input', 'suggest', 'pairs', 'io', 'export'];
SG.renderSys = SG.render.selector;
SG.render.selector = function (el, arg) {
  const st = SG.selSt = SG.selSt || { tab: 'input' };
  const t = SG.t;
  if (arg && SG.SELTABS.includes(arg)) st.tab = arg;
  el.innerHTML = SG.headK('sel') +
    `<div class="tabs" id="sel-tabs">${SG.SELTABS.map(k => `<button data-t="${k}" class="${k === st.tab ? 'on' : ''}">${t('sel.tab.' + k)}</button>`).join('')}</div><div id="sel-body" class="stack" style="gap:14px"></div><div class="row small muted" style="gap:14px">${SG.ST4K.map(s => SG.st4(s)).join('')}<span>${t('sel.verifRule')}</span></div>`;
  el.querySelectorAll('#sel-tabs [data-t]').forEach(b => b.onclick = () => { st.tab = b.dataset.t; SG.render.selector(el); });
  const body = el.querySelector('#sel-body');
  SG.refresh();
  ({ sys: () => SG.renderSys(body), input: () => SG.tabInput(body), suggest: () => SG.tabSuggest(body), pairs: () => SG.tabPairs(body), io: () => SG.tabIO(body), export: () => SG.tabExport(body) })[st.tab]();
};
/* nguồn thông số: tài liệu lưu {file, page} (không lưu câu đã dịch) */
SG.srcRef = x => x && x.file ? x.file + (x.page ? ' — ' + SG.t('w.page', { p: x.page }) : ' — ' + SG.t('pdf.manualFromDoc')) : (x && x.ref) || '';
SG.srcChip = x => { const s = x && x.s || 'manual', ref = SG.srcRef(x); return `<span class="chip" title="${SG.esc(ref)}" style="${s === 'doc' || s === 'catalog' ? 'border-color:var(--ok);color:var(--ok)' : s === 'assume' ? 'border-style:dashed' : ''}">${SG.srcName(s)}${ref ? ' · ' + SG.esc(ref) : ''}</span>`; };

/* ---------------- TAB: THIẾT BỊ ĐẦU VÀO ---------------- */
SG.tabInput = function (el) {
  const P = SG.proj, t = SG.t;
  const secCard = sec => {
    const D = SG.PFIELDS[sec], S = P[sec];
    const stSel = sec === 'grid' ? `<span class="chip">${t('in.gridExisting')}</span>` : `<select data-status="${sec}" style="width:auto" aria-label="${SG.esc(t('in.statusAria', { n: SG.secName(sec) }))}">${['have', 'select', 'none'].map(o => `<option value="${o}" ${S.status === o ? 'selected' : ''}>${t('in.st.' + o)}</option>`).join('')}</select>`;
    return `<details class="card" open><summary>${SG.secName(sec)}</summary><div class="row" style="margin:8px 0">${stSel}${sec !== 'grid' ? `<button class="btn sm" data-pdf="${sec}">${t('in.pdfBtn')}</button>` : ''}<span class="small muted">${S.status === 'have' ? t('in.haveHint') : S.status === 'select' ? t('in.selectHint') : ''}</span></div>
      <div id="pdf-${sec}"></div>
      <div class="tbl-wrap"><table><tr><th>${t('col.param')}</th><th style="width:170px">${t('col.value')}</th><th>${t('col.unit')}</th><th>${t('col.source')}</th></tr>${D.f.map(([k, u]) => { const x = S[k] || { v: '', s: 'manual' }; const inp = u && u.startsWith('sel:') ? `<select data-f="${sec}.${k}">${u.slice(4).split('|').map(o => `<option value="${o}" ${x.v === o ? 'selected' : ''}>${t('pf.' + sec + '.' + k + '.' + o)}</option>`).join('')}</select>` : `<input type="${u === 'text' ? 'text' : 'number'}" step="any" data-f="${sec}.${k}" value="${SG.esc(x.v == null ? '' : x.v)}" aria-label="${SG.esc(SG.fieldName(sec, k))}">`; return `<tr><td>${SG.fieldName(sec, k)}</td><td>${inp}</td><td class="small muted">${u && !u.startsWith('sel:') && u !== 'text' ? (k === 'overload' ? t('in.ovUnit') : u) : ''}</td><td>${SG.srcChip(x)}</td></tr>`; }).join('')}</table></div></details>`;
  };
  el.innerHTML = SG.impactHtml() + `<div class="note info">${t('in.note')}</div>
  <div class="grid g2" style="align-items:start">${['grid', 'pv', 'bat', 'motor'].map(secCard).join('')}</div>
  <div class="card"><h3>${t('in.loads')}</h3><p class="small muted">${t('in.loadsLead')}</p>
    <div class="tbl-wrap" style="margin-top:8px"><table id="ld-t"><tr><th>${t('col.code')}</th><th>${t('col.name')}</th><th>P (kW)</th><th>U (V)</th><th>${t('in.ph')}</th><th>${t('col.type')}</th><th>${t('in.istart')}</th><th>${t('in.prio')}</th><th>${t('in.ctrl')}</th><th>${t('in.steps')}</th><th>${t('in.meas')}</th><th></th></tr>
    ${P.loads.map((l, i) => `<tr><td class="mono">${l.id}</td><td><input type="text" data-l="${i}.n" value="${SG.esc(SG.loadName(l))}" aria-label="${SG.esc(t('col.name'))}"></td><td><input type="number" step="any" data-l="${i}.P" value="${l.P}" aria-label="P"></td><td><input type="number" data-l="${i}.U" value="${l.U}" aria-label="U"></td><td><select data-l="${i}.phases" aria-label="${SG.esc(t('in.ph'))}"><option ${+l.phases === 3 ? 'selected' : ''}>3</option><option ${+l.phases === 1 ? 'selected' : ''}>1</option></select></td>
      <td><select data-l="${i}.type" aria-label="${SG.esc(t('col.type'))}">${SG.LOADTYPES.map(k => `<option value="${k}" ${l.type === k ? 'selected' : ''}>${t('lt.' + k)}</option>`).join('')}</select></td><td><input type="number" step="any" data-l="${i}.Istart" value="${l.Istart == null ? '' : l.Istart}" placeholder="—" aria-label="${SG.esc(t('in.istart'))}"></td>
      <td><input type="checkbox" data-l="${i}.prio" ${l.prio ? 'checked' : ''} aria-label="${SG.esc(t('in.prio'))}"></td><td><select data-l="${i}.ctrl" aria-label="${SG.esc(t('in.ctrl'))}">${SG.LOADCTRL.map(k => `<option value="${k}" ${l.ctrl === k ? 'selected' : ''}>${t('lc.' + k)}</option>`).join('')}</select></td>
      <td><input type="number" min="1" max="8" data-l="${i}.steps" value="${l.steps || 1}" style="width:60px" aria-label="${SG.esc(t('in.steps'))}"></td><td><input type="checkbox" data-l="${i}.meas" ${l.meas ? 'checked' : ''} aria-label="${SG.esc(t('in.meas'))}"></td><td><button class="btn sm" data-del="${i}" aria-label="${SG.esc(t('in.del'))}">✕</button></td></tr>`).join('')}</table></div>
    <div class="row" style="margin-top:8px"><button class="btn" id="ld-add">+ ${t('in.add')}</button><button class="btn" id="pj-reset">${t('in.reset')}</button><span class="small muted">${t('in.total', { a: SG.fx(P.loads.reduce((a, l) => a + (+l.P || 0), 0)), m: SG.num(SG.pv('motor', 'P') || 0) })}</span></div></div>`;
  const rerender = () => SG.render.selector(document.getElementById('page'));
  el.querySelectorAll('[data-f]').forEach(inp => inp.onchange = () => { const [sec, k] = inp.dataset.f.split('.'); const raw = inp.value; const isNum = inp.type === 'number'; const before = SG.pairSnap(); SG.proj[sec][k] = { v: raw === '' ? null : isNum ? +raw : raw, s: 'manual' }; SG.saveProj(); SG.impactNote('imp.changed', { s: SG.secName(sec), f: SG.fieldName(sec, k) }, before); rerender(); });
  el.querySelectorAll('[data-status]').forEach(s => s.onchange = () => { SG.proj[s.dataset.status].status = s.value; SG.saveProj(); rerender(); });
  el.querySelectorAll('[data-l]').forEach(inp => inp.onchange = () => { const [i, k] = inp.dataset.l.split('.'); const l = SG.proj.loads[+i]; l[k] = inp.type === 'checkbox' ? inp.checked : (inp.type === 'number' ? (inp.value === '' ? null : +inp.value) : (k === 'phases' ? +inp.value : inp.value)); SG.saveProj(); rerender(); });
  el.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { SG.proj.loads.splice(+b.dataset.del, 1); SG.saveProj(); rerender(); });
  el.querySelector('#ld-add').onclick = () => { const n = Math.max(0, ...SG.proj.loads.map(l => +l.id.slice(1) || 0)) + 1; SG.proj.loads.push({ id: 'L' + n, nk: 'new', n: '', P: 1, U: 400, phases: 3, type: 'R', Istart: null, prio: false, ctrl: 'onoff', meas: false, steps: 1 }); SG.saveProj(); rerender(); };
  el.querySelector('#pj-reset').onclick = () => { SG.proj = SG.defaultProj(); SG.saveProj(); rerender(); };
  el.querySelectorAll('[data-pdf]').forEach(b => b.onclick = () => SG.pdfImport(b.dataset.pdf, el.querySelector('#pdf-' + b.dataset.pdf), rerender));
};

/* ---------------- NHẬP PDF ---------------- */
SG.loadPdfJs = function () {
  if (window.pdfjsLib) return Promise.resolve();
  const add = src => new Promise((ok, ko) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => ko(new Error(SG.t('pdf.loadFail', { s: src }))); document.head.appendChild(s); });
  const base = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  return add(base + 'pdf.min.js').then(() => add(base + 'pdf.worker.min.js')).then(() => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = base + 'pdf.worker.min.js'; });
};
SG.pdfImport = function (sec, box, done) {
  const t = SG.t;
  box.innerHTML = `<div class="card" style="background:var(--surface3)"><b>${t('pdf.title', { n: SG.secName(sec) })}</b><p class="small muted">${t('pdf.lead')}</p><input type="file" accept="application/pdf" id="pdf-file-${sec}" aria-label="${SG.esc(t('pdf.choose'))}"><div id="pdf-res-${sec}" style="margin-top:8px"></div></div>`;
  box.querySelector('input').onchange = async e => {
    const f = e.target.files[0]; if (!f) return; const out = box.querySelector('#pdf-res-' + sec);
    out.innerHTML = `<p class="small">${t('pdf.reading')}</p>`;
    try {
      await SG.loadPdfJs();
      const doc = await pdfjsLib.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise;
      const lines = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const tc = await (await doc.getPage(i)).getTextContent(); const rows = {};
        tc.items.forEach(it => { const y = Math.round(it.transform[5] / 3); (rows[y] = rows[y] || []).push(it); });
        Object.keys(rows).sort((a, b) => b - a).forEach(y => lines.push({ p: i, t: rows[y].sort((a, b) => a.transform[4] - b.transform[4]).map(x => x.str).join(' ').replace(/\s+/g, ' ').trim() }));
      }
      const res = SG.EXTRACT[sec].map(([k, re, u]) => {
        const c = [];
        lines.forEach((L, i) => { if (!re.test(L.t)) return; if (u === 'text') { c.push({ v: L.t.slice(0, 80), p: L.p, s: L.t }); return; } let nums = (L.t.replace(re, ' ').match(/[-−–]?\d+(?:[.,]\d+)?/g) || []); if (!nums.length && lines[i + 1] && lines[i + 1].p === L.p) nums = lines[i + 1].t.match(/[-−–]?\d+(?:[.,]\d+)?/g) || []; nums.slice(0, 6).forEach(n => c.push({ v: +n.replace(/[−–]/, '-').replace(',', '.'), p: L.p, s: L.t })); });
        return { k, u, c: c.slice(0, 8) };
      });
      out.innerHTML = `<p class="small"><b>${SG.esc(f.name)}</b> — ${t('pdf.stats', { p: doc.numPages, l: lines.length })}${lines.length < 5 ? ' ' + t('pdf.image') : ''}</p>
        <div class="tbl-wrap"><table><tr><th>${t('col.param')}</th><th>${t('pdf.cands')}</th><th>${t('pdf.confirmed')}</th><th>${t('pdf.ok')}</th></tr>${res.map(r => `<tr><td>${SG.fieldName(sec, r.k)}</td><td class="small">${r.c.length ? r.c.map((x, j) => `<label class="cb"><input type="radio" name="pc-${r.k}" value="${SG.esc(x.v)}" data-pg="${x.p}" ${j === 0 && r.c.length === 1 ? 'checked' : ''}> <span><b>${SG.esc(typeof x.v === 'number' ? SG.num(x.v) : x.v)}</b> · ${t('w.page', { p: x.p })} · <span class="muted">${SG.esc(x.s.slice(0, 90))}</span></span></label>`).join('') : `<span class="muted">${t('pdf.none')}</span>`}</td><td><input type="${r.u === 'text' ? 'text' : 'number'}" step="any" data-pv="${r.k}" style="width:110px" aria-label="${SG.esc(SG.fieldName(sec, r.k))}"></td><td><input type="checkbox" data-ok="${r.k}" aria-label="${SG.esc(t('pdf.ok'))}"></td></tr>`).join('')}</table></div>
        <div class="row" style="margin-top:8px"><button class="btn pri" id="pdf-save-${sec}">${t('pdf.save')}</button><span class="small muted">${t('pdf.saveHint')}</span></div>`;
      out.querySelectorAll('input[type=radio]').forEach(r => r.onchange = () => { const inp = out.querySelector(`[data-pv="${r.name.slice(3)}"]`); inp.value = r.value; inp.dataset.pg = r.dataset.pg; });
      out.querySelectorAll('input[type=radio]:checked').forEach(r => r.onchange());
      out.querySelector('#pdf-save-' + sec).onclick = () => {
        let n = 0; const before = SG.pairSnap();
        out.querySelectorAll('[data-ok]:checked').forEach(cb => { const k = cb.dataset.ok, inp = out.querySelector(`[data-pv="${k}"]`); if (inp.value === '') return; SG.proj[sec][k] = { v: inp.type === 'number' ? +inp.value : inp.value, s: 'doc', file: f.name, page: inp.dataset.pg ? +inp.dataset.pg : null }; n++; });
        SG.saveProj(); SG.impactNote('imp.pdf', { n, s: SG.secName(sec), f: f.name }, before); done();
      };
    } catch (err) { out.innerHTML = `<div class="note ko small">${t('pdf.err', { e: SG.esc(err.message) })}</div>`; }
  };
};

/* ---------------- TÁC ĐỘNG KHI THAY ĐỔI (lưu khóa, dịch lúc hiển thị) ---------------- */
SG.pairSnap = () => { const m = {}; SG.pairs().forEach(p => { m[p.a + '|' + (p.slot || p.b)] = { st: p.st, b: p.b }; }); return m; };
SG.impactNote = function (k, v, before) {
  if (!before) { SG._impact = { k, v, list: [] }; return; }
  SG.refresh(); const after = SG.pairSnap(); const L = [];
  Object.keys(after).forEach(key => { const a = before[key], b = after[key]; if (!a) L.push([null, b.st, key.split('|')[0] + ' ↔ ' + b.b]); else if (a.st !== b.st) L.push([a.st, b.st, key.split('|')[0] + ' ↔ ' + b.b]); });
  SG._impact = { k, v, list: L };
};
SG.impactHtml = () => { const I = SG._impact; if (!I) return ''; const t = SG.t; return `<div class="note info small"><b>${t('imp.title')}</b> ${SG.esc(t(I.k, I.v))}.${I.list.length ? '<ul>' + I.list.map(x => `<li>${SG.esc(x[2])}: ${x[0] ? SG.esc(SG.st4n(x[0])) + ' → ' : t('imp.new') + ' '}${SG.esc(SG.st4n(x[1]))}</li>`).join('') + '</ul>' : ' ' + t('imp.recalc')} <button class="btn sm" onclick="SG._impact=null;this.parentNode.remove()">${t('w.close')}</button></div>`; };

/* ---------------- TAB: GỢI Ý SẢN PHẨM ---------------- */
SG.SLOTKEYS = {
  pvinv: [['Pac', 'W'], ['phases', ''], ['Vdcmax', 'V'], ['mpptMin', 'V'], ['mpptMax', 'V'], ['nMppt', ''], ['stringsPerMppt', ''], ['ImaxMppt', 'A'], ['IscMaxMppt', 'A'], ['PdcMax', 'Wc'], ['comm', 'list']],
  pcs: [['P', 'W'], ['phases', ''], ['VbatMin', 'V'], ['VbatMax', 'V'], ['IchMax', 'A'], ['IdisMax', 'A'], ['gridForming', 'bool'], ['comm', 'list']],
  vfd: [['Umin', 'V'], ['Umax', 'V'], ['phasesIn', ''], ['InHD', 'A'], ['InND', 'A'], ['ovHD', '%'], ['diLogic', 'list'], ['comm', 'list']],
  'meter-pcc': [['Umax', 'V'], ['Iin', 'text'], ['Idirect', 'A'], ['acc', 'text'], ['comm', 'list']],
  plc: [['diBase', ''], ['doBase', ''], ['doType', 'text'], ['aiBase', ''], ['expModules', ''], ['comm', 'list'], ['serial', 'text']],
  hmi: [['drivers', 'list'], ['comm', 'list']], switch: [['ports', ''], ['Vin', 'text']], psu: [['Iout', 'A'], ['dcok', 'bool']]
};
SG.SLOTKEYS['meter-branch'] = SG.SLOTKEYS['meter-pcc'];
SG.tabSuggest = function (el) {
  const R = SG._R, t = SG.t;
  const card = s => {
    const sg = SG.suggest(s.id); const cur = SG.proj.choices[s.id];
    const chosen = SG.chosen(s.id);
    const prodBox = c => {
      const p = c.p, isSel = chosen && chosen.id === p.id;
      const main = Object.entries(p.specs).slice(0, 8).map(([k, x]) => `<span class="chip" title="${SG.esc((x && x.ref) || '')}${x && x.p ? ' — ' + SG.esc(t('w.page', { p: x.p })) : ''}">${k}: ${SG.esc(Array.isArray(x && x.v) ? x.v.join(', ') : (x && x.v != null ? (typeof x.v === 'number' ? SG.num(x.v) : x.v) : x))}${x && x.u ? ' ' + x.u : ''}</span>`).join(' ');
      return `<div class="card stack" style="${isSel ? 'border-color:var(--accent);border-width:2px' : ''}"><div class="row" style="justify-content:space-between"><div><b>${SG.esc(p.brand)} — ${SG.esc(p.model)}</b><div class="small muted">${SG.esc(p.role || '')}${p.verifiedBy === 'user' ? ' · ' + t('sg.userDev') : ''}</div></div>${SG.st4(c.st)}</div>
        <div class="row">${main}</div>
        <dl class="kv small"><dt>${t('sg.sides')}</dt><dd>${SG.esc(t('sg.side.' + s.id))}</dd><dt>${t('sg.iface')}</dt><dd>${SG.esc(p.iface || '—')}</dd>
        <dt>${t('sg.software')}</dt><dd>${(p.software || []).map(x => SG.esc(x.n) + ' — ' + SG.esc(x.role) + (x.lang && x.lang !== '—' ? ' (' + SG.esc(x.lang) + ')' : '') + ', ' + t('sg.license') + ' ' + SG.esc(x.lic) + (x.verified === false ? ` <span class="chip">${t('sg.notChecked')}</span>` : '')).join('<br>') || '—'}</dd>
        <dt>${t('sg.docs')}</dt><dd>${(p.docs || []).map(x => `<a href="${x.url}" target="_blank" rel="noopener">${SG.esc(x.t)}</a> · ${t('sg.checkedOn', { d: x.date })}`).join('<br>') || `<span class="muted">${t('sg.noDocs')}</span>`}</dd></dl>
        <details><summary class="small">${t('sg.reasons', { n: c.rows.filter(r => r.st === 'miss').length })}</summary><div class="tbl-wrap" style="margin-top:6px"><table>${c.rows.map(r => `<tr><td>${SG.st4(r.st, t('sg.short.' + r.st))}</td><td class="small"><b>${SG.esc(r.n)}</b><br>${t('sg.need')} ${SG.esc(r.need)}<br>${SG.esc(r.d || '')}</td></tr>`).join('')}</table></div>${(p.notes || []).length ? '<ul class="small">' + p.notes.map(n => '<li>' + SG.esc(n) + '</li>').join('') + '</ul>' : ''}</details>
        <div class="row">${isSel ? `<span class="small"><b>${t('sg.inUse')}</b>${cur ? '' : ' ' + t('sg.auto')}</span>` : `<button class="btn sm" data-choose="${s.id}" data-pid="${p.id}">${t('sg.choose')}</button>`}</div></div>`;
    };
    if (s.reqOnly) return SG.protCard(R);
    return `<div class="card stack" id="slot-${s.id}"><div class="row" style="justify-content:space-between"><div><h3>${SG.esc(SG.slotName(s.id))}</h3><span class="small muted"><i>${SG.esc(SG.slotAlt(s.id))}</i></span></div><div class="row"><button class="btn sm" data-custom="${s.id}">${t('sg.custom')}</button>${cur ? `<button class="btn sm" data-choose="${s.id}" data-pid="">${t('sg.unchoose')}</button>` : ''}</div></div>
      <details ${sg.cands.length ? '' : 'open'}><summary class="small">${t('sg.reqs', { n: sg.reqs.length })}</summary><div class="tbl-wrap" style="margin-top:6px"><table>${sg.reqs.map(q => `<tr><td style="width:40%">${SG.esc(q.n)}</td><td>${SG.esc(q.txt)}</td></tr>`).join('')}</table></div></details>
      <div id="custom-${s.id}"></div>
      ${sg.cands.length ? `<div class="grid ${sg.cands.length > 1 ? 'g2' : ''}">${sg.cands.map(prodBox).join('')}</div>` : `<div class="note">${t('sg.noCand')}</div>`}
      ${sg.rejected.length ? `<details><summary class="small">${t('sg.rejected', { n: sg.rejected.length })}</summary>${sg.rejected.map(c => `<div class="small" style="margin-top:6px"><b>${SG.esc(c.p.brand)} ${SG.esc(c.p.model)}</b> — ${c.rows.filter(r => r.st === 'ko').map(r => SG.esc(r.n + ': ' + r.d)).join('; ')}</div>`).join('')}</details>` : ''}</div>`;
  };
  const slots = SG.SLOTS.filter(s => s.when());
  const notNeeded = SG.SLOTS.filter(s => !s.when());
  el.innerHTML = SG.impactHtml() + `<div class="note small">${t('sg.catalog', { n: SG.products.length })}${notNeeded.length ? ' ' + t('sg.notNeeded', { l: notNeeded.map(s => SG.slotName(s.id)).join(', ') }) : ''}</div>` + slots.map(card).join('');
  const rerender = () => SG.render.selector(document.getElementById('page'));
  el.querySelectorAll('[data-choose]').forEach(b => b.onclick = () => { const before = SG.pairSnap(); const s = b.dataset.choose; if (b.dataset.pid) SG.proj.choices[s] = b.dataset.pid; else delete SG.proj.choices[s]; SG.saveProj(); const p = SG.prod(b.dataset.pid) || (SG.proj.custom || {})[b.dataset.pid]; SG.impactNote(b.dataset.pid ? 'imp.chose' : 'imp.unchose', { p: p ? p.brand + ' ' + p.model : '', s: SG.slotName(s) }, before); rerender(); });
  el.querySelectorAll('[data-custom]').forEach(b => b.onclick = () => SG.customForm(b.dataset.custom, el.querySelector('#custom-' + b.dataset.custom), rerender));
};
SG.customForm = function (slot, box, done) {
  const K = SG.SLOTKEYS[slot] || [], t = SG.t;
  box.innerHTML = `<div class="card" style="background:var(--surface3)"><b>${t('cu.title')}</b><p class="small muted">${t('cu.lead')}</p>
    <div class="grid g3"><label class="f">${t('cu.brand')}<input type="text" id="cu-brand"></label><label class="f">${t('cu.model')}<input type="text" id="cu-model"></label><label class="f">${t('cu.url')}<input type="text" id="cu-url" placeholder="https://…"></label>
    ${K.map(([k, u]) => `<label class="f">${t('sk.' + k)}${u && !['list', 'text', 'bool'].includes(u) ? ' (' + u + ')' : ''}${u === 'list' ? ' — ' + t('cu.comma') : ''}${u === 'bool' ? ' (1 = ' + t('w.yes') + ')' : ''}<input type="${['list', 'text'].includes(u) ? 'text' : 'number'}" step="any" data-ck="${k}" data-u="${u}"></label>`).join('')}</div>
    <div class="row" style="margin-top:8px"><button class="btn pri" id="cu-save">${t('cu.save')}</button></div></div>`;
  box.querySelector('#cu-save').onclick = () => {
    const id = 'user-' + slot + '-' + Date.now(), specs = {};
    box.querySelectorAll('[data-ck]').forEach(i => { if (i.value === '') return; const u = i.dataset.u; specs[i.dataset.ck] = { v: u === 'list' ? i.value.split(',').map(x => x.trim()).filter(Boolean) : u === 'text' ? i.value : u === 'bool' ? +i.value === 1 : +i.value }; });
    const url = box.querySelector('#cu-url').value.trim();
    SG.proj.custom = SG.proj.custom || {};
    SG.proj.custom[id] = { id, slot, brand: box.querySelector('#cu-brand').value || '—', model: box.querySelector('#cu-model').value || '—', role: '', verifiedBy: 'user', specs, docs: url ? [{ t: url, url, date: new Date().toISOString().slice(0, 10) }] : [], software: [], notes: [] };
    const before = SG.pairSnap(); SG.proj.choices[slot] = id; SG.saveProj(); SG.impactNote('imp.custom', { m: SG.proj.custom[id].model }, before); done();
  };
};
SG.protCard = function (R) {
  const pv = R.pv, v = SG.pv, t = SG.t;
  const dc = [];
  if (SG.proj.pv.status !== 'none') {
    dc.push([t('prot.dcIso'), pv.VocCold ? t('prot.dcIsoTxt', { v: SG.fx(pv.VocCold, 0), i: pv.Isc ? SG.fx(pv.Isc * (pv.Np || 1) * 1.25) + ' A' : '?' }) : t('prot.missVoc')]);
    dc.push([t('prot.gpv'), (pv.Np || 1) >= 3 ? t('prot.gpvNeed') : t('prot.gpvNo', { n: pv.Np || 1 })]);
    dc.push([t('prot.spdDc'), t('prot.spdDcTxt', { v: pv.VocCold ? SG.fx(pv.VocCold, 0) + ' V' : '?' })]);
  }
  if (SG.proj.bat.status !== 'none') dc.push([t('prot.batDc'), t('prot.batDcTxt', { v: v('bat', 'Vmax') || '?' })]);
  const kms = [];
  SG.proj.loads.forEach(l => { const n = l.ctrl === 'steps' ? (+l.steps || 1) : l.ctrl === 'onoff' ? 1 : 0; if (!n) return; const c = R.circuits.find(x => x.id === 'QF-' + l.id); kms.push(['KM-' + l.id + (n > 1 ? ' ×' + n : ''), t('prot.kmTxt', { cat: l.type === 'motor' ? 'AC-3' : 'AC-1', i: SG.fx(c.Ib / n), p: +l.phases === 1 ? '2P' : '3P/4P', coil: SG.cfg.coilV === '230VAC' ? t('prot.coilKA') : SG.volt('24 VDC') })]); });
  if (SG.pv('motor', 'start') === 'dol') kms.push(['KM-M1 + ' + t('prot.qm'), t('prot.dolTxt', { v: R.motor.In != null ? SG.num(R.motor.In) : '?' })]);
  if (SG.cfg.island || SG.cfg.gen) kms.push(['KM-PCC / KM-GEN', t('prot.pccTxt', { v: SG.fx(R.Ipcc) })]);
  return `<div class="card stack" id="slot-prot"><h3>${t('prot.title')}</h3><p class="small muted">${t('prot.lead')}</p>
    <div class="tbl-wrap"><table><tr><th>${t('col.circuit')}</th><th>${t('col.load')}</th><th class="num">Ib (A)</th><th class="num">${t('prot.inMin')}</th><th>${t('prot.poles')}</th><th>${t('prot.curve')}</th><th>${t('prot.icu')}</th></tr>${R.circuits.map(c => `<tr><td class="mono">${c.id}</td><td>${SG.esc(c.n)}</td><td class="num">${c.Ib ? SG.fx(c.Ib) : '—'}</td><td class="num">${c.InMin || '—'}</td><td>${c.poles}</td><td class="small">${SG.esc(c.curve)}</td><td class="small">${v('grid', 'Icc') ? '≥ ' + v('grid', 'Icc') + ' kA (PCC)' : `<span class="st unk">${t('prot.missIcc')}</span>`}</td></tr>`).join('')}</table></div>
    ${dc.length ? `<h4>${t('prot.dcSide')}</h4><div class="tbl-wrap"><table>${dc.map(x => `<tr><td style="width:34%">${SG.esc(x[0])}</td><td class="small">${SG.esc(x[1])}</td></tr>`).join('')}</table></div>` : ''}
    ${kms.length ? `<h4>${t('prot.contactors')}</h4><div class="tbl-wrap"><table>${kms.map(x => `<tr><td class="mono" style="width:34%">${x[0]}</td><td class="small">${SG.esc(x[1])}</td></tr>`).join('')}</table></div>` : ''}</div>`;
};

/* ---------------- TAB: TƯƠNG THÍCH THEO CẶP ---------------- */
SG.tabPairs = function (el) {
  const P = SG.pairs(), cnt = s => P.filter(p => p.st === s).length, t = SG.t;
  const st = SG.pairFilter = SG.pairFilter || '';
  el.innerHTML = SG.impactHtml() + `<div class="card"><h3>${t('pp.title', { n: P.length })}</h3><div class="sumrow">${SG.ST4K.map(s => `<button class="btn sm ${st === s ? 'on' : ''}" data-pf="${s}">${SG.st4(s, SG.st4n(s) + ': ' + cnt(s))}</button>`).join('')}<button class="btn sm ${!st ? 'on' : ''}" data-pf="">${t('w.all')}</button></div>
    <p class="small muted" style="margin-top:6px">${t('pp.rule')}</p></div>` +
    P.filter(p => !st || p.st === st).map(p => `<details class="card" ${p.st === 'ko' ? 'open' : ''}><summary><span class="row" style="display:inline-flex;gap:10px">${SG.st4(p.st)} <span>${SG.esc(p.a)} ↔ ${SG.esc(p.b)}</span></span></summary>
      <div class="tbl-wrap" style="margin-top:8px"><table><tr><th>${t('col.item')}</th><th>${t('col.status')}</th><th>${t('col.detail')}</th></tr>${p.rows.map(r => `<tr><td>${SG.esc(r.n)}</td><td>${SG.st4(r.st)}</td><td class="small">${SG.esc(r.d || '')}</td></tr>`).join('')}</table></div>${p.src ? `<p class="small muted" style="margin-top:6px">${t('pp.src')} ${SG.esc(p.src)}</p>` : ''}</details>`).join('');
  el.querySelectorAll('[data-pf]').forEach(b => b.onclick = () => { SG.pairFilter = b.dataset.pf; SG.tabPairs(el); });
};

/* ---------------- TAB: I/O & TRUYỀN THÔNG ---------------- */
SG.tabIO = function (el) {
  const io = SG._R.io, plc = SG.chosen('plc'), t = SG.t;
  const byVia = {}; io.list.forEach(s => { (byVia[s.via] = byVia[s.via] || []).push(s); });
  let mod = '';
  if (plc) { const di = Math.max(0, io.need.DI - (SG.spec(plc, 'diBase') || 0)), dq = Math.max(0, io.need.DO - (SG.spec(plc, 'doBase') || 0)), ai = Math.max(0, io.need.AI - (SG.spec(plc, 'aiBase') || 0)), ao = Math.max(0, io.need.AO - (SG.spec(plc, 'aoBase') || 0));
    mod = `<p class="small">${t('tio.mod', { p: SG.esc(plc.brand + ' ' + plc.model), di0: SG.spec(plc, 'diBase'), do0: SG.spec(plc, 'doBase'), ai0: SG.spec(plc, 'aiBase') || 0, di, mdi: Math.ceil(di / 16), dq, mdq: Math.ceil(dq / 16), ai, ao, tot: Math.ceil(di / 16) + Math.ceil(dq / 16) + (ai || ao ? 1 : 0), max: SG.spec(plc, 'expModules') || '?' })}</p>`; }
  el.innerHTML = `<div class="card"><h3>${t('tio.title')}</h3><div class="row" style="margin:8px 0"><label class="f" style="width:160px">${t('tio.spare')}<input type="number" id="io-sp" value="${SG.proj.spare}" min="0" max="100"></label>
      <label class="f" style="width:300px">${t('tio.trip')}<select id="io-trip"><option value="di" ${SG.proj.statusTrip === 'di' ? 'selected' : ''}>${t('tio.tripDi')}</option><option value="none" ${SG.proj.statusTrip === 'none' ? 'selected' : ''}>${t('tio.tripNone')}</option></select></label></div>
    <div class="tbl-wrap"><table><tr><th>${t('col.type')}</th><th class="num">${t('tio.signals')}</th><th class="num">${t('tio.need')}</th></tr>${['DI', 'DO', 'AI', 'AO'].map(x => `<tr><td>${x} (${t('tio.phys')})</td><td class="num">${io[x]}</td><td class="num"><b>${io.need[x]}</b></td></tr>`).join('')}<tr><td>${t('tio.comData')}</td><td class="num">${io.COM}</td><td class="num">—</td></tr></table></div>${mod}
    <div class="note small" style="margin-top:8px">${t('tio.noDouble', { l: io.modbusDevices.map(SG.esc).join(', ') || '—' })}</div></div>
    ${Object.entries(byVia).map(([via, L]) => `<details class="card" ${via === 'I/O' ? 'open' : ''}><summary>${via === 'I/O' ? t('tio.phys') : t('tio.via', { v: via })} (${L.length})</summary><div class="tbl-wrap" style="margin-top:8px"><table><tr><th>${t('col.code')}</th><th>${t('col.type')}</th><th>${t('col.fromTo')}</th><th>${t('col.sigType')}</th><th>${t('col.func')}</th><th>${t('col.fail')}</th></tr>${L.map(s => `<tr><td class="mono">${SG.esc(s.code)}</td><td>${s.io}</td><td class="small">${SG.esc(s.src)} → ${SG.esc(s.dst)}</td><td class="small">${SG.esc(s.type)}</td><td class="small">${SG.esc(s.func)}</td><td class="small">${SG.esc(s.fail)}</td></tr>`).join('')}</table></div></details>`).join('')}`;
  el.querySelector('#io-sp').onchange = e => { SG.proj.spare = Math.max(0, Math.min(100, +e.target.value || 0)); SG.saveProj(); SG.render.selector(document.getElementById('page')); };
  el.querySelector('#io-trip').onchange = e => { SG.proj.statusTrip = e.target.value; SG.saveProj(); SG.render.selector(document.getElementById('page')); };
};

/* ---------------- TAB: XUẤT ---------------- */
SG.tabExport = function (el) {
  const X = SG.exports(), t = SG.t;
  el.innerHTML = `<div class="note small">${t('ex.note')}</div>
    <div class="grid g2">${['bom', 'comp', 'io', 'sw', 'miss'].map(k => `<div class="card stack"><h3>${t('ex.' + k)}</h3><span class="small muted">${t('ex.rows', { n: X[k][1].length - 1 })} · ${X[k][0]}</span><div class="row"><button class="btn pri" data-dl="${k}">${t('ex.dl')}</button><button class="btn" data-cp="${k}">${t('ex.copy')}</button><span class="small muted" id="msg-${k}"></span></div>
      <div class="tbl-wrap" style="max-height:220px"><table><tr>${X[k][1][0].map(h => `<th>${SG.esc(h)}</th>`).join('')}</tr>${X[k][1].slice(1, 6).map(r => `<tr>${r.map(c => `<td class="small">${SG.esc(String(c == null ? '' : c).slice(0, 80))}</td>`).join('')}</tr>`).join('')}</table></div></div>`).join('')}</div>`;
  el.querySelectorAll('[data-dl]').forEach(b => b.onclick = () => { const [n, rows] = X[b.dataset.dl]; SG.download(n, SG.csv(rows), el.querySelector('#msg-' + b.dataset.dl)); });
  el.querySelectorAll('[data-cp]').forEach(b => b.onclick = () => { const rows = X[b.dataset.cp][1]; const txt = rows.map(r => r.map(c => String(c == null ? '' : c).replace(/\t|\n/g, ' ')).join('\t')).join('\n'); const m = el.querySelector('#msg-' + b.dataset.cp); try { navigator.clipboard.writeText(txt).then(() => { m.textContent = t('ex.copied', { n: rows.length - 1 }); }, () => { m.textContent = t('ex.copyFail'); }); } catch (e) { m.textContent = t('ex.copyFail'); } });
};
