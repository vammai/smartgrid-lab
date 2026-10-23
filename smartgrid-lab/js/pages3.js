/* TRANG 4 MỞ RỘNG: Cấu hình hệ thống · Thiết bị đầu vào · Gợi ý sản phẩm · Tương thích theo cặp · I/O & truyền thông · Xuất */
SG.SELTABS = [['sys', 'Cấu hình hệ thống'], ['input', 'Thiết bị đầu vào'], ['suggest', 'Gợi ý sản phẩm'], ['pairs', 'Tương thích theo cặp'], ['io', 'I/O & truyền thông'], ['export', 'Xuất kết quả']];
SG.renderSys = SG.render.selector;
SG.render.selector = function (el, arg) {
  const st = SG.selSt = SG.selSt || { tab: 'input' };
  if (arg && SG.SELTABS.some(t => t[0] === arg)) st.tab = arg;
  el.innerHTML = SG.head('Chọn thiết bị và kiểm tra tương thích', 'Nhập thiết bị của bạn — nhận yêu cầu, gợi ý sản phẩm đã xác minh và kiểm tra theo cặp',
    'Mô hình tham chiếu là ví dụ ban đầu. Khi bạn đổi thiết bị hoặc thông số, mọi gợi ý, kiểm tra, bảng I/O, sơ đồ và HMI được tính lại. Sản phẩm chỉ được gợi ý khi đã đối chiếu tài liệu chính hãng; vị trí chưa có sản phẩm xác minh sẽ hiện yêu cầu kỹ thuật.') +
    `<div class="tabs" id="sel-tabs">${SG.SELTABS.map(t => `<button data-t="${t[0]}" class="${t[0] === st.tab ? 'on' : ''}">${t[1]}</button>`).join('')}</div><div id="sel-body" class="stack" style="gap:14px"></div><div class="row small muted" style="gap:14px">${['verified', 'prelim', 'miss', 'ko'].map(s => SG.st4(s)).join('')}<span>“Đã xác minh” chỉ khi mọi thông số dùng để kiểm tra có tài liệu (catalogue chính hãng hoặc PDF bạn tải, có trang).</span></div>`;
  el.querySelectorAll('#sel-tabs [data-t]').forEach(b => b.onclick = () => { st.tab = b.dataset.t; SG.render.selector(el); });
  const body = el.querySelector('#sel-body');
  SG.refresh();
  ({ sys: () => SG.renderSys(body), input: () => SG.tabInput(body), suggest: () => SG.tabSuggest(body), pairs: () => SG.tabPairs(body), io: () => SG.tabIO(body), export: () => SG.tabExport(body) })[st.tab]();
};
SG.srcChip = x => { const s = x && x.s || 'manual'; return `<span class="chip" title="${SG.esc(x && x.ref || '')}" style="${s === 'doc' || s === 'catalog' ? 'border-color:var(--ok);color:var(--ok)' : s === 'assume' ? 'border-style:dashed' : ''}">${SG.SRC[s]}${x && x.ref ? ' · ' + SG.esc(x.ref) : ''}</span>`; };

