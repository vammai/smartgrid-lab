/* BẢNG I/O — sinh theo cấu hình. io: DI | DO | AI | AO | COM.
   fail = trạng thái/hành vi khi lỗi (đứt dây, mất nguồn, mất truyền thông). link = id kết nối trên sơ đồ. */
SG.signals = function (c) {
  const S = [];
  const add = (o) => S.push(o);
  const contact = 'Tiếp điểm khô NO → 24 VDC';
  const nc = 'Tiếp điểm khô NC → 24 VDC (fail-safe)';
  // ---------- DI
  add({ code: 'QF0_OF', io: 'DI', src: 'QF0', dst: 'DI', type: contact, func: 'Máy cắt tổng đang đóng', fail: 'Đứt dây → đọc “mở”. PLC so với dòng đo tại PCC để báo bất nhất.', link: 'd-qf0' });
  add({ code: 'QF0_SD', io: 'DI', src: 'QF0', dst: 'DI', type: contact, func: 'Máy cắt tổng đã trip do sự cố', fail: 'Đứt dây không phát hiện được (tiếp điểm NO) — chấp nhận vì chỉ là báo động.', link: 'd-qf0' });
  if (c.island || c.gen) add({ code: 'KM_PCC_FB', io: 'DI', src: 'KM-PCC', dst: 'DI', type: contact, func: 'KM-PCC đã đóng (phản hồi thật)', fail: 'Lệnh = 1 mà phản hồi = 0 sau 1 s → báo “KM-PCC không đóng”, khóa đóng KM-GEN.', link: 'd-kmpcc' });
  if (c.island) {
    add({ code: 'DEC_TRIP', io: 'DI', src: 'RLY-DEC', dst: 'DI', type: nc, func: 'Relay tách lưới đã tác động (mở = trip)', fail: 'Đứt dây = đọc trip → PLC coi như mất lưới (an toàn).', link: 'd-dec' });
    add({ code: 'DEC_FLT', io: 'DI', src: 'RLY-DEC', dst: 'DI', type: nc, func: 'Relay tách lưới lỗi nội bộ (watchdog)', fail: 'Đứt dây/mất nguồn relay = báo lỗi → cấm đóng KM-PCC.', link: 'd-dec' });
  }
  if (c.gen) {
    add({ code: 'KM_GEN_FB', io: 'DI', src: 'KM-GEN', dst: 'DI', type: contact, func: 'KM-GEN đã đóng', fail: 'Bất nhất lệnh/phản hồi → báo động, cấm đóng KM-PCC.', link: 'd-kmgen' });
    add({ code: 'GEN_READY', io: 'DI', src: 'GEN-CTRL', dst: 'DI', type: contact, func: 'Máy phát chạy ổn định, U/f trong dải', fail: 'Không có → không đóng KM-GEN.', link: 'd-gen' });
    add({ code: 'GEN_ALM', io: 'DI', src: 'GEN-CTRL', dst: 'DI', type: nc, func: 'Báo động chung máy phát', fail: 'Đứt dây = báo động.', link: 'd-gen' });
  }
  add({ code: 'QF_PV_SD', io: 'DI', src: 'QF-PV', dst: 'DI', type: contact, func: 'Nhánh PV trip', fail: '—', link: 'd-qfpv' });
  add({ code: 'QF_BAT_SD', io: 'DI', src: 'QF-BAT', dst: 'DI', type: contact, func: 'Nhánh pin trip', fail: '—', link: 'd-qfbat' });
  add({ code: 'QF_M1_OF', io: 'DI', src: 'QF-M1', dst: 'DI', type: contact, func: 'Máy cắt động cơ đóng (điều kiện cho phép chạy)', fail: 'Đứt dây → không cho chạy (an toàn).', link: 'd-qfm1' });
  add({ code: 'KM_M1_FB', io: 'DI', src: 'KM-M1', dst: 'DI', type: contact, func: 'Contacteur nguồn biến tần đóng', fail: 'Không có → không cho chạy.', link: 'd-kmm1' });
  add({ code: 'VFD_RUN_FB', io: 'DI', src: 'VFD-M1', dst: 'DI', type: 'Relay R2 NO → 24 VDC', func: 'Biến tần đang chạy (phản hồi)', fail: 'Lệnh chạy mà không có phản hồi sau 3 s → báo “M1 không chạy”.', link: 'd-vfd' });
  add({ code: 'VFD_FLT', io: 'DI', src: 'VFD-M1', dst: 'DI', type: 'Relay R1 NC → 24 VDC (fail-safe)', func: 'Biến tần lỗi', fail: 'Đứt dây = lỗi → không cho chạy.', link: 'd-vfd' });
  add({ code: 'QF_RL_SD', io: 'DI', src: 'QF-RL', dst: 'DI', type: contact, func: 'Nhánh tải điện trở trip (sự cố)', fail: '—', link: 'd-qfrl' });
  for (let i = 1; i <= c.rlSteps; i++) add({ code: 'KM_RL' + i + '_FB', io: 'DI', src: 'KM-RL', dst: 'DI', type: contact, func: 'Bậc tải ' + i + ' đóng', fail: 'Bất nhất → báo động, coi bậc là “đang tiêu thụ” khi tính sa thải.', link: 'd-kmrl' });
  add({ code: 'QF_LP_SD', io: 'DI', src: 'QF-LP', dst: 'DI', type: contact, func: 'Nhánh ưu tiên trip', fail: '—', link: 'd-qflp' });
  if (c.ev) add({ code: 'QF_EV_SD', io: 'DI', src: 'QF-EV', dst: 'DI', type: contact, func: 'Nhánh EV trip', fail: '—', link: 'd-qfev' });
  add({ code: 'SPD_ALM', io: 'DI', src: 'SPD', dst: 'DI', type: nc, func: 'Chống sét cần thay', fail: 'Đứt dây = báo.', link: 'd-spd' });
  add({ code: 'PSU_OK', io: 'DI', src: 'PSU', dst: 'DI', type: 'DC-OK relay NO', func: 'Bộ nguồn 24 V bình thường', fail: 'Mất = báo (khi có UPS, PLC vẫn sống để báo).', link: 'd-psu' });
  if (c.ups) {
    add({ code: 'UPS_ONBAT', io: 'DI', src: 'UPS', dst: 'DI', type: contact, func: 'Điều khiển đang chạy bằng ắc quy UPS', fail: '—', link: 'd-ups' });
    add({ code: 'UPS_LOW', io: 'DI', src: 'UPS', dst: 'DI', type: contact, func: 'Ắc quy UPS yếu → chuẩn bị dừng có kiểm soát', fail: '—', link: 'd-ups' });
  }
  add({ code: 'KS_OK', io: 'DI', src: 'KS', dst: 'DI', type: 'Ngõ ra báo (không an toàn)', func: 'Mạch an toàn bình thường (không dừng khẩn)', fail: 'Chỉ để hiển thị; chức năng an toàn KHÔNG phụ thuộc DI này.', link: 'd-ks' });
  add({ code: 'SEL_AUTO', io: 'DI', src: 'OP', dst: 'DI', type: contact, func: 'Bộ chọn Auto (1) / Manu (0)', fail: 'Đứt dây → Manu (an toàn hơn).', link: 'd-op' });
  add({ code: 'SEL_REMOTE', io: 'DI', src: 'OP', dst: 'DI', type: contact, func: 'Bộ chọn Remote (1) / Local (0)', fail: 'Đứt dây → Local: HMI/EMS không ra lệnh được.', link: 'd-op' });
  add({ code: 'PB_START_M1', io: 'DI', src: 'OP', dst: 'DI', type: contact, func: 'Nút chạy M1 (Local)', fail: '—', link: 'd-op' });
  add({ code: 'PB_STOP_M1', io: 'DI', src: 'OP', dst: 'DI', type: nc, func: 'Nút dừng M1 (Local)', fail: 'Đứt dây = dừng (fail-safe).', link: 'd-op' });
  add({ code: 'PB_RESET', io: 'DI', src: 'OP', dst: 'DI', type: contact, func: 'Giải trừ báo động', fail: '—', link: 'd-op' });
  // ---------- DO
  const viaKA = c.useKA ? ' → KA' : ' (trực tiếp)';
  if (c.island || c.gen) add({ code: 'KM_PCC_CMD', io: 'DO', src: 'DO', dst: 'KM-PCC', type: c.doType === 'transistor' ? 'Transistor 24 VDC' + viaKA + '1 → cuộn 230 VAC' : 'Relay', func: 'Đóng contacteur đấu nối lưới', fail: 'PLC dừng/mất 24 V → KM-PCC MỞ (tách lưới). Đây là lựa chọn ưu tiên an toàn; nếu cần giữ lưới khi PLC lỗi phải dùng cơ cấu khác — cần phân tích.', link: 'c-ka-pcc' });
  if (c.gen) {
    add({ code: 'KM_GEN_CMD', io: 'DO', src: 'DO', dst: 'KM-GEN', type: 'Transistor 24 VDC' + viaKA + '2 → cuộn 230 VAC', func: 'Đóng contacteur máy phát', fail: 'Mất lệnh → KM-GEN mở.', link: 'c-ka-gen' });
    add({ code: 'GEN_START', io: 'DO', src: 'DO', dst: 'GEN-CTRL', type: 'Transistor 24 VDC → KA3 tiếp điểm khô', func: 'Yêu cầu khởi động máy phát', fail: 'Mất lệnh → máy phát dừng sau thời gian làm mát.', link: 'c-ka-gstart' });
  }
  if (c.remoteBreaker) add({ code: 'QF0_MX', io: 'DO', src: 'DO', dst: 'QF0', type: 'Transistor 24 VDC → KA4 → cuộn MX', func: 'Cắt máy cắt tổng từ xa (chỉ cắt)', fail: 'Mất lệnh → KHÔNG cắt (MX cần năng lượng). Muốn fail-safe dùng MN.', link: 'c-ka-mx' });
  add({ code: 'VFD_RUN', io: 'DO', src: 'DO', dst: 'VFD-M1', type: 'Transistor PNP 24 VDC → DI biến tần', func: 'Lệnh chạy động cơ', fail: 'Mất lệnh → biến tần dừng theo ramp.', link: 'c-do-vfd' });
  add({ code: 'VFD_RST', io: 'DO', src: 'DO', dst: 'VFD-M1', type: 'Transistor PNP 24 VDC', func: 'Reset lỗi biến tần (xung)', fail: '—', link: 'c-do-vfd' });
  for (let i = 1; i <= c.rlSteps; i++) add({ code: 'KM_RL' + i + '_CMD', io: 'DO', src: 'DO', dst: 'KM-RL', type: 'Transistor 24 VDC' + viaKA + (4 + i) + ' → cuộn 230 VAC', func: 'Đóng bậc tải ' + i + ' (sa thải = mở)', fail: 'Mất lệnh → bậc tải cắt (an toàn cho cân bằng).', link: 'c-ka-rl' });
  add({ code: 'H_GRID', io: 'DO', src: 'DO', dst: 'OP', type: 'Transistor 24 VDC → đèn LED', func: 'Đèn: đang hòa lưới', fail: '—', link: 'c-do-op' });
  add({ code: 'H_ISLAND', io: 'DO', src: 'DO', dst: 'OP', type: 'Transistor 24 VDC → đèn LED', func: 'Đèn: vận hành đảo / máy phát', fail: '—', link: 'c-do-op' });
  add({ code: 'H_ALARM', io: 'DO', src: 'DO', dst: 'OP', type: 'Transistor 24 VDC → đèn LED', func: 'Đèn: báo động (nháy = chưa xác nhận)', fail: '—', link: 'c-do-op' });
  // ---------- AI / AO
  if (c.pyr) add({ code: 'PYR_IRR', io: 'AI', src: 'PYR', dst: 'AIO', type: '4–20 mA 2 dây', func: 'Bức xạ 0–1500 W/m²', fail: '< 3,6 mA → đứt dây, giá trị không hợp lệ, EMS bỏ qua tính PR.', link: 'm-pyr' });
  if (c.cabtemp) add({ code: 'CAB_TEMP', io: 'AI', src: 'BT-CAB', dst: 'AIO', type: 'Pt100 3 dây', func: 'Nhiệt độ tủ', fail: 'Ngoài dải → lỗi cảm biến, báo động.', link: 'm-cab' });
  add({ code: 'VFD_SPD_REF', io: 'AO', src: 'AIO', dst: 'VFD-M1', type: '0–10 V', func: 'Đặt tốc độ 0–100 %', fail: 'Mất tín hiệu (0 V) → tốc độ 0 — không phân biệt với đứt dây (nhược điểm 0–10 V).', link: 'm-vfd' });
  // ---------- Dữ liệu truyền thông
  const pccP = c.pccComm === 'tcp' ? 'Modbus TCP, FLOAT32' : 'Modbus RTU, FLOAT32';
  add({ code: 'PCC_P', io: 'COM', src: 'PM-PCC', dst: 'CPU', type: pccP, func: 'Công suất lưới có dấu (kW), +nhập/−phát', fail: 'Timeout > 3 s → không hợp lệ; EMS giữ pin 0 kW và giới hạn PV nếu không được phát.', link: c.pccComm === 'tcp' ? 'e-pm' : null });
  add({ code: 'PCC_U_F', io: 'COM', src: 'PM-PCC', dst: 'CPU', type: pccP, func: 'U pha, f tại PCC', fail: 'Như trên.', link: c.pccComm === 'tcp' ? 'e-pm' : null });
  add({ code: 'PV_P', io: 'COM', src: 'PV-INV', dst: 'CPU', type: 'Modbus TCP (register map cần kiểm tra)', func: 'Công suất PV AC (kW), trạng thái', fail: 'Timeout → giá trị cuối + cờ lỗi; ước lượng từ cân bằng.', link: 'e-inv' });
  add({ code: 'PV_PLIM_SET', io: 'COM', src: 'CPU', dst: 'PV-INV', type: 'Modbus TCP ghi (FC06/16)', func: 'Giới hạn công suất PV (%)', fail: 'Inverter cần cấu hình timeout → về giá trị dự phòng (ví dụ 0 % khi không được phát).', link: 'e-inv' });
  add({ code: 'PCS_P_SOC', io: 'COM', src: 'PCS', dst: 'CPU', type: 'Modbus TCP', func: 'Công suất pin (kW, +xả), SOC (%), chế độ', fail: 'Timeout → EMS dừng setpoint; PCS về chế độ dự phòng của nó.', link: 'e-pcs' });
  add({ code: 'PCS_PSET', io: 'COM', src: 'CPU', dst: 'PCS', type: 'Modbus TCP ghi', func: 'Setpoint công suất pin', fail: 'Watchdog PCS: không nhận setpoint mới → 0 kW (cần cấu hình).', link: 'e-pcs' });
  add({ code: 'BMS_LIM', io: 'COM', src: 'BMS', dst: 'PCS', type: 'CAN (giao thức hãng)', func: 'CVL, CCL, DCL, SOC, báo động', fail: 'Mất CAN → PCS dừng sạc/xả (bảo vệ pin).', link: 'n-bms' });
  add({ code: 'VFD_DATA', io: 'COM', src: 'VFD-M1', dst: 'CPU', type: 'Modbus TCP', func: 'Tốc độ, dòng, công suất, mã lỗi', fail: 'Chỉ giám sát; điều khiển vẫn qua dây.', link: 'e-vfd' });
  add({ code: 'RL_P', io: 'COM', src: 'PM-RL', dst: c.rtuVia === 'gw' ? 'GW' : 'COM', type: 'Modbus RTU (đ/c 11)', func: 'Công suất nhánh tải điện trở', fail: 'Timeout → ước tính = số bậc × công suất bậc (cờ “ước tính”).', link: null });
  add({ code: 'LP_P', io: 'COM', src: 'PM-LP', dst: c.rtuVia === 'gw' ? 'GW' : 'COM', type: 'Modbus RTU (đ/c 12)', func: 'Công suất tải ưu tiên', fail: 'Timeout → ước tính từ cân bằng (kém tin cậy).', link: null });
  if (c.gen) add({ code: 'GEN_DATA', io: 'COM', src: 'GEN-CTRL', dst: c.rtuVia === 'gw' ? 'GW' : 'COM', type: 'Modbus RTU (đ/c 3)', func: 'P, U, f, giờ chạy máy phát', fail: 'Điều khiển vẫn dựa vào GEN_READY (dây).', link: null });
  if (c.ev) add({ code: 'EV_DATA', io: 'COM', src: 'EVSE', dst: 'EMS', type: 'OCPP MeterValues / SetChargingProfile', func: 'Công suất sạc; giới hạn dòng', fail: 'Mất kết nối → trạm dùng giới hạn mặc định cấu hình sẵn (cần đặt thấp).', link: 'e-ev' });
  add({ code: 'HMI_CMD', io: 'COM', src: 'HMI', dst: 'CPU', type: 'Modbus TCP / giao thức hãng', func: 'Lệnh vận hành (chạy M1, bậc tải, chế độ)', fail: 'Mất HMI → nút cứng ở chế độ Local vẫn dùng được.', link: 'e-hmi' });
  add({ code: 'EMS_SET', io: 'COM', src: 'EMS', dst: 'CPU', type: 'Modbus TCP (PLC là server)', func: 'Setpoint pin, giới hạn PV, chế độ', fail: 'Nhịp sống EMS mất 10 s → PLC dùng logic dự phòng cục bộ.', link: 'e-ems' });
  if (c.lora) add({ code: 'ROOM_T', io: 'COM', src: 'LORA-S', dst: 'EMS', type: 'LoRaWAN → MQTT', func: 'Nhiệt độ, độ ẩm phòng', fail: 'Chỉ giám sát; không dùng điều khiển.', link: 'w-lora' });
  return S;
};

/* Tiêu thụ 24 VDC ước lượng (A) — giả định để minh họa cách tính, cần thay bằng datasheet. */
SG.auxLoads = function (c, io) {
  const L = [
    ['CPU PLC', 0.4], ['Module DI × ' + io.mDI, 0.05 * io.mDI], ['Module DO × ' + io.mDO + ' (logic)', 0.05 * io.mDO], ['Module AI/AO', 0.1],
    ['Ngõ vào DI (≈ 5 mA/kênh đang ON)', 0.005 * io.DI], ['Cuộn KA (≈ 20 mA × số KA)', 0.02 * io.KA], ['Relay an toàn', 0.1], ['Cuộn KM-M1 24 VDC (giữ)', 0.25],
    ['Switch Ethernet', 0.3], ['HMI', 0.6], ['Đèn báo × 3', 0.06]
  ];
  if (c.rtuVia === 'module') L.push(['Module RS485', 0.05]);
  if (c.rtuVia === 'gw') L.push(['Gateway', 0.15]);
  if (c.island) L.push(['Relay tách lưới', 0.2]);
  if (c.pyr) L.push(['Vòng 4–20 mA', 0.02]);
  if (c.lora) L.push(['Gateway LoRaWAN', 0.4]);
  return L;
};
