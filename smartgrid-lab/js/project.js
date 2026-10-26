/* DỰ ÁN THIẾT BỊ: đầu vào của người dùng (kèm nguồn gốc từng thông số), yêu cầu theo vị trí,
   gợi ý sản phẩm từ SG.products (data/products.js), kiểm tra theo cặp, I/O, xuất kết quả.
   Nguồn gốc thông số: 'assume' (giả định ví dụ), 'manual' (người dùng nhập), 'doc' (tài liệu người dùng tải, có trang), 'catalog' (data/products.js, có link).
   Trạng thái: verified / prelim / miss / ko. Mọi chuỗi hiển thị qua SG.t (khóa st4.*, src.*, pf.*, slot.*, rq.*, pr.*, ex.*). */
SG.ST4K = ['verified', 'prelim', 'miss', 'ko'];
SG.st4n = s => SG.t('st4.' + s);
SG.st4 = (s, txt) => `<span class="st ${s === 'verified' ? 'ok' : s === 'prelim' ? 'ok prelim' : s === 'miss' ? 'unk' : 'ko'}">${txt || SG.st4n(s)}</span>`;
SG.srcName = s => SG.t('src.' + s);

/* ---------- định nghĩa trường nhập (nhãn: pf.<sec>.<k>, đơn vị giữ nguyên) ---------- */
SG.PFIELDS = {
  grid: { f: [['U', 'V'], ['phases', ''], ['f', 'Hz'], ['S', 'kVA'], ['Icc', 'kA'], ['earthing', 'text'], ['export', 'kW']] },
  pv: { f: [['brand', 'text'], ['model', 'text'], ['Pmod', 'W'], ['Voc', 'V'], ['Vmp', 'V'], ['Isc', 'A'], ['Imp', 'A'], ['bVoc', '%/°C'], ['bPmax', '%/°C'], ['Ns', ''], ['Np', ''], ['Tmin', '°C'], ['Tcmax', '°C']] },
  bat: { f: [['brand', 'text'], ['model', 'text'], ['Vnom', 'V'], ['Vmin', 'V'], ['Vmax', 'V'], ['E', 'kWh'], ['Ich', 'A'], ['Idis', 'A'], ['bms', 'text'], ['proto', 'text'], ['compat', 'text']] },
  motor: { f: [['brand', 'text'], ['model', 'text'], ['P', 'kW'], ['U', 'V'], ['phases', ''], ['In', 'A'], ['cos', ''], ['eta', '%'], ['rpm', 'rpm'], ['start', 'sel:vfd|dol|soft'], ['duty', 'sel:normal|heavy'], ['overload', '%']] }
};
SG.secName = sec => SG.t('pf.' + sec);
SG.fieldName = (sec, k) => SG.t('pf.' + sec + '.' + k);
SG.LOADTYPES = ['R', 'motor', 'elec', 'EV'];
SG.LOADCTRL = ['none', 'onoff', 'steps', 'ocpp', 'vary'];
SG.loadName = l => l.n || SG.t('load.' + l.nk);

SG.defaultProj = function () {
  const a = v => ({ v, s: 'assume' });
  return {
    grid: { status: 'have', U: a(400), phases: a(3), f: a(50), S: a(36), Icc: { v: null, s: 'assume' }, earthing: a('TN-S'), export: a(3) },
    pv: { status: 'select', brand: { v: '', s: 'assume' }, model: { v: '', s: 'assume' }, Pmod: a(430), Voc: a(41.5), Vmp: a(34.6), Isc: a(13.2), Imp: a(12.4), bVoc: a(-0.28), bPmax: a(-0.35), Ns: a(14), Np: a(1), Tmin: a(-10), Tcmax: a(70) },
    bat: { status: 'select', brand: { v: '', s: 'assume' }, model: { v: '', s: 'assume' }, Vnom: a(200), Vmin: a(170), Vmax: a(230), E: a(10), Ich: a(25), Idis: a(25), bms: { v: '', s: 'assume' }, proto: a('CAN'), compat: { v: '', s: 'assume' } },
    motor: { status: 'have', brand: { v: '', s: 'assume' }, model: { v: '', s: 'assume' }, P: a(2.2), U: a(400), phases: a(3), In: a(4.7), cos: a(0.82), eta: a(85), rpm: a(1450), start: a('vfd'), duty: a('normal'), overload: a(110) },
    loads: [
      { id: 'L1', nk: 'L1', n: '', P: 1.5, U: 400, phases: 3, type: 'elec', Istart: null, prio: true, ctrl: 'none', meas: true, steps: 1 },
      { id: 'L2', nk: 'L2', n: '', P: 6, U: 400, phases: 3, type: 'R', Istart: null, prio: false, ctrl: 'steps', meas: true, steps: 3 },
      { id: 'L3', nk: 'L3', n: '', P: 7.4, U: 230, phases: 1, type: 'EV', Istart: null, prio: false, ctrl: 'ocpp', meas: false, steps: 1 }
    ],
    choices: {}, spare: 20, statusTrip: 'di'
  };
};
SG.proj = (function () { const d = SG.defaultProj(); const s = SG.store.get('proj', null); return s && s.grid ? Object.assign(d, s) : d; })();
/* chuyển dữ liệu lưu từ phiên bản một ngôn ngữ: tên tải ví dụ cũ → khóa dịch */
(function () {
  const OLD = { 'Tải ưu tiên (chiếu sáng, ổ cắm đo)': 'L1', 'Bàn tải điện trở': 'L2', 'Trạm sạc EV': 'L3', 'Tải mới': 'new' };
  (SG.proj.loads || []).forEach(l => { if (OLD[l.n]) { l.nk = OLD[l.n]; l.n = ''; } });
  if (SG.proj.bat && SG.proj.bat.bms && SG.proj.bat.bms.v === 'Tích hợp' && SG.proj.bat.bms.s === 'assume') SG.proj.bat.bms.v = '';
})();
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
SG.chosen = slot => { const id = SG.proj.choices[slot]; if (id === '__none') return null; if (id) return SG.prod(id) || (SG.proj.custom && SG.proj.custom[id]) || null; const r = SG.suggest(slot); return r && r.cands[0] ? r.cands[0].p : null; };

