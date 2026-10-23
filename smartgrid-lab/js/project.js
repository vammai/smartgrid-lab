/* DỰ ÁN THIẾT BỊ: đầu vào của người dùng (kèm nguồn gốc từng thông số), yêu cầu theo vị trí,
   gợi ý sản phẩm từ SG.products (data/products.js), kiểm tra theo cặp, I/O, xuất kết quả.
   Nguồn gốc thông số: 'assume' (giả định ví dụ), 'manual' (người dùng nhập), 'doc' (tài liệu người dùng tải, có trang), 'catalog' (data/products.js, có link).
   Trạng thái: verified = Tương thích đã xác minh, prelim = Phù hợp sơ bộ, miss = Thiếu dữ liệu, ko = Không tương thích. */
SG.ST4 = { verified: 'Tương thích đã xác minh', prelim: 'Phù hợp sơ bộ', miss: 'Thiếu dữ liệu', ko: 'Không tương thích' };
SG.st4 = (s, txt) => `<span class="st ${s === 'verified' ? 'ok' : s === 'prelim' ? 'ok prelim' : s === 'miss' ? 'unk' : 'ko'}">${txt || SG.ST4[s]}</span>`;
SG.SRC = { assume: 'Giả định ví dụ', manual: 'Nhập tay', doc: 'Tài liệu', catalog: 'Catalogue (link chính hãng)' };

/* ---------- định nghĩa trường nhập ---------- */
SG.PFIELDS = {
  grid: { n: 'Lưới (réseau)', f: [['U', 'Điện áp pha–pha', 'V'], ['phases', 'Số pha', ''], ['f', 'Tần số', 'Hz'], ['S', 'Công suất khả dụng', 'kVA'], ['Icc', 'Dòng ngắn mạch tại PCC', 'kA'], ['earthing', 'Sơ đồ nối đất', 'text'], ['export', 'Giới hạn phát lên lưới', 'kW']] },
  pv: { n: 'PV (tấm & dàn)', f: [['brand', 'Hãng', 'text'], ['model', 'Model', 'text'], ['Pmod', 'Công suất mỗi tấm', 'W'], ['Voc', 'Voc (STC)', 'V'], ['Vmp', 'Vmp (STC)', 'V'], ['Isc', 'Isc (STC)', 'A'], ['Imp', 'Imp (STC)', 'A'], ['bVoc', 'Hệ số nhiệt Voc', '%/°C'], ['bPmax', 'Hệ số nhiệt Pmax', '%/°C'], ['Ns', 'Số tấm nối tiếp / chuỗi', ''], ['Np', 'Số chuỗi song song', ''], ['Tmin', 'Nhiệt độ tối thiểu', '°C'], ['Tcmax', 'Nhiệt độ cell tối đa', '°C']] },
  bat: { n: 'Batterie', f: [['brand', 'Hãng', 'text'], ['model', 'Model', 'text'], ['Vnom', 'Điện áp danh định', 'V'], ['Vmin', 'Điện áp min', 'V'], ['Vmax', 'Điện áp max', 'V'], ['E', 'Dung lượng', 'kWh'], ['Ich', 'Dòng sạc tối đa', 'A'], ['Idis', 'Dòng xả tối đa', 'A'], ['bms', 'BMS', 'text'], ['proto', 'Giao thức BMS', 'text'], ['compat', 'Bằng chứng tương thích với bộ chuyển đổi (tài liệu hãng)', 'text']] },
  motor: { n: 'Moteur', f: [['brand', 'Hãng', 'text'], ['model', 'Model', 'text'], ['P', 'Công suất', 'kW'], ['U', 'Điện áp', 'V'], ['phases', 'Số pha', ''], ['In', 'Dòng định mức', 'A'], ['cos', 'cosφ', ''], ['eta', 'Hiệu suất', '%'], ['rpm', 'Tốc độ', 'vg/ph'], ['start', 'Cách khởi động', 'sel:vfd=Biến tần|dol=Trực tiếp (contacteur)|soft=Khởi động mềm'], ['duty', 'Chế độ tải', 'sel:normal=Tải nhẹ (quạt, bơm)|heavy=Tải nặng (băng tải, nén)'], ['overload', 'Yêu cầu quá tải', '% trong 60 s']] }
};
SG.LOADTYPES = { R: 'Điện trở', motor: 'Động cơ', elec: 'Điện tử / ổ cắm', EV: 'Sạc EV' };
SG.LOADCTRL = { none: 'Không điều khiển', onoff: 'Đóng/cắt (DO + phản hồi DI)', steps: 'Theo bậc (mỗi bậc DO + DI)', ocpp: 'Giới hạn qua OCPP', vary: 'Điều chỉnh liên tục (AO)' };

SG.defaultProj = function () {
  const a = v => ({ v, s: 'assume' });
  return {
    grid: { status: 'have', U: a(400), phases: a(3), f: a(50), S: a(36), Icc: { v: null, s: 'assume' }, earthing: a('TN-S'), export: a(3) },
    pv: { status: 'select', brand: { v: '', s: 'assume' }, model: { v: '', s: 'assume' }, Pmod: a(430), Voc: a(41.5), Vmp: a(34.6), Isc: a(13.2), Imp: a(12.4), bVoc: a(-0.28), bPmax: a(-0.35), Ns: a(14), Np: a(1), Tmin: a(-10), Tcmax: a(70) },
    bat: { status: 'select', brand: { v: '', s: 'assume' }, model: { v: '', s: 'assume' }, Vnom: a(200), Vmin: a(170), Vmax: a(230), E: a(10), Ich: a(25), Idis: a(25), bms: a('Tích hợp'), proto: a('CAN'), compat: { v: '', s: 'assume' } },
    motor: { status: 'have', brand: { v: '', s: 'assume' }, model: { v: '', s: 'assume' }, P: a(2.2), U: a(400), phases: a(3), In: a(4.7), cos: a(0.82), eta: a(85), rpm: a(1450), start: a('vfd'), duty: a('normal'), overload: a(110) },
    loads: [
      { id: 'L1', n: 'Tải ưu tiên (chiếu sáng, ổ cắm đo)', P: 1.5, U: 400, phases: 3, type: 'elec', Istart: null, prio: true, ctrl: 'none', meas: true, steps: 1 },
      { id: 'L2', n: 'Bàn tải điện trở', P: 6, U: 400, phases: 3, type: 'R', Istart: null, prio: false, ctrl: 'steps', meas: true, steps: 3 },
      { id: 'L3', n: 'Trạm sạc EV', P: 7.4, U: 230, phases: 1, type: 'EV', Istart: null, prio: false, ctrl: 'ocpp', meas: false, steps: 1 }
    ],
    choices: {}, spare: 20, statusTrip: 'di'
  };
};
SG.proj = (function () { const d = SG.defaultProj(); const s = SG.store.get('proj', null); return s && s.grid ? Object.assign(d, s) : d; })();
SG.pv = (sec, k) => { const x = SG.proj[sec] && SG.proj[sec][k]; return x == null ? null : (typeof x === 'object' && 'v' in x ? x.v : x); };
SG.psrc = (sec, k) => { const x = SG.proj[sec] && SG.proj[sec][k]; return x && x.s ? x : { s: 'manual' }; };