/* ---------------- TAB: THIẾT BỊ ĐẦU VÀO ---------------- */
SG.tabInput = function (el) {
  const P = SG.proj;
  const secCard = sec => {
    const D = SG.PFIELDS[sec], S = P[sec];
    const stSel = sec === 'grid' ? '<span class="chip">Lưới hiện hữu</span>' : `<select data-status="${sec}" style="width:auto" aria-label="Trạng thái ${D.n}"><option value="have" ${S.status === 'have' ? 'selected' : ''}>Đã có — phải giữ lại</option><option value="select" ${S.status === 'select' ? 'selected' : ''}>Cần lựa chọn</option><option value="none" ${S.status === 'none' ? 'selected' : ''}>Không dùng</option></select>`;
    return `<details class="card" open><summary>${D.n}</summary><div class="row" style="margin:8px 0">${stSel}${sec !== 'grid' ? `<button class="btn sm" data-pdf="${sec}">Nhập từ PDF / datasheet</button>` : ''}<span class="small muted">${S.status === 'have' ? 'Thiết bị được giữ cố định; các thiết bị khác được chọn cho phù hợp với nó.' : S.status === 'select' ? 'Thông số dùng làm yêu cầu; có thể thay khi chọn sản phẩm.' : ''}</span></div>
      <div id="pdf-${sec}"></div>
      <div class="tbl-wrap"><table><tr><th>Thông số</th><th style="width:170px">Giá trị</th><th>Đơn vị</th><th>Nguồn</th></tr>${D.f.map(([k, n, u]) => { const x = S[k] || { v: '', s: 'manual' }; const inp = u && u.startsWith('sel:') ? `<select data-f="${sec}.${k}">${u.slice(4).split('|').map(o => { const [a, b] = o.split('='); return `<option value="${a}" ${x.v === a ? 'selected' : ''}>${b}</option>`; }).join('')}</select>` : `<input type="${u === 'text' ? 'text' : 'number'}" step="any" data-f="${sec}.${k}" value="${SG.esc(x.v == null ? '' : x.v)}">`; return `<tr><td>${n}</td><td>${inp}</td><td class="small muted">${u && !u.startsWith('sel:') && u !== 'text' ? u : ''}</td><td>${SG.srcChip(x)}</td></tr>`; }).join('')}</table></div></details>`;
  };
  const R = SG._R;
  el.innerHTML = `<div class="note info">Mặc định là thông số của mô hình tham chiếu, đánh dấu <b>Giả định ví dụ</b>. Sửa một ô → nguồn chuyển thành <b>Nhập tay</b>. Nhập từ PDF → <b>Tài liệu</b> kèm trang. Chỉ khi các thông số dùng để kiểm tra đều đến từ tài liệu, kết quả mới có thể là “đã xác minh”.</div>
  <div class="grid g2" style="align-items:start">${['grid', 'pv', 'bat', 'motor'].map(secCard).join('')}</div>
  <div class="card"><h3>Tải</h3><p class="small muted">Mỗi tải sinh tín hiệu I/O theo yêu cầu điều khiển, và một mạch bảo vệ.</p>
    <div class="tbl-wrap" style="margin-top:8px"><table id="ld-t"><tr><th>Mã</th><th>Tên</th><th>P (kW)</th><th>U (V)</th><th>Pha</th><th>Loại</th><th>I khởi động (A)</th><th>Ưu tiên</th><th>Điều khiển</th><th>Số bậc</th><th>Đo riêng</th><th></th></tr>
    ${P.loads.map((l, i) => `<tr><td class="mono">${l.id}</td><td><input type="text" data-l="${i}.n" value="${SG.esc(l.n)}"></td><td><input type="number" step="any" data-l="${i}.P" value="${l.P}"></td><td><input type="number" data-l="${i}.U" value="${l.U}"></td><td><select data-l="${i}.phases"><option ${+l.phases === 3 ? 'selected' : ''}>3</option><option ${+l.phases === 1 ? 'selected' : ''}>1</option></select></td>
      <td><select data-l="${i}.type">${Object.entries(SG.LOADTYPES).map(([k, n]) => `<option value="${k}" ${l.type === k ? 'selected' : ''}>${n}</option>`).join('')}</select></td><td><input type="number" step="any" data-l="${i}.Istart" value="${l.Istart == null ? '' : l.Istart}" placeholder="—"></td>
      <td><input type="checkbox" data-l="${i}.prio" ${l.prio ? 'checked' : ''} aria-label="Ưu tiên"></td><td><select data-l="${i}.ctrl">${Object.entries(SG.LOADCTRL).map(([k, n]) => `<option value="${k}" ${l.ctrl === k ? 'selected' : ''}>${n}</option>`).join('')}</select></td>
      <td><input type="number" min="1" max="8" data-l="${i}.steps" value="${l.steps || 1}" style="width:60px"></td><td><input type="checkbox" data-l="${i}.meas" ${l.meas ? 'checked' : ''} aria-label="Đo riêng"></td><td><button class="btn sm" data-del="${i}" aria-label="Xóa tải">✕</button></td></tr>`).join('')}</table></div>
    <div class="row" style="margin-top:8px"><button class="btn" id="ld-add">+ Thêm tải</button><button class="btn" id="pj-reset">Khôi phục mô hình tham chiếu</button><span class="small muted">${R ? 'Tổng tải: ' + SG.fx(P.loads.reduce((a, l) => a + (+l.P || 0), 0)) + ' kW; động cơ ' + (SG.pv('motor', 'P') || 0) + ' kW' : ''}</span></div></div>`;
  const rerender = () => SG.render.selector(el.closest('#page') || document.getElementById('page'));
  el.querySelectorAll('[data-f]').forEach(inp => inp.onchange = () => { const [sec, k] = inp.dataset.f.split('.'); const raw = inp.value; const isNum = inp.type === 'number'; SG.proj[sec][k] = { v: raw === '' ? null : isNum ? +raw : raw, s: 'manual' }; SG.saveProj(); SG.impactNote('Đã đổi ' + SG.PFIELDS[sec].n + ' — ' + k); rerender(); });
  el.querySelectorAll('[data-status]').forEach(s => s.onchange = () => { SG.proj[s.dataset.status].status = s.value; SG.saveProj(); rerender(); });
  el.querySelectorAll('[data-l]').forEach(inp => inp.onchange = () => { const [i, k] = inp.dataset.l.split('.'); const l = SG.proj.loads[+i]; l[k] = inp.type === 'checkbox' ? inp.checked : (inp.type === 'number' ? (inp.value === '' ? null : +inp.value) : (k === 'phases' ? +inp.value : inp.value)); SG.saveProj(); rerender(); });
  el.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { SG.proj.loads.splice(+b.dataset.del, 1); SG.saveProj(); rerender(); });
  el.querySelector('#ld-add').onclick = () => { const n = Math.max(0, ...SG.proj.loads.map(l => +l.id.slice(1) || 0)) + 1; SG.proj.loads.push({ id: 'L' + n, n: 'Tải mới', P: 1, U: 400, phases: 3, type: 'R', Istart: null, prio: false, ctrl: 'onoff', meas: false, steps: 1 }); SG.saveProj(); rerender(); };
  el.querySelector('#pj-reset').onclick = () => { SG.proj = SG.defaultProj(); SG.saveProj(); rerender(); };
  el.querySelectorAll('[data-pdf]').forEach(b => b.onclick = () => SG.pdfImport(b.dataset.pdf, el.querySelector('#pdf-' + b.dataset.pdf), rerender));
};

