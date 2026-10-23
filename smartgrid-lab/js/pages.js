/* TRANG 1–5 */
SG.mini = function (el, o) {
  el.classList.add('mini');
  el.innerHTML = '<div class="dg-c" style="position:absolute;inset:0"></div><div class="dg-zoom"><button aria-label="Phóng to">+</button><button aria-label="Thu nhỏ">−</button><button aria-label="Vừa khung" title="Vừa khung">⤢</button></div>';
  const D = new SG.Diagram(el.firstChild, o);
  D.build(SG.cfg); if (o.values) D.values = o.values; if (o.hl) D.hl = o.hl; D.render();
  const b = el.querySelectorAll('.dg-zoom button'); b[0].onclick = () => D.zoomAt(0.8); b[1].onclick = () => D.zoomAt(1.25); b[2].onclick = () => D.fit();
  return D;
};
SG.head = (eb, title, lead) => `<div class="page-head"><span class="eyebrow">${eb}</span><h1>${title}</h1>${lead ? `<p>${lead}</p>` : ''}</div>`;

/* ======================= 1. TỔNG QUAN ======================= */
SG.render.overview = function (el) {
  const c = SG.cfg, r = SG.r, ck = SG.checks(c, r);
  const n = s => ck.filter(x => x.status === s).length;
  const devs = SG.devices.filter(SG.devOn);
  el.innerHTML = SG.head('Tổng quan hệ thống', 'Microgrid hạ áp tham chiếu cho phòng thí nghiệm 80 m²',
    'Một kiến trúc xuyên suốt: lưới 400 V, PV, pin với PCS, máy phát, tải động cơ, tải điện trở cắt được, tải ưu tiên, trạm sạc EV tùy chọn, nguồn điều khiển 24 V, PLC, HMI và SCADA/EMS. Sơ đồ, phiếu thiết bị, bảng I/O, BOM và HMI dùng cùng một bộ dữ liệu, nên thay đổi ở trang Chọn thiết bị sẽ lan ra mọi trang.') + `
  <div class="overview-hero">
    <div class="stack">
      <div class="question-list">
        <div><b>THIẾT BỊ NÀO</b>${devs.length} thiết bị trong cấu hình hiện tại, chia 3 nhãn. <a href="#bom" data-goto="bom">BOM →</a></div>
        <div><b>ĐẶT Ở ĐÂU</b>Vị trí trên sơ đồ chức năng và vị trí lắp trong tủ. <a href="#io" data-goto="io" data-arg="cab">Bố trí tủ →</a></div>
        <div><b>LÀM NHIỆM VỤ GÌ</b>Phiếu A: chức năng, nguyên lý, nếu bỏ đi thì mất gì. <a href="#library" data-goto="library">Thư viện →</a></div>
        <div><b>CHỌN THEO THÔNG SỐ NÀO</b>Phiếu C: ý nghĩa → ảnh hưởng → cách xác định → kiểm tra. <a href="#library" data-goto="library" data-arg="QF0">Ví dụ QF0 →</a></div>
        <div><b>KẾT NỐI VỚI GÌ, QUA ĐÂU</b>Bấm vào dây/cổng trên sơ đồ; 4 lớp truyền thông. <a href="#comms" data-goto="comms">Truyền thông →</a></div>
        <div><b>ĐIỀU KHIỂN THẾ NÀO</b>Kịch bản từng bước và HMI mô phỏng. <a href="#scenarios" data-goto="scenarios">Kịch bản →</a></div>
      </div>
      <div class="card"><h3>Trạng thái kiểm tra của cấu hình hiện tại</h3>
        <div class="sumrow">${SG.stChip('ok', n('ok') + ' tương thích theo dữ liệu hiện có')}${SG.stChip('ko', n('ko') + ' không tương thích')}${SG.stChip('unk', n('unk') + ' chưa đủ thông tin')}</div>
        <p class="small muted" style="margin-top:8px">Ví dụ: ${SG.esc((ck.find(x => x.status === 'ko') || {}).title || '—')}. <a href="#selector" data-goto="selector">Xem và thay đổi thông số →</a></p></div>
    </div>
    <div class="card" style="padding:0;overflow:hidden"><div id="ov-dg" style="height:380px;border:0;border-radius:0"></div><div class="small muted" style="padding:8px 12px;border-top:1px solid var(--line)">Xem nhanh lớp công suất. Bấm một thiết bị để mở trên sơ đồ đầy đủ.</div></div>
  </div>
  <div class="grid g3">
    <div class="card"><h3>Ba nhãn thiết bị</h3><div class="stack small">
      <div>${SG.lbChip(1)} ${devs.filter(d => d.lb === 1).length} thiết bị — không có thì kiến trúc tham chiếu không vận hành được.</div>
      <div>${SG.lbChip(2)} ${devs.filter(d => d.lb === 2).length} thiết bị — chỉ cần khi chọn một chức năng (vận hành đảo, máy phát, RS485…).</div>
      <div>${SG.lbChip(3)} ${devs.filter(d => d.lb === 3).length} thiết bị — mở rộng, có thể thêm sau.</div></div></div>
    <div class="card"><h3>Quy ước dấu công suất</h3><dl class="kv small">
      <dt>P_GRID</dt><dd>&gt; 0 nhập từ lưới · &lt; 0 phát lên lưới</dd><dt>P_BAT</dt><dd>&gt; 0 pin xả · &lt; 0 pin sạc</dd><dt>P_PV, P_GEN</dt><dd>≥ 0 (nguồn)</dd><dt>Tải</dt><dd>≥ 0 (tiêu thụ)</dd>
      <dt>Cân bằng</dt><dd class="mono">P_GRID + P_PV + P_BAT + P_GEN = ΣP_tải</dd><dt>Đơn vị</dt><dd>kW, kWh, V, A, Hz, %</dd></dl></div>
    <div class="card"><h3>Giới hạn của công cụ</h3><p class="small">Đây là công cụ học và xác định yêu cầu. Giá trị bảo vệ, tiết diện cáp, sơ đồ nối đất và điều kiện đấu nối lưới đều được đánh dấu <b>cần kiểm chứng</b> theo dữ liệu công trình và quy định áp dụng. Sơ đồ minh họa không đủ điều kiện thi công. Không có kết nối tới thiết bị thật.</p></div>
  </div>
  <div class="card"><h3>Bộ thông số minh họa (giả định — thay đổi được ở trang Chọn thiết bị)</h3>
    <div class="tbl-wrap" style="margin-top:10px"><table><tr><th>Nhóm</th><th>Giá trị</th><th>Giả định / lý do</th></tr>
    <tr><td>Lưới</td><td>${c.U} V ${c.phases === 3 ? '3P+N' : '1P+N'}, ${c.f} Hz, ${c.Sgrid} kVA</td><td>Sơ đồ nối đất TN-S giả định; Icc chưa biết; giới hạn nhập ${c.importLimit} kW do EMS đặt; ${c.exportAllowed ? 'được phát tối đa ' + c.exportLimit + ' kW' : 'không được phát lên lưới'}</td></tr>
    <tr><td>PV</td><td>${c.Ppv} kWc, inverter ${c.Pinv} kW 3P</td><td>Có thể thay dàn PV thật bằng simulateur PV trong phòng</td></tr>
    <tr><td>Pin</td><td>${c.Ebat} kWh LFP, PCS ${c.Pcs} kW ${c.pcsGF ? 'grid-forming' : 'grid-following'}</td><td>SOC ${c.socMin}–${c.socMax} %; tương thích BMS–PCS chưa xác minh</td></tr>
    <tr><td>Máy phát</td><td>${c.gen ? c.Sgen + ' kVA' : 'Không có'}</td><td>Đặt ngoài phòng hoặc dùng nguồn mô phỏng; chỉ chuyển nguồn, không song song lưới</td></tr>
    <tr><td>Tải</td><td>Động cơ ${c.Pm} kW + biến tần; điện trở ${c.rlSteps} × ${c.rlStep} kW; ưu tiên ${c.Plp} kW${c.ev ? '; EV ' + c.Pev + ' kW 1P' : ''}</td><td>Bàn tải điện trở thải nhiệt trong phòng — cần thông gió</td></tr>
    <tr><td>Điều khiển</td><td>PLC + ${r.io.modulesTxt}; switch ${r.eth.ports} cổng</td><td>Tính từ bảng I/O + ${c.spare} % dự phòng</td></tr></table></div></div>
  <div class="card"><h3>Thành phần trạm điện công nghiệp: khi nào thì cần?</h3><p class="small muted">Không đưa mọi thiết bị của trạm công nghiệp vào mô hình nhỏ một cách máy móc.</p>
    <div class="tbl-wrap" style="margin-top:10px"><table><tr><th>Thành phần</th><th>Trong mô hình</th><th>Lý do</th></tr>${SG.extensions.map(x => `<tr><td>${SG.esc(x.n)}</td><td><span class="chip">${SG.esc(x.need)}</span></td><td>${SG.esc(x.why)}</td></tr>`).join('')}</table></div></div>`;
  SG.mini(el.querySelector('#ov-dg'), { view: 'power', onSelect: s => { if (s && s.kind === 'dev') SG.go('diagram', s.id); } });
};