/* đồng bộ dự án → cấu hình hệ thống (để sơ đồ, HMI, kịch bản dùng đúng thiết bị) */
SG.syncProj = function () {
  const P = SG.proj, c = SG.cfg, v = SG.pv;
  const num = x => (x == null || x === '' || isNaN(+x)) ? null : +x;
  if (num(v('grid', 'U'))) c.U = num(v('grid', 'U')); if (num(v('grid', 'phases'))) c.phases = num(v('grid', 'phases'));
  if (num(v('grid', 'f'))) c.f = num(v('grid', 'f')); if (num(v('grid', 'S'))) c.Sgrid = num(v('grid', 'S'));
  c.Icc = num(v('grid', 'Icc')); if (num(v('grid', 'export')) != null) { c.exportLimit = num(v('grid', 'export')); c.exportAllowed = c.exportLimit > 0; }
  const Ns = num(v('pv', 'Ns')), Np = num(v('pv', 'Np')) || 1, Pm = num(v('pv', 'Pmod'));
  if (Ns && Pm) c.Ppv = Math.round(Ns * Np * Pm / 100) / 10;
  if (Ns) c.pvNs = Ns; if (num(v('pv', 'Voc'))) c.pvVoc = num(v('pv', 'Voc')); if (num(v('pv', 'bVoc')) != null) c.pvBeta = num(v('pv', 'bVoc')); if (num(v('pv', 'Tmin')) != null) c.pvTmin = num(v('pv', 'Tmin'));
  if (num(v('bat', 'Vnom'))) c.batV = num(v('bat', 'Vnom')); if (num(v('bat', 'E'))) c.Ebat = num(v('bat', 'E'));
  const ich = num(v('bat', 'Ich')), idis = num(v('bat', 'Idis')); if (ich && idis) c.batImax = Math.min(ich, idis);
  if (num(v('motor', 'P'))) c.Pm = num(v('motor', 'P'));
  const prio = P.loads.filter(l => l.prio && l.type !== 'EV' && l.type !== 'motor'); c.Plp = Math.round(prio.reduce((a, l) => a + (+l.P || 0), 0) * 10) / 10 || c.Plp;
  const st = P.loads.find(l => !l.prio && l.type === 'R'); if (st) { c.rlSteps = Math.max(1, Math.min(6, st.ctrl === 'steps' ? +st.steps || 1 : 1)); c.rlStep = Math.round((+st.P || 0) / c.rlSteps * 10) / 10; }
  const ev = P.loads.find(l => l.type === 'EV'); c.ev = !!ev; if (ev) c.Pev = +ev.P;
  const inv = SG.chosen('pvinv'); if (inv) { const g = k => SG.spec(inv, k); if (g('Pac')) c.Pinv = g('Pac') / 1000; if (g('Vdcmax')) c.invVdcMax = g('Vdcmax'); if (g('mpptMin')) c.invMpptMin = g('mpptMin'); if (g('mpptMax')) c.invMpptMax = g('mpptMax'); }
  c.spare = P.spare;
  SG.saveCfg();
};
SG.SYNCED = ['U', 'phases', 'f', 'Sgrid', 'Icc', 'exportAllowed', 'exportLimit', 'Ppv', 'pvNs', 'pvVoc', 'pvBeta', 'pvTmin', 'batV', 'Ebat', 'batImax', 'Pm', 'Plp', 'rlSteps', 'rlStep', 'ev', 'Pev', 'spare'];
SG.saveProj = () => { SG.store.set('proj', SG.proj); SG.syncProj(); };

/* ---------- sản phẩm ---------- */
SG.products = SG.products || [];
SG.prod = id => SG.products.find(p => p.id === id);
SG.spec = (p, k) => { const s = p && p.specs && p.specs[k]; return s == null ? null : (typeof s === 'object' && !Array.isArray(s) && 'v' in s ? s.v : s); };
SG.specRef = (p, k) => { const s = p && p.specs && p.specs[k]; const d = p && p.docs && p.docs[0]; return s == null ? null : { s: p.verifiedBy === 'user' ? 'manual' : 'catalog', ref: (s.ref || (d ? d.t : '')) + (s.p ? ' — tr. ' + s.p : ''), url: s.url || (d && d.url), date: d && d.date }; };
SG.chosen = slot => { const id = SG.proj.choices[slot]; if (id === '__none') return null; if (id) return SG.prod(id) || (SG.proj.custom && SG.proj.custom[id]) || null; const r = SG.suggest(slot); return r && r.cands[0] ? r.cands[0].p : null; };

/* ---------- tính toán dự án ---------- */
SG.pcalc = function () {
  const v = SG.pv, num = x => (x == null || x === '' || isNaN(+x)) ? null : +x;
  const U = num(v('grid', 'U')) || 400, ph = num(v('grid', 'phases')) || 3;
  const I3 = (kw, cos = 1) => kw * 1000 / (Math.sqrt(3) * U * cos), I1 = (kw, cos = 1) => kw * 1000 / (U / Math.sqrt(3) * cos);
  const R = {};
  const Ns = num(v('pv', 'Ns')), Np = num(v('pv', 'Np')) || 1, Voc = num(v('pv', 'Voc')), Vmp = num(v('pv', 'Vmp')), Isc = num(v('pv', 'Isc')), Imp = num(v('pv', 'Imp'));
  const bV = num(v('pv', 'bVoc')), bP = num(v('pv', 'bPmax')), Tmin = num(v('pv', 'Tmin')), Tcmax = num(v('pv', 'Tcmax'));
  R.pv = { Ns, Np, Pdc: Ns && num(v('pv', 'Pmod')) ? Ns * Np * num(v('pv', 'Pmod')) : null,
    VocCold: Ns && Voc && bV != null && Tmin != null ? Ns * Voc * (1 + bV / 100 * (Tmin - 25)) : null,
    VmpCold: Ns && Vmp && bV != null && Tmin != null ? Ns * Vmp * (1 + bV / 100 * (Tmin - 25)) : null,
    VmpHot: Ns && Vmp && (bP != null || bV != null) && Tcmax != null ? Ns * Vmp * (1 + (bV != null ? bV : bP) / 100 * (Tcmax - 25)) : null,
    Isc: Isc, Imp: Imp, IscTot: Isc ? Isc * Np : null };
  const mP = num(v('motor', 'P')), mIn = num(v('motor', 'In'));
  R.motor = { P: mP, In: mIn, U: num(v('motor', 'U')), ph: num(v('motor', 'phases')), start: v('motor', 'start'), duty: v('motor', 'duty'), ov: num(v('motor', 'overload')) };
  R.Ipcc = num(v('grid', 'S')) ? (ph === 3 ? num(v('grid', 'S')) * 1000 / (Math.sqrt(3) * U) : num(v('grid', 'S')) * 1000 / (U / Math.sqrt(3))) : null;
  R.circuits = [{ id: 'QF0', n: 'Đầu vào PCC', Ib: R.Ipcc, poles: ph === 3 ? '4P' : '2P', curve: 'C hoặc điện tử', ac: 'AC', load: 'Tổng' }];
  const inv = SG.chosen('pvinv'); const Pinv = inv ? SG.spec(inv, 'Pac') / 1000 : (R.pv.Pdc ? R.pv.Pdc / 1000 / 1.2 : null);
  if (Pinv) R.circuits.push({ id: 'QF-PV', n: 'Nhánh onduleur PV', Ib: ph === 3 ? I3(Pinv) : I1(Pinv), poles: ph === 3 ? '4P' : '2P', curve: 'Theo khuyến nghị hãng inverter', ac: 'AC', load: 'Inverter', mfr: inv && SG.spec(inv, 'maxOCPD') });
  const pcs = SG.chosen('pcs'); const Ppcs = pcs ? SG.spec(pcs, 'P') / 1000 : SG.cfg.Pcs;
  if (num(v('bat', 'E'))) R.circuits.push({ id: 'QF-BAT', n: 'Nhánh bộ chuyển đổi pin (AC)', Ib: ph === 3 ? I3(Ppcs) : I1(Ppcs), poles: ph === 3 ? '4P' : '2P', curve: 'Theo khuyến nghị hãng', ac: 'AC', load: 'Bộ chuyển đổi' });
  if (mP) R.circuits.push({ id: 'QF-M1', n: 'Nhánh động cơ', Ib: mIn || I3(mP / ((num(v('motor', 'eta')) || 85) / 100), num(v('motor', 'cos')) || 0.82), poles: '3P', curve: R.motor.start === 'dol' ? 'Disjoncteur-moteur (bảo vệ nhiệt chỉnh theo In) — dòng khởi động 6–8 × In' : 'Theo bảng phối hợp của hãng biến tần', ac: 'AC', load: 'Động cơ' });
  SG.proj.loads.forEach(l => { const P = +l.P; if (!P) return; const Ib = (+l.phases === 1 ? P * 1000 / ((+l.U || 230)) : I3(P, l.type === 'elec' ? 0.95 : 1)); R.circuits.push({ id: 'QF-' + l.id, n: l.n, Ib, poles: +l.phases === 1 ? '1P+N' : '4P', curve: l.type === 'R' ? 'C' : l.type === 'EV' ? 'C + RCD theo yêu cầu trạm (A + 6 mA DC hoặc B)' : l.Istart ? 'Theo dòng khởi động ' + l.Istart + ' A' : 'C', ac: 'AC', load: SG.LOADTYPES[l.type] }); });
  R.circuits.push({ id: 'QF-AUX', n: 'Nguồn điều khiển 24 V', Ib: (SG.cfg.psuA * 24 / 0.9) / (U / Math.sqrt(3) * 0.95), poles: '1P+N', curve: 'C (dòng inrush PSU)', ac: 'AC', load: 'PSU' });
  const STD = [2, 4, 6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250];
  R.circuits.forEach(c => { c.InMin = c.Ib ? STD.find(x => x >= c.Ib) || null : null; });
  R.io = SG.pio();
  return R;
};