/* ---------------- NHẬP PDF ---------------- */
SG.loadPdfJs = function () {
  if (window.pdfjsLib) return Promise.resolve();
  const add = src => new Promise((ok, ko) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => ko(new Error('Không tải được ' + src)); document.head.appendChild(s); });
  const base = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  return add(base + 'pdf.min.js').then(() => add(base + 'pdf.worker.min.js')).then(() => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = base + 'pdf.worker.min.js'; });
};
SG.pdfImport = function (sec, box, done) {
  box.innerHTML = `<div class="card" style="background:var(--surface3)"><b>Nhập ${SG.PFIELDS[sec].n} từ PDF</b><p class="small muted">Văn bản được đọc ngay trong trình duyệt (không gửi đi đâu). Công cụ chỉ đề xuất giá trị nằm trên cùng dòng với nhãn thông số và hiện số trang. Bảng nhiều cột (nhiều model) sẽ cho nhiều ứng viên: bạn chọn đúng cột. PDF dạng ảnh (scan) không đọc được.</p><input type="file" accept="application/pdf" id="pdf-file-${sec}" aria-label="Chọn tệp PDF"><div id="pdf-res-${sec}" style="margin-top:8px"></div></div>`;
  box.querySelector('input').onchange = async e => {
    const f = e.target.files[0]; if (!f) return; const out = box.querySelector('#pdf-res-' + sec);
    out.innerHTML = '<p class="small">Đang đọc…</p>';
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
      const label = k => (SG.PFIELDS[sec].f.find(x => x[0] === k) || [k, k])[1];
      out.innerHTML = `<p class="small"><b>${SG.esc(f.name)}</b> — ${doc.numPages} trang, ${lines.length} dòng văn bản.${lines.length < 5 ? ' Rất ít văn bản: có thể là PDF dạng ảnh.' : ''}</p>
        <div class="tbl-wrap"><table><tr><th>Thông số</th><th>Ứng viên tìm thấy (trang · dòng)</th><th>Giá trị xác nhận</th><th>Xác nhận</th></tr>${res.map(r => `<tr><td>${label(r.k)}</td><td class="small">${r.c.length ? r.c.map((x, j) => `<label class="cb"><input type="radio" name="pc-${r.k}" value="${SG.esc(x.v)}" data-pg="${x.p}" ${j === 0 && r.c.length === 1 ? 'checked' : ''}> <span><b>${SG.esc(x.v)}</b> · tr. ${x.p} · <span class="muted">${SG.esc(x.s.slice(0, 90))}</span></span></label>`).join('') : '<span class="muted">Không tìm thấy — để trống, không đoán.</span>'}</td><td><input type="${r.u === 'text' ? 'text' : 'number'}" step="any" data-pv="${r.k}" style="width:110px"></td><td><input type="checkbox" data-ok="${r.k}" aria-label="Xác nhận"></td></tr>`).join('')}</table></div>
        <div class="row" style="margin-top:8px"><button class="btn pri" id="pdf-save-${sec}">Ghi các dòng đã xác nhận</button><span class="small muted">Chọn một ứng viên (hoặc gõ giá trị bạn đọc thấy trong tài liệu) rồi tích “Xác nhận”.</span></div>`;
      out.querySelectorAll('input[type=radio]').forEach(r => r.onchange = () => { const inp = out.querySelector(`[data-pv="${r.name.slice(3)}"]`); inp.value = r.value; inp.dataset.pg = r.dataset.pg; });
      out.querySelectorAll('input[type=radio]:checked').forEach(r => r.onchange());
      out.querySelector('#pdf-save-' + sec).onclick = () => {
        let n = 0;
        out.querySelectorAll('[data-ok]:checked').forEach(cb => { const k = cb.dataset.ok, inp = out.querySelector(`[data-pv="${k}"]`); if (inp.value === '') return; SG.proj[sec][k] = { v: inp.type === 'number' ? +inp.value : inp.value, s: 'doc', ref: f.name + (inp.dataset.pg ? ' tr. ' + inp.dataset.pg : ' (nhập tay từ tài liệu)') }; n++; });
        SG.saveProj(); SG.impactNote('Đã ghi ' + n + ' thông số ' + SG.PFIELDS[sec].n + ' từ ' + f.name); done();
      };
    } catch (err) { out.innerHTML = `<div class="note ko small">Không đọc được PDF: ${SG.esc(err.message)}. Trong trang xem Artifact, thư viện đọc PDF có thể bị chặn — hãy dùng bản trên GitHub Pages hoặc mở file cục bộ, hoặc nhập tay kèm ghi chú trang.</div>`; }
  };
};

/* ---------------- TÁC ĐỘNG KHI THAY ĐỔI ---------------- */
SG.pairSnap = () => { const m = {}; SG.pairs().forEach(p => { m[p.a + '|' + (p.slot || p.b)] = { st: p.st, b: p.b }; }); return m; };
SG.impactNote = function (what, before) {
  if (!before) { SG._impact = { what, list: [] }; return; }
  SG.refresh(); const after = SG.pairSnap(); const L = [];
  Object.keys(after).forEach(k => { const a = before[k], b = after[k]; if (!a) L.push(['Mới', k.split('|')[0] + ' ↔ ' + b.b, b.st]); else if (a.st !== b.st) L.push([SG.ST4[a.st] + ' → ' + SG.ST4[b.st], k.split('|')[0] + ' ↔ ' + b.b, b.st]); });
  SG._impact = { what, list: L };
};
SG.impactHtml = () => SG._impact ? `<div class="note info small"><b>Tác động của thay đổi:</b> ${SG.esc(SG._impact.what)}.${SG._impact.list.length ? '<ul>' + SG._impact.list.map(x => `<li>${SG.esc(x[1])}: ${SG.esc(x[0])}</li>`).join('') + '</ul>' : ' Các kết quả liên quan đã được tính lại.'} <button class="btn sm" onclick="SG._impact=null;this.parentNode.remove()">Đóng</button></div>` : '';

