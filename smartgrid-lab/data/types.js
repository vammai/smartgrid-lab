/* LOẠI THIẾT BỊ — kiến thức chung cho mọi thiết bị cùng loại.
   Thông số: k = khóa (khớp với spec của thiết bị trong devices.js), n = tên, m = ý nghĩa, u = đơn vị,
   i = ảnh hưởng tới lựa chọn, h = cách xác định, e = ví dụ minh họa, c = điều cần kiểm tra, adv = chỉ hiện ở chế độ Chi tiết.
   Không có mã sản phẩm hay thông số thương mại nào ở đây: mọi ví dụ hãng chỉ là DÒNG SẢN PHẨM để tra cứu, cần kiểm tra datasheet. */
SG.types = {

grid: {
  name: 'Lưới điện công cộng', fr: 'Réseau public de distribution', sym: '—', group: 'Nguồn',
  func: 'Nguồn tham chiếu điện áp và tần số khi hòa lưới; nhận hoặc cấp phần công suất chênh lệch giữa nguồn nội bộ và tải.',
  principle: 'Lưới có công suất ngắn mạch lớn so với mô hình nên giữ U và f gần như cố định. Inverter bám lưới (grid-following) dựa vào tham chiếu này.',
  notdo: 'Không đảm bảo liên tục: khi mất lưới, mọi nguồn grid-following phải ngừng phát.',
  confusions: [['PCC', 'Lưới là nguồn bên ngoài; {{pcc|PCC}} là điểm ranh giới nơi bạn đo và tách.']],
  ports: { power: 'Đầu cáp cấp nguồn 3P+N (+PE tùy {{slt|sơ đồ nối đất}}).' },
  accessories: ['Thỏa thuận đấu nối và yêu cầu kỹ thuật của đơn vị điện lực khi có nguồn phát nối lưới.'],
  compat: ['Điện áp/số pha/tần số danh định.', 'Dòng ngắn mạch tại PCC ({{icu|Icc}}) — do điện lực cung cấp.', 'Công suất đấu nối/hợp đồng.', 'Có được phép phát lên lưới không, giới hạn bao nhiêu.'],
  params: [
    { k: 'U', n: 'Điện áp danh định', m: 'Điện áp dây (pha–pha) và pha (pha–trung tính).', u: 'V', i: 'Quyết định định mức của mọi thiết bị nối vào thanh cái.', h: 'Theo lưới nơi lắp đặt.', e: '400 V pha–pha / 230 V pha–N, 3P+N.', c: 'Dung sai cho phép của lưới (ví dụ ±10 %).' },
    { k: 'f', n: 'Tần số', m: 'Tần số danh định.', u: 'Hz', i: 'Thiết bị phải định mức đúng 50 hoặc 60 Hz.', h: 'Theo lưới.', e: '50 Hz.', c: 'Dải tần mà inverter/relay tách lưới chấp nhận.' },
    { k: 'S', n: 'Công suất đấu nối', m: 'Công suất tối đa được phép lấy từ lưới.', u: 'kVA', i: 'Giới hạn nhập lưới → cần sa thải tải nếu vượt.', h: 'Hợp đồng/công tơ.', e: '36 kVA (giả định).', c: 'Giới hạn phát lên lưới nếu có.' },
    { k: 'Icc', n: 'Dòng ngắn mạch tại PCC', m: 'Dòng sự cố lớn nhất có thể xuất hiện tại điểm đấu nối.', u: 'kA', i: 'Quyết định khả năng cắt (Icu/Ics) của máy cắt tổng và các máy cắt phía sau.', h: 'Hỏi đơn vị điện lực hoặc tính từ máy biến áp và cáp.', e: 'Chưa có dữ liệu — để trống có chủ đích.', c: 'Không được giả định; thiếu giá trị này thì chưa thể kết luận máy cắt phù hợp.' }
  ],
  example: {
    ok: { t: 'Hợp đồng 36 kVA 3P', d: 'Đủ cho tổng tải tối đa ≈ 17 kW kể cả EV, còn dự trữ khi pin sạc 5 kW cùng lúc.' },
    ko: { t: 'Đấu nối 1 pha 9 kVA', d: 'Không cấp được động cơ 3 pha, máy phát 3 pha và PCS 3 pha của kiến trúc tham chiếu; phải đổi toàn bộ thiết kế sang 1 pha.' }
  }
},

isect: {
  name: 'Cầu dao cắt tải – cách ly', fr: 'Interrupteur-sectionneur', sym: 'QS', group: 'Đóng cắt & bảo vệ',
  func: 'Cách ly toàn bộ hệ thống khỏi lưới để làm việc an toàn (khóa bằng ổ khóa – consignation) và đóng/cắt được khi có tải bình thường.',
  principle: 'Tiếp điểm cơ khí có khoảng cách ly đủ lớn và chỉ thị vị trí tin cậy (“positive break indication”). Cơ cấu thao tác tay, thường có tay xoay khóa được.',
  notdo: 'Không phát hiện và không tự cắt quá tải hay ngắn mạch. Không điều khiển từ xa (trừ loại có motor).',
  confusions: [['Disjoncteur', 'Disjoncteur tự cắt khi sự cố; interrupteur-sectionneur thì không.'], ['Sectionneur', 'Sectionneur thuần không được thao tác khi có dòng; interrupteur-sectionneur thì được (theo loại sử dụng AC-22/AC-23).']],
  ports: { power: 'Đầu vào/đầu ra công suất 4 cực (3P+N).', ctrl: 'Tùy chọn: tiếp điểm phụ báo vị trí.' },
  accessories: ['Tay xoay khóa được bằng ổ khóa (consignation).', 'Tiếp điểm phụ nếu PLC cần biết vị trí.', 'Nắp che đầu cực.'],
  compat: ['Dòng định mức ≥ dòng tối đa.', 'Số cực (cắt cả trung tính tùy {{slt|sơ đồ nối đất}}).', 'Chịu được dòng ngắn mạch ngắn hạn (Icw) hoặc được bảo vệ bởi thiết bị phía trước.'],
  params: [
    { k: 'Ie', n: 'Dòng định mức sử dụng', m: 'Dòng tải mà thiết bị đóng cắt được liên tục.', u: 'A', i: 'Phải ≥ Ib của toàn hệ thống.', h: 'Ib tính từ công suất đấu nối.', e: '63 A (sơ bộ cho 36 kVA ≈ 52 A).', c: 'Loại sử dụng AC-22A/AC-23A.' },
    { k: 'poles', n: 'Số cực', m: 'Số dây được cắt.', u: 'P', i: '4P nếu cắt cả N.', h: 'Theo sơ đồ nối đất và quy định.', e: '4P.', c: 'Yêu cầu cắt trung tính theo quy định áp dụng.' },
    { k: 'Icw', n: 'Dòng chịu ngắn hạn', m: 'Dòng ngắn mạch chịu được trong thời gian ngắn mà không hỏng.', u: 'kA', i: 'Phối hợp với thiết bị bảo vệ phía trước.', h: 'Theo Icc tại PCC và bảng phối hợp.', e: 'Cần kiểm tra datasheet.', c: 'Bảng phối hợp với cầu chì/máy cắt phía trước.', adv: true }
  ],
  example: {
    ok: { t: 'Interrupteur-sectionneur 4P 63 A, tay xoay khóa được', d: 'Cách ly toàn tủ khi bảo trì; Ib ≈ 52 A < 63 A.' },
    ko: { t: 'Sectionneur-fusible không có khả năng cắt tải', d: 'Nếu người vận hành mở khi có tải sẽ phát hồ quang — chỉ chấp nhận nếu có quy trình cắt tải trước và khóa liên động.' }
  },
  brands: 'Ví dụ dòng sản phẩm để tra cứu: Schneider Acti9 iSW / Compact INS, ABB OT, Socomec Sirco… — cần kiểm tra datasheet.'
},

breaker: {
  name: 'Máy cắt hạ áp', fr: 'Disjoncteur', sym: 'QF', group: 'Đóng cắt & bảo vệ',
  func: 'Bảo vệ cáp và thiết bị phía sau chống quá tải và ngắn mạch bằng cách TỰ cắt; cho phép đóng/cắt tay.',
  principle: 'Bộ cắt nhiệt (hoặc điện tử, long-time) phản ứng với quá tải theo thời gian; bộ cắt từ (instantaneous) phản ứng tức thời với ngắn mạch. Buồng dập hồ quang dập tắt dòng.',
  notdo: 'Không dùng cho đóng cắt thường xuyên (tuổi thọ cơ khí thấp hơn contacteur). Không tự đóng lại. Không có cổng truyền thông ≠ điều khiển được từ xa: đóng từ xa cần bộ truyền động động cơ.',
  confusions: [['Contacteur', 'Contacteur đóng cắt hàng trăm nghìn lần theo lệnh nhưng không tự bảo vệ.'], ['Relay bảo vệ', 'Relay chỉ đo và ra lệnh; máy cắt là phần tử cắt dòng.'], ['RCD', 'Bảo vệ dòng rò là chức năng khác; có thể tích hợp (RCBO) hoặc gắn khối Vigi.']],
  ports: { power: 'Đầu vào (line) và đầu ra (load) theo số cực.', ctrl: 'Tùy phụ kiện: OF (trạng thái), SD (báo trip), MX/MN (cắt từ xa), motor (đóng/cắt từ xa).', comm: 'Một số dòng máy cắt điện tử có module truyền thông — chỉ đọc dữ liệu/trạng thái, không tự cho phép đóng từ xa.' },
  accessories: ['{{of_sd|Tiếp điểm OF}} để PLC biết đóng/mở.', '{{of_sd|Tiếp điểm SD}} để phân biệt “mở bằng tay” với “bị trip”.', '{{mx_mn|Cuộn MX}} nếu cần cắt từ xa (relay tách lưới, dừng khẩn).', '{{motor_op|Bộ truyền động động cơ}} nếu cần ĐÓNG từ xa.', 'Khối {{ddr|RCD}} hoặc dùng RCBO khi cần bảo vệ dòng rò.'],
  compat: ['In ≥ Ib và phối hợp với Iz của cáp ({{in_ib_iz|Ib ≤ In ≤ Iz}}).', 'Khả năng cắt Icu/Ics ≥ Icc tại điểm lắp.', 'Đường cong phù hợp dòng khởi động của tải.', 'Định mức DC nếu lắp ở mạch DC (cực tính, điện áp DC).', 'Chọn lọc với máy cắt phía trên.', 'Phụ kiện tương thích đúng dòng máy cắt (gắn trái/phải, số lượng tối đa).'],
  params: [
    { k: 'In', n: 'Dòng định mức', m: 'Dòng mà máy cắt mang liên tục không cắt.', u: 'A', i: 'Chọn In ≥ Ib, đồng thời In ≤ Iz của cáp.', h: 'Ib = P / (√3·U·cosφ) cho 3 pha; chọn cấp tiêu chuẩn kế tiếp; sau đó kiểm tra cáp.', e: 'Nhánh PV 5 kW: Ib ≈ 7,2 A → 10 hoặc 16 A tùy khuyến nghị inverter.', c: 'Khuyến nghị bảo vệ AC tối đa trong hướng dẫn inverter; hệ số giảm theo nhiệt độ tủ.' },
    { k: 'curve', n: 'Đường cong cắt', m: 'Ngưỡng cắt từ so với In.', u: 'B/C/D', i: 'Động cơ khởi động trực tiếp, biến áp cần C/D; tải điện tử thường C.', h: 'Theo dòng khởi động/inrush của tải.', e: 'Nhánh điện trở: C.', c: 'Dòng inrush của PSU, inverter, biến tần.' },
    { k: 'Icu', n: 'Khả năng cắt ngắn mạch', m: 'Dòng ngắn mạch tối đa cắt được.', u: 'kA', i: 'Phải ≥ Icc tại điểm lắp, hoặc dùng phối hợp cascade theo bảng hãng.', h: 'Từ Icc tại PCC (điện lực) và tổng trở cáp.', e: 'Chưa có Icc → “chưa đủ thông tin”.', c: 'Tiêu chuẩn đánh giá: IEC 60898-1 (Icn) hay IEC 60947-2 (Icu/Ics).' },
    { k: 'poles', n: 'Số cực', m: 'Số dây được bảo vệ/cắt.', u: 'P', i: '1P+N, 3P, 4P tùy tải và sơ đồ nối đất.', h: 'Theo số pha của tải và yêu cầu cắt N.', e: 'EV 1 pha: 1P+N; PCS 3 pha: 4P.', c: 'Ở mạch DC: số cực nối tiếp để đạt điện áp DC định mức.' },
    { k: 'dc', n: 'Đóng cắt AC/DC', m: 'Máy cắt AC không đảm bảo cắt được DC.', u: '—', i: 'Mạch pin/PV phía DC cần thiết bị định mức DC.', h: 'Theo vị trí lắp.', e: 'Phía AC của inverter: máy cắt AC.', c: 'Ký hiệu định mức DC và cực tính trên datasheet.', adv: true },
    { k: 'aux', n: 'Phụ kiện chức năng', m: 'Tiếp điểm, cuộn cắt, motor cần thêm.', u: '—', i: 'Quyết định PLC đọc/điều khiển được gì.', h: 'Từ bảng I/O và chức năng mong muốn.', e: 'OF + SD cho mọi nhánh; MX cho máy cắt tổng.', c: 'Điện áp cuộn MX (24 VDC? 230 VAC?) khớp nguồn điều khiển.' }
  ],
  example: {
    ok: { t: 'Nhánh tải điện trở 6 kW 3 pha', d: 'Ib = 6000 / (√3 × 400 × 1) ≈ 8,7 A → chọn In 10 A đường cong C, 4P, thêm OF+SD. Vẫn phải kiểm tra cáp (Iz), Icc và chọn lọc — site này không kết luận.' },
    ko: { t: 'Máy cắt “có Modbus” để PLC đóng lại sau sự cố', d: 'Cổng truyền thông chỉ đọc trạng thái/đo lường. Không có bộ truyền động động cơ thì PLC không thể đóng máy cắt. Ngoài ra đóng lại tự động sau trip ngắn mạch là nguy hiểm — cần người kiểm tra.' }
  },
  brands: 'Ví dụ dòng sản phẩm để tra cứu: Schneider Acti9 (MCB, phụ kiện iOF/iSD/iMX), Compact NSX (MCCB); ABB, Siemens, Hager, Legrand… — cần kiểm tra datasheet và catalogue phụ kiện.'
},

contactor: {
  name: 'Công tắc tơ', fr: 'Contacteur', sym: 'KM', group: 'Đóng cắt & bảo vệ',
  func: 'Đóng/cắt mạch công suất theo lệnh điện (cuộn hút), cho phép PLC điều khiển nguồn hoặc tải.',
  principle: 'Cuộn hút tạo lực từ kéo tiếp điểm chính đóng; mất điện cuộn → lò xo mở tiếp điểm. Tiếp điểm phụ đổi trạng thái theo tiếp điểm chính để báo phản hồi.',
  notdo: 'Không bảo vệ quá tải/ngắn mạch; cần máy cắt hoặc cầu chì phía trước. Không cách ly an toàn để làm việc.',
  confusions: [['Disjoncteur', 'Máy cắt bảo vệ; contacteur điều khiển.'], ['Relay trung gian', 'Cùng nguyên lý nhưng relay trung gian chỉ cắt dòng tín hiệu (vài A).']],
  ports: { power: 'Tiếp điểm chính 3P hoặc 4P (1/L1… 2/T1…).', ctrl: 'Cuộn A1–A2 (24 VDC hoặc 230 VAC), tiếp điểm phụ NO/NC (13–14, 21–22) cho phản hồi.' },
  accessories: ['Khối tiếp điểm phụ cho phản hồi trạng thái.', 'Bộ dập xung cuộn (RC/varistor/diode) để bảo vệ ngõ ra điều khiển.', 'Khóa liên động cơ khí khi dùng cặp contacteur chuyển nguồn.', 'Tiếp điểm gương (mirror contact) nếu dùng trong mạch an toàn.'],
  compat: ['Dòng định mức theo đúng {{ac_cat|loại sử dụng}} (AC-1, AC-3, DC-1…).', 'Điện áp cuộn khớp nguồn điều khiển; công suất cuộn khớp ngõ ra hoặc relay trung gian.', 'Số cực (cắt N khi chuyển nguồn/tách đảo).', 'Số tiếp điểm phụ đủ cho phản hồi + khóa liên động.'],
  params: [
    { k: 'Ie', n: 'Dòng định mức theo loại sử dụng', m: 'Dòng tối đa đóng cắt được với loại tải.', u: 'A (AC-1/AC-3)', i: 'Tải trở dùng AC-1; động cơ dùng AC-3.', h: 'Ib của nhánh + loại tải.', e: 'Bậc điện trở 2 kW: Ib ≈ 2,9 A, AC-1 → contacteur nhỏ nhất đủ.', c: 'Tuổi thọ điện ở số lần đóng cắt dự kiến.' },
    { k: 'coil', n: 'Điện áp và công suất cuộn', m: 'Điện áp điều khiển cuộn hút; công suất lúc hút (inrush) và giữ.', u: 'V, VA/W', i: 'Quyết định có cần relay trung gian không.', h: 'Theo nguồn điều khiển của tủ.', e: 'Cuộn 230 VAC → cần KA vì DO PLC là transistor 24 VDC.', c: 'Dòng hút của cuộn so với khả năng tiếp điểm KA.' },
    { k: 'poles', n: 'Số cực', m: 'Số tiếp điểm chính.', u: 'P', i: 'Contacteur tách lưới thường cần 4P.', h: 'Theo sơ đồ nối đất ở cả hai chế độ.', e: 'KM-PCC: 4P.', c: 'Quy định về cắt trung tính khi tách đảo.' },
    { k: 'auxc', n: 'Tiếp điểm phụ', m: 'Số NO/NC phụ.', u: 'NO/NC', i: 'Cần ít nhất 1 NO cho phản hồi về PLC.', h: 'Từ bảng I/O và khóa liên động.', e: '1NO phản hồi + 1NC khóa liên động.', c: 'Dòng tiếp điểm phụ ở 24 VDC (tiếp xúc tin cậy ở dòng nhỏ).', adv: true }
  ],
  example: {
    ok: { t: 'KM-RL1: bậc tải điện trở 2 kW', d: 'AC-1, 3P, cuộn 230 VAC qua relay trung gian KA, 1NO phản hồi về DI.' },
    ko: { t: 'Contacteur AC dùng cắt mạch pin DC 200 V', d: 'Định mức AC không đảm bảo dập hồ quang DC. Phía DC dùng thiết bị định mức DC do nhà sản xuất pin chỉ định.' }
  },
  brands: 'Ví dụ dòng sản phẩm để tra cứu: Schneider TeSys (D/Deca), Acti9 iCT (modular); ABB AF, Siemens SIRIUS… — cần kiểm tra datasheet.'
},

decrelay: {
  name: 'Relay bảo vệ tách lưới', fr: 'Relais de protection de découplage', sym: 'KF / FR', group: 'Đóng cắt & bảo vệ',
  func: 'Giám sát U và f tại phía lưới của PCC; khi ngoài ngưỡng (mất lưới, quá/thấp áp, quá/thấp tần) ra lệnh mở thiết bị tách lưới, ngăn microgrid cấp điện vào lưới sự cố.',
  principle: 'Đo điện áp trực tiếp ở 400 V (không cần biến điện áp), tính U, f, có thể df/dt; so với ngưỡng và trễ thời gian; đóng/mở tiếp điểm ngõ ra trip. Có watchdog nội bộ và tiếp điểm báo lỗi.',
  notdo: 'Không tự cắt dòng (cần KM-PCC/máy cắt thực hiện). Không bảo vệ quá dòng. Không quyết định vận hành đảo — chỉ tách.',
  confusions: [['Relay trung gian', 'Relay trung gian không đo gì.'], ['Relay an toàn', 'Relay an toàn bảo vệ con người trước máy (dừng khẩn), không giám sát lưới.'], ['PLC', 'PLC có thể đọc U/f từ đồng hồ, nhưng chức năng tách lưới phải do thiết bị bảo vệ chuyên dụng (hoặc chức năng tích hợp được chứng nhận trong inverter) theo quy định đấu nối.']],
  ports: { meas: 'Ngõ vào điện áp L1-L2-L3-N (qua MCB bảo vệ mạch đo).', aux: 'Nguồn phụ trợ (thường 24 VDC hoặc 230 VAC — kiểm tra).', ctrl: 'Ngõ ra relay trip (tới cuộn KM-PCC và/hoặc MX), tiếp điểm báo trạng thái/lỗi về PLC.' },
  accessories: ['MCB nhỏ bảo vệ mạch đo áp.', 'Nguồn phụ trợ được duy trì (UPS) để relay vẫn hoạt động khi mất lưới.', 'Chứng nhận phù hợp quy định đấu nối (ví dụ theo EN 50549-1 hoặc quy định quốc gia) — cần kiểm chứng.'],
  compat: ['Ngưỡng/thời gian cài đặt theo quy định đấu nối của nơi lắp — không lấy từ site này.', 'Tiếp điểm trip đủ khả năng cắt dòng cuộn hút KM-PCC hoặc qua relay trung gian.', 'Logic an toàn khi mất nguồn phụ trợ (fail-safe: tách lưới).'],
  params: [
    { k: 'Un', n: 'Điện áp đo', m: 'Dải điện áp đầu vào đo.', u: 'V AC', i: 'Ở 400 V đo trực tiếp; trung thế mới cần VT.', h: 'Theo điểm đấu nối.', e: '400 V 3P+N trực tiếp.', c: 'Kiểu nối (3P+N hay 3P không N).' },
    { k: 'func', n: 'Chức năng bảo vệ', m: 'Các ngưỡng {{ansi|ANSI}} hỗ trợ.', u: '—', i: 'Phải có đủ chức năng mà quy định yêu cầu.', h: 'Từ quy định đấu nối.', e: '27, 59, 81O/U, có thể 59N, df/dt — cần kiểm chứng.', c: 'Ngưỡng do nhà quản lý lưới quy định.' },
    { k: 'aux', n: 'Nguồn phụ trợ', m: 'Điện áp và công suất tiêu thụ nguồn nuôi relay.', u: 'V, W', i: 'Nếu nuôi bằng chính lưới đang giám sát, mất lưới = mất relay → cần UPS/fail-safe.', h: 'Theo nguồn điều khiển.', e: '24 VDC từ nhánh có UPS.', c: 'Hành vi khi mất nguồn phụ trợ.' },
    { k: 'out', n: 'Ngõ ra trip', m: 'Loại và định mức tiếp điểm ngõ ra.', u: 'A @ V', i: 'Có đóng trực tiếp cuộn KM-PCC được không.', h: 'So với dòng cuộn hút.', e: 'Cần kiểm tra datasheet.', c: 'NO hay NC, logic fail-safe.' }
  ],
  example: {
    ok: { t: 'Relay tách lưới 400 V có nguồn 24 VDC, ngõ ra trip tới KM-PCC và MX', d: 'Nguồn 24 VDC lấy sau UPS → relay vẫn tác động khi mất lưới; tiếp điểm báo về PLC để ghi sự kiện.' },
    ko: { t: 'Dùng PLC đọc tần số từ đồng hồ Modbus để tách lưới', d: 'Thời gian đáp ứng phụ thuộc chu kỳ đọc và truyền thông, không có chứng nhận. Không thay thế bảo vệ tách lưới theo quy định.' }
  },
  brands: 'Có nhiều hãng relay tách lưới/VFR (ví dụ dòng Schneider Easergy cho trung thế, nhiều hãng khác cho hạ áp) — chọn theo danh sách được chấp nhận của nhà quản lý lưới; cần kiểm tra datasheet.'
},

ct: {
  name: 'Biến dòng', fr: 'Transformateur de courant (TC)', sym: 'TA / BE', group: 'Đo lường',
  func: 'Cho phép đồng hồ đo dòng lớn bằng cách chuyển thành dòng (hoặc áp) thứ cấp nhỏ, cách ly với mạch công suất.',
  principle: 'Dây sơ cấp đi xuyên lõi; dòng thứ cấp = dòng sơ cấp / tỷ số. Loại 1 A/5 A là nguồn dòng: hở mạch thứ cấp sinh điện áp nguy hiểm. Loại ngõ ra mV (333 mV) hoặc Rogowski an toàn hơn nhưng chỉ dùng với đồng hồ hỗ trợ.',
  notdo: 'Không đo điện áp; một mình CT không cho công suất. Không bảo vệ gì.',
  confusions: [['Biến điện áp (VT)', 'VT hạ áp cao thế xuống 100 V; ở 400 V không cần.'], ['CT bảo vệ', 'CT đo lường bão hòa sớm (bảo vệ đồng hồ); CT bảo vệ (5P…) giữ chính xác ở dòng sự cố.']],
  ports: { power: 'Sơ cấp: dây/thanh cái đi xuyên (đúng chiều P1→P2).', meas: 'Thứ cấp S1–S2 tới đồng hồ qua hàng kẹp ngắn mạch.' },
  accessories: ['Hàng kẹp thử nghiệm/ngắn mạch CT.', 'Dây thứ cấp tiết diện đủ cho công suất VA.', 'Nối đất một điểm thứ cấp (theo hướng dẫn).'],
  compat: ['Loại ngõ ra (5 A / 1 A / 333 mV) TRÙNG loại ngõ vào đồng hồ.', 'Tỷ số phù hợp dải dòng (đo tốt ở 20–120 % In).', 'Cấp chính xác chuỗi CT + đồng hồ.', 'Đường kính lỗ đủ cho cáp.', 'Chiều lắp đúng (sai chiều → công suất sai dấu).'],
  params: [
    { k: 'ratio', n: 'Tỷ số biến dòng', m: 'Dòng sơ cấp định mức / dòng thứ cấp.', u: 'A/A', i: 'Dòng làm việc nên nằm ở dải chính xác.', h: 'Từ Ib lớn nhất qua điểm đo.', e: '50/5 A cho PCC (Ib tối đa ≈ 52 A — cân nhắc 60/5).', c: 'Đồng hồ được cài đúng tỷ số.' },
    { k: 'acc', n: 'Cấp chính xác', m: 'Sai số tỷ số và góc.', u: 'Cl.', i: 'Chuỗi đo không chính xác hơn phần tử kém nhất.', h: 'Theo mục đích (giám sát/tính năng lượng).', e: 'Cl. 0,5 hoặc 1.', c: 'Công suất định mức VA ≥ tải của dây + đồng hồ.' },
    { k: 'out', n: 'Loại ngõ ra', m: '5 A, 1 A, 333 mV, Rogowski.', u: '—', i: 'Phải khớp đồng hồ.', h: 'Theo đồng hồ đã chọn.', e: '5 A.', c: 'Trường hợp không tương thích phổ biến nhất.' },
    { k: 'va', n: 'Công suất định mức', m: 'Tải tối đa ở thứ cấp vẫn giữ cấp chính xác.', u: 'VA', i: 'Dây dài làm tăng tải.', h: 'Tổng trở dây + ngõ vào đồng hồ.', e: 'Cần kiểm tra datasheet.', c: '', adv: true }
  ],
  example: {
    ok: { t: '3 × CT 50/5 A Cl. 0,5 + đồng hồ ngõ vào 5 A', d: 'Khớp loại ngõ ra, tỷ số cài trên đồng hồ = 10.' },
    ko: { t: 'CT ngõ ra 333 mV với đồng hồ chỉ có ngõ vào 5 A', d: 'Tín hiệu quá nhỏ, đồng hồ đọc gần 0. Cùng “là CT” không có nghĩa tương thích.' }
  },
  brands: 'Ví dụ dòng sản phẩm để tra cứu: Schneider PowerLogic TC, Socomec, Circutor… — cần kiểm tra datasheet.'
},

meter: {
  name: 'Đồng hồ đo đa năng', fr: 'Centrale de mesure / compteur', sym: 'PM / P', group: 'Đo lường',
  func: 'Đo U, I, P, Q, S, cosφ, f, điện năng tại một điểm và cung cấp cho PLC/EMS qua truyền thông.',
  principle: 'Lấy mẫu điện áp (đo trực tiếp) và dòng (qua CT hoặc đo trực tiếp ≤ 63 A với loại direct), tính các đại lượng. Dấu công suất phụ thuộc chiều lắp CT và cấu hình.',
  notdo: 'Không bảo vệ, không cắt. Giá trị truyền về có độ trễ (chu kỳ đọc), không dùng cho bảo vệ nhanh.',
  confusions: [['Công tơ tính tiền', 'Công tơ tính tiền (MID/IEC 62053) phục vụ thanh toán; đồng hồ giám sát (IEC 61557-12) cho nhiều đại lượng hơn.'], ['Relay bảo vệ', 'Relay cũng đo nhưng mục đích là ra lệnh cắt nhanh, có chứng nhận.']],
  ports: { meas: 'Ngõ vào áp V1-V2-V3-VN (qua MCB/cầu chì), ngõ vào dòng I1-I3 (S1/S2) hoặc đầu cực đo trực tiếp.', aux: 'Nguồn nuôi (tự cấp từ mạch đo hoặc riêng).', comm: 'RS485 (Modbus RTU) hoặc Ethernet (Modbus TCP) tùy model.', ctrl: 'Tùy model: ngõ ra xung, DI/DO.' },
  accessories: ['CT (nếu không đo trực tiếp).', 'MCB/cầu chì bảo vệ mạch đo áp.', 'Điện trở đầu cuối RS485 nếu ở cuối bus.', 'Register map của nhà sản xuất.'],
  compat: ['Kiểu nối mạng (3P4W, 3P3W, 1P2W).', 'Ngõ vào dòng khớp CT (5 A/1 A/mV).', 'Cổng truyền thông khớp phía PLC (RS485 hay Ethernet) — nếu không thì cần gateway.', 'Giao thức và register map có đủ đại lượng cần đọc (ví dụ P theo từng pha, có dấu).', 'Kiểu dữ liệu (FLOAT32, INT32…) và thứ tự word mà PLC xử lý được.'],
  params: [
    { k: 'conn', n: 'Kiểu nối và điện áp', m: 'Mạng đo được và dải điện áp.', u: 'V, 3P4W…', i: 'Phải khớp hệ thống.', h: 'Theo điểm đo.', e: '400 V 3P4W.', c: '' },
    { k: 'iin', n: 'Ngõ vào dòng', m: 'Đo qua CT (5 A/1 A/mV) hay trực tiếp.', u: 'A', i: 'Quyết định có cần CT không.', h: 'Ib tại điểm đo: > 63 A thường dùng CT.', e: 'PCC: CT 5 A; nhánh nhỏ: đo trực tiếp.', c: 'Dòng tối đa đo trực tiếp.' },
    { k: 'acc', n: 'Cấp chính xác', m: 'Cấp chính xác công suất/điện năng.', u: 'Cl.', i: 'Giám sát: 1 hoặc 0,5S.', h: 'Theo mục đích.', e: 'Cl. 0,5S (giả định).', c: 'Theo IEC 61557-12 hoặc IEC 62053.' },
    { k: 'comm', n: 'Truyền thông', m: 'Cổng, giao thức, vai trò.', u: '—', i: 'Quyết định cách PLC đọc.', h: 'Theo kiến trúc truyền thông.', e: 'PCC: Modbus TCP (server); nhánh: Modbus RTU (slave).', c: 'Số kết nối TCP đồng thời tối đa; tốc độ cập nhật.' },
    { k: 'sign', n: 'Quy ước dấu', m: 'Nhập/xuất tương ứng dấu nào.', u: '—', i: 'Sai dấu → EMS sạc pin khi cần xả.', h: 'Cấu hình + chiều CT.', e: 'PCC: P > 0 = nhập từ lưới.', c: 'Thử nghiệm với tải đã biết khi chạy thử.' }
  ],
  example: {
    ok: { t: 'Đồng hồ PCC Ethernet Modbus TCP + 3 CT 5 A', d: 'PLC (client) đọc P tổng có dấu mỗi 1 s; EMS cũng đọc qua switch nếu đồng hồ cho phép ≥ 2 kết nối.' },
    ko: { t: 'Đồng hồ chỉ có RS485, PLC chỉ có cổng Ethernet', d: 'Cùng hỗ trợ “Modbus” nhưng khác giao diện vật lý → cần module RS485 cho PLC hoặc gateway Modbus TCP/RTU.' }
  },
  brands: 'Ví dụ dòng sản phẩm để tra cứu: Schneider PowerLogic PM5000 / iEM3000, Siemens SENTRON PAC, Janitza, Socomec Diris… — cổng và giao thức khác nhau theo model, cần kiểm tra datasheet.'
},

busbar: {
  name: 'Thanh cái AC chính', fr: 'Jeu de barres / répartiteur', sym: 'WC', group: 'Phân phối',
  func: 'Điểm nối chung của tất cả nguồn và nhánh tải trong tủ chính.',
  principle: 'Dẫn đồng có tiết diện đủ cho dòng tổng; tại đây định luật Kirchhoff: tổng công suất vào = tổng công suất ra (bỏ qua tổn hao).',
  notdo: 'Không đo, không bảo vệ.',
  confusions: [['PCC', 'PCC là ranh giới với lưới; thanh cái là nơi phân phối nội bộ.']],
  ports: { power: 'Các điểm đấu nhánh (đầu vào nguồn, đầu ra tải).' },
  accessories: ['Giá đỡ cách điện, nắp che IP2X.', 'Lược/répartiteur nếu dùng thiết bị modular.'],
  compat: ['Dòng định mức ≥ dòng lớn nhất có thể (kể cả khi nhiều nguồn cùng phát).', 'Icw/Ipk ≥ dòng ngắn mạch.', 'Theo IEC 61439 khi lắp trong tủ.'],
  params: [
    { k: 'In', n: 'Dòng định mức', m: 'Dòng liên tục cho phép.', u: 'A', i: 'Tính cả trường hợp lưới + PV + pin cùng cấp tải.', h: 'Tổng nguồn có thể đồng thời.', e: '63 A (sơ bộ).', c: 'Nhiệt độ trong tủ.' },
    { k: 'Icw', n: 'Dòng chịu ngắn mạch', m: 'Khả năng chịu lực điện động và nhiệt khi ngắn mạch.', u: 'kA', i: 'Phụ thuộc Icc PCC.', h: 'Từ Icc.', e: 'Chưa đủ dữ liệu.', c: 'Hệ thống thanh cái đã thử nghiệm theo IEC 61439.' }
  ],
  example: { ok: { t: 'Répartiteur 4P 63 A', d: 'Đủ cho mô hình phòng thí nghiệm nếu Icc phù hợp.' }, ko: { t: 'Thanh cái 40 A', d: 'Lưới 36 kVA + PV 5 kW có thể cấp tải 17 kW + sạc pin 5 kW → dòng có thể > 40 A.' } }
},

pvarray: {
  name: 'Dàn PV / nguồn mô phỏng PV', fr: 'Générateur PV / simulateur PV', sym: 'G (PV)', group: 'Nguồn',
  func: 'Tạo công suất DC từ bức xạ. Trong phòng thí nghiệm có thể thay bằng nguồn DC lập trình mô phỏng đường cong I-V (simulateur PV) để thử nghiệm lặp lại được.',
  principle: 'Mỗi tấm có đường cong I–V; điện áp hở mạch Voc tăng khi trời lạnh. Các tấm nối tiếp thành chuỗi (string) để đạt điện áp vào inverter.',
  notdo: 'Không tự điều chỉnh công suất; inverter quyết định điểm làm việc.',
  confusions: [['Nguồn DC phòng thí nghiệm thường', 'Nguồn DC áp cố định không có đặc tính I-V như PV; MPPT có thể dao động. Cần simulateur PV đúng nghĩa.']],
  ports: { power: 'Cáp DC + / − (đầu nối PV, ví dụ MC4-tương thích — không lẫn hãng).' },
  accessories: ['Cáp DC solar, đầu nối cùng loại/cùng hãng ở hai phía.', 'Khung giá đỡ và nối đất khung (nếu là tấm thật).'],
  compat: ['Voc chuỗi tại nhiệt độ thấp nhất < điện áp DC tối đa inverter.', 'Vmp chuỗi trong dải MPPT ở mọi nhiệt độ.', 'Isc ≤ dòng ngắn mạch tối đa đầu vào inverter.'],
  params: [
    { k: 'Pdc', n: 'Công suất đỉnh', m: 'Công suất ở điều kiện chuẩn STC.', u: 'kWc', i: 'Tỷ lệ DC/AC so với inverter (thường 1,0–1,3).', h: 'Theo mục tiêu thử nghiệm.', e: '6 kWc cho inverter 5 kW.', c: '' },
    { k: 'Ns', n: 'Số tấm nối tiếp', m: 'Số tấm trên một chuỗi.', u: 'tấm', i: 'Quyết định điện áp chuỗi.', h: 'Từ Voc, Vmp và dải inverter.', e: '14 tấm.', c: 'Tính Voc ở Tmin.' },
    { k: 'Voc', n: 'Điện áp hở mạch 1 tấm', m: 'Ở STC (25 °C).', u: 'V', i: 'Đầu vào tính Voc chuỗi.', h: 'Datasheet tấm.', e: '41,5 V (giả định).', c: '' },
    { k: 'beta', n: 'Hệ số nhiệt Voc', m: 'Thay đổi Voc theo nhiệt độ.', u: '%/°C', i: 'Trời lạnh → Voc tăng.', h: 'Datasheet tấm.', e: '−0,28 %/°C (giả định).', c: '' },
    { k: 'Tmin', n: 'Nhiệt độ tối thiểu nơi lắp', m: 'Nhiệt độ cell thấp nhất dự kiến.', u: '°C', i: 'Trường hợp điện áp cao nhất.', h: 'Dữ liệu khí hậu (trong phòng: nhiệt độ phòng).', e: '−10 °C (nếu đặt ngoài trời).', c: '' }
  ],
  example: {
    ok: { t: '14 tấm × 41,5 V, Tmin −10 °C', d: 'Voc,max = 14 × 41,5 × (1 + 0,0028 × 35) ≈ 638 V < 1000 V; Vmp nằm trong dải MPPT giả định 200–800 V.' },
    ko: { t: '25 tấm nối tiếp', d: 'Voc,max ≈ 1139 V > 1000 V → vượt điện áp DC tối đa, có thể phá hỏng inverter.' }
  }
},

pvdcbox: {
  name: 'Hộp bảo vệ phía DC của PV', fr: 'Coffret DC (sectionneur DC, fusibles gPV, parafoudre DC)', sym: 'QS-DC / F / FV', group: 'Đóng cắt & bảo vệ',
  func: 'Cách ly phía DC để bảo trì, bảo vệ chuỗi khi có dòng ngược (nếu nhiều chuỗi song song) và hạn chế quá áp xung phía DC.',
  principle: 'Hồ quang DC không tự tắt qua điểm 0 như AC → thiết bị phải định mức DC ở đúng điện áp. Cầu chì gPV (IEC 60269-6) chỉ cần khi có ≥ 3 chuỗi song song (hoặc theo quy định).',
  notdo: 'Không thay thế máy cắt AC phía lưới; không chống điện giật phía AC.',
  confusions: [['Máy cắt AC', 'Định mức AC không có nghĩa cắt được DC 600 V.']],
  ports: { power: 'Vào DC từ chuỗi, ra DC tới inverter.', ctrl: 'Tùy chọn: tiếp điểm báo SPD hỏng.' },
  accessories: ['SPD DC loại PV.', 'Nhãn cảnh báo “DC – còn điện áp khi cắt AC”.'],
  compat: ['Điện áp DC định mức ≥ Voc,max của chuỗi.', 'Dòng ≥ 1,25 × Isc (tùy quy định).', 'Số chuỗi → có cần cầu chì không.'],
  params: [
    { k: 'Udc', n: 'Điện áp DC định mức', m: 'Điện áp DC tối đa thiết bị cắt/chịu được.', u: 'V DC', i: '≥ Voc,max tính ở Tmin.', h: 'Từ tính chuỗi.', e: '≥ 638 V → chọn loại 1000 V DC.', c: 'Cách đấu nối tiếp cực để đạt Udc.' },
    { k: 'Idc', n: 'Dòng DC định mức', m: '', u: 'A', i: '≥ dòng chuỗi với hệ số an toàn.', h: 'Isc × hệ số theo quy định.', e: 'Cần kiểm tra theo quy định PV áp dụng.', c: '' },
    { k: 'spd', n: 'SPD DC', m: 'Ucpv, In, Up.', u: 'V, kA', i: 'Up < khả năng chịu xung của inverter.', h: 'Theo đánh giá rủi ro sét.', e: 'Cần kiểm tra.', c: '' }
  ],
  example: { ok: { t: 'Sectionneur DC 1000 V + SPD PV, 1 chuỗi', d: 'Một chuỗi duy nhất → không cần cầu chì chuỗi (cần kiểm chứng theo quy định).' }, ko: { t: 'Dùng MCB AC 230 V làm cách ly DC', d: 'Không định mức DC 600 V, có thể duy trì hồ quang.' } }
},

pvinv: {
  name: 'Inverter PV hòa lưới', fr: 'Onduleur photovoltaïque', sym: 'TB / U', group: 'Nguồn',
  func: 'Biến DC từ PV thành AC đồng bộ với lưới, bám điểm công suất cực đại, và nhận lệnh giới hạn công suất.',
  principle: '{{mppt|MPPT}} đặt điện áp DC tối ưu; khối nghịch lưu bơm dòng đồng pha với điện áp lưới ({{gfl|grid-following}}). Tích hợp {{anti_isl|chống tách đảo}}: mất lưới → ngừng phát trong thời gian quy định.',
  notdo: 'Thường KHÔNG tự tạo lưới: không cấp điện khi mất lưới nếu không có nguồn grid-forming. Không sạc pin trực tiếp (trừ inverter hybrid).',
  confusions: [['PCS', 'PCS là bộ biến đổi hai chiều cho pin; inverter PV chỉ một chiều DC→AC.'], ['BMS', 'BMS quản lý pin, không chuyển đổi công suất.']],
  ports: { power: 'Vào DC (MPPT), ra AC 3P+N+PE.', comm: 'Ethernet (Modbus TCP/SunSpec, web) và/hoặc RS485 — tùy model.', ctrl: 'Tùy model: ngõ vào giới hạn công suất, relay báo lỗi.' },
  accessories: ['Máy cắt AC theo khuyến nghị nhà sản xuất.', 'RCD nếu yêu cầu (loại A hay B tùy inverter).', 'Hộp DC.', 'Register map/SunSpec models được hỗ trợ.'],
  compat: ['Điện áp/số pha AC.', 'Dải MPPT và Vdc,max so với chuỗi PV.', 'Khả năng nhận setpoint giới hạn P qua truyền thông (thanh ghi ghi được, thời gian đáp ứng).', 'Hoạt động trên lưới do PCS tạo khi tách đảo (dải f, P(f) curtailment) — cần kiểm tra danh sách tương thích của hãng PCS.', 'Chứng nhận đấu nối theo quy định nơi lắp.'],
  params: [
    { k: 'Pac', n: 'Công suất AC định mức', m: 'Công suất phát tối đa phía AC.', u: 'kW / kVA', i: 'Dòng AC và chọn máy cắt nhánh.', h: 'Theo Pdc và mục tiêu.', e: '5 kW, 3P.', c: 'kVA lớn nhất khi phát Q.' },
    { k: 'Vdcmax', n: 'Điện áp DC tối đa', m: 'Giới hạn tuyệt đối đầu vào.', u: 'V', i: 'Voc,max chuỗi phải nhỏ hơn.', h: 'Datasheet.', e: '1000 V (giả định).', c: '' },
    { k: 'mppt', n: 'Dải MPPT', m: 'Điện áp DC làm việc tối ưu.', u: 'V', i: 'Vmp chuỗi phải nằm trong dải.', h: 'Datasheet.', e: '200–800 V (giả định).', c: 'Số MPPT, dòng mỗi MPPT.' },
    { k: 'comm', n: 'Truyền thông', m: 'Cổng, giao thức, đại lượng đọc/ghi.', u: '—', i: 'Quyết định EMS giới hạn PV được hay không.', h: 'Datasheet + register map.', e: 'Modbus TCP — register map: CHƯA CÓ.', c: 'Thanh ghi giới hạn P có lưu vào bộ nhớ không (tránh ghi liên tục hỏng EEPROM).' },
    { k: 'mode', n: 'Chế độ lưới', m: 'Grid-following/forming, P(f), Q(U).', u: '—', i: 'Vận hành đảo với PCS tạo lưới.', h: 'Datasheet.', e: 'Grid-following, có P(f) (giả định).', c: 'Danh sách tương thích “AC coupling” của hãng PCS.', adv: true },
    { k: 'env', n: 'Môi trường & lắp đặt', m: 'IP, nhiệt độ, tản nhiệt, tiếng ồn.', u: 'IP, °C', i: 'Treo tường ngoài tủ, khoảng cách thông gió.', h: 'Datasheet.', e: 'IP65 treo tường (thường gặp, cần kiểm tra).', c: '' }
  ],
  example: {
    ok: { t: 'Inverter 5 kW 3P, MPPT 200–800 V, Modbus TCP có register map', d: 'Chuỗi 14 tấm nằm trong dải; EMS ghi được giới hạn P khi phải chống phát ngược.' },
    ko: { t: 'Inverter chỉ có cổng RS485 và giao thức riêng của hãng', d: 'Cổng vật lý có thể nối được qua gateway, nhưng nếu giao thức không công bố thì PLC/EMS không đọc/ghi được.' }
  },
  brands: 'Ví dụ để tra cứu: SMA, Fronius, Huawei, SolarEdge, Schneider (Conext)… — hỗ trợ SunSpec/Modbus khác nhau theo model, cần kiểm tra datasheet.'
},

battery: {
  name: 'Pin lưu trữ', fr: 'Batterie (système de stockage)', sym: 'GB', group: 'Lưu trữ',
  func: 'Lưu năng lượng DC; cung cấp/hấp thụ công suất qua PCS.',
  principle: 'Cell LFP (lithium sắt phốt phát) nối tiếp/song song thành module, có contacteur DC và cầu chì nội bộ, do BMS giám sát.',
  notdo: 'Không tự nối ra AC; không tự quyết định sạc/xả.',
  confusions: [['BMS', 'Pin là phần lưu trữ, BMS là phần quản lý; thường cùng một sản phẩm nhưng chức năng khác nhau.']],
  ports: { power: 'Cực DC + / − (điện áp cao hoặc 48 V tùy hệ).', comm: 'Cổng BMS (CAN/RS485) — xem BMS.' },
  accessories: ['Bảo vệ DC (cầu chì/máy cắt DC) theo nhà sản xuất.', 'Thông gió/nhiệt độ phòng, khoảng cách an toàn cháy.'],
  compat: ['Dải điện áp pin nằm trong dải DC của PCS.', 'Dòng sạc/xả liên tục ≥ công suất PCS / điện áp.', 'Cặp pin–PCS có trong danh sách tương thích.'],
  params: [
    { k: 'E', n: 'Dung lượng', m: 'Năng lượng danh định (và khả dụng).', u: 'kWh', i: 'Thời gian cấp tải khi tách đảo.', h: 'Công suất tải × thời gian mong muốn.', e: '10 kWh.', c: 'Dung lượng khả dụng giữa SOC min/max.' },
    { k: 'Vdc', n: 'Điện áp danh định / dải', m: '', u: 'V DC', i: 'Phải khớp PCS.', h: 'Datasheet.', e: '200 V (giả định).', c: '' },
    { k: 'Imax', n: 'Dòng sạc/xả liên tục', m: '', u: 'A', i: 'Giới hạn công suất thực tế.', h: 'P = U × I.', e: '25 A → 5 kW ở 200 V.', c: 'Giảm theo nhiệt độ/SOC (BMS tính).' },
    { k: 'soc', n: 'Giới hạn SOC vận hành', m: 'SOC min/max do EMS áp dụng.', u: '%', i: 'Dự trữ cho tách đảo.', h: 'Chiến lược vận hành.', e: '20 % / 90 %.', c: '' }
  ],
  example: { ok: { t: 'Pin LFP 10 kWh, 200 V, 25 A liên tục', d: 'Đủ cho PCS 5 kW (5000/200 = 25 A).' }, ko: { t: 'Pin 48 V cho PCS điện áp cao', d: 'Dải điện áp DC không khớp — không nối được.' } }
},

bms: {
  name: 'Hệ thống quản lý pin', fr: 'Système de gestion de batterie', sym: 'BMS', group: 'Lưu trữ',
  func: 'Giữ pin trong vùng an toàn: đo áp cell, nhiệt độ, dòng; tính SOC/SOH; cân bằng; mở contacteur DC khi vượt giới hạn; gửi giới hạn sạc/xả cho PCS.',
  principle: 'Bo đo trên từng module + bộ điều khiển chủ. Liên tục gửi {{bms_lim|CVL/CCL/DCL}} và SOC cho PCS qua {{can|CAN}} hoặc RS485 theo giao thức của hãng.',
  notdo: 'Không chuyển đổi công suất, không điều khiển lưới, không phải EMS.',
  confusions: [['PCS', 'PCS thực hiện sạc/xả; BMS cho phép/giới hạn.'], ['EMS', 'EMS quyết định chiến lược (khi nào sạc); BMS bảo vệ pin.']],
  ports: { comm: 'CAN hoặc RS485 tới PCS (bắt buộc); có thể có cổng cho giám sát.', ctrl: 'Tiếp điểm báo lỗi, ngõ vào dừng khẩn tùy model.', aux: 'Nguồn nuôi từ pin hoặc ngoài.' },
  accessories: ['Cáp truyền thông đúng sơ đồ chân (pinout) do hãng chỉ định.', 'Điện trở đầu cuối CAN.'],
  compat: ['Giao thức BMS↔PCS được cả hai hãng công nhận (danh sách tương thích).', 'Pinout RJ45 của cổng CAN (không có chuẩn chung).', 'Tốc độ CAN (ví dụ 250/500 kbit/s).'],
  params: [
    { k: 'proto', n: 'Giao thức tới PCS', m: 'Tập bản tin mà PCS hiểu.', u: '—', i: 'Không khớp → PCS không cho sạc/xả.', h: 'Danh sách tương thích của PCS.', e: 'CAN, giao thức hãng — CHƯA XÁC MINH.', c: 'Phiên bản firmware cả hai phía.' },
    { k: 'meas', n: 'Đại lượng cung cấp', m: 'SOC, SOH, T, U cell min/max, cảnh báo.', u: '—', i: 'EMS cần SOC tin cậy.', h: 'Tài liệu giao thức.', e: 'SOC chuyển tiếp qua PCS Modbus TCP.', c: '' }
  ],
  example: { ok: { t: 'Pin và PCS cùng có trong danh sách tương thích chính thức', d: 'PCS nhận giới hạn CCL/DCL và tự giảm công suất khi pin lạnh.' }, ko: { t: 'Cùng cổng CAN RJ45 nhưng khác giao thức', d: 'PCS báo “BMS communication lost” và không xả — cổng giống nhau không có nghĩa tương thích.' } }
},

pcs: {
  name: 'Bộ chuyển đổi công suất pin', fr: 'Convertisseur bidirectionnel / onduleur batterie', sym: 'PCS', group: 'Lưu trữ',
  func: 'Sạc và xả pin phía AC theo setpoint; nếu là loại grid-forming thì tạo lưới khi tách đảo.',
  principle: 'Cầu IGBT hai chiều. Chế độ {{gfl|grid-following}}: điều khiển dòng theo setpoint P/Q. Chế độ {{gfm|grid-forming}}: giữ U và f, công suất tự cân bằng theo tải.',
  notdo: 'Không thay BMS (không giám sát cell). Grid-following không cấp được điện khi mất lưới.',
  confusions: [['Inverter PV', 'Một chiều, MPPT; PCS hai chiều với pin.'], ['BMS', 'BMS bảo vệ pin, PCS chuyển đổi công suất.'], ['UPS', 'UPS online luôn qua bộ biến đổi; PCS microgrid chuyển chế độ khi mất lưới (có thể có gián đoạn).']],
  ports: { power: 'DC pin, AC 3P+N+PE.', comm: 'CAN/RS485 tới BMS; Ethernet (Modbus TCP) tới PLC/EMS.', ctrl: 'Tùy model: ngõ vào enable, relay báo trạng thái, ngõ vào khởi động máy phát.' },
  accessories: ['Máy cắt AC, bảo vệ DC.', 'Có thể cần cảm biến dòng tại PCC cho chức năng zero-export của hãng.', 'Relay N–PE nội bộ hoặc ngoài khi tách đảo (sơ đồ nối đất) — cần kiểm chứng.'],
  compat: ['Dải điện áp DC khớp pin.', 'Giao thức BMS.', 'Grid-forming nếu muốn vận hành đảo; công suất quá tải ngắn hạn cho dòng khởi động động cơ.', 'Thời gian chuyển sang đảo.', 'Khả năng hòa đồng bộ lại với lưới.', 'Làm việc với inverter PV ghép AC (P(f)).'],
  params: [
    { k: 'P', n: 'Công suất định mức', m: 'Công suất sạc/xả liên tục.', u: 'kW / kVA', i: 'Giới hạn bù tải và tải tối đa khi đảo.', h: 'Theo tải ưu tiên + động cơ.', e: '5 kW 3P.', c: 'Quá tải ngắn hạn (ví dụ trong vài giây).' },
    { k: 'mode', n: 'Grid-forming', m: 'Khả năng tạo lưới.', u: 'có/không', i: 'Bắt buộc cho vận hành đảo dùng pin.', h: 'Datasheet.', e: 'Có (giả định).', c: 'Có cần phụ kiện chuyển mạch riêng không.' },
    { k: 'tr', n: 'Thời gian chuyển', m: 'Thời gian từ mất lưới đến cấp lại điện ở chế độ đảo.', u: 'ms', i: 'Tải nhạy (PC) có thể khởi động lại.', h: 'Datasheet.', e: 'Cần kiểm tra datasheet.', c: '' },
    { k: 'comm', n: 'Truyền thông EMS', m: 'Đọc P, SOC; ghi setpoint P, chế độ.', u: '—', i: 'Điều khiển từ EMS.', h: 'Register map.', e: 'Modbus TCP (giả định).', c: 'Watchdog: hành vi khi mất setpoint.' }
  ],
  example: { ok: { t: 'PCS 5 kW grid-forming + pin trong danh sách tương thích', d: 'Cho phép kịch bản mất lưới và vận hành đảo.' }, ko: { t: 'PCS grid-following bật “chế độ đảo”', d: 'Không có nguồn tạo lưới → kịch bản đảo bị khóa.' } },
  brands: 'Ví dụ để tra cứu: Schneider (Conext XW), Victron, SMA (Sunny Island), Studer… — khả năng grid-forming và danh sách pin tương thích khác nhau, cần kiểm tra datasheet.'
},

genset: {
  name: 'Máy phát điện', fr: 'Groupe électrogène', sym: 'G', group: 'Nguồn',
  func: 'Nguồn dự phòng tạo lưới khi mất lưới và pin không đủ.',
  principle: 'Động cơ quay máy phát đồng bộ; AVR giữ điện áp, bộ điều tốc giữ tần số. Đáp ứng chậm với bậc tải lớn.',
  notdo: 'Không hấp thụ công suất (công suất ngược nguy hiểm). Không được ghép song song với lưới nếu không có bộ đồng bộ, bảo vệ và thỏa thuận đấu nối.',
  confusions: [['Nguồn grid-forming bằng pin', 'Cả hai tạo lưới; máy phát chậm hơn nhưng năng lượng lâu dài.']],
  ports: { power: 'Đầu ra 3P+N.', ctrl: 'Kết nối với bộ điều khiển máy phát.' },
  accessories: ['Bộ điều khiển máy phát.', 'Thoát khí thải và thông gió (trong phòng 80 m²: cần đặt ngoài hoặc dùng nguồn mô phỏng).', 'Ắc quy khởi động và sạc.'],
  compat: ['kVA ≥ tải ưu tiên + dòng khởi động động cơ.', 'Không vận hành song song lưới trong kiến trúc tham chiếu.', 'Giới hạn PV khi chạy máy phát (tải tối thiểu, chống công suất ngược).'],
  params: [
    { k: 'S', n: 'Công suất biểu kiến', m: '', u: 'kVA @ cosφ 0,8', i: 'Dòng và chọn máy cắt.', h: 'Tải tối đa khi chạy máy phát.', e: '10 kVA / 8 kW.', c: 'Chế độ PRP/ESP (ISO 8528).' },
    { k: 'minload', n: 'Tải tối thiểu khuyến nghị', m: '', u: '%', i: 'Phải giới hạn PV/pin sạc.', h: 'Hướng dẫn hãng.', e: '30 % (giả định).', c: '' },
    { k: 'place', n: 'Vị trí đặt', m: '', u: '—', i: 'Máy phát diesel không đặt trong phòng thí nghiệm kín.', h: 'Quy định an toàn cháy, khí thải.', e: 'Ngoài trời hoặc thay bằng nguồn mô phỏng.', c: '' }
  ],
  example: { ok: { t: 'Máy phát 10 kVA 3P + bộ điều khiển có remote start', d: 'Đủ cho tải ưu tiên + động cơ 2,2 kW qua biến tần.' }, ko: { t: 'Máy phát 3 kVA cho tải 6 kW', d: 'Quá tải → sụt áp/tần số, máy phát tự bảo vệ dừng.' } }
},

genctrl: {
  name: 'Bộ điều khiển máy phát', fr: 'Contrôleur de groupe électrogène', sym: 'GCU', group: 'Điều khiển',
  func: 'Khởi động/dừng máy phát, giám sát và bảo vệ động cơ–máy phát, báo trạng thái cho PLC.',
  principle: 'Nhận lệnh “remote start” (tiếp điểm khô) hoặc tự khởi động khi mất lưới (AMF). Đo U, f, I của máy phát; báo “sẵn sàng nhận tải” khi ổn định.',
  notdo: 'Loại cơ bản không hòa đồng bộ và không chia tải. Không thay PLC trong logic chuyển nguồn của cả microgrid nếu không được cấu hình như vậy.',
  confusions: [['PLC', 'GCU điều khiển riêng máy phát; PLC điều phối cả hệ.'], ['Bộ hòa đồng bộ', 'Chức năng ANSI 25 chỉ có ở GCU cao cấp hoặc thiết bị riêng.']],
  ports: { ctrl: 'DI remote start, DO “running/ready”, “common alarm”, có thể ngõ ra đóng contacteur máy phát.', comm: 'RS485 Modbus RTU (thường gặp) hoặc Ethernet tùy model.', aux: '12/24 VDC từ ắc quy khởi động.' },
  accessories: ['Register map.', 'Relay trung gian nếu ngõ vào remote start cần tiếp điểm khô.'],
  compat: ['Ngõ vào remote start: tiếp điểm khô hay áp 12/24 V — đối chiếu với ngõ ra PLC.', 'Nguồn nuôi của GCU (ắc quy máy phát) khác nguồn tủ → dùng tiếp điểm khô để cách ly.', 'Chức năng đồng bộ nếu muốn chuyển không gián đoạn.'],
  params: [
    { k: 'func', n: 'Chức năng', m: 'Start/stop, AMF, đồng bộ, chia tải.', u: '—', i: 'Quyết định kịch bản được phép.', h: 'Datasheet.', e: 'Remote start + Modbus; KHÔNG có đồng bộ (giả định).', c: '' },
    { k: 'comm', n: 'Truyền thông', m: '', u: '—', i: 'PLC đọc P, U, f.', h: 'Datasheet.', e: 'RS485 Modbus RTU, địa chỉ 1.', c: 'Baud/parity.' }
  ],
  example: { ok: { t: 'GCU có ngõ vào remote start tiếp điểm khô', d: 'PLC đóng KA3 → GCU khởi động; GCU báo “ready” qua DO → PLC cho phép đóng KM-GEN.' }, ko: { t: 'Nối trực tiếp DO 24 VDC của PLC vào ngõ vào remote start dùng nguồn ắc quy 12 V của máy phát', d: 'Hai nguồn khác nhau, có thể gây dòng vòng/hỏng; dùng relay trung gian.' } }
},

vfd: {
  name: 'Biến tần', fr: 'Variateur de vitesse', sym: 'TA / U', group: 'Tải động cơ',
  func: 'Điều khiển tốc độ động cơ, khởi động mềm (giảm dòng khởi động — quan trọng khi chạy đảo), bảo vệ nhiệt động cơ.',
  principle: 'Chỉnh lưu → bus DC → nghịch lưu PWM. Nhận lệnh chạy qua DI hoặc truyền thông, tốc độ qua AI hoặc truyền thông. Có chức năng {{sto|STO}}.',
  notdo: 'Không phải thiết bị cách ly; STO không cắt điện động cơ (còn điện áp). Không thay thế máy cắt bảo vệ cáp phía trước.',
  confusions: [['Khởi động mềm (soft starter)', 'Soft starter chỉ giảm dòng khởi động, không điều tốc.'], ['Contacteur', 'Contacteur đóng/cắt nguồn; biến tần điều khiển tốc độ và mô-men.']],
  ports: { power: 'L1-L2-L3 vào, U-V-W ra động cơ (cáp có giáp chống nhiễu).', ctrl: 'DI chạy/dừng/reset, AI tốc độ, relay báo lỗi/đang chạy, STO hai kênh.', comm: 'Modbus RTU tích hợp hoặc Ethernet (tùy model/thẻ mở rộng).' },
  accessories: ['Máy cắt hoặc cầu chì theo hướng dẫn hãng.', 'Lọc EMC, cuộn kháng đầu vào nếu cần.', 'Cáp động cơ có giáp, nối giáp 360°.', 'Thẻ truyền thông nếu muốn Ethernet.'],
  compat: ['Công suất và dòng ≥ động cơ.', 'Điện áp lưới 3P 400 V.', 'Loại DI (PNP/NPN) khớp DO PLC.', 'AI 0–10 V hay 4–20 mA khớp AO PLC.', 'Dòng rò cao tần → loại RCD phù hợp (theo hãng).'],
  params: [
    { k: 'P', n: 'Công suất / dòng định mức', m: '', u: 'kW, A', i: '≥ động cơ, chú ý chế độ tải nặng/nhẹ.', h: 'Nhãn động cơ.', e: '2,2 kW, 400 V.', c: '' },
    { k: 'io', n: 'I/O điều khiển', m: 'Số DI/AI/relay, logic PNP/NPN.', u: '—', i: 'Ghép với PLC.', h: 'Datasheet.', e: 'DI 24 V PNP, AI 0–10 V, relay R1 báo lỗi.', c: '' },
    { k: 'sto', n: 'STO', m: 'Cấp an toàn SIL/PL.', u: 'SIL/PL', i: 'Dừng khẩn không cần contacteur riêng (tùy đánh giá).', h: 'Đánh giá rủi ro.', e: 'Có (giả định).', c: 'Đấu từ relay an toàn.' },
    { k: 'env', n: 'Tản nhiệt', m: 'Tổn hao nhiệt trong tủ.', u: 'W', i: 'Tính quạt tủ.', h: 'Datasheet.', e: '~3 % công suất (ước lượng).', c: '' }
  ],
  example: { ok: { t: 'Biến tần 2,2 kW, DI PNP, STO', d: 'PLC xuất DO PNP 24 V vào DI chạy; AO 0–10 V cho tốc độ; relay “đang chạy” về DI.' }, ko: { t: 'Ngõ vào biến tần cấu hình NPN, PLC xuất PNP', d: 'Biến tần không nhận lệnh chạy dù đèn DO sáng. Cấu hình lại logic DI hoặc đổi module.' } },
  brands: 'Ví dụ để tra cứu: Schneider Altivar, ABB ACS, Siemens SINAMICS, Danfoss… — cần kiểm tra datasheet.'
},

motor: {
  name: 'Động cơ không đồng bộ', fr: 'Moteur asynchrone', sym: 'M', group: 'Tải động cơ',
  func: 'Tải động cơ đại diện (quạt/bơm) để học khởi động, dòng khởi động, điều tốc và dừng khẩn.',
  principle: 'Từ trường quay kéo rotor; khởi động trực tiếp dòng 6–8 × In, qua biến tần dòng gần In.',
  notdo: '—',
  confusions: [],
  ports: { power: 'U-V-W + PE.', meas: 'Tùy chọn: PTC/PT100 trong cuộn dây.' },
  accessories: ['Tải cơ (quạt, phanh bột từ) để có công suất thật.'],
  compat: ['Điện áp đấu sao/tam giác khớp 400 V.', 'Phù hợp chạy biến tần (cách điện).'],
  params: [
    { k: 'Pn', n: 'Công suất cơ', m: '', u: 'kW', i: 'Chọn biến tần/bảo vệ.', h: 'Nhãn.', e: '2,2 kW.', c: '' },
    { k: 'In', n: 'Dòng định mức', m: '', u: 'A', i: 'Cài bảo vệ nhiệt trong biến tần.', h: 'Nhãn.', e: '≈ 4,7 A ở 400 V (ước lượng).', c: '' },
    { k: 'eff', n: 'Hiệu suất, cosφ', m: '', u: '%, —', i: 'Công suất điện tiêu thụ.', h: 'Nhãn/IE class.', e: 'η 0,85; cosφ 0,82.', c: '' }
  ],
  example: { ok: { t: 'Động cơ 2,2 kW 400 V Δ', d: 'Biến tần 2,2 kW.' }, ko: { t: 'Động cơ 230/400 V nối Δ trên lưới 400 V', d: 'Mỗi cuộn chịu 400 V thay vì 230 V → cháy cuộn dây. Đấu Y.' } }
},

loadbank: {
  name: 'Tải điện trở điều chỉnh', fr: 'Banc de charge résistif', sym: 'E / R', group: 'Tải',
  func: 'Tải có thể cắt (délestage) và điều chỉnh theo bậc để thử cân bằng công suất.',
  principle: 'Các bậc điện trở cosφ = 1 đóng bằng contacteur riêng.',
  notdo: 'Không cho phép điều chỉnh mịn (trừ bộ điều khiển thyristor).',
  confusions: [],
  ports: { power: 'Vào 3P cho mỗi bậc.' },
  accessories: ['Contacteur mỗi bậc.', 'Thông gió: toàn bộ công suất thành nhiệt trong phòng!'],
  compat: ['Tản nhiệt phòng 80 m²: 6 kW nhiệt cần thông gió/điều hòa.', 'Contacteur AC-1.'],
  params: [
    { k: 'steps', n: 'Số bậc × công suất', m: '', u: 'kW', i: 'Độ mịn sa thải tải.', h: 'Kịch bản thử.', e: '3 × 2 kW.', c: '' },
    { k: 'heat', n: 'Nhiệt thải', m: '', u: 'kW', i: 'Hệ thống thông gió.', h: '= công suất.', e: '6 kW.', c: 'Cảm biến nhiệt quá nhiệt.' }
  ],
  example: { ok: { t: '3 bậc 2 kW, 3P, có quạt và nhiệt kế', d: 'Đủ mịn để thấy từng bước délestage.' }, ko: { t: 'Tải 6 kW đặt trong tủ kín', d: 'Quá nhiệt, hỏng thiết bị lân cận.' } }
},

genericload: {
  name: 'Nhánh tải ưu tiên', fr: 'Départ charges prioritaires', sym: 'E', group: 'Tải',
  func: 'Tải phải được duy trì nhất có thể (chiếu sáng, ổ cắm thiết bị đo, PC SCADA…).',
  principle: 'Không bị sa thải; khi đảo, được cấp lại đầu tiên.',
  notdo: '—', confusions: [],
  ports: { power: 'Vào 3P+N hoặc 1P+N.' },
  accessories: ['RCD 30 mA cho ổ cắm (theo quy định).'],
  compat: ['Tổng tải ưu tiên < công suất PCS khi đảo.'],
  params: [{ k: 'P', n: 'Công suất', m: '', u: 'kW', i: 'Kích thước PCS/máy phát.', h: 'Liệt kê thiết bị.', e: '1,5 kW.', c: '' }],
  example: { ok: { t: 'Tải ưu tiên 1,5 kW', d: '< 5 kW PCS khi đảo.' }, ko: { t: 'Gộp tải điện trở vào tải ưu tiên', d: 'Khi đảo vượt công suất PCS, không còn gì để sa thải.' } }
},

evse: {
  name: 'Trạm sạc EV AC', fr: 'Borne de recharge (IRVE) mode 3', sym: 'EVSE', group: 'Tải',
  func: 'Sạc xe điện, có thể giới hạn dòng sạc theo lệnh EMS (tải điều khiển được).',
  principle: 'Báo dòng tối đa cho xe qua tín hiệu PWM Control Pilot (IEC 61851-1); xe tự điều chỉnh. Nhận giới hạn từ {{ocpp|OCPP}} hoặc Modbus tùy trạm.',
  notdo: 'Không giảm dưới dòng tối thiểu (thường 6 A theo IEC 61851) — chỉ có thể tạm dừng.',
  confusions: [['Ổ cắm thường', 'Không có giao tiếp với xe, không giới hạn dòng.']],
  ports: { power: 'AC vào 1P+N hoặc 3P+N.', comm: 'Ethernet/4G (OCPP), có thể Modbus.', ctrl: 'Tùy trạm: ngõ vào enable/giảm công suất.' },
  accessories: ['RCD loại A + phát hiện DC 6 mA, hoặc loại B (tùy trạm và quy định).', 'Máy cắt riêng.'],
  compat: ['Phiên bản OCPP và hỗ trợ smart charging.', 'EMS có CSMS/OCPP server không.'],
  params: [
    { k: 'P', n: 'Công suất', m: '', u: 'kW', i: 'Ảnh hưởng lớn tới cân bằng.', h: '', e: '7,4 kW 1P 32 A.', c: '' },
    { k: 'comm', n: 'Giao thức', m: '', u: '—', i: 'Giới hạn dòng từ EMS.', h: '', e: 'OCPP 1.6J (giả định).', c: 'Có SetChargingProfile?' }
  ],
  example: { ok: { t: 'EVSE OCPP + EMS có CSMS', d: 'EMS giới hạn 16 A khi tải tăng.' }, ko: { t: 'EVSE không có truyền thông', d: 'Chỉ có thể cắt hẳn bằng contacteur → xe có thể báo lỗi.' } }
},

spd: {
  name: 'Chống sét lan truyền AC', fr: 'Parafoudre AC', sym: 'FV', group: 'Đóng cắt & bảo vệ',
  func: 'Hạn chế quá áp xung trên thanh cái AC.',
  principle: 'Varistor/khe phóng điện dẫn dòng xung về PE.',
  notdo: 'Không bảo vệ quá áp lâu dài (lưới 400 V trên pha), không thay thế nối đất.',
  confusions: [['Relay quá áp', 'Relay 59 phát hiện quá áp kéo dài và ra lệnh cắt.']],
  ports: { power: 'L1-L2-L3-N + PE.', ctrl: 'Tiếp điểm báo hỏng.' },
  accessories: ['Bảo vệ dự phòng (MCB/cầu chì) theo hãng.', 'Dây ngắn tới PE.'],
  compat: ['Uc phù hợp sơ đồ nối đất.', 'Up < khả năng chịu xung thiết bị.'],
  params: [{ k: 'type', n: 'Loại', m: '', u: 'T1/T2', i: '', h: 'Đánh giá rủi ro sét.', e: 'Type 2.', c: '' }],
  example: { ok: { t: 'SPD type 2 có tiếp điểm báo', d: 'PLC báo cần thay khi hỏng.' }, ko: { t: 'SPD không có bảo vệ dự phòng', d: 'Khi hỏng ngắn mạch, không có gì cắt.' } }
},

psu: {
  name: 'Bộ nguồn 24 VDC', fr: 'Alimentation à découpage 24 VDC', sym: 'TS / G', group: 'Phụ trợ',
  func: 'Cấp nguồn điều khiển cho PLC, I/O, relay, switch, HMI, cảm biến.',
  principle: 'Bộ nguồn xung; có giới hạn dòng; tiếp điểm DC-OK báo áp ra bình thường.',
  notdo: 'Không duy trì khi mất AC (thời gian giữ chỉ vài chục ms) → cần UPS nếu điều khiển phải sống khi mất lưới.',
  confusions: [['UPS', 'UPS có năng lượng dự trữ.']],
  ports: { power: 'Vào 230 VAC (L, N, PE).', aux: 'Ra +24 V / 0 V.', ctrl: 'Tiếp điểm DC-OK.' },
  accessories: ['MCB phía AC.', 'Phân phối 24 V có bảo vệ từng nhánh.'],
  compat: ['Tổng dòng tải ≤ ~80 % định mức (dự phòng).', 'Dòng khởi động của tải điện dung.', 'Đủ dòng để cắt bảo vệ nhánh 24 V (hoặc dùng bảo vệ điện tử).'],
  params: [
    { k: 'I', n: 'Dòng ra định mức', m: '', u: 'A', i: '≥ tổng tiêu thụ / 0,8.', h: 'Cộng tiêu thụ từng thiết bị (bảng ở trang Chọn thiết bị).', e: '10 A (240 W).', c: 'Giảm định mức theo nhiệt độ.' },
    { k: 'dcok', n: 'Tiếp điểm DC-OK', m: '', u: '—', i: 'Giám sát nguồn.', h: '', e: 'Có (giả định).', c: '' }
  ],
  example: { ok: { t: 'PSU 10 A cho tải ≈ 4,5 A', d: 'Hệ số tải ≈ 45 %, có dự phòng cho mở rộng.' }, ko: { t: 'PSU 2,5 A', d: 'Tổng tiêu thụ > 2,5 A → sụt áp, PLC khởi động lại khi đóng nhiều relay.' } }
},

dcups: {
  name: 'UPS 24 VDC', fr: 'Module DC-UPS + batterie tampon', sym: 'GB', group: 'Phụ trợ',
  func: 'Duy trì 24 VDC cho PLC, relay tách lưới, switch, HMI khi mất lưới để quản lý chuyển nguồn và ghi nhận sự kiện.',
  principle: 'Module nằm sau PSU; khi PSU mất ra, chuyển sang ắc quy/siêu tụ; báo trạng thái về PLC.',
  notdo: 'Không cấp cho tải công suất.',
  confusions: [['PCS', 'PCS cấp cho tải AC; DC-UPS chỉ cho điều khiển.']],
  ports: { aux: 'Vào 24 V từ PSU, ra 24 V đệm, cổng ắc quy.', ctrl: 'Tiếp điểm “on battery”, “battery low”.' },
  accessories: ['Ắc quy phù hợp, cầu chì ắc quy.'],
  compat: ['Dòng ra ≥ tải đệm.', 'Thời gian lưu ≥ thời gian chuyển nguồn + khởi động máy phát + dự phòng.'],
  params: [{ k: 't', n: 'Thời gian lưu điện', m: '', u: 'phút', i: '', h: 'Tải đệm × thời gian.', e: '30 phút ở 4 A (giả định).', c: '' }],
  example: { ok: { t: 'DC-UPS 10 A + ắc quy 7 Ah', d: 'Giữ điều khiển trong quá trình mất lưới và khởi động máy phát.' }, ko: { t: 'Không có UPS, PLC nuôi từ lưới', d: 'Mất lưới → PLC tắt → không ai đóng KM-GEN, không có nhật ký.' } }
},

dcdist: {
  name: 'Phân phối & bảo vệ 24 VDC', fr: 'Distribution 24 V protégée (disjoncteurs électroniques)', sym: 'F', group: 'Phụ trợ',
  func: 'Chia 24 V thành các nhánh có bảo vệ riêng: PLC, I/O, cuộn relay, truyền thông, thiết bị hiện trường.',
  principle: 'Bảo vệ điện tử từng kênh phát hiện quá dòng kể cả khi PSU giới hạn dòng (MCB thường có thể không cắt).',
  notdo: '—', confusions: [],
  ports: { aux: 'Vào 24 V, ra các nhánh 24 V; 0 V chung.', ctrl: 'Tiếp điểm báo lỗi kênh.' },
  accessories: ['Hàng kẹp 0 V/24 V.'],
  compat: ['Tổng dòng nhánh.', 'Đặc tính cắt phù hợp dòng PSU.'],
  params: [{ k: 'ch', n: 'Số kênh', m: '', u: 'kênh', i: '', h: 'Nhóm tải.', e: '4–8 kênh.', c: '' }],
  example: { ok: { t: 'Nhánh riêng cho cuộn relay', d: 'Ngắn mạch dây ra hiện trường không làm sập PLC.' }, ko: { t: 'Một cầu chì chung', d: 'Lỗi một cảm biến làm mất toàn bộ điều khiển.' } }
},

plc: {
  name: 'Bộ điều khiển lập trình (CPU)', fr: 'Automate programmable (UC)', sym: 'KF / PLC', group: 'Điều khiển',
  func: 'Chạy logic điều khiển: khóa liên động, trình tự khởi động/chuyển nguồn, sa thải tải, xử lý báo động, trao đổi dữ liệu với thiết bị, HMI và EMS.',
  principle: 'Chu kỳ quét: đọc I/O → chạy chương trình (IEC 61131-3: LD, ST, FBD…) → ghi ngõ ra. Là Modbus client (đọc thiết bị) và có thể là server (cho HMI/EMS đọc).',
  notdo: 'Không thay bảo vệ điện (quá dòng, tách lưới). PLC tiêu chuẩn không phải thiết bị an toàn (dừng khẩn phải qua relay an toàn hoặc PLC an toàn được chứng nhận).',
  confusions: [['RTU', 'Thu thập & truyền về trung tâm xa (IEC 104/DNP3), ít logic.'], ['IED', 'Thiết bị điện tử thông minh trong trạm, thường là relay bảo vệ.'], ['HMI', 'Màn hình thao tác, không chạy logic điều khiển chính.'], ['SCADA/EMS', 'Phần mềm cấp trên giám sát và tối ưu; ra setpoint, PLC thực thi.']],
  ports: { aux: '24 VDC.', ctrl: 'Bus nội bộ tới module I/O.', comm: 'Ethernet (1–2 cổng RJ45), có thể cổng nối tiếp RS485 tích hợp.' },
  accessories: ['Module I/O, module truyền thông.', 'Phần mềm lập trình.', 'Pin RTC/thẻ nhớ.'],
  compat: ['Số module mở rộng tối đa.', 'Số kết nối Modbus TCP client/server đồng thời.', 'Có RS485 tích hợp không.', 'Hỗ trợ giao thức cần (Modbus, MQTT, OCPP thường KHÔNG có trong PLC → EMS đảm nhiệm).'],
  params: [
    { k: 'eth', n: 'Cổng Ethernet', m: 'Số cổng, switch tích hợp, giao thức.', u: 'cổng', i: 'Số thiết bị nối trực tiếp.', h: 'Datasheet.', e: '1 cổng → cần switch.', c: 'Số kết nối TCP tối đa.' },
    { k: 'ser', n: 'Cổng nối tiếp', m: 'RS485 tích hợp/module.', u: 'cổng', i: 'Đọc thiết bị Modbus RTU.', h: 'Datasheet.', e: 'Không tích hợp → module RS485.', c: '' },
    { k: 'io', n: 'Khả năng mở rộng I/O', m: '', u: 'module', i: 'Theo bảng I/O + 20 % dự phòng.', h: 'Bảng I/O.', e: 'Xem trang Bảng I/O.', c: '' },
    { k: 'aux', n: 'Nguồn và tiêu thụ', m: '', u: 'W', i: 'PSU 24 V.', h: 'Datasheet.', e: '≈ 10 W (giả định).', c: '' }
  ],
  example: { ok: { t: 'PLC có 1 cổng Ethernet + module RS485 + switch 8 cổng', d: 'Đọc PCC/inverter/PCS/biến tần qua Modbus TCP, đọc máy phát và đồng hồ nhánh qua Modbus RTU.' }, ko: { t: 'PLC làm dừng khẩn bằng một DI và một DO', d: 'Không đạt yêu cầu an toàn; một lỗi DO dính sẽ không dừng được động cơ.' } },
  brands: 'Ví dụ để tra cứu: Schneider Modicon M221/M241/M251, Siemens S7-1200, Wago, Phoenix Contact PLCnext… — cần kiểm tra datasheet.'
},

dimod: {
  name: 'Module ngõ vào số', fr: 'Module d’entrées TOR', sym: 'KF (DI)', group: 'Điều khiển',
  func: 'Đọc trạng thái ON/OFF: tiếp điểm phụ máy cắt/contacteur, nút nhấn, báo lỗi.',
  principle: 'Ngõ vào 24 VDC kiểu sink (đọc +24 V, cho cảm biến PNP) hoặc source; có lọc trễ.',
  notdo: 'Không đọc giá trị liên tục.', confusions: [['AI', 'AI đọc giá trị liên tục.']],
  ports: { ctrl: 'Kẹp ngõ vào + chung (COM).', aux: 'Nguồn 24 V cho ngõ vào.' },
  accessories: ['Hàng kẹp, nhãn.'], compat: ['Kiểu {{pnp|PNP/NPN}}.', 'Điện áp 24 VDC.', 'Số kênh + dự phòng.'],
  params: [{ k: 'n', n: 'Số kênh', m: '', u: 'kênh', i: '', h: 'Bảng I/O.', e: '16 kênh/module.', c: '' }, { k: 'logic', n: 'Logic', m: '', u: 'sink/source', i: 'Khớp thiết bị.', h: '', e: 'Sink (cho PNP).', c: '' }],
  example: { ok: { t: 'DI 16 kênh sink 24 VDC', d: 'Đọc tiếp điểm phụ (tiếp điểm khô) cấp +24 V.' }, ko: { t: 'Cảm biến NPN vào ngõ vào sink', d: 'Không đọc được trạng thái.' } }
},

domod: {
  name: 'Module ngõ ra số', fr: 'Module de sorties TOR', sym: 'KF (DO)', group: 'Điều khiển',
  func: 'Xuất lệnh ON/OFF: relay trung gian, lệnh chạy biến tần, đèn báo.',
  principle: 'Ngõ ra transistor PNP 24 VDC 0,5 A (nhanh, tuổi thọ cao) hoặc relay (cắt AC/DC vài A, chậm).',
  notdo: 'Transistor không đóng tải AC; không đủ dòng cho cuộn contacteur lớn.', confusions: [['Relay trung gian', 'KA nằm sau DO để đóng mạch công suất lớn hơn hoặc khác điện áp.']],
  ports: { ctrl: 'Kẹp ngõ ra + nguồn cấp nhóm.', aux: '24 V cho nhóm ngõ ra.' },
  accessories: ['Relay trung gian cho tải 230 VAC.', 'Diode/RC dập xung cho tải cảm.'],
  compat: ['Loại ngõ ra (transistor/relay) với điện áp tải.', 'Dòng mỗi kênh và tổng dòng nhóm.'],
  params: [{ k: 'n', n: 'Số kênh', m: '', u: 'kênh', i: '', h: 'Bảng I/O.', e: '16 kênh/module.', c: '' }, { k: 'type', n: 'Loại ngõ ra', m: '', u: '—', i: 'Có cần KA không.', h: '', e: 'Transistor PNP 0,5 A.', c: 'Tổng dòng nhóm.' }],
  example: { ok: { t: 'DO transistor → KA (cuộn 24 VDC, 20 mA)', d: 'KA đóng cuộn contacteur 230 VAC.' }, ko: { t: 'DO transistor nối trực tiếp cuộn contacteur 230 VAC', d: 'Transistor chỉ dùng cho DC — không tương thích.' } }
},

aimod: {
  name: 'Module ngõ vào/ra tương tự', fr: 'Module analogique E/S', sym: 'KF (AI/AO)', group: 'Điều khiển',
  func: 'Đọc cảm biến 4–20 mA/0–10 V/RTD và xuất tín hiệu đặt tốc độ.',
  principle: 'ADC/DAC với độ phân giải (12–16 bit); mỗi kênh cấu hình loại tín hiệu.',
  notdo: '—', confusions: [],
  ports: { ctrl: 'Kẹp AI, AO, chung analog.', aux: '24 V (cấp nguồn vòng 2 dây nếu có).' },
  accessories: ['Cáp có giáp, nối giáp một đầu.'], compat: ['Loại tín hiệu từng kênh.', 'Cấp nguồn vòng 4–20 mA 2 dây.', 'RTD cần kênh RTD riêng.'],
  params: [{ k: 'n', n: 'Số kênh AI/AO', m: '', u: 'kênh', i: '', h: 'Bảng I/O.', e: '4 AI + 2 AO.', c: '' }, { k: 'sig', n: 'Loại tín hiệu', m: '', u: '—', i: '', h: '', e: '4–20 mA, 0–10 V, Pt100.', c: '' }],
  example: { ok: { t: 'AI 4–20 mA cho cảm biến bức xạ 2 dây', d: 'Module cấp nguồn vòng hoặc dùng nguồn 24 V nối tiếp.' }, ko: { t: 'Kênh cấu hình 0–10 V cho cảm biến 4–20 mA', d: 'Giá trị đọc sai hoàn toàn.' } }
},

commmod: {
  name: 'Module truyền thông RS485', fr: 'Module de communication série', sym: 'KF (COM)', group: 'Truyền thông',
  func: 'Cho PLC làm Modbus RTU master trên bus RS485.',
  principle: 'Bộ thu phát RS485 cách ly; PLC gửi yêu cầu lần lượt tới từng slave.',
  notdo: 'Không chuyển đổi sang Ethernet cho thiết bị khác.', confusions: [['Gateway', 'Gateway cho thiết bị Ethernet đọc bus RS485.']],
  ports: { comm: 'D+ / D− / 0V chung (kẹp hoặc RJ45/SUB-D tùy hãng).' },
  accessories: ['Điện trở đầu cuối 120 Ω, phân cực.', 'Cáp xoắn đôi có giáp.'], compat: ['Pinout đầu nối.', 'Cách ly.', 'Chế độ 2 dây.'],
  params: [{ k: 'baud', n: 'Tốc độ hỗ trợ', m: '', u: 'baud', i: '', h: '', e: '9600–115200.', c: '' }],
  example: { ok: { t: 'Module RS485 cách ly + 3 slave', d: 'Bus 19200 8E1, địa chỉ 1, 11, 12.' }, ko: { t: 'Hai đầu nối RJ45 khác pinout', d: 'D+/D− đảo hoặc nối vào chân khác → không có trả lời.' } }
},

relayint: {
  name: 'Relay trung gian', fr: "Relais d'interface", sym: 'KA / KF', group: 'Điều khiển',
  func: 'Cách ly và khuếch đại: DO 24 VDC của PLC đóng mạch 230 VAC (cuộn contacteur), hoặc tiếp điểm khô cho thiết bị dùng nguồn khác (máy phát).',
  principle: 'Cuộn 24 VDC + tiếp điểm định mức 230 VAC / vài A; có LED và diode.',
  notdo: 'Không đo, không bảo vệ, không phải relay an toàn.', confusions: [['Relay bảo vệ', 'Relay bảo vệ đo và tự quyết định cắt.'], ['Relay an toàn', 'Relay an toàn có tự giám sát và chứng nhận PL/SIL.']],
  ports: { ctrl: 'Cuộn A1-A2 (từ DO), tiếp điểm 11-14 (tới thiết bị).' },
  accessories: ['Đế cắm.'], compat: ['Dòng tiếp điểm ≥ dòng hút cuộn contacteur.', 'Cuộn 24 VDC phù hợp DO.'],
  params: [{ k: 'contact', n: 'Định mức tiếp điểm', m: '', u: 'A @ V', i: '', h: '', e: '6 A 250 VAC (thường gặp, cần kiểm tra).', c: '' }],
  example: { ok: { t: 'KA cho KM-PCC, KM-GEN, KM-RL', d: 'Mỗi contacteur 230 VAC qua một KA.' }, ko: { t: 'Dùng KA cho dừng khẩn', d: 'Không có giám sát lỗi — dùng relay an toàn.' } }
},

safetyrelay: {
  name: 'Relay an toàn', fr: 'Relais de sécurité', sym: 'KS', group: 'An toàn',
  func: 'Thực hiện chức năng dừng khẩn: giám sát nút E-stop hai kênh, cắt KM-M1 và STO của biến tần, chỉ cho phép khởi động lại sau reset có chủ ý.',
  principle: 'Kênh dự phòng + tự kiểm tra; phát hiện chập chéo; tiếp điểm dẫn hướng cưỡng bức.',
  notdo: 'Không đo lưới, không thay bảo vệ điện.', confusions: [['Relay bảo vệ', 'Bảo vệ hệ thống điện.'], ['Relay trung gian', 'Không có tự kiểm tra.']],
  ports: { ctrl: 'Vào S11-S12/S21-S22 từ E-stop, nút reset, ra 13-14/23-24 an toàn, ra báo trạng thái về PLC.', aux: '24 VDC.' },
  accessories: ['Nút dừng khẩn hai tiếp điểm NC.', 'Nút reset.'], compat: ['PL/SIL đạt yêu cầu đánh giá rủi ro.', 'Dòng tiếp điểm an toàn với cuộn KM-M1.'],
  params: [{ k: 'pl', n: 'Cấp an toàn', m: '', u: 'PL / SIL', i: '', h: 'Đánh giá rủi ro (ISO 12100, ISO 13849-1).', e: 'Cần đánh giá.', c: '' }],
  example: { ok: { t: 'E-stop 2 kênh → KS → KM-M1 + STO', d: 'Dừng loại 0/1 theo IEC 60204-1 (cần đánh giá).' }, ko: { t: 'E-stop chỉ vào DI của PLC', d: 'Lỗi phần mềm/ngõ ra dính → không dừng được.' } }
},

estop: {
  name: 'Nút dừng khẩn', fr: "Bouton d'arrêt d'urgence", sym: 'SB', group: 'An toàn',
  func: 'Người vận hành dừng nguy hiểm ngay lập tức.', principle: 'Tiếp điểm NC mở cưỡng bức, tự giữ, nhả bằng xoay/kéo.',
  notdo: 'Không cắt nguồn toàn hệ thống (trừ khi được thiết kế); không thay cách ly.', confusions: [['Nút stop', 'Nút stop là dừng vận hành thường.']],
  ports: { ctrl: '2 tiếp điểm NC tới relay an toàn.' }, accessories: ['Vòng nền vàng.'], compat: ['IEC 60947-5-5, ISO 13850.'],
  params: [{ k: 'nc', n: 'Số tiếp điểm NC', m: '', u: '', i: '', h: '', e: '2 NC.', c: '' }],
  example: { ok: { t: 'Nút trên cửa tủ và gần động cơ', d: 'Nối tiếp hai kênh.' }, ko: { t: 'Nút NO', d: 'Đứt dây không phát hiện được.' } }
},

opanel: {
  name: 'Mặt tủ: nút nhấn, đèn, bộ chọn', fr: 'Boutons, voyants, commutateurs', sym: 'SB / PF / SA', group: 'Điều khiển',
  func: 'Điều khiển tại chỗ khi ở chế độ Local, chọn Auto/Manual, Local/Remote, báo đèn.',
  principle: 'Tiếp điểm vào DI, đèn từ DO.', notdo: '—', confusions: [['HMI', 'HMI là màn hình; nút cứng vẫn hoạt động khi HMI hỏng.']],
  ports: { ctrl: 'Tiếp điểm và đèn 24 VDC.' }, accessories: ['Nhãn.'], compat: ['Đèn 24 VDC LED; dòng < khả năng DO.'],
  params: [{ k: 'list', n: 'Danh sách', m: '', u: '', i: '', h: '', e: 'Chọn A/M, chọn L/R, Start/Stop M1, Reset, 3 đèn.', c: '' }],
  example: { ok: { t: 'Nút Stop NC', d: 'Đứt dây = dừng (fail-safe).' }, ko: { t: 'Stop NO', d: 'Đứt dây → nút Stop không có tác dụng.' } }
},

switch: {
  name: 'Switch Ethernet công nghiệp', fr: 'Commutateur Ethernet industriel', sym: 'KF (SW)', group: 'Truyền thông',
  func: 'Nối PLC, HMI, EMS, đồng hồ, inverter, PCS, biến tần… theo hình sao.',
  principle: 'Chuyển gói Ethernet theo địa chỉ MAC. Không xử lý giao thức ứng dụng.',
  notdo: 'Không chuyển Modbus RTU sang TCP; không làm hai thiết bị “hiểu” nhau.', confusions: [['Gateway', 'Gateway chuyển đổi giao thức.'], ['Router', 'Router nối hai mạng IP khác nhau.']],
  ports: { comm: 'N cổng RJ45 (10/100), có thể cổng quang.', aux: '24 VDC (có thể hai đầu vào dự phòng).' },
  accessories: ['Cáp Cat5e/6 có giáp cho môi trường công nghiệp.'], compat: ['Số cổng ≥ thiết bị + dự phòng.', 'Managed nếu cần VLAN/tách mạng.', 'Nguồn 24 V.'],
  params: [{ k: 'ports', n: 'Số cổng', m: '', u: 'cổng', i: '', h: 'Đếm thiết bị Ethernet (trang Chọn thiết bị).', e: '8 cổng.', c: '' }, { k: 'mgd', n: 'Managed / unmanaged', m: '', u: '', i: '', h: '', e: 'Unmanaged đủ cho bản đầu.', c: 'Khi nối với mạng doanh nghiệp → tách bằng firewall.' }],
  example: { ok: { t: 'Switch 8 cổng 24 VDC DIN', d: '7 thiết bị + 1 dự phòng — sát; cân nhắc 16 cổng.' }, ko: { t: 'Switch văn phòng 230 VAC', d: 'Mất lưới → mất mạng dù PLC có UPS.' } }
},

gateway: {
  name: 'Gateway Modbus TCP ↔ RTU', fr: 'Passerelle Modbus TCP/RTU', sym: 'KF (GW)', group: 'Truyền thông',
  func: 'Cho phép client Ethernet (EMS, PLC) đọc thiết bị RS485.',
  principle: 'Nhận yêu cầu Modbus TCP, chuyển thành khung RTU với địa chỉ = Unit ID, trả lời lại.',
  notdo: 'Không thay đổi register map; không làm nhanh hơn bus RS485.', confusions: [['Switch', 'Switch không đổi giao thức.']],
  ports: { comm: 'RJ45 Ethernet + RS485.', aux: '24 VDC.' }, accessories: [], compat: ['Timeout của client > thời gian vòng hỏi bus.', 'Một master duy nhất trên bus RS485.'],
  params: [{ k: 'mode', n: 'Chế độ', m: '', u: '', i: '', h: '', e: 'Transparent TCP→RTU.', c: '' }],
  example: { ok: { t: 'EMS đọc đồng hồ nhánh qua gateway', d: 'Khi PLC không có cổng RS485.' }, ko: { t: 'PLC module RS485 và gateway cùng làm master trên một bus', d: 'Hai master → xung đột khung.' } }
},

hmi: {
  name: 'Màn hình HMI', fr: 'Pupitre opérateur (IHM)', sym: 'P (HMI)', group: 'Giám sát',
  func: 'Hiển thị sơ đồ, giá trị, báo động; gửi lệnh vận hành tới PLC.',
  principle: 'Đọc/ghi biến (tag) của PLC qua Ethernet; không chạy logic điều khiển.', notdo: 'Không thay dừng khẩn; không trực tiếp điều khiển thiết bị trường.',
  confusions: [['SCADA', 'SCADA là phần mềm toàn hệ, nhiều màn hình, lưu lịch sử dài.']],
  ports: { comm: 'Ethernet.', aux: '24 VDC.' }, accessories: [], compat: ['Driver giao tiếp PLC (Modbus TCP hoặc giao thức hãng).'],
  params: [{ k: 'size', n: 'Kích thước', m: '', u: 'inch', i: '', h: '', e: '7–10 inch.', c: '' }],
  example: { ok: { t: 'HMI trên cửa tủ, Modbus TCP với PLC', d: '' }, ko: { t: 'HMI ghi trực tiếp vào thanh ghi biến tần', d: 'Bỏ qua kiểm tra điều kiện của PLC.' } }
},

ems: {
  name: 'SCADA / EMS (PC)', fr: 'Supervision / système de gestion de l’énergie', sym: 'SCADA/EMS', group: 'Giám sát',
  func: 'Lưu lịch sử, báo cáo, tối ưu dòng năng lượng (setpoint pin, giới hạn PV, kế hoạch EV), cổng ra cloud (MQTT), OCPP server.',
  principle: 'Đọc dữ liệu từ PLC (và có thể trực tiếp từ thiết bị); ghi setpoint vào PLC; PLC kiểm tra giới hạn trước khi chuyển tiếp.',
  notdo: 'Không thực hiện khóa liên động an toàn; mất PC không được làm hệ thống mất an toàn.', confusions: [['PLC', 'PLC thời gian thực, gần thiết bị.'], ['DMS', 'DMS của nhà quản lý lưới.']],
  ports: { comm: 'Ethernet.', aux: '230 VAC (tải ưu tiên) hoặc 24 V (IPC).' }, accessories: ['Phần mềm SCADA/EMS, cơ sở dữ liệu.'], compat: ['Driver Modbus TCP, OCPP, MQTT.'],
  params: [{ k: 'sw', n: 'Phần mềm', m: '', u: '', i: '', h: '', e: 'SCADA + EMS rule-based.', c: '' }],
  example: { ok: { t: 'EMS ghi P_bat_set vào PLC', d: 'PLC giới hạn trong ±5 kW và SOC.' }, ko: { t: 'EMS ghi trực tiếp vào PCS khi PLC đang điều khiển', d: 'Hai nơi ra lệnh → xung đột.' } }
},

pyrano: {
  name: 'Cảm biến bức xạ', fr: 'Pyranomètre / cellule de référence', sym: 'BG', group: 'Đo lường',
  func: 'Đo bức xạ để đánh giá hiệu suất PV.', principle: 'Ngõ ra 4–20 mA tỷ lệ W/m².', notdo: '', confusions: [],
  ports: { meas: 'Vòng 4–20 mA 2 dây.' }, accessories: [], compat: ['AI 4–20 mA.'],
  params: [{ k: 'range', n: 'Dải đo', m: '', u: 'W/m²', i: '', h: '', e: '0–1500 W/m² ↔ 4–20 mA.', c: '' }],
  example: { ok: { t: 'Cảm biến 4–20 mA 2 dây', d: '' }, ko: { t: 'Ngõ ra Modbus', d: 'Cần cổng RS485.' } }
},

lora: {
  name: 'Gateway LoRaWAN + cảm biến', fr: 'Passerelle LoRaWAN + capteurs', sym: '—', group: 'Truyền thông',
  func: 'Cảm biến không dây pin (nhiệt độ/độ ẩm phòng, nhiệt độ tủ) cho giám sát.',
  principle: 'Cảm biến gửi gói nhỏ vài phút/lần; network server giải mã và đẩy MQTT tới EMS.',
  notdo: 'Không dùng cho điều khiển hoặc bảo vệ.', confusions: [['Wi-Fi', 'Băng thông lớn, công suất cao.']],
  ports: { comm: 'Ăng-ten, Ethernet.' }, accessories: ['Network server (LNS).'], compat: ['Băng tần vùng (EU868, AS923…).'],
  params: [{ k: 'band', n: 'Băng tần', m: '', u: 'MHz', i: '', h: 'Quy định vùng.', e: 'EU868 (Pháp) — cần kiểm tra.', c: '' }],
  example: { ok: { t: 'Nhiệt độ phòng mỗi 5 phút', d: '' }, ko: { t: 'Lệnh sa thải tải qua LoRaWAN', d: 'Độ trễ và chu kỳ phát không đảm bảo.' } }
},

cabinet: {
  name: 'Tủ, thanh DIN, máng dây, thông gió, hàng kẹp, PE', fr: 'Enveloppe, rail DIN, goulottes, ventilation, borniers, barre PE', sym: '+', group: 'Tủ điện',
  func: 'Chứa và bảo vệ thiết bị; phân vùng công suất/điều khiển/truyền thông; tản nhiệt.',
  principle: 'Theo IEC 61439 (tủ) và hướng dẫn lắp đặt; tách tín hiệu yếu khỏi cáp công suất.',
  notdo: '', confusions: [], ports: {}, accessories: [], compat: ['Tổn hao nhiệt ≤ khả năng tản nhiệt.', 'IP theo môi trường.'],
  params: [{ k: 'heat', n: 'Tổn hao nhiệt', m: '', u: 'W', i: 'Quạt/lọc.', h: 'Tổng tổn hao.', e: 'Biến tần + PSU + relay ≈ 150 W (ước lượng).', c: '' }],
  example: { ok: { t: 'Tủ điều khiển riêng', d: 'Giảm nhiễu.' }, ko: { t: 'Cáp RS485 đi chung máng với cáp động cơ biến tần', d: 'Nhiễu gây lỗi truyền thông.' } }
}
};
