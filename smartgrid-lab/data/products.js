/* CATALOGUE SẢN PHẨM — tách khỏi giao diện.
   QUY TẮC: chỉ thêm sản phẩm khi đã đọc tài liệu chính hãng. Mỗi thông số ghi đúng giá trị trong tài liệu,
   kèm số trang (p) nếu tài liệu là PDF. Thông số không có trong tài liệu → KHÔNG ghi (công cụ sẽ báo “Thiếu dữ liệu”).
   date = ngày đọc/kiểm tra tài liệu. Phần mềm chưa đối chiếu tài liệu được đánh dấu verified: false.
   Để thêm sản phẩm: sao chép một mục, thay specs/docs, giữ nguyên tên khóa của vị trí (slot). */
SG.products = [
{
  id: 'sma-stp5-3av-40', slot: 'pvinv', brand: 'SMA', model: 'Sunny Tripower 5.0 (STP5.0-3AV-40)', role: 'Onduleur PV hòa lưới 3 pha, grid-following',
  docs: [
    { t: 'SMA — Operating manual STPxx-3AV-40, Technical data “Sunny Tripower 5.0 / 6.0”', url: 'https://manuals.sma.de/STPxx-3av-40-BE/en-US/3190775563.html', date: '2026-10-23' },
    { t: 'SMA — Technical data “General Data”', url: 'https://manuals.sma.de/STPxx-3av-40-BE/en-US/391507723.html', date: '2026-10-23' },
    { t: 'SMA — Technical data “Equipment”', url: 'https://manuals.sma.de/STPxx-3av-40-BE/en-US/391518219.html', date: '2026-10-23' },
    { t: 'SMA — “Configuring the Modbus Function”', url: 'https://manuals.sma.de/STPxx-3av-40-BE/en-US/1129302539.html', date: '2026-10-23' }
  ],
  specs: {
    Pac: { v: 5000, u: 'W', ref: 'Rated power at 230 V, 50 Hz' }, phases: { v: 3, ref: 'Feed-in phases: 3' }, Vac: { v: 400, u: 'V', ref: 'Nominal grid voltage 3/N/PE 230 V / 400 V' },
    Vdcmax: { v: 850, u: 'V', ref: 'Maximum input voltage' }, mpptMin: { v: 215, u: 'V', ref: 'MPP voltage range 215 V to 800 V' }, mpptMax: { v: 800, u: 'V', ref: 'MPP voltage range' },
    nMppt: { v: 2, ref: 'Number of independent MPP inputs' }, stringsPerMppt: { v: 1, ref: 'Strings per MPP input' },
    ImaxMppt: { v: 12, u: 'A', ref: 'Maximum input current, input A / B' }, IscMaxMppt: { v: 18, u: 'A', ref: 'Maximum short-circuit current, input A / B (IEC 62109-2)' },
    PdcMax: { v: 9000, u: 'Wp', ref: 'Maximum PV array power' }, Imaxac: { v: 7.6, u: 'A', ref: 'Maximum output current 3 × 7.6 A' },
    comm: { v: ['Modbus TCP (SMA Modbus / SunSpec Modbus, cổng 502)', 'Speedwire/Webconnect (Ethernet)', 'RS485', 'WLAN'], ref: 'Equipment + Configuring the Modbus Function (Modbus tắt theo mặc định, cổng 502)' },
    ip: { v: 'IP65', ref: 'General Data' }, temp: { v: '-25…+60 °C', ref: 'General Data' }, earthing: { v: 'IT, Delta-IT, TN-C, TN-S, TN-C-S, TT (VN_PE < 20 V)', ref: 'General Data' }
  },
  iface: 'DC: đầu nối SUNCLIX; AC: đầu nối AC; Ethernet RJ45 (Speedwire), RS485, WLAN',
  regmap: null, writeDoc: null,
  notes: ['Register map “Modbus® parameters and measured values” được manual nhắc tới (www.SMA-Solar.com) nhưng chưa có link cụ thể → quyền ghi giới hạn P: Thiếu dữ liệu.', 'Manual khuyến nghị firewall/VPN khi bật Modbus.'],
  software: [{ n: 'Giao diện cấu hình của inverter (web / ứng dụng SMA)', role: 'Bật Modbus, đặt IP, bộ dữ liệu quốc gia', lang: '—', lic: 'Cần kiểm tra', url: 'https://manuals.sma.de/STPxx-3av-40-BE/en-US/1129302539.html', verified: false }]
},
{
  id: 'se-atv320u22n4b', slot: 'vfd', brand: 'Schneider Electric', model: 'Altivar Machine ATV320U22N4B', role: 'Biến tần 2,2 kW, 3 pha 380–500 V',
  docs: [{ t: 'Schneider Electric — Fiche technique ATV320U22N4B (PDF, éditée le 23 oct. 2026)', url: 'https://www.se.com/fr/fr/product/download-pdf/ATV320U22N4B?filename=Schneider+Electric_Altivar-Machine-ATV320_ATV320U22N4B.pdf', date: '2026-10-23' }],
  specs: {
    Umin: { v: 380, u: 'V', p: 1, ref: '[Us] 380…500 V −15…10 %' }, Umax: { v: 500, u: 'V', p: 1, ref: '[Us] 380…500 V −15…10 %' }, phasesIn: { v: 3, p: 1, ref: 'Titre: 380/500V tri' },
    Pn: { v: 2.2, u: 'kW', p: 1, ref: '2,2 kW pour robuste (heavy duty)' }, InHD: { v: 5.5, u: 'A', p: 1, ref: 'Courant de sortie nominal 5,5 A' },
    Iline: { v: 8.7, u: 'A', p: 2, ref: 'Courant de ligne 8,7 A à 380 V (robuste)' }, Isc_line: { v: 5, u: 'kA', p: 2, ref: 'Courant de court-circuit présumé de ligne Isc 5 kA' },
    overtorque: { v: '170…200 % du couple nominal', p: 3, ref: 'Surcouple transitoire' },
    diLogic: { v: ['source', 'sink'], p: 1, ref: 'Entrée logique: logique positive (source) / négative (NPN)' }, di: { v: 'DI1…DI6 24 V CC + STO', p: 1 },
    ai: { v: 'AI1 0–10 V; AI2 ±10 V; AI3 0–20 mA / 4–20 mA', p: 1 }, ao: { v: 'AQ1 0–20 mA ou 0–10 V', p: 2 }, relays: { v: 'R1 (NO/NF) 3 A 250 V CA résistif; R2 (NO) 5 A 250 V CA résistif', p: 2 },
    comm: { v: ['Modbus RTU (Modbus série)', 'CANopen'], p: 1, ref: 'Protocole de port de communication; cartes optionnelles EtherNet/IP, Profinet, EtherCAT…' },
    sto: { v: true, p: 3, ref: 'Safe torque off (STO): Vrai' }, emc: { v: 'Filtre CEM intégré classe C2', p: 1 }, ip: { v: 'IP20', p: 1 }, loss: { v: 74, u: 'W', p: 2, ref: 'Puissance dissipée 74 W à 380 V, 4 kHz' }
  },
  iface: 'Bornes puissance L1-L2-L3 / U-V-W; bornier commande (DI, AI, AQ, relais, STO); port Modbus/CANopen RJ45',
  regmap: null, writeDoc: null,
  notes: ['Khả năng quá tải theo % dòng không ghi trong datasheet (chỉ ghi quá mô-men 170–200 %) → kiểm tra trong catalogue/manual.', 'Ethernet chỉ có qua carte optionnelle → PLC đọc qua Modbus RTU hoặc thêm thẻ.'],
  software: [{ n: 'SoMove (cấu hình biến tần)', role: 'Cài đặt tham số, nạp/sao lưu cấu hình', lang: '—', lic: 'Cần kiểm tra', url: '', verified: false }]
},
{
  id: 'se-pm5560', slot: 'meter-pcc', brand: 'Schneider Electric', model: 'PowerLogic PM5560 (METSEPM5560)', role: 'Centrale de mesure, Ethernet + RS485',
  docs: [{ t: 'Schneider Electric — Fiche technique METSEPM5560 (PDF, 23 oct. 2026)', url: 'https://www.se.com/fr/fr/product/download-pdf/METSEPM5560?filename=Schneider+Electric_PowerLogic-PM5000_METSEPM5560.pdf', date: '2026-10-23' }],
  specs: {
    Umax: { v: 828, u: 'V', p: 1, ref: 'Tension de mesure 20…828 V CA entre phases' }, network: { v: '3P+N, 3P, 1P+N', p: 1 }, Iin: { v: 'CT 1 A / 5 A', p: 1, ref: '[In] courant nominal 1 A / 5 A' },
    acc: { v: 'Classe 0,2S énergie active (CEI 62053-22)', p: 2 }, comm: { v: ['Modbus RTU', 'Modbus TCP', 'BACnet IP', 'DNP3'], p: 2, ref: 'Modbus RTU/ASCII 9,6–38,4 kbauds; Modbus TCP/IP 10/100 Mbit/s; passerelle Ethernet/série' },
    ports: { v: '2 × RJ45 Ethernet (daisy chain) + RS485', p: 2 }, supply: { v: '90…528 V CA / 100…300 V CC', p: 1 }, dio: { v: '4 DI / 2 DO', p: 2 }, ip: { v: 'IP54 face avant / IP30 arrière', p: 3 }, temp: { v: '−25…70 °C', p: 3 }
  },
  iface: 'Bornier tension, bornier TC (6), RS485 (bornier), 2 × RJ45',
  regmap: null, writeDoc: null, notes: ['Cần 3 TC ngõ ra 1 A hoặc 5 A (chưa có TC đã xác minh trong catalogue).', 'Register map: tài liệu riêng của Schneider — chưa có link.'],
  software: [{ n: 'Cấu hình qua màn hình / trang web tích hợp', role: 'Tỷ số TC, kiểu mạng, IP', lang: '—', lic: 'Cần kiểm tra', url: '', verified: false }]
},
{
  id: 'se-iem3155', slot: 'meter-branch', slots: ['meter-branch', 'meter-pcc'], brand: 'Schneider Electric', model: 'Acti9 iEM3155 (A9MEM3155)', role: 'Compteur d’énergie 63 A direct, Modbus RTU',
  docs: [{ t: 'Schneider Electric — Fiche technique A9MEM3155 (PDF, 23 oct. 2026)', url: 'https://www.se.com/fr/fr/product/download-pdf/A9MEM3155?filename=Schneider+Electric_PowerLogic-iEM3000_A9MEM3155.pdf', date: '2026-10-23' }],
  specs: {
    Umax: { v: 480, u: 'V', p: 2, ref: 'Tension nominale 100…277 V / 173…480 V' }, network: { v: '3P+N, 1P+N, 3P', p: 1 }, Iin: { v: 'direct', p: 2, ref: 'Connexion directe' }, Idirect: { v: 63, u: 'A', p: 2 },
    acc: { v: 'Classe 1 (CEI 62053-21, CEI 61557-12), Classe B (EN 50470-3), MID', p: 2 }, comm: { v: ['Modbus RTU'], p: 2, ref: 'Modbus RTU 9,6 / 19,2 / 38,4 kbauds, pair/impair/aucune, isolation 4000 V; bornier RS485' },
    dio: { v: '1 DI (24 V CC) / 1 DO statique 5…40 V CC 50 mA', p: 2 }, mount: { v: 'Rail DIN, bornes 16 mm²', p: 2 }
  },
  iface: 'Bornes à vis puissance 16 mm²; RS485 bornier à vis',
  regmap: null, writeDoc: null, notes: ['Chỉ có RS485: không đọc trực tiếp được bằng Modbus TCP.'],
  software: []
},
{
  id: 'se-tm221ce24t', slot: 'plc', brand: 'Schneider Electric', model: 'Modicon M221 TM221CE24T', role: 'PLC 24 E/S, Ethernet + série',
  docs: [{ t: 'Schneider Electric — Fiche technique TM221CE24T (PDF, 22 oct. 2026)', url: 'https://www.se.com/fr/fr/product/download-pdf/TM221CE24T?filename=Schneider+Electric_Modicon-M221_TM221CE24T.pdf', date: '2026-10-23' }],
  specs: {
    supply: { v: '24 V CC (20,4…28,8 V)', p: 1 }, diBase: { v: 14, p: 1, ref: '14 entrées TOR (dont 4 rapides), CEI 61131-2 Type 1' }, diType: { v: 'PNP ou NPN (positive/négative), 24 V CC', p: 1 },
    doBase: { v: 10, p: 1, ref: '10 sorties transistor (2 rapides)' }, doType: { v: 'transistor source', p: 2, ref: 'Sortie logique: logique positive (source); 0,5 A; 5 A par groupe' },
    aiBase: { v: 2, p: 1 }, aiType: { v: '0…10 V', p: 1 }, aoBase: { v: 0 }, expModules: { v: 7, p: 1, ref: '7 modules d’extension (architecture locale)' },
    comm: { v: ['Modbus TCP (client + serveur)', 'Modbus RTU (maître/esclave, RS232/RS485)', 'EtherNet/IP (adaptateur)'], p: 3 },
    serial: { v: '1 port RJ45 RS232/RS485 non isolé, 1,2…115,2 kbit/s', p: 3 }, ethPorts: { v: 1, p: 3 }, power: { v: '4,8 W (sans extension) / 14 W (max)', p: 1 }
  },
  iface: 'Bornier débrochable E/S; RJ45 Ethernet; RJ45 série RS232/RS485; mini-USB programmation',
  regmap: null, writeDoc: null,
  notes: ['Analog 4–20 mA, Pt100 và AO cần module mở rộng (chưa có module đã xác minh trong catalogue).', 'Cổng RS485 tích hợp không cách ly — cân nhắc bộ cách ly khi bus dài.'],
  software: [{ n: 'EcoStruxure Machine Expert – Basic', role: 'Lập trình PLC M221', lang: 'Ladder (LD), Instruction List', lic: 'Cần kiểm tra', url: '', verified: false }]
},
{
  id: 'se-hmist6400', slot: 'hmi', brand: 'Schneider Electric', model: 'Harmony ST6 HMIST6400', role: 'Écran tactile 7", 2 × Ethernet, 24 V CC',
  docs: [{ t: 'Schneider Electric — Fiche technique HMIST6400 (PDF, 22 oct. 2026)', url: 'https://www.se.com/fr/fr/product/download-pdf/HMIST6400?filename=Schneider+Electric_Harmony-ST6_HMIST6400.pdf', date: '2026-10-23' }],
  specs: {
    size: { v: '7 pouces 800 × 480', p: 1 }, supply: { v: '24 V CC ±20 %, 9 W', p: 1 }, comm: { v: ['2 × Ethernet 10/100', 'RS232 (COM1)', 'RS485 (COM2)'], p: 1 },
    drivers: { v: ['Modbus', 'Uni-TE', 'Schneider Electric', 'Mitsubishi', 'Omron', 'Rockwell Automation', 'Siemens'], p: 2, ref: 'Protocoles téléchargeables: Modbus, Uni-TE; protocoles tiers' },
    ip: { v: 'IP65 face avant / IP20 arrière', p: 2 }, temp: { v: '0…50 °C', p: 2 }
  },
  iface: '2 × RJ45 Ethernet; SUB-D9 RS232; RJ45 RS485; USB',
  regmap: null, writeDoc: null, notes: [],
  software: [{ n: 'Phần mềm thiết kế màn hình Harmony ST6', role: 'Thiết kế màn hình HMI', lang: '—', lic: 'Cần kiểm tra', url: '', verified: false }]
},
{
  id: 'se-abls1a24100', slot: 'psu', brand: 'Schneider Electric', model: 'Modicon ABL ABLS1A24100', role: 'Alimentation 24 V CC 10 A',
  docs: [{ t: 'Schneider Electric — Fiche technique ABLS1A24100 (PDF, 23 oct. 2026)', url: 'https://www.se.com/fr/fr/product/download-pdf/ABLS1A24100?filename=Schneider+Electric_Modicon-Power-Supply_ABLS1A24100.pdf', date: '2026-10-23' }],
  specs: {
    Vin: { v: '100…240 V CA mono/biphasé; 140…340 V CC', p: 1 }, Iout: { v: 10, u: 'A', p: 1 }, P: { v: 240, u: 'W', p: 1 },
    inrush: { v: '60 A à 230 V', p: 1 }, extProt: { v: 'Protection externe recommandée 6 A ou 20 A courbe B/C', p: 1 }, holdup: { v: '> 20 ms', p: 1 },
    dcok: { v: false, p: 2, ref: 'Seule signalisation: 1 DEL (vert) tension de sortie — pas de contact DC-OK listé' }, parallel: { v: 'Parallèle / série', p: 2 }
  },
  iface: 'Bornes à vis entrée/sortie, rail DIN', regmap: null, writeDoc: null,
  notes: ['Không có tiếp điểm DC-OK trong datasheet → không báo được PSU_OK về DI (cần module giám sát riêng hoặc chọn nguồn khác).'], software: []
},
{
  id: 'se-tcsesu083fn0', slot: 'switch', brand: 'Schneider Electric', model: 'ConneXium TCSESU083FN0', role: 'Switch non managé 8 ports',
  discontinued: 'Arrêt de commercialisation — production arrêtée le 15 oct. 2021, fin de service le 31 août 2026 (fiche technique p. 1)',
  docs: [{ t: 'Schneider Electric — Fiche technique TCSESU083FN0 (PDF, 23 oct. 2026)', url: 'https://www.se.com/fr/fr/product/download-pdf/TCSESU083FN0?filename=Schneider+Electric_ConneXium_TCSESU083FN0.pdf', date: '2026-10-23' }],
  specs: { ports: { v: 8, p: 1 }, Vin: { v: '12…24 V CC (9,6…32 V SELV)', p: 1 }, ip: { v: 'IP30', p: 1 } },
  iface: 'RJ45 blindé', regmap: null, writeDoc: null, notes: [], software: []
}
];