/* ======================= 2. SƠ ĐỒ ======================= */
SG.render.diagram = function (el, arg) {
  const st = SG.dgState = SG.dgState || { view: 'power', layers: Object.keys(SG.LAYERS), loc: 'func', tab: 'A' };
  el.innerHTML = SG.head('Sơ đồ tương tác', 'Sơ đồ hệ thống — bấm vào thiết bị, dây hoặc điểm kết nối',
    'Kéo để di chuyển, cuộn để phóng to. Chọn một thiết bị để làm nổi bật mọi kết nối liên quan (đo lường, nguồn phụ trợ, lệnh, phản hồi). Số ② ③ ở góc ô là nhãn thiết bị; ô viền đứt là tùy chọn.') + `
  <div class="dg-wrap">
    <div class="dg-stage">
      <div class="dg-tool">
        <div class="seg" id="dg-view">${Object.entries(SG.VIEWS).map(([k, v]) => `<button data-v="${k}">${v.n}</button>`).join('')}</div>
        <div class="seg" id="dg-loc" title="Vị trí chức năng hay vị trí lắp đặt"><button data-l="func">Vị trí chức năng</button><button data-l="cab">Hiện nơi lắp đặt</button></div>
        <select id="dg-trace" style="width:auto;max-width:260px" aria-label="Theo dõi chuỗi"><option value="">Theo dõi một chuỗi đo lường / điều khiển…</option>${SG.traces.map(t => `<option value="${t.id}">${t.kind}: ${SG.esc(t.n)}</option>`).join('')}</select>
      </div>
      <div class="dg-canvas" id="dg-c"></div>
      <div class="dg-zoom" style="bottom:52px"><button id="z-in" aria-label="Phóng to">+</button><button id="z-out" aria-label="Thu nhỏ">−</button><button id="z-fit" aria-label="Vừa khung" title="Vừa khung">⤢</button></div>
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
    el.querySelector('#dg-legend').innerHTML = Object.entries(SG.LAYERS).map(([k, L]) => {
      const v = SG.VIEWS[st.view]; const vis = st.view === 'all' ? st.layers.includes(k) : v.on.includes(k);
      return st.view === 'all' ? `<label><input type="checkbox" data-ly="${k}" ${vis ? 'checked' : ''}>${SG.layerSwatch(k)}${L.n}</label>` : `<label style="${vis ? '' : 'opacity:.45'}">${SG.layerSwatch(k)}${L.n}</label>`;
    }).join('') + '<span class="muted">Nhãn chữ và kiểu nét phân biệt mỗi loại, không chỉ màu.</span>';
    el.querySelectorAll('[data-ly]').forEach(cb => cb.onchange = () => { st.layers = [...el.querySelectorAll('[data-ly]:checked')].map(x => x.dataset.ly); D.setView('all', st.layers); });
  };
  const segs = () => { el.querySelectorAll('#dg-view button').forEach(b => b.classList.toggle('on', b.dataset.v === st.view)); el.querySelectorAll('#dg-loc button').forEach(b => b.classList.toggle('on', b.dataset.l === st.loc)); };
  el.querySelectorAll('#dg-view button').forEach(b => b.onclick = () => { st.view = b.dataset.v; D.setView(st.view, st.layers); segs(); legend(); });
  el.querySelectorAll('#dg-loc button').forEach(b => b.onclick = () => { st.loc = b.dataset.l; D.values = locVals(); D.render(); segs(); if (st.loc === 'cab') side.insertAdjacentHTML('afterbegin', '<div class="note info small">Nhãn đen cạnh mỗi ô là NƠI LẮP ĐẶT (tủ/tường/hiện trường). Vị trí trên sơ đồ là vị trí CHỨC NĂNG: hai thiết bị cạnh nhau trên sơ đồ có thể nằm ở hai tủ khác nhau.</div>'); });
  el.querySelector('#z-in').onclick = () => D.zoomAt(0.8); el.querySelector('#z-out').onclick = () => D.zoomAt(1.25); el.querySelector('#z-fit').onclick = () => D.fit();
  el.querySelector('#dg-trace').onchange = e => { if (e.target.value) select({ kind: 'trace', id: e.target.value }); else select(null); };
  segs(); legend();

  function help() {
    side.innerHTML = `<h3>Cách dùng</h3><div class="stack small">
      <p>• <b>Bấm một thiết bị</b>: phiếu chi tiết A–D và mọi kết nối liên quan được làm nổi bật.</p>
      <p>• <b>Bấm một dây</b>: loại kết nối, dây/giao diện, tín hiệu đi trên đó.</p>
      <p>• <b>Bấm chấm tròn ở đầu dây</b>: điểm kết nối (cổng) của thiết bị.</p>
      <p>• <b>Chế độ xem</b>: Công suất, Đo lường, Điều khiển, Truyền thông, hoặc Tổng hợp để bật/tắt từng lớp.</p>
      <p>• <b>Theo dõi một chuỗi</b>: ví dụ công suất PV từ inverter tới HMI, hoặc lệnh chạy động cơ.</p></div>
      <div class="note info small">Thử ngay: <button class="btn sm" data-try="RLY-DEC">Relay tách lưới</button> <button class="btn sm" data-try="trace:P_PV">Chuỗi P_PV</button> <button class="btn sm" data-try="trace:CMD_M1">Chuỗi chạy M1</button> <button class="btn sm" data-try="link:c-ka-mx">Dây KA4 → MX</button></div>`;
    side.querySelectorAll('[data-try]').forEach(b => b.onclick = () => { const v = b.dataset.try; if (v.startsWith('trace:')) select({ kind: 'trace', id: v.slice(6) }); else if (v.startsWith('link:')) select({ kind: 'link', id: v.slice(5) }); else select({ kind: 'dev', id: v }); });
  }
  function select(s) {
    SG.dgSel = s;
    if (!s) { D.setHighlight(null); help(); el.querySelector('#dg-trace').value = ''; return; }
    if (s.kind === 'dev') {
      if (!D.node[s.id]) { side.innerHTML = `<div class="note ko">${SG.esc(s.id)} không có trong cấu hình hiện tại.</div>` + SG.sheet(s.id, { tab: st.tab }); return; }
      D.setHighlight(D.related(s.id), s.id);
      const draw = (o) => { st.tab = o.tab; side.innerHTML = `<div class="row"><button class="btn sm" id="sd-clear">✕ Bỏ chọn</button><button class="btn sm" data-goto="library" data-arg="${s.id}">Mở trong thư viện</button></div>` + SG.sheet(s.id, o); side.querySelector('#sd-clear').onclick = () => select(null); SG.bindSheet(side, s.id, o, draw); };
      draw({ tab: st.tab });
    } else if (s.kind === 'link' || s.kind === 'port') {
      const l = D.links.find(x => x.id === s.id); if (!l) { side.innerHTML = '<div class="note ko">Kết nối không có trong cấu hình hiện tại.</div>'; return; }
      if (st.view !== 'all' && !SG.VIEWS[st.view].on.includes(l.layer)) { st.view = 'all'; if (!st.layers.includes(l.layer)) st.layers.push(l.layer); D.opt.view = 'all'; D.opt.layers = st.layers; segs(); legend(); }
      D.setHighlight(new Set([l.id, l.a.d, l.b.d]), l.id);
      side.innerHTML = `<div class="row"><button class="btn sm" id="sd-clear">✕ Bỏ chọn</button></div>` + SG.linkSheet(s.id, s.kind === 'port' ? s.end : null);
      side.querySelector('#sd-clear').onclick = () => select(null);
    } else if (s.kind === 'trace') {
      const t = SG.traces.find(x => x.id === s.id);
      const ids = new Set(); t.steps.forEach(x => { ids.add(x.d); if (x.l) ids.add(x.l); });
      st.view = 'all'; st.layers = Object.keys(SG.LAYERS); D.opt.view = 'all'; D.opt.layers = st.layers; segs(); legend();
      D.setHighlight(ids); el.querySelector('#dg-trace').value = t.id;
      side.innerHTML = `<div class="row"><button class="btn sm" id="sd-clear">✕ Bỏ chọn</button></div><span class="eyebrow">${t.kind}</span><h2>${SG.esc(t.n)}</h2><div class="flow">${t.steps.map((x, i) => `<div class="stp" data-i="${i}"><i>${i + 1}</i><span><span class="mono">${x.d}</span>${x.l ? ' <span class="muted small">qua ' + SG.esc((D.links.find(l => l.id === x.l) || { label: x.l }).label) + '</span>' : ''}<br>${SG.T(x.t)}</span></div>`).join('')}</div>`;
      side.querySelector('#sd-clear').onclick = () => select(null);
      side.querySelectorAll('.stp').forEach(p => p.onclick = () => { const x = t.steps[+p.dataset.i]; side.querySelectorAll('.stp').forEach(q => q.classList.toggle('cur', q === p)); const set = new Set([x.d]); if (x.l) { set.add(x.l); const l = D.links.find(k => k.id === x.l); if (l) { set.add(l.a.d); set.add(l.b.d); } } D.setHighlight(set, x.d); });
    }
  }
  SG.diagramSelect = select;
  if (arg) { if (arg.startsWith('link:')) select({ kind: 'link', id: arg.slice(5) }); else if (arg.startsWith('trace:')) select({ kind: 'trace', id: arg.slice(6) }); else { select({ kind: 'dev', id: arg }); D.focus([arg]); } }
  else if (SG.dgSel) select(SG.dgSel); else help();
};

/* ======================= 3. THƯ VIỆN ======================= */
SG.render.library = function (el, arg) {
  const st = SG.libState = SG.libState || { q: '', lb: 0, only: false, sel: 'QF0', tab: 'A', mode: 'dev' };
  if (arg) { st.sel = arg; st.mode = 'dev'; }
  el.innerHTML = SG.head('Thư viện thiết bị', 'Phiếu chi tiết cho từng thiết bị', 'Mỗi phiếu có cùng bốn phần: A. Hiểu thiết bị · B. Vị trí và kết nối · C. Thông số để chọn · D. Ví dụ lựa chọn. Chế độ “Chi tiết” hiện thêm cách xác định và ví dụ cho từng thông số.') + `
  <div class="tabs"><button data-m="dev">Thiết bị</button><button data-m="cmp">So sánh thiết bị dễ nhầm</button></div><div id="lib-body"></div>`;
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
      <input id="lib-q" type="text" placeholder="Lọc theo mã, tên, tiếng Pháp…" value="${SG.esc(st.q)}" aria-label="Lọc thiết bị">
      <select id="lib-lb" aria-label="Lọc nhãn"><option value="0">Mọi nhãn</option><option value="1">① Cần cho kiến trúc tham chiếu</option><option value="2">② Cần theo chức năng</option><option value="3">③ Tùy chọn</option></select>
      <label class="cb"><input type="checkbox" id="lib-only" ${st.only ? 'checked' : ''}> Chỉ thiết bị có trong cấu hình hiện tại</label></div>
      <div class="lib-list" id="lib-list"></div></div><div class="card" id="lib-sheet"></div></div>`;
    body.querySelector('#lib-lb').value = st.lb;
    const list = () => {
      const q = st.q.toLowerCase();
      const items = SG.devices.filter(d => (!st.only || SG.devOn(d)) && (!st.lb || d.lb == st.lb) && (!q || (d.id + d.n + SG.types[d.t].name + SG.types[d.t].fr).toLowerCase().includes(q)));
      const groups = {}; items.forEach(d => { const g = SG.types[d.t].group; (groups[g] = groups[g] || []).push(d); });
      body.querySelector('#lib-list').innerHTML = Object.entries(groups).map(([g, ds]) => `<div class="gh">${SG.esc(g)}</div>` + ds.map(d => `<button data-id="${d.id}" class="${d.id === st.sel ? 'on' : ''}" style="${SG.devOn(d) ? '' : 'opacity:.55'}"><span class="id">${d.id}</span><span>${SG.esc(d.n)}</span><span class="chip lb${d.lb}" style="padding:0 6px">${d.lb}</span></button>`).join('')).join('') || '<p class="muted small" style="padding:8px">Không có kết quả.</p>';
      body.querySelectorAll('#lib-list [data-id]').forEach(b => b.onclick = () => { st.sel = b.dataset.id; list(); sheet({ tab: st.tab }); });
    };
    const sheet = (o) => { st.tab = o.tab; const box = body.querySelector('#lib-sheet'); const d = SG.dev(st.sel); box.innerHTML = `<div class="row" style="justify-content:flex-end">${d && !d.nodiag ? `<button class="btn sm" data-goto="diagram" data-arg="${st.sel}">Xem trên sơ đồ →</button>` : ''}<button class="btn sm" data-goto="bom" data-arg="${st.sel}">Dòng BOM →</button></div>` + SG.sheet(st.sel, o); SG.bindSheet(box, st.sel, o, sheet); };
    body.querySelector('#lib-q').oninput = e => { st.q = e.target.value; list(); };
    body.querySelector('#lib-lb').onchange = e => { st.lb = +e.target.value; list(); };
    body.querySelector('#lib-only').onchange = e => { st.only = e.target.checked; list(); };
    list(); sheet({ tab: st.tab });
  }
};

