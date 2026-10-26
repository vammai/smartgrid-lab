/* TÍNH TOÁN SƠ BỘ, KIỂM TRA TƯƠNG THÍCH, CÂN BẰNG CÔNG SUẤT, MÔ PHỎNG ĐỘNG.
   Quy ước dấu (dùng thống nhất toàn site):
   P_GRID > 0 nhập từ lưới, < 0 phát lên lưới. P_BAT > 0 pin xả, < 0 pin sạc. P_PV, P_GEN ≥ 0. Tải ≥ 0.
   Cân bằng: P_GRID + P_PV + P_BAT + P_GEN = P_TẢI (bỏ qua tổn hao). */
SG.defaultCfg = {
  U: 400, phases: 3, f: 50, Sgrid: 36, Icc: null, qf0Icu: null, importLimit: 12, exportAllowed: true, exportLimit: 3,
  Ppv: 6, Pinv: 5, pvNs: 14, pvVoc: 41.5, pvBeta: -0.28, pvTmin: -10, invVdcMax: 1000, invMpptMin: 200, invMpptMax: 800, invRegMap: false,
  Ebat: 10, batV: 200, batImax: 25, Pcs: 5, pcsGF: true, pcsResync: false, socMin: 20, socMax: 90, bmsCompat: false,
  gen: true, Sgen: 10, genSync: false, genParallel: false,
  Pm: 2.2, rlSteps: 3, rlStep: 2, Plp: 1.5, ev: true, Pev: 7.4,
  island: true, ups: true, pyr: true, lora: false, cabtemp: true,
  pccComm: 'tcp', rtuVia: 'module',
  doType: 'transistor', useKA: true, coilV: '230VAC',
  remoteBreaker: true, remoteBreakerClose: true, breakerMotor: false,
  ctOut: '5A', meterIn: '5A', pyrOut: '4-20', aiPyrCh: '4-20', vfdDiLogic: 'PNP',
  psuA: 10, spare: 20
};

SG.calc = function (c) {
  const sq3 = Math.sqrt(3), Uph = c.U / sq3;
  const I3 = (kw, cos = 1) => kw * 1000 / (sq3 * c.U * cos);
  const I1 = (kw, cos = 1) => kw * 1000 / (Uph * cos);
  const Iload = (kw, cos = 1) => c.phases === 3 ? I3(kw, cos) : I1(kw, cos);
  const PmEl = c.Pm / 0.85;
  const r = { formulas: [] };
  r.Ib = {
    PCC: c.phases === 3 ? c.Sgrid * 1000 / (sq3 * c.U) : c.Sgrid * 1000 / Uph,
    PV: Iload(c.Pinv), BAT: Iload(c.Pcs), M1: Iload(PmEl, 0.82),
    RL: Iload(c.rlSteps * c.rlStep), RLstep: Iload(c.rlStep), LP: Iload(c.Plp, 0.95),
    EV: I1(c.Pev), GEN: c.phases === 3 ? c.Sgen * 1000 / (sq3 * c.U) : c.Sgen * 1000 / Uph,
    AUX: (c.psuA * 24 / 0.9) / (Uph * 0.95)
  };
  const loads3 = c.Plp + PmEl + c.rlSteps * c.rlStep;
  r.loadMax = loads3 + (c.ev ? c.Pev : 0);
  r.Ib.busMax = Iload(loads3) + (c.ev ? r.Ib.EV : 0);
  r.Ib.worstPhase = r.Ib.busMax;
  r.prioIsland = c.Plp + PmEl;
  // PV string
  const VocS = c.pvNs * c.pvVoc;
  r.pv = { VocStc: VocS, VocMax: VocS * (1 + c.pvBeta / 100 * (c.pvTmin - 25)), VmpStc: VocS * 0.82, VmpHot: VocS * 0.82 * (1 + c.pvBeta / 100 * (70 - 25)), VmpCold: VocS * 0.82 * (1 + c.pvBeta / 100 * (c.pvTmin - 25)), ratio: c.Ppv / c.Pinv };
  // I/O
  const sig = SG.signals(c);
  const cnt = t => sig.filter(s => s.io === t).length;
  const sp = 1 + c.spare / 100;
  r.io = { DI: cnt('DI'), DO: cnt('DO'), AI: cnt('AI'), AO: cnt('AO'), COM: cnt('COM'), sig };
  r.io.mDI = Math.max(1, Math.ceil(r.io.DI * sp / 16));
  r.io.mDO = Math.max(1, Math.ceil(r.io.DO * sp / 16));
  r.io.KA = c.useKA ? sig.filter(s => s.io === 'DO' && /^(KM_|GEN_START|QF0_MX)/.test(s.code)).length : 0;
  r.io.mAI = Math.max(1, Math.ceil(Math.max(r.io.AI * sp / 4, r.io.AO * sp / 2)));
  r.io.modulesTxt = r.io.mDI + ' DI×16, ' + r.io.mDO + ' DO×16, ' + r.io.mAI + ' AI4/AO2' + (c.rtuVia === 'module' ? ', 1 RS485' : '');
  // 24 V
  r.aux = { list: SG.auxLoads(c, r.io) };
  r.aux.I = r.aux.list.reduce((a, b) => a + b[1], 0);
  // Ethernet
  const eth = ['CPU', 'HMI', 'EMS', 'PV-INV', 'PCS', 'VFD-M1'];
  if (c.pccComm === 'tcp') eth.push('PM-PCC');
  if (c.ev) eth.push('EVSE');
  if (c.rtuVia === 'gw') eth.push('GW');
  if (c.lora) eth.push('LORA-GW');
  r.eth = { list: eth, n: eth.length };
  r.eth.ports = [5, 8, 16, 24].find(p => p >= eth.length + 2) || 24;
  r.rs485 = SG.rs485Chain(c);
  return r;
};

