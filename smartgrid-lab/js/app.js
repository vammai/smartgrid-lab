/* LÕI ỨNG DỤNG: cấu hình, điều hướng, thuật ngữ, tìm kiếm, phiếu thiết bị/kết nối dùng chung. */
SG.PAGES = [
  ['overview', 'Tổng quan hệ thống'], ['diagram', 'Sơ đồ tương tác'], ['library', 'Thư viện thiết bị'], ['selector', 'Chọn & kiểm tra tương thích'],
  ['comms', 'Truyền thông & kết nối'], ['io', 'Bảng I/O & bố trí tủ'], ['scenarios', 'Kịch bản vận hành'], ['hmi', 'HMI / dashboard'],
  ['bom', 'Danh sách thiết bị (BOM)'], ['glossary', 'Thuật ngữ & tài liệu']
];
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
SG.T = function (str) {
  return String(str == null ? '' : str).replace(/\{\{([a-z0-9_]+)(?:\|([^}]+))?\}\}/g, (m, id, txt) => {
    const g = SG.glossary[id]; if (!g) return txt || id;
    return `<button type="button" class="term" data-term="${id}">${SG.esc(txt || g.vi)}</button>`;
  });
};
SG.fx = (n, d = 1) => (n == null || isNaN(n)) ? '—' : (Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).toLocaleString('vi-VN', { minimumFractionDigits: d, maximumFractionDigits: d });
SG.dev = id => SG.devices.find(d => d.id === id);
SG.devOn = d => !d.cond || SG.conds[d.cond](SG.cfg);
SG.allLinks = () => SG.links.concat(SG.rs485Links(SG.cfg)).filter(l => (!l.cond || SG.conds[l.cond](SG.cfg)) && SG.devOn(SG.dev(l.a.d)) && SG.devOn(SG.dev(l.b.d)));
SG.link = id => SG.allLinks().find(l => l.id === id) || SG.links.find(l => l.id === id);
SG.LBL = { 1: 'Cần cho kiến trúc tham chiếu', 2: 'Cần khi chọn chức năng/cấu hình', 3: 'Tùy chọn / mở rộng' };
SG.lbChip = lb => `<span class="chip lb${lb}" title="${SG.LBL[lb]}">${lb === 1 ? '① Tham chiếu' : lb === 2 ? '② Theo chức năng' : '③ Tùy chọn'}</span>`;
SG.stChip = (s, txt) => `<span class="st ${s}">${txt || (s === 'ok' ? 'Tương thích theo dữ liệu hiện có' : s === 'ko' ? 'Không tương thích' : 'Chưa đủ thông tin')}</span>`;
SG.specVal = (d, k) => { const v = d.spec && d.spec[k]; if (v == null) return null; try { return typeof v === 'function' ? v(SG.cfg, SG.r) : v; } catch (e) { return '—'; } };
SG.layerSwatch = (k, w = 34) => { const L = SG.LAYERS[k]; return `<svg width="${w}" height="10" aria-hidden="true"><line x1="1" y1="5" x2="${w - (L.arrow ? 6 : 1)}" y2="5" class="lk-${k}" style="stroke:var(--l-${k});stroke-width:${Math.min(L.w, 3)};stroke-dasharray:${L.dash}"/>${L.arrow ? `<path d="M${w - 7},1 L${w - 1},5 L${w - 7},9z" style="fill:var(--l-${k})"/>` : ''}</svg>`; };

