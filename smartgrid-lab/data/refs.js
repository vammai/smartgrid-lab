/* So sánh các thiết bị dễ nhầm, thành phần trạm công nghiệp “khi nào cần”, tài liệu tham khảo. */
SG.compare = [
{ n: 'Relay trung gian, relay bảo vệ, relay an toàn', cols: ['', 'Relay trung gian (KA)', 'Relay bảo vệ (tách lưới)', 'Relay an toàn (KS)'],
  rows: [
    ['Câu hỏi nó trả lời', 'Chuyển tiếp một lệnh ON/OFF', 'Lưới có bình thường không? Có phải cắt không?', 'Có yêu cầu dừng khẩn không? Mạch an toàn còn tốt không?'],
    ['Đầu vào', 'Cuộn 24 VDC từ DO PLC', 'Điện áp (và/hoặc dòng) đo trực tiếp', 'Tiếp điểm NC hai kênh của nút dừng khẩn, cửa…'],
    ['Đầu ra', 'Tiếp điểm đóng cuộn contacteur 230 VAC', 'Lệnh trip tới KM-PCC/MX', 'Tiếp điểm an toàn cắt KM-M1, STO biến tần'],
    ['Tự kiểm tra lỗi', 'Không', 'Có watchdog nội bộ', 'Có (dự phòng, phát hiện chập, dính tiếp điểm)'],
    ['Chứng nhận', 'Không', 'Theo quy định đấu nối', 'PL/SIL (ISO 13849-1 / IEC 62061)'],
    ['Trong mô hình', 'KA1… cho KM-PCC, KM-GEN, KM-RL, remote start', 'RLY-DEC', 'KS cho động cơ M1']
  ] },
{ n: 'Disjoncteur, contacteur, sectionneur, interrupteur-sectionneur', cols: ['', 'Disjoncteur', 'Contacteur', 'Sectionneur', 'Interrupteur-sectionneur'],
  rows: [
    ['Cắt dòng tải bình thường', 'Có', 'Có (thiết kế cho việc này)', 'KHÔNG', 'Có'],
    ['Tự cắt ngắn mạch/quá tải', 'Có', 'Không', 'Không', 'Không'],
    ['Đóng cắt thường xuyên', 'Không (ít lần)', 'Có (10⁵–10⁶ lần)', 'Không', 'Thỉnh thoảng'],
    ['Cách ly an toàn để làm việc', 'Có nếu ghi “phù hợp cách ly”', 'Không', 'Có', 'Có'],
    ['Điều khiển từ xa', 'Chỉ với MX/MN (cắt) và motor (đóng)', 'Có (cuộn hút)', 'Không', 'Chỉ loại có motor'],
    ['Trong mô hình', 'QF0, QF-…', 'KM-PCC, KM-GEN, KM-M1, KM-RL', 'Phía DC PV (sectionneur DC)', 'QS0']
  ] },
{ n: 'PLC, RTU, IED, HMI, SCADA, EMS', cols: ['', 'PLC', 'RTU', 'IED', 'HMI', 'SCADA', 'EMS'],
  rows: [
    ['Vai trò chính', 'Logic điều khiển thời gian thực', 'Thu thập & truyền về trung tâm xa', 'Bảo vệ/điều khiển ngăn lộ trong trạm', 'Thao tác tại chỗ', 'Giám sát toàn hệ, lịch sử, báo động', 'Tối ưu năng lượng, setpoint'],
    ['Vị trí', 'Tủ điều khiển', 'Trạm xa', 'Ngăn lộ trạm biến áp', 'Cửa tủ', 'PC/máy chủ', 'PC/máy chủ/cloud'],
    ['Giao thức điển hình', 'Modbus, hãng', 'IEC 104, DNP3', 'IEC 61850', 'Driver PLC', 'Nhiều', 'Modbus, OCPP, MQTT'],
    ['Mất thiết bị này thì', 'Mất tự động hóa', 'Trung tâm mất giám sát', 'Mất bảo vệ ngăn lộ', 'Còn nút cứng', 'Mất lịch sử', 'Mất tối ưu, PLC chạy luật dự phòng'],
    ['Trong mô hình', 'Có', 'Chưa cần', 'Chưa (relay tách lưới đơn giản)', 'Có', 'Có (PC)', 'Có (cùng PC)']
  ] },
{ n: 'BMS, PCS, inverter PV', cols: ['', 'BMS', 'PCS', 'Inverter PV'],
  rows: [
    ['Chuyển đổi công suất', 'Không', 'Có, hai chiều DC↔AC', 'Có, một chiều DC→AC'],
    ['Quyết định', 'Giới hạn an toàn của pin', 'Thực hiện setpoint trong giới hạn', 'Lấy công suất cực đại (MPPT) trong giới hạn'],
    ['Tạo lưới', '—', 'Nếu là grid-forming', 'Thường không (grid-following)'],
    ['Giao tiếp chính', 'CAN tới PCS', 'Modbus TCP tới PLC/EMS + CAN tới BMS', 'Modbus TCP/SunSpec tới PLC/EMS']
  ] },
{ n: 'Đo lường, bảo vệ, điều khiển', cols: ['', 'Đo lường', 'Bảo vệ', 'Điều khiển'],
  rows: [
    ['Mục tiêu', 'Biết giá trị (giám sát, năng lượng)', 'Cắt sự cố nhanh, tự động, độc lập', 'Đưa hệ thống tới trạng thái mong muốn'],
    ['Thời gian', 'Giây', 'Mili-giây', 'Trăm ms – giây'],
    ['Phụ thuộc PLC/truyền thông', 'Thường có', 'KHÔNG được phụ thuộc', 'Có'],
    ['Ví dụ', 'PM-PCC, PM-RL', 'QF-RL, relay tách lưới, KS', 'PLC sa thải tải, EMS sạc pin']
  ] },
{ n: 'Grid-following và grid-forming', cols: ['', 'Grid-following', 'Grid-forming'],
  rows: [
    ['Hành vi', 'Nguồn dòng bám theo U/f có sẵn', 'Nguồn áp: tự đặt U và f'],
    ['Khi mất lưới', 'Ngừng phát (chống tách đảo)', 'Có thể tiếp tục cấp điện cho microgrid đã tách'],
    ['Cân bằng công suất', 'Do lưới (hoặc nguồn tạo lưới) đảm nhận', 'Tự động hấp thụ/cấp chênh lệch trong giới hạn'],
    ['Trong mô hình', 'Inverter PV', 'PCS (nếu chọn) hoặc máy phát']
  ] },
{ n: 'Chuyển nguồn và vận hành song song', cols: ['', 'Chuyển nguồn (break-before-make)', 'Song song (make-before-break / liên tục)'],
  rows: [
    ['Hai nguồn AC cùng nối thanh cái', 'Không bao giờ', 'Có'],
    ['Cần đồng bộ', 'Không (đóng trên thanh cái chết)', 'Bắt buộc (U, f, góc pha)'],
    ['Gián đoạn tải', 'Có, ngắn', 'Không'],
    ['Trong mô hình', 'Lưới ↔ máy phát (cho phép)', 'Máy phát–lưới: KHÓA; PCS–máy phát chỉ khi có đồng bộ']
  ] },
{ n: 'Mất lưới và khả năng cấp điện dự phòng', cols: ['', 'Hệ thống chỉ có PV hòa lưới', 'Có PCS grid-forming + thiết bị tách', 'Có máy phát + chuyển nguồn'],
  rows: [
    ['Khi mất lưới', 'Mất điện (kể cả trời nắng)', 'Tách đảo, cấp tải ưu tiên', 'Mất điện vài giây → máy phát cấp'],
    ['Thời gian cấp', '0', 'Theo SOC', 'Theo nhiên liệu'],
    ['Điều kiện', '—', 'KM-PCC, relay tách lưới, UPS điều khiển, nối đất khi đảo', 'Khóa liên động, UPS điều khiển']
  ] }
];