/* ---------- tính toán dự án ---------- */
SG.pcalc = function () {
  const v = SG.pv, num = x => (x == null || x === '' || isNaN(+x)) ? null : +x, t = SG.t;
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
  R.circuits = [{ id: 'QF0', n: t('circ.pcc'), Ib: R.Ipcc, poles: ph === 3 ? '4P' : '2P', curve: t('circ.pccCurve'), ac: 'AC' }];
  const inv = SG.chosen('pvinv'); const Pinv = inv ? SG.spec(inv, 'Pac') / 1000 : (R.pv.Pdc ? R.pv.Pdc / 1000 / 1.2 : null);
  if (Pinv) R.circuits.push({ id: 'QF-PV', n: t('circ.pv'), Ib: ph === 3 ? I3(Pinv) : I1(Pinv), poles: ph === 3 ? '4P' : '2P', curve: t('circ.pvCurve'), ac: 'AC', mfr: inv && SG.spec(inv, 'maxOCPD') });
  const pcs = SG.chosen('pcs'); const Ppcs = pcs ? SG.spec(pcs, 'P') / 1000 : SG.cfg.Pcs;
  if (num(v('bat', 'E'))) R.circuits.push({ id: 'QF-BAT', n: t('circ.bat'), Ib: ph === 3 ? I3(Ppcs) : I1(Ppcs), poles: ph === 3 ? '4P' : '2P', curve: t('circ.batCurve'), ac: 'AC' });
  if (mP) R.circuits.push({ id: 'QF-M1', n: t('circ.m1'), Ib: mIn || I3(mP / ((num(v('motor', 'eta')) || 85) / 100), num(v('motor', 'cos')) || 0.82), poles: '3P', curve: t(R.motor.start === 'dol' ? 'circ.m1Dol' : 'circ.m1Vfd'), ac: 'AC' });
  SG.proj.loads.forEach(l => { const P = +l.P; if (!P) return; const Ib = (+l.phases === 1 ? P * 1000 / ((+l.U || 230)) : I3(P, l.type === 'elec' ? 0.95 : 1)); R.circuits.push({ id: 'QF-' + l.id, n: SG.loadName(l), Ib, poles: +l.phases === 1 ? '1P+N' : '4P', curve: l.type === 'R' ? 'C' : l.type === 'EV' ? t('circ.evCurve') : l.Istart ? t('circ.inrush', { v: l.Istart }) : 'C', ac: 'AC' }); });
  R.circuits.push({ id: 'QF-AUX', n: t('circ.aux'), Ib: (SG.cfg.psuA * 24 / 0.9) / (U / Math.sqrt(3) * 0.95), poles: '1P+N', curve: t('circ.auxCurve'), ac: 'AC' });
  const STD = [2, 4, 6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250];
  R.circuits.forEach(c => { c.InMin = c.Ib ? STD.find(x => x >= c.Ib) || null : null; });
  R.io = SG.pio();
  return R;
};