/* ---------- thuật ngữ: tooltip rê chuột / bấm ---------- */
(function () {
  let pinned = null;
  const tip = () => document.getElementById('tip');
  function show(el) {
    const g = SG.glossary[el.dataset.term]; if (!g) return;
    const t = tip();
    t.innerHTML = `<b>${SG.esc(g.vi)}${g.abbr ? ' — ' + SG.esc(g.abbr) : ''}</b><i>FR : ${SG.esc(g.fr)}</i>${SG.esc(g.def)}${g.conf ? '<br><br><span style="opacity:.8">Dễ nhầm: ' + SG.esc(g.conf) + '</span>' : ''}`;
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
SG.show = function (page) {
  if (!SG.render[page]) page = 'overview';
  if (SG.ui.page === 'hmi' && page !== 'hmi' && SG.hmiTimer) { clearInterval(SG.hmiTimer); SG.hmiTimer = null; }
  SG.ui.page = page;
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.dataset.p === page));
  const el = document.getElementById('page');
  el.innerHTML = '';
  SG.render[page](el, SG.ui.arg);
  window.scrollTo(0, 0);
};
SG.applyDetail = function () {
  document.body.classList.toggle('basic', !SG.ui.detail);
  document.getElementById('m-basic').classList.toggle('on', !SG.ui.detail);
  document.getElementById('m-detail').classList.toggle('on', SG.ui.detail);
};

/* ---------- tìm kiếm ---------- */
SG.search = function (q) {
  q = q.trim().toLowerCase(); if (q.length < 2) return [];
  const R = [];
  SG.devices.forEach(d => { const t = SG.types[d.t]; const h = (d.id + ' ' + d.n + ' ' + t.name + ' ' + t.fr + ' ' + t.sym).toLowerCase(); if (h.includes(q)) R.push({ k: 'Thiết bị', t: d.id + ' — ' + d.n, go: () => SG.go('library', d.id) }); });
  Object.entries(SG.glossary).forEach(([id, g]) => { const h = (g.vi + ' ' + g.fr + ' ' + g.abbr).toLowerCase(); if (h.includes(q)) R.push({ k: 'Thuật ngữ', t: g.vi + (g.abbr ? ' (' + g.abbr + ')' : '') + ' — ' + g.fr, go: () => SG.go('glossary', id) }); });
  SG.r.io.sig.forEach(s => { if ((s.code + ' ' + s.func).toLowerCase().includes(q)) R.push({ k: 'Tín hiệu ' + s.io, t: s.code + ' — ' + s.func, go: () => SG.go('io', s.code) }); });
  SG.comms.forEach(c => { if (c.n.toLowerCase().includes(q)) R.push({ k: 'Truyền thông', t: c.n, go: () => SG.go('comms', c.id) }); });
  SG.scenarios.forEach(s => { if (s.n.toLowerCase().includes(q)) R.push({ k: 'Kịch bản', t: s.n, go: () => SG.go('scenarios', s.id) }); });
  return R.slice(0, 18);
};

/* ---------- phiếu thiết bị (A–D) ---------- */
SG.flowNeighbors = function (id) {
  const L = SG.allLinks().filter(l => l.layer === 'ac' || l.layer === 'dc' || (l.layer === 'aux' && !l.lane));
  return { before: L.filter(l => l.b.d === id).map(l => l.a.d), after: L.filter(l => l.a.d === id).map(l => l.b.d) };
};
SG.devLinks = id => SG.allLinks().filter(l => l.a.d === id || l.b.d === id);
SG.portGroup = { ac: 'Công suất', dc: 'Công suất', aux: 'Nguồn phụ trợ', ai: 'Đo lường / analog', di: 'Điều khiển (số)', eth: 'Truyền thông', rs485: 'Truyền thông', can: 'Truyền thông', wl: 'Truyền thông' };
SG.devChip = id => { const d = SG.dev(id); return `<button type="button" class="chip" data-goto-dev="${id}" title="${SG.esc(d ? d.n : id)}"><span class="mono">${SG.esc(id)}</span></button>`; };

SG.sheet = function (id, opts) {
  opts = opts || {};
  const d = SG.dev(id); if (!d) return '<p>Không tìm thấy thiết bị.</p>';
  const t = SG.types[d.t];
  const tab = opts.tab || 'A';
  const on = SG.devOn(d);
  let h = `<div class="sheet" data-sheet="${id}">
    <div class="sheet-h"><span class="id">${SG.esc(d.id)} · ${SG.esc(t.sym)}</span><h2>${SG.esc(d.n)}</h2>
    <div class="muted">${SG.esc(t.name)} — <i>${SG.esc(t.fr)}</i></div>
    <div class="row">${SG.lbChip(d.lb)}<span class="chip">${SG.esc(t.group)}</span><span class="chip">Nhánh: ${SG.esc(d.br)}</span>${on ? '' : '<span class="st ko">Không có trong cấu hình hiện tại</span>'}</div></div>
    <div class="tabs" role="tablist">${[['A', 'A. Hiểu thiết bị'], ['B', 'B. Vị trí & kết nối'], ['C', 'C. Thông số chọn'], ['D', 'D. Ví dụ lựa chọn']].map(([k, n]) => `<button role="tab" data-tab="${k}" class="${k === tab ? 'on' : ''}">${n}</button>`).join('')}</div>`;
  if (tab === 'A') {
    h += `<section><dl class="qa">
      <dt>Chức năng</dt><dd>${SG.T(t.func)}</dd>
      <dt>Nguyên lý</dt><dd>${SG.T(t.principle)}</dd>
      <dt>Vì sao cần ở vị trí này</dt><dd>${SG.T(d.why)}</dd>
      <dt>Bảo vệ / đo / điều khiển</dt><dd>${SG.T(d.prot)}</dd>
      <dt>Nếu bỏ đi</dt><dd>${SG.T(d.wo)}</dd>
      <dt>Không làm được</dt><dd>${SG.T(t.notdo || '—')}</dd></dl></section>`;
    if (t.confusions && t.confusions.length) h += `<section><div class="sec-t">Khác gì thiết bị dễ nhầm</div><dl class="qa">${t.confusions.map(c => `<dt>${SG.esc(c[0])}</dt><dd>${SG.T(c[1])}</dd>`).join('')}</dl></section>`;
  } else if (tab === 'B') {
    const nb = SG.flowNeighbors(id);
    h += `<section><dl class="qa">
      <dt>Vị trí trên sơ đồ chức năng</dt><dd>Nhánh <b>${SG.esc(d.br)}</b>${d.nodiag ? ' (không vẽ trên sơ đồ)' : ''}</dd>
      <dt>Vị trí lắp đặt vật lý</dt><dd><b>${SG.esc(d.cab.c)}</b> — vùng ${d.cab.z === 'P' ? 'công suất' : d.cab.z === 'C' ? 'điều khiển' : 'truyền thông'}${d.cab.pos ? ' · ' + SG.esc(d.cab.pos) : ''} <button class="btn sm" data-goto="io" data-arg="cab:${id}">Xem trong tủ</button></dd>
      <dt>Trước nó (phía nguồn)</dt><dd>${nb.before.length ? nb.before.map(SG.devChip).join(' ') : '—'}</dd>
      <dt>Sau nó (phía tải)</dt><dd>${nb.after.length ? nb.after.map(SG.devChip).join(' ') : '—'}</dd></dl></section>`;
    const P = t.ports || {};
    const pg = [['power', 'Công suất'], ['aux', 'Nguồn phụ trợ'], ['meas', 'Đo lường'], ['ctrl', 'Điều khiển'], ['comm', 'Truyền thông']].filter(([k]) => P[k]);
    if (pg.length) h += `<section><div class="sec-t">Nhóm đầu nối của loại thiết bị</div><div class="portgrid">${pg.map(([k, n]) => `<div class="portrow"><span class="g">${n}</span><span>${SG.T(P[k])}</span></div>`).join('')}</div></section>`;
    const L = SG.devLinks(id);
    if (L.length) h += `<section><div class="sec-t">Kết nối thực tế trong mô hình (bấm để xem)</div><div class="conn-list">${L.map(l => { const me = l.a.d === id ? 'a' : 'b', ot = me === 'a' ? 'b' : 'a'; return `<div class="conn" data-goto-link="${l.id}">${SG.layerSwatch(l.layer, 20)}<span><b>${SG.portGroup[l.layer]}</b> · ${SG.esc(l[me].p || 'cổng')} ${me === 'a' ? '→' : '←'} <span class="mono">${SG.esc(l[ot].d)}</span>${l[ot].p ? ' (' + SG.esc(l[ot].p) + ')' : ''}<br><span class="muted">${SG.esc(l.label)} · ${SG.esc(l.cable)}</span></span></div>`; }).join('')}</div></section>`;
    const acc = (t.accessories || []).concat(d.acc || []);
    if (acc.length) h += `<section><div class="sec-t">Phụ kiện cần thêm cho chức năng mong muốn</div><ul>${acc.map(a => `<li>${SG.T(a)}</li>`).join('')}</ul></section>`;
    if (t.compat && t.compat.length) h += `<section><div class="sec-t">Điều kiện tương thích cần kiểm tra</div><ul>${t.compat.map(a => `<li>${SG.T(a)}</li>`).join('')}</ul></section>`;
    const ck = SG.checks(SG.cfg, SG.r).filter(c => c.devs.includes(id));
    if (ck.length) h += `<section><div class="sec-t">Kết quả kiểm tra với cấu hình hiện tại</div>${ck.map(c => `<div class="stack" style="gap:3px;margin-bottom:6px">${SG.stChip(c.status)}<b>${SG.esc(c.title)}</b><span class="small">${SG.esc(c.reason)}</span>${c.need.length ? '<span class="small muted">Cần bổ sung: ' + c.need.map(SG.esc).join('; ') + '</span>' : ''}</div>`).join('')}</section>`;
  } else if (tab === 'C') {
    h += `<p class="small muted">Thứ tự đọc: tên → ý nghĩa → đơn vị → ảnh hưởng tới lựa chọn → cách xác định → ví dụ → điều cần kiểm tra. Giá trị “trong mô hình” là GIẢ ĐỊNH mô phỏng, không phải dữ liệu nhà sản xuất.</p>`;
    h += (t.params || []).map(p => {
      const v = SG.specVal(d, p.k);
      return `<div class="param${p.adv ? ' adv' : ''}"><div class="ph"><b>${SG.esc(p.n)}</b>${p.u ? `<span class="muted mono small">${SG.esc(p.u)}</span>` : ''}</div>
        ${v ? `<div><span class="small muted">Trong mô hình: </span><span class="val">${SG.esc(v)}</span></div>` : ''}
        <div class="chain">${p.m ? `<span>Ý nghĩa</span><span>${SG.T(p.m)}</span>` : ''}<span>Ảnh hưởng</span><span>${SG.T(p.i)}</span>
        <span class="adv">Cách xác định</span><span class="adv">${SG.T(p.h || '—')}</span><span class="adv">Ví dụ</span><span class="adv">${SG.T(p.e || '—')}</span>${p.c ? `<span>Cần kiểm tra</span><span>${SG.T(p.c)}</span>` : ''}</div></div>`;
    }).join('');
    const extra = Object.keys(d.spec || {}).filter(k => !(t.params || []).some(p => p.k === k));
    if (extra.length) h += `<dl class="kv">${extra.map(k => `<dt>${SG.esc(k)}</dt><dd>${SG.esc(SG.specVal(d, k))}</dd>`).join('')}</dl>`;
  } else {
    const ex = t.example || {};
    h += `<div class="ex">${ex.ok ? `<div class="ok"><b>✓ Ví dụ phù hợp: ${SG.esc(ex.ok.t)}</b>${SG.T(ex.ok.d)}</div>` : ''}${ex.ko ? `<div class="ko"><b>✕ Trường hợp không tương thích: ${SG.esc(ex.ko.t)}</b>${SG.T(ex.ko.d)}</div>` : ''}</div>`;
    h += `<div class="note">Trạng thái xác minh: <b>Giả định mô phỏng</b>. Chưa gắn với model thương mại nào. Khi chọn model thật, ghi mã, phiên bản datasheet và liên kết nguồn chính hãng vào BOM.</div>`;
    if (t.brands) h += `<p class="small muted">${SG.esc(t.brands)}</p>`;
  }
  h += '</div>';
  return h;
};
SG.bindSheet = function (root, id, opts, rerender) {
  root.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => rerender(Object.assign({}, opts, { tab: b.dataset.tab })));
};