/* ======================= 4. CHỌN THIẾT BỊ & TƯƠNG THÍCH ======================= */
SG.FORM = [
  ['Lưới & đấu nối', [
    ['U', 'Điện áp pha–pha', 'num', 'V'], ['phases', 'Số pha', 'sel', '', [[3, '3 pha + N'], [1, '1 pha + N']]], ['f', 'Tần số', 'sel', 'Hz', [[50, '50 Hz'], [60, '60 Hz']]],
    ['Sgrid', 'Công suất đấu nối', 'num', 'kVA'], ['Icc', 'Dòng ngắn mạch tại PCC (để trống nếu chưa có)', 'num', 'kA'], ['qf0Icu', 'Icu máy cắt tổng dự kiến', 'num', 'kA'],
    ['importLimit', 'Giới hạn nhập do EMS đặt (sa thải khi vượt)', 'num', 'kW'], ['exportAllowed', 'Được phép phát lên lưới', 'chk'], ['exportLimit', 'Giới hạn phát', 'num', 'kW']]],
  ['PV & inverter', [
    ['Ppv', 'Công suất đỉnh PV', 'num', 'kWc'], ['Pinv', 'Công suất AC inverter', 'num', 'kW'], ['pvNs', 'Số tấm nối tiếp', 'num', 'tấm'], ['pvVoc', 'Voc một tấm (STC)', 'num', 'V'],
    ['pvBeta', 'Hệ số nhiệt Voc', 'num', '%/°C'], ['pvTmin', 'Nhiệt độ thấp nhất', 'num', '°C'], ['invVdcMax', 'Điện áp DC tối đa inverter', 'num', 'V'], ['invMpptMin', 'MPPT min', 'num', 'V'], ['invMpptMax', 'MPPT max', 'num', 'V'],
    ['invRegMap', 'Đã có register map inverter (đọc P, ghi giới hạn P)', 'chk']]],
  ['Pin, BMS, PCS', [
    ['Ebat', 'Dung lượng pin', 'num', 'kWh'], ['batV', 'Điện áp pin danh định', 'num', 'V'], ['batImax', 'Dòng sạc/xả liên tục', 'num', 'A'], ['Pcs', 'Công suất PCS', 'num', 'kW'],
    ['socMin', 'SOC min', 'num', '%'], ['socMax', 'SOC max', 'num', '%'], ['pcsGF', 'PCS grid-forming (tạo lưới)', 'chk'], ['pcsResync', 'PCS đồng bộ lại với lưới không gián đoạn', 'chk'], ['bmsCompat', 'Đã xác minh BMS–PCS trong danh sách tương thích', 'chk']]],
  ['Máy phát', [['gen', 'Có máy phát', 'chk'], ['Sgen', 'Công suất máy phát', 'num', 'kVA'], ['genSync', 'Có bộ đồng bộ', 'chk'], ['genParallel', 'Muốn vận hành song song với lưới', 'chk']]],
  ['Tải & số lượng điều khiển', [['Pm', 'Công suất động cơ', 'num', 'kW'], ['rlSteps', 'Số bậc tải điện trở (mỗi bậc = 1 DO + 1 DI)', 'num', 'bậc'], ['rlStep', 'Công suất mỗi bậc', 'num', 'kW'], ['Plp', 'Tải ưu tiên', 'num', 'kW'], ['ev', 'Có trạm sạc EV', 'chk'], ['Pev', 'Công suất EV', 'num', 'kW']]],
  ['Chức năng mong muốn', [['island', 'Vận hành đảo khi mất lưới', 'chk'], ['ups', 'UPS cho nguồn điều khiển', 'chk'], ['remoteBreaker', 'Cắt máy cắt tổng QF0 từ xa', 'chk'], ['remoteBreakerClose', '…và ĐÓNG QF0 từ xa', 'chk'], ['breakerMotor', 'QF0 có bộ truyền động động cơ', 'chk'], ['pyr', 'Cảm biến bức xạ', 'chk'], ['cabtemp', 'Nhiệt độ tủ Pt100', 'chk'], ['lora', 'Cảm biến LoRaWAN', 'chk']]],
  ['Truyền thông mong muốn', [['pccComm', 'Đồng hồ PCC giao tiếp', 'sel', '', [['tcp', 'Ethernet — Modbus TCP'], ['rtu', 'RS485 — Modbus RTU']]], ['rtuVia', 'Thiết bị RS485 được đọc qua', 'sel', '', [['module', 'Module RS485 của PLC'], ['gw', 'Gateway Modbus TCP/RTU'], ['none', 'Không có (PLC chỉ có Ethernet)']]]]],
  ['Chi tiết ghép nối', [['doType', 'Loại ngõ ra DO', 'sel', '', [['transistor', 'Transistor PNP 24 VDC 0,5 A'], ['relay', 'Relay 2 A']]], ['useKA', 'Dùng relay trung gian KA', 'chk'], ['coilV', 'Điện áp cuộn contacteur', 'sel', '', [['230VAC', '230 VAC'], ['24VDC', '24 VDC']]],
    ['vfdDiLogic', 'Logic DI biến tần', 'sel', '', [['PNP', 'PNP (source)'], ['NPN', 'NPN (sink)']]], ['ctOut', 'Ngõ ra CT', 'sel', '', [['5A', '5 A'], ['1A', '1 A'], ['333mV', '333 mV']]], ['meterIn', 'Ngõ vào dòng đồng hồ', 'sel', '', [['5A', '5 A'], ['1A', '1 A'], ['333mV', '333 mV']]],
    ['pyrOut', 'Ngõ ra cảm biến bức xạ', 'sel', '', [['4-20', '4–20 mA'], ['0-10', '0–10 V']]], ['aiPyrCh', 'Cấu hình kênh AI', 'sel', '', [['4-20', '4–20 mA'], ['0-10', '0–10 V']]], ['psuA', 'Dòng định mức PSU 24 V', 'num', 'A'], ['spare', 'Dự phòng I/O', 'num', '%']]]
];
SG.render.selector = function (el) {
  el.innerHTML = SG.head('Chọn thiết bị và kiểm tra tương thích', 'Thay đổi thông số — xem yêu cầu, I/O, phụ kiện thiếu và điểm chưa đủ dữ liệu',
    'Mọi thay đổi được lưu trong trình duyệt và cập nhật sơ đồ, BOM, bảng I/O, HMI. Dòng điện chỉ là tính SƠ BỘ: không kết luận máy cắt hay tiết diện cáp đã phù hợp.') + `
  <div class="grid" style="grid-template-columns:minmax(0,380px) minmax(0,1fr);align-items:start" id="sel-grid">
    <div class="stack" id="sel-form"></div><div class="stack" id="sel-res" style="gap:14px"></div></div>`;
  if (window.innerWidth < 1000) el.querySelector('#sel-grid').style.gridTemplateColumns = '1fr';
  const form = el.querySelector('#sel-form');
  form.innerHTML = `<div class="row"><button class="btn" id="sel-reset">Khôi phục cấu hình tham chiếu</button></div>` + SG.FORM.map(([g, fs], gi) => `<details class="card" ${gi < 2 || gi === 5 ? 'open' : ''}><summary>${g}</summary><div class="grid g2" style="margin-top:10px">${fs.map(([k, n, t, u, opts]) => {
    const v = SG.cfg[k];
    if (t === 'chk') return `<label class="cb" style="grid-column:1/-1"><input type="checkbox" id="f-${k}" data-k="${k}" ${v ? 'checked' : ''}> ${n}</label>`;
    if (t === 'sel') return `<label class="f">${n}<select id="f-${k}" data-k="${k}">${opts.map(o => `<option value="${o[0]}" ${String(o[0]) === String(v) ? 'selected' : ''}>${o[1]}</option>`).join('')}</select></label>`;
    return `<label class="f">${n}${u ? ' (' + u + ')' : ''}<input type="number" step="any" id="f-${k}" data-k="${k}" value="${v == null ? '' : v}"></label>`;
  }).join('')}</div></details>`).join('');
  form.querySelectorAll('[data-k]').forEach(inp => inp.onchange = () => {
    const k = inp.dataset.k; let v;
    if (inp.type === 'checkbox') v = inp.checked;
    else if (inp.tagName === 'SELECT') v = isNaN(+inp.value) ? inp.value : +inp.value;
    else v = inp.value === '' ? null : +inp.value;
    if (k === 'rlSteps' && v != null) v = Math.max(1, Math.min(6, Math.round(v)));
    SG.cfg[k] = v; SG.saveCfg(); results();
  });
  form.querySelector('#sel-reset').onclick = () => { SG.cfg = Object.assign({}, SG.defaultCfg); SG.saveCfg(); SG.render.selector(el); };
  results();
  function results() {
    const c = SG.cfg, r = SG.r, ck = SG.checks(c, r), res = el.querySelector('#sel-res');
    const cnt = s => ck.filter(x => x.status === s).length;
    const devs = SG.devices.filter(SG.devOn);
    const ib = [['PCC (theo công suất đấu nối)', r.Ib.PCC, c.phases === 3 ? `${c.Sgrid} kVA / (√3 × ${c.U} V)` : `${c.Sgrid} kVA / ${Math.round(c.U / Math.sqrt(3))} V`],
      ['Nhánh PV', r.Ib.PV, `${c.Pinv} kW / (√3 × ${c.U} × 1,0)`], ['Nhánh pin (PCS)', r.Ib.BAT, `${c.Pcs} kW / (√3 × ${c.U} × 1,0)`],
      ['Động cơ (qua biến tần)', r.Ib.M1, `${c.Pm} / 0,85 kW / (√3 × ${c.U} × 0,82)`], ['Tải điện trở (toàn bộ)', r.Ib.RL, `${c.rlSteps} × ${c.rlStep} kW / (√3 × ${c.U})`],
      ['Tải ưu tiên', r.Ib.LP, `${c.Plp} kW / (√3 × ${c.U} × 0,95)`]].concat(c.ev ? [['EV (1 pha!)', r.Ib.EV, `${c.Pev} kW / ${Math.round(c.U / Math.sqrt(3))} V`]] : []).concat(c.gen ? [['Máy phát', r.Ib.GEN, `${c.Sgen} kVA / (√3 × ${c.U})`]] : []);
    const noon = SG.solve(c, { mode: 'GRID', irr: 0.9, soc: 50, rlOn: 1, auto: true });
    const night = SG.solve(c, { mode: 'GRID', irr: 0, soc: c.socMin, rlOn: c.rlSteps, m1Run: true, m1Spd: 100, evOn: c.ev, auto: true });
    const isl = c.island && c.pcsGF ? SG.solve(c, { mode: 'ISLAND', irr: 0.3, soc: 60, m1Run: true, m1Spd: 100, auto: true }) : null;
    const bal = (o) => `<td class="num">${SG.fx(o.pv)}</td><td class="num">${SG.fx(o.bat)}</td><td class="num">${SG.fx(o.grid)}</td><td class="num">${SG.fx(o.loads.total)}</td><td>${o.shed > 0 ? 'Cần sa thải ' + SG.fx(o.shed) + ' kW' : o.curtail > 0 ? 'Giới hạn PV ' + SG.fx(o.curtail) + ' kW' : '—'}</td>`;
    const missing = ck.filter(x => x.status === 'ko');
    const unk = ck.filter(x => x.status === 'unk');
    res.innerHTML = `
    <div class="card"><h3>Kết quả kiểm tra</h3><div class="sumrow">${SG.stChip('ok', cnt('ok') + ' tương thích theo dữ liệu hiện có')}${SG.stChip('ko', cnt('ko') + ' không tương thích')}${SG.stChip('unk', cnt('unk') + ' chưa đủ thông tin')}</div>
      <p class="small muted" style="margin-top:6px">Không có kiểm tra nào kết luận “tương thích” chỉ vì hai thiết bị cùng hãng.</p></div>
    <div class="tbl-wrap"><table><tr><th style="width:120px">Trạng thái</th><th>Kiểm tra</th><th>Lý do / dữ liệu cần bổ sung</th></tr>${ck.map(x => `<tr><td>${SG.stChip(x.status, x.status === 'ok' ? 'Tương thích' : x.status === 'ko' ? 'Không tương thích' : 'Chưa đủ thông tin')}</td><td><b>${SG.esc(x.title)}</b><div class="small muted">${SG.esc(x.cat)} · ${x.devs.filter(id => SG.dev(id) && SG.devOn(SG.dev(id))).map(SG.devChip).join(' ')}</div></td><td class="small">${SG.esc(x.reason)}${x.need.length ? `<div style="margin-top:4px"><b>Cần bổ sung:</b> ${x.need.map(SG.esc).join('; ')}</div>` : ''}${x.fix ? `<div style="margin-top:4px"><b>Hướng xử lý:</b> ${SG.esc(x.fix)}</div>` : ''}</td></tr>`).join('')}</table></div>
    <div class="grid g2">
      <div class="card"><h3>Phụ kiện / thiết bị còn thiếu</h3>${missing.length ? '<ul class="small">' + missing.map(x => `<li><b>${SG.esc(x.title)}</b>: ${SG.esc(x.fix || x.reason)}</li>`).join('') + '</ul>' : '<p class="small muted">Không có mục “không tương thích”.</p>'}</div>
      <div class="card"><h3>Những điểm chưa đủ dữ liệu để kết luận</h3><ul class="small">${unk.map(x => `<li><b>${SG.esc(x.title)}</b>: ${x.need.map(SG.esc).join('; ') || SG.esc(x.reason)}</li>`).join('')}</ul></div>
    </div>
    <div class="card"><h3>Dòng điện sơ bộ (Ib)</h3><p class="small muted">Công thức: 3 pha I = P / (√3 × U × cosφ); 1 pha I = P / (U<sub>pha</sub> × cosφ). Giả định cosφ và hiệu suất ghi trong cột công thức. Đây là ĐẦU VÀO cho việc chọn bảo vệ, không phải kết luận.</p>
      <div class="tbl-wrap" style="margin-top:8px"><table><tr><th>Nhánh</th><th class="num">Ib (A)</th><th>Công thức</th></tr>${ib.map(x => `<tr><td>${x[0]}</td><td class="num mono">${SG.fx(x[1])}</td><td class="mono small">${x[2]}</td></tr>`).join('')}</table></div>
      ${c.ev ? `<div class="note small" style="margin-top:8px">EV 1 pha ${SG.fx(r.Ib.EV)} A dồn lên một pha → mất cân bằng pha: pha chịu EV có thể tới ≈ ${SG.fx(r.Ib.worstPhase)} A khi mọi tải chạy. Kiểm tra cả dòng theo từng pha, không chỉ công suất tổng.</div>` : ''}
      <div class="note small" style="margin-top:8px">Để chọn máy cắt và cáp còn cần: Iz theo cách lắp, nhiệt độ, nhóm cáp; sụt áp theo chiều dài; Icc và điều kiện cắt sự cố; chọn lọc. Mọi giá trị trên được đánh dấu <b>cần kiểm chứng</b>.</div></div>
    <div class="card"><h3>Cân bằng công suất ở ba thời điểm</h3><p class="small muted">Theo quy ước dấu: P_BAT &gt; 0 xả, P_GRID &gt; 0 nhập. Tính bằng cùng hàm mô phỏng với HMI.</p>
      <div class="tbl-wrap" style="margin-top:8px"><table><tr><th>Tình huống</th><th class="num">P_PV</th><th class="num">P_BAT</th><th class="num">P_GRID</th><th class="num">ΣTải</th><th>Hành động EMS</th></tr>
      <tr><td>Trưa, 1 bậc tải, SOC 50 %</td>${bal(noon)}</tr><tr><td>Tối, mọi tải, SOC min</td>${bal(night)}</tr>${isl ? `<tr><td>Đảo, PV yếu, động cơ chạy</td>${bal(isl)}</tr>` : '<tr><td>Đảo</td><td colspan="5" class="muted">Không khả dụng với cấu hình hiện tại</td></tr>'}</table></div></div>
    <div class="grid g2">
      <div class="card"><h3>Bảng I/O và cổng cần dùng</h3><dl class="kv small"><dt>DI</dt><dd>${r.io.DI} tín hiệu → ${r.io.mDI} module 16 kênh (+${c.spare} %)</dd><dt>DO</dt><dd>${r.io.DO} tín hiệu → ${r.io.mDO} module 16 kênh</dd><dt>AI / AO</dt><dd>${r.io.AI} / ${r.io.AO}</dd><dt>Relay trung gian</dt><dd>${r.io.KA} KA</dd><dt>Dữ liệu truyền thông</dt><dd>${r.io.COM} nhóm biến</dd><dt>Ethernet</dt><dd>${r.eth.n} thiết bị → switch ${r.eth.ports} cổng</dd><dt>RS485</dt><dd>${r.rs485.master ? r.rs485.master + ' → ' + r.rs485.slaves.join(' → ') : '<b style="color:var(--ko)">Không có master</b>'}</dd></dl><button class="btn sm" data-goto="io" style="margin-top:8px">Bảng I/O đầy đủ →</button></div>
      <div class="card"><h3>Tiêu thụ 24 VDC (ước lượng)</h3><div class="tbl-wrap"><table>${r.aux.list.map(x => `<tr><td>${SG.esc(x[0])}</td><td class="num mono">${SG.fx(x[1], 2)} A</td></tr>`).join('')}<tr><td><b>Tổng</b></td><td class="num mono"><b>${SG.fx(r.aux.I, 2)} A</b></td></tr></table></div><p class="small muted" style="margin-top:6px">Giá trị giả định — thay bằng datasheet.</p></div>
    </div>
    <div class="card"><h3>Nhóm thiết bị cần thiết (${devs.length})</h3><div class="grid g3" style="margin-top:8px">${[1, 2, 3].map(lb => `<div><h4>${SG.LBL[lb]}</h4><div class="row" style="margin-top:6px">${devs.filter(d => d.lb === lb).map(d => SG.devChip(d.id)).join('')}</div></div>`).join('')}</div></div>`;
  }
};