/* ---------- danh sách tín hiệu của dự án: I/O vật lý tách khỏi dữ liệu Modbus ---------- */
SG.pio = function () {
  const P = SG.proj, c = SG.cfg;
  const base = SG.signals(c).filter(s => !/^(KM_RL|QF_RL|QF_LP|QF_EV|RL_P|LP_P|EV_DATA)/.test(s.code));
  const add = [];
  P.loads.forEach(l => {
    if (P.statusTrip === 'di') add.push({ code: 'QF_' + l.id + '_SD', io: 'DI', src: 'QF-' + l.id, dst: 'DI', type: 'Tiếp điểm khô NO → 24 VDC', func: 'Máy cắt ' + l.n + ' trip', fail: '—', via: 'I/O' });
    const n = l.ctrl === 'steps' ? (+l.steps || 1) : l.ctrl === 'onoff' ? 1 : 0;
    for (let i = 1; i <= n; i++) {
      const sfx = n > 1 ? '_' + i : '';
      add.push({ code: 'KM_' + l.id + sfx + '_CMD', io: 'DO', src: 'DO', dst: 'KM-' + l.id + sfx, type: c.useKA ? 'Transistor 24 VDC → KA → cuộn ' + (c.coilV === '230VAC' ? '230 VAC' : '24 VDC') : 'DO trực tiếp', func: 'Đóng ' + l.n + (n > 1 ? ' bậc ' + i : ''), fail: 'Mất lệnh → cắt tải', via: 'I/O' });
      add.push({ code: 'KM_' + l.id + sfx + '_FB', io: 'DI', src: 'KM-' + l.id + sfx, dst: 'DI', type: 'Tiếp điểm phụ NO → 24 VDC', func: 'Phản hồi ' + l.n + (n > 1 ? ' bậc ' + i : ''), fail: 'Bất nhất lệnh/phản hồi → báo động', via: 'I/O' });
    }
    if (l.ctrl === 'vary') add.push({ code: l.id + '_SET', io: 'AO', src: 'AIO', dst: l.id, type: '0–10 V hoặc 4–20 mA (theo thiết bị)', func: 'Đặt công suất ' + l.n, fail: 'Mất tín hiệu → theo cấu hình thiết bị', via: 'I/O' });
    if (l.meas) add.push({ code: 'PM_' + l.id + '_P', io: 'COM', src: 'PM-' + l.id, dst: c.rtuVia === 'gw' ? 'GW' : 'COM', type: 'Modbus RTU', func: 'Công suất ' + l.n, fail: 'Timeout → không hợp lệ', via: 'Modbus' });
    if (l.ctrl === 'ocpp') add.push({ code: l.id + '_OCPP', io: 'COM', src: 'EVSE-' + l.id, dst: 'EMS', type: 'OCPP', func: 'Công suất & giới hạn dòng ' + l.n, fail: 'Mất kết nối → giới hạn mặc định của trạm', via: 'OCPP' });
  });
  const all = base.map(s => Object.assign({ via: s.io === 'COM' ? (/OCPP/.test(s.type) ? 'OCPP' : /CAN/.test(s.type) ? 'CAN' : /LoRa/.test(s.type) ? 'MQTT' : 'Modbus') : 'I/O' }, s)).concat(add);
  if (P.motor && SG.pv('motor', 'start') === 'dol') { for (let i = all.length - 1; i >= 0; i--) if (/^VFD_/.test(all[i].code)) all.splice(i, 1); all.push({ code: 'KM_M1_CMD', io: 'DO', src: 'DO', dst: 'KM-M1', type: 'Transistor → KA → cuộn', func: 'Khởi động trực tiếp M1', fail: 'Mất lệnh → dừng', via: 'I/O' }, { code: 'QM1_TRIP', io: 'DI', src: 'QM1', dst: 'DI', type: 'Tiếp điểm phụ disjoncteur-moteur', func: 'Bảo vệ nhiệt động cơ tác động', fail: '—', via: 'I/O' }); }
  const sp = 1 + (+P.spare || 0) / 100, cnt = t => all.filter(s => s.io === t).length;
  const o = { list: all, DI: cnt('DI'), DO: cnt('DO'), AI: cnt('AI'), AO: cnt('AO'), COM: cnt('COM') };
  o.need = { DI: Math.ceil(o.DI * sp), DO: Math.ceil(o.DO * sp), AI: Math.ceil(o.AI * sp), AO: Math.ceil(o.AO * sp) };
  o.modbusDevices = [...new Set(all.filter(s => s.via === 'Modbus').map(s => s.src))];
  return o;
};