SG.extensions = [
{ n: 'Biến điện áp (VT/TT)', need: 'Chưa cần', why: 'Ở 400 V, đồng hồ và relay đo áp trực tiếp. VT cần khi đấu nối trung thế hoặc khi thiết bị chỉ có ngõ vào 100/110 V.' },
{ n: 'Relay bảo vệ quá dòng riêng (50/51)', need: 'Chưa cần', why: 'Máy cắt hạ áp có bộ bảo vệ tích hợp. Relay riêng cần với máy cắt trung thế hoặc khi cần bảo vệ phức tạp (hướng, so lệch).' },
{ n: 'Relay tách lưới', need: 'Cần khi bật vận hành đảo', why: 'Thiết bị tách tại PCC phải được điều khiển bởi bảo vệ chuyên dụng. Ngưỡng theo quy định đấu nối.' },
{ n: 'RTU', need: 'Chưa cần', why: 'Không có trung tâm điều độ cần giám sát mô hình. PLC + SCADA đủ.' },
{ n: 'IEC 61850', need: 'Mở rộng', why: 'Hữu ích để đào tạo tự động hóa trạm; cần IED và công cụ cấu hình SCL.' },
{ n: 'IEC 60870-5-104', need: 'Mở rộng', why: 'Khi cần trao đổi với SCADA của điện lực.' },
{ n: 'DMS/ADMS', need: 'Không thuộc phạm vi', why: 'Phần mềm vận hành lưới phân phối của điện lực.' },
{ n: 'Đồng bộ thời gian chính xác (PTP)', need: 'Chưa cần', why: 'NTP (ms) đủ cho nhật ký sự kiện. PTP cần cho PMU, Sampled Values, ghi sự cố đồng bộ.' },
{ n: 'Bộ hòa đồng bộ / chia tải máy phát', need: 'Mở rộng', why: 'Chỉ khi muốn chuyển nguồn không gián đoạn hoặc song song.' },
{ n: 'Firewall/router công nghiệp', need: 'Cần khi nối mạng ngoài', why: 'Khi EMS đẩy dữ liệu lên cloud hoặc truy cập từ xa: tách mạng điều khiển (IEC 62443).' }
];

