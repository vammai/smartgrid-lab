/* EN — communication, traces, comparisons, extensions, references, scenarios, products */
SG.I18D.en.commLayers = {
  conn: { n: 'Physical connector', q: 'Where does it plug in?', ex: 'RJ45, M12, 3-pin screw terminal, SUB-D 9, solar cable connector', note: 'The same connector does not mean the same interface: many manufacturers put RS485 or CAN on an RJ45 port with their own pinout. Plugging an Ethernet cable into it does not work and may even cause damage.' },
  elec: { n: 'Electrical interface / physical layer', q: 'What does the electrical signal on the wire look like?', ex: '10/100BASE-TX, RS485 (2-wire differential), CAN (ISO 11898-2), 24 VDC contacts, 4–20 mA, LoRa 868 MHz radio', note: 'Determines distance, number of devices, whether termination resistors are needed and whether there is isolation.' },
  net: { n: 'Network / link & transport', q: 'How does a packet find its way to the device?', ex: 'Ethernet + IP + TCP (IP address, port 502), master–slave serial bus (slave address), CAN bus (message ID), LoRaWAN star network', note: 'Ethernet is a network technology; Modbus is an application protocol. They are not at the same level, so it is never a choice of “Ethernet or Modbus”.' },
  app: { n: 'Application protocol & data model', q: 'Do both sides understand the content the same way?', ex: 'Modbus (registers + register map), MQTT (self-defined topics/payloads), OCPP, SunSpec, IEC 61850 (standardised model)', note: 'Even when both “support Modbus” they must match: function codes, register addresses, data types, word order, scale factors, units, and whether the device actually provides the quantity you need.' }
};