/* ---------- vị trí cần chọn & yêu cầu kỹ thuật ---------- */
SG.SLOTS = [
  { id: 'pvinv', n: 'Onduleur PV', fr: 'Onduleur photovoltaïque', when: () => SG.proj.pv.status !== 'none' },
  { id: 'pcs', n: 'Bộ chuyển đổi pin / onduleur hybride', fr: 'Convertisseur batterie', when: () => SG.proj.bat.status !== 'none' },
  { id: 'vfd', n: 'Biến tần động cơ', fr: 'Variateur de vitesse', when: () => SG.pv('motor', 'start') === 'vfd' },
  { id: 'meter-pcc', n: 'Đồng hồ / analyseur tại PCC', fr: 'Centrale de mesure', when: () => true },
  { id: 'meter-branch', n: 'Đồng hồ nhánh', fr: 'Compteur divisionnaire', when: () => SG.proj.loads.some(l => l.meas) },
  { id: 'plc', n: 'PLC + module I/O + truyền thông', fr: 'Automate', when: () => true },
  { id: 'hmi', n: 'HMI', fr: 'Pupitre opérateur', when: () => true },
  { id: 'switch', n: 'Switch Ethernet', fr: 'Commutateur', when: () => true },
  { id: 'psu', n: 'Nguồn 24 VDC', fr: 'Alimentation 24 V', when: () => true },
  { id: 'prot', n: 'Bảo vệ & đóng cắt (disjoncteur, fusible, sectionneur, contacteur)', fr: 'Protection et commande', when: () => true, reqOnly: true }
];