/* ---------------- TAB: GỢI Ý SẢN PHẨM ---------------- */
SG.SLOTSIDES = { pvinv: ['Dàn PV (DC, đầu nối PV) → hộp DC', 'QF-PV → thanh cái AC'], pcs: ['Pin (DC) + BMS (CAN/RS485)', 'QF-BAT → thanh cái AC'], vfd: ['QF-M1 / KM-M1 (AC vào)', 'Động cơ (cáp có giáp)'], 'meter-pcc': ['CT + mạch đo áp tại PCC', 'PLC/EMS (Modbus)'], 'meter-branch': ['Nhánh tải (đo trực tiếp)', 'Bus RS485 → PLC'], plc: ['Thiết bị trường (DI/DO/AI/AO)', 'Switch Ethernet, bus RS485, HMI/EMS'], hmi: ['Switch Ethernet', 'PLC (driver)'], switch: ['PLC, HMI, EMS', 'Thiết bị Modbus TCP'], psu: ['QF-AUX 230 VAC', 'Phân phối 24 V (F24)'] };
SG.SLOTKEYS = {
  pvinv: [['Pac', 'Công suất AC', 'W'], ['phases', 'Số pha', ''], ['Vdcmax', 'Vdc max', 'V'], ['mpptMin', 'MPPT min', 'V'], ['mpptMax', 'MPPT max', 'V'], ['nMppt', 'Số MPPT', ''], ['stringsPerMppt', 'Chuỗi / MPPT', ''], ['ImaxMppt', 'Imax / MPPT', 'A'], ['IscMaxMppt', 'Isc max / MPPT', 'A'], ['PdcMax', 'Pdc max', 'Wc'], ['comm', 'Truyền thông', 'list']],
  pcs: [['P', 'Công suất', 'W'], ['phases', 'Số pha', ''], ['VbatMin', 'V pin min', 'V'], ['VbatMax', 'V pin max', 'V'], ['IchMax', 'I sạc max', 'A'], ['IdisMax', 'I xả max', 'A'], ['gridForming', 'Grid-forming (1 = có)', 'bool'], ['comm', 'Truyền thông', 'list']],
  vfd: [['Umin', 'U min', 'V'], ['Umax', 'U max', 'V'], ['phasesIn', 'Số pha vào', ''], ['InHD', 'I ra (tải nặng)', 'A'], ['InND', 'I ra (tải nhẹ)', 'A'], ['ovHD', 'Quá tải 60 s', '%'], ['diLogic', 'Logic DI (source/sink)', 'list'], ['comm', 'Truyền thông', 'list']],
  'meter-pcc': [['Umax', 'U max', 'V'], ['Iin', 'Ngõ vào dòng (direct / CT 5 A…)', 'text'], ['Idirect', 'I đo trực tiếp max', 'A'], ['acc', 'Cấp chính xác', 'text'], ['comm', 'Truyền thông', 'list']],
  plc: [['diBase', 'DI tích hợp', ''], ['doBase', 'DO tích hợp', ''], ['doType', 'Loại DO (transistor source / relay)', 'text'], ['aiBase', 'AI tích hợp', ''], ['expModules', 'Số module mở rộng', ''], ['comm', 'Truyền thông', 'list'], ['serial', 'Cổng nối tiếp', 'text']],
  hmi: [['drivers', 'Driver / hãng PLC hỗ trợ', 'list'], ['comm', 'Cổng', 'list']], switch: [['ports', 'Số cổng', ''], ['Vin', 'Nguồn', 'text']], psu: [['Iout', 'Dòng ra', 'A'], ['dcok', 'Tiếp điểm DC-OK (1 = có)', 'bool']]
};
SG.SLOTKEYS['meter-branch'] = SG.SLOTKEYS['meter-pcc'];
SG.tabSuggest = function (el) {
  const R = SG._R;
  const card = s => {
    const sg = SG.suggest(s.id); const cur = SG.proj.choices[s.id];
    const chosen = SG.chosen(s.id);
    const prodBox = (c, i) => {
      const p = c.p, d = p.docs && p.docs[0], isSel = chosen && chosen.id === p.id;
      const main = Object.entries(p.specs).slice(0, 8).map(([k, x]) => `<span class="chip" title="${SG.esc((x && x.ref) || '')}${x && x.p ? ' — tr. ' + x.p : ''}">${k}: ${SG.esc(Array.isArray(x && x.v) ? x.v.join(', ') : (x && x.v != null ? x.v : x))}${x && x.u ? ' ' + x.u : ''}</span>`).join(' ');
      return `<div class="card stack" style="${isSel ? 'border-color:var(--accent);border-width:2px' : ''}"><div class="row" style="justify-content:space-between"><div><b>${SG.esc(p.brand)} — ${SG.esc(p.model)}</b><div class="small muted">${SG.esc(p.role || '')}${p.verifiedBy === 'user' ? ' · thiết bị bạn nhập' : ''}</div></div>${SG.st4(c.st)}</div>
        <div class="row">${main}</div>
        <dl class="kv small"><dt>Kết nối hai phía</dt><dd>${SG.esc((SG.SLOTSIDES[s.id] || ['—', '—']).join(' ↔ '))}</dd><dt>Dây / giao thức</dt><dd>${SG.esc(p.iface || '—')}</dd>
        <dt>Phần mềm</dt><dd>${(p.software || []).map(x => SG.esc(x.n) + ' — ' + SG.esc(x.role) + (x.lang && x.lang !== '—' ? ' (' + SG.esc(x.lang) + ')' : '') + ', giấy phép: ' + SG.esc(x.lic) + (x.verified === false ? ' <span class="chip">chưa đối chiếu tài liệu</span>' : '')).join('<br>') || '—'}</dd>
        <dt>Tài liệu</dt><dd>${(p.docs || []).map(x => `<a href="${x.url}" target="_blank" rel="noopener">${SG.esc(x.t)}</a> · kiểm tra ${x.date}`).join('<br>') || '<span class="muted">Không có — không thể “đã xác minh”</span>'}</dd></dl>
        <details><summary class="small">Lý do và điều kiện (${c.rows.filter(r => r.st === 'miss').length} còn thiếu)</summary><div class="tbl-wrap" style="margin-top:6px"><table>${c.rows.map(r => `<tr><td>${SG.st4(r.st, r.st === 'verified' ? 'Đạt' : r.st === 'prelim' ? 'Sơ bộ' : r.st === 'miss' ? 'Thiếu' : 'Không đạt')}</td><td class="small"><b>${SG.esc(r.n)}</b><br>Yêu cầu: ${SG.esc(r.need)}<br>${SG.esc(r.d || '')}</td></tr>`).join('')}</table></div>${(p.notes || []).length ? '<ul class="small">' + p.notes.map(n => '<li>' + SG.esc(n) + '</li>').join('') + '</ul>' : ''}</details>
        <div class="row">${isSel ? '<span class="small"><b>Đang dùng</b>' + (cur ? '' : ' (tự động: xếp hạng cao nhất)') + '</span>' : `<button class="btn sm" data-choose="${s.id}" data-pid="${p.id}">Chọn sản phẩm này</button>`}</div></div>`;
    };
    if (s.reqOnly) return SG.protCard(R);
    return `<div class="card stack" id="slot-${s.id}"><div class="row" style="justify-content:space-between"><div><h3>${SG.esc(s.n)}</h3><span class="small muted"><i>${SG.esc(s.fr)}</i></span></div><div class="row"><button class="btn sm" data-custom="${s.id}">Nhập thiết bị có sẵn / khác</button>${cur ? `<button class="btn sm" data-choose="${s.id}" data-pid="">Bỏ chọn</button>` : ''}</div></div>
      <details ${sg.cands.length ? '' : 'open'}><summary class="small">Yêu cầu kỹ thuật (${sg.reqs.length})</summary><div class="tbl-wrap" style="margin-top:6px"><table>${sg.reqs.map(q => `<tr><td style="width:40%">${SG.esc(q.n)}</td><td>${SG.esc(q.txt)}</td></tr>`).join('')}</table></div></details>
      <div id="custom-${s.id}"></div>
      ${sg.cands.length ? `<div class="grid ${sg.cands.length > 1 ? 'g2' : ''}">${sg.cands.map(prodBox).join('')}</div>` : `<div class="note">Chưa có sản phẩm đã xác minh nào trong catalogue đáp ứng vị trí này. Dùng bảng yêu cầu kỹ thuật ở trên để hỏi nhà cung cấp, hoặc nhập thiết bị bạn có.</div>`}
      ${sg.rejected.length ? `<details><summary class="small">Sản phẩm trong catalogue bị loại (${sg.rejected.length})</summary>${sg.rejected.map(c => `<div class="small" style="margin-top:6px"><b>${SG.esc(c.p.brand)} ${SG.esc(c.p.model)}</b> — ${c.rows.filter(r => r.st === 'ko').map(r => SG.esc(r.n + ': ' + r.d)).join('; ')}</div>`).join('')}</details>` : ''}</div>`;
  };
  const slots = SG.SLOTS.filter(s => s.when());
  const notNeeded = SG.SLOTS.filter(s => !s.when());
  el.innerHTML = SG.impactHtml() + `<div class="note small">Catalogue hiện có ${SG.products.length} sản phẩm đã đối chiếu tài liệu chính hãng (ngày kiểm tra ghi ở từng sản phẩm). Tối đa 3 gợi ý mỗi vị trí. Dữ liệu sản phẩm nằm trong <span class="mono">data/products.js</span> — thêm sản phẩm mới theo cùng mẫu.${notNeeded.length ? ' Không cần cho cấu hình hiện tại: ' + notNeeded.map(s => s.n).join(', ') + '.' : ''}</div>` + slots.map(card).join('');
  const rerender = () => SG.render.selector(document.getElementById('page'));
  el.querySelectorAll('[data-choose]').forEach(b => b.onclick = () => { const before = SG.pairSnap(); const s = b.dataset.choose; if (b.dataset.pid) SG.proj.choices[s] = b.dataset.pid; else delete SG.proj.choices[s]; SG.saveProj(); const p = SG.prod(b.dataset.pid) || (SG.proj.custom || {})[b.dataset.pid]; SG.impactNote(b.dataset.pid ? 'Chọn ' + (p ? p.brand + ' ' + p.model : '') + ' cho ' + SG.SLOTS.find(x => x.id === s).n : 'Bỏ chọn ' + s, before); rerender(); });
  el.querySelectorAll('[data-custom]').forEach(b => b.onclick = () => SG.customForm(b.dataset.custom, el.querySelector('#custom-' + b.dataset.custom), rerender));
};
SG.customForm = function (slot, box, done) {
  const K = SG.SLOTKEYS[slot] || [];
  box.innerHTML = `<div class="card" style="background:var(--surface3)"><b>Thiết bị có sẵn / thiết bị khác</b><p class="small muted">Nhập đúng giá trị từ datasheet. Để trống nếu không có — không đoán. Có link tài liệu và trang thì kết quả có thể là “đã xác minh”; không có thì tối đa “phù hợp sơ bộ”.</p>
    <div class="grid g3"><label class="f">Hãng<input type="text" id="cu-brand"></label><label class="f">Model<input type="text" id="cu-model"></label><label class="f">Link tài liệu chính thức<input type="text" id="cu-url" placeholder="https://…"></label>
    ${K.map(([k, n, u]) => `<label class="f">${n}${u && !['list', 'text', 'bool'].includes(u) ? ' (' + u + ')' : ''}${u === 'list' ? ' — cách nhau bằng dấu phẩy' : ''}<input type="${['list', 'text'].includes(u) ? 'text' : 'number'}" step="any" data-ck="${k}" data-u="${u}"></label>`).join('')}</div>
    <div class="row" style="margin-top:8px"><button class="btn pri" id="cu-save">Lưu và chọn</button></div></div>`;
  box.querySelector('#cu-save').onclick = () => {
    const id = 'user-' + slot + '-' + Date.now(), specs = {};
    box.querySelectorAll('[data-ck]').forEach(i => { if (i.value === '') return; const u = i.dataset.u; specs[i.dataset.ck] = { v: u === 'list' ? i.value.split(',').map(x => x.trim()).filter(Boolean) : u === 'text' ? i.value : u === 'bool' ? +i.value === 1 : +i.value }; });
    const url = box.querySelector('#cu-url').value.trim();
    SG.proj.custom = SG.proj.custom || {};
    SG.proj.custom[id] = { id, slot, brand: box.querySelector('#cu-brand').value || '(chưa rõ hãng)', model: box.querySelector('#cu-model').value || '(chưa rõ model)', role: 'Thiết bị người dùng nhập', verifiedBy: 'user', specs, docs: url ? [{ t: 'Tài liệu người dùng cung cấp', url, date: new Date().toISOString().slice(0, 10) }] : [], software: [], notes: [] };
    const before = SG.pairSnap(); SG.proj.choices[slot] = id; SG.saveProj(); SG.impactNote('Nhập thiết bị ' + SG.proj.custom[id].model, before); done();
  };
};
SG.protCard = function (R) {
  const pv = R.pv, v = SG.pv;
  const dc = [];
  if (SG.proj.pv.status !== 'none') {
    dc.push(['Sectionneur DC (interrupteur-sectionneur DC)', pv.VocCold ? 'Udc ≥ ' + Math.round(pv.VocCold) + ' V (Voc lạnh), Idc ≥ ' + (pv.Isc ? SG.fx(pv.Isc * (pv.Np || 1) * 1.25) + ' A (1,25 × Isc × chuỗi)' : '?') + ', loại sử dụng DC-PV' : 'Thiếu Voc/Tmin']);
    dc.push(['Fusible gPV', (pv.Np || 1) >= 3 ? 'Cần (≥ 3 chuỗi song song): theo IEC 60269-6, định mức theo Isc và dòng ngược tối đa của tấm' : 'Thường không cần với ' + (pv.Np || 1) + ' chuỗi/MPPT — kiểm chứng theo quy định và hướng dẫn inverter']);
    dc.push(['Parafoudre DC', 'Ucpv ≥ ' + (pv.VocCold ? Math.round(pv.VocCold) + ' V' : '?') + ', Up < khả năng chịu xung inverter']);
  }
  if (SG.proj.bat.status !== 'none') dc.push(['Bảo vệ DC pin (fusible / disjoncteur DC)', 'Theo nhà sản xuất pin: định mức điện áp DC ≥ ' + (v('bat', 'Vmax') || '?') + ' V, khả năng cắt ≥ dòng ngắn mạch pin (hỏi nhà cung cấp)']);
  const kms = [];
  SG.proj.loads.forEach(l => { const n = l.ctrl === 'steps' ? (+l.steps || 1) : l.ctrl === 'onoff' ? 1 : 0; if (!n) return; const c = R.circuits.find(x => x.id === 'QF-' + l.id); kms.push(['KM-' + l.id + (n > 1 ? ' ×' + n : ''), (l.type === 'motor' ? 'AC-3' : 'AC-1') + ' ≥ ' + SG.fx(c.Ib / n) + ' A mỗi tiếp điểm, ' + (+l.phases === 1 ? '2P' : '3P/4P') + ', cuộn ' + (SG.cfg.coilV === '230VAC' ? '230 VAC qua KA' : '24 VDC') + ', 1 NO phản hồi']); });
  if (SG.pv('motor', 'start') === 'dol') kms.push(['KM-M1 + disjoncteur-moteur', 'AC-3 ≥ ' + (R.motor.In || '?') + ' A; bảo vệ nhiệt chỉnh theo In; chịu dòng khởi động']);
  if (SG.cfg.island || SG.cfg.gen) kms.push(['KM-PCC / KM-GEN', 'AC-1 ≥ ' + SG.fx(R.Ipcc) + ' A, 4P, khóa liên động cơ + điện']);
  return `<div class="card stack" id="slot-prot"><h3>Bảo vệ & đóng cắt — yêu cầu kỹ thuật</h3><p class="small muted">Catalogue chưa có disjoncteur/fusible/contacteur đã xác minh, nên đây là yêu cầu để chọn. In tối thiểu = cấp tiêu chuẩn kế tiếp ≥ Ib; chưa kiểm tra cáp (Iz), Icc và chọn lọc.</p>
    <div class="tbl-wrap"><table><tr><th>Mạch</th><th>Tải</th><th class="num">Ib (A)</th><th class="num">In min (A)</th><th>Cực</th><th>Đặc tính</th><th>Khả năng cắt</th></tr>${R.circuits.map(c => `<tr><td class="mono">${c.id}</td><td>${SG.esc(c.n)}</td><td class="num">${c.Ib ? SG.fx(c.Ib) : '—'}</td><td class="num">${c.InMin || '—'}</td><td>${c.poles}</td><td class="small">${SG.esc(c.curve)}</td><td class="small">${v('grid', 'Icc') ? '≥ ' + v('grid', 'Icc') + ' kA (tại PCC)' : '<span class="st unk">Thiếu Icc</span>'}</td></tr>`).join('')}</table></div>
    ${dc.length ? `<h4>Phía DC</h4><div class="tbl-wrap"><table>${dc.map(x => `<tr><td style="width:34%">${x[0]}</td><td class="small">${SG.esc(x[1])}</td></tr>`).join('')}</table></div>` : ''}
    ${kms.length ? `<h4>Contacteur</h4><div class="tbl-wrap"><table>${kms.map(x => `<tr><td class="mono" style="width:34%">${x[0]}</td><td class="small">${SG.esc(x[1])}</td></tr>`).join('')}</table></div>` : ''}</div>`;
};