SG.I18D.en.comms = {
  mbrtu: { n: 'Modbus RTU over RS485', lv: { conn: 'D+/D−/0V screw terminals (or RJ45/SUB-D depending on the manufacturer — check the pinout)', elec: '2-wire differential RS485, half-duplex', net: 'Serial bus, 1 master, up to 32 unit loads per segment (depending on transceivers), slave addresses 1–247', app: 'Modbus RTU: function codes 03/04 read, 06/16 write; CRC16' },
    ends: ['PLC: RS485 module (master/client)', 'Feeder meters, generator controller: RS485 port (slave/server)'],
    cable: 'Shielded twisted pair, ~120 Ω impedance, + common 0 V wire. Daisy-chain topology; no star wiring; short stubs.',
    roles: 'The master (client) polls in turn; a slave (server) only answers when addressed. Only one master on the bus.',
    params: ['Slave address of each device (all different)', 'Baud rate (e.g. 19200)', 'Parity + stop bits (e.g. 8E1) — identical on the whole bus', 'Timeout and number of retries', 'Delay between requests', 'Register map: addresses (0-based or 1-based!), function codes, data types (INT16/UINT32/FLOAT32), word order, scale factors'],
    data: ['P, U, I, f, E of the feeder meters', 'Generator P, U, f, status'],
    extra: 'Needs an RS485 module for the PLC (or a PLC with a built-in port), or a gateway if the master is an Ethernet device. 120 Ω resistors at both ends of the bus; biasing at one point.',
    limits: ['Slow: each request takes tens of ms; 10 devices × 5 requests ≈ 1–2 s per cycle.', 'Bus length depends on baud rate (up to about 1200 m at low speed).'],
    errors: ['D+/D− swapped (A/B naming differs between manufacturers!)', 'Missing/extra termination resistors', 'Two devices with the same address', 'Wrong parity on one device → only that device stays silent', 'Register address off by one (0-based vs 1-based) → meaningless values', 'FLOAT32 read with the wrong word order → huge numbers', 'No common 0 V → random errors', 'Two masters on one bus'] },
  mbtcp: { n: 'Modbus TCP over Ethernet', lv: { conn: 'RJ45 (or M12)', net: 'Ethernet + IP + TCP, port 502; star topology via a switch', app: 'Modbus (same register model as RTU) wrapped in an MBAP header with a Unit ID' },
    ends: ['PLC/EMS: client', 'PCC meter, inverter, PCS, drive: server'],
    cable: 'Shielded Cat5e/6, ≤ 100 m per segment; 24 VDC industrial switch.',
    roles: 'The client opens a TCP connection to the server and sends requests. Several clients can query one server if it allows enough connections.',
    params: ['IP address, subnet mask, default gateway (same range, no duplicates)', 'Port 502', 'Unit ID (usually 1 or 255; important through a gateway)', 'Polling cycle, timeout', 'Register map as for RTU'],
    data: ['Signed PCC P, U, f', 'PV P, status, P limit (write)', 'Battery P, SOC, setpoint (write)', 'Drive speed, current, faults'],
    extra: 'Ethernet switch. No gateway needed if both sides are Ethernet.',
    limits: ['Simultaneous TCP connections of a device (may be only 2–4) — PLC + EMS + commissioning tool may exceed it.', 'No guaranteed real time; not for protection.'],
    errors: ['Duplicate IP', 'Device on a different IP range', 'Wrong Unit ID', 'Device has RJ45 but only runs a proprietary protocol/web, Modbus TCP not enabled', 'Register map differs between firmware versions', 'Continuously writing a setpoint to a register stored in EEPROM → memory wear-out'] },
  hw: { n: 'Hard-wired DI/DO signals', lv: { conn: 'Screw/spring terminals on terminal block X2', elec: '24 VDC (dry contact, PNP), or 230 VAC after a relay', net: 'Point-to-point, no network', app: 'No protocol: 1 wire = 1 meaning (ON/OFF)' },
    ends: ['Device: auxiliary contacts, signalling relays, coils', 'PLC: DI/DO'],
    cable: '0.75–1 mm², wires numbered at both ends.',
    roles: 'No client/server. Fixed signal direction.',
    params: ['PNP/NPN logic (sink/source)', '24 VDC voltage', 'NO or NC (choose NC for signals that must be fail-safe)', 'Input filter delay'],
    data: ['OF/SD states, contactor feedback', 'Drive run command, KA coils'],
    extra: 'Interface relays for different voltage/current; suppression diodes/RC.',
    limits: ['Each signal uses 1 channel and 1–2 wires.'],
    errors: ['PNP device on an NPN input', 'Using NO for the Stop button', 'Transistor DO wired to an AC load', 'Forgetting the common 0 V between two supplies'] },
  analog: { n: 'Analogue 4–20 mA / 0–10 V / RTD signals', lv: { conn: 'Screw terminals', elec: '4–20 mA current loop, 0–10 V voltage, Pt100 resistance', net: 'Point-to-point', app: 'None: value = linear scaling, configured in the PLC' },
    ends: ['Sensor/drive', 'AI/AO module'],
    cable: 'Shielded twisted cable, shield earthed at one end; separated from power cables.',
    params: ['Signal type of each channel', 'Scaling (e.g. 4 mA = 0, 20 mA = 1500 W/m²)', 'Loop supply for 2-wire devices', 'Filtering'],
    data: ['Irradiance, temperature', 'Drive speed reference'],
    extra: 'Signal isolator if potentials differ.',
    limits: ['One value per wire pair.'], errors: ['Channel configured 0–10 V for a 4–20 mA sensor', 'Shield earthed at both ends creating a ground loop', '2-wire Pt100 on a long cable → measurement error'] },
  mqtt: { n: 'MQTT over IP networks', lv: { elec: 'Ethernet / radio', net: 'TCP/IP, port 1883 (8883 with TLS)', app: 'MQTT publish/subscribe; payload (JSON…) defined by the integrator' },
    ends: ['Device/gateway: publishing client', 'Broker (on the EMS PC or in the cloud)', 'EMS/dashboard: subscribing client'],
    cable: 'Existing IP network.',
    roles: 'Every party is a client of the broker; no direct request–response.',
    params: ['Broker address, port, TLS, credentials', 'Topic (e.g. lab/room/temp)', 'QoS 0/1/2, retain', 'Payload format, units, timestamp'],
    data: ['LoRaWAN sensor data after the network server', 'Pushing EMS data to the cloud'],
    extra: 'Broker. PLCs usually lack built-in MQTT → handled by the EMS or an IoT gateway.',
    limits: ['Defines no data model: two systems that both “speak MQTT” may still not understand each other.', 'Not for safety control.'],
    errors: ['Inconsistent topics', 'Payload without units', 'Stale data not handled after a connection loss'] },
  can: { n: 'CAN between BMS and PCS', lv: { conn: 'RJ45 (manufacturer-specific pinout!) or terminals', elec: 'Differential CAN (CAN_H/CAN_L), 250/500 kbit/s', net: 'Multi-master bus, ID-based messages, 120 Ω at both ends', app: 'Manufacturer battery protocol (or CANopen…) — must be on the compatibility list' },
    cable: 'Cable specified by the manufacturer (often an RJ45 cable with a specific pinout).',
    roles: 'The BMS periodically broadcasts limits and status; the PCS complies.',
    params: ['Bit rate', 'Selecting the “battery type” on the PCS', 'Termination resistors'],
    data: ['CVL, CCL, DCL', 'SOC, SOH, temperature, alarms'],
    extra: 'No gateway needed if the protocol matches; otherwise a dedicated manufacturer gateway (if available).',
    limits: ['Short distances at high bit rates.'],
    errors: ['Using an ordinary Ethernet cable (wrong pins)', 'Different protocol although both are “CAN”', 'Missing termination resistor'] },
  lorawan: { n: 'LoRaWAN for sensors', lv: { conn: 'Antenna', elec: 'LoRa modulation, 868 MHz band (Europe)', net: 'Star: sensor → gateway → network server (over IP)', app: 'Small binary payloads decoded at the server, forwarded via MQTT to the EMS' },
    ends: ['Battery-powered sensors', 'Gateway + network server'],
    cable: 'Wireless; the gateway is connected via Ethernet.',
    roles: 'Sensors transmit on their own; downlink commands are very limited.',
    params: ['Activation keys (OTAA: DevEUI, AppKey…)', 'Transmission interval', 'Payload decoder'],
    data: ['Room temperature and humidity; battery cabinet temperature'],
    extra: 'Gateway, network server (local or service).',
    limits: ['Duty-cycle limits per regional regulations', 'Latency of seconds to minutes → NOT for control'],
    errors: ['Using LoRaWAN for load shedding', 'Wrong regional frequency band'] },
  ocpp: { n: 'OCPP between charger and EMS', lv: { app: 'OCPP 1.6J or 2.0.1 (JSON)' },
    ends: ['EVSE: client (Charge Point)', 'EMS: server (CSMS)'],
    roles: 'The charger opens the connection to the CSMS.',
    params: ['CSMS URL, charger ID', 'OCPP version', 'Smart Charging support (SetChargingProfile)'],
    data: ['MeterValues (kW, kWh)', 'Status', 'Current limit'],
    extra: 'CSMS software in the EMS.', limits: ['Not every charger supports smart charging.'], errors: ['Different OCPP versions', 'No default limit set for connection loss'] },
  gw: { n: 'Modbus TCP ↔ RTU gateway', lv: { conn: 'RJ45 + RS485 terminals', net: 'TCP/IP ↔ serial bus', app: 'Modbus: Unit ID ↔ slave address' },
    ends: ['TCP client (PLC/EMS)', 'RS485 slaves'],
    cable: 'As for both types above.', roles: 'The gateway is a server on the TCP side and the master on the RS485 side.',
    params: ['Gateway IP', 'Unit ID mapping table', 'RS485-side baud/parity', 'Timeout (client > gateway)'],
    data: ['As for Modbus RTU'], limits: ['No faster than the RS485 bus.', 'Only one master on the RS485 bus.'], errors: ['Client timeout shorter than the gateway’s', 'PLC RS485 module and gateway both acting as master'] },
  iec61850: { n: 'IEC 61850 (extension)', lv: { conn: 'RJ45 / fibre', net: 'Ethernet; GOOSE at layer 2 (no IP); MMS over TCP/IP', app: 'Standardised data model (logical nodes MMXU, XCBR…), SCL configuration files' },
    ends: ['IEDs (protection relays, bay controllers)', 'Substation SCADA/gateway'],
    cable: 'Managed switches with VLAN/priority support; often redundant (PRP/HSR).',
    params: ['SCL files (ICD/CID/SCD)', 'System configuration tool', 'VLANs, GOOSE priority'],
    data: ['Measurements, status, commands, fast interlocks between relays'],
    extra: 'IEDs supporting 61850, engineering tools, in-depth expertise.',
    limits: ['Complex and costly for an 80 m² model using only LV Modbus equipment.'],
    errors: ['Expecting devices “with 61850” to understand each other without SCL configuration'],
    why: 'Not needed yet: no MV digital protection relays and no fast interlocks between IEDs. Add it when training on substation automation is wanted.' },
  iec104: { n: 'IEC 60870-5-104 (extension)', lv: { net: 'TCP/IP, port 2404', app: 'ASDUs with information object addresses (IOA)' },
    ends: ['RTU/gateway at the microgrid (controlled station)', 'Control-centre SCADA (controlling station)'],
    cable: 'Network operator WAN/VPN.', roles: 'The centre is the “controlling station”.',
    params: ['Point list (IOA) agreed with the centre', 'Parameters k, w, t1–t3', 'Security (IEC 62351)'],
    data: ['P, Q at the PCC; breaker states; power-limitation commands'],
    extra: 'RTU or gateway supporting 104; agreement with the network operator.',
    limits: ['Only needed when the utility requires remote monitoring/control.'], errors: ['Point list not agreed'],
    why: 'Not needed yet: the model is not dispatched by the utility’s control centre.' }
};