/* yêu cầu: { k, n, test(p) → {st, d, used:[keys]} } — test trả về null nếu sản phẩm thiếu thông số */
SG.reqs = function (slot, R) {
  R = R || SG.pcalc();
  const v = SG.pv, num = x => (x == null || x === '' || isNaN(+x)) ? null : +x;
  const U = num(v('grid', 'U')) || 400, ph = num(v('grid', 'phases')) || 3;
  const L = [];
  const req = (n, txt, keys, fn) => L.push({ n, txt, keys, fn });
  if (slot === 'pvinv') {
    const pv = R.pv;
    req('Số pha / điện áp AC', ph + ' pha, ' + U + ' V', ['phases', 'Vac'], p => cmp(SG.spec(p, 'phases') === ph && (!SG.spec(p, 'Vac') || Math.abs(SG.spec(p, 'Vac') - U) < 30), 'Inverter ' + SG.spec(p, 'phases') + ' pha'));
    req('Công suất AC', pv.Pdc ? 'Khoảng ' + Math.round(pv.Pdc / 1300 * 10) / 10 + '–' + Math.round(pv.Pdc / 900 * 10) / 10 + ' kW (tỷ lệ DC/AC 0,9–1,3)' : 'Cần công suất dàn PV', ['Pac'], p => pv.Pdc ? cmp(pv.Pdc / SG.spec(p, 'Pac') >= 0.9 && pv.Pdc / SG.spec(p, 'Pac') <= 1.3, 'DC/AC = ' + (pv.Pdc / SG.spec(p, 'Pac')).toFixed(2)) : miss('Thiếu công suất dàn PV'));
    req('Điện áp DC tối đa ≥ Voc chuỗi lúc lạnh', pv.VocCold ? '≥ ' + Math.round(pv.VocCold) + ' V' : 'Thiếu Voc / hệ số nhiệt / Tmin', ['Vdcmax'], p => pv.VocCold ? cmp(SG.spec(p, 'Vdcmax') >= pv.VocCold, 'Voc lạnh ' + Math.round(pv.VocCold) + ' V vs ' + SG.spec(p, 'Vdcmax') + ' V') : miss('Thiếu dữ liệu PV'));
    req('Khoảng MPPT chứa Vmp chuỗi (nóng → lạnh)', pv.VmpHot && pv.VmpCold ? Math.round(pv.VmpHot) + '–' + Math.round(pv.VmpCold) + ' V' : 'Thiếu Vmp / hệ số nhiệt / nhiệt độ', ['mpptMin', 'mpptMax'], p => pv.VmpHot && pv.VmpCold ? cmp(pv.VmpHot >= SG.spec(p, 'mpptMin') && pv.VmpCold <= SG.spec(p, 'mpptMax'), 'Vmp ' + Math.round(pv.VmpHot) + '–' + Math.round(pv.VmpCold) + ' V vs MPPT ' + SG.spec(p, 'mpptMin') + '–' + SG.spec(p, 'mpptMax') + ' V') : miss('Thiếu Vmp/Tcmax'));
    req('Số MPPT / chuỗi', (pv.Np || 1) + ' chuỗi', ['nMppt', 'stringsPerMppt'], p => { const cap = SG.spec(p, 'nMppt') * (SG.spec(p, 'stringsPerMppt') || 1); return cmp(cap >= (pv.Np || 1), cap + ' đầu vào chuỗi'); });
    req('Isc chuỗi ≤ Isc tối đa mỗi MPPT (điều kiện cứng)', pv.Isc ? 'Isc ' + pv.Isc + ' A mỗi chuỗi' : 'Thiếu Isc', ['IscMaxMppt'], p => pv.Isc ? cmp(SG.spec(p, 'IscMaxMppt') >= pv.Isc, 'Isc max ' + SG.spec(p, 'IscMaxMppt') + ' A') : miss('Thiếu Isc'));
    req('Imp chuỗi so với dòng vào tối đa mỗi MPPT', pv.Imp ? 'Imp ' + pv.Imp + ' A' : 'Thiếu Imp', ['ImaxMppt'], p => !pv.Imp ? miss('Thiếu Imp') : SG.spec(p, 'ImaxMppt') >= pv.Imp ? { st: 'ok', d: 'Imax ' + SG.spec(p, 'ImaxMppt') + ' A ≥ Imp' } : { st: 'ok', partial: true, d: 'Imp ' + pv.Imp + ' A > ' + SG.spec(p, 'ImaxMppt') + ' A: inverter giới hạn dòng → mất ≈ ' + Math.round((1 - SG.spec(p, 'ImaxMppt') / pv.Imp) * 100) + ' % công suất ở bức xạ cao (không hư hỏng nếu Isc trong giới hạn)' });
    req('Công suất PV tối đa cho phép', pv.Pdc ? '≥ ' + pv.Pdc + ' Wc' : '—', ['PdcMax'], p => pv.Pdc ? cmp(SG.spec(p, 'PdcMax') >= pv.Pdc, SG.spec(p, 'PdcMax') + ' Wc') : miss(''));
    req('Truyền thông: Modbus TCP / SunSpec để đọc P và ghi giới hạn', 'Modbus TCP server + thanh ghi giới hạn P ghi được', ['comm'], p => { const cm = SG.spec(p, 'comm') || []; return cm.some(x => /Modbus TCP|SunSpec/i.test(x)) ? { st: 'ok', d: cm.join(', ') + ' — quyền ghi giới hạn P cần kiểm tra register map', partial: true } : { st: 'ko', d: 'Không thấy Modbus TCP/SunSpec' }; });
  } else if (slot === 'pcs') {
    const Vmin = num(v('bat', 'Vmin')), Vmax = num(v('bat', 'Vmax')), Ich = num(v('bat', 'Ich')), Idis = num(v('bat', 'Idis'));
    req('Số pha / điện áp AC', ph + ' pha, ' + U + ' V', ['phases'], p => cmp(SG.spec(p, 'phases') === ph, SG.spec(p, 'phases') + ' pha'));
    req('Khoảng điện áp pin nằm trong khoảng DC của bộ chuyển đổi', Vmin && Vmax ? Vmin + '–' + Vmax + ' V' : 'Thiếu Vmin/Vmax pin', ['VbatMin', 'VbatMax'], p => Vmin && Vmax ? cmp(Vmin >= SG.spec(p, 'VbatMin') && Vmax <= SG.spec(p, 'VbatMax'), 'Bộ chuyển đổi ' + SG.spec(p, 'VbatMin') + '–' + SG.spec(p, 'VbatMax') + ' V') : miss('Thiếu điện áp pin'));
    req('Dòng sạc/xả', Ich ? 'Pin cho phép sạc ' + Ich + ' A, xả ' + Idis + ' A' : 'Thiếu', ['IchMax', 'IdisMax'], p => Ich ? { st: 'ok', d: 'Bộ chuyển đổi ' + SG.spec(p, 'IchMax') + '/' + SG.spec(p, 'IdisMax') + ' A — giới hạn thực = min của hai bên, BMS sẽ giới hạn', partial: false } : miss(''));
    req('Grid-forming (nếu cần vận hành đảo)', SG.cfg.island ? 'Bắt buộc' : 'Không bắt buộc', ['gridForming'], p => SG.cfg.island ? cmp(SG.spec(p, 'gridForming') === true, SG.spec(p, 'gridForming') ? 'Có' : 'Không') : { st: 'ok', d: 'Không yêu cầu' });
    req('Giao thức BMS và danh sách tương thích của hãng', (v('bat', 'proto') || '?') + ' — cần tài liệu hãng nêu đích danh pin', ['bmsProtocols'], p => ({ st: 'miss', d: 'Cần danh sách tương thích chính thức nêu model pin ' + (v('bat', 'model') || '(chưa có model pin)') }));
  } else if (slot === 'vfd') {
    const m = R.motor;
    req('Điện áp & số pha', (m.U || '?') + ' V, ' + (m.ph || '?') + ' pha', ['Umin', 'Umax', 'phasesIn'], p => m.U ? cmp(m.U >= SG.spec(p, 'Umin') && m.U <= SG.spec(p, 'Umax') && (SG.spec(p, 'phasesIn') === ph), SG.spec(p, 'Umin') + '–' + SG.spec(p, 'Umax') + ' V, ' + SG.spec(p, 'phasesIn') + ' pha vào') : miss('Thiếu U động cơ'));
    req('Dòng ra ≥ In động cơ theo chế độ tải', m.In ? '≥ ' + m.In + ' A (' + (m.duty === 'heavy' ? 'tải nặng' : 'tải nhẹ') + ')' : 'Thiếu In động cơ', ['InHD', 'InND'], p => { const I = m.duty === 'heavy' ? SG.spec(p, 'InHD') : (SG.spec(p, 'InND') || SG.spec(p, 'InHD')); return m.In ? (I == null ? null : cmp(I >= m.In, I + ' A ≥ ' + m.In + ' A?')) : miss('Thiếu In'); });
    req('Khả năng quá tải', m.ov ? m.ov + ' % trong 60 s' : '—', ['ovHD'], p => m.ov ? (SG.spec(p, 'ovHD') == null ? null : cmp(SG.spec(p, 'ovHD') >= m.ov, SG.spec(p, 'ovHD') + ' %')) : { st: 'ok', d: '—' });
    req('Ngõ vào lệnh tương thích ngõ ra PLC (PNP/NPN)', 'Theo PLC đã chọn', ['diLogic'], p => { const pl = SG.chosen('plc'); const a = SG.spec(p, 'diLogic') || [], b = pl ? SG.spec(pl, 'doType') : null; return !b || !a.length ? miss('Thiếu logic DI/DO') : cmp(a.some(x => b.includes(x)), 'Biến tần: ' + a.join('/') + '; PLC DO: ' + b); });
  } else if (slot === 'meter-pcc' || slot === 'meter-branch') {
    const Ib = slot === 'meter-pcc' ? R.Ipcc : Math.max(...R.circuits.filter(c => /^QF-L/.test(c.id)).map(c => c.Ib || 0));
    req('Kiểu mạng', ph === 3 ? '3P4W ' + U + ' V' : '1P2W', ['Umax'], p => cmp(SG.spec(p, 'Umax') >= U, 'đến ' + SG.spec(p, 'Umax') + ' V'));
    req('Ngõ vào dòng', Ib ? (Ib > 63 ? 'Qua CT (Ib ≈ ' + Math.round(Ib) + ' A)' : 'Trực tiếp ≤ 63 A được (Ib ≈ ' + Math.round(Ib) + ' A)') : '—', ['Iin'], p => { const t = SG.spec(p, 'Iin'); if (!t) return null; if (/direct/.test(t)) return cmp(Ib <= SG.spec(p, 'Idirect'), 'Đo trực tiếp ' + SG.spec(p, 'Idirect') + ' A'); return { st: 'ok', d: 'Qua CT ' + t + ' — cần CT cùng loại ngõ ra' }; });
    req('Truyền thông', slot === 'meter-pcc' ? (SG.cfg.pccComm === 'tcp' ? 'Modbus TCP (server)' : 'Modbus RTU') : 'Modbus RTU (bus đồng hồ nhánh)', ['comm'], p => { const cm = SG.spec(p, 'comm') || []; const want = slot === 'meter-pcc' && SG.cfg.pccComm === 'tcp' ? /Modbus TCP/i : /Modbus RTU/i; return cmp(cm.some(x => want.test(x)), cm.join(', ')); });
    req('Cấp chính xác', 'Cl. 1 hoặc tốt hơn', ['acc'], p => ({ st: 'ok', d: SG.spec(p, 'acc') }));
  } else if (slot === 'plc') {
    const io = R.io;
    req('Ngõ vào số', io.need.DI + ' kênh (gồm dự phòng ' + SG.proj.spare + ' %)', ['diBase', 'expModules'], p => SG.spec(p, 'diBase') >= io.need.DI ? { st: 'ok', d: SG.spec(p, 'diBase') + ' DI tích hợp' } : SG.spec(p, 'expModules') ? { st: 'ok', partial: true, d: SG.spec(p, 'diBase') + ' DI tích hợp + cần ' + (io.need.DI - SG.spec(p, 'diBase')) + ' DI từ module mở rộng (tối đa ' + SG.spec(p, 'expModules') + ' module; chọn module theo catalogue hãng)' } : { st: 'ko', d: 'Chỉ ' + SG.spec(p, 'diBase') + ' DI, không mở rộng được' });
    req('Ngõ ra số', io.need.DO + ' kênh', ['doBase'], p => ({ st: 'ok', d: SG.spec(p, 'doBase') + ' tích hợp (' + SG.spec(p, 'doType') + ') + module mở rộng', partial: true }));
    req('Analog', io.need.AI + ' AI, ' + io.need.AO + ' AO', ['aiBase'], p => ({ st: 'ok', d: (SG.spec(p, 'aiBase') || 0) + ' AI tích hợp + module mở rộng', partial: true }));
    req('Ethernet Modbus TCP client', 'Đọc ' + SG.calc(SG.cfg).eth.list.filter(x => !['CPU', 'HMI', 'EMS'].includes(x)).length + ' thiết bị Ethernet', ['comm'], p => cmp((SG.spec(p, 'comm') || []).some(x => /Modbus TCP/i.test(x)), (SG.spec(p, 'comm') || []).join(', ')));
    req('Modbus RTU (RS485)', io.modbusDevices.length ? 'Có thiết bị RTU → cần cổng RS485 hoặc module/gateway' : 'Không cần', ['serial'], p => ({ st: 'ok', d: SG.spec(p, 'serial') || 'Không có cổng nối tiếp tích hợp → module/gateway', partial: true }));
  } else if (slot === 'psu') {
    const I = SG.calc(SG.cfg).aux.I;
    req('Dòng ra 24 VDC', '≥ ' + (I / 0.8).toFixed(1) + ' A (tải ước lượng ' + I.toFixed(1) + ' A, dự phòng 20 %)', ['Iout'], p => cmp(SG.spec(p, 'Iout') >= I / 0.8, SG.spec(p, 'Iout') + ' A'));
    req('Tiếp điểm DC-OK', 'Có (báo về DI)', ['dcok'], p => cmp(!!SG.spec(p, 'dcok'), SG.spec(p, 'dcok') ? 'Có' : 'Không'));
  } else if (slot === 'switch') {
    const e = SG.calc(SG.cfg).eth;
    req('Số cổng', '≥ ' + (e.n + 2) + ' cổng RJ45', ['ports'], p => cmp(SG.spec(p, 'ports') >= e.n + 2, SG.spec(p, 'ports') + ' cổng'));
    req('Nguồn 24 VDC (sống trên UPS)', '24 VDC', ['Vin'], p => cmp(/24/.test(String(SG.spec(p, 'Vin'))), SG.spec(p, 'Vin')));
  } else if (slot === 'hmi') {
    req('Driver tới PLC đã chọn', 'Phải có driver cho giao thức của PLC', ['drivers'], p => { const pl = SG.chosen('plc'); const d = SG.spec(p, 'drivers') || []; return !pl ? miss('Chưa chọn PLC') : cmp(d.some(x => (SG.spec(pl, 'comm') || []).some(y => y.includes(x)) || x === pl.brand), 'Driver: ' + d.join(', ') + ' — PLC ' + pl.brand + ' ' + pl.model); });
    req('Ethernet + 24 VDC', 'Có', ['comm'], p => ({ st: 'ok', d: (SG.spec(p, 'comm') || []).join(', ') }));
  }
  return L;
  function cmp(ok, d) { return { st: ok ? 'ok' : 'ko', d }; }
  function miss(d) { return { st: 'miss', d }; }
};