SG.linkSheet = function (id, end) {
  const l = SG.link(id); if (!l) return '<p>Không tìm thấy kết nối.</p>';
  const L = SG.LAYERS[l.layer];
  const sigs = SG.r.io.sig.filter(s => s.link === l.id);
  const cm = SG.comms.filter(c => c.used.some(u => u === l.id || (u.endsWith('-') && l.id.startsWith(u))));
  let h = `<div class="sheet"><div class="sheet-h"><span class="id">${SG.layerSwatch(l.layer)} ${SG.esc(L.n)}</span><h2>${SG.esc(l.label)}</h2></div>`;
  if (end) { const e = l[end]; h += `<div class="note info">Điểm kết nối đã chọn: <b class="mono">${SG.esc(e.d)}</b> — ${SG.esc(e.p || 'cổng ' + SG.portGroup[l.layer].toLowerCase())}</div>`; }
  h += `<dl class="qa"><dt>Từ</dt><dd>${SG.devChip(l.a.d)} ${SG.esc(l.a.p || '')}</dd><dt>Tới</dt><dd>${SG.devChip(l.b.d)} ${SG.esc(l.b.p || '')}</dd>
    <dt>Loại đường</dt><dd>${SG.esc(L.n)}${L.arrow ? ' — mũi tên chỉ chiều tín hiệu' : ''}</dd><dt>Dây / giao diện</dt><dd>${SG.esc(l.cable)}</dd>${l.desc ? `<dt>Ghi chú</dt><dd>${SG.T(l.desc)}</dd>` : ''}</dl>`;
  if (sigs.length) h += `<section><div class="sec-t">Tín hiệu trên dây này (bảng I/O)</div><div class="tbl-wrap"><table><tr><th>Mã</th><th>Loại</th><th>Chức năng</th></tr>${sigs.map(s => `<tr><td class="mono">${SG.esc(s.code)}</td><td>${s.io} · ${SG.esc(s.type)}</td><td>${SG.esc(s.func)}</td></tr>`).join('')}</table></div></section>`;
  if (cm.length) h += `<section><div class="sec-t">Kiểu kết nối</div>${cm.map(c => `<button class="btn sm" data-goto="comms" data-arg="${c.id}">${SG.esc(c.n)} →</button>`).join(' ')}</section>`;
  if (l.layer === 'ac' || l.layer === 'dc') h += `<div class="note">Tiết diện và loại cáp phải được tính theo dòng, cách lắp, nhiệt độ, chiều dài, sụt áp và điều kiện cắt sự cố — không lấy từ sơ đồ minh họa này.</div>`;
  return h + '</div>';
};