/* ---------------- TAB: TƯƠNG THÍCH THEO CẶP ---------------- */
SG.tabPairs = function (el) {
  const P = SG.pairs(), cnt = s => P.filter(p => p.st === s).length;
  const st = SG.pairFilter = SG.pairFilter || '';
  el.innerHTML = SG.impactHtml() + `<div class="card"><h3>Tổng hợp ${P.length} cặp kiểm tra</h3><div class="sumrow">${['verified', 'prelim', 'miss', 'ko'].map(s => `<button class="btn sm ${st === s ? 'on' : ''}" data-pf="${s}">${SG.st4(s, SG.ST4[s] + ': ' + cnt(s))}</button>`).join('')}<button class="btn sm ${!st ? 'on' : ''}" data-pf="">Tất cả</button></div>
    <p class="small muted" style="margin-top:6px">Một cặp chỉ “đã xác minh” khi mọi hạng mục đã xác minh. Thông số đầu vào là giả định hoặc nhập tay → tối đa “phù hợp sơ bộ”. Có Modbus không có nghĩa là điều khiển được: quyền ghi phải có tài liệu.</p></div>` +
    P.filter(p => !st || p.st === st).map(p => `<details class="card" ${p.st === 'ko' ? 'open' : ''}><summary><span class="row" style="display:inline-flex;gap:10px">${SG.st4(p.st)} <span>${SG.esc(p.a)} ↔ ${SG.esc(p.b)}</span></span></summary>
      <div class="tbl-wrap" style="margin-top:8px"><table><tr><th>Hạng mục</th><th>Trạng thái</th><th>Chi tiết</th></tr>${p.rows.map(r => `<tr><td>${SG.esc(r.n)}</td><td>${SG.st4(r.st)}</td><td class="small">${SG.esc(r.d || '')}</td></tr>`).join('')}</table></div>${p.src ? `<p class="small muted" style="margin-top:6px">Nguồn thông số đầu vào: ${SG.esc(p.src)}</p>` : ''}</details>`).join('');
  el.querySelectorAll('[data-pf]').forEach(b => b.onclick = () => { SG.pairFilter = b.dataset.pf; SG.tabPairs(el); });
};