/* đánh giá một sản phẩm theo yêu cầu của vị trí → trạng thái 4 mức */
SG.evalProduct = function (slot, p, R) {
  const L = SG.reqs(slot, R), rows = [];
  let worst = 'verified';
  const rank = { verified: 0, prelim: 1, miss: 2, ko: 3 };
  const inputSrcBad = SG.inputsUnverified(slot);
  L.forEach(q => {
    const missingKeys = q.keys.filter(k => SG.spec(p, k) == null);
    let r = missingKeys.length === q.keys.length && q.keys.length ? null : q.fn(p);
    let st;
    if (!r) { st = 'miss'; r = { d: 'Catalogue chưa có: ' + missingKeys.join(', ') }; }
    else if (r.st === 'ko') st = 'ko';
    else if (r.st === 'miss') st = 'miss';
    else st = (r.partial || inputSrcBad || p.verifiedBy === 'user' && !p.docs?.length) ? 'prelim' : 'verified';
    rows.push({ n: q.n, need: q.txt, st, d: r.d });
    if (rank[st] > rank[worst]) worst = st;
  });
  return { st: worst, rows };
};
/* thông số đầu vào chưa có tài liệu → không thể “đã xác minh” */
SG.inputsUnverified = function (slot) {
  const sec = { pvinv: 'pv', pcs: 'bat', vfd: 'motor', 'meter-pcc': 'grid', 'meter-branch': 'grid' }[slot];
  if (!sec) return false;
  const P = SG.proj[sec];
  return Object.values(P).some(x => x && typeof x === 'object' && 'v' in x && x.v !== '' && x.v != null && x.s !== 'doc' && x.s !== 'catalog');
};
SG.suggest = function (slot) {
  if (SG._sugCache && SG._sugCache[slot]) return SG._sugCache[slot];
  const R = SG._R || SG.pcalcRaw();
  const ps = SG.products.filter(p => p.slot === slot || (p.slots || []).includes(slot)).concat(Object.values(SG.proj.custom || {}).filter(p => p.slot === slot));
  const rank = { verified: 0, prelim: 1, miss: 2, ko: 3 };
  const cands = ps.map(p => { const e = SG.evalProduct(slot, p, R); if (p.discontinued) { e.st = 'ko'; e.rows.unshift({ n: 'Tình trạng thương mại', need: 'Đang được bán', st: 'ko', d: p.discontinued }); } return Object.assign({ p }, e); }).sort((a, b) => rank[a.st] - rank[b.st]);
  const out = { cands: cands.filter(x => x.st !== 'ko').slice(0, 3), rejected: cands.filter(x => x.st === 'ko'), reqs: SG.reqs(slot, R) };
  (SG._sugCache = SG._sugCache || {})[slot] = out;
  return out;
};
SG.pcalcRaw = function () { const save = SG.chosen; SG.chosen = () => null; try { return SG.pcalc(); } finally { SG.chosen = save; } };
SG.refresh = function () { SG._sugCache = {}; SG._R = SG.pcalcRaw(); SG._sugCache = {}; SG.syncProj(); SG._R = SG.pcalc(); SG._sugCache = {}; };