SG.refs = [
{ g: 'Lắp đặt hạ áp & tủ điện', items: [
  ['IEC 60364 (các phần 4-41, 4-43, 5-52, 5-53…)', 'Lắp đặt điện hạ áp: chống điện giật, quá dòng, chọn cáp, thiết bị đóng cắt', 'https://webstore.iec.ch'],
  ['NF C 15-100 (Pháp)', 'Quy chuẩn lắp đặt hạ áp tại Pháp — kiểm tra phiên bản hiện hành', 'https://www.boutique.afnor.org'],
  ['IEC 61439-1/-2', 'Tủ điện hạ áp', 'https://webstore.iec.ch'],
  ['IEC 60529', 'Cấp bảo vệ IP', 'https://webstore.iec.ch'] ] },
{ g: 'Thiết bị đóng cắt & bảo vệ', items: [
  ['IEC 60947-2', 'Máy cắt công nghiệp', 'https://webstore.iec.ch'],
  ['IEC 60898-1', 'Máy cắt dân dụng (MCB)', 'https://webstore.iec.ch'],
  ['IEC 60947-3', 'Cầu dao, cầu dao cách ly', 'https://webstore.iec.ch'],
  ['IEC 60947-4-1', 'Contacteur và khởi động động cơ', 'https://webstore.iec.ch'],
  ['IEC 60947-6-1', 'Thiết bị chuyển nguồn (ATSE)', 'https://webstore.iec.ch'],
  ['IEC 61643-11 / IEC 61643-31', 'Chống sét lan truyền AC / DC-PV', 'https://webstore.iec.ch'],
  ['IEC 60269-6', 'Cầu chì gPV', 'https://webstore.iec.ch'] ] },
{ g: 'Đo lường', items: [
  ['IEC 61869-2', 'Biến dòng', 'https://webstore.iec.ch'],
  ['IEC 61557-12', 'Thiết bị đo và giám sát (PMD)', 'https://webstore.iec.ch'],
  ['IEC 62053-21/-22', 'Công tơ điện năng', 'https://webstore.iec.ch'] ] },
{ g: 'PV, lưu trữ, đấu nối lưới', items: [
  ['IEC 60364-7-712', 'Lắp đặt hệ PV', 'https://webstore.iec.ch'],
  ['UTE C 15-712-1 / -3 (Pháp)', 'Hướng dẫn lắp đặt PV / lưu trữ pin — kiểm tra phiên bản', 'https://www.boutique.afnor.org'],
  ['IEC 62109-1/-2', 'An toàn bộ biến đổi PV', 'https://webstore.iec.ch'],
  ['IEC 62116', 'Thử nghiệm chống tách đảo inverter', 'https://webstore.iec.ch'],
  ['EN 50549-1', 'Yêu cầu nguồn phát nối lưới hạ áp (châu Âu)', 'https://www.cenelec.eu'],
  ['VDE-AR-N 4105', 'Quy tắc đấu nối hạ áp (Đức) — ví dụ', 'https://www.vde.com'],
  ['IEC 62619 / IEC 62933', 'An toàn pin lithium công nghiệp / hệ lưu trữ năng lượng', 'https://webstore.iec.ch'],
  ['Quy định của đơn vị điện lực nơi lắp (ví dụ Enedis tại Pháp)', 'Ngưỡng bảo vệ tách lưới, điều kiện phát lên lưới, thủ tục', 'https://www.enedis.fr'] ] },
{ g: 'Máy điện, máy phát, EV', items: [
  ['IEC 60034-1 / 60034-30-1', 'Động cơ / cấp hiệu suất IE', 'https://webstore.iec.ch'],
  ['IEC 61800-5-2', 'Chức năng an toàn của biến tần (STO)', 'https://webstore.iec.ch'],
  ['ISO 8528', 'Tổ máy phát điện', 'https://www.iso.org'],
  ['IEC 61851-1 / IEC 62196', 'Sạc EV chế độ 3 / đầu nối', 'https://webstore.iec.ch'] ] },
{ g: 'Điều khiển & an toàn máy', items: [
  ['IEC 61131-2 / -3', 'PLC: phần cứng / ngôn ngữ lập trình', 'https://webstore.iec.ch'],
  ['IEC 60204-1', 'Thiết bị điện của máy', 'https://webstore.iec.ch'],
  ['ISO 13849-1 / IEC 62061', 'An toàn chức năng (PL / SIL)', 'https://www.iso.org'],
  ['ISO 13850 / IEC 60947-5-5', 'Dừng khẩn cấp', 'https://www.iso.org'],
  ['IEC 62443', 'An ninh mạng hệ thống điều khiển', 'https://webstore.iec.ch'] ] },
{ g: 'Truyền thông', items: [
  ['Modbus Application Protocol & Modbus over Serial Line', 'Đặc tả Modbus chính thức', 'https://modbus.org/specs.php'],
  ['SunSpec Information Models', 'Register map chuẩn hóa cho inverter/pin', 'https://sunspec.org'],
  ['MQTT (OASIS)', 'Đặc tả MQTT', 'https://mqtt.org'],
  ['OCPP', 'Open Charge Alliance', 'https://openchargealliance.org'],
  ['LoRaWAN', 'LoRa Alliance', 'https://lora-alliance.org'],
  ['CAN / CANopen', 'CAN in Automation', 'https://www.can-cia.org'],
  ['IEC 61850 / IEC 60870-5-104', 'Tự động hóa trạm / viễn thông điều độ', 'https://webstore.iec.ch'],
  ['IEEE 1588', 'PTP đồng bộ thời gian chính xác', 'https://standards.ieee.org'] ] },
{ g: 'Nhà sản xuất (ví dụ để tra datasheet)', items: [
  ['Schneider Electric', 'Acti9, TeSys, Compact NSX, PowerLogic, Altivar, Modicon, Harmony — tra cứu datasheet từng mã', 'https://www.se.com'],
  ['Các hãng khác', 'ABB, Siemens, Phoenix Contact, Wago, SMA, Fronius, Victron… — không giới hạn hệ thống vào một hãng', ''] ] }
];
