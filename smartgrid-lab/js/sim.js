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
  r.io.KA = c.useKA ? sig.filter(s => s.io === 'DO' && /KA/.test(s.type)).length : 0;
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

/* ---------- KIỂM TRA TƯƠNG THÍCH: status ok | ko | unk ---------- */
SG.checks = function (c, r) {
  const L = [], f1 = n => (Math.round(n * 10) / 10).toLocaleString('vi-VN'), f0 = n => Math.round(n).toLocaleString('vi-VN');
  const add = (o) => L.push(o);
  // PV
  add({ cat: 'PV', title: 'Điện áp hở mạch chuỗi PV ≤ điện áp DC tối đa inverter', devs: ['PV-ARR', 'PV-INV'],
    status: r.pv.VocMax <= c.invVdcMax ? 'ok' : 'ko',
    reason: 'Voc,max = Ns × Voc × (1 + β × (Tmin − 25)) = ' + c.pvNs + ' × ' + c.pvVoc + ' × (1 + ' + c.pvBeta + '% × (' + c.pvTmin + ' − 25)) = ' + f0(r.pv.VocMax) + ' V so với ' + c.invVdcMax + ' V.' + (r.pv.VocMax > c.invVdcMax ? ' Vượt → có thể phá hỏng inverter. Giảm số tấm nối tiếp.' : ''),
    need: [] });
  const inM = r.pv.VmpHot >= c.invMpptMin && r.pv.VmpCold <= c.invMpptMax;
  add({ cat: 'PV', title: 'Điện áp làm việc chuỗi nằm trong dải MPPT', devs: ['PV-ARR', 'PV-INV'],
    status: inM ? 'unk' : 'ko',
    reason: 'Ước lượng Vmp ≈ 0,82 × Voc: từ ' + f0(r.pv.VmpHot) + ' V (70 °C) đến ' + f0(r.pv.VmpCold) + ' V (Tmin) so với dải ' + c.invMpptMin + '–' + c.invMpptMax + ' V.' + (inM ? ' Có vẻ phù hợp, nhưng 0,82 là hệ số giả định.' : ' Ra ngoài dải → inverter mất công suất hoặc không khởi động.'),
    need: inM ? ['Vmp và hệ số nhiệt Pmax thật từ datasheet tấm', 'Dòng tối đa mỗi MPPT'] : [] });
  // Pin
  const pBat = c.batV * c.batImax / 1000;
  add({ cat: 'Pin', title: 'Dòng xả/sạc liên tục của pin đủ cho công suất PCS', devs: ['BAT', 'PCS'],
    status: pBat >= c.Pcs ? 'ok' : 'ko', reason: c.batV + ' V × ' + c.batImax + ' A = ' + f1(pBat) + ' kW so với PCS ' + c.Pcs + ' kW.' + (pBat < c.Pcs ? ' Pin giới hạn công suất thực xuống ' + f1(pBat) + ' kW (BMS sẽ đặt DCL/CCL).' : ''), need: [] });
  add({ cat: 'Pin', title: 'Giao thức BMS ↔ PCS', devs: ['BMS', 'PCS'],
    status: c.bmsCompat ? 'ok' : 'unk', reason: c.bmsCompat ? 'Bạn đã xác minh cặp pin–PCS trong danh sách tương thích chính thức.' : 'Cùng có cổng CAN chưa đủ: giao thức pin thường riêng từng hãng.',
    need: c.bmsCompat ? [] : ['Danh sách pin tương thích của nhà sản xuất PCS', 'Phiên bản firmware hai phía', 'Pinout cáp CAN'] });
  // Đảo
  if (c.island) {
    add({ cat: 'Vận hành đảo', title: 'Có nguồn tạo lưới cho chế độ đảo', devs: ['PCS'], status: c.pcsGF ? 'unk' : 'ko',
      reason: c.pcsGF ? 'PCS được khai báo grid-forming (giả định). Cần xác nhận khả năng quá tải, thời gian chuyển và việc làm việc chung với inverter PV (AC coupling).' : 'PCS grid-following không tạo được U/f → vận hành đảo không khả thi. Kịch bản “đảo” bị khóa.',
      need: c.pcsGF ? ['Datasheet PCS: chế độ đảo, thời gian chuyển, quá tải', 'Danh sách inverter PV tương thích AC coupling / P(f)'] : [] });
    add({ cat: 'Vận hành đảo', title: 'Nguồn điều khiển duy trì khi mất lưới', devs: ['UPS', 'RLY-DEC', 'CPU'], status: c.ups ? 'ok' : 'ko',
      reason: c.ups ? 'UPS 24 V nuôi PLC, switch, HMI và relay tách lưới.' : 'Không có UPS: mất lưới thì PLC, relay tách lưới, switch tắt → không điều khiển được việc tách/đảo.', need: [] });
    add({ cat: 'Vận hành đảo', title: 'Tải ưu tiên + động cơ ≤ công suất PCS khi đảo', devs: ['PCS', 'LP', 'M1'], status: r.prioIsland <= c.Pcs ? 'ok' : 'ko',
      reason: f1(c.Plp) + ' + ' + f1(c.Pm / 0.85) + ' = ' + f1(r.prioIsland) + ' kW so với ' + c.Pcs + ' kW. Bậc điện trở và EV bị sa thải khi đảo.' + (r.prioIsland > c.Pcs ? ' Cần dừng động cơ khi đảo hoặc tăng PCS.' : ''), need: [] });
    add({ cat: 'Vận hành đảo', title: 'Sơ đồ nối đất và bảo vệ khi đảo', devs: ['KM-PCC', 'PCS'], status: 'unk',
      reason: 'Khi tách khỏi lưới, phải tái lập điểm nối trung tính–đất và đảm bảo bảo vệ vẫn tác động với dòng ngắn mạch thấp của PCS. Không thể kết luận bằng mô phỏng.',
      need: ['Sơ đồ nối đất công trình', 'Dòng ngắn mạch PCS (datasheet)', 'Hướng dẫn nhà sản xuất PCS về N–PE khi đảo', 'Quy định áp dụng'] });
  }
  // Máy phát
  if (c.gen) {
    const pG = c.Sgen * 0.8;
    add({ cat: 'Máy phát', title: 'Công suất máy phát đủ cho tải ưu tiên + động cơ', devs: ['GEN'], status: pG >= r.prioIsland ? 'ok' : 'ko',
      reason: c.Sgen + ' kVA × 0,8 = ' + f1(pG) + ' kW so với ' + f1(r.prioIsland) + ' kW.', need: [] });
    add({ cat: 'Máy phát', title: 'Giới hạn PV khi chạy máy phát (tải tối thiểu, công suất ngược)', devs: ['GEN', 'PV-INV'], status: c.invRegMap ? 'ok' : 'unk',
      reason: c.invRegMap ? 'Register map cho phép ghi giới hạn P.' : 'Cần ghi được giới hạn công suất inverter (hoặc P(f) qua PCS); register map chưa có.', need: c.invRegMap ? [] : ['Register map inverter: thanh ghi giới hạn P'] });
    add({ cat: 'Máy phát', title: 'Chuyển nguồn PCS → máy phát', devs: ['GEN-CTRL', 'PCS'], status: c.genSync ? 'unk' : 'ok',
      reason: c.genSync ? 'Chuyển không gián đoạn cần bộ đồng bộ và PCS chấp nhận nguồn máy phát (chế độ hỗ trợ máy phát).' : 'Chuyển CÓ gián đoạn ngắn (đóng trên thanh cái chết) — tương thích với khóa liên động hiện có.',
      need: c.genSync ? ['Datasheet GCU: chức năng đồng bộ', 'Datasheet PCS: đầu vào máy phát / đồng bộ'] : [] });
  }
  if (c.genParallel) add({ cat: 'Máy phát', title: 'Vận hành song song máy phát với lưới', devs: ['GEN', 'KM-PCC', 'KM-GEN'], status: 'ko',
    reason: 'Kiến trúc tham chiếu khóa liên động KM-PCC/KM-GEN. Song song cần đồng bộ (25), bảo vệ công suất ngược (32), bảo vệ tách lưới máy phát, chia tải và thỏa thuận với điện lực.', need: [] });
  // Đo lường & truyền thông
  add({ cat: 'Đo lường', title: 'Ngõ ra CT khớp ngõ vào dòng của đồng hồ PCC', devs: ['CT-PCC', 'PM-PCC'], status: c.ctOut === c.meterIn ? 'ok' : 'ko',
    reason: 'CT: ' + c.ctOut + ', đồng hồ: ' + c.meterIn + '.' + (c.ctOut !== c.meterIn ? ' Không khớp → giá trị sai hoặc nguy hiểm (CT 5 A vào ngõ vào mV).' : ''), need: [] });
  const slaves = SG.rs485Slaves(c);
  add({ cat: 'Truyền thông', title: 'PLC đọc được các thiết bị Modbus RTU (RS485)', devs: ['CPU', 'COM', 'GW'].concat(slaves),
    status: c.rtuVia === 'none' ? 'ko' : 'ok',
    reason: c.rtuVia === 'none' ? slaves.join(', ') + ' chỉ có cổng RS485, PLC chỉ có Ethernet. Cùng “Modbus” nhưng khác giao diện vật lý.' : 'Master RS485: ' + (c.rtuVia === 'gw' ? 'gateway Modbus TCP/RTU' : 'module RS485 của PLC') + '. Slave: ' + slaves.join(', ') + '. Cần đặt địa chỉ khác nhau, cùng baud/parity, 120 Ω ở hai đầu.',
    need: [], fix: c.rtuVia === 'none' ? 'Thêm module RS485 cho PLC hoặc gateway Modbus TCP/RTU.' : '' });
  add({ cat: 'Truyền thông', title: 'Register map inverter: đọc P_PV và ghi giới hạn P', devs: ['PV-INV', 'CPU'], status: c.invRegMap ? 'ok' : 'unk',
    reason: c.invRegMap ? 'Bạn đã có register map.' : 'Inverter “có Modbus TCP” chưa đủ: chưa biết thanh ghi, kiểu dữ liệu, thanh ghi giới hạn P có ghi được và có lưu EEPROM không.',
    need: c.invRegMap ? [] : ['Register map / SunSpec models', 'Thanh ghi giới hạn P và hành vi khi mất truyền thông', 'Số kết nối TCP đồng thời'] });
  if (c.pyr) add({ cat: 'Đo lường', title: 'Loại tín hiệu cảm biến bức xạ khớp kênh AI', devs: ['PYR', 'AIO'], status: c.pyrOut === c.aiPyrCh ? 'ok' : 'ko',
    reason: 'Cảm biến: ' + c.pyrOut + ', kênh AI: ' + c.aiPyrCh + '.', need: [] });
  // Điều khiển
  const coilAC = c.coilV === '230VAC';
  let st = 'ok', rs = '';
  if (!c.useKA && c.doType === 'transistor' && coilAC) { st = 'ko'; rs = 'DO transistor 24 VDC không đóng được cuộn 230 VAC. Cần relay trung gian (KA) hoặc module DO relay.'; }
  else if (!c.useKA && c.doType === 'relay' && coilAC) { st = 'unk'; rs = 'DO relay có thể đóng 230 VAC, nhưng phải kiểm tra dòng hút (inrush) của cuộn so với định mức tiếp điểm và dập xung.'; }
  else if (c.useKA) rs = 'DO → KA (cuộn 24 VDC ~20 mA) → tiếp điểm KA đóng cuộn contacteur ' + (coilAC ? '230 VAC' : '24 VDC') + '.';
  else rs = 'Cuộn 24 VDC trực tiếp từ DO: kiểm tra dòng cuộn ≤ 0,5 A và dập xung.';
  add({ cat: 'Điều khiển', title: 'Ngõ ra PLC điều khiển được cuộn contacteur', devs: ['DO', 'KA', 'KM-RL', 'KM-PCC'], status: st, reason: rs, need: st === 'unk' ? ['Công suất hút/giữ cuộn contacteur', 'Định mức tiếp điểm DO relay'] : [] });
  add({ cat: 'Điều khiển', title: 'Logic DI biến tần khớp DO PLC', devs: ['DO', 'VFD-M1'], status: c.vfdDiLogic === 'PNP' ? 'ok' : 'ko',
    reason: 'DO PLC: PNP (source). DI biến tần: ' + c.vfdDiLogic + '.' + (c.vfdDiLogic !== 'PNP' ? ' Biến tần không nhận lệnh chạy dù đèn DO sáng → cấu hình lại DI biến tần (nếu cho phép) hoặc đổi module.' : ''), need: [] });
  if (c.remoteBreaker) {
    const wantClose = c.remoteBreakerClose;
    add({ cat: 'Điều khiển', title: 'Máy cắt tổng QF0 điều khiển từ PLC', devs: ['QF0', 'KA', 'CPU'],
      status: wantClose && !c.breakerMotor ? 'ko' : 'ok',
      reason: wantClose && !c.breakerMotor ? 'Yêu cầu ĐÓNG từ xa, nhưng QF0 chỉ có MX (cắt) và tiếp điểm OF/SD. Một cổng truyền thông hay cuộn MX không đủ để đóng máy cắt: cần bộ truyền động động cơ (commande motorisée) tương thích, nguồn cho motor, phản hồi OF/SD, và khóa “sẵn sàng đóng”. Ngoài ra không nên tự động đóng lại sau trip sự cố.' : 'Cắt từ xa bằng MX qua KA4; trạng thái về DI qua OF/SD.' + (c.breakerMotor ? ' Đóng từ xa bằng bộ truyền động động cơ.' : ''),
      need: [], fix: wantClose && !c.breakerMotor ? 'Thêm bộ truyền động động cơ tương thích với dòng máy cắt, hoặc dùng contacteur KM-PCC cho chức năng đóng/cắt điều khiển.' : '' });
  }
  // Bảo vệ & lắp đặt — không bao giờ kết luận tự động
  add({ cat: 'Bảo vệ', title: 'Khả năng cắt QF0 ≥ dòng ngắn mạch tại PCC', devs: ['QF0', 'GRID'],
    status: c.Icc && c.qf0Icu ? (c.qf0Icu >= c.Icc ? 'ok' : 'ko') : 'unk',
    reason: c.Icc && c.qf0Icu ? 'Icu ' + c.qf0Icu + ' kA so với Icc ' + c.Icc + ' kA (chưa xét phối hợp cascade và chọn lọc).' : 'Thiếu ' + (!c.Icc ? 'Icc tại PCC' : '') + (!c.Icc && !c.qf0Icu ? ' và ' : '') + (!c.qf0Icu ? 'Icu của máy cắt dự kiến' : '') + '.',
    need: c.Icc && c.qf0Icu ? ['Bảng chọn lọc/cascade của hãng'] : ['Icc tại PCC từ đơn vị điện lực', 'Icu/Ics máy cắt (datasheet)'] });
  add({ cat: 'Bảo vệ', title: 'Tiết diện cáp và phối hợp Ib ≤ In ≤ Iz', devs: ['QF0', 'QF-PV', 'QF-BAT', 'QF-M1', 'QF-RL', 'QF-LP'], status: 'unk',
    reason: 'Site chỉ tính Ib sơ bộ (bảng bên trên). Chọn cáp phụ thuộc cách lắp, nhiệt độ, số mạch chung máng, độ dài và sụt áp, điều kiện cắt khi sự cố — phải tính theo IEC 60364 / NF C 15-100.',
    need: ['Cách lắp đặt và chiều dài từng cáp', 'Nhiệt độ môi trường', 'Sơ đồ nối đất', 'Icc'] });
  add({ cat: 'Lưới', title: 'Tổng tải tối đa so với công suất đấu nối', devs: ['GRID'], status: r.loadMax <= c.Sgrid * 0.9 ? 'ok' : 'ko',
    reason: 'Tải tối đa ≈ ' + f1(r.loadMax) + ' kW so với ' + c.Sgrid + ' kVA. Giới hạn nhập do EMS đặt: ' + c.importLimit + ' kW → sa thải tải khi vượt.', need: [] });
  if (c.exportAllowed === false || c.exportLimit < c.Pinv) add({ cat: 'Lưới', title: 'Chống/giới hạn phát lên lưới thực hiện được', devs: ['PV-INV', 'PM-PCC', 'PCS'], status: c.invRegMap ? 'ok' : 'unk',
    reason: 'Giới hạn phát ' + (c.exportAllowed ? c.exportLimit + ' kW' : '0 kW') + ' < công suất inverter ' + c.Pinv + ' kW → khi pin đầy phải giới hạn PV qua truyền thông.', need: c.invRegMap ? [] : ['Register map inverter', 'Thời gian đáp ứng giới hạn P', 'Quy định của điện lực về chống phát ngược'] });
  if (c.ev) add({ cat: 'EV', title: 'EMS giới hạn được dòng sạc EV', devs: ['EVSE', 'EMS'], status: 'unk', reason: 'OCPP 1.6J được giả định; Smart Charging không phải trạm nào cũng hỗ trợ.', need: ['Datasheet trạm: phiên bản OCPP, SetChargingProfile', 'Loại RCD yêu cầu'] });
  // Phụ trợ
  const load = r.aux.I / c.psuA;
  add({ cat: 'Phụ trợ', title: 'Bộ nguồn 24 V đủ dòng (dự phòng 20 %)', devs: ['PSU', 'F24'], status: load <= 0.8 ? 'ok' : (load <= 1 ? 'unk' : 'ko'),
    reason: 'Tiêu thụ ước lượng ' + f1(r.aux.I) + ' A / ' + c.psuA + ' A = ' + Math.round(load * 100) + ' %.' + (load > 1 ? ' Quá tải.' : load > 0.8 ? ' Không đủ dự phòng.' : ''), need: load > 0.8 && load <= 1 ? ['Tiêu thụ thực từ datasheet', 'Giảm định mức theo nhiệt độ tủ'] : [] });
  add({ cat: 'Truyền thông', title: 'Số cổng switch Ethernet', devs: ['SW'], status: 'ok', reason: r.eth.n + ' thiết bị Ethernet (' + r.eth.list.join(', ') + ') + 2 dự phòng → switch ' + r.eth.ports + ' cổng.', need: [] });
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
  if (dead) { o.U = 0; o.f = 0; o.notes.push('Thanh cái không có điện.'); return o; }
  if (s.mode === 'GRID') {
    let pv = pvA, bat;
    if (s.commPM && s.auto) { bat = 0; o.notes.push('Mất P_GRID → EMS giữ pin ở 0 kW.'); }
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
      if (s.commInv) o.notes.push('Không ghi được giới hạn PV (mất truyền thông inverter) → vượt giới hạn phát.');
      else { const cut = -allowed - grid; o.curtail = Math.min(cut, pv); pv -= o.curtail; grid = ld.total - pv - bat; }
    }
    if (s.pvLimit != null) { const lim = Math.min(pv, s.pvLimit); o.curtail += pv - lim; pv = lim; grid = ld.total - pv - bat; }
    if (grid > c.importLimit) o.shed = grid - c.importLimit;
    Object.assign(o, { pv, bat, grid });
  } else if (s.mode === 'ISLAND') {
    let pv = pvA, bat = ld.total - pv;
    const maxChg = canChg ? pcsMax : 0;
    if (bat < -maxChg) { o.curtail = -maxChg - bat; pv -= o.curtail; bat = -maxChg; o.f = c.f + 0.8; o.notes.push('PCS nâng tần số → inverter PV tự giảm công suất (P(f)).'); }
    if (bat > pcsMax) { o.shed = bat - pcsMax; o.notes.push('Thiếu công suất PCS: cần sa thải ' + o.shed.toFixed(1) + ' kW.'); }
    if (bat > 0 && !canDis) { o.shed = Math.max(o.shed, bat); o.notes.push('SOC ≤ SOC min: không thể cấp tải.'); }
    o.f = o.curtail ? o.f : c.f - 0.2 * Math.max(0, bat) / c.Pcs;
    Object.assign(o, { pv, bat, grid: 0 });
  } else if (s.mode === 'GEN') {
    const cap = c.Sgen * 0.8, minL = 0.3 * cap;
    let pv = pvA, bat = canChg ? -Math.min(pcsMax, Math.max(0, cap * 0.9 - ld.total + pv)) : 0;
    let gen = ld.total - pv - bat;
    if (gen < minL) { const cut = Math.min(pv, minL - gen); pv -= cut; o.curtail = cut; gen = ld.total - pv - bat; o.notes.push('Giới hạn PV để máy phát ≥ tải tối thiểu (chống công suất ngược).'); }
    if (gen > cap) o.shed = gen - cap;
    o.f = c.f - 0.3 * gen / cap;
    Object.assign(o, { pv, bat, gen, grid: 0 });
  }
  return o;
};