/* ---------- kiểm tra theo cặp ---------- */
SG.pairs = function () {
  const R = SG._R || SG.pcalc(), out = [], v = SG.pv;
  const row = (n, st, d, src) => ({ n, st, d, src: src || '' });
  const worst = rows => rows.reduce((w, r) => ({ verified: 0, prelim: 1, miss: 2, ko: 3 }[r.st] > { verified: 0, prelim: 1, miss: 2, ko: 3 }[w] ? r.st : w), 'verified');
  const srcTxt = (sec, keys) => keys.map(k => { const s = SG.psrc(sec, k); return k + ': ' + SG.SRC[s.s] + (s.ref ? ' (' + s.ref + ')' : ''); }).join('; ');
  const fromEval = (slot, a, b, extra) => { const p = SG.chosen(slot); if (!p) return { a, b, slot, st: 'miss', rows: [row('Chưa chọn thiết bị', 'miss', 'Chọn một sản phẩm hoặc nhập thiết bị có sẵn ở tab Gợi ý sản phẩm.')] }; const e = SG.evalProduct(slot, p, R); const rows = e.rows.map(r => row(r.n, r.st, r.d)).concat(extra ? extra(p) : []); return { a, b: b + ': ' + p.brand + ' ' + p.model, slot, st: worst(rows), rows }; };
  if (SG.SLOTS[0].when()) out.push(Object.assign(fromEval('pvinv', 'PV ' + (v('pv', 'model') || '(chưa có model)'), 'Onduleur'), { src: srcTxt('pv', ['Voc', 'Vmp', 'Isc', 'Imp', 'bVoc']) }));
  if (SG.SLOTS[1].when()) out.push(Object.assign(fromEval('pcs', 'Batterie ' + (v('bat', 'model') || '(chưa có model)'), 'Bộ chuyển đổi', p => { const ev = v('bat', 'compat'); return [row('Bằng chứng tương thích pin ↔ bộ chuyển đổi', ev ? (SG.psrc('bat', 'compat').s === 'doc' ? 'verified' : 'prelim') : 'miss', ev ? ev : 'Chưa có tài liệu của hãng nêu đích danh cặp pin–bộ chuyển đổi')]; }), { src: srcTxt('bat', ['Vmin', 'Vmax', 'Ich', 'Idis', 'proto']) }));
  if (SG.pv('motor', 'start') === 'vfd') out.push(Object.assign(fromEval('vfd', 'Moteur ' + (v('motor', 'P') || '?') + ' kW', 'Variateur'), { src: srcTxt('motor', ['U', 'phases', 'In', 'duty']) }));
  else if (SG.pv('motor', 'P')) out.push({ a: 'Moteur', b: 'Khởi động ' + (SG.pv('motor', 'start') === 'dol' ? 'trực tiếp' : 'mềm'), st: 'miss', rows: [row('Disjoncteur-moteur / contacteur AC-3', 'miss', 'Chọn theo In = ' + (R.motor.In || '?') + ' A; dòng khởi động 6–8 × In ảnh hưởng PCS khi đảo và máy phát. Chưa có sản phẩm xác minh trong catalogue.')] });
  // PLC ↔ thiết bị (I/O vật lý)
  const plc = SG.chosen('plc');
  const io = R.io;
  const plcRows = [];
  if (!plc) plcRows.push(row('Chưa chọn PLC', 'miss', ''));
  else {
    const dt = SG.spec(plc, 'doType') || '', dil = SG.spec(plc, 'diType') || '';
    plcRows.push(row('Ngõ vào số: tiếp điểm khô 24 VDC', dil ? 'verified' : 'miss', 'PLC DI: ' + (dil || '?') + ' — tiếp điểm khô dùng được với cả sink/source khi đấu đúng chung'));
    const coilAC = SG.cfg.coilV === '230VAC';
    plcRows.push(row('Ngõ ra số → cuộn contacteur', /transistor/i.test(dt) && coilAC && !SG.cfg.useKA ? 'ko' : 'verified', /transistor/i.test(dt) ? (coilAC ? (SG.cfg.useKA ? 'DO transistor → relay trung gian → cuộn 230 VAC' : 'DO transistor không đóng được cuộn 230 VAC') : 'Cuộn 24 VDC trực tiếp: kiểm tra dòng cuộn') : 'DO relay'));
    const vfd = SG.chosen('vfd');
    if (vfd) { const a = SG.spec(vfd, 'diLogic') || [], b = SG.spec(plc, 'doType') || ''; plcRows.push(row('DO PLC → DI biến tần (PNP/NPN)', a.length && b ? (a.some(x => b.includes(x)) ? 'verified' : 'ko') : 'miss', 'Biến tần ' + (a.join('/') || '?') + ', PLC ' + (b || '?'))); }
    if (io.AI) { const ai = SG.spec(plc, 'aiType') || ''; plcRows.push(row('Ngõ vào analog (' + io.AI + ' kênh: 4–20 mA, Pt100…)', ai && /4.?20/.test(ai) ? 'prelim' : 'miss', 'AI tích hợp: ' + (ai || '?') + '. Kênh 4–20 mA/RTD thường cần module mở rộng — chọn theo catalogue PLC.')); }
    if (io.AO) plcRows.push(row('Ngõ ra analog (' + io.AO + ' kênh 0–10 V)', SG.spec(plc, 'aoBase') ? 'prelim' : 'miss', 'AO tích hợp: ' + (SG.spec(plc, 'aoBase') || 0) + ' → module mở rộng nếu thiếu'));
  }
  out.push({ a: 'PLC' + (plc ? ' ' + plc.model : ''), b: 'Thiết bị đấu dây (DI/DO/AI/AO)', st: worst(plcRows), rows: plcRows });
  // PLC ↔ đồng hồ / onduleur (truyền thông)
  const commDev = [['meter-pcc', 'Đồng hồ PCC', 'read'], ['pvinv', 'Onduleur PV', 'write'], ['pcs', 'Bộ chuyển đổi pin', 'write'], ['vfd', 'Biến tần', 'read']];
  commDev.forEach(([slot, n, rw]) => {
    const S = SG.SLOTS.find(s => s.id === slot); if (!S.when()) return;
    const d = SG.chosen(slot), rows = [];
    if (!plc || !d) rows.push(row('Chưa chọn đủ hai thiết bị', 'miss', ''));
    else {
      const a = SG.spec(plc, 'comm') || [], b = SG.spec(d, 'comm') || [];
      const common = ['Modbus TCP', 'Modbus RTU'].filter(x => a.some(y => y.includes(x)) && b.some(y => y.includes(x)));
      rows.push(row('Giao thức chung', common.length ? 'verified' : (b.length ? 'ko' : 'miss'), common.length ? common.join(', ') + ' — PLC client, ' + n + ' server' : 'PLC: ' + a.join(', ') + ' / thiết bị: ' + b.join(', ')));
      rows.push(row('Bảng registres', d.regmap ? 'verified' : 'miss', d.regmap ? 'Tài liệu: ' + d.regmap.t : 'Chưa có register map chính thức trong catalogue'));
      rows.push(row(rw === 'write' ? 'Quyền GHI (setpoint/giới hạn công suất)' : 'Quyền đọc', rw === 'write' ? (d.writeDoc ? 'verified' : 'miss') : (d.regmap ? 'verified' : 'miss'), rw === 'write' ? 'Có Modbus không đồng nghĩa điều khiển được: cần thanh ghi ghi được, hành vi khi mất truyền thông, giới hạn số lần ghi' : 'Đọc đại lượng cần thiết'));
      if (!common.length && b.some(x => /RTU/.test(x)) && a.some(x => /TCP/.test(x))) rows.push(row('Giải pháp', 'miss', 'Gateway Modbus TCP/RTU hoặc module RS485 cho PLC'));
    }
    out.push({ a: 'PLC', b: n + (d ? ' ' + d.model : ''), st: worst(rows), rows });
  });
  // PLC ↔ HMI
  const hmi = SG.chosen('hmi'); const hr = [];
  if (!plc || !hmi) hr.push(row('Chưa chọn đủ', 'miss', ''));
  else { const e = SG.evalProduct('hmi', hmi, R); e.rows.forEach(r => hr.push(row(r.n, r.st, r.d))); hr.push(row('Phiên bản phần mềm & giới hạn kết nối', 'miss', 'Đối chiếu phiên bản phần mềm HMI hỗ trợ firmware PLC; số kết nối đồng thời của PLC (PLC + HMI + EMS)')); }
  out.push({ a: 'PLC', b: 'HMI' + (hmi ? ' ' + hmi.model : ''), st: worst(hr), rows: hr });
  // Bảo vệ ↔ mạch
  R.circuits.forEach(c => {
    const rows = [row('AC/DC, điện áp, số cực', 'prelim', c.ac + ' ' + (SG.pv('grid', 'U') || 400) + ' V, ' + c.poles)];
    rows.push(row('Dòng: In ≥ Ib', c.Ib ? 'prelim' : 'miss', c.Ib ? 'Ib ≈ ' + c.Ib.toFixed(1) + ' A → In tối thiểu ' + c.InMin + ' A' + (c.mfr ? '; hãng thiết bị yêu cầu tối đa ' + c.mfr + ' A' : '') : 'Thiếu công suất'));
    rows.push(row('Khả năng cắt ≥ Icc', SG.pv('grid', 'Icc') ? 'prelim' : 'miss', SG.pv('grid', 'Icc') ? 'Icu ≥ ' + SG.pv('grid', 'Icc') + ' kA tại điểm lắp (giảm theo tổng trở cáp)' : 'Thiếu Icc tại PCC'));
    rows.push(row('Đặc tính theo tải', 'prelim', c.curve));
    rows.push(row('Cáp (Iz) và phối hợp/chọn lọc', 'miss', 'Cần cách lắp, chiều dài, nhiệt độ, sụt áp; bảng chọn lọc của hãng'));
    out.push({ a: c.id, b: c.n, st: worst(rows), rows, prot: true });
  });
  return out;
};

