/* BẢNG I/O — sinh theo cấu hình. io: DI | DO | AI | AO | COM.
   Văn bản đi qua SG.t: chức năng = 'sig.<khóa>.f', khi lỗi = 'sig.<khóa>.x', kiểu tín hiệu = 'sty.*' (i18n/<lang>/logic.js).
   fail = trạng thái/hành vi khi lỗi (đứt dây, mất nguồn, mất truyền thông). link = id kết nối trên sơ đồ. */
SG.signals = function (c) {
  const S = [], t = SG.t;
  const add = (code, io, src, dst, type, key, link, v) => S.push({ code, io, src, dst, type, func: t('sig.' + key + '.f', v), fail: t('sig.' + key + '.x', v), link });
  const contact = t('sty.no'), nc = t('sty.nc');
  // ---------- DI
  add('QF0_OF', 'DI', 'QF0', 'DI', contact, 'qf0of', 'd-qf0');
  add('QF0_SD', 'DI', 'QF0', 'DI', contact, 'qf0sd', 'd-qf0');
  if (c.island || c.gen) add('KM_PCC_FB', 'DI', 'KM-PCC', 'DI', contact, 'kmpccfb', 'd-kmpcc');
  if (c.island) {
    add('DEC_TRIP', 'DI', 'RLY-DEC', 'DI', nc, 'dectrip', 'd-dec');
    add('DEC_FLT', 'DI', 'RLY-DEC', 'DI', nc, 'decflt', 'd-dec');
  }
  if (c.gen) {
    add('KM_GEN_FB', 'DI', 'KM-GEN', 'DI', contact, 'kmgenfb', 'd-kmgen');
    add('GEN_READY', 'DI', 'GEN-CTRL', 'DI', contact, 'genready', 'd-gen');
    add('GEN_ALM', 'DI', 'GEN-CTRL', 'DI', nc, 'genalm', 'd-gen');
  }
  add('QF_PV_SD', 'DI', 'QF-PV', 'DI', contact, 'qfpv', 'd-qfpv');
  add('QF_BAT_SD', 'DI', 'QF-BAT', 'DI', contact, 'qfbat', 'd-qfbat');
  add('QF_M1_OF', 'DI', 'QF-M1', 'DI', contact, 'qfm1', 'd-qfm1');
  add('KM_M1_FB', 'DI', 'KM-M1', 'DI', contact, 'kmm1', 'd-kmm1');
  add('VFD_RUN_FB', 'DI', 'VFD-M1', 'DI', t('sty.r2'), 'vfdrunfb', 'd-vfd');
  add('VFD_FLT', 'DI', 'VFD-M1', 'DI', t('sty.r1nc'), 'vfdflt', 'd-vfd');
  add('QF_RL_SD', 'DI', 'QF-RL', 'DI', contact, 'qfrl', 'd-qfrl');
  for (let i = 1; i <= c.rlSteps; i++) add('KM_RL' + i + '_FB', 'DI', 'KM-RL', 'DI', contact, 'kmrlfb', 'd-kmrl', { i });
  add('QF_LP_SD', 'DI', 'QF-LP', 'DI', contact, 'qflp', 'd-qflp');
  if (c.ev) add('QF_EV_SD', 'DI', 'QF-EV', 'DI', contact, 'qfev', 'd-qfev');
  add('SPD_ALM', 'DI', 'SPD', 'DI', nc, 'spd', 'd-spd');
  add('PSU_OK', 'DI', 'PSU', 'DI', t('sty.dcok'), 'psuok', 'd-psu');
  if (c.ups) {
    add('UPS_ONBAT', 'DI', 'UPS', 'DI', contact, 'upsonbat', 'd-ups');
    add('UPS_LOW', 'DI', 'UPS', 'DI', contact, 'upslow', 'd-ups');
  }
  add('KS_OK', 'DI', 'KS', 'DI', t('sty.ksinfo'), 'ksok', 'd-ks');
  add('SEL_AUTO', 'DI', 'OP', 'DI', contact, 'selauto', 'd-op');
  add('SEL_REMOTE', 'DI', 'OP', 'DI', contact, 'selremote', 'd-op');
  add('PB_START_M1', 'DI', 'OP', 'DI', contact, 'pbstart', 'd-op');
  add('PB_STOP_M1', 'DI', 'OP', 'DI', nc, 'pbstop', 'd-op');
  add('PB_RESET', 'DI', 'OP', 'DI', contact, 'pbreset', 'd-op');
  // ---------- DO
  const viaKA = c.useKA ? t('sty.viaKA') : t('sty.direct');
  if (c.island || c.gen) add('KM_PCC_CMD', 'DO', 'DO', 'KM-PCC', c.doType === 'transistor' ? t('sty.trCoil', { via: viaKA, n: 1 }) : t('sty.relay'), 'kmpcccmd', 'c-ka-pcc');
  if (c.gen) {
    add('KM_GEN_CMD', 'DO', 'DO', 'KM-GEN', t('sty.trCoil', { via: viaKA, n: 2 }), 'kmgencmd', 'c-ka-gen');
    add('GEN_START', 'DO', 'DO', 'GEN-CTRL', t('sty.trDry'), 'genstart', 'c-ka-gstart');
  }
  if (c.remoteBreaker) add('QF0_MX', 'DO', 'DO', 'QF0', t('sty.trMx'), 'qf0mx', 'c-ka-mx');
  add('VFD_RUN', 'DO', 'DO', 'VFD-M1', t('sty.trVfd'), 'vfdrun', 'c-do-vfd');
  add('VFD_RST', 'DO', 'DO', 'VFD-M1', t('sty.tr24'), 'vfdrst', 'c-do-vfd');
  for (let i = 1; i <= c.rlSteps; i++) add('KM_RL' + i + '_CMD', 'DO', 'DO', 'KM-RL', t('sty.trCoil', { via: viaKA, n: 4 + i }), 'kmrlcmd', 'c-ka-rl', { i });
  add('H_GRID', 'DO', 'DO', 'OP', t('sty.trLed'), 'hgrid', 'c-do-op');
  add('H_ISLAND', 'DO', 'DO', 'OP', t('sty.trLed'), 'hisland', 'c-do-op');
  add('H_ALARM', 'DO', 'DO', 'OP', t('sty.trLed'), 'halarm', 'c-do-op');
  // ---------- AI / AO
  if (c.pyr) add('PYR_IRR', 'AI', 'PYR', 'AIO', t('sty.ma2w'), 'pyr', 'm-pyr');
  if (c.cabtemp) add('CAB_TEMP', 'AI', 'BT-CAB', 'AIO', t('sty.pt100'), 'cabtemp', 'm-cab');
  add('VFD_SPD_REF', 'AO', 'AIO', 'VFD-M1', '0–10 V', 'vfdref', 'm-vfd');
  // ---------- Dữ liệu truyền thông
  const pccP = c.pccComm === 'tcp' ? 'Modbus TCP, FLOAT32' : 'Modbus RTU, FLOAT32';
  const rtuDst = c.rtuVia === 'gw' ? 'GW' : 'COM';
  add('PCC_P', 'COM', 'PM-PCC', 'CPU', pccP, 'pccp', c.pccComm === 'tcp' ? 'e-pm' : null);
  add('PCC_U_F', 'COM', 'PM-PCC', 'CPU', pccP, 'pccuf', c.pccComm === 'tcp' ? 'e-pm' : null);
  add('PV_P', 'COM', 'PV-INV', 'CPU', t('sty.tcpMap'), 'pvp', 'e-inv');
  add('PV_PLIM_SET', 'COM', 'CPU', 'PV-INV', t('sty.tcpWrite'), 'pvplim', 'e-inv');
  add('PCS_P_SOC', 'COM', 'PCS', 'CPU', 'Modbus TCP', 'pcspsoc', 'e-pcs');
  add('PCS_PSET', 'COM', 'CPU', 'PCS', t('sty.tcpWrite'), 'pcspset', 'e-pcs');
  add('BMS_LIM', 'COM', 'BMS', 'PCS', t('sty.canVendor'), 'bmslim', 'n-bms');
  add('VFD_DATA', 'COM', 'VFD-M1', 'CPU', 'Modbus TCP', 'vfddata', 'e-vfd');
  add('RL_P', 'COM', 'PM-RL', rtuDst, t('sty.rtuAddr', { a: 11 }), 'rlp', null);
  add('LP_P', 'COM', 'PM-LP', rtuDst, t('sty.rtuAddr', { a: 12 }), 'lpp', null);
  if (c.gen) add('GEN_DATA', 'COM', 'GEN-CTRL', rtuDst, t('sty.rtuAddr', { a: 3 }), 'gendata', null);
  if (c.ev) add('EV_DATA', 'COM', 'EVSE', 'EMS', 'OCPP MeterValues / SetChargingProfile', 'evdata', 'e-ev');
  add('HMI_CMD', 'COM', 'HMI', 'CPU', t('sty.hmiProto'), 'hmicmd', 'e-hmi');
  add('EMS_SET', 'COM', 'EMS', 'CPU', t('sty.emsProto'), 'emsset', 'e-ems');
  if (c.lora) add('ROOM_T', 'COM', 'LORA-S', 'EMS', 'LoRaWAN → MQTT', 'roomt', 'w-lora');
  return S;
};

/* Tiêu thụ 24 VDC ước lượng (A) — giả định để minh họa cách tính, cần thay bằng datasheet. */
SG.auxLoads = function (c, io) {
  const t = SG.t;
  const L = [
    [t('aux.cpu'), 0.4], [t('aux.di', { n: io.mDI }), 0.05 * io.mDI], [t('aux.do', { n: io.mDO }), 0.05 * io.mDO], [t('aux.aio'), 0.1],
    [t('aux.diIn'), 0.005 * io.DI], [t('aux.ka'), 0.02 * io.KA], [t('aux.ks'), 0.1], [t('aux.km'), 0.25],
    [t('aux.sw'), 0.3], ['HMI', 0.6], [t('aux.lamps'), 0.06]
  ];
  if (c.rtuVia === 'module') L.push([t('aux.rs485'), 0.05]);
  if (c.rtuVia === 'gw') L.push([t('aux.gw'), 0.15]);
  if (c.island) L.push([t('aux.dec'), 0.2]);
  if (c.pyr) L.push([t('aux.loop'), 0.02]);
  if (c.lora) L.push([t('aux.lora'), 0.4]);
  return L;
};