/* ---------- KIỂM TRA TƯƠNG THÍCH: status ok | ko | unk (chuỗi: khóa ck.* trong i18n/<lang>/logic.js) ---------- */
SG.checks = function (c, r) {
  const L = [], f1 = n => SG.fx(n, 1), f0 = n => SG.fx(n, 0), t = SG.t;
  const add = (id, o) => L.push(Object.assign({ id, title: t('ck.' + id + '.t') }, o, { cat: t('ckcat.' + o.cat) }));
  const N = (...ks) => ks.map(k => t('need.' + k));
  // PV
  add('voc', { cat: 'pv', devs: ['PV-ARR', 'PV-INV'], status: r.pv.VocMax <= c.invVdcMax ? 'ok' : 'ko',
    reason: t('ck.voc.r', { ns: c.pvNs, voc: SG.num(c.pvVoc), b: SG.num(c.pvBeta), tmin: c.pvTmin, vmax: f0(r.pv.VocMax), lim: c.invVdcMax }) + (r.pv.VocMax > c.invVdcMax ? ' ' + t('ck.voc.over') : ''), need: [] });
  const inM = r.pv.VmpHot >= c.invMpptMin && r.pv.VmpCold <= c.invMpptMax;
  add('mppt', { cat: 'pv', devs: ['PV-ARR', 'PV-INV'], status: inM ? 'unk' : 'ko',
    reason: t('ck.mppt.r', { hot: f0(r.pv.VmpHot), cold: f0(r.pv.VmpCold), a: c.invMpptMin, b: c.invMpptMax, k: SG.num(0.82) }) + ' ' + t(inM ? 'ck.mppt.ok' : 'ck.mppt.ko'),
    need: inM ? N('vmpDs', 'imaxMppt') : [] });
  // Pin
  const pBat = c.batV * c.batImax / 1000;
  add('batI', { cat: 'bat', devs: ['BAT', 'PCS'], status: pBat >= c.Pcs ? 'ok' : 'ko', reason: t('ck.batI.r', { v: c.batV, i: c.batImax, p: f1(pBat), pcs: c.Pcs }) + (pBat < c.Pcs ? ' ' + t('ck.batI.lim', { p: f1(pBat) }) : ''), need: [] });
  add('bms', { cat: 'bat', devs: ['BMS', 'PCS'], status: c.bmsCompat ? 'ok' : 'unk', reason: t(c.bmsCompat ? 'ck.bms.ok' : 'ck.bms.unk'), need: c.bmsCompat ? [] : N('bmsList', 'bmsFw', 'canPinout') });
  // Đảo
  if (c.island) {
    add('gf', { cat: 'island', devs: ['PCS'], status: c.pcsGF ? 'unk' : 'ko', reason: t(c.pcsGF ? 'ck.gf.unk' : 'ck.gf.ko'), need: c.pcsGF ? N('pcsIsland', 'acCoupling') : [] });
    add('ups', { cat: 'island', devs: ['UPS', 'RLY-DEC', 'CPU'], status: c.ups ? 'ok' : 'ko', reason: t(c.ups ? 'ck.ups.ok' : 'ck.ups.ko'), need: [] });
    add('prio', { cat: 'island', devs: ['PCS', 'LP', 'M1'], status: r.prioIsland <= c.Pcs ? 'ok' : 'ko',
      reason: t('ck.prio.r', { lp: f1(c.Plp), m: f1(c.Pm / 0.85), s: f1(r.prioIsland), pcs: c.Pcs }) + (r.prioIsland > c.Pcs ? ' ' + t('ck.prio.ko') : ''), need: [] });
    add('earth', { cat: 'island', devs: ['KM-PCC', 'PCS'], status: 'unk', reason: t('ck.earth.r'), need: N('earthing', 'pcsIsc', 'pcsNPE', 'rules') });
  }
  // Máy phát
  if (c.gen) {
    const pG = c.Sgen * 0.8;
    add('genP', { cat: 'gen', devs: ['GEN'], status: pG >= r.prioIsland ? 'ok' : 'ko', reason: t('ck.genP.r', { s: c.Sgen, k: SG.num(0.8), p: f1(pG), need: f1(r.prioIsland) }), need: [] });
    add('genPv', { cat: 'gen', devs: ['GEN', 'PV-INV'], status: c.invRegMap ? 'ok' : 'unk', reason: t(c.invRegMap ? 'ck.genPv.ok' : 'ck.genPv.unk'), need: c.invRegMap ? [] : N('regPlim') });
    add('genTr', { cat: 'gen', devs: ['GEN-CTRL', 'PCS'], status: c.genSync ? 'unk' : 'ok', reason: t(c.genSync ? 'ck.genTr.unk' : 'ck.genTr.ok'), need: c.genSync ? N('gcuSync', 'pcsGenIn') : [] });
  }
  if (c.genParallel) add('par', { cat: 'gen', devs: ['GEN', 'KM-PCC', 'KM-GEN'], status: 'ko', reason: t('ck.par.r'), need: [] });
  // Đo lường & truyền thông
  add('ct', { cat: 'meas', devs: ['CT-PCC', 'PM-PCC'], status: c.ctOut === c.meterIn ? 'ok' : 'ko', reason: t('ck.ct.r', { ct: c.ctOut, m: c.meterIn }) + (c.ctOut !== c.meterIn ? ' ' + t('ck.ct.ko') : ''), need: [] });
  const slaves = SG.rs485Slaves(c);
  add('rtu', { cat: 'comm', devs: ['CPU', 'COM', 'GW'].concat(slaves), status: c.rtuVia === 'none' ? 'ko' : 'ok',
    reason: c.rtuVia === 'none' ? t('ck.rtu.ko', { s: slaves.join(', ') }) : t('ck.rtu.ok', { m: t(c.rtuVia === 'gw' ? 'ck.rtu.gw' : 'ck.rtu.mod'), s: slaves.join(', ') }),
    need: [], fix: c.rtuVia === 'none' ? t('ck.rtu.fix') : '' });
  add('reg', { cat: 'comm', devs: ['PV-INV', 'CPU'], status: c.invRegMap ? 'ok' : 'unk', reason: t(c.invRegMap ? 'ck.reg.ok' : 'ck.reg.unk'), need: c.invRegMap ? [] : N('regMap', 'regPlimFb', 'tcpConn') });
  if (c.pyr) add('pyr', { cat: 'meas', devs: ['PYR', 'AIO'], status: c.pyrOut === c.aiPyrCh ? 'ok' : 'ko', reason: t('ck.pyr.r', { s: c.pyrOut, a: c.aiPyrCh }), need: [] });
  // Điều khiển
  const coilAC = c.coilV === '230VAC';
  let st = 'ok', rs;
  if (!c.useKA && c.doType === 'transistor' && coilAC) { st = 'ko'; rs = t('ck.coil.ko'); }
  else if (!c.useKA && c.doType === 'relay' && coilAC) { st = 'unk'; rs = t('ck.coil.unk'); }
  else if (c.useKA) rs = t('ck.coil.ka', { v: SG.volt(coilAC ? '230 VAC' : '24 VDC') });
  else rs = t('ck.coil.dc');
  add('coil', { cat: 'ctrl', devs: ['DO', 'KA', 'KM-RL', 'KM-PCC'], status: st, reason: rs, need: st === 'unk' ? N('coilVA', 'doRelay') : [] });
  add('pnp', { cat: 'ctrl', devs: ['DO', 'VFD-M1'], status: c.vfdDiLogic === 'PNP' ? 'ok' : 'ko', reason: t('ck.pnp.r', { l: c.vfdDiLogic }) + (c.vfdDiLogic !== 'PNP' ? ' ' + t('ck.pnp.ko') : ''), need: [] });
  if (c.remoteBreaker) {
    const bad = c.remoteBreakerClose && !c.breakerMotor;
    add('qf0', { cat: 'ctrl', devs: ['QF0', 'KA', 'CPU'], status: bad ? 'ko' : 'ok', reason: bad ? t('ck.qf0.ko') : t('ck.qf0.ok') + (c.breakerMotor ? ' ' + t('ck.qf0.motor') : ''), need: [], fix: bad ? t('ck.qf0.fix') : '' });
  }
  // Bảo vệ & lắp đặt — không bao giờ kết luận tự động
  const miss = [!c.Icc ? t('ck.icu.iccMiss') : null, !c.qf0Icu ? t('ck.icu.icuMiss') : null].filter(Boolean);
  add('icu', { cat: 'prot', devs: ['QF0', 'GRID'], status: c.Icc && c.qf0Icu ? (c.qf0Icu >= c.Icc ? 'ok' : 'ko') : 'unk',
    reason: c.Icc && c.qf0Icu ? t('ck.icu.r', { icu: c.qf0Icu, icc: c.Icc }) : t('ck.icu.miss', { x: miss.join(t('w.and')) }),
    need: c.Icc && c.qf0Icu ? N('selTable') : N('iccDso', 'icuDs') });
  add('cable', { cat: 'prot', devs: ['QF0', 'QF-PV', 'QF-BAT', 'QF-M1', 'QF-RL', 'QF-LP'], status: 'unk', reason: t('ck.cable.r'), need: N('install', 'ambient', 'earthing', 'icc') });
  add('load', { cat: 'grid', devs: ['GRID'], status: r.loadMax <= c.Sgrid * 0.9 ? 'ok' : 'ko', reason: t('ck.load.r', { p: f1(r.loadMax), s: c.Sgrid, imp: c.importLimit }), need: [] });
  if (c.exportAllowed === false || c.exportLimit < c.Pinv) add('exp', { cat: 'grid', devs: ['PV-INV', 'PM-PCC', 'PCS'], status: c.invRegMap ? 'ok' : 'unk',
    reason: t('ck.exp.r', { e: c.exportAllowed ? SG.num(c.exportLimit) : '0', p: SG.num(c.Pinv) }), need: c.invRegMap ? [] : N('regMap', 'plimTime', 'dsoExport') });
  if (c.ev) add('ev', { cat: 'ev', devs: ['EVSE', 'EMS'], status: 'unk', reason: t('ck.ev.r'), need: N('evseOcpp', 'rcdType') });
  // Phụ trợ
  const load = r.aux.I / c.psuA;
  add('psu', { cat: 'aux', devs: ['PSU', 'F24'], status: load <= 0.8 ? 'ok' : (load <= 1 ? 'unk' : 'ko'),
    reason: t('ck.psu.r', { i: f1(r.aux.I), n: c.psuA, p: Math.round(load * 100) }) + (load > 1 ? ' ' + t('ck.psu.over') : load > 0.8 ? ' ' + t('ck.psu.low') : ''), need: load > 0.8 && load <= 1 ? N('auxDs', 'derating') : [] });
  add('sw', { cat: 'comm', devs: ['SW'], status: 'ok', reason: t('ck.sw.r', { n: r.eth.n, l: r.eth.list.join(', '), p: r.eth.ports }), need: [] });
  return L;
};

