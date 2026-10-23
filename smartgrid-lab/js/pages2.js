/* TRANG 6–10 */

/* ======================= 6. BẢNG I/O & BỐ TRÍ TỦ ======================= */
SG.CAB = [
  { id: 'TGBT', n: 'Tủ TGBT — công suất', w: 560, rows: [
    { z: 'P', n: 'Hàng 1 · đầu vào & nguồn', ids: ['QS0', 'QF0', 'SPD', 'KM-PCC', 'KM-GEN', 'QF-GEN'] },
    { z: 'P', n: 'Hàng 2 · khởi hành nhánh', ids: ['RLY-DEC', 'QF-PV', 'QF-BAT', 'QF-M1', 'QF-RL', 'PM-RL', 'QF-LP', 'PM-LP', 'QF-EV', 'QF-AUX'] },
    { z: 'P', n: 'Hàng 3 · đóng cắt tải & biến tần', ids: ['KM-M1', 'VFD-M1', 'KM-RL', 'CT-PCC'] },
    { z: 'P', n: 'Đáy · hàng kẹp X1 công suất, thanh PE, kẹp ngắn mạch CT', ids: [] } ] },
  { id: 'TDK', n: 'Tủ điều khiển', w: 520, rows: [
    { z: 'C', n: 'Hàng 1 · nguồn 24 V', ids: ['PSU', 'UPS', 'F24'] },
    { z: 'C', n: 'Hàng 2 · PLC, relay, an toàn', ids: ['CPU', 'DI', 'DO', 'AIO', 'COM', 'KA', 'KS'] },
    { z: 'N', n: 'Hàng 3 · truyền thông (máng dây riêng)', ids: ['SW', 'GW'] },
    { z: 'C', n: 'Đáy · hàng kẹp X2 (24 V, I/O), X3 (truyền thông), thanh nối giáp, PE', ids: [] } ] },
  { id: 'DOOR', n: 'Cửa tủ', w: 300, rows: [
    { z: 'N', n: 'Cửa tủ điều khiển', ids: ['HMI', 'ES', 'OP'] },
    { z: 'P', n: 'Cửa tủ TGBT', ids: ['PM-PCC'] } ] },
  { id: 'WALL', n: 'Ngoài tủ', w: 300, rows: [
    { z: 'P', n: 'Treo tường', ids: ['PV-INV', 'PV-DCB', 'PCS', 'EVSE'] },
    { z: 'P', n: 'Tủ pin', ids: ['BAT', 'BMS', 'BAT-DCP'] } ] }
];
SG.render.io = function (el, arg) {
  const st = SG.ioState = SG.ioState || { tab: 'io', f: '', type: '' };
  let hlCode = null, hlDev = null;
  if (arg) { if (arg === 'cab') st.tab = 'cab'; else if (arg.startsWith('cab:')) { st.tab = 'cab'; hlDev = arg.slice(4); } else { st.tab = 'io'; hlCode = arg; st.f = ''; st.type = ''; } }
  el.innerHTML = SG.head('Bảng I/O & bố trí tủ', 'Tín hiệu, tủ điện và thiết bị phụ trợ', 'Bảng I/O sinh từ cấu hình hiện tại: đổi số bậc tải, bật máy phát hay EV ở trang Chọn thiết bị sẽ thêm/bớt dòng. Mỗi tín hiệu ghi rõ trạng thái khi lỗi.') + `
  <div class="tabs"><button data-t="io">Bảng I/O</button><button data-t="cab">Bố trí tủ (minh họa)</button><button data-t="chain">Ví dụ xuyên suốt: chạy động cơ</button></div><div id="io-body"></div>`;
  const body = el.querySelector('#io-body');
  const tabs = () => el.querySelectorAll('[data-t]').forEach(b => b.classList.toggle('on', b.dataset.t === st.tab));
  el.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { st.tab = b.dataset.t; tabs(); draw(); });
  tabs(); draw();
  function draw() { if (st.tab === 'io') ioTable(); else if (st.tab === 'cab') cab(); else chain(); }
  function ioTable() {
    const r = SG.r; const S = r.io.sig;
    const addr = {}; const ctr = { DI: 0, DO: 0, AI: 0, AO: 0 };
    S.forEach(s => { if (ctr[s.io] != null) { const i = ctr[s.io]++; const per = s.io === 'AI' ? 4 : s.io === 'AO' ? 2 : 16; addr[s.code] = s.io + (Math.floor(i / per) + 1) + '.' + String(i % per).padStart(2, '0'); } else addr[s.code] = '—'; });
    body.innerHTML = `<div class="row" style="margin:12px 0"><input type="text" id="io-f" placeholder="Lọc mã, thiết bị, chức năng…" value="${SG.esc(st.f)}" style="max-width:300px" aria-label="Lọc tín hiệu">
      <div class="seg" id="io-ty">${['', 'DI', 'DO', 'AI', 'AO', 'COM'].map(t => `<button data-y="${t}" class="${st.type === t ? 'on' : ''}">${t || 'Tất cả'} ${t ? '(' + S.filter(s => s.io === t).length + ')' : '(' + S.length + ')'}</button>`).join('')}</div>
      <span class="small muted">Module: ${r.io.modulesTxt} · dự phòng ${SG.cfg.spare} %</span></div>
      <div class="tbl-wrap" style="max-height:70vh"><table id="io-t"><thead><tr><th>Mã tín hiệu</th><th>Kênh</th><th>Loại</th><th>Nguồn → Đích</th><th>Loại tín hiệu</th><th>Chức năng</th><th>Trạng thái khi lỗi</th><th></th></tr></thead><tbody></tbody></table></div>
      <p class="small muted" style="margin-top:8px">“COM” = dữ liệu qua truyền thông, không tốn kênh I/O nhưng cần cổng, cấu hình và xử lý timeout. Kênh đánh số tự động để minh họa.</p>`;
    const rows = () => {
      const f = st.f.toLowerCase();
      body.querySelector('#io-t tbody').innerHTML = S.filter(s => (!st.type || s.io === st.type) && (!f || (s.code + s.src + s.dst + s.func + s.type).toLowerCase().includes(f))).map(s => `<tr id="sig-${s.code}" style="${s.code === hlCode ? 'background:var(--accent-soft)' : ''}"><td class="mono"><b>${s.code}</b></td><td class="mono small">${addr[s.code]}</td><td><span class="chip">${s.io}</span></td><td>${SG.devChip(s.src)} → ${SG.devChip(s.dst)}</td><td class="small">${SG.esc(s.type)}</td><td class="small">${SG.esc(s.func)}</td><td class="small">${SG.esc(s.fail)}</td><td>${s.link ? `<button class="btn sm" data-goto="diagram" data-arg="link:${s.link}">Sơ đồ</button>` : ''}</td></tr>`).join('');
    };
    body.querySelector('#io-f').oninput = e => { st.f = e.target.value; rows(); };
    body.querySelectorAll('[data-y]').forEach(b => b.onclick = () => { st.type = b.dataset.y; body.querySelectorAll('[data-y]').forEach(x => x.classList.toggle('on', x === b)); rows(); });
    rows();
    if (hlCode) { const tr = body.querySelector('#sig-' + CSS.escape(hlCode)); if (tr) setTimeout(() => tr.scrollIntoView({ block: 'center' }), 50); }
  }
  function cab() {
    const zc = { P: 'var(--l-ac)', C: 'var(--l-di)', N: 'var(--l-eth)' }, zn = { P: 'Công suất', C: 'Điều khiển', N: 'Truyền thông' };
    let x0 = 10, svg = '', H = 0;
    const blocks = SG.CAB.map(cb => {
      let y = 40; let s = `<text x="${x0}" y="24" style="font:600 13px var(--font-body);fill:var(--ink)">${cb.n}</text>`;
      if (cb.id === 'TGBT' || cb.id === 'TDK') s += `<rect x="${x0}" y="32" width="${cb.w}" height="16" rx="2" style="fill:var(--surface2)"/><text x="${x0 + 8}" y="44" style="font:10px var(--font-body);fill:var(--ink2)">${cb.id === 'TGBT' ? 'Quạt + lọc trên nóc (biến tần, contacteur tỏa nhiệt) · lối cáp vào từ dưới' : 'Thông gió tự nhiên/quạt nhỏ · tách xa nguồn nhiệt'}</text>`, y = 54;
      cb.rows.forEach(row => {
        const ids = row.ids.filter(id => { const d = SG.dev(id); return d && SG.devOn(d); });
        const rh = ids.length ? 64 : 30;
        s += `<rect x="${x0}" y="${y}" width="${cb.w}" height="${rh}" rx="4" style="fill:var(--surface3);stroke:${zc[row.z]};stroke-width:1.2;stroke-dasharray:${row.z === 'N' ? '5 3' : row.z === 'C' ? '2 2' : '0'}"/>`;
        s += `<text x="${x0 + 6}" y="${y + 13}" style="font:600 10px var(--font-body);fill:var(--ink2)">${SG.esc(row.n)} · vùng ${zn[row.z]}</text>`;
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
    svg = `<svg viewBox="0 0 ${x0} ${H + 10}" role="img" aria-label="Bố trí tủ minh họa">${blocks.join('')}</svg>`;
    body.innerHTML = `<div class="note" style="margin:12px 0">Bố trí MINH HỌA để hiểu phân vùng — không phải bản vẽ chế tạo tủ. Kích thước tủ, khoảng cách tản nhiệt, IP và tiết diện dây cần thiết kế theo IEC 61439 và hướng dẫn nhà sản xuất.</div>
      <div class="card cab" style="overflow-x:auto"><div style="min-width:1100px">${svg}</div></div>
      <div class="row small" style="margin-top:8px"><span><span style="display:inline-block;width:22px;border-top:2px solid var(--l-ac)"></span> Vùng công suất (viền liền)</span><span><span style="display:inline-block;width:22px;border-top:2px dotted var(--l-di)"></span> Vùng điều khiển (viền chấm)</span><span><span style="display:inline-block;width:22px;border-top:2px dashed var(--l-eth)"></span> Vùng truyền thông (viền gạch)</span><span class="muted">Dải xám = máng dây. Bấm một thiết bị để xem phiếu.</span></div>
      <div class="grid g3" style="margin-top:14px">
        <div class="card"><h3>Nguồn phụ trợ & nối đất</h3><ul class="small"><li>PSU 24 V → UPS → phân phối có bảo vệ từng kênh (F24).</li><li>0 V nối PE tại một điểm (tùy chọn thiết kế — cần kiểm chứng).</li><li>Thanh PE trong mỗi tủ, nối giáp cáp truyền thông/biến tần 360°.</li><li>Hàng kẹp X1 công suất, X2 điều khiển, X3 truyền thông; kẹp ngắn mạch cho thứ cấp CT.</li></ul></div>
        <div class="card"><h3>Tách vùng & nhiễu</h3><ul class="small"><li>Cáp động cơ biến tần (PWM) đi máng riêng, xa cáp RS485/analog.</li><li>Cáp analog và RS485 có giáp; cắt chéo cáp công suất ở góc 90°.</li><li>Contacteur 230 VAC có bộ dập xung (RC).</li></ul></div>
        <div class="card"><h3>Tản nhiệt</h3><p class="small">Tổn hao ước lượng: biến tần ≈ 70 W, PSU ≈ 25 W, contacteur & relay ≈ 30 W, PLC & switch ≈ 20 W. Bàn tải điện trở ${SG.cfg.rlSteps * SG.cfg.rlStep} kW đặt NGOÀI tủ, có quạt riêng. Tính quạt tủ theo tổn hao thực từ datasheet.</p></div></div>`;
    body.querySelectorAll('.slot').forEach(g => g.onclick = () => SG.go('library', g.dataset.dev));
  }
  function chain() {
    const cs = SG.chainState = SG.chainState || { remote: true, ks: true, qf: true, km: true, flt: false, nofb: false, res: null };
    const conds = [['remote', 'SEL_REMOTE', 'Bộ chọn ở Remote (HMI được phép ra lệnh)'], ['ks', 'KS_OK', 'Mạch an toàn bình thường (không dừng khẩn)'], ['qf', 'QF_M1_OF', 'Máy cắt động cơ đóng'], ['km', 'KM_M1_FB', 'Contacteur nguồn biến tần đóng']];
    const run = () => {
      const fails = conds.filter(c => !cs[c[0]]).map(c => c[1] + ' = 0'); if (cs.flt) fails.push('VFD_FLT = 1');
      const steps = [['HMI', 'e-hmi', 'Ghi bit HMI_CMD.START_M1 = 1 vào PLC (Modbus TCP, PLC là server).']];
      if (fails.length) { steps.push(['CPU', null, 'Kiểm tra điều kiện: KHÔNG ĐẠT — ' + fails.join(', ') + '. Không xuất lệnh.']); steps.push(['HMI', 'e-hmi', 'HMI hiển thị: “Từ chối lệnh: ' + fails.join(', ') + '”.']); cs.res = 'ko'; }
      else {
        steps.push(['CPU', null, 'Kiểm tra điều kiện: ĐẠT (SEL_REMOTE, KS_OK, QF_M1_OF, KM_M1_FB = 1; VFD_FLT = 0).']);
        steps.push(['DO', 'c-do-vfd', 'Xuất DO VFD_RUN = 1 (24 V PNP) → DI1 biến tần; AO VFD_SPD_REF = 8 V (80 %).']);
        if (cs.nofb) { steps.push(['VFD-M1', null, 'Biến tần không chạy (ví dụ DI1 cấu hình NPN, hoặc tham số kênh lệnh sai).']); steps.push(['CPU', 'd-vfd', 'Sau 3 s VFD_RUN_FB vẫn = 0 → PLC bỏ VFD_RUN, ALARM “M1 không chạy”.']); steps.push(['HMI', 'e-hmi', 'HMI: báo động đỏ, trạng thái M1 = Lỗi khởi động. Nhật ký ghi thời điểm và điều kiện.']); cs.res = 'alarm'; }
        else { steps.push(['VFD-M1', 'p-m4', 'Biến tần tăng tốc theo ramp; động cơ quay.']); steps.push(['DI', 'd-vfd', 'Relay R2 → VFD_RUN_FB = 1 sau ≈ 0,5 s. Modbus TCP: tốc độ, dòng.']); steps.push(['HMI', 'e-hmi', 'HMI: M1 = Đang chạy, 80 %, dòng thực.']); cs.res = 'ok'; }
      }
      return steps;
    };
    const steps = cs.res ? run() : null;
    body.innerHTML = `<div class="grid g2" style="margin-top:12px;align-items:start"><div class="card stack"><h3>HMI yêu cầu chạy động cơ → PLC kiểm tra → lệnh → phản hồi → cảnh báo</h3>
      <p class="small muted">Đặt trạng thái các tín hiệu đầu vào rồi bấm lệnh. Đây là cùng một logic với kịch bản 5 và HMI.</p>
      ${conds.map(c => `<label class="cb"><input type="checkbox" data-c="${c[0]}" ${cs[c[0]] ? 'checked' : ''}> <span><span class="mono">${c[1]}</span> — ${c[2]}</span></label>`).join('')}
      <label class="cb"><input type="checkbox" data-c="flt" ${cs.flt ? 'checked' : ''}> <span><span class="mono">VFD_FLT</span> — Biến tần đang báo lỗi</span></label>
      <label class="cb"><input type="checkbox" data-c="nofb" ${cs.nofb ? 'checked' : ''}> <span>Mô phỏng: biến tần không phản hồi dù nhận lệnh</span></label>
      <div class="row"><button class="btn pri" id="ch-run">HMI: Chạy M1</button>${cs.res ? SG.stChip(cs.res === 'ok' ? 'ok' : cs.res === 'ko' ? 'unk' : 'ko', cs.res === 'ok' ? 'Động cơ chạy — đã xác nhận bằng phản hồi' : cs.res === 'ko' ? 'Lệnh bị từ chối' : 'Báo động: không có phản hồi') : ''}</div>
      <pre class="code">KHI HMI_START_M1:
  NẾU SEL_REMOTE VÀ KS_OK VÀ QF_M1_OF
     VÀ KM_M1_FB VÀ NOT VFD_FLT:
       VFD_RUN := 1 ; T := 0
  NGƯỢC LẠI: báo lý do từ chối
NẾU VFD_RUN VÀ NOT VFD_RUN_FB VÀ T > 3 s:
  VFD_RUN := 0 ; ALARM "M1 không chạy"</pre>
      <div class="note small">Dừng khẩn KHÔNG nằm trong logic này: nút E-stop → relay an toàn KS → STO + KM-M1, độc lập với PLC.</div></div>
      <div class="stack"><div id="ch-dg" style="height:380px"></div><div class="flow">${steps ? steps.map((s, i) => `<div class="stp"><i>${i + 1}</i><span><span class="mono">${s[0]}</span><br>${SG.esc(s[2])}</span></div>`).join('') : '<p class="small muted">Bấm “HMI: Chạy M1” để xem trình tự.</p>'}</div></div></div>`;
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
SG.render.scenarios = function (el, arg) {
  const st = SG.scState = SG.scState || { sel: 'pv-surplus', i: 0 };
  if (arg) { st.sel = arg; st.i = 0; }
  const c = SG.cfg;
  el.innerHTML = SG.head('Kịch bản vận hành', 'Điều kiện → phát hiện → truyền tín hiệu → quyết định → tác động → phản hồi → HMI',
    'Mỗi bước làm nổi bật thiết bị và dây liên quan, và tính lại cân bằng công suất bằng cùng mô hình với HMI. Kịch bản cần khả năng mà kiến trúc hiện tại không có sẽ bị khóa kèm lý do.') + `
  <div class="grid" style="grid-template-columns:270px minmax(0,1fr);align-items:start" id="sc-grid"><div class="card" style="padding:8px"><div class="scen-list" id="sc-list"></div></div><div class="stack" id="sc-main" style="gap:14px"></div></div>
  <div class="card"><h3>PLC, bảo vệ điện và an toàn chuyên dụng — ai làm gì</h3><div class="tbl-wrap" style="margin-top:8px"><table><tr><th></th><th>Bảo vệ điện</th><th>An toàn máy</th><th>PLC / EMS</th></tr>
    <tr><td><b>Ví dụ</b></td><td>QF-RL cắt ngắn mạch; relay tách lưới mở KM-PCC</td><td>E-stop → KS → STO + KM-M1</td><td>Sa thải tải, setpoint pin, khởi động máy phát</td></tr>
    <tr><td><b>Phụ thuộc chương trình?</b></td><td>Không</td><td>Không (logic được chứng nhận)</td><td>Có</td></tr>
    <tr><td><b>Thời gian</b></td><td>ms</td><td>ms</td><td>100 ms – vài s</td></tr>
    <tr><td><b>PLC thấy gì</b></td><td>Tiếp điểm SD/DEC_TRIP (để báo, không để bảo vệ)</td><td>KS_OK (để hiển thị)</td><td>—</td></tr></table></div>
    <p class="small muted" style="margin-top:8px">Xem thêm so sánh grid-following/grid-forming, chuyển nguồn/song song, mất lưới/dự phòng: <a href="#library" data-goto="library">Thư viện → So sánh thiết bị dễ nhầm</a>.</p></div>`;
  if (window.innerWidth < 900) el.querySelector('#sc-grid').style.gridTemplateColumns = '1fr';
  const list = el.querySelector('#sc-list'), main = el.querySelector('#sc-main');
  const lockOf = sc => sc.lock ? sc.lock(c) : null;
  list.innerHTML = SG.scenarios.map((sc, i) => `<button data-s="${sc.id}" class="${sc.id === st.sel ? 'on' : ''}"><span class="n">${i + 1}</span><span>${SG.esc(sc.n)}</span>${lockOf(sc) ? '<span class="chip" title="Bị khóa">🔒 khóa</span>' : ''}</button>`).join('');
  list.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { st.sel = b.dataset.s; st.i = 0; SG.render.scenarios(el); });
  const sc = SG.scenarios.find(x => x.id === st.sel);
  const lock = lockOf(sc);
  if (lock) {
    main.innerHTML = `<div class="card stack"><h2>${SG.esc(sc.n)}</h2><div class="note ko lock"><span style="font-size:18px">🔒</span><div><b>Thao tác bị khóa với kiến trúc hiện tại.</b><br>${SG.esc(lock)}</div></div><div class="row"><button class="btn" data-goto="selector">Thay đổi cấu hình →</button><button class="btn" data-goto="library" data-arg="KM-GEN">Contacteur máy phát và khóa liên động →</button></div></div>`;
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
  const table = steps.slice(0, st.i + 1).map((x, i) => { const S = SG.scenState(sc, i, c).s, O = SG.solve(c, S); return `<tr style="${i === st.i ? 'background:var(--accent-soft)' : ''}"><td>${i + 1}. ${SG.phases[x.ph]}</td><td><span class="mode-pill mode-${S.mode}">${S.mode}</span></td><td class="num">${SG.fx(O.pv)}</td><td class="num">${SG.fx(O.bat)}</td><td class="num">${SG.fx(O.grid)}</td><td class="num">${SG.fx(O.gen)}</td><td class="num">${SG.fx(O.loads.total)}</td><td class="num">${Math.round(S.soc)}</td><td class="num">${O.f ? SG.fx(O.f, 1) : '—'}</td></tr>`; }).join('');
  main.innerHTML = `<div class="card stack"><div class="row" style="justify-content:space-between"><h2>${SG.esc(sc.n)}</h2>${v ? `<span class="chip">Biến thể theo cấu hình: <b>${v === 'island' ? 'vận hành đảo' : v === 'blackout' ? 'không đảo — mất điện' : v === 'fromisland' ? 'từ chế độ đảo' : 'từ mất điện'}</b></span>` : ''}</div>
    <div class="phases">${SG.phases.map((p, i) => `<span class="${i === cur.ph ? 'on' : i < cur.ph ? 'done' : ''}">${p}</span>`).join('')}</div>
    <div class="note info"><b>Bước ${st.i + 1}/${steps.length} — ${SG.phases[cur.ph]}.</b> ${SG.T(txt(cur))}</div>
    <div class="row"><button class="btn" id="sc-prev" ${st.i === 0 ? 'disabled' : ''}>← Bước trước</button><button class="btn pri" id="sc-next" ${st.i >= steps.length - 1 ? 'disabled' : ''}>Bước tiếp →</button><button class="btn" id="sc-reset">Chạy lại</button><button class="btn" data-goto="hmi">Thử trên HMI →</button></div>
    ${o.notes.length ? `<div class="small muted">Mô phỏng: ${o.notes.map(SG.esc).join(' ')}</div>` : ''}</div>
  <div id="sc-dg" style="height:440px"></div>
  <div class="card"><h3>Bảng trạng thái theo bước</h3><p class="small muted">kW; P_BAT &gt; 0 xả, P_GRID &gt; 0 nhập. Giá trị tính lại ở mỗi bước, luôn cân bằng.</p><div class="tbl-wrap" style="margin-top:8px"><table><tr><th>Bước</th><th>Chế độ</th><th class="num">P_PV</th><th class="num">P_BAT</th><th class="num">P_GRID</th><th class="num">P_GEN</th><th class="num">ΣTải</th><th class="num">SOC %</th><th class="num">f Hz</th></tr>${table}</table></div></div>
  <div class="grid g2"><div class="card"><h3>Logic (pseudocode)</h3><pre class="code" style="margin-top:8px">${SG.esc(sc.pseudo)}</pre></div><div class="card stack"><h3>Toàn bộ trình tự</h3><div class="flow">${steps.map((x, i) => `<div class="stp ${i === st.i ? 'cur' : ''}" data-i="${i}" style="cursor:pointer"><i>${i + 1}</i><span><b>${SG.phases[x.ph]}</b> — ${SG.T(txt(x))}</span></div>`).join('')}</div>${sc.note ? `<div class="note small">${SG.esc(sc.note)}</div>` : ''}</div></div>`;
  const D = SG.mini(main.querySelector('#sc-dg'), { view: 'all', hl: new Set((cur.hl || []).concat((cur.hl || []).length ? [] : [])), values: vals });
  D.states = states; D.render();
  const focus = (cur.hl || []).filter(id => D.node[id]); if (focus.length) D.focus(focus);
  main.querySelector('#sc-prev').onclick = () => { st.i--; SG.render.scenarios(el); };
  main.querySelector('#sc-next').onclick = () => { st.i++; SG.render.scenarios(el); };
  main.querySelector('#sc-reset').onclick = () => { st.i = 0; SG.render.scenarios(el); };
  main.querySelectorAll('.stp[data-i]').forEach(p => p.onclick = () => { st.i = +p.dataset.i; SG.render.scenarios(el); });
};

/* ======================= 8. HMI ======================= */
SG.SOURCES = {
  pv: { n: 'Công suất PV', dev: 'PV-INV', trace: 'P_PV', link: 'e-inv', how: 'Inverter đo nội bộ, PLC đọc Modbus TCP mỗi 1 s (thanh ghi theo register map — cần kiểm tra).' },
  bat: { n: 'Công suất pin', dev: 'PCS', trace: 'SOC', link: 'e-pcs', how: 'PCS đo phía AC, PLC đọc Modbus TCP. Dấu: + xả / − sạc (cấu hình trong PLC nếu PCS dùng quy ước khác).' },
  soc: { n: 'SOC', dev: 'BMS', trace: 'SOC', link: 'n-bms', how: 'BMS ước tính, gửi qua CAN cho PCS, PCS chuyển tiếp qua Modbus TCP.' },
  grid: { n: 'Công suất lưới', dev: 'PM-PCC', trace: 'P_GRID', link: 'e-pm', how: 'Đồng hồ PCC qua CT 50/5 A, PLC đọc mỗi 1 s. + nhập / − phát.' },
  gen: { n: 'Công suất máy phát', dev: 'GEN-CTRL', trace: null, link: null, how: 'Bộ điều khiển máy phát, Modbus RTU qua RS485 (địa chỉ 3).' },
  lp: { n: 'Tải ưu tiên', dev: 'PM-LP', trace: null, link: null, how: 'Đồng hồ nhánh, Modbus RTU (địa chỉ 12).' },
  rl: { n: 'Tải điện trở', dev: 'PM-RL', trace: 'P_RL', link: null, how: 'Đồng hồ nhánh, Modbus RTU (địa chỉ 11). Timeout → ước tính từ số bậc.' },
  m1: { n: 'Động cơ', dev: 'VFD-M1', trace: 'CMD_M1', link: 'e-vfd', how: 'Biến tần, Modbus TCP (giám sát).' },
  ev: { n: 'EV', dev: 'EVSE', trace: null, link: 'e-ev', how: 'Trạm sạc → OCPP MeterValues → EMS → PLC/HMI.' },
  uf: { n: 'Điện áp, tần số', dev: 'PM-PCC', trace: 'P_GRID', link: 'e-pm', how: 'Hòa lưới: đồng hồ PCC. Đảo: PCS. Máy phát: bộ điều khiển máy phát.' }
};
SG.render.hmi = function (el) {
  const c = SG.cfg;
  if (!SG.simObj || SG.simObj.cfgKey !== JSON.stringify(c)) { SG.simObj = new SG.Sim(c); SG.simObj.cfgKey = JSON.stringify(c); }
  const S = SG.simObj; const ui = S.ui;
  const hs = SG.hmiSt = SG.hmiSt || { run: true, speed: 60, src: null, cmd: null };
  el.innerHTML = SG.head('HMI / dashboard', 'Màn hình vận hành mô phỏng', 'Dữ liệu sinh từ một mô hình cân bằng công suất duy nhất — không có số ngẫu nhiên độc lập. Bấm vào một chỉ số để xem nó đến từ thiết bị nào; mỗi lệnh hiện đường đi, điều kiện cho phép và phản hồi xác nhận. Không điều khiển thiết bị thật.') + `
  <div class="card row" style="justify-content:space-between">
    <div class="row"><span class="mono" style="font-size:20px;font-weight:600" id="h-clock"></span><span id="h-mode"></span>
      <button class="btn" id="h-run"></button><select id="h-speed" style="width:auto" aria-label="Tốc độ mô phỏng"><option value="1">×1 (thời gian thực)</option><option value="60">1 phút / giây</option><option value="600">10 phút / giây</option></select>
      <select id="h-time" style="width:auto" aria-label="Đặt giờ"><option value="">Đặt giờ…</option>${[6, 9, 12, 15, 18, 21].map(h => `<option value="${h}">${h}:00</option>`).join('')}</select><button class="btn" id="h-reset">Khởi động lại</button></div>
    <div class="row"><span class="small muted">Bộ chọn tủ:</span><div class="seg"><button id="sa-auto">Auto</button><button id="sa-man">Manu</button></div><div class="seg"><button id="sl-rem">Remote</button><button id="sl-loc">Local</button></div></div></div>
  <div class="kpi" id="h-kpi"></div>
  <div class="grid" style="grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);align-items:start" id="h-grid">
    <div class="stack" style="gap:14px">
      <div class="card"><div class="row" style="justify-content:space-between"><h3>Công suất (kW) — lịch sử gần nhất</h3><span class="small muted" id="h-legend"></span></div><svg class="chart" id="h-chart" role="img" aria-label="Biểu đồ công suất"></svg>
        <h3 style="margin-top:8px">SOC (%)</h3><svg class="chart" id="h-soc" style="height:110px" role="img" aria-label="Biểu đồ SOC"></svg></div>
      <div id="h-dg" style="height:420px"></div>
    </div>
    <div class="stack" style="gap:14px">
      <div class="card" id="h-src"></div>
      <div class="card stack"><h3>Lệnh vận hành</h3>
        <div class="row"><b style="width:90px">Động cơ M1</b><button class="btn" data-cmd="m1start">Chạy</button><button class="btn" data-cmd="m1stop">Dừng</button><label class="f" style="flex:1;min-width:120px">Tốc độ <input type="range" min="20" max="100" step="5" id="h-spd" value="${S.s.m1Spd}"></label></div>
        <div class="row"><b style="width:90px">Tải điện trở</b>${Array.from({ length: c.rlSteps + 1 }, (_, i) => `<button class="btn sm" data-cmd="rl${i}">${i} bậc</button>`).join('')}</div>
        ${c.ev ? `<div class="row"><b style="width:90px">EV</b><button class="btn" data-cmd="evon">Sạc</button><button class="btn" data-cmd="evoff">Dừng</button><select id="h-eva" style="width:auto" aria-label="Giới hạn dòng EV">${[6, 10, 16, 24, 32].map(a => `<option ${a === ui.evAreq ? 'selected' : ''}>${a}</option>`).join('')}</select> A</div>` : ''}
        <div class="row"><b style="width:90px">Pin (Manu)</b><input type="range" min="${-c.Pcs}" max="${c.Pcs}" step="0.5" id="h-bat" value="${S.s.batSet}" style="flex:1"><span class="mono small" id="h-batv"></span></div>
        <div class="row"><b style="width:90px">Báo động</b><button class="btn" data-cmd="reset">Xác nhận / Reset (PB_RESET)</button></div>
        <div id="h-cmd"></div></div>
      <div class="card stack"><h3>Tình huống mô phỏng</h3>
        <label class="cb"><input type="checkbox" id="x-grid" ${!ui.gridAvail ? 'checked' : ''}> Mất lưới</label>
        <label class="f">Mây che (%) <input type="range" min="0" max="90" step="10" id="x-cloud" value="${ui.cloud}"></label>
        <label class="cb"><input type="checkbox" id="x-cpm" ${ui.commPM ? 'checked' : ''}> Mất truyền thông đồng hồ PCC</label>
        <label class="cb"><input type="checkbox" id="x-cinv" ${ui.commInv ? 'checked' : ''}> Mất truyền thông inverter PV</label>
        <label class="cb"><input type="checkbox" id="x-rl" ${ui.rlFault ? 'checked' : ''}> Ngắn mạch nhánh tải điện trở</label>
        <label class="cb"><input type="checkbox" id="x-m1" ${ui.m1FailInject ? 'checked' : ''}> Biến tần không phản hồi lệnh chạy</label></div>
      <div class="card"><h3>Thiết bị đóng cắt</h3><div class="tbl-wrap" style="margin-top:8px"><table id="h-sw"></table></div></div>
      <div class="card"><h3>Báo động</h3><div id="h-alarms" class="small" style="margin-top:6px"></div><h3 style="margin-top:12px">Nhật ký sự kiện</h3><div class="log" id="h-log"></div></div>
    </div></div>`;
  if (window.innerWidth < 1000) el.querySelector('#h-grid').style.gridTemplateColumns = '1fr';
  const $ = s => el.querySelector(s);
  const D = SG.mini($('#h-dg'), { view: 'power', onSelect: x => { if (x && x.kind === 'dev') SG.go('diagram', x.id); } });
  $('#h-speed').value = hs.speed;
  $('#h-run').onclick = () => { hs.run = !hs.run; paint(); };
  $('#h-speed').onchange = e => { hs.speed = +e.target.value; };
  $('#h-time').onchange = e => { if (e.target.value) { S.t = +e.target.value * 3600; S.event('Đặt giờ mô phỏng ' + e.target.value + ':00.', 'info'); S.step(0); paint(); } e.target.value = ''; };
  $('#h-reset').onclick = () => { S.reset(); SG.render.hmi(el); };
  $('#sa-auto').onclick = () => { ui.autoSel = true; S.event('SA1 → Auto.', 'info'); paint(); };
  $('#sa-man').onclick = () => { ui.autoSel = false; S.event('SA1 → Manu: EMS không còn ra setpoint; người vận hành điều khiển, PLC vẫn kiểm tra khóa liên động.', 'info'); paint(); };
  $('#sl-rem').onclick = () => { ui.remoteSel = true; S.event('SA2 → Remote.', 'info'); paint(); };
  $('#sl-loc').onclick = () => { ui.remoteSel = false; S.event('SA2 → Local: lệnh từ HMI/EMS bị từ chối.', 'info'); paint(); };
  $('#x-grid').onchange = e => { ui.gridAvail = !e.target.checked; S.event(e.target.checked ? 'MÔ PHỎNG: lưới mất.' : 'MÔ PHỎNG: điện áp lưới trở lại (chờ ổn định 60 s).', 'warn'); };
  $('#x-cloud').oninput = e => { ui.cloud = +e.target.value; };
  $('#x-cpm').onchange = e => { ui.commPM = e.target.checked; };
  $('#x-cinv').onchange = e => { ui.commInv = e.target.checked; };
  $('#x-rl').onchange = e => { ui.rlFault = e.target.checked; if (!e.target.checked) S.event('Sự cố đã sửa — cần đóng QF-RL tại chỗ và Reset.', 'info'); };
  $('#x-m1').onchange = e => { ui.m1FailInject = e.target.checked; };
  $('#h-spd').oninput = e => { S.s.m1Spd = +e.target.value; };
  $('#h-bat').oninput = e => { S.s.batSet = +e.target.value; };
  if ($('#h-eva')) $('#h-eva').onchange = e => { ui.evAreq = +e.target.value; if (!S.s.auto || S.s.evA > ui.evAreq) S.s.evA = ui.evAreq; };
  el.querySelectorAll('[data-cmd]').forEach(b => b.onclick = () => command(b.dataset.cmd));

  function command(k) {
    const s = S.s, o = S.lastSolve, path = [], conds = [];
    const ctrl = s.mode !== 'BLACKOUT' || c.ups;
    const remote = ui.remoteSel;
    conds.push(['Điều khiển còn nguồn (PLC/HMI)', ctrl]);
    if (k !== 'reset') conds.push(['SEL_REMOTE = 1 (bộ chọn ở Remote)', remote]);
    let title = '', ok, feedback = '';
    if (k === 'm1start') {
      title = 'Chạy động cơ M1';
      conds.push(['KS_OK = 1 (không dừng khẩn)', true], ['QF_M1_OF = 1', true], ['VFD_FLT = 0', true], ['Thanh cái có điện', s.mode !== 'BLACKOUT']);
      if (s.mode === 'ISLAND' || s.mode === 'GEN') { const head = (s.mode === 'ISLAND' ? c.Pcs : c.Sgen * 0.8) - (o.loads.total - o.pv); conds.push(['Dự trữ công suất ≥ P_M1 (' + SG.fx(head) + ' kW)', head >= c.Pm / 0.85]); }
      path.push('HMI → Ethernet (e-hmi) → PLC', 'PLC kiểm tra điều kiện', 'DO VFD_RUN (c-do-vfd) → DI1 biến tần; AO tốc độ (m-vfd)', 'Phản hồi: VFD_RUN_FB (d-vfd) trong 3 s');
      feedback = 'Xác nhận khi VFD_RUN_FB = 1; nếu không → báo động “M1 không chạy”.';
      ok = conds.every(x => x[1]); if (ok) ui.m1Req = true;
    } else if (k === 'm1stop') {
      title = 'Dừng động cơ M1'; path.push('HMI → PLC', 'DO VFD_RUN = 0', 'Biến tần giảm tốc', 'VFD_RUN_FB = 0'); feedback = 'Xác nhận khi VFD_RUN_FB = 0.';
      ok = conds.every(x => x[1]); if (ok) ui.m1Req = false;
    } else if (k.startsWith('rl')) {
      const n = +k.slice(2); title = 'Đặt ' + n + ' bậc tải điện trở';
      conds.push(['QF_RL_SD = 0 (nhánh không trip)', !s.rlFault], ['Không ở chế độ đảo (bậc tải bị khóa khi đảo)', s.mode !== 'ISLAND' || n === 0]);
      if (s.auto && s.mode === 'GRID') conds.push(['Auto: nếu vượt giới hạn nhập, PLC sẽ sa thải lại', true]);
      path.push('HMI → PLC', 'DO KM_RLx_CMD → KA (c-do-ka) → cuộn KM-RLx 230 VAC (c-ka-rl)', 'Phản hồi KM_RLx_FB (d-kmrl) + PM-RL (RS485)');
      feedback = 'Xác nhận khi KM_RLx_FB khớp lệnh trong 1 s và PM-RL đo được công suất tương ứng.';
      ok = conds.slice(0, 4).every(x => x[1]); if (ok) { ui.rlReq = n; if (!s.auto) s.rlOn = n; }
    } else if (k === 'evon' || k === 'evoff') {
      title = k === 'evon' ? 'Cho phép sạc EV' : 'Dừng sạc EV'; conds.push(['Không ở chế độ đảo', s.mode !== 'ISLAND' || k === 'evoff']);
      path.push('HMI → PLC → EMS', 'EMS (CSMS) → OCPP (e-ev) → EVSE', 'EVSE → Control Pilot → xe', 'Phản hồi: OCPP MeterValues');
      feedback = 'Xác nhận khi công suất đo bởi trạm thay đổi (vài giây — tùy xe).';
      ok = conds.every(x => x[1]); if (ok) ui.evReq = k === 'evon';
    } else if (k === 'reset') {
      title = 'Xác nhận / Reset báo động'; conds.push(['Nguyên nhân đã hết (ví dụ QF-RL đã đóng lại tại chỗ)', !ui.rlFault]);
      path.push('PB_RESET (DI) hoặc HMI → PLC', 'PLC xóa khóa nếu nguyên nhân đã hết');
      ok = conds[0][1]; if (ok) { if (!ui.rlFault && s.rlFault) { s.rlFault = false; S.event('Reset: mở khóa nhánh tải điện trở.', 'info'); } S.clear('m1'); S.clear('rl'); S.clear('pcs'); S.alarms.forEach(a => a.ack = true); }
      feedback = 'Báo động còn nguyên nhân sẽ không xóa được.';
    }
    if (!ok) S.event('Từ chối lệnh “' + title + '”: ' + conds.filter(x => !x[1]).map(x => x[0]).join('; '), 'warn'); else S.event('Lệnh “' + title + '” được chấp nhận.', 'info');
    hs.cmd = { title, conds, path, feedback, ok };
    paint();
  }
  function tile(key, label, val, unit, sub, cls) { return `<button class="tile ${cls || ''}" data-src="${key}"><span class="k">${label}</span><span class="v">${val}<small>${unit}</small></span><span class="s">${sub || ''}</span></button>`; }
  function chart() {
    const H = S.hist.slice(-120); const svg = $('#h-chart'); if (!svg) return;
    const W = svg.clientWidth || 600, Hh = svg.clientHeight || 220, pl = 36, pr = 64, pt = 10, pb = 22;
    const series = [['grid', 'Lưới', 1], ['pv', 'PV', 2], ['bat', 'Pin', 3]].concat(c.gen ? [['gen', 'Máy phát', 4]] : []).concat([['load', 'Tổng tải', 5]]);
    const vals = H.flatMap(h => series.map(s => h[s[0]])); let lo = Math.min(-2, ...vals), hi = Math.max(4, ...vals); lo = Math.floor(lo / 2) * 2; hi = Math.ceil(hi / 2) * 2;
    const X = i => pl + (W - pl - pr) * (H.length < 2 ? 0 : i / (H.length - 1)), Y = v => pt + (Hh - pt - pb) * (hi - v) / (hi - lo);
    let g = '';
    for (let v = lo; v <= hi; v += (hi - lo > 16 ? 4 : 2)) g += `<line x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}" class="gl" ${v === 0 ? 'style="stroke:var(--ink3)"' : ''}/><text x="${pl - 6}" y="${Y(v) + 3}" text-anchor="end" class="ax">${v}</text>`;
    if (H.length) { const t0 = H[0].t, t1 = H[H.length - 1].t; const fmt = t => { const h = Math.floor(t / 3600) % 24, m = Math.floor(t / 60) % 60; return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); }; g += `<text x="${pl}" y="${Hh - 6}" class="ax">${fmt(t0)}</text><text x="${W - pr}" y="${Hh - 6}" text-anchor="end" class="ax">${fmt(t1)}</text>`; }
    const last = H[H.length - 1], lab = [];
    series.forEach(s => { if (H.length < 2) return; g += `<path d="M${H.map((h, i) => X(i).toFixed(1) + ',' + Y(h[s[0]]).toFixed(1)).join(' L')}" fill="none" stroke="var(--s${s[2]})" stroke-width="2" ${s[0] === 'load' ? 'stroke-dasharray="5 3"' : ''}/>`; g += `<circle cx="${X(H.length - 1)}" cy="${Y(last[s[0]])}" r="3" fill="var(--s${s[2]})" stroke="var(--surface)" stroke-width="2"/>`; lab.push({ t: s[1], y: Y(last[s[0]]) + 3 }); });
    lab.sort((p, q) => p.y - q.y); for (let i = 1; i < lab.length; i++) if (lab[i].y - lab[i - 1].y < 11) lab[i].y = lab[i - 1].y + 11;
    lab.forEach(l => { g += `<text x="${W - pr + 6}" y="${l.y}" class="ax" style="fill:var(--ink2)">${l.t}</text>`; });
    g += `<line id="h-x" x1="0" x2="0" y1="${pt}" y2="${Hh - pb}" style="stroke:var(--ink3);display:none"/><rect x="${pl}" y="${pt}" width="${W - pl - pr}" height="${Hh - pt - pb}" fill="transparent" id="h-hit"/>`;
    svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`); svg.innerHTML = g;
    $('#h-legend').innerHTML = series.map(s => `<span style="display:inline-flex;align-items:center;gap:4px;margin-left:10px"><svg width="16" height="6"><line x1="0" y1="3" x2="16" y2="3" stroke="var(--s${s[2]})" stroke-width="2" ${s[0] === 'load' ? 'stroke-dasharray="4 2"' : ''}/></svg>${s[1]}</span>`).join('');
    const hit = $('#h-hit'); const tipEl = document.getElementById('tip');
    hit.onmousemove = e => { const r = svg.getBoundingClientRect(); const x = (e.clientX - r.left) * W / r.width; const i = Math.max(0, Math.min(H.length - 1, Math.round((x - pl) / (W - pl - pr) * (H.length - 1)))); const h = H[i]; if (!h) return; const xl = $('#h-x'); xl.setAttribute('x1', X(i)); xl.setAttribute('x2', X(i)); xl.style.display = ''; const tm = String(Math.floor(h.t / 3600) % 24).padStart(2, '0') + ':' + String(Math.floor(h.t / 60) % 60).padStart(2, '0'); tipEl.innerHTML = `<b>${tm}</b>` + series.map(s => `${s[1]}: ${SG.fx(h[s[0]])} kW`).join('<br>') + `<br>SOC: ${SG.fx(h.soc)} %`; tipEl.hidden = false; tipEl.style.left = Math.min(window.innerWidth - 200, e.clientX + 14) + 'px'; tipEl.style.top = (e.clientY + 14) + 'px'; };
    hit.onmouseleave = () => { $('#h-x').style.display = 'none'; tipEl.hidden = true; };
    // SOC
    const s2 = $('#h-soc'); const W2 = s2.clientWidth || 600, H2 = 110; const Y2 = v => 8 + (H2 - 26) * (100 - v) / 100;
    let g2 = [0, 50, 100].map(v => `<line x1="${pl}" x2="${W2 - pr}" y1="${Y2(v)}" y2="${Y2(v)}" class="gl"/><text x="${pl - 6}" y="${Y2(v) + 3}" text-anchor="end" class="ax">${v}</text>`).join('');
    g2 += `<line x1="${pl}" x2="${W2 - pr}" y1="${Y2(c.socMin)}" y2="${Y2(c.socMin)}" style="stroke:var(--ko);stroke-dasharray:3 3"/><text x="${W2 - pr + 6}" y="${Y2(c.socMin) + 3}" class="ax">min ${c.socMin}</text><line x1="${pl}" x2="${W2 - pr}" y1="${Y2(c.socMax)}" y2="${Y2(c.socMax)}" style="stroke:var(--ink3);stroke-dasharray:3 3"/><text x="${W2 - pr + 6}" y="${Y2(c.socMax) + 3}" class="ax">max ${c.socMax}</text>`;
    const X2 = i => pl + (W2 - pl - pr) * (H.length < 2 ? 0 : i / (H.length - 1));
    if (H.length > 1) g2 += `<path d="M${pl},${Y2(0)} L${H.map((h, i) => X2(i).toFixed(1) + ',' + Y2(h.soc).toFixed(1)).join(' L')} L${X2(H.length - 1)},${Y2(0)}Z" style="fill:var(--s3);opacity:.12"/><path d="M${H.map((h, i) => X2(i).toFixed(1) + ',' + Y2(h.soc).toFixed(1)).join(' L')}" fill="none" stroke="var(--s3)" stroke-width="2"/>`;
    s2.setAttribute('viewBox', `0 0 ${W2} ${H2}`); s2.innerHTML = g2;
  }
  function paint() {
    const s = S.s, o = S.lastSolve, dead = s.mode === 'BLACKOUT', ctrlDead = dead && !c.ups;
    $('#h-clock').textContent = S.clock();
    $('#h-mode').innerHTML = `<span class="mode-pill mode-${s.mode}">${{ GRID: 'HÒA LƯỚI', ISLAND: 'ĐẢO (PCS tạo lưới)', GEN: 'MÁY PHÁT', BLACKOUT: 'MẤT ĐIỆN' }[s.mode]}</span>`;
    $('#h-run').textContent = hs.run ? '❚❚ Tạm dừng' : '▶ Chạy';
    $('#sa-auto').classList.toggle('on', ui.autoSel); $('#sa-man').classList.toggle('on', !ui.autoSel); $('#sl-rem').classList.toggle('on', ui.remoteSel); $('#sl-loc').classList.toggle('on', !ui.remoteSel);
    $('#h-batv').textContent = (s.auto ? 'Auto (EMS) — ' : 'Đặt: ') + SG.fx(s.auto ? o.bat : s.batSet) + ' kW';
    $('#h-bat').disabled = s.auto;
    const bal = o.grid + o.pv + o.bat + o.gen - o.loads.total;
    const inv = x => ctrlDead ? 'inval' : x;
    const socPct = s.soc;
    $('#h-kpi').innerHTML = [
      tile('pv', 'P_PV', SG.fx(o.pv), 'kW', s.commInv ? 'Mất truyền thông — giá trị không hợp lệ' : (o.curtail > 0 ? 'Giới hạn ' + SG.fx(o.curtail) + ' kW' : 'Khả dụng ' + SG.fx(o.pvAvail) + ' kW'), inv(s.commInv ? 'inval' : '')),
      tile('bat', 'P_BAT', SG.fx(o.bat), 'kW', o.bat > 0.05 ? 'Đang xả' : o.bat < -0.05 ? 'Đang sạc' : 'Nghỉ', inv('')),
      `<button class="tile ${inv('')}" data-src="soc"><span class="k">SOC</span><span class="v">${SG.fx(socPct, 0)}<small>%</small></span><div class="bar" title="Giới hạn ${c.socMin}–${c.socMax} %"><i style="left:0;width:${socPct}%"></i><b style="left:${c.socMin}%"></b><b style="left:${c.socMax}%"></b></div><span class="s">Giới hạn ${c.socMin}–${c.socMax} %</span></button>`,
      tile('grid', 'P_GRID', s.commPM ? '—' : SG.fx(o.grid), 'kW', s.commPM ? 'Mất truyền thông PM-PCC' : (o.grid > 0.05 ? 'Nhập' : o.grid < -0.05 ? 'Phát lên lưới' : '≈ 0') + ' · giới hạn nhập ' + c.importLimit, (s.commPM ? 'inval' : o.grid > c.importLimit ? 'bad' : '')),
      c.gen ? tile('gen', 'P_GEN', SG.fx(o.gen), 'kW', S.gen.req ? (S.gen.ready ? 'Sẵn sàng / chạy' : 'Đang khởi động') : 'Dừng', inv('')) : '',
      tile('lp', 'Tải ưu tiên', SG.fx(o.loads.lp), 'kW', 'Không sa thải', inv('')),
      tile('m1', 'Động cơ M1', SG.fx(o.loads.m1), 'kW', s.m1Run ? (S.m1Fb ? 'Chạy ' + s.m1Spd + ' %' : 'Chờ phản hồi…') : 'Dừng', inv('')),
      tile('rl', 'Tải điện trở', SG.fx(o.loads.rl), 'kW', s.rlFault ? 'QF-RL TRIP' : s.rlOn + '/' + c.rlSteps + ' bậc', inv(s.rlFault ? 'bad' : '')),
      c.ev ? tile('ev', 'EV', SG.fx(o.loads.ev), 'kW', s.evOn ? 'Giới hạn ' + s.evA + ' A' : 'Không sạc', inv('')) : '',
      tile('uf', 'U pha / f', o.U ? o.U : '0', 'V', o.f ? SG.fx(o.f, 2) + ' Hz' : '—', inv(dead ? 'bad' : '')),
      `<div class="tile" style="cursor:default"><span class="k">Kiểm tra cân bằng</span><span class="v">${SG.fx(Math.abs(bal) < 0.005 ? 0 : bal, 2)}<small>kW</small></span><span class="s mono" style="overflow-wrap:anywhere;font-size:10.5px">P_GRID + P_PV + P_BAT + P_GEN − ΣTải</span></div>`
    ].join('');
    el.querySelectorAll('[data-src]').forEach(b => b.onclick = () => { hs.src = b.dataset.src; source(); });
    const sw = [['QF0', 'Máy cắt tổng', 'I', 'OF'], c.island || c.gen ? ['KM-PCC', 'Đấu nối lưới', s.mode === 'GRID' ? 'I' : 'O', 'KM_PCC_FB'] : null, c.gen ? ['KM-GEN', 'Máy phát', s.mode === 'GEN' ? 'I' : 'O', 'KM_GEN_FB'] : null, ['QF-RL', 'Nhánh tải điện trở', s.rlFault ? 'TRIP' : 'I', 'QF_RL_SD'], ...Array.from({ length: c.rlSteps }, (_, i) => ['KM-RL' + (i + 1), 'Bậc tải ' + (i + 1), i < s.rlOn && !s.rlFault ? 'I' : 'O', 'KM_RL' + (i + 1) + '_FB']), ['KM-M1', 'Nguồn biến tần', 'I', 'KM_M1_FB'], ['VFD-M1', 'Biến tần', s.m1Run ? (S.m1Fb ? 'CHẠY' : 'CHỜ') : 'DỪNG', 'VFD_RUN_FB']].filter(Boolean);
    $('#h-sw').innerHTML = '<tr><th>Thiết bị</th><th>Trạng thái</th><th>Phản hồi (DI)</th></tr>' + sw.map(x => `<tr><td><span class="mono">${x[0]}</span> <span class="small muted">${x[1]}</span></td><td><span class="st ${x[2] === 'TRIP' ? 'ko' : x[2] === 'I' || x[2] === 'CHẠY' ? 'ok' : x[2] === 'CHỜ' ? 'unk' : ''}" style="${x[2] === 'O' || x[2] === 'DỪNG' ? 'background:var(--surface2);color:var(--ink2)' : ''}">${x[2] === 'I' ? 'Đóng' : x[2] === 'O' ? 'Mở' : x[2]}</span></td><td class="mono small">${x[3]}</td></tr>`).join('');
    $('#h-alarms').innerHTML = S.alarms.length ? S.alarms.map(a => `<div class="st ko" style="margin:2px 0;display:flex">${a.t} · ${SG.esc(a.txt)}${a.ack ? ' (đã xác nhận)' : ''}</div>`).join('') : '<span class="muted">Không có báo động.</span>';
    $('#h-log').innerHTML = S.log.map(l => `<div><span class="t">${l.t}</span><span class="${l.lvl}">${SG.esc(l.txt)}</span></div>`).join('');
    const cmd = hs.cmd;
    $('#h-cmd').innerHTML = cmd ? `<div class="note ${cmd.ok ? 'info' : 'ko'} small" style="margin-top:6px"><b>${SG.esc(cmd.title)} — ${cmd.ok ? 'chấp nhận' : 'từ chối'}</b><div style="margin-top:4px"><b>Điều kiện cho phép:</b>${cmd.conds.map(x => `<div>${x[1] ? '✓' : '✕'} ${SG.esc(x[0])}</div>`).join('')}</div><div style="margin-top:4px"><b>Đường đi của lệnh:</b> ${cmd.path.map(SG.esc).join(' → ')}</div>${cmd.feedback ? `<div style="margin-top:4px"><b>Phản hồi xác nhận:</b> ${SG.esc(cmd.feedback)}</div>` : ''}</div>` : '<p class="small muted">Bấm một lệnh để xem đường đi, điều kiện và phản hồi.</p>';
    const vals = { 'PV-INV': SG.fx(o.pv) + ' kW', PCS: SG.fx(o.bat) + ' kW', BAT: Math.round(s.soc) + ' %', LP: SG.fx(o.loads.lp) + ' kW', RL: SG.fx(o.loads.rl) + ' kW', M1: SG.fx(o.loads.m1) + ' kW' };
    if (SG.dev('PM-PCC')) vals['PM-PCC'] = SG.fx(o.grid) + ' kW'; if (c.gen) vals.GEN = SG.fx(o.gen) + ' kW'; if (c.ev) vals.EVSE = SG.fx(o.loads.ev) + ' kW';
    D.values = vals; D.states = { 'KM-PCC': s.mode === 'GRID' ? 'on' : 'off', 'KM-GEN': s.mode === 'GEN' ? 'on' : 'off', 'QF-RL': s.rlFault ? 'trip' : 'on', 'KM-RL': s.rlOn > 0 && !s.rlFault ? 'on' : 'off', 'VFD-M1': s.m1Run ? 'on' : 'off' }; D.render();
    chart();
  }
  function source() {
    const k = hs.src; const box = $('#h-src');
    if (!k) { box.innerHTML = '<h3>Nguồn dữ liệu</h3><p class="small muted" style="margin-top:6px">Bấm vào một ô chỉ số để xem nó đến từ thiết bị nào, qua kết nối nào, chu kỳ đọc và chất lượng dữ liệu.</p>'; return; }
    const x = SG.SOURCES[k]; const d = SG.dev(x.dev); const l = x.link ? SG.link(x.link) : null; const s = S.s;
    const bad = (k === 'grid' || k === 'uf') && s.commPM || k === 'pv' && s.commInv;
    box.innerHTML = `<h3>Nguồn dữ liệu: ${SG.esc(x.n)}</h3><dl class="kv small" style="margin-top:8px"><dt>Thiết bị đo</dt><dd>${SG.devChip(x.dev)} ${SG.esc(d ? d.n : '')}</dd><dt>Kết nối</dt><dd>${l ? SG.esc(l.label) : 'RS485 Modbus RTU (bus đồng hồ nhánh/máy phát)'}</dd><dt>Cách lấy</dt><dd>${SG.esc(x.how)}</dd><dt>Chất lượng</dt><dd>${bad ? SG.stChip('ko', 'Không hợp lệ — mất truyền thông') : SG.stChip('ok', 'Tốt')}</dd></dl><div class="row" style="margin-top:8px">${x.trace ? `<button class="btn sm" data-goto="diagram" data-arg="trace:${x.trace}">Xem đường đi trên sơ đồ →</button>` : `<button class="btn sm" data-goto="diagram" data-arg="${x.dev}">Xem thiết bị trên sơ đồ →</button>`}</div>`;
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
  const devs = SG.devices.filter(SG.devOn);
  const extra = [
    ['ACC-1', 'Hàng kẹp X1/X2/X3, kẹp PE, kẹp ngắn mạch CT', 'Tủ điện', 1, 'Đấu nối có đánh số; thử nghiệm CT an toàn', 'Theo số tín hiệu: ' + SG.r.io.DI + ' DI + ' + SG.r.io.DO + ' DO + ' + (SG.r.io.AI + SG.r.io.AO) + ' analog'],
    ['ACC-2', 'Cáp công suất AC/DC', 'Tủ điện', 1, 'Nối nguồn và tải', 'Tiết diện theo Ib, cách lắp, chiều dài — CẦN TÍNH'],
    ['ACC-3', 'Cáp tín hiệu, cáp RS485 xoắn đôi có giáp, Cat5e có giáp', 'Truyền thông', 1, 'Truyền thông & I/O', SG.r.eth.n + ' dây Ethernet; bus RS485 ' + SG.r.rs485.slaves.length + ' slave; 2 điện trở 120 Ω'],
    ['ACC-4', 'Bộ dập xung cuộn (RC) cho contacteur 230 VAC', 'Điều khiển', 1, 'Bảo vệ tiếp điểm KA', 'Theo số contacteur'],
    ['ACC-5', 'Nhãn, ống đánh số dây, nắp che IP2X', 'Tủ điện', 1, 'An toàn & bảo trì', '—']
  ];
  el.innerHTML = SG.head('Danh sách thiết bị — BOM', 'BOM sinh từ cấu hình hiện tại', 'Mỗi dòng liên kết tới sơ đồ và phiếu thiết bị. Số lượng thay đổi theo bảng I/O và cấu hình. Không có mã thương mại: mọi dòng đang ở trạng thái “giả định — cần kiểm tra datasheet”.') + `
  <div class="row"><select id="b-lb" style="width:auto" aria-label="Lọc nhãn"><option value="0">Mọi nhãn</option><option value="1">① Tham chiếu</option><option value="2">② Theo chức năng</option><option value="3">③ Tùy chọn</option></select>
  <select id="b-br" style="width:auto" aria-label="Lọc nhánh"><option value="">Mọi nhánh</option>${[...new Set(devs.map(d => d.br))].map(b => `<option>${SG.esc(b)}</option>`).join('')}</select>
  <button class="btn" id="b-copy">Sao chép CSV</button><span class="small muted" id="b-msg"></span></div>
  <div class="sumrow">${[1, 2, 3].map(lb => `<span class="chip lb${lb}">${SG.LBL[lb]}: ${devs.filter(d => d.lb === lb).length}</span>`).join('')}</div>
  <div class="tbl-wrap"><table id="b-t"></table></div>
  <div class="card"><h3>Phụ kiện chung</h3><div class="tbl-wrap" style="margin-top:8px"><table><tr><th>Mã</th><th>Hạng mục</th><th>Nhóm</th><th>Chức năng</th><th>Yêu cầu</th><th>Xác minh</th></tr>${extra.map(x => `<tr><td class="mono">${x[0]}</td><td>${SG.esc(x[1])}</td><td>${x[2]}</td><td class="small">${SG.esc(x[4])}</td><td class="small">${SG.esc(x[5])}</td><td><span class="st unk">Cần tính/kiểm tra</span></td></tr>`).join('')}</table></div></div>`;
  el.querySelector('#b-lb').value = st.lb; el.querySelector('#b-br').value = st.br;
  const keySpec = d => { const t = SG.types[d.t]; return (t.params || []).filter(p => !p.adv).map(p => { const v = SG.specVal(d, p.k); return v ? p.n + ': ' + v : null; }).filter(Boolean).slice(0, 3).join(' · ') || Object.keys(d.spec || {}).slice(0, 2).map(k => SG.specVal(d, k)).join(' · '); };
  const rows = () => devs.filter(d => (!st.lb || d.lb == st.lb) && (!st.br || d.br === st.br) && d.id !== 'BUS' || (d.id === 'BUS' && !st.lb && !st.br));
  const draw = () => {
    el.querySelector('#b-t').innerHTML = '<tr><th>Mã</th><th>Thiết bị</th><th>Nhãn</th><th class="num">SL</th><th>Chức năng</th><th>Thông số yêu cầu (mô hình)</th><th>Phụ kiện</th><th>Trạng thái xác minh</th><th></th></tr>' + rows().map(d => { const t = SG.types[d.t]; const acc = (t.accessories || []).concat(d.acc || []); return `<tr style="${d.id === arg ? 'background:var(--accent-soft)' : ''}" id="bom-${d.id}"><td class="mono"><b>${d.id}</b></td><td>${SG.esc(d.n)}<div class="small muted"><i>${SG.esc(t.fr)}</i></div></td><td>${SG.lbChip(d.lb)}</td><td class="num mono">${SG.bomQty(d)}</td><td class="small">${SG.T(d.why)}</td><td class="small">${SG.esc(keySpec(d))}</td><td class="small">${acc.slice(0, 3).map(a => SG.T(a)).join('<br>')}</td><td><span class="st unk">Giả định — cần datasheet</span></td><td><div class="stack" style="gap:4px">${d.nodiag ? '' : `<button class="btn sm" data-goto="diagram" data-arg="${d.id}">Sơ đồ</button>`}<button class="btn sm" data-goto="library" data-arg="${d.id}">Phiếu</button></div></td></tr>`; }).join('');
  };
  el.querySelector('#b-lb').onchange = e => { st.lb = +e.target.value; draw(); };
  el.querySelector('#b-br').onchange = e => { st.br = e.target.value; draw(); };
  el.querySelector('#b-copy').onclick = () => {
    const strip = s => String(s).replace(/<[^>]+>/g, '').replace(/\{\{[a-z0-9_]+\|?([^}]*)\}\}/g, '$1').replace(/"/g, '""');
    const csv = ['Mã;Thiết bị;Tiếng Pháp;Nhãn;SL;Chức năng;Thông số;Xác minh'].concat(rows().map(d => [d.id, d.n, SG.types[d.t].fr, d.lb, SG.bomQty(d), strip(d.why), strip(keySpec(d)), 'Giả định — cần datasheet'].map(x => '"' + strip(x) + '"').join(';'))).join('\n');
    const msg = el.querySelector('#b-msg');
    navigator.clipboard && navigator.clipboard.writeText(csv).then(() => { msg.textContent = 'Đã sao chép ' + rows().length + ' dòng.'; }).catch(() => { msg.textContent = 'Trình duyệt chặn sao chép — dùng bảng bên dưới.'; });
  };
  draw();
  if (arg) setTimeout(() => { const tr = el.querySelector('#bom-' + CSS.escape(arg)); if (tr) tr.scrollIntoView({ block: 'center' }); }, 50);
};

/* ======================= 10. THUẬT NGỮ ======================= */
SG.render.glossary = function (el, arg) {
  const cats = [...new Set(Object.values(SG.glossary).map(g => g.cat))];
  el.innerHTML = SG.head('Thuật ngữ & tài liệu tham khảo', 'Thuật ngữ tiếng Việt — tiếng Pháp — viết tắt', 'Mọi thuật ngữ có gạch chấm trong site đều mở được giải thích khi rê chuột hoặc bấm vào.') + `
  <div class="row"><input type="text" id="g-q" placeholder="Lọc thuật ngữ…" style="max-width:300px" aria-label="Lọc thuật ngữ"><select id="g-c" style="width:auto" aria-label="Lọc nhóm"><option value="">Mọi nhóm</option>${cats.map(c => `<option>${c}</option>`).join('')}</select></div>
  <div class="tbl-wrap"><table id="g-t"></table></div>
  <div class="card"><h3>Tài liệu tham khảo</h3><p class="small muted">Tiêu chuẩn và nguồn chính thức để tra cứu. Phiên bản áp dụng phải kiểm tra theo nơi lắp đặt. Liên kết trỏ tới trang chủ của tổ chức phát hành.</p>
    <div class="grid g2" style="margin-top:10px">${SG.refs.map(g => `<div><h4>${SG.esc(g.g)}</h4><ul class="small">${g.items.map(i => `<li><b>${SG.esc(i[0])}</b> — ${SG.esc(i[1])}${i[2] ? ` · <a href="${i[2]}" target="_blank" rel="noopener">${i[2].replace('https://', '')}</a>` : ''}</li>`).join('')}</ul></div>`).join('')}</div></div>`;
  const draw = () => {
    const q = el.querySelector('#g-q').value.toLowerCase(), cat = el.querySelector('#g-c').value;
    el.querySelector('#g-t').innerHTML = '<tr><th>Tiếng Việt</th><th>Tiếng Pháp</th><th>Viết tắt</th><th>Giải thích</th><th>Dễ nhầm với</th></tr>' + Object.entries(SG.glossary).filter(([id, g]) => (!cat || g.cat === cat) && (!q || (g.vi + g.fr + g.abbr + g.def).toLowerCase().includes(q))).map(([id, g]) => `<tr id="term-${id}" style="${id === arg ? 'background:var(--accent-soft)' : ''}"><td><b>${SG.esc(g.vi)}</b><div class="small muted">${g.cat}</div></td><td><i>${SG.esc(g.fr)}</i></td><td class="mono small">${SG.esc(g.abbr)}</td><td class="small">${SG.esc(g.def)}</td><td class="small">${SG.esc(g.conf || '')}</td></tr>`).join('');
  };
  el.querySelector('#g-q').oninput = draw; el.querySelector('#g-c').onchange = draw; draw();
  if (arg) setTimeout(() => { const tr = el.querySelector('#term-' + arg); if (tr) tr.scrollIntoView({ block: 'center' }); }, 50);
};