SG.I18D.en.traces = {
  P_PV: { n: 'PV power (P_PV)', kind: 'Measurement', steps: [
    { t: 'The PV array produces DC power according to irradiance.' },
    { t: 'The inverter measures AC output current/voltage with internal sensors and computes P (kW). This is the MEASURING point.' },
    { t: 'The value sits in the inverter’s Modbus registers (per its register map or SunSpec — to be checked). It travels over the Ethernet cable to the switch.' },
    { t: 'The PLC (Modbus TCP client) reads it every 1 s: function code 03, data type and scale factor per the register map; checks for timeout.' },
    { t: 'The EMS reads the value from the PLC (the PLC is a server) to compute the balance and decide the PV limit.' },
    { t: 'The HMI shows P_PV with its data quality (good / communication lost).' } ] },
  P_GRID: { n: 'Grid power at the PCC (P_GRID)', kind: 'Measurement', steps: [
    { t: 'Each phase current passes through a 50/5 A CT.' },
    { t: 'The meter receives the 5 A secondary current + directly measured voltage, multiplies by the CT ratio and computes signed P (+ import).' },
    { t: 'Modbus TCP: PLC client → meter server, port 502. (If RTU is chosen: over the RS485 bus to the RS485 module.)' },
    { t: 'The PLC reads FLOAT32, checks the word order, sets a validity flag.' },
    { t: 'The EMS uses it to prevent export and check the import limit.' },
    { t: 'The HMI displays it and changes colour when the limit is exceeded.' } ] },
  SOC: { n: 'Battery state of charge (SOC)', kind: 'Measurement', steps: [
    { t: 'Battery cells.' },
    { t: 'The BMS measures cell voltages, current and temperature and ESTIMATES the SOC (it cannot be measured directly).' },
    { t: 'The BMS sends SOC + CCL/DCL limits over CAN (manufacturer protocol).' },
    { t: 'The PCS relays the SOC in a Modbus TCP register.' },
    { t: 'The PLC reads it and compares it with SOC min/max.' },
    { t: 'SOC and limits are displayed.' } ] },
  P_RL: { n: 'Resistive load power (P_RL)', kind: 'Measurement', steps: [
    { t: 'The meter measures the feeder directly (no CT).' },
    { t: 'Modbus RTU: the PLC RS485 module (master) polls address 11; 19200 8E1.' },
    { t: 'The module passes the value to the CPU via the rack bus.' },
    { t: 'Displayed. On timeout → an “estimated” value is shown = number of steps × step power.' } ] },
  CMD_M1: { n: 'Control chain: HMI starts motor M1', kind: 'Control', steps: [
    { t: 'The operator presses “Run M1” (selector in Remote).' },
    { t: 'The HMI writes a request bit to the PLC (never directly to the drive).' },
    { t: 'The PLC checks the conditions: SEL_REMOTE = 1, KS_OK = 1, QF_M1_OF = 1, KM_M1_FB = 1, VFD_FLT = 0, busbar live, enough power reserve (in island mode).' },
    { t: 'OK → DO VFD_RUN = 1 (24 V PNP) to drive DI1; the AO sets the speed.' },
    { t: 'The drive ramps up; the motor turns.' },
    { t: 'Relay R2 “running” → DI VFD_RUN_FB. Modbus TCP gives actual speed/current.' },
    { t: 'The HMI shows “Running”. If no feedback after 3 s → the PLC cancels the command and reports “M1 not running”.' } ] },
  CMD_SHED: { n: 'Control chain: shedding a load step', kind: 'Control', steps: [
    { t: 'Grid import P exceeds the limit (or in island mode: battery P exceeds the PCS power).' },
    { t: 'The PLC reads it and filters over 5 s to avoid reacting to short fluctuations.' },
    { t: 'The PLC drops DO KM_RL3_CMD (lowest-priority step).' },
    { t: 'Interface relay KA releases.' },
    { t: 'The 230 VAC coil is de-energised → the contactor opens → the load step is cut.' },
    { t: 'Feedback KM_RL3_FB = 0 confirms; meter PM-RL drops.' },
    { t: 'Event “Step 3 shed” in the log.' } ] }
};