/* ======================= 5. TRUYỀN THÔNG ======================= */
SG.render.comms = function (el, arg) {
  const st = SG.comState = SG.comState || { sel: 'mbrtu', trace: 'P_PV' };
  if (arg) st.sel = arg;
  el.innerHTML = SG.head('Truyền thông và kết nối', 'Bốn lớp của một kết nối — và vì sao “cùng RJ45” hay “cùng Modbus” chưa đủ',
    'Ethernet và Modbus không phải hai lựa chọn cùng cấp: Ethernet là mạng, Modbus là giao thức ứng dụng có thể chạy trên Ethernet (Modbus TCP) hoặc trên RS485 (Modbus RTU).') + `
  <div class="layers4">${SG.commLayers.map(l => `<div><span class="n">${l.n}</span><b>${l.q}</b><span class="small">${SG.esc(l.ex)}</span><span class="small muted">${SG.T(l.note)}</span></div>`).join('')}</div>
  <div class="grid" style="grid-template-columns:260px minmax(0,1fr);align-items:start" id="cm-grid">
    <div class="card" style="padding:8px"><div class="scen-list" id="cm-list"></div></div><div class="card" id="cm-det"></div></div>
  <div class="card"><h3>Đường đi của một biến</h3><p class="small muted">Chọn một biến để xem toàn bộ đường đi: thiết bị đo → giao tiếp → PLC/EMS → HMI.</p>
    <div class="row" style="margin:10px 0" id="tr-btns">${SG.traces.map(t => `<button class="btn sm" data-t="${t.id}">${SG.esc(t.n)}</button>`).join('')}</div>
    <div class="grid g2" style="align-items:start"><div id="tr-dg" style="height:460px"></div><div class="flow" id="tr-steps"></div></div></div>`;
  if (window.innerWidth < 900) el.querySelector('#cm-grid').style.gridTemplateColumns = '1fr';
  const list = el.querySelector('#cm-list'), det = el.querySelector('#cm-det');
  const drawList = () => { list.innerHTML = SG.comms.map((c, i) => `<button data-c="${c.id}" class="${c.id === st.sel ? 'on' : ''}"><span class="n">${i + 1}</span><span>${SG.esc(c.n)}</span>${c.ext ? '<span class="chip lb3">mở rộng</span>' : ''}</button>`).join(''); list.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { st.sel = b.dataset.c; drawList(); drawDet(); }); };
  const drawDet = () => {
    const c = SG.comms.find(x => x.id === st.sel);
    const used = SG.allLinks().filter(l => c.used.some(u => u === l.id || (u.endsWith('-') && l.id.startsWith(u))));
    det.innerHTML = `<h2>${SG.esc(c.n)}</h2>${c.why ? `<div class="note" style="margin-top:8px">${SG.esc(c.why)}</div>` : ''}
      <div class="tbl-wrap" style="margin-top:10px"><table>${SG.commLayers.map(l => `<tr><th style="width:190px">${l.n}</th><td>${SG.esc(c.lv[l.id])}</td></tr>`).join('')}</table></div>
      <div class="grid g2" style="margin-top:12px">
        <div class="stack"><h4>Cổng cần có ở hai đầu</h4><ul class="small">${c.ends.map(x => `<li>${SG.esc(x)}</li>`).join('')}</ul>
          <h4>Loại dây và cấu trúc mạng</h4><p class="small">${SG.esc(c.cable)}</p>
          <h4>Vai trò</h4><p class="small">${SG.esc(c.roles)}</p>
          <h4>Dữ liệu trao đổi</h4><ul class="small">${c.data.map(x => `<li>${SG.esc(x)}</li>`).join('')}</ul>
          <h4>Switch / gateway / module bổ sung</h4><p class="small">${SG.esc(c.extra)}</p></div>
        <div class="stack"><h4>Tham số cần cấu hình</h4><ul class="small">${c.params.map(x => `<li>${SG.esc(x)}</li>`).join('')}</ul>
          <h4>Giới hạn</h4><ul class="small">${c.limits.map(x => `<li>${SG.esc(x)}</li>`).join('')}</ul>
          <h4>Lỗi cấu hình thường gặp</h4><ul class="small">${c.errors.map(x => `<li>${SG.esc(x)}</li>`).join('')}</ul></div></div>
      ${used.length ? `<h4 style="margin-top:12px">Dùng trong mô hình hiện tại</h4><div class="row" style="margin-top:6px">${used.map(l => `<button class="btn sm" data-goto="diagram" data-arg="link:${l.id}">${SG.esc(l.a.d)} → ${SG.esc(l.b.d)}</button>`).join('')}</div>` : '<p class="small muted" style="margin-top:12px">Không dùng trong cấu hình hiện tại.</p>'}`;
  };
  drawList(); drawDet();
  const D = SG.mini(el.querySelector('#tr-dg'), { view: 'all' });
  const drawTrace = () => {
    const t = SG.traces.find(x => x.id === st.trace);
    el.querySelectorAll('#tr-btns [data-t]').forEach(b => b.classList.toggle('on', b.dataset.t === st.trace));
    const ids = new Set(); t.steps.forEach(x => { ids.add(x.d); if (x.l) ids.add(x.l); });
    D.setHighlight(ids); D.focus([...ids].filter(i => D.node[i]));
    el.querySelector('#tr-steps').innerHTML = t.steps.map((x, i) => `<div class="stp"><i>${i + 1}</i><span><span class="mono">${x.d}</span><br>${SG.T(x.t)}</span></div>`).join('');
  };
  el.querySelectorAll('#tr-btns [data-t]').forEach(b => b.onclick = () => { st.trace = b.dataset.t; drawTrace(); });
  drawTrace();
};