/* ---------- CÂN BẰNG CÔNG SUẤT TỨC THỜI ----------
   s: { mode: GRID|ISLAND|GEN|BLACKOUT, irr 0..1, soc, m1Run, m1Spd, rlOn, rlFault, evOn, evA, auto, batSet, commPM, commInv, pvLimit } */
SG.solve = function (c, s0) {
  const s = Object.assign({ mode: 'GRID', irr: 0.6, soc: 50, m1Run: false, m1Spd: 100, rlOn: 0, rlFault: false, evOn: false, evA: 32, auto: true, batSet: 0, commPM: false, commInv: false }, s0);
  const o = { mode: s.mode, pv: 0, bat: 0, grid: 0, gen: 0, f: c.f, U: Math.round(c.U / Math.sqrt(3)), notes: [], curtail: 0, shed: 0, pvAvail: 0 };
  const dead = s.mode === 'BLACKOUT';
  const ld = {
    lp: dead ? 0 : c.Plp,
    m1: dead || !s.m1Run ? 0 : (c.Pm * 0.8 * Math.pow((s.m1Spd || 0) / 100, 3)) / 0.85 + 0.05,
    rl: dead || s.rlFault ? 0 : Math.min(s.rlOn, c.rlSteps) * c.rlStep,
    ev: dead || !c.ev || !s.evOn ? 0 : Math.min(c.Pev, (s.evA || 32) * 230 / 1000)
  };
  ld.total = ld.lp + ld.m1 + ld.rl + ld.ev;
  o.loads = ld;
  const pvA = Math.min(c.Ppv * Math.max(0, s.irr) * 0.96, c.Pinv);
  o.pvAvail = pvA;
  const canChg = s.soc < c.socMax, canDis = s.soc > c.socMin;
  const pcsMax = Math.min(c.Pcs, c.batV * c.batImax / 1000);
  if (dead) { o.U = 0; o.f = 0; o.notes.push(SG.t('solve.dead')); return o; }
  if (s.mode === 'GRID') {
    let pv = pvA, bat;
    if (s.commPM && s.auto) { bat = 0; o.notes.push(SG.t('solve.noPM')); }
    else if (s.auto) {
      const net = ld.total - pv;
      bat = net < 0 ? (canChg ? -Math.min(-net, pcsMax) : 0) : (canDis ? Math.min(net, pcsMax) : 0);
    } else {
      bat = Math.max(-pcsMax, Math.min(pcsMax, s.batSet || 0));
      if (bat < 0 && !canChg) bat = 0; if (bat > 0 && !canDis) bat = 0;
    }
    let grid = ld.total - pv - bat;
    const allowed = c.exportAllowed ? c.exportLimit : 0;
    if (grid < -allowed && s.auto && !s.commPM) {
      if (s.commInv) o.notes.push(SG.t('solve.noInv'));
      else { const cut = -allowed - grid; o.curtail = Math.min(cut, pv); pv -= o.curtail; grid = ld.total - pv - bat; }
    }
    if (s.pvLimit != null) { const lim = Math.min(pv, s.pvLimit); o.curtail += pv - lim; pv = lim; grid = ld.total - pv - bat; }
    if (grid > c.importLimit) o.shed = grid - c.importLimit;
    Object.assign(o, { pv, bat, grid });
  } else if (s.mode === 'ISLAND') {
    let pv = pvA, bat = ld.total - pv;
    const maxChg = canChg ? pcsMax : 0;
    if (bat < -maxChg) { o.curtail = -maxChg - bat; pv -= o.curtail; bat = -maxChg; o.f = c.f + 0.8; o.notes.push(SG.t('solve.pf')); }
    if (bat > pcsMax) { o.shed = bat - pcsMax; o.notes.push(SG.t('solve.shed', { p: SG.fx(o.shed) })); }
    if (bat > 0 && !canDis) { o.shed = Math.max(o.shed, bat); o.notes.push(SG.t('solve.socMin')); }
    o.f = o.curtail ? o.f : c.f - 0.2 * Math.max(0, bat) / c.Pcs;
    Object.assign(o, { pv, bat, grid: 0 });
  } else if (s.mode === 'GEN') {
    const cap = c.Sgen * 0.8, minL = 0.3 * cap;
    let pv = pvA, bat = canChg ? -Math.min(pcsMax, Math.max(0, cap * 0.9 - ld.total + pv)) : 0;
    let gen = ld.total - pv - bat;
    if (gen < minL) { const cut = Math.min(pv, minL - gen); pv -= cut; o.curtail = cut; gen = ld.total - pv - bat; o.notes.push(SG.t('solve.genMin')); }
    if (gen > cap) o.shed = gen - cap;
    o.f = c.f - 0.3 * gen / cap;
    Object.assign(o, { pv, bat, gen, grid: 0 });
  }
  return o;
};