/* ---------- liên kết toàn cục ---------- */
document.addEventListener('click', e => {
  const g = e.target.closest('[data-goto]'); if (g) { e.preventDefault(); SG.go(g.dataset.goto, g.dataset.arg || null); return; }
  const gd = e.target.closest('[data-goto-dev]'); if (gd && !e.target.closest('.dg')) { e.preventDefault(); if (SG.ui.page === 'diagram' && SG.diagramSelect) SG.diagramSelect({ kind: 'dev', id: gd.dataset.gotoDev }); else SG.go('library', gd.dataset.gotoDev); return; }
  const gl = e.target.closest('[data-goto-link]'); if (gl) { e.preventDefault(); if (SG.ui.page === 'diagram' && SG.diagramSelect) SG.diagramSelect({ kind: 'link', id: gl.dataset.gotoLink }); else SG.go('diagram', 'link:' + gl.dataset.gotoLink); }
});

SG.start = function () {
  document.getElementById('nav').innerHTML = SG.PAGES.map((p, i) => `<a href="#${p[0]}" data-p="${p[0]}"><span class="k">${i + 1}</span>${p[1]}</a>`).join('');
  document.getElementById('m-basic').onclick = () => { SG.ui.detail = false; SG.store.set('detail', false); SG.applyDetail(); };
  document.getElementById('m-detail').onclick = () => { SG.ui.detail = true; SG.store.set('detail', true); SG.applyDetail(); };
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