/* ---------- danh sách tín hiệu của dự án: I/O vật lý tách khỏi dữ liệu Modbus ---------- */
SG.pio = function () {
  const P = SG.proj, c = SG.cfg, t = SG.t;
  const base = SG.signals(c).filter(s => !/^(KM_RL|QF_RL|QF_LP|QF_EV|RL_P|LP_P|EV_DATA)/.test(s.code));
  const add = [];
  P.loads.forEach(l => {
    const nm = SG.loadName(l);
    if (P.statusTrip === 'di') add.push({ code: 'QF_' + l.id + '_SD', io: 'DI', src: 'QF-' + l.id, dst: 'DI', type: t('sty.no'), func: t('psig.trip', { n: nm }), fail: '—', via: 'I/O' });
    const n = l.ctrl === 'steps' ? (+l.steps || 1) : l.ctrl === 'onoff' ? 1 : 0;
    for (let i = 1; i <= n; i++) {
      const sfx = n > 1 ? '_' + i : '', step = n > 1 ? ' ' + t('psig.step', { i }) : '';
      add.push({ code: 'KM_' + l.id + sfx + '_CMD', io: 'DO', src: 'DO', dst: 'KM-' + l.id + sfx, type: c.useKA ? t('psig.coil', { v: SG.volt(c.coilV === '230VAC' ? '230 VAC' : '24 VDC') }) : t('psig.direct'), func: t('psig.close', { n: nm }) + step, fail: t('psig.closeX'), via: 'I/O' });
      add.push({ code: 'KM_' + l.id + sfx + '_FB', io: 'DI', src: 'KM-' + l.id + sfx, dst: 'DI', type: t('psig.auxNO'), func: t('psig.fb', { n: nm }) + step, fail: t('psig.fbX'), via: 'I/O' });
    }
    if (l.ctrl === 'vary') add.push({ code: l.id + '_SET', io: 'AO', src: 'AIO', dst: l.id, type: t('psig.aoType'), func: t('psig.set', { n: nm }), fail: t('psig.setX'), via: 'I/O' });
    if (l.meas) add.push({ code: 'PM_' + l.id + '_P', io: 'COM', src: 'PM-' + l.id, dst: c.rtuVia === 'gw' ? 'GW' : 'COM', type: 'Modbus RTU', func: t('psig.p', { n: nm }), fail: t('psig.pX'), via: 'Modbus' });
    if (l.ctrl === 'ocpp') add.push({ code: l.id + '_OCPP', io: 'COM', src: 'EVSE-' + l.id, dst: 'EMS', type: 'OCPP', func: t('psig.ocpp', { n: nm }), fail: t('psig.ocppX'), via: 'OCPP' });
  });
  const all = base.map(s => Object.assign({ via: s.io === 'COM' ? (/OCPP/.test(s.type) ? 'OCPP' : /CAN/.test(s.type) ? 'CAN' : /LoRa/.test(s.type) ? 'MQTT' : 'Modbus') : 'I/O' }, s)).concat(add);
  if (P.motor && SG.pv('motor', 'start') === 'dol') { for (let i = all.length - 1; i >= 0; i--) if (/^VFD_/.test(all[i].code)) all.splice(i, 1); all.push({ code: 'KM_M1_CMD', io: 'DO', src: 'DO', dst: 'KM-M1', type: t('psig.coilShort'), func: t('psig.dol'), fail: t('psig.dolX'), via: 'I/O' }, { code: 'QM1_TRIP', io: 'DI', src: 'QM1', dst: 'DI', type: t('psig.qmAux'), func: t('psig.qm'), fail: '—', via: 'I/O' }); }
  const sp = 1 + (+P.spare || 0) / 100, cnt = x => all.filter(s => s.io === x).length;
  const o = { list: all, DI: cnt('DI'), DO: cnt('DO'), AI: cnt('AI'), AO: cnt('AO'), COM: cnt('COM') };
  o.need = { DI: Math.ceil(o.DI * sp), DO: Math.ceil(o.DO * sp), AI: Math.ceil(o.AI * sp), AO: Math.ceil(o.AO * sp) };
  o.modbusDevices = [...new Set(all.filter(s => s.via === 'Modbus').map(s => s.src))];
  return o;
};

/* ---------- vị trí cần chọn & yêu cầu kỹ thuật (tên: slot.<id>, tên Pháp/Anh: slot.<id>.alt) ---------- */
SG.SLOTS = [
  { id: 'pvinv', when: () => SG.proj.pv.status !== 'none' },
  { id: 'pcs', when: () => SG.proj.bat.status !== 'none' },
  { id: 'vfd', when: () => SG.pv('motor', 'start') === 'vfd' },
  { id: 'meter-pcc', when: () => true },
  { id: 'meter-branch', when: () => SG.proj.loads.some(l => l.meas) },
  { id: 'plc', when: () => true },
  { id: 'hmi', when: () => true },
  { id: 'switch', when: () => true },
  { id: 'psu', when: () => true },
  { id: 'prot', when: () => true, reqOnly: true }
];
SG.slotName = id => SG.t('slot.' + id);
SG.slotAlt = id => SG.t('slot.' + id + '.alt');