SG.I18D.en.compare = [
  { n: 'Interface relay, protection relay, safety relay', cols: ['', 'Interface relay (KA)', 'Protection relay (interface protection)', 'Safety relay (KS)'],
    rows: [
      ['Question it answers', 'Pass on an ON/OFF command', 'Is the grid normal? Must we disconnect?', 'Is an emergency stop requested? Is the safety circuit healthy?'],
      ['Input', '24 VDC coil from the PLC DO', 'Directly measured voltage (and/or current)', 'Dual-channel NC contacts of the E-stop, guard doors…'],
      ['Output', 'Contact switching a 230 VAC contactor coil', 'Trip order to KM-PCC/MX', 'Safety contacts cutting KM-M1, drive STO'],
      ['Self-monitoring', 'No', 'Internal watchdog', 'Yes (redundancy, short-circuit and welded-contact detection)'],
      ['Certification', 'No', 'Per grid-connection rules', 'PL/SIL (ISO 13849-1 / IEC 62061)'],
      ['In the model', 'KA1… for KM-PCC, KM-GEN, KM-RL, remote start', 'RLY-DEC', 'KS for motor M1']
    ] },
  { n: 'Circuit breaker, contactor, disconnector, switch-disconnector', cols: ['', 'Circuit breaker', 'Contactor', 'Disconnector', 'Switch-disconnector'],
    rows: [
      ['Breaks normal load current', 'Yes', 'Yes (designed for it)', 'NO', 'Yes'],
      ['Trips by itself on short circuit/overload', 'Yes', 'No', 'No', 'No'],
      ['Frequent switching', 'No (few operations)', 'Yes (10⁵–10⁶ operations)', 'No', 'Occasionally'],
      ['Safe isolation for work', 'Yes if marked “suitable for isolation”', 'No', 'Yes', 'Yes'],
      ['Remote control', 'Only with MX/MN (trip) and a motor operator (close)', 'Yes (coil)', 'No', 'Only motorised types'],
      ['In the model', 'QF0, QF-…', 'KM-PCC, KM-GEN, KM-M1, KM-RL', 'PV DC side (DC disconnector)', 'QS0']
    ] },
  { n: 'PLC, RTU, IED, HMI, SCADA, EMS', cols: ['', 'PLC', 'RTU', 'IED', 'HMI', 'SCADA', 'EMS'],
    rows: [
      ['Main role', 'Real-time control logic', 'Collect & transmit to a remote centre', 'Bay protection/control in a substation', 'Local operation', 'System-wide monitoring, history, alarms', 'Energy optimisation, setpoints'],
      ['Location', 'Control cabinet', 'Remote site', 'Substation bay', 'Cabinet door', 'PC/server', 'PC/server/cloud'],
      ['Typical protocols', 'Modbus, proprietary', 'IEC 104, DNP3', 'IEC 61850', 'PLC driver', 'Many', 'Modbus, OCPP, MQTT'],
      ['If this device is lost', 'Automation lost', 'Centre loses monitoring', 'Bay protection lost', 'Hard-wired buttons remain', 'History lost', 'Optimisation lost, PLC runs fallback rules'],
      ['In the model', 'Yes', 'Not needed yet', 'Not yet (simple interface relay)', 'Yes', 'Yes (PC)', 'Yes (same PC)']
    ] },
  { n: 'BMS, PCS, PV inverter', cols: ['', 'BMS', 'PCS', 'PV inverter'],
    rows: [
      ['Power conversion', 'No', 'Yes, bidirectional DC↔AC', 'Yes, one-way DC→AC'],
      ['Decides', 'The battery’s safe limits', 'Executes the setpoint within limits', 'Extracts maximum power (MPPT) within limits'],
      ['Forms the grid', '—', 'If grid-forming', 'Usually not (grid-following)'],
      ['Main communication', 'CAN to the PCS', 'Modbus TCP to the PLC/EMS + CAN to the BMS', 'Modbus TCP/SunSpec to the PLC/EMS']
    ] },
  { n: 'Measurement, protection, control', cols: ['', 'Measurement', 'Protection', 'Control'],
    rows: [
      ['Goal', 'Know the values (monitoring, energy)', 'Clear faults fast, automatically, independently', 'Bring the system to the desired state'],
      ['Time scale', 'Seconds', 'Milliseconds', 'Hundreds of ms – seconds'],
      ['Depends on PLC/communication', 'Usually', 'MUST NOT depend on them', 'Yes'],
      ['Examples', 'PM-PCC, PM-RL', 'QF-RL, interface relay, KS', 'PLC load shedding, EMS battery charging']
    ] },
  { n: 'Grid-following and grid-forming', cols: ['', 'Grid-following', 'Grid-forming'],
    rows: [
      ['Behaviour', 'Current source following existing U/f', 'Voltage source: sets U and f itself'],
      ['On grid loss', 'Stops output (anti-islanding)', 'Can keep supplying the separated microgrid'],
      ['Power balance', 'Handled by the grid (or the grid-forming source)', 'Automatically absorbs/supplies the difference within limits'],
      ['In the model', 'PV inverter', 'PCS (if selected) or generator']
    ] },
  { n: 'Source transfer and parallel operation', cols: ['', 'Source transfer (break-before-make)', 'Parallel (make-before-break / continuous)'],
    rows: [
      ['Two AC sources connected to the busbar together', 'Never', 'Yes'],
      ['Synchronisation needed', 'No (closing onto a dead busbar)', 'Mandatory (U, f, phase angle)'],
      ['Load interruption', 'Yes, short', 'No'],
      ['In the model', 'Grid ↔ generator (allowed)', 'Generator–grid: LOCKED; PCS–generator only with synchronisation']
    ] },
  { n: 'Grid loss and backup supply capability', cols: ['', 'Grid-tied PV only', 'Grid-forming PCS + disconnection device', 'Generator + source transfer'],
    rows: [
      ['On grid loss', 'Outage (even in sunshine)', 'Island mode, priority loads supplied', 'Outage of a few seconds → generator supplies'],
      ['Supply duration', '0', 'Depends on SOC', 'Depends on fuel'],
      ['Requirements', '—', 'KM-PCC, interface relay, control UPS, earthing in island mode', 'Interlock, control UPS']
    ] }
];

SG.I18D.en.extensions = [
  { n: 'Voltage transformer (VT)', need: 'Not needed yet', why: 'At 400 V, meters and relays measure voltage directly. A VT is needed for an MV connection or when a device only has a 100/110 V input.' },
  { n: 'Separate overcurrent protection relay (50/51)', need: 'Not needed yet', why: 'LV breakers have built-in protection. A separate relay is needed with MV breakers or for complex protection (directional, differential).' },
  { n: 'Interface protection relay', need: 'Needed when island operation is enabled', why: 'The disconnection device at the PCC must be controlled by dedicated protection. Thresholds per grid-connection rules.' },
  { n: 'RTU', need: 'Not needed yet', why: 'No control centre needs to monitor the model. PLC + SCADA are enough.' },
  { n: 'IEC 61850', need: 'Extension', why: 'Useful for substation automation training; needs IEDs and SCL configuration tools.' },
  { n: 'IEC 60870-5-104', need: 'Extension', why: 'When exchange with the utility’s SCADA is required.' },
  { n: 'DMS/ADMS', need: 'Out of scope', why: 'Utility software for operating the distribution grid.' },
  { n: 'Precise time synchronisation (PTP)', need: 'Not needed yet', why: 'NTP (ms) is enough for the event log. PTP is needed for PMUs, Sampled Values, synchronised fault recording.' },
  { n: 'Generator synchroniser / load sharing', need: 'Extension', why: 'Only for no-break source transfer or parallel operation.' },
  { n: 'Industrial firewall/router', need: 'Needed when connecting to external networks', why: 'When the EMS pushes data to the cloud or for remote access: segregate the control network (IEC 62443).' }
];

