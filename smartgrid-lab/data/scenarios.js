/* KỊCH BẢN VẬN HÀNH
   ph: 0 Điều kiện, 1 Phát hiện, 2 Truyền tín hiệu, 3 Quyết định, 4 Tác động, 5 Phản hồi, 6 HMI.
   s: thay đổi trạng thái mô phỏng (SG.sim.solve tính lại cân bằng công suất ở mỗi bước).
   lock(c): trả về lý do khóa nếu kiến trúc hiện tại không đủ điều kiện. */
SG.phases = ['Điều kiện', 'Phát hiện', 'Truyền tín hiệu', 'Quyết định', 'Tác động', 'Phản hồi xác nhận', 'Hiển thị HMI'];

SG.scenarios = [
{ id: 'pv-surplus', n: 'PV cấp tải, phần dư sạc pin', base: { irr: 0.85, soc: 55, rlOn: 1, m1Run: false, evOn: false, auto: false, batSet: 0 },
  steps: [
    { ph: 0, t: 'Buổi trưa, bức xạ cao. Tải: nhánh ưu tiên + 1 bậc tải điện trở. Pin ở 55 %, chưa nhận setpoint (0 kW).', hl: ['PV-ARR', 'PV-INV', 'LP', 'RL'] },
    { ph: 1, t: 'Đồng hồ PCC đo P_GRID âm: phần PV dư đang chảy ra lưới. Inverter đo P_PV. PCS báo SOC 55 %.', hl: ['PM-PCC', 'CT-PCC', 'm-ct', 'PV-INV', 'PCS'] },
    { ph: 2, t: 'PLC (Modbus TCP client) đọc đồng hồ PCC, inverter và PCS qua switch mỗi 1 s. EMS đọc các giá trị đó từ PLC.', hl: ['e-pm', 'e-inv', 'e-pcs', 'e-cpu', 'e-ems', 'SW', 'CPU', 'EMS'] },
    { ph: 3, t: 'EMS tính: dư = P_PV − P_tải > 0 và SOC < SOC max → setpoint sạc = −min(dư, P_PCS, giới hạn sạc CCL của BMS).', hl: ['EMS', 'CPU'] },
    { ph: 4, t: 'PLC kiểm tra setpoint nằm trong ±P_PCS rồi ghi PCS_PSET qua Modbus TCP. PCS bắt đầu sạc, tôn trọng CCL do BMS gửi qua CAN.', hl: ['e-pcs', 'PCS', 'n-bms', 'BMS', 'BAT'], s: { auto: true } },
    { ph: 5, t: 'PCS báo P_BAT âm (đang sạc); đồng hồ PCC báo P_GRID ≈ 0. Hai phép đo độc lập xác nhận lệnh có hiệu lực.', hl: ['PCS', 'PM-PCC'] },
    { ph: 6, t: 'HMI: mũi tên PV → tải và PV → pin; SOC tăng dần; trạng thái “Sạc”.', hl: ['HMI', 'e-hmi'] }
  ],
  pseudo: `MỖI 1 s:
  du = P_PV - P_TAI
  NẾU du > 0 VÀ SOC < SOC_MAX:
      P_BAT_SET = -MIN(du, P_PCS, CCL_BMS)
  NGƯỢC LẠI NẾU du < 0 VÀ SOC > SOC_MIN:
      P_BAT_SET = MIN(-du, P_PCS, DCL_BMS)
  NGƯỢC LẠI: P_BAT_SET = 0
  GHI PCS_PSET (chỉ khi thay đổi > 0,2 kW — tránh ghi liên tục)`
},
{ id: 'pv-drop', n: 'PV giảm, pin hoặc lưới bù', base: { irr: 0.85, soc: 60, rlOn: 2, auto: true },
  steps: [
    { ph: 0, t: 'Mây che: bức xạ giảm từ 85 % xuống 25 % trong vài giây.', hl: ['PV-ARR'], s: { irr: 0.25 } },
    { ph: 1, t: 'Inverter phát ít hơn ngay lập tức (vật lý). Lưới tự bù chênh lệch tức thời vì lưới là nguồn tham chiếu — P_GRID tăng.', hl: ['PV-INV', 'PM-PCC'], s: { auto: false, batSet: -0 } },
    { ph: 2, t: 'Ở chu kỳ đọc tiếp theo PLC/EMS thấy P_PV giảm, P_GRID dương (nhập).', hl: ['e-inv', 'e-pm', 'CPU', 'EMS'] },
    { ph: 3, t: 'EMS: thiếu = P_tải − P_PV > 0, SOC 60 % > SOC min → xả pin tối đa P_PCS; phần còn lại lấy lưới.', hl: ['EMS'] },
    { ph: 4, t: 'PLC ghi setpoint xả vào PCS.', hl: ['e-pcs', 'PCS'], s: { auto: true } },
    { ph: 5, t: 'PCS báo P_BAT dương; P_GRID giảm về phần thiếu còn lại (nếu tải > PV + P_PCS).', hl: ['PCS', 'PM-PCC'] },
    { ph: 6, t: 'HMI: pin “Xả”, lưới cấp phần còn lại. Không có báo động — đây là vận hành bình thường.', hl: ['HMI'] }
  ],
  note: 'Khi hòa lưới, cân bằng tức thời luôn do LƯỚI đảm bảo; EMS chỉ thay đổi ai cung cấp sau vài giây. Khi đảo, PCS grid-forming phải tự bù tức thời.',
  pseudo: `NẾU P_PV giảm:
  (vật lý) lưới bù ngay
  EMS chu kỳ sau: thieu = P_TAI - P_PV
  NẾU SOC > SOC_MIN: P_BAT_SET = MIN(thieu, P_PCS, DCL)
  P_GRID = thieu - P_BAT  (tự nhiên)`
},
{ id: 'soc-limit', n: 'Pin chạm giới hạn SOC', base: { irr: 0.9, soc: 89.5, rlOn: 0, auto: true },
  steps: [
    { ph: 0, t: 'PV dư, pin đang sạc và SOC sắp tới SOC max.', hl: ['BAT', 'BMS'] },
    { ph: 1, t: 'BMS/PCS báo SOC = SOC max (BMS cũng có thể giảm CCL khi pin gần đầy).', hl: ['BMS', 'n-bms', 'PCS'], s: { soc: 90 } },
    { ph: 2, t: 'PLC đọc SOC từ PCS (Modbus TCP).', hl: ['e-pcs', 'CPU'] },
    { ph: 3, t: 'EMS ngừng sạc. Phần dư chảy ra lưới. Nếu vượt giới hạn phát (hoặc không được phép phát) → EMS phải GIỚI HẠN PV.', hl: ['EMS'] },
    { ph: 4, t: 'PLC ghi PV_PLIM_SET (giới hạn %) vào inverter. Điều này chỉ khả thi khi register map cho phép ghi — hiện “chưa đủ thông tin”.', hl: ['e-inv', 'PV-INV'] },
    { ph: 5, t: 'P_GRID quay về ≥ −giới hạn phát. Inverter báo trạng thái “đang bị giới hạn”.', hl: ['PM-PCC', 'PV-INV'] },
    { ph: 6, t: 'HMI: “Pin đầy — giới hạn PV”. Tối: khi SOC = SOC min, EMS ngừng xả; tải lấy hoàn toàn từ lưới.', hl: ['HMI'], s: { irr: 0, soc: 20, rlOn: 1 } }
  ],
  pseudo: `NẾU SOC >= SOC_MAX: P_BAT_SET = MIN(P_BAT_SET, 0)   // cấm sạc
NẾU SOC <= SOC_MIN: P_BAT_SET = MAX(P_BAT_SET, 0)   // cấm xả
xuat = -P_GRID
NẾU xuat > GIOI_HAN_PHAT: PV_PLIM = P_PV - (xuat - GIOI_HAN_PHAT)`
},
{ id: 'shed', n: 'Tải tăng — sa thải tải không ưu tiên', base: { irr: 0, soc: 20, rlOn: 3, m1Run: true, m1Spd: 100, evOn: true, auto: true },
  steps: [
    { ph: 0, t: 'Buổi tối, pin ở SOC min (không xả được). Tải: ưu tiên + động cơ + 3 bậc điện trở + EV sạc.', hl: ['LP', 'M1', 'RL', 'EVSE'] },
    { ph: 1, t: 'Đồng hồ PCC: P nhập vượt GIỚI HẠN NHẬP do EMS đặt.', hl: ['PM-PCC'] },
    { ph: 2, t: 'PLC đọc P_GRID, lọc 5 s.', hl: ['e-pm', 'CPU'] },
    { ph: 3, t: 'Thứ tự sa thải: (1) giảm EV về dòng tối thiểu qua OCPP, (2) cắt bậc điện trở từ bậc 3 xuống. Tải ưu tiên và động cơ không bị cắt.', hl: ['CPU', 'EMS'] },
    { ph: 4, t: 'EMS gửi giới hạn 6 A cho EVSE (OCPP). PLC bỏ lệnh KM_RL3 → KA nhả → contacteur mở.', hl: ['e-ev', 'EVSE', 'c-do-ka', 'KA', 'c-ka-rl', 'KM-RL'], s: { evA: 6, rlOn: 2 } },
    { ph: 5, t: 'KM_RL3_FB = 0; PM-RL giảm; P_GRID kiểm tra lại. Nếu vẫn vượt → bậc tiếp theo.', hl: ['d-kmrl', 'DI', 'PM-RL'], s: { rlOn: 1 } },
    { ph: 6, t: 'HMI: “Sa thải bậc 3, bậc 2; EV giới hạn 6 A”. Phục hồi khi dư ≥ công suất bậc + 0,5 kW trong 60 s.', hl: ['HMI'] }
  ],
  pseudo: `NẾU P_GRID > GIOI_HAN_NHAP TRONG 5 s:
  NẾU EV_A > 6: EV_A = 6         (OCPP)
  NGƯỢC LẠI NẾU con_bac_RL: tat bac RL cao nhat
  NGƯỢC LẠI: dung EV
NẾU P_GRID < GIOI_HAN_NHAP - (P_BAC + 0,5) TRONG 60 s:
  phuc hoi theo thu tu nguoc lai`
},
{ id: 'motor', n: 'Khởi động / dừng động cơ', base: { irr: 0.5, soc: 60, rlOn: 1, m1Run: false, auto: true },
  steps: [
    { ph: 0, t: 'Người vận hành bấm “Chạy M1” trên HMI. Bộ chọn L/R ở Remote.', hl: ['HMI', 'OP'] },
    { ph: 1, t: 'PLC nhận bit yêu cầu từ HMI.', hl: ['e-hmi', 'CPU'] },
    { ph: 2, t: 'PLC đọc các điều kiện: SEL_REMOTE, KS_OK, QF_M1_OF, KM_M1_FB, VFD_FLT.', hl: ['d-op', 'd-ks', 'd-qfm1', 'd-kmm1', 'd-vfd', 'DI'] },
    { ph: 3, t: 'Tất cả thỏa → cho phép. (Nếu đang đảo: kiểm tra thêm P dự trữ của PCS ≥ P động cơ.)', hl: ['CPU'] },
    { ph: 4, t: 'DO VFD_RUN = 1 → DI1 biến tần; AO 0–10 V đặt tốc độ 100 %. Biến tần tăng tốc theo ramp 5 s (dòng ≈ In, không phải 6–8 In).', hl: ['c-do-vfd', 'm-vfd', 'VFD-M1', 'M1'], s: { m1Run: true, m1Spd: 100 } },
    { ph: 5, t: 'Relay R2 “đang chạy” → VFD_RUN_FB = 1 trong 3 s → xác nhận. Nếu KHÔNG có (ví dụ ngõ vào biến tần cấu hình NPN) → PLC hủy lệnh, báo “M1 không chạy”.', hl: ['d-vfd', 'DI'] },
    { ph: 6, t: 'HMI: “M1 chạy — 100 % — x A”. Dừng: HMI “Dừng” → DO = 0 → biến tần giảm tốc → VFD_RUN_FB = 0. Dừng khẩn: KS cắt STO + KM-M1, không qua PLC.', hl: ['HMI', 'KS', 'c-ks-sto', 'c-ks-km'] }
  ],
  pseudo: `KHI HMI_START_M1:
  NẾU SEL_REMOTE VÀ KS_OK VÀ QF_M1_OF VÀ KM_M1_FB VÀ NOT VFD_FLT
     VÀ (CHE_DO <> DAO OR P_DU_TRU_PCS >= P_M1):
       VFD_RUN := 1; T_FB := 0
  NGƯỢC LẠI: báo "Không đủ điều kiện: <điều kiện thiếu>"
NẾU VFD_RUN VÀ NOT VFD_RUN_FB VÀ T_FB > 3 s:
  VFD_RUN := 0; ALARM "M1 không chạy"`
},
{ id: 'commloss', n: 'Mất truyền thông với đồng hồ hoặc inverter', base: { irr: 0.8, soc: 90, rlOn: 0, auto: true },
  steps: [
    { ph: 0, t: 'Pin đầy, PV đang bị giới hạn để không vượt giới hạn phát. Cáp Ethernet của inverter bị rút.', hl: ['e-inv', 'PV-INV'] },
    { ph: 1, t: 'PLC không nhận trả lời trong timeout (ví dụ 3 lần × 1 s) → cờ COMM_INV_LOST.', hl: ['CPU'], s: { commInv: true } },
    { ph: 2, t: 'Không có tín hiệu nào đi tới inverter được nữa — PLC không thể ghi giới hạn mới.', hl: ['e-inv'] },
    { ph: 3, t: 'Quyết định đã được thiết kế trước: (a) inverter có cấu hình “fallback khi mất truyền thông” (ví dụ về 0 % hoặc giới hạn an toàn) — cần kiểm tra inverter có hỗ trợ; (b) nếu không, PLC có thể mở QF-PV/contacteur — ở kiến trúc này QF-PV không có cơ cấu điều khiển → không thể.', hl: ['PV-INV', 'QF-PV'] },
    { ph: 4, t: 'Mất đồng hồ PCC thay vào đó: EMS mất P_GRID → giữ pin 0 kW (không điều khiển “mù”).', hl: ['PM-PCC', 'e-pm', 'PCS'], s: { commInv: false, commPM: true } },
    { ph: 5, t: 'Phản hồi: giá trị trên HMI chuyển sang trạng thái “không hợp lệ” (không giữ con số cũ như thể còn đúng).', hl: ['HMI'] },
    { ph: 6, t: 'HMI: báo động “Mất truyền thông PM-PCC” với thời điểm; nhật ký ghi lại. Khi phục hồi, EMS trở lại sau 10 s ổn định.', hl: ['HMI'], s: { commPM: false } }
  ],
  pseudo: `CHO MỖI thiết bị:
  NẾU không trả lời 3 lần liên tiếp: COMM_LOST[i] := 1; giá trị := KHÔNG HỢP LỆ
NẾU COMM_LOST[PM_PCC]: P_BAT_SET := 0
NẾU COMM_LOST[INV] VÀ cần giới hạn PV: (dựa vào fallback của inverter) + ALARM`
},
{ id: 'gridloss', n: 'Mất lưới', base: { irr: 0.6, soc: 70, rlOn: 2, m1Run: true, m1Spd: 80, evOn: true, auto: true }, variant: c => (c.island && c.pcsGF && c.ups) ? 'island' : 'blackout',
  steps: [
    { ph: 0, t: 'Lưới mất (sự cố phía điện lực).', hl: ['GRID'] },
    { ph: 1, v: 'island', t: 'Relay tách lưới thấy U/f ngoài ngưỡng trong vài trăm ms (theo cài đặt quy định).', hl: ['RLY-DEC', 'm-dec'] },
    { ph: 1, v: 'blackout', t: 'Inverter PV và PCS (grid-following) phát hiện mất lưới bằng chức năng chống tách đảo và ngừng phát. Thanh cái mất điện.', hl: ['PV-INV', 'PCS'], s: { mode: 'BLACKOUT' } },
    { ph: 2, v: 'island', t: 'Relay ra lệnh TRỰC TIẾP (dây) mở KM-PCC, đồng thời báo DEC_TRIP về PLC. PLC vẫn sống nhờ UPS.', hl: ['c-dec-pcc', 'KM-PCC', 'd-dec', 'DI', 'UPS'] },
    { ph: 2, v: 'blackout', t: c => c.ups ? 'PLC còn sống nhờ UPS và đọc DI/đồng hồ: không có điện áp.' : 'Không có UPS: PLC, HMI, switch cũng mất nguồn — hệ thống không còn điều khiển.', hl: ['PSU', 'CPU'] },
    { ph: 3, v: 'island', t: 'PCS (grid-forming) chuyển sang tạo U/f. PLC: chế độ ĐẢO → giới hạn tải theo P_PCS: cắt EV và bậc tải điện trở; kiểm tra P_M1 + P_ưu tiên ≤ P_PCS.', hl: ['PCS', 'CPU'], s: { mode: 'ISLAND', evOn: false, rlOn: 0 } },
    { ph: 3, v: 'blackout', t: c => c.gen ? 'PLC (nếu có UPS) có thể khởi động máy phát — xem kịch bản 8.' : (!c.pcsGF ? 'Không thể vận hành đảo: PCS grid-following không tạo được lưới.' : (!c.island ? 'Chức năng đảo không được chọn (thiếu KM-PCC/relay tách lưới).' : 'Thiếu UPS cho điều khiển và relay tách lưới.')), hl: ['CPU'] },
    { ph: 4, v: 'island', t: 'Inverter PV thấy lưới (do PCS tạo) ổn định → kết nối lại sau trễ của nó; PCS cân bằng: P_PCS = P_tải − P_PV. PV dư → PCS tăng tần số nhẹ để inverter tự giảm công suất (P(f)) — cần kiểm tra cặp thiết bị hỗ trợ.', hl: ['PV-INV', 'PCS'] },
    { ph: 4, v: 'blackout', t: 'Không có tác động công suất: chờ lưới về.', hl: [] },
    { ph: 5, v: 'island', t: 'KM_PCC_FB = 0 xác nhận đã tách; PCS báo chế độ “grid-forming”; U, f đo bởi PCS.', hl: ['d-kmpcc', 'PCS'] },
    { ph: 5, v: 'blackout', t: 'Không có phản hồi — tải không được cấp.', hl: [] },
    { ph: 6, v: 'island', t: 'HMI: đèn “ĐẢO”, báo “Mất lưới — vận hành đảo”, SOC giảm dần, thời gian còn lại ước tính.', hl: ['HMI', 'OP'] },
    { ph: 6, v: 'blackout', t: c => c.ups ? 'HMI (trên UPS): “Mất lưới — hệ thống dừng”.' : 'HMI tắt. Sau khi có điện lại, nhật ký có thể thiếu thông tin.', hl: ['HMI'] }
  ],
  pseudo: `[Bảo vệ, không qua PLC] RLY_DEC: NẾU U/f ngoài ngưỡng > t: mở KM_PCC
[PLC] KHI DEC_TRIP:
  CHE_DO := DAO
  EV := DUNG; tat moi bac RL
  NẾU P_UU_TIEN + P_M1 > P_PCS: dung M1
  PCS tự chuyển grid-forming (theo cấu hình của PCS)`
},
{ id: 'genstart', n: 'Khởi động máy phát và chuyển nguồn', lock: c => !c.gen ? 'Cấu hình hiện tại không có máy phát (bật ở trang “Chọn thiết bị”).' : (!c.ups ? 'Không có UPS: khi mất lưới PLC mất nguồn nên không thể ra lệnh khởi động/đóng KM-GEN.' : null),
  base: { mode: 'ISLAND', irr: 0.1, soc: 25, rlOn: 0, m1Run: false, evOn: false, auto: true }, variant: c => (c.island && c.pcsGF) ? 'fromisland' : 'fromblackout',
  steps: [
    { ph: 0, v: 'fromisland', t: 'Đang đảo, trời tối, SOC giảm tới SOC min + 5 %.', hl: ['BAT', 'PCS'] },
    { ph: 0, v: 'fromblackout', t: 'Mất lưới, thanh cái không có điện (không có chức năng đảo). PLC sống nhờ UPS.', hl: ['GRID', 'UPS'], s: { mode: 'BLACKOUT' } },
    { ph: 1, t: 'PLC phát hiện điều kiện (SOC thấp hoặc mất lưới > 5 s).', hl: ['CPU'] },
    { ph: 2, t: 'DO GEN_START → KA3 → tiếp điểm khô vào bộ điều khiển máy phát.', hl: ['c-do-ka', 'KA', 'c-ka-gstart', 'GEN-CTRL'] },
    { ph: 3, t: c => 'Máy phát khởi động, ổn định U/f → GEN_READY = 1. PLC kiểm tra khóa liên động: KM_PCC_FB = 0. ' + (c.genSync ? 'Có bộ đồng bộ (giả định): có thể đóng KM-GEN vào thanh cái đang có điện sau khi khớp U, f, góc pha.' : 'KHÔNG có đồng bộ: KHÔNG được đóng máy phát vào thanh cái đang được PCS cấp điện → phải chuyển có gián đoạn.'), hl: ['d-gen', 'DI', 'd-kmpcc'] },
    { ph: 4, t: c => c.genSync ? 'Đồng bộ → đóng KM-GEN; PCS chuyển grid-following và sạc pin.' : 'PCS ngừng tạo lưới (thanh cái mất điện ~1–2 s) → đóng KM-GEN trên thanh cái chết → PCS khởi động lại ở grid-following, sạc pin.', hl: ['c-ka-gen', 'KM-GEN', 'PCS'], s: { mode: 'GEN' } },
    { ph: 5, t: 'KM_GEN_FB = 1; GEN_DATA (RS485) báo P, U, f. PLC giới hạn PV để máy phát không dưới tải tối thiểu và không bị công suất ngược.', hl: ['d-kmgen', 'GEN-CTRL', 'PV-INV'] },
    { ph: 6, t: 'HMI: “Đang chạy máy phát”, giờ chạy, mức nhiên liệu (nếu có).', hl: ['HMI'] }
  ],
  note: 'Song song máy phát–lưới bị KHÓA trong kiến trúc này: cần bộ đồng bộ, bảo vệ công suất ngược (32), bảo vệ tách lưới riêng cho máy phát và thỏa thuận với đơn vị điện lực.',
  pseudo: `NẾU (CHE_DO = DAO VÀ SOC <= SOC_MIN + 5) HOẶC (MAT_LUOI > 5 s VÀ khong_dao):
  GEN_START := 1
KHI GEN_READY VÀ NOT KM_PCC_FB:
  NẾU co_dong_bo: cho SYNC_OK; KM_GEN := 1
  NGƯỢC LẠI: PCS_STOP; cho thanh_cai_chet; KM_GEN := 1; PCS_START(GFL)
KHÓA: KM_GEN và KM_PCC không bao giờ = 1 cùng lúc (cơ khí + điện + PLC)`
},
{ id: 'gridback', n: 'Lưới phục hồi', base: { mode: 'ISLAND', irr: 0.5, soc: 50, rlOn: 0, auto: true },
  steps: [
    { ph: 0, t: 'Điện áp lưới trở lại phía lưới của KM-PCC.', hl: ['GRID'] },
    { ph: 1, t: c => c.island ? 'Relay tách lưới đo U/f phía lưới trong ngưỡng liên tục trong thời gian chờ (theo quy định — ví dụ vài chục giây đến vài phút, cần kiểm chứng).' : 'Đồng hồ PCC đo lại điện áp.', hl: ['RLY-DEC', 'm-dec', 'PM-PCC'] },
    { ph: 2, t: 'DEC_TRIP trở về bình thường → PLC.', hl: ['d-dec', 'DI'] },
    { ph: 3, t: c => c.pcsResync ? 'PCS hỗ trợ đồng bộ lại (giả định): PCS điều chỉnh U/f/góc pha khớp lưới rồi cho phép đóng KM-PCC — không gián đoạn.' : 'PCS không đồng bộ lại được (hoặc chưa xác minh) → chuyển có gián đoạn: dừng PCS, thanh cái chết, đóng KM-PCC, PCS khởi động lại grid-following.', hl: ['PCS', 'CPU'] },
    { ph: 4, t: c => c.gen ? 'Nếu đang chạy máy phát: mở KM-GEN → kiểm tra KM_GEN_FB = 0 → đóng KM-PCC → máy phát chạy làm mát rồi dừng.' : 'PLC đóng KM-PCC qua KA1.', hl: ['c-ka-pcc', 'KM-PCC', 'KM-GEN'], s: { mode: 'GRID' } },
    { ph: 5, t: 'KM_PCC_FB = 1; đồng hồ PCC đo P_GRID. Inverter PV kết nối lại sau trễ riêng của nó.', hl: ['d-kmpcc', 'PM-PCC'] },
    { ph: 6, t: 'HMI: đèn “Lưới”, tải không ưu tiên được phục hồi lần lượt.', hl: ['HMI'], s: { rlOn: 2 } }
  ],
  pseudo: `NẾU LUOI_OK liên tục >= T_CHO:
  NẾU CHE_DO = MAY_PHAT: KM_GEN := 0; cho KM_GEN_FB = 0
  NẾU CHE_DO = DAO VÀ NOT PCS_RESYNC: PCS_STOP
  KM_PCC := 1  (chỉ khi KM_GEN_FB = 0)
  phuc hoi tai theo thu tu`
},
{ id: 'fault', n: 'Sự cố trên một nhánh và cô lập', base: { irr: 0.6, soc: 60, rlOn: 2, auto: true },
  steps: [
    { ph: 0, t: 'Ngắn mạch trên cáp tới bàn tải điện trở.', hl: ['RL', 'p-rl4'] },
    { ph: 1, t: 'Bộ cắt từ của QF-RL phát hiện dòng sự cố (gấp nhiều lần In).', hl: ['QF-RL'] },
    { ph: 2, t: 'KHÔNG qua PLC: bảo vệ nằm trong chính máy cắt, tác động trong vài ms.', hl: ['QF-RL'] },
    { ph: 3, t: 'Phối hợp chọn lọc: chỉ QF-RL cắt, QF0 giữ (cần kiểm tra bảng chọn lọc của hãng). Khi ĐẢO: dòng ngắn mạch do PCS giới hạn (thường chỉ 1–2 × In) → bộ cắt từ có thể KHÔNG tác động — bảo vệ khi đảo phải được kiểm chứng riêng.', hl: ['QF-RL', 'QF0', 'PCS'] },
    { ph: 4, t: 'QF-RL mở → nhánh bị cô lập. Phần còn lại vẫn vận hành.', hl: ['QF-RL'], s: { rlFault: true } },
    { ph: 5, t: 'Tiếp điểm SD → QF_RL_SD = 1 → PLC. PLC khóa lệnh KM-RL (không đóng lại tự động).', hl: ['d-qfrl', 'DI', 'CPU'] },
    { ph: 6, t: 'HMI: báo động “QF-RL trip”. Người vận hành kiểm tra, sửa, đóng lại QF-RL TẠI CHỖ, rồi giải trừ báo động.', hl: ['HMI'] }
  ],
  pseudo: `[Bảo vệ] QF-RL tự cắt khi I > ngưỡng từ (không phần mềm)
[PLC] KHI QF_RL_SD:
  KM_RL_CMD[*] := 0; KHOA_RL := 1; ALARM
  KHOA_RL chỉ giải trừ khi QF_RL_SD = 0 VÀ PB_RESET`
},
{ id: 'parallel', n: 'Vận hành song song máy phát–lưới', lock: () => 'Bị khóa trong kiến trúc tham chiếu: cần bộ hòa đồng bộ (ANSI 25), bảo vệ công suất ngược (32), bảo vệ tách lưới cho máy phát, bộ điều khiển chia tải, và thỏa thuận đấu nối với đơn vị điện lực. Mô hình chỉ cho phép chuyển nguồn (KM-PCC và KM-GEN khóa liên động).', steps: [], pseudo: '' }
];