/* ---------- MÔ PHỎNG ĐỘNG CHO HMI ---------- */
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
    self.event('Khởi động mô phỏng — hòa lưới, chế độ Auto/Remote.', 'info');
  };
  this.clock = () => { const h = Math.floor(self.t / 3600) % 24, m = Math.floor(self.t / 60) % 60; return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); };
  this.event = (txt, lvl) => { self.log.unshift({ t: self.clock(), txt, lvl: lvl || 'info' }); if (self.log.length > 80) self.log.pop(); };
  this.alarm = (id, txt) => { if (!self.alarms.find(a => a.id === id)) { self.alarms.push({ id, txt, t: self.clock(), ack: false }); self.event(txt, 'alarm'); } };
  this.clear = (id) => { const i = self.alarms.findIndex(a => a.id === id); if (i >= 0) { self.alarms.splice(i, 1); } };
  this.irrAt = (t) => { const h = (t / 3600) % 24; const x = Math.sin(Math.PI * (h - 6.5) / 13); return Math.max(0, x) ** 1.3; };
  this.step = function (dt) {
    const c = self.c, s = self.s, ui = self.ui, T = self.timers;
    self.t += dt;
    s.irr = self.irrAt(self.t) * (1 - ui.cloud / 100);
    s.auto = ui.autoSel;
    // ---- lưới
    if (s.mode === 'GRID' && !ui.gridAvail) {
      if (c.island && c.pcsGF && c.ups) { s.mode = 'ISLAND'; self.event('Relay tách lưới tác động → KM-PCC mở. PCS chuyển grid-forming: VẬN HÀNH ĐẢO.', 'warn'); self.alarm('grid', 'Mất lưới'); s.evOn = false; s.rlOn = 0; self.event('PLC: sa thải EV và mọi bậc tải điện trở (chế độ đảo).', 'warn'); }
      else { s.mode = 'BLACKOUT'; self.alarm('grid', 'Mất lưới'); self.event(c.ups ? 'Inverter/PCS ngừng phát (chống tách đảo). Thanh cái mất điện. PLC sống nhờ UPS.' : 'Thanh cái mất điện. Không có UPS: PLC/HMI tắt.', 'alarm'); T.gen = 0; }
      T.gridOk = 0;
    }
    if (ui.gridAvail) T.gridOk += dt; else T.gridOk = 0;
    // máy phát
    const wantGen = c.gen && c.ups && ((s.mode === 'BLACKOUT' && !ui.gridAvail) || (s.mode === 'ISLAND' && s.soc <= c.socMin + 5));
    if (wantGen && !self.gen.req) { self.gen.req = true; T.gen = 0; self.event('PLC: GEN_START → KA3 → bộ điều khiển máy phát.', 'warn'); }
    if (self.gen.req) { T.gen += dt; if (!self.gen.ready && T.gen >= 20) { self.gen.ready = true; self.event('GEN_READY = 1 (U/f ổn định).', 'info'); } }
    if (self.gen.ready && s.mode !== 'GEN' && (s.mode === 'BLACKOUT' || s.mode === 'ISLAND') && !ui.gridAvail) {
      if (s.mode === 'ISLAND' && !c.genSync) self.event('Không có đồng bộ: PCS dừng tạo lưới → thanh cái chết ~2 s.', 'warn');
      s.mode = 'GEN'; self.event('Khóa liên động OK (KM_PCC_FB = 0) → đóng KM-GEN. Nguồn: MÁY PHÁT.', 'warn');
    }
    if (ui.gridAvail && T.gridOk >= 60 && s.mode !== 'GRID') {
      if (s.mode === 'GEN') self.event('Lưới ổn định 60 s → mở KM-GEN, đóng KM-PCC.', 'info');
      else if (s.mode === 'ISLAND') self.event(c.pcsResync ? 'PCS đồng bộ lại với lưới → đóng KM-PCC (không gián đoạn).' : 'Lưới ổn định 60 s → dừng PCS, đóng KM-PCC (gián đoạn ngắn).', 'info');
      else self.event('Lưới phục hồi → thanh cái có điện; inverter kết nối lại sau trễ.', 'info');
      if (s.mode === 'BLACKOUT') T.pvReconn = 60;
      s.mode = 'GRID'; self.clear('grid');
      if (self.gen.req) { self.gen = { req: false, ready: false, running: false }; self.event('Máy phát: làm mát rồi dừng.', 'info'); }
    }
    // ---- lệnh động cơ
    const ctrlAlive = s.mode !== 'BLACKOUT' || c.ups;
    if (ui.m1Req && !s.m1Run && ctrlAlive && s.mode !== 'BLACKOUT') { s.m1Run = true; T.m1fb = 0; self.m1Fb = false; }
    if (!ui.m1Req && s.m1Run) { s.m1Run = false; self.m1Fb = false; self.event('M1: lệnh dừng → biến tần giảm tốc.', 'info'); }
    if (s.m1Run && !self.m1Fb) { T.m1fb += dt; if (!ui.m1FailInject && T.m1fb >= 1) { self.m1Fb = true; self.event('M1: VFD_RUN_FB = 1 — đang chạy.', 'info'); } else if (ui.m1FailInject && T.m1fb >= 3) { s.m1Run = false; ui.m1Req = false; self.alarm('m1', 'M1 không chạy: không có phản hồi VFD_RUN_FB sau 3 s'); } }
    // ---- bậc tải, EV theo yêu cầu (trong giới hạn sa thải)
    if (s.mode === 'GRID' || s.mode === 'GEN') { if (!s.rlFault && T.shed === 0 && s.rlOn < ui.rlReq && T.restore >= (s.auto ? 60 : 0)) { s.rlOn++; T.restore = 0; } if (!s.auto) s.rlOn = s.rlFault ? 0 : ui.rlReq; if (s.rlOn > ui.rlReq) s.rlOn = ui.rlReq; }
    if (s.mode === 'ISLAND') { s.rlOn = 0; s.evOn = false; } else { s.evOn = c.ev && ui.evReq; if (!s.auto) s.evA = ui.evAreq; }
    s.commPM = !!ui.commPM; s.commInv = !!ui.commInv;
    if (ui.rlFault && !s.rlFault) { s.rlFault = true; s.rlOn = 0; self.alarm('rl', 'QF-RL trip (sự cố nhánh tải điện trở) — khóa đóng lại'); }
    // ---- giải
    let o = SG.solve(c, Object.assign({}, s, { pvLimit: T.pvReconn > 0 ? 0 : null }));
    if (T.pvReconn > 0) T.pvReconn = Math.max(0, T.pvReconn - dt);
    // ---- sa thải (auto)
    if (s.auto && o.shed > 0.05) {
      T.shed += dt; T.restore = 0;
      if (T.shed >= 5) {
        T.shed = 0;
        if (s.evOn && s.evA > 6) { s.evA = 6; self.event('Sa thải: EV giới hạn 6 A (OCPP).', 'warn'); }
        else if (s.rlOn > 0) { self.event('Sa thải: mở KM-RL' + s.rlOn + '.', 'warn'); s.rlOn--; }
        else if (s.evOn) { s.evOn = false; ui.evReq = false; self.event('Sa thải: dừng sạc EV.', 'warn'); }
        else if (s.m1Run && s.mode !== 'GRID') { s.m1Run = false; ui.m1Req = false; self.event('Sa thải: dừng M1 (thiếu công suất nguồn).', 'alarm'); }
        else if (s.mode === 'ISLAND') { s.mode = 'BLACKOUT'; self.alarm('pcs', 'PCS dừng: không đủ công suất/SOC — mất điện'); }
        o = SG.solve(c, s);
      }
    } else { T.shed = 0; T.restore += dt; if (s.auto && s.evOn && s.evA < ui.evAreq && T.restore > 60 && (s.mode === 'GRID' && o.grid < c.importLimit - 2)) { s.evA = ui.evAreq; T.restore = 0; self.event('Phục hồi giới hạn EV.', 'info'); } }
    // ---- SOC
    s.soc = Math.max(0, Math.min(100, s.soc - o.bat * dt / 3600 / c.Ebat * 100));
    const full = s.soc >= c.socMax - 0.05, empty = s.soc <= c.socMin + 0.05;
    if (full && !self.wasFull) self.event('Pin đạt SOC max ' + c.socMax + ' % — EMS cấm sạc.', 'info');
    if (empty && !self.wasEmpty) self.event('Pin đạt SOC min ' + c.socMin + ' % — EMS cấm xả.', 'warn');
    self.wasFull = full; self.wasEmpty = empty;
    // báo động mất truyền thông
    if (s.commPM) self.alarm('cpm', 'Mất truyền thông PM-PCC'); else self.clear('cpm');
    if (s.commInv) self.alarm('cinv', 'Mất truyền thông inverter PV'); else self.clear('cinv');
    self.lastSolve = o;
    self.hist.push({ t: self.t, pv: o.pv, bat: o.bat, grid: o.grid, gen: o.gen, load: o.loads.total, soc: s.soc });
    if (self.hist.length > 240) self.hist.shift();
  };
  this.reset();
};