SG.I18D.en.refs = [
  { g: 'LV installations & switchboards', items: [['IEC 60364 (parts 4-41, 4-43, 5-52, 5-53…)', 'LV electrical installations: shock protection, overcurrent, cable selection, switchgear'], ['NF C 15-100 (France)', 'French LV installation standard — check the current edition'], ['IEC 61439-1/-2', 'LV switchgear assemblies'], ['IEC 60529', 'IP degrees of protection']] },
  { g: 'Switchgear & protection', items: [['IEC 60947-2', 'Industrial circuit breakers'], ['IEC 60898-1', 'Household circuit breakers (MCB)'], ['IEC 60947-3', 'Switches, switch-disconnectors'], ['IEC 60947-4-1', 'Contactors and motor starters'], ['IEC 60947-6-1', 'Transfer switching equipment (ATSE)'], ['IEC 61643-11 / IEC 61643-31', 'AC / DC-PV surge protective devices'], ['IEC 60269-6', 'gPV fuses']] },
  { g: 'Measurement', items: [['IEC 61869-2', 'Current transformers'], ['IEC 61557-12', 'Performance measuring and monitoring devices (PMD)'], ['IEC 62053-21/-22', 'Electricity meters']] },
  { g: 'PV, storage, grid connection', items: [['IEC 60364-7-712', 'PV installations'], ['UTE C 15-712-1 / -3 (France)', 'PV / battery storage installation guides — check the edition'], ['IEC 62109-1/-2', 'Safety of PV power converters'], ['IEC 62116', 'Inverter anti-islanding test'], ['EN 50549-1', 'Requirements for generating plants connected to LV grids (Europe)'], ['VDE-AR-N 4105', 'LV connection rules (Germany) — example'], ['IEC 62619 / IEC 62933', 'Industrial lithium battery safety / energy storage systems'], ['Rules of the local utility (e.g. Enedis in France)', 'Interface protection thresholds, export conditions, procedures']] },
  { g: 'Machines, generators, EV', items: [['IEC 60034-1 / 60034-30-1', 'Motors / IE efficiency classes'], ['IEC 61800-5-2', 'Drive safety functions (STO)'], ['ISO 8528', 'Generating sets'], ['IEC 61851-1 / IEC 62196', 'Mode 3 EV charging / connectors']] },
  { g: 'Control & machine safety', items: [['IEC 61131-2 / -3', 'PLC: hardware / programming languages'], ['IEC 60204-1', 'Electrical equipment of machines'], ['ISO 13849-1 / IEC 62061', 'Functional safety (PL / SIL)'], ['ISO 13850 / IEC 60947-5-5', 'Emergency stop'], ['IEC 62443', 'Cybersecurity of control systems']] },
  { g: 'Communication', items: [['Modbus Application Protocol & Modbus over Serial Line', 'Official Modbus specifications'], ['SunSpec Information Models', 'Standardised register maps for inverters/batteries'], ['MQTT (OASIS)', 'MQTT specification'], ['OCPP', 'Open Charge Alliance'], ['LoRaWAN', 'LoRa Alliance'], ['CAN / CANopen', 'CAN in Automation'], ['IEC 61850 / IEC 60870-5-104', 'Substation automation / telecontrol'], ['IEEE 1588', 'PTP precise time synchronisation']] },
  { g: 'Manufacturers (examples for datasheet look-up)', items: [['Schneider Electric', 'Acti9, TeSys, Compact NSX, PowerLogic, Altivar, Modicon, Harmony — look up the datasheet of each reference'], ['Other manufacturers', 'ABB, Siemens, Phoenix Contact, Wago, SMA, Fronius, Victron… — the system is not limited to one brand']] }
];