/* yêu cầu: { n, txt, keys, fn(p) → {st, d, partial} } — trả về null nếu sản phẩm thiếu thông số */
SG.reqs = function (slot, R) {
  R = R || SG.pcalc();
  const v = SG.pv, num = x => (x == null || x === '' || isNaN(+x)) ? null : +x, t = SG.t, F = SG.fx;
  const U = num(v('grid', 'U')) || 400, ph = num(v('grid', 'phases')) || 3;
  const L = [];
  const req = (k, txt, keys, fn) => L.push({ n: t('rq.' + k), txt, keys, fn });
  if (slot === 'pvinv') {
    const pv = R.pv;
    req('acPh', t('rq.phV', { ph, U }), ['phases', 'Vac'], p => cmp(SG.spec(p, 'phases') === ph && (!SG.spec(p, 'Vac') || Math.abs(SG.spec(p, 'Vac') - U) < 30), t('rq.invPh', { n: SG.spec(p, 'phases') })));
    req('pac', pv.Pdc ? t('rq.pacRange', { a: F(pv.Pdc / 1300), b: F(pv.Pdc / 900), r: '0,9–1,3' }) : t('rq.needPdc'), ['Pac'], p => pv.Pdc ? cmp(pv.Pdc / SG.spec(p, 'Pac') >= 0.9 && pv.Pdc / SG.spec(p, 'Pac') <= 1.3, 'DC/AC = ' + F(pv.Pdc / SG.spec(p, 'Pac'), 2)) : miss(t('rq.needPdc')));
    req('vdc', pv.VocCold ? '≥ ' + F(pv.VocCold, 0) + ' V' : t('rq.missVoc'), ['Vdcmax'], p => pv.VocCold ? cmp(SG.spec(p, 'Vdcmax') >= pv.VocCold, t('rq.vocCold', { a: F(pv.VocCold, 0), b: SG.spec(p, 'Vdcmax') })) : miss(t('rq.missPv')));
    req('mppt', pv.VmpHot && pv.VmpCold ? F(pv.VmpHot, 0) + '–' + F(pv.VmpCold, 0) + ' V' : t('rq.missVmp'), ['mpptMin', 'mpptMax'], p => pv.VmpHot && pv.VmpCold ? cmp(pv.VmpHot >= SG.spec(p, 'mpptMin') && pv.VmpCold <= SG.spec(p, 'mpptMax'), 'Vmp ' + F(pv.VmpHot, 0) + '–' + F(pv.VmpCold, 0) + ' V vs MPPT ' + SG.spec(p, 'mpptMin') + '–' + SG.spec(p, 'mpptMax') + ' V') : miss(t('rq.missVmp')));
    req('strings', t('rq.nStrings', { n: pv.Np || 1 }), ['nMppt', 'stringsPerMppt'], p => { const cap = SG.spec(p, 'nMppt') * (SG.spec(p, 'stringsPerMppt') || 1); return cmp(cap >= (pv.Np || 1), t('rq.nInputs', { n: cap })); });
    req('isc', pv.Isc ? t('rq.iscPer', { v: SG.num(pv.Isc) }) : t('rq.missIsc'), ['IscMaxMppt'], p => pv.Isc ? cmp(SG.spec(p, 'IscMaxMppt') >= pv.Isc, 'Isc max ' + SG.spec(p, 'IscMaxMppt') + ' A') : miss(t('rq.missIsc')));
    req('imp', pv.Imp ? 'Imp ' + SG.num(pv.Imp) + ' A' : t('rq.missImp'), ['ImaxMppt'], p => !pv.Imp ? miss(t('rq.missImp')) : SG.spec(p, 'ImaxMppt') >= pv.Imp ? { st: 'ok', d: 'Imax ' + SG.spec(p, 'ImaxMppt') + ' A ≥ Imp' } : { st: 'ok', partial: true, d: t('rq.impClip', { imp: SG.num(pv.Imp), max: SG.spec(p, 'ImaxMppt'), p: Math.round((1 - SG.spec(p, 'ImaxMppt') / pv.Imp) * 100) }) });
    req('pdcMax', pv.Pdc ? '≥ ' + pv.Pdc + ' Wc' : '—', ['PdcMax'], p => pv.Pdc ? cmp(SG.spec(p, 'PdcMax') >= pv.Pdc, SG.spec(p, 'PdcMax') + ' Wc') : miss(''));
    req('invComm', t('rq.invCommTxt'), ['comm'], p => { const cm = SG.spec(p, 'comm') || []; return cm.some(x => /Modbus TCP|SunSpec/i.test(x)) ? { st: 'ok', d: cm.join(', ') + ' — ' + t('rq.writeCheck'), partial: true } : { st: 'ko', d: t('rq.noModbusTcp') }; });
  } else if (slot === 'pcs') {
    const Vmin = num(v('bat', 'Vmin')), Vmax = num(v('bat', 'Vmax')), Ich = num(v('bat', 'Ich')), Idis = num(v('bat', 'Idis'));
    req('acPh', t('rq.phV', { ph, U }), ['phases'], p => cmp(SG.spec(p, 'phases') === ph, t('rq.nPh', { n: SG.spec(p, 'phases') })));
    req('vbat', Vmin && Vmax ? Vmin + '–' + Vmax + ' V' : t('rq.missVbat'), ['VbatMin', 'VbatMax'], p => Vmin && Vmax ? cmp(Vmin >= SG.spec(p, 'VbatMin') && Vmax <= SG.spec(p, 'VbatMax'), t('rq.convRange', { a: SG.spec(p, 'VbatMin'), b: SG.spec(p, 'VbatMax') })) : miss(t('rq.missVbat')));
    req('ibat', Ich ? t('rq.batI', { c: Ich, d: Idis }) : t('rq.missing'), ['IchMax', 'IdisMax'], p => Ich ? { st: 'ok', d: t('rq.convI', { c: SG.spec(p, 'IchMax'), d: SG.spec(p, 'IdisMax') }) } : miss(''));
    req('gf', SG.cfg.island ? t('rq.mandatory') : t('rq.notMandatory'), ['gridForming'], p => SG.cfg.island ? cmp(SG.spec(p, 'gridForming') === true, t(SG.spec(p, 'gridForming') ? 'w.yes' : 'w.no')) : { st: 'ok', d: t('rq.notRequired') });
    req('bmsList', t('rq.bmsTxt', { p: v('bat', 'proto') || '?' }), ['bmsProtocols'], () => ({ st: 'miss', d: t('rq.bmsNeed', { m: v('bat', 'model') || t('rq.noBatModel') }) }));
  } else if (slot === 'vfd') {
    const m = R.motor;
    req('vPh', (m.U || '?') + ' V, ' + t('rq.nPh', { n: m.ph || '?' }), ['Umin', 'Umax', 'phasesIn'], p => m.U ? cmp(m.U >= SG.spec(p, 'Umin') && m.U <= SG.spec(p, 'Umax') && (SG.spec(p, 'phasesIn') === ph), SG.spec(p, 'Umin') + '–' + SG.spec(p, 'Umax') + ' V, ' + t('rq.nPhIn', { n: SG.spec(p, 'phasesIn') })) : miss(t('rq.missUm')));
    req('iout', m.In ? '≥ ' + SG.num(m.In) + ' A (' + t(m.duty === 'heavy' ? 'pf.motor.duty.heavy' : 'pf.motor.duty.normal') + ')' : t('rq.missIn'), ['InHD', 'InND'], p => { const I = m.duty === 'heavy' ? SG.spec(p, 'InHD') : (SG.spec(p, 'InND') || SG.spec(p, 'InHD')); return m.In ? (I == null ? null : cmp(I >= m.In, SG.num(I) + ' A ≥ ' + SG.num(m.In) + ' A?')) : miss(t('rq.missIn')); });
    req('ov', m.ov ? t('rq.ovTxt', { v: m.ov }) : '—', ['ovHD'], p => m.ov ? (SG.spec(p, 'ovHD') == null ? null : cmp(SG.spec(p, 'ovHD') >= m.ov, SG.spec(p, 'ovHD') + ' %')) : { st: 'ok', d: '—' });
    req('dilogic', t('rq.perPlc'), ['diLogic'], p => { const pl = SG.chosen('plc'); const a = SG.spec(p, 'diLogic') || [], b = pl ? SG.spec(pl, 'doType') : null; return !b || !a.length ? miss(t('rq.missLogic')) : cmp(a.some(x => b.includes(x)), t('rq.logicTxt', { a: a.join('/'), b })); });
  } else if (slot === 'meter-pcc' || slot === 'meter-branch') {
    const Ib = slot === 'meter-pcc' ? R.Ipcc : Math.max(...R.circuits.filter(c => /^QF-L/.test(c.id)).map(c => c.Ib || 0));
    req('net', ph === 3 ? '3P4W ' + U + ' V' : '1P2W', ['Umax'], p => cmp(SG.spec(p, 'Umax') >= U, t('rq.upTo', { v: SG.spec(p, 'Umax') })));
    req('iin', Ib ? t(Ib > 63 ? 'rq.viaCt' : 'rq.direct', { v: F(Ib, 0) }) : '—', ['Iin'], p => { const x = SG.spec(p, 'Iin'); if (!x) return null; if (/direct/.test(x)) return cmp(Ib <= SG.spec(p, 'Idirect'), t('rq.directMax', { v: SG.spec(p, 'Idirect') })); return { st: 'ok', d: t('rq.viaCtOk', { v: x }) }; });
    req('mComm', slot === 'meter-pcc' ? (SG.cfg.pccComm === 'tcp' ? 'Modbus TCP (server)' : 'Modbus RTU') : t('rq.rtuBus'), ['comm'], p => { const cm = SG.spec(p, 'comm') || []; const want = slot === 'meter-pcc' && SG.cfg.pccComm === 'tcp' ? /Modbus TCP/i : /Modbus RTU/i; return cmp(cm.some(x => want.test(x)), cm.join(', ')); });
    req('acc', t('rq.accTxt'), ['acc'], p => ({ st: 'ok', d: SG.spec(p, 'acc') }));
  } else if (slot === 'plc') {
    const io = R.io;
    req('di', t('rq.chSpare', { n: io.need.DI, s: SG.proj.spare }), ['diBase', 'expModules'], p => SG.spec(p, 'diBase') >= io.need.DI ? { st: 'ok', d: t('rq.diBuilt', { n: SG.spec(p, 'diBase') }) } : SG.spec(p, 'expModules') ? { st: 'ok', partial: true, d: t('rq.diExp', { n: SG.spec(p, 'diBase'), m: io.need.DI - SG.spec(p, 'diBase'), x: SG.spec(p, 'expModules') }) } : { st: 'ko', d: t('rq.diOnly', { n: SG.spec(p, 'diBase') }) });
    req('do', t('rq.ch', { n: io.need.DO }), ['doBase'], p => ({ st: 'ok', d: t('rq.doBuilt', { n: SG.spec(p, 'doBase'), t: SG.spec(p, 'doType') }), partial: true }));
    req('analog', io.need.AI + ' AI, ' + io.need.AO + ' AO', ['aiBase'], p => ({ st: 'ok', d: t('rq.aiBuilt', { n: SG.spec(p, 'aiBase') || 0 }), partial: true }));
    req('tcp', t('rq.readEth', { n: SG.calc(SG.cfg).eth.list.filter(x => !['CPU', 'HMI', 'EMS'].includes(x)).length }), ['comm'], p => cmp((SG.spec(p, 'comm') || []).some(x => /Modbus TCP/i.test(x)), (SG.spec(p, 'comm') || []).join(', ')));
    req('rtu', io.modbusDevices.length ? t('rq.rtuNeed') : t('rq.notNeeded'), ['serial'], p => ({ st: 'ok', d: SG.spec(p, 'serial') || t('rq.noSerial'), partial: true }));
  } else if (slot === 'psu') {
    const I = SG.calc(SG.cfg).aux.I;
    req('iout24', t('rq.psuTxt', { a: F(I / 0.8), b: F(I) }), ['Iout'], p => cmp(SG.spec(p, 'Iout') >= I / 0.8, SG.spec(p, 'Iout') + ' A'));
    req('dcok', t('rq.dcokTxt'), ['dcok'], p => cmp(!!SG.spec(p, 'dcok'), t(SG.spec(p, 'dcok') ? 'w.yes' : 'w.no')));
  } else if (slot === 'switch') {
    const e = SG.calc(SG.cfg).eth;
    req('ports', t('rq.portsTxt', { n: e.n + 2 }), ['ports'], p => cmp(SG.spec(p, 'ports') >= e.n + 2, t('rq.nPorts', { n: SG.spec(p, 'ports') })));
    req('vin', SG.volt('24 VDC'), ['Vin'], p => cmp(/24/.test(String(SG.spec(p, 'Vin'))), SG.spec(p, 'Vin')));
  } else if (slot === 'hmi') {
    req('driver', t('rq.driverTxt'), ['drivers'], p => { const pl = SG.chosen('plc'); const d = SG.spec(p, 'drivers') || []; return !pl ? miss(t('rq.noPlc')) : cmp(d.some(x => (SG.spec(pl, 'comm') || []).some(y => y.includes(x)) || x === pl.brand), 'Driver: ' + d.join(', ') + ' — PLC ' + pl.brand + ' ' + pl.model); });
    req('ethDc', t('w.yes'), ['comm'], p => ({ st: 'ok', d: (SG.spec(p, 'comm') || []).join(', ') }));
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
    if (!r) { st = 'miss'; r = { d: SG.t('rq.catMissing', { k: missingKeys.join(', ') }) }; }
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
  const cands = ps.map(p => { const e = SG.evalProduct(slot, p, R); if (p.discontinued) { e.st = 'ko'; e.rows.unshift({ n: SG.t('rq.commercial'), need: SG.t('rq.onSale'), st: 'ko', d: p.discontinued }); } return Object.assign({ p }, e); }).sort((a, b) => rank[a.st] - rank[b.st]);
  const out = { cands: cands.filter(x => x.st !== 'ko').slice(0, 3), rejected: cands.filter(x => x.st === 'ko'), reqs: SG.reqs(slot, R) };
  (SG._sugCache = SG._sugCache || {})[slot] = out;
  return out;
};
SG.pcalcRaw = function () { const save = SG.chosen; SG.chosen = () => null; try { return SG.pcalc(); } finally { SG.chosen = save; } };
SG.refresh = function () { SG._sugCache = {}; SG._R = SG.pcalcRaw(); SG._sugCache = {}; SG.syncProj(); SG._R = SG.pcalc(); SG._sugCache = {}; };

/* ---------- kiểm tra theo cặp ---------- */
SG.pairs = function () {
  const R = SG._R || SG.pcalc(), out = [], v = SG.pv, t = SG.t;
  const row = (k, st, d, vars) => ({ n: t('pr.' + k, vars), st, d: d || '' });
  const rowN = (n, st, d) => ({ n, st, d: d || '' });
  const RANK = { verified: 0, prelim: 1, miss: 2, ko: 3 };
  const worst = rows => rows.reduce((w, r) => RANK[r.st] > RANK[w] ? r.st : w, 'verified');
  const srcTxt = (sec, keys) => keys.map(k => { const s = SG.psrc(sec, k); return k + ': ' + SG.srcName(s.s) + (s.ref ? ' (' + s.ref + ')' : ''); }).join('; ');
  const noModel = t('pr.noModel');
  const fromEval = (slot, a, b, extra) => { const p = SG.chosen(slot); if (!p) return { a, b, slot, st: 'miss', rows: [row('notChosen', 'miss', t('pr.notChosenD'))] }; const e = SG.evalProduct(slot, p, R); const rows = e.rows.map(r => rowN(r.n, r.st, r.d)).concat(extra ? extra(p) : []); return { a, b: b + ': ' + p.brand + ' ' + p.model, slot, st: worst(rows), rows }; };
  if (SG.SLOTS[0].when()) out.push(Object.assign(fromEval('pvinv', 'PV ' + (v('pv', 'model') || noModel), SG.slotName('pvinv')), { src: srcTxt('pv', ['Voc', 'Vmp', 'Isc', 'Imp', 'bVoc']) }));
  if (SG.SLOTS[1].when()) out.push(Object.assign(fromEval('pcs', t('pr.battery') + ' ' + (v('bat', 'model') || noModel), t('pr.converter'), () => { const ev = v('bat', 'compat'); return [row('batEvidence', ev ? (SG.psrc('bat', 'compat').s === 'doc' ? 'verified' : 'prelim') : 'miss', ev ? ev : t('pr.batEvidenceMiss'))]; }), { src: srcTxt('bat', ['Vmin', 'Vmax', 'Ich', 'Idis', 'proto']) }));
  if (SG.pv('motor', 'start') === 'vfd') out.push(Object.assign(fromEval('vfd', t('pr.motor') + ' ' + (v('motor', 'P') != null ? SG.num(v('motor', 'P')) : '?') + ' kW', SG.slotName('vfd')), { src: srcTxt('motor', ['U', 'phases', 'In', 'duty']) }));
  else if (SG.pv('motor', 'P')) out.push({ a: t('pr.motor'), b: t(SG.pv('motor', 'start') === 'dol' ? 'pr.startDol' : 'pr.startSoft'), st: 'miss', rows: [row('motorStarter', 'miss', t('pr.motorStarterD', { v: R.motor.In != null ? SG.num(R.motor.In) : '?' }))] });
  // PLC ↔ thiết bị (I/O vật lý)
  const plc = SG.chosen('plc');
  const io = R.io;
  const plcRows = [];
  if (!plc) plcRows.push(row('noPlc', 'miss'));
  else {
    const dt = SG.spec(plc, 'doType') || '', dil = SG.spec(plc, 'diType') || '';
    plcRows.push(row('diDry', dil ? 'verified' : 'miss', t('pr.diDryD', { v: dil || '?' })));
    const coilAC = SG.cfg.coilV === '230VAC';
    plcRows.push(row('doCoil', /transistor/i.test(dt) && coilAC && !SG.cfg.useKA ? 'ko' : 'verified', /transistor/i.test(dt) ? t(coilAC ? (SG.cfg.useKA ? 'pr.doCoilKA' : 'pr.doCoilKo') : 'pr.doCoilDc') : t('pr.doRelay')));
    const vfd = SG.chosen('vfd');
    if (vfd) { const a = SG.spec(vfd, 'diLogic') || [], b = SG.spec(plc, 'doType') || ''; plcRows.push(row('doVfd', a.length && b ? (a.some(x => b.includes(x)) ? 'verified' : 'ko') : 'miss', t('pr.doVfdD', { a: a.join('/') || '?', b: b || '?' }))); }
    if (io.AI) { const ai = SG.spec(plc, 'aiType') || ''; plcRows.push(row('ai', ai && /4.?20/.test(ai) ? 'prelim' : 'miss', t('pr.aiD', { v: ai || '?' }), { n: io.AI })); }
    if (io.AO) plcRows.push(row('ao', SG.spec(plc, 'aoBase') ? 'prelim' : 'miss', t('pr.aoD', { v: SG.spec(plc, 'aoBase') || 0 }), { n: io.AO }));
  }
  out.push({ a: 'PLC' + (plc ? ' ' + plc.model : ''), b: t('pr.wired'), st: worst(plcRows), rows: plcRows });
  // PLC ↔ đồng hồ / onduleur (truyền thông)
  [['meter-pcc', 'read'], ['pvinv', 'write'], ['pcs', 'write'], ['vfd', 'read']].forEach(([slot, rw]) => {
    const S = SG.SLOTS.find(s => s.id === slot); if (!S.when()) return;
    const n = SG.slotName(slot), d = SG.chosen(slot), rows = [];
    if (!plc || !d) rows.push(row('notBoth', 'miss'));
    else {
      const a = SG.spec(plc, 'comm') || [], b = SG.spec(d, 'comm') || [];
      const common = ['Modbus TCP', 'Modbus RTU'].filter(x => a.some(y => y.includes(x)) && b.some(y => y.includes(x)));
      rows.push(row('proto', common.length ? 'verified' : (b.length ? 'ko' : 'miss'), common.length ? common.join(', ') + ' — PLC client, ' + n + ' server' : 'PLC: ' + a.join(', ') + ' / ' + t('pr.device') + ': ' + b.join(', ')));
      rows.push(row('regmap', d.regmap ? 'verified' : 'miss', d.regmap ? t('pr.doc') + ' ' + d.regmap.t : t('pr.regmapMiss')));
      rows.push(row(rw === 'write' ? 'write' : 'read', rw === 'write' ? (d.writeDoc ? 'verified' : 'miss') : (d.regmap ? 'verified' : 'miss'), t(rw === 'write' ? 'pr.writeD' : 'pr.readD')));
      if (!common.length && b.some(x => /RTU/.test(x)) && a.some(x => /TCP/.test(x))) rows.push(row('fix', 'miss', t('pr.fixGw')));
    }
    out.push({ a: 'PLC', b: n + (d ? ' ' + d.model : ''), st: worst(rows), rows });
  });
  // PLC ↔ HMI
  const hmi = SG.chosen('hmi'); const hr = [];
  if (!plc || !hmi) hr.push(row('notBoth', 'miss'));
  else { const e = SG.evalProduct('hmi', hmi, R); e.rows.forEach(r => hr.push(rowN(r.n, r.st, r.d))); hr.push(row('hmiVer', 'miss', t('pr.hmiVerD'))); }
  out.push({ a: 'PLC', b: 'HMI' + (hmi ? ' ' + hmi.model : ''), st: worst(hr), rows: hr });
  // Bảo vệ ↔ mạch
  R.circuits.forEach(c => {
    const rows = [row('acdc', 'prelim', c.ac + ' ' + (SG.pv('grid', 'U') || 400) + ' V, ' + c.poles)];
    rows.push(row('inIb', c.Ib ? 'prelim' : 'miss', c.Ib ? t('pr.inIbD', { ib: SG.fx(c.Ib), in: c.InMin }) + (c.mfr ? '; ' + t('pr.mfrMax', { v: c.mfr }) : '') : t('pr.missP')));
    rows.push(row('icu', SG.pv('grid', 'Icc') ? 'prelim' : 'miss', SG.pv('grid', 'Icc') ? t('pr.icuD', { v: SG.pv('grid', 'Icc') }) : t('pr.icuMiss')));
    rows.push(row('curve', 'prelim', c.curve));
    rows.push(row('cable', 'miss', t('pr.cableD')));
    out.push({ a: c.id, b: c.n, st: worst(rows), rows, prot: true });
  });
  return out;
};

/* ---------- phần mềm & giấy phép ---------- */
SG.software = function () {
  const L = [];
  SG.SLOTS.forEach(s => { if (!s.when() || s.reqOnly) return; const p = SG.chosen(s.id); if (p && p.software) p.software.forEach(x => L.push(Object.assign({ dev: p.brand + ' ' + p.model, slot: SG.slotName(s.id) }, x))); else if (!p) L.push({ dev: '—', slot: SG.slotName(s.id), n: SG.t('sw.perDevice'), role: '—', lang: '—', lic: SG.t('sw.tbd'), url: '' }); });
  return L;
};

/* ---------- danh sách thông số còn thiếu cần hỏi nhà cung cấp ---------- */
SG.missingList = function () {
  const L = [], t = SG.t;
  ['grid', 'pv', 'bat', 'motor'].forEach(sec => { const P = SG.proj[sec]; if (P.status === 'none') return; SG.PFIELDS[sec].f.forEach(([k]) => { const x = P[k], n = SG.fieldName(sec, k); if (!x || x.v === '' || x.v == null) L.push({ who: sec === 'grid' ? t('ms.dso') : t('ms.supplier', { s: SG.secName(sec) }), what: n, why: t('ms.empty') }); else if (x.s === 'assume') L.push({ who: sec === 'grid' ? t('ms.owner') : t('ms.supplier', { s: SG.secName(sec) }), what: t('ms.assumed', { n, v: x.v }), why: t('ms.needDoc') }); }); });
  SG.pairs().forEach(p => p.rows.filter(r => r.st === 'miss').forEach(r => L.push({ who: p.prot ? t('ms.protDesign') : t('ms.supplier', { s: p.b }), what: r.n + (r.d ? ' — ' + r.d : ''), why: p.a + ' ↔ ' + p.b })));
  return L;
};

/* ---------- xuất ---------- */
SG.csv = rows => rows.map(r => r.map(x => '"' + String(x == null ? '' : x).replace(/<[^>]+>/g, '').replace(/"/g, '""') + '"').join(';')).join('\r\n');
SG.download = function (name, text, msgEl) {
  try {
    const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    if (msgEl) msgEl.textContent = SG.t('exp.made', { n: name });
  } catch (e) { if (msgEl) msgEl.textContent = SG.t('exp.fail'); }
};
SG.exports = function () {
  const R = SG._R || SG.pcalc(), today = new Date().toISOString().slice(0, 10), t = SG.t, H = k => t('exh.' + k);
  const bom = [['pos', 'brand', 'model', 'qty', 'role', 'main', 'ds', 'date', 'status'].map(H)];
  SG.SLOTS.forEach(s => { if (!s.when()) return; if (s.reqOnly) { R.circuits.forEach(c => bom.push([c.id, '', '', 1, t('exp.protOf', { n: c.n }), 'In ≥ ' + (c.InMin || '?') + ' A, ' + c.poles + ', ' + c.curve, '', '', t('exp.reqNoProd')])); return; }
    const p = SG.chosen(s.id); const q = s.id === 'meter-branch' ? SG.proj.loads.filter(l => l.meas).length : 1;
    if (!p) bom.push([SG.slotName(s.id), '', '', q, SG.slotName(s.id), SG.reqs(s.id, R).map(x => x.n + ': ' + x.txt).join(' | '), '', '', t('exp.reqNoVerified')]);
    else { const e = SG.evalProduct(s.id, p, R); bom.push([SG.slotName(s.id), p.brand, p.model, q, p.role || SG.slotName(s.id), Object.entries(p.specs).slice(0, 6).map(([k, x]) => k + '=' + (Array.isArray(x) ? x.join('/') : (x && x.v != null ? (Array.isArray(x.v) ? x.v.join('/') : x.v) : x))).join(', '), p.docs && p.docs[0] ? p.docs[0].url : '', p.docs && p.docs[0] ? p.docs[0].date : '', SG.st4n(e.st)]); } });
  const io = R.io;
  bom.push([t('exp.ioMod'), '', '', '', t('exp.perPlc'), t('exp.ioNeed', { di: io.need.DI, do: io.need.DO, ai: io.need.AI, ao: io.need.AO, s: SG.proj.spare }), '', '', t('exp.req')]);
  const comp = [['a', 'b', 'pairSt', 'item', 'itemSt', 'detail', 'src'].map(H)];
  SG.pairs().forEach(p => p.rows.forEach(r => comp.push([p.a, p.b, SG.st4n(p.st), r.n, SG.st4n(r.st), r.d, p.src || ''])));
  const ios = [['code', 'via', 'type', 'from', 'to', 'sig', 'func', 'fail'].map(H)];
  io.list.forEach(s => ios.push([s.code, s.via, s.io, s.src, s.dst, s.type, s.func, s.fail]));
  const sw = [['dev', 'pos', 'sw', 'role', 'lang', 'lic', 'src'].map(H)];
  SG.software().forEach(x => sw.push([x.dev, x.slot, x.n, x.role, x.lang, x.lic, x.url]));
  const ms = [['who', 'what', 'why'].map(H)];
  SG.missingList().forEach(x => ms.push([x.who, x.what, x.why]));
  const f = k => t('exf.' + k) + '_' + today + '.csv';
  return { bom: [f('bom'), bom], comp: [f('comp'), comp], io: [f('io'), ios], sw: [f('sw'), sw], miss: [f('miss'), ms] };
};