/* ---------------- TAB: I/O & TRUYỀN THÔNG ---------------- */
SG.tabIO = function (el) {
  const io = SG._R.io, plc = SG.chosen('plc');
  const byVia = {}; io.list.forEach(s => { (byVia[s.via] = byVia[s.via] || []).push(s); });
  let mod = '';
  if (plc) { const di = Math.max(0, io.need.DI - (SG.spec(plc, 'diBase') || 0)), dq = Math.max(0, io.need.DO - (SG.spec(plc, 'doBase') || 0)), ai = Math.max(0, io.need.AI - (SG.spec(plc, 'aiBase') || 0)), ao = Math.max(0, io.need.AO - (SG.spec(plc, 'aoBase') || 0));
    mod = `<p class="small">Với <b>${SG.esc(plc.brand + ' ' + plc.model)}</b> (${SG.spec(plc, 'diBase')} DI, ${SG.spec(plc, 'doBase')} DO, ${SG.spec(plc, 'aiBase') || 0} AI tích hợp): cần thêm <b>${di} DI</b> → ${Math.ceil(di / 16)} module 16 DI; <b>${dq} DO</b> → ${Math.ceil(dq / 16)} module 16 DO; <b>${ai} AI</b>, <b>${ao} AO</b> → module analog. Tổng module: ${Math.ceil(di / 16) + Math.ceil(dq / 16) + (ai || ao ? 1 : 0)} / tối đa ${SG.spec(plc, 'expModules') || '?'}. Model module cụ thể: chưa có trong catalogue đã xác minh.</p>`; }
  el.innerHTML = `<div class="card"><h3>Đếm kênh từ danh sách tín hiệu thực tế</h3><div class="row" style="margin:8px 0"><label class="f" style="width:160px">Dự phòng I/O (%)<input type="number" id="io-sp" value="${SG.proj.spare}" min="0" max="100"></label>
      <label class="f" style="width:280px">Trạng thái trip của máy cắt tải đọc qua<select id="io-trip"><option value="di" ${SG.proj.statusTrip === 'di' ? 'selected' : ''}>Tiếp điểm SD → DI (I/O vật lý)</option><option value="none" ${SG.proj.statusTrip === 'none' ? 'selected' : ''}>Không đọc riêng (chỉ qua đồng hồ/Modbus)</option></select></label></div>
    <div class="tbl-wrap"><table><tr><th>Loại</th><th class="num">Tín hiệu</th><th class="num">Cần (gồm dự phòng)</th></tr>${['DI', 'DO', 'AI', 'AO'].map(t => `<tr><td>${t} (I/O vật lý)</td><td class="num">${io[t]}</td><td class="num"><b>${io.need[t]}</b></td></tr>`).join('')}<tr><td>Dữ liệu truyền thông (không tốn kênh I/O)</td><td class="num">${io.COM}</td><td class="num">—</td></tr></table></div>${mod}
    <div class="note small" style="margin-top:8px">Không đếm trùng: một đại lượng đọc qua Modbus (ví dụ công suất nhánh) không cần thêm AI; một trạng thái đọc bằng tiếp điểm DI không cần đọc lại qua Modbus. Mỗi tín hiệu dưới đây có đúng một đường đi. Thiết bị Modbus: ${io.modbusDevices.map(SG.esc).join(', ') || '—'}.</div></div>
    ${Object.entries(byVia).map(([via, L]) => `<details class="card" ${via === 'I/O' ? 'open' : ''}><summary>${via === 'I/O' ? 'I/O vật lý' : 'Qua ' + via} (${L.length})</summary><div class="tbl-wrap" style="margin-top:8px"><table><tr><th>Mã</th><th>Loại</th><th>Nguồn → Đích</th><th>Kiểu tín hiệu</th><th>Chức năng</th><th>Khi lỗi</th></tr>${L.map(s => `<tr><td class="mono">${SG.esc(s.code)}</td><td>${s.io}</td><td class="small">${SG.esc(s.src)} → ${SG.esc(s.dst)}</td><td class="small">${SG.esc(s.type)}</td><td class="small">${SG.esc(s.func)}</td><td class="small">${SG.esc(s.fail)}</td></tr>`).join('')}</table></div></details>`).join('')}`;
  el.querySelector('#io-sp').onchange = e => { SG.proj.spare = Math.max(0, Math.min(100, +e.target.value || 0)); SG.saveProj(); SG.render.selector(document.getElementById('page')); };
  el.querySelector('#io-trip').onchange = e => { SG.proj.statusTrip = e.target.value; SG.saveProj(); SG.render.selector(document.getElementById('page')); };
};