/* Scenarios: steps are index-aligned with data/scenarios.js; null = step text produced by a translated function */
SG.I18D.en.scenarios = {
  'pv-surplus': { n: 'PV supplies the loads, surplus charges the battery', steps: [
    { t: 'Midday, high irradiance. Loads: priority feeder + 1 resistive load step. Battery at 55 %, no setpoint yet (0 kW).' },
    { t: 'The PCC meter measures a negative P_GRID: the PV surplus is flowing to the grid. The inverter measures P_PV. The PCS reports SOC 55 %.' },
    { t: 'The PLC (Modbus TCP client) reads the PCC meter, inverter and PCS via the switch every 1 s. The EMS reads these values from the PLC.' },
    { t: 'The EMS computes: surplus = P_PV − P_load > 0 and SOC < SOC max → charge setpoint = −min(surplus, P_PCS, BMS charge limit CCL).' },
    { t: 'The PLC checks the setpoint is within ±P_PCS, then writes PCS_PSET via Modbus TCP. The PCS starts charging, respecting the CCL sent by the BMS over CAN.' },
    { t: 'The PCS reports a negative P_BAT (charging); the PCC meter reports P_GRID ≈ 0. Two independent measurements confirm the command took effect.' },
    { t: 'HMI: arrows PV → loads and PV → battery; SOC rising; status “Charging”.' } ],
    pseudo: `EVERY 1 s:
  surplus = P_PV - P_LOAD
  IF surplus > 0 AND SOC < SOC_MAX:
      P_BAT_SET = -MIN(surplus, P_PCS, CCL_BMS)
  ELSE IF surplus < 0 AND SOC > SOC_MIN:
      P_BAT_SET = MIN(-surplus, P_PCS, DCL_BMS)
  ELSE: P_BAT_SET = 0
  WRITE PCS_PSET (only when the change > 0.2 kW — avoid continuous writes)` },
  'pv-drop': { n: 'PV drops, battery or grid compensates', steps: [
    { t: 'Cloud cover: irradiance falls from 85 % to 25 % within a few seconds.' },
    { t: 'The inverter immediately produces less (physics). The grid instantly makes up the difference because it is the reference source — P_GRID rises.' },
    { t: 'At the next polling cycle the PLC/EMS see P_PV fall and P_GRID positive (import).' },
    { t: 'EMS: deficit = P_load − P_PV > 0, SOC 60 % > SOC min → discharge the battery up to P_PCS; the rest comes from the grid.' },
    { t: 'The PLC writes the discharge setpoint to the PCS.' },
    { t: 'The PCS reports a positive P_BAT; P_GRID falls to the remaining deficit (if load > PV + P_PCS).' },
    { t: 'HMI: battery “Discharging”, the grid supplies the rest. No alarm — this is normal operation.' } ],
    note: 'When grid-connected, the instantaneous balance is always provided by the GRID; the EMS only changes who supplies after a few seconds. In island mode the grid-forming PCS must compensate instantly by itself.',
    pseudo: `IF P_PV drops:
  (physics) the grid compensates immediately
  EMS next cycle: deficit = P_LOAD - P_PV
  IF SOC > SOC_MIN: P_BAT_SET = MIN(deficit, P_PCS, DCL)
  P_GRID = deficit - P_BAT  (naturally)` },
  'soc-limit': { n: 'Battery reaches its SOC limit', steps: [
    { t: 'PV surplus, the battery is charging and SOC is about to reach SOC max.' },
    { t: 'The BMS/PCS report SOC = SOC max (the BMS may also reduce CCL as the battery nears full).' },
    { t: 'The PLC reads the SOC from the PCS (Modbus TCP).' },
    { t: 'The EMS stops charging. The surplus flows to the grid. If the export limit is exceeded (or export is not allowed) → the EMS must LIMIT the PV.' },
    { t: 'The PLC writes PV_PLIM_SET (limit in %) to the inverter. This is only possible if the register map allows writing — currently “insufficient information”.' },
    { t: 'P_GRID returns to ≥ −export limit. The inverter reports a “power limited” status.' },
    { t: 'HMI: “Battery full — PV limited”. Evening: when SOC = SOC min, the EMS stops discharging; loads are supplied entirely by the grid.' } ],
    pseudo: `IF SOC >= SOC_MAX: P_BAT_SET = MIN(P_BAT_SET, 0)   // charging forbidden
IF SOC <= SOC_MIN: P_BAT_SET = MAX(P_BAT_SET, 0)   // discharging forbidden
export = -P_GRID
IF export > EXPORT_LIMIT: PV_PLIM = P_PV - (export - EXPORT_LIMIT)` },
  'shed': { n: 'Load increases — shedding non-priority loads', steps: [
    { t: 'Evening, battery at SOC min (cannot discharge). Loads: priority + motor + 3 resistive steps + EV charging.' },
    { t: 'PCC meter: import P exceeds the IMPORT LIMIT set by the EMS.' },
    { t: 'The PLC reads P_GRID, filtered over 5 s.' },
    { t: 'Shedding order: (1) reduce the EV to minimum current via OCPP, (2) cut resistive steps from step 3 down. Priority loads and the motor are not cut.' },
    { t: 'The EMS sends a 6 A limit to the EVSE (OCPP). The PLC drops the KM_RL3 command → KA releases → the contactor opens.' },
    { t: 'KM_RL3_FB = 0; PM-RL drops; P_GRID is checked again. If still exceeded → next step.' },
    { t: 'HMI: “Step 3, step 2 shed; EV limited to 6 A”. Restoration when the margin ≥ step power + 0.5 kW for 60 s.' } ],
    pseudo: `IF P_GRID > IMPORT_LIMIT FOR 5 s:
  IF EV_A > 6: EV_A = 6         (OCPP)
  ELSE IF rl_steps_on: switch off the highest RL step
  ELSE: stop EV
IF P_GRID < IMPORT_LIMIT - (P_STEP + 0.5) FOR 60 s:
  restore in reverse order` },
  'motor': { n: 'Motor start / stop', steps: [
    { t: 'The operator presses “Run M1” on the HMI. L/R selector in Remote.' },
    { t: 'The PLC receives the request bit from the HMI.' },
    { t: 'The PLC reads the conditions: SEL_REMOTE, KS_OK, QF_M1_OF, KM_M1_FB, VFD_FLT.' },
    { t: 'All satisfied → permitted. (In island mode: also check the PCS power reserve ≥ motor P.)' },
    { t: 'DO VFD_RUN = 1 → drive DI1; AO 0–10 V sets 100 % speed. The drive ramps up over 5 s (current ≈ In, not 6–8 In).' },
    { t: 'Relay R2 “running” → VFD_RUN_FB = 1 within 3 s → confirmed. If NOT (e.g. drive inputs configured NPN) → the PLC cancels the command and reports “M1 not running”.' },
    { t: 'HMI: “M1 running — 100 % — x A”. Stop: HMI “Stop” → DO = 0 → the drive decelerates → VFD_RUN_FB = 0. Emergency stop: KS cuts STO + KM-M1, without the PLC.' } ],
    pseudo: `ON HMI_START_M1:
  IF SEL_REMOTE AND KS_OK AND QF_M1_OF AND KM_M1_FB AND NOT VFD_FLT
     AND (MODE <> ISLAND OR PCS_RESERVE >= P_M1):
       VFD_RUN := 1; T_FB := 0
  ELSE: report "Conditions not met: <missing condition>"
IF VFD_RUN AND NOT VFD_RUN_FB AND T_FB > 3 s:
  VFD_RUN := 0; ALARM "M1 not running"` },
  'commloss': { n: 'Communication loss with a meter or the inverter', steps: [
    { t: 'Battery full, PV being limited to stay within the export limit. The inverter’s Ethernet cable is unplugged.' },
    { t: 'The PLC gets no reply within the timeout (e.g. 3 × 1 s) → flag COMM_INV_LOST.' },
    { t: 'No signal can reach the inverter any more — the PLC cannot write a new limit.' },
    { t: 'The decision was designed beforehand: (a) the inverter has a “fallback on communication loss” setting (e.g. 0 % or a safe limit) — check the inverter supports it; (b) otherwise the PLC could open QF-PV/a contactor — in this architecture QF-PV has no operating mechanism → not possible.' },
    { t: 'Losing the PCC meter instead: the EMS loses P_GRID → keeps the battery at 0 kW (no “blind” control).' },
    { t: 'Feedback: the HMI value switches to “invalid” (it does not keep the old number as if still valid).' },
    { t: 'HMI: alarm “PM-PCC communication lost” with timestamp; logged. On recovery, the EMS resumes after 10 s of stability.' } ],
    pseudo: `FOR EACH device:
  IF no reply 3 times in a row: COMM_LOST[i] := 1; value := INVALID
IF COMM_LOST[PM_PCC]: P_BAT_SET := 0
IF COMM_LOST[INV] AND PV limitation needed: (rely on the inverter fallback) + ALARM` },
  'gridloss': { n: 'Grid loss', steps: [
    { t: 'The grid is lost (fault on the utility side).' },
    { t: 'The interface relay sees U/f outside limits within a few hundred ms (per the regulatory settings).' },
    { t: 'The PV inverter and PCS (grid-following) detect the grid loss with their anti-islanding function and stop output. The busbar is de-energised.' },
    { t: 'The relay DIRECTLY (hard-wired) opens KM-PCC and reports DEC_TRIP to the PLC. The PLC stays alive thanks to the UPS.' },
    null,
    { t: 'The PCS (grid-forming) switches to forming U/f. PLC: ISLAND mode → limits load to P_PCS: cuts the EV and resistive steps; checks P_M1 + P_priority ≤ P_PCS.' },
    null,
    { t: 'The PV inverter sees a stable grid (formed by the PCS) → reconnects after its delay; the PCS balances: P_PCS = P_load − P_PV. PV surplus → the PCS raises the frequency slightly so the inverter curtails itself (P(f)) — check the device pair supports it.' },
    { t: 'No power action: wait for the grid to return.' },
    { t: 'KM_PCC_FB = 0 confirms separation; the PCS reports “grid-forming” mode; U, f measured by the PCS.' },
    { t: 'No feedback — the loads are not supplied.' },
    { t: 'HMI: “ISLAND” lamp, message “Grid lost — island operation”, SOC falling, estimated time remaining.' },
    null ],
    pseudo: `[Protection, not via the PLC] RLY_DEC: IF U/f outside limits > t: open KM_PCC
[PLC] ON DEC_TRIP:
  MODE := ISLAND
  EV := STOP; switch off all RL steps
  IF P_PRIORITY + P_M1 > P_PCS: stop M1
  The PCS switches to grid-forming by itself (per the PCS configuration)` },
  'genstart': { n: 'Generator start and source transfer', steps: [
    { t: 'In island mode, at night, SOC falling to SOC min + 5 %.' },
    { t: 'Grid lost, busbar de-energised (no island function). The PLC stays alive thanks to the UPS.' },
    { t: 'The PLC detects the condition (low SOC or grid loss > 5 s).' },
    { t: 'DO GEN_START → KA3 → dry contact into the generator controller.' },
    null, null,
    { t: 'KM_GEN_FB = 1; GEN_DATA (RS485) reports P, U, f. The PLC limits the PV so the generator stays above its minimum load and never sees reverse power.' },
    { t: 'HMI: “Generator running”, running hours, fuel level (if available).' } ],
    note: 'Generator–grid parallel operation is LOCKED in this architecture: it requires a synchroniser, reverse power protection (32), a dedicated interface protection for the generator and an agreement with the utility.',
    pseudo: `IF (MODE = ISLAND AND SOC <= SOC_MIN + 5) OR (GRID_LOST > 5 s AND no_island):
  GEN_START := 1
ON GEN_READY AND NOT KM_PCC_FB:
  IF has_sync: wait SYNC_OK; KM_GEN := 1
  ELSE: PCS_STOP; wait dead_busbar; KM_GEN := 1; PCS_START(GFL)
LOCK: KM_GEN and KM_PCC are never = 1 at the same time (mechanical + electrical + PLC)` },
  'gridback': { n: 'Grid restoration', steps: [
    { t: 'Grid voltage returns on the grid side of KM-PCC.' },
    null,
    { t: 'DEC_TRIP returns to normal → PLC.' },
    null, null,
    { t: 'KM_PCC_FB = 1; the PCC meter measures P_GRID. The PV inverter reconnects after its own delay.' },
    { t: 'HMI: “Grid” lamp; non-priority loads are restored one by one.' } ],
    pseudo: `IF GRID_OK continuously >= T_WAIT:
  IF MODE = GENERATOR: KM_GEN := 0; wait KM_GEN_FB = 0
  IF MODE = ISLAND AND NOT PCS_RESYNC: PCS_STOP
  KM_PCC := 1  (only when KM_GEN_FB = 0)
  restore loads in order` },
  'fault': { n: 'Fault on a feeder and isolation', steps: [
    { t: 'Short circuit on the cable to the resistive load bank.' },
    { t: 'The magnetic release of QF-RL detects the fault current (many times In).' },
    { t: 'NOT via the PLC: the protection is inside the circuit breaker itself and acts within a few ms.' },
    { t: 'Selectivity: only QF-RL trips, QF0 stays closed (check the manufacturer’s selectivity tables). In ISLAND mode: the short-circuit current is limited by the PCS (often only 1–2 × In) → the magnetic release may NOT operate — island-mode protection must be verified separately.' },
    { t: 'QF-RL opens → the feeder is isolated. The rest keeps operating.' },
    { t: 'SD contact → QF_RL_SD = 1 → PLC. The PLC locks the KM-RL commands (no automatic reclosing).' },
    { t: 'HMI: alarm “QF-RL tripped”. The operator inspects, repairs, recloses QF-RL LOCALLY, then resets the alarm.' } ],
    pseudo: `[Protection] QF-RL trips by itself when I > magnetic threshold (no software)
[PLC] ON QF_RL_SD:
  KM_RL_CMD[*] := 0; RL_LOCK := 1; ALARM
  RL_LOCK is only released when QF_RL_SD = 0 AND PB_RESET` },
  'parallel': { n: 'Generator–grid parallel operation' }
};