/* ---------- MÔ PHỎNG ĐỘNG CHO HMI ----------
   Nhật ký và báo động lưu KHÓA + biến, dịch lúc hiển thị → đổi ngôn ngữ không làm lẫn ngôn ngữ trong nhật ký. */
SG.Sim = function (c) {
  const self = this;
  this.c = c;
  this.reset = function () {
    self.t = 10 * 3600; // 10:00
    self.s = { mode: 'GRID', irr: 0, soc: 60, m1Run: false, m1Spd: 80, rlOn: 1, rlFault: false, evOn: c.ev, evA: 16, auto: true, batSet: 0, commPM: false, commInv: false };
    self.ui = { gridAvail: true, cloud: 0, autoSel: true, remoteSel: true, m1Req: false, m1FailInject: false, rlReq: 1, evReq: c.ev, evAreq: 16 };
    self.timers = { gridOk: 0, shed: 0, restore: 0, m1fb: 0, gen: 0, trans: 0, pvReconn: 0 };
    self.gen = { req: false, ready: false, running: false };
    self.alarms = [];
    self.log = [];
    self.hist = [];
    self.m1Fb = false;
    self.lastSolve = SG.solve(c, self.s);
    self.event('ev.start', 'info');
  };
  this.clock = () => { const h = Math.floor(self.t / 3600) % 24, m = Math.floor(self.t / 60) % 60; return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); };
  this.event = (k, lvl, v) => { self.log.unshift({ t: self.clock(), k, v, lvl: lvl || 'info' }); if (self.log.length > 80) self.log.pop(); };
  this.alarm = (id, k, v) => { if (!self.alarms.find(a => a.id === id)) { self.alarms.push({ id, k, v, t: self.clock(), ack: false }); self.event(k, 'alarm', v); } };
  this.clear = (id) => { const i = self.alarms.findIndex(a => a.id === id); if (i >= 0) { self.alarms.splice(i, 1); } };
  this.irrAt = (t) => { const h = (t / 3600) % 24; const x = Math.sin(Math.PI * (h - 6.5) / 13); return Math.max(0, x) ** 1.3; };
  this.step = function (dt) {
    const c = self.c, s = self.s, ui = self.ui, T = self.timers;
    self.t += dt;
    s.irr = self.irrAt(self.t) * (1 - ui.cloud / 100);
    s.auto = ui.autoSel;
    // ---- lưới
    if (s.mode === 'GRID' && !ui.gridAvail) {
      if (c.island && c.pcsGF && c.ups) { s.mode = 'ISLAND'; self.event('ev.island', 'warn'); self.alarm('grid', 'al.grid'); s.evOn = false; s.rlOn = 0; self.event('ev.islandShed', 'warn'); }
      else { s.mode = 'BLACKOUT'; self.alarm('grid', 'al.grid'); self.event(c.ups ? 'ev.blackUps' : 'ev.blackNoUps', 'alarm'); T.gen = 0; }
      T.gridOk = 0;
    }
    if (ui.gridAvail) T.gridOk += dt; else T.gridOk = 0;
    // máy phát
    const wantGen = c.gen && c.ups && ((s.mode === 'BLACKOUT' && !ui.gridAvail) || (s.mode === 'ISLAND' && s.soc <= c.socMin + 5));
    if (wantGen && !self.gen.req) { self.gen.req = true; T.gen = 0; self.event('ev.genStart', 'warn'); }
    if (self.gen.req) { T.gen += dt; if (!self.gen.ready && T.gen >= 20) { self.gen.ready = true; self.event('ev.genReady', 'info'); } }
    if (self.gen.ready && s.mode !== 'GEN' && (s.mode === 'BLACKOUT' || s.mode === 'ISLAND') && !ui.gridAvail) {
      if (s.mode === 'ISLAND' && !c.genSync) self.event('ev.noSync', 'warn');
      s.mode = 'GEN'; self.event('ev.genOn', 'warn');
    }
    if (ui.gridAvail && T.gridOk >= 60 && s.mode !== 'GRID') {
      if (s.mode === 'GEN') self.event('ev.backGen', 'info');
      else if (s.mode === 'ISLAND') self.event(c.pcsResync ? 'ev.backResync' : 'ev.backBreak', 'info');
      else self.event('ev.backBlack', 'info');
      if (s.mode === 'BLACKOUT') T.pvReconn = 60;
      s.mode = 'GRID'; self.clear('grid');
      if (self.gen.req) { self.gen = { req: false, ready: false, running: false }; self.event('ev.genStop', 'info'); }
    }
    // ---- lệnh động cơ
    const ctrlAlive = s.mode !== 'BLACKOUT' || c.ups;
    if (ui.m1Req && !s.m1Run && ctrlAlive && s.mode !== 'BLACKOUT') { s.m1Run = true; T.m1fb = 0; self.m1Fb = false; }
    if (!ui.m1Req && s.m1Run) { s.m1Run = false; self.m1Fb = false; self.event('ev.m1Stop', 'info'); }
    if (s.m1Run && !self.m1Fb) { T.m1fb += dt; if (!ui.m1FailInject && T.m1fb >= 1) { self.m1Fb = true; self.event('ev.m1Run', 'info'); } else if (ui.m1FailInject && T.m1fb >= 3) { s.m1Run = false; ui.m1Req = false; self.alarm('m1', 'al.m1'); } }
    // ---- bậc tải, EV theo yêu cầu (trong giới hạn sa thải)
    if (s.mode === 'GRID' || s.mode === 'GEN') { if (!s.rlFault && T.shed === 0 && s.rlOn < ui.rlReq && T.restore >= (s.auto ? 60 : 0)) { s.rlOn++; T.restore = 0; } if (!s.auto) s.rlOn = s.rlFault ? 0 : ui.rlReq; if (s.rlOn > ui.rlReq) s.rlOn = ui.rlReq; }
    if (s.mode === 'ISLAND') { s.rlOn = 0; s.evOn = false; } else { s.evOn = c.ev && ui.evReq; if (!s.auto) s.evA = ui.evAreq; }
    s.commPM = !!ui.commPM; s.commInv = !!ui.commInv;
    if (ui.rlFault && !s.rlFault) { s.rlFault = true; s.rlOn = 0; self.alarm('rl', 'al.rl'); }
    // ---- giải
    let o = SG.solve(c, Object.assign({}, s, { pvLimit: T.pvReconn > 0 ? 0 : null }));
    if (T.pvReconn > 0) T.pvReconn = Math.max(0, T.pvReconn - dt);
    // ---- sa thải (auto)
    if (s.auto && o.shed > 0.05) {
      T.shed += dt; T.restore = 0;
      if (T.shed >= 5) {
        T.shed = 0;
        if (s.evOn && s.evA > 6) { s.evA = 6; self.event('ev.shedEv', 'warn'); }
        else if (s.rlOn > 0) { self.event('ev.shedRl', 'warn', { n: s.rlOn }); s.rlOn--; }
        else if (s.evOn) { s.evOn = false; ui.evReq = false; self.event('ev.shedEvStop', 'warn'); }
        else if (s.m1Run && s.mode !== 'GRID') { s.m1Run = false; ui.m1Req = false; self.event('ev.shedM1', 'alarm'); }
        else if (s.mode === 'ISLAND') { s.mode = 'BLACKOUT'; self.alarm('pcs', 'al.pcs'); }
        o = SG.solve(c, s);
      }
    } else { T.shed = 0; T.restore += dt; if (s.auto && s.evOn && s.evA < ui.evAreq && T.restore > 60 && (s.mode === 'GRID' && o.grid < c.importLimit - 2)) { s.evA = ui.evAreq; T.restore = 0; self.event('ev.evRestore', 'info'); } }
    // ---- SOC
    s.soc = Math.max(0, Math.min(100, s.soc - o.bat * dt / 3600 / c.Ebat * 100));
    const full = s.soc >= c.socMax - 0.05, empty = s.soc <= c.socMin + 0.05;
    if (full && !self.wasFull) self.event('ev.socMax', 'info', { v: c.socMax });
    if (empty && !self.wasEmpty) self.event('ev.socMin', 'warn', { v: c.socMin });
    self.wasFull = full; self.wasEmpty = empty;
    // báo động mất truyền thông
    if (s.commPM) self.alarm('cpm', 'al.cpm'); else self.clear('cpm');
    if (s.commInv) self.alarm('cinv', 'al.cinv'); else self.clear('cinv');
    self.lastSolve = o;
    self.hist.push({ t: self.t, pv: o.pv, bat: o.bat, grid: o.grid, gen: o.gen, load: o.loads.total, soc: s.soc });
    if (self.hist.length > 240) self.hist.shift();
  };
  this.reset();
};