/* ---------- phần mềm & giấy phép ---------- */
SG.software = function () {
  const L = [];
  SG.SLOTS.forEach(s => { if (!s.when() || s.reqOnly) return; const p = SG.chosen(s.id); if (p && p.software) p.software.forEach(x => L.push(Object.assign({ dev: p.brand + ' ' + p.model, slot: s.n }, x))); else if (!p) L.push({ dev: '—', slot: s.n, n: 'Theo thiết bị được chọn', role: '—', lang: '—', lic: 'Cần xác định', url: '' }); });
  return L;
};

/* ---------- danh sách thông số còn thiếu cần hỏi nhà cung cấp ---------- */
SG.missingList = function () {
  const L = [];
  ['grid', 'pv', 'bat', 'motor'].forEach(sec => { const P = SG.proj[sec]; if (P.status === 'none') return; SG.PFIELDS[sec].f.forEach(([k, n]) => { const x = P[k]; if (!x || x.v === '' || x.v == null) L.push({ who: sec === 'grid' ? 'Đơn vị điện lực / chủ công trình' : 'Nhà cung cấp ' + SG.PFIELDS[sec].n, what: n, why: 'Trường đầu vào trống' }); else if (x.s === 'assume') L.push({ who: sec === 'grid' ? 'Chủ công trình' : 'Nhà cung cấp ' + SG.PFIELDS[sec].n, what: n + ' (đang là giả định ví dụ: ' + x.v + ')', why: 'Cần giá trị từ tài liệu' }); }); });
  SG.pairs().forEach(p => p.rows.filter(r => r.st === 'miss').forEach(r => L.push({ who: p.prot ? 'Thiết kế điện / nhà cung cấp thiết bị bảo vệ' : 'Nhà cung cấp ' + p.b, what: r.n + (r.d ? ' — ' + r.d : ''), why: p.a + ' ↔ ' + p.b })));
  return L;
};

/* ---------- xuất ---------- */
SG.csv = rows => rows.map(r => r.map(x => '"' + String(x == null ? '' : x).replace(/<[^>]+>/g, '').replace(/"/g, '""') + '"').join(';')).join('\r\n');
SG.download = function (name, text, msgEl) {
  try {
    const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    if (msgEl) msgEl.textContent = 'Đã tạo ' + name + '. Nếu trình duyệt không tải về (ví dụ trong trang xem Artifact), dùng “Sao chép”.';
  } catch (e) { if (msgEl) msgEl.textContent = 'Không tải được — dùng “Sao chép”.'; }
};
SG.exports = function () {
  const R = SG._R || SG.pcalc(), today = new Date().toISOString().slice(0, 10);
  const bom = [['Vị trí', 'Hãng', 'Model', 'Số lượng', 'Vai trò', 'Thông số chính', 'Datasheet', 'Ngày kiểm tra', 'Trạng thái']];
  SG.SLOTS.forEach(s => { if (!s.when()) return; if (s.reqOnly) { R.circuits.forEach(c => bom.push([c.id, '', '', 1, 'Bảo vệ ' + c.n, 'In ≥ ' + (c.InMin || '?') + ' A, ' + c.poles + ', ' + c.curve, '', '', 'Yêu cầu kỹ thuật — chưa chọn sản phẩm'])); return; }
    const p = SG.chosen(s.id); const q = s.id === 'meter-branch' ? SG.proj.loads.filter(l => l.meas).length : 1;
    if (!p) bom.push([s.n, '', '', q, s.n, SG.reqs(s.id, R).map(x => x.n + ': ' + x.txt).join(' | '), '', '', 'Yêu cầu kỹ thuật — chưa có sản phẩm xác minh']);
    else { const e = SG.evalProduct(s.id, p, R); bom.push([s.n, p.brand, p.model, q, p.role || s.n, Object.entries(p.specs).slice(0, 6).map(([k, x]) => k + '=' + (Array.isArray(x) ? x.join('/') : (x && x.v != null ? x.v : x))).join(', '), p.docs && p.docs[0] ? p.docs[0].url : '', p.docs && p.docs[0] ? p.docs[0].date : '', SG.ST4[e.st]]); } });
  const io = R.io;
  bom.push(['Module I/O', '', '', '', 'Theo PLC', 'DI ' + io.need.DI + ', DO ' + io.need.DO + ', AI ' + io.need.AI + ', AO ' + io.need.AO + ' (gồm dự phòng ' + SG.proj.spare + ' %)', '', '', 'Yêu cầu kỹ thuật']);
  const comp = [['Thiết bị A', 'Thiết bị B', 'Trạng thái cặp', 'Hạng mục', 'Trạng thái hạng mục', 'Chi tiết', 'Nguồn thông số đầu vào']];
  SG.pairs().forEach(p => p.rows.forEach(r => comp.push([p.a, p.b, SG.ST4[p.st], r.n, SG.ST4[r.st], r.d, p.src || ''])));
  const ios = [['Mã', 'Đường đi', 'Loại', 'Nguồn', 'Đích', 'Kiểu tín hiệu', 'Chức năng', 'Khi lỗi']];
  io.list.forEach(s => ios.push([s.code, s.via, s.io, s.src, s.dst, s.type, s.func, s.fail]));
  const sw = [['Thiết bị', 'Vị trí', 'Phần mềm', 'Vai trò', 'Ngôn ngữ / công cụ', 'Giấy phép', 'Nguồn']];
  SG.software().forEach(x => sw.push([x.dev, x.slot, x.n, x.role, x.lang, x.lic, x.url]));
  const ms = [['Hỏi ai', 'Thông số cần', 'Lý do / cặp kiểm tra']];
  SG.missingList().forEach(x => ms.push([x.who, x.what, x.why]));
  return { bom: ['BOM_' + today + '.csv', bom], comp: ['Tuong_thich_' + today + '.csv', comp], io: ['IO_truyen_thong_' + today + '.csv', ios], sw: ['Phan_mem_giay_phep_' + today + '.csv', sw], miss: ['Thong_so_can_hoi_' + today + '.csv', ms] };
};