/* Product catalogue: only Vietnamese text is translated; quotes from manufacturer documents stay as published */
SG.I18D.en.products = {
  'sma-stp5-3av-40': { role: 'Grid-tied 3-phase PV inverter, grid-following',
    specs: { comm: { v: ['Modbus TCP (SMA Modbus / SunSpec Modbus, port 502)'], ref: 'Equipment + Configuring the Modbus Function (Modbus disabled by default, port 502)' } },
    iface: 'DC: SUNCLIX connectors; AC: AC connector; Ethernet RJ45 (Speedwire), RS485, WLAN',
    notes: ['The register map “Modbus® parameters and measured values” is referenced in the manual (www.SMA-Solar.com) but no specific link is available yet → write access to the P limit: Missing data.', 'The manual recommends a firewall/VPN when Modbus is enabled.'],
    software: [{ n: 'Inverter configuration interface (web / SMA app)', role: 'Enable Modbus, set IP, country data set', lic: 'To be checked' }] },
  'se-atv320u22n4b': { role: '2.2 kW drive, 3-phase 380–500 V',
    notes: ['Overload capacity as % of current is not stated in the datasheet (only 170–200 % overtorque) → check the catalogue/manual.', 'Ethernet only via an option card → the PLC reads it over Modbus RTU or an option card is added.'],
    software: [{ n: 'SoMove (drive configuration)', role: 'Parameter setting, configuration upload/backup', lic: 'To be checked' }] },
  'se-pm5560': { role: 'Power meter, Ethernet + RS485',
    notes: ['Needs 3 CTs with 1 A or 5 A output (no verified CT in the catalogue yet).', 'Register map: separate Schneider document — no link yet.'],
    software: [{ n: 'Configuration via the display / built-in web page', role: 'CT ratio, network type, IP', lic: 'To be checked' }] },
  'se-iem3155': { role: '63 A direct energy meter, Modbus RTU', notes: ['RS485 only: cannot be read directly over Modbus TCP.'] },
  'se-tm221ce24t': { role: 'PLC with 24 I/O, Ethernet + serial',
    notes: ['4–20 mA analogue, Pt100 and AO need expansion modules (no verified module in the catalogue yet).', 'The built-in RS485 port is not isolated — consider an isolator for long buses.'],
    software: [{ n: 'EcoStruxure Machine Expert – Basic', role: 'M221 PLC programming', lic: 'To be checked' }] },
  'se-hmist6400': { role: '7" touch screen, 2 × Ethernet, 24 VDC',
    software: [{ n: 'Harmony ST6 screen design software', role: 'HMI screen design', lic: 'To be checked' }] },
  'se-abls1a24100': { role: '24 VDC 10 A power supply',
    notes: ['No DC-OK contact in the datasheet → PSU_OK cannot be sent to a DI (needs a separate monitoring module or another supply).'] },
  'se-tcsesu083fn0': { role: 'Unmanaged 8-port switch',
    discontinued: 'Discontinued — production stopped on 15 Oct 2021, end of service on 31 Aug 2026 (datasheet p. 1)' }
};
/* EN values for specs quoted from French-language datasheets (source quote stays in "ref") */
(function () {
  const P = SG.I18D.en.products, S = (id, o) => { P[id] = P[id] || {}; P[id].specs = Object.assign(P[id].specs || {}, o); };
  S('se-atv320u22n4b', { overtorque: { v: '170…200 % of nominal torque' }, di: { v: 'DI1…DI6 24 VDC + STO' }, ao: { v: 'AQ1 0–20 mA or 0–10 V' }, relays: { v: 'R1 (NO/NC) 3 A 250 VAC resistive; R2 (NO) 5 A 250 VAC resistive' }, emc: { v: 'Built-in EMC filter, category C2' } });
  P['se-atv320u22n4b'].iface = 'Power terminals L1-L2-L3 / U-V-W; control terminals (DI, AI, AQ, relays, STO); Modbus/CANopen RJ45 port';
  S('se-pm5560', { acc: { v: 'Class 0.2S active energy (IEC 62053-22)' }, supply: { v: '90…528 VAC / 100…300 VDC' }, ip: { v: 'IP54 front / IP30 rear' } });
  P['se-pm5560'].iface = 'Voltage terminals, CT terminals (6), RS485 (terminals), 2 × RJ45';
  S('se-iem3155', { acc: { v: 'Class 1 (IEC 62053-21, IEC 61557-12), Class B (EN 50470-3), MID' }, dio: { v: '1 DI (24 VDC) / 1 static DO 5…40 VDC 50 mA' }, mount: { v: 'DIN rail, 16 mm² terminals' } });
  P['se-iem3155'].iface = '16 mm² power screw terminals; RS485 screw terminals';
  S('se-tm221ce24t', { supply: { v: '24 VDC (20.4…28.8 V)' }, diType: { v: 'PNP or NPN (positive/negative), 24 VDC' }, comm: { v: ['Modbus TCP (client + server)', 'Modbus RTU (master/slave, RS232/RS485)', 'EtherNet/IP (adapter)'] }, serial: { v: '1 RJ45 port RS232/RS485 non-isolated, 1.2…115.2 kbit/s' }, power: { v: '4.8 W (without expansion) / 14 W (max)' } });
  P['se-tm221ce24t'].iface = 'Removable I/O terminal blocks; RJ45 Ethernet; RJ45 serial RS232/RS485; mini-USB programming';
  S('se-hmist6400', { size: { v: '7 inch 800 × 480' }, supply: { v: '24 VDC ±20 %, 9 W' }, ip: { v: 'IP65 front / IP20 rear' } });
  S('se-abls1a24100', { Vin: { v: '100…240 VAC single/two-phase; 140…340 VDC' }, inrush: { v: '60 A at 230 V' }, extProt: { v: 'Recommended external protection 6 A or 20 A, curve B/C' }, parallel: { v: 'Parallel / series' } });
  P['se-abls1a24100'].iface = 'Input/output screw terminals, DIN rail';
  S('se-tcsesu083fn0', { Vin: { v: '12…24 VDC (9.6…32 V SELV)' } });
  P['se-tcsesu083fn0'].iface = 'Shielded RJ45';
  P['se-hmist6400'].iface = '2 × RJ45 Ethernet; SUB-D9 RS232; RJ45 RS485; USB';
})();