/* ---------------- TAB: XUẤT ---------------- */
SG.tabExport = function (el) {
  const X = SG.exports();
  const items = [['bom', 'BOM — thiết bị, số lượng, hãng, model'], ['comp', 'Bảng kiểm tra tương thích'], ['io', 'Bảng tín hiệu I/O và truyền thông'], ['sw', 'Phần mềm và giấy phép'], ['miss', 'Thông số còn thiếu cần hỏi nhà cung cấp']];
  el.innerHTML = `<div class="note small">Tệp CSV (dấu chấm phẩy, UTF-8) mở được bằng Excel. Trong trang xem Artifact trên claude.ai, trình duyệt chặn tải tệp — dùng nút “Sao chép” rồi dán vào Excel, hoặc mở bản GitHub Pages.</div>
    <div class="grid g2">${items.map(([k, n]) => `<div class="card stack"><h3>${n}</h3><span class="small muted">${X[k][1].length - 1} dòng · ${X[k][0]}</span><div class="row"><button class="btn pri" data-dl="${k}">Tải CSV</button><button class="btn" data-cp="${k}">Sao chép</button><span class="small muted" id="msg-${k}"></span></div>
      <div class="tbl-wrap" style="max-height:220px"><table><tr>${X[k][1][0].map(h => `<th>${SG.esc(h)}</th>`).join('')}</tr>${X[k][1].slice(1, 6).map(r => `<tr>${r.map(c => `<td class="small">${SG.esc(String(c == null ? '' : c).slice(0, 80))}</td>`).join('')}</tr>`).join('')}</table></div></div>`).join('')}</div>`;
  el.querySelectorAll('[data-dl]').forEach(b => b.onclick = () => { const [n, rows] = X[b.dataset.dl]; SG.download(n, SG.csv(rows), el.querySelector('#msg-' + b.dataset.dl)); });
  el.querySelectorAll('[data-cp]').forEach(b => b.onclick = () => { const rows = X[b.dataset.cp][1]; const txt = rows.map(r => r.map(c => String(c == null ? '' : c).replace(/\t|\n/g, ' ')).join('\t')).join('\n'); const m = el.querySelector('#msg-' + b.dataset.cp); try { navigator.clipboard.writeText(txt).then(() => { m.textContent = 'Đã sao chép ' + (rows.length - 1) + ' dòng.'; }, () => { m.textContent = 'Trình duyệt chặn sao chép.'; }); } catch (e) { m.textContent = 'Trình duyệt chặn sao chép.'; } });
};
