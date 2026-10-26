/* EN — device type overlay (params/confusions/accessories/compat are index-aligned with data/types.js) */
SG.I18D.en.types = {};
Object.assign(SG.I18D.en.types, {
grid: {
  name: 'Public distribution grid', group: 'Sources',
  func: 'Voltage and frequency reference when grid-connected; absorbs or supplies the difference between internal generation and load.',
  principle: 'The grid has a very large short-circuit power compared with the model, so U and f stay almost constant. Grid-following inverters rely on this reference.',
  notdo: 'Does not guarantee continuity: when the grid is lost, every grid-following source must stop.',
  confusions: [['PCC', 'The grid is the external source; the {{pcc|PCC}} is the boundary point where you measure and disconnect.']],
  ports: { power: '3P+N supply cable terminals (+PE depending on the {{slt|earthing system}}).' },
  accessories: ['Grid-connection agreement and technical requirements from the utility when generation is connected.'],
  compat: ['Nominal voltage/number of phases/frequency.', 'Short-circuit current at the PCC ({{icu|Icc}}) — provided by the utility.', 'Connection/contract capacity.', 'Whether export to the grid is allowed, and up to what limit.'],
  params: [
    { n: 'Nominal voltage', m: 'Line (phase–phase) and phase (phase–neutral) voltage.', i: 'Sets the rating of every device connected to the busbar.', h: 'Per the local grid.', e: '400 V phase–phase / 230 V phase–N, 3P+N.', c: 'Permitted grid tolerance (e.g. ±10 %).' },
    { n: 'Frequency', m: 'Nominal frequency.', i: 'Devices must be rated for exactly 50 or 60 Hz.', h: 'Per the grid.', e: '50 Hz.', c: 'Frequency range accepted by the inverter/interface relay.' },
    { n: 'Connection capacity', m: 'Maximum power allowed from the grid.', i: 'Import limit → load shedding needed if exceeded.', h: 'Contract/meter.', e: '36 kVA (assumed).', c: 'Export limit, if any.' },
    { n: 'Short-circuit current at the PCC', m: 'Largest fault current that can occur at the connection point.', i: 'Sets the breaking capacity (Icu/Ics) of the main and downstream circuit breakers.', h: 'Ask the utility or calculate from the transformer and cables.', e: 'No data yet — deliberately left empty.', c: 'Must not be assumed; without this value no conclusion on circuit breaker suitability is possible.' }
  ],
  example: {
    ok: { t: '36 kVA 3-phase contract', d: 'Enough for the maximum total load of ≈ 17 kW including the EV, with margin while the battery charges at 5 kW.' },
    ko: { t: '9 kVA single-phase connection', d: 'Cannot supply the 3-phase motor, 3-phase generator and 3-phase PCS of the reference architecture; the whole design would have to change to single-phase.' }
  }
},
isect: {
  name: 'Switch-disconnector', group: 'Switching & protection',
  func: 'Isolates the whole system from the grid for safe work (padlockable – lockout) and can switch normal load current.',
  principle: 'Mechanical contacts with a sufficient isolating gap and reliable position indication (“positive break indication”). Manually operated, usually with a lockable rotary handle.',
  notdo: 'Does not detect or trip on overload or short circuit. Not remotely controlled (except motorised versions).',
  confusions: [['Circuit breaker', 'A circuit breaker trips by itself on a fault; a switch-disconnector does not.'], ['Disconnector', 'A plain disconnector must not be operated under current; a switch-disconnector can (per utilisation category AC-22/AC-23).']],
  ports: { power: '4-pole power input/output (3P+N).', ctrl: 'Optional: auxiliary contact signalling position.' },
  accessories: ['Rotary handle lockable with a padlock (lockout).', 'Auxiliary contact if the PLC needs the position.', 'Terminal shields.'],
  compat: ['Rated current ≥ maximum current.', 'Number of poles (neutral switching depending on the {{slt|earthing system}}).', 'Withstands short-time current (Icw) or is protected by an upstream device.'],
  params: [
    { n: 'Rated operational current', m: 'Load current the device can switch continuously.', i: 'Must be ≥ Ib of the whole system.', h: 'Ib from the connection capacity.', e: '63 A (preliminary for 36 kVA ≈ 52 A).', c: 'Utilisation category AC-22A/AC-23A.' },
    { n: 'Number of poles', m: 'Number of conductors switched.', i: '4P if the neutral is switched.', h: 'Per the earthing system and regulations.', e: '4P.', c: 'Neutral switching requirements of the applicable rules.' },
    { n: 'Short-time withstand current', m: 'Short-circuit current withstood for a short time without damage.', i: 'Coordination with the upstream protective device.', h: 'From the Icc at the PCC and coordination tables.', e: 'Check the datasheet.', c: 'Coordination table with the upstream fuse/circuit breaker.' }
  ],
  example: {
    ok: { t: '4P 63 A switch-disconnector, lockable rotary handle', d: 'Isolates the whole board for maintenance; Ib ≈ 52 A < 63 A.' },
    ko: { t: 'Fuse-disconnector without load-breaking capacity', d: 'If an operator opens it under load an arc forms — acceptable only with a prior load-break procedure and an interlock.' }
  },
  brands: 'Example product ranges for reference: Schneider Acti9 iSW / Compact INS, ABB OT, Socomec Sirco… — check the datasheet.'
},
breaker: {
  name: 'Low-voltage circuit breaker', group: 'Switching & protection',
  func: 'Protects downstream cables and equipment against overload and short circuit by tripping BY ITSELF; allows manual switching.',
  principle: 'The thermal (or electronic long-time) release responds to overload over time; the magnetic (instantaneous) release responds immediately to short circuits. The arc chute extinguishes the current.',
  notdo: 'Not for frequent switching (lower mechanical life than a contactor). Does not reclose by itself. Having a communication port ≠ remote controllable: remote closing needs a motor operator.',
  confusions: [['Contactor', 'A contactor switches hundreds of thousands of times on command but does not protect itself.'], ['Protection relay', 'A relay only measures and orders; the circuit breaker is the element that interrupts current.'], ['RCD', 'Residual current protection is a different function; it can be integrated (RCBO) or added as a Vigi block.']],
  ports: { power: 'Line input and load output according to the number of poles.', ctrl: 'Depending on accessories: OF (status), SD (trip signal), MX/MN (remote trip), motor (remote close/open).', comm: 'Some electronic breaker ranges have a communication module — read-only data/status, it does not by itself allow remote closing.' },
  accessories: ['{{of_sd|OF contact}} so the PLC knows closed/open.', '{{of_sd|SD contact}} to distinguish “opened manually” from “tripped”.', '{{mx_mn|MX coil}} if remote tripping is needed (interface relay, emergency stop).', '{{motor_op|Motor operator}} if remote CLOSING is needed.', '{{ddr|RCD}} block, or an RCBO, when residual current protection is required.'],
  compat: ['In ≥ Ib and coordinated with the cable Iz ({{in_ib_iz|Ib ≤ In ≤ Iz}}).', 'Breaking capacity Icu/Ics ≥ Icc at the installation point.', 'Curve suited to the load inrush current.', 'DC rating if installed on a DC circuit (polarity, DC voltage).', 'Selectivity with the upstream breaker.', 'Accessories compatible with the breaker range (left/right mounting, maximum number).'],
  params: [
    { n: 'Rated current', m: 'Current the breaker carries continuously without tripping.', i: 'Choose In ≥ Ib, and In ≤ cable Iz.', h: 'Ib = P / (√3·U·cos φ) for 3-phase; take the next standard rating; then check the cable.', e: '5 kW PV feeder: Ib ≈ 7.2 A → 10 or 16 A per the inverter recommendation.', c: 'Maximum AC protection recommended in the inverter manual; derating for cabinet temperature.' },
    { n: 'Tripping curve', m: 'Magnetic trip threshold relative to In.', i: 'Direct-on-line motors and transformers need C/D; electronic loads usually C.', h: 'From the load starting/inrush current.', e: 'Resistive feeder: C.', c: 'Inrush current of PSUs, inverters, drives.' },
    { n: 'Short-circuit breaking capacity', m: 'Maximum short-circuit current that can be interrupted.', i: 'Must be ≥ Icc at the installation point, or use cascading per the manufacturer’s tables.', h: 'From the Icc at the PCC (utility) and cable impedance.', e: 'No Icc yet → “insufficient information”.', c: 'Rating standard: IEC 60898-1 (Icn) or IEC 60947-2 (Icu/Ics).' },
    { n: 'Number of poles', m: 'Number of conductors protected/switched.', i: '1P+N, 3P, 4P depending on the load and earthing system.', h: 'From the number of load phases and the neutral switching requirement.', e: 'Single-phase EV: 1P+N; 3-phase PCS: 4P.', c: 'On DC circuits: poles in series to reach the rated DC voltage.' },
    { n: 'AC/DC switching', m: 'An AC breaker is not guaranteed to interrupt DC.', i: 'Battery/PV DC circuits need DC-rated devices.', h: 'From the installation location.', e: 'Inverter AC side: AC breaker.', c: 'DC rating marking and polarity in the datasheet.' },
    { n: 'Functional accessories', m: 'Contacts, trip coils, motor operators to add.', i: 'Determines what the PLC can read/control.', h: 'From the I/O list and required functions.', e: 'OF + SD on every feeder; MX on the main breaker.', c: 'MX coil voltage (24 VDC? 230 VAC?) matches the control supply.' }
  ],
  example: {
    ok: { t: '6 kW 3-phase resistive load feeder', d: 'Ib = 6000 / (√3 × 400 × 1) ≈ 8.7 A → choose In 10 A curve C, 4P, plus OF+SD. The cable (Iz), Icc and selectivity must still be checked — this site does not conclude on them.' },
    ko: { t: 'Breaker “with Modbus” so the PLC can reclose after a fault', d: 'The communication port only reads status/measurements. Without a motor operator the PLC cannot close the breaker. Moreover, automatic reclosing after a short-circuit trip is dangerous — a person must inspect first.' }
  },
  brands: 'Example product ranges for reference: Schneider Acti9 (MCB, iOF/iSD/iMX accessories), Compact NSX (MCCB); ABB, Siemens, Hager, Legrand… — check the datasheet and accessory catalogue.'
},
contactor: {
  name: 'Contactor', group: 'Switching & protection',
  func: 'Switches a power circuit on electrical command (coil), letting the PLC control sources or loads.',
  principle: 'The coil produces a magnetic force that closes the main contacts; when the coil is de-energised a spring opens them. Auxiliary contacts follow the main contacts to provide feedback.',
  notdo: 'Does not protect against overload/short circuit; needs an upstream breaker or fuse. Does not provide safe isolation for work.',
  confusions: [['Circuit breaker', 'The circuit breaker protects; the contactor controls.'], ['Interface relay', 'Same principle, but an interface relay only switches signal currents (a few A).']],
  ports: { power: '3P or 4P main contacts (1/L1… 2/T1…).', ctrl: 'Coil A1–A2 (24 VDC or 230 VAC), NO/NC auxiliary contacts (13–14, 21–22) for feedback.' },
  accessories: ['Auxiliary contact block for status feedback.', 'Coil suppressor (RC/varistor/diode) to protect the control output.', 'Mechanical interlock when a contactor pair is used for source transfer.', 'Mirror contact if used in a safety circuit.'],
  compat: ['Rated current for the correct {{ac_cat|utilisation category}} (AC-1, AC-3, DC-1…).', 'Coil voltage matches the control supply; coil power matches the output or interface relay.', 'Number of poles (switch N for source transfer/islanding).', 'Enough auxiliary contacts for feedback + interlock.'],
  params: [
    { n: 'Rated current per utilisation category', m: 'Maximum current switched for the load type.', u: 'A (AC-1/AC-3)', i: 'Resistive loads use AC-1; motors AC-3.', h: 'Feeder Ib + load type.', e: '2 kW resistive step: Ib ≈ 2.9 A, AC-1 → smallest contactor is enough.', c: 'Electrical life at the expected number of operations.' },
    { n: 'Coil voltage and power', m: 'Coil control voltage; inrush and holding power.', i: 'Determines whether an interface relay is needed.', h: 'Per the cabinet control supply.', e: '230 VAC coil → KA needed because the PLC DO is a 24 VDC transistor.', c: 'Coil inrush current versus KA contact rating.' },
    { n: 'Number of poles', m: 'Number of main contacts.', i: 'A grid-disconnection contactor usually needs 4P.', h: 'Per the earthing system in both modes.', e: 'KM-PCC: 4P.', c: 'Rules on switching the neutral in island mode.' },
    { n: 'Auxiliary contacts', m: 'Number of auxiliary NO/NC.', i: 'At least 1 NO needed for feedback to the PLC.', h: 'From the I/O list and interlocks.', e: '1 NO feedback + 1 NC interlock.', c: 'Auxiliary contact current at 24 VDC (reliable at low current).' }
  ],
  example: {
    ok: { t: 'KM-RL1: 2 kW resistive load step', d: 'AC-1, 3P, 230 VAC coil via interface relay KA, 1 NO feedback to a DI.' },
    ko: { t: 'AC contactor used to switch a 200 V DC battery circuit', d: 'An AC rating does not guarantee DC arc extinction. The DC side uses DC-rated devices specified by the battery manufacturer.' }
  },
  brands: 'Example product ranges for reference: Schneider TeSys (D/Deca), Acti9 iCT (modular); ABB AF, Siemens SIRIUS… — check the datasheet.'
},
decrelay: {
  name: 'Interface (decoupling) protection relay', group: 'Switching & protection',
  func: 'Monitors U and f on the grid side of the PCC; when out of limits (grid loss, over/undervoltage, over/underfrequency) it orders the disconnection device to open, preventing the microgrid from feeding a faulty grid.',
  principle: 'Measures voltage directly at 400 V (no VT needed), computes U, f and possibly df/dt; compares with thresholds and time delays; operates the trip output contacts. Has an internal watchdog and a fault contact.',
  notdo: 'Does not interrupt current itself (KM-PCC/a breaker does). No overcurrent protection. Does not decide island operation — it only disconnects.',
  confusions: [['Interface relay', 'An interface relay measures nothing.'], ['Safety relay', 'A safety relay protects people from machines (emergency stop), it does not monitor the grid.'], ['PLC', 'The PLC can read U/f from a meter, but the disconnection function must be performed by a dedicated protection device (or a certified function integrated in the inverter) per grid-connection rules.']],
  ports: { meas: 'Voltage inputs L1-L2-L3-N (via an MCB protecting the measuring circuit).', aux: 'Auxiliary supply (usually 24 VDC or 230 VAC — check).', ctrl: 'Trip relay outputs (to the KM-PCC coil and/or MX), status/fault contacts to the PLC.' },
  accessories: ['Small MCB protecting the voltage measuring circuit.', 'Maintained auxiliary supply (UPS) so the relay keeps working on grid loss.', 'Certification to the grid-connection rules (e.g. EN 50549-1 or national rules) — to be verified.'],
  compat: ['Thresholds/times set per the local grid-connection rules — not taken from this site.', 'Trip contact able to switch the KM-PCC coil current, or via an interface relay.', 'Safe behaviour on loss of auxiliary supply (fail-safe: disconnect).'],
  params: [
    { n: 'Measured voltage', m: 'Measuring input voltage range.', i: 'Direct measurement at 400 V; MV needs a VT.', h: 'Per the connection point.', e: '400 V 3P+N direct.', c: 'Connection type (3P+N or 3P without N).' },
    { n: 'Protection functions', m: 'Supported {{ansi|ANSI}} thresholds.', i: 'Must include every function required by the rules.', h: 'From the grid-connection rules.', e: '27, 59, 81O/U, possibly 59N, df/dt — to be verified.', c: 'Thresholds set by the network operator.' },
    { n: 'Auxiliary supply', m: 'Relay supply voltage and consumption.', i: 'If powered by the very grid it monitors, grid loss = relay loss → UPS/fail-safe needed.', h: 'Per the control supply.', e: '24 VDC from a UPS-backed branch.', c: 'Behaviour on loss of auxiliary supply.' },
    { n: 'Trip output', m: 'Type and rating of the output contacts.', i: 'Whether it can switch the KM-PCC coil directly.', h: 'Compare with the coil current.', e: 'Check the datasheet.', c: 'NO or NC, fail-safe logic.' }
  ],
  example: {
    ok: { t: '400 V interface relay with 24 VDC supply, trip output to KM-PCC and MX', d: '24 VDC taken after the UPS → the relay still operates on grid loss; status contact to the PLC for event logging.' },
    ko: { t: 'Using the PLC to read frequency from a Modbus meter for disconnection', d: 'Response time depends on the polling cycle and communication, and it is not certified. It does not replace the required interface protection.' }
  },
  brands: 'Many manufacturers make interface/VFR relays (e.g. Schneider Easergy for MV, various makers for LV) — choose from the network operator’s accepted list; check the datasheet.'
},
ct: {
  name: 'Current transformer', group: 'Measurement',
  func: 'Lets a meter measure large currents by converting them into a small, isolated secondary current (or voltage).',
  principle: 'The primary conductor passes through the core; secondary current = primary current / ratio. 1 A/5 A types are current sources: an open secondary produces dangerous voltages. mV (333 mV) or Rogowski types are safer but only work with meters supporting them.',
  notdo: 'Does not measure voltage; a CT alone gives no power value. Provides no protection.',
  confusions: [['Voltage transformer (VT)', 'A VT steps high voltage down to 100 V; not needed at 400 V.'], ['Protection CT', 'A metering CT saturates early (protecting the meter); a protection CT (5P…) stays accurate at fault currents.']],
  ports: { power: 'Primary: cable/busbar passing through (correct P1→P2 direction).', meas: 'Secondary S1–S2 to the meter via shorting terminals.' },
  accessories: ['CT test/shorting terminal blocks.', 'Secondary wires with enough cross-section for the VA burden.', 'Earth one point of the secondary (per instructions).'],
  compat: ['Output type (5 A / 1 A / 333 mV) MATCHES the meter input type.', 'Ratio suited to the current range (accurate at 20–120 % In).', 'Accuracy class of the CT + meter chain.', 'Aperture large enough for the cable.', 'Correct mounting direction (wrong direction → wrong power sign).'],
  params: [
    { n: 'CT ratio', m: 'Rated primary current / secondary current.', i: 'Operating current should be within the accurate range.', h: 'From the largest Ib through the measuring point.', e: '50/5 A for the PCC (max Ib ≈ 52 A — consider 60/5).', c: 'Ratio correctly set in the meter.' },
    { n: 'Accuracy class', m: 'Ratio and phase error.', i: 'The measuring chain is no more accurate than its worst element.', h: 'Per the purpose (monitoring/energy).', e: 'Cl. 0.5 or 1.', c: 'Rated burden VA ≥ wiring + meter burden.' },
    { n: 'Output type', m: '5 A, 1 A, 333 mV, Rogowski.', i: 'Must match the meter.', h: 'Per the chosen meter.', e: '5 A.', c: 'The most common incompatibility.' },
    { n: 'Rated burden', m: 'Maximum secondary burden keeping the accuracy class.', i: 'Long wires increase the burden.', h: 'Wiring + meter input impedance.', e: 'Check the datasheet.', c: '' }
  ],
  example: {
    ok: { t: '3 × CT 50/5 A Cl. 0.5 + meter with 5 A input', d: 'Output type matches; ratio set in the meter = 10.' },
    ko: { t: '333 mV output CT with a meter that only has 5 A inputs', d: 'The signal is far too small; the meter reads near 0. Both being “CTs” does not mean they are compatible.' }
  },
  brands: 'Example product ranges for reference: Schneider PowerLogic TC, Socomec, Circutor… — check the datasheet.'
},
meter: {
  name: 'Power meter', group: 'Measurement',
  func: 'Measures U, I, P, Q, S, cos φ, f and energy at one point and provides them to the PLC/EMS over communication.',
  principle: 'Samples voltage (direct measurement) and current (via CTs or direct ≤ 63 A for direct-connected types) and computes the quantities. The power sign depends on CT direction and configuration.',
  notdo: 'Does not protect or trip. Transmitted values have a delay (polling cycle) and are not used for fast protection.',
  confusions: [['Billing meter', 'A billing meter (MID/IEC 62053) is for invoicing; a monitoring device (IEC 61557-12) provides more quantities.'], ['Protection relay', 'A relay also measures, but its purpose is fast, certified tripping.']],
  ports: { meas: 'Voltage inputs V1-V2-V3-VN (via MCB/fuses), current inputs I1-I3 (S1/S2) or direct measuring terminals.', aux: 'Supply (self-powered from the measuring circuit or separate).', comm: 'RS485 (Modbus RTU) or Ethernet (Modbus TCP) depending on the model.', ctrl: 'Depending on the model: pulse outputs, DI/DO.' },
  accessories: ['CTs (if not direct-connected).', 'MCB/fuses protecting the voltage measuring circuit.', 'RS485 termination resistor if at the end of the bus.', 'Manufacturer’s register map.'],
  compat: ['Network type (3P4W, 3P3W, 1P2W).', 'Current input matches the CT (5 A/1 A/mV).', 'Communication port matches the PLC side (RS485 or Ethernet) — otherwise a gateway is needed.', 'Protocol and register map include every quantity needed (e.g. signed per-phase P).', 'Data type (FLOAT32, INT32…) and word order the PLC can handle.'],
  params: [
    { n: 'Connection type and voltage', m: 'Supported networks and voltage range.', i: 'Must match the system.', h: 'Per the measuring point.', e: '400 V 3P4W.', c: '' },
    { n: 'Current input', m: 'Via CT (5 A/1 A/mV) or direct.', i: 'Determines whether CTs are needed.', h: 'Ib at the measuring point: > 63 A usually uses CTs.', e: 'PCC: 5 A CT; small feeders: direct.', c: 'Maximum direct measuring current.' },
    { n: 'Accuracy class', m: 'Power/energy accuracy class.', i: 'Monitoring: 1 or 0.5S.', h: 'Per the purpose.', e: 'Cl. 0.5S (assumed).', c: 'Per IEC 61557-12 or IEC 62053.' },
    { n: 'Communication', m: 'Port, protocol, role.', i: 'Determines how the PLC reads it.', h: 'Per the communication architecture.', e: 'PCC: Modbus TCP (server); feeders: Modbus RTU (slave).', c: 'Maximum simultaneous TCP connections; update rate.' },
    { n: 'Sign convention', m: 'Which sign corresponds to import/export.', i: 'Wrong sign → the EMS charges the battery when it should discharge.', h: 'Configuration + CT direction.', e: 'PCC: P > 0 = import from the grid.', c: 'Test with a known load during commissioning.' }
  ],
  example: {
    ok: { t: 'PCC meter with Ethernet Modbus TCP + 3 × 5 A CTs', d: 'The PLC (client) reads the signed total P every 1 s; the EMS also reads it via the switch if the meter allows ≥ 2 connections.' },
    ko: { t: 'Meter with RS485 only, PLC with Ethernet only', d: 'Both support “Modbus” but the physical interfaces differ → an RS485 module for the PLC or a Modbus TCP/RTU gateway is needed.' }
  },
  brands: 'Example product ranges for reference: Schneider PowerLogic PM5000 / iEM3000, Siemens SENTRON PAC, Janitza, Socomec Diris… — ports and protocols vary by model; check the datasheet.'
},
busbar: {
  name: 'Main AC busbar', group: 'Distribution',
  func: 'Common connection point of all sources and load feeders in the main board.',
  principle: 'Copper conductor sized for the total current; Kirchhoff’s law applies here: total power in = total power out (ignoring losses).',
  notdo: 'Does not measure or protect.',
  confusions: [['PCC', 'The PCC is the boundary with the grid; the busbar is the internal distribution point.']],
  ports: { power: 'Feeder connection points (source inputs, load outputs).' },
  accessories: ['Insulating supports, IP2X covers.', 'Comb/distribution block if modular devices are used.'],
  compat: ['Rated current ≥ the largest possible current (including several sources supplying at once).', 'Icw/Ipk ≥ short-circuit current.', 'Per IEC 61439 when installed in a board.'],
  params: [
    { n: 'Rated current', m: 'Permitted continuous current.', i: 'Include the case where grid + PV + battery supply loads together.', h: 'Sum of sources that can supply simultaneously.', e: '63 A (preliminary).', c: 'Temperature inside the board.' },
    { n: 'Short-circuit withstand current', m: 'Ability to withstand electrodynamic and thermal stress during a short circuit.', i: 'Depends on the PCC Icc.', h: 'From the Icc.', e: 'Insufficient data.', c: 'Busbar system tested to IEC 61439.' }
  ],
  example: { ok: { t: '4P 63 A distribution block', d: 'Enough for the lab model if the Icc is suitable.' }, ko: { t: '40 A busbar', d: 'A 36 kVA grid + 5 kW PV can supply a 17 kW load + 5 kW battery charging → current can exceed 40 A.' } }
}
});
Object.assign(SG.I18D.en.types, {
pvarray: {
  name: 'PV array / PV simulator', group: 'Sources',
  func: 'Produces DC power from irradiance. In a lab it can be replaced by a programmable DC source emulating the I-V curve (PV simulator) for repeatable tests.',
  principle: 'Each module has an I–V curve; the open-circuit voltage Voc rises in cold weather. Modules are connected in series into strings to reach the inverter input voltage.',
  notdo: 'Does not regulate its own power; the inverter sets the operating point.',
  confusions: [['Ordinary lab DC power supply', 'A fixed-voltage DC source has no PV-like I-V characteristic; the MPPT may oscillate. A true PV simulator is needed.']],
  ports: { power: 'DC + / − cables (PV connectors, e.g. MC4-compatible — do not mix brands).' },
  accessories: ['Solar DC cable, connectors of the same type/brand on both sides.', 'Mounting structure and frame earthing (if real modules).'],
  compat: ['String Voc at the lowest temperature < inverter maximum DC voltage.', 'String Vmp within the MPPT range at all temperatures.', 'Isc ≤ inverter maximum input short-circuit current.'],
  params: [
    { n: 'Peak power', m: 'Power at standard test conditions (STC).', u: 'kWp', i: 'DC/AC ratio relative to the inverter (usually 1.0–1.3).', h: 'Per the test objectives.', e: '6 kWp for a 5 kW inverter.', c: '' },
    { n: 'Modules in series', m: 'Number of modules per string.', u: 'modules', i: 'Sets the string voltage.', h: 'From Voc, Vmp and the inverter ranges.', e: '14 modules.', c: 'Compute Voc at Tmin.' },
    { n: 'Module open-circuit voltage', m: 'At STC (25 °C).', i: 'Input for the string Voc calculation.', h: 'Module datasheet.', e: '41.5 V (assumed).', c: '' },
    { n: 'Voc temperature coefficient', m: 'Change of Voc with temperature.', i: 'Cold weather → higher Voc.', h: 'Module datasheet.', e: '−0.28 %/°C (assumed).', c: '' },
    { n: 'Minimum site temperature', m: 'Lowest expected cell temperature.', i: 'Highest-voltage case.', h: 'Climate data (indoors: room temperature).', e: '−10 °C (if installed outdoors).', c: '' }
  ],
  example: {
    ok: { t: '14 modules × 41.5 V, Tmin −10 °C', d: 'Voc,max = 14 × 41.5 × (1 + 0.0028 × 35) ≈ 638 V < 1000 V; Vmp within the assumed 200–800 V MPPT range.' },
    ko: { t: '25 modules in series', d: 'Voc,max ≈ 1139 V > 1000 V → exceeds the maximum DC voltage and can destroy the inverter.' }
  }
},
pvdcbox: {
  name: 'PV DC protection box', group: 'Switching & protection',
  func: 'Isolates the DC side for maintenance, protects strings against reverse current (with several parallel strings) and limits DC-side transient overvoltages.',
  principle: 'A DC arc does not self-extinguish at a current zero like AC → devices must be DC-rated at the right voltage. gPV fuses (IEC 60269-6) are only needed with ≥ 3 parallel strings (or per regulations).',
  notdo: 'Does not replace the AC grid-side circuit breaker; no AC-side shock protection.',
  confusions: [['AC circuit breaker', 'An AC rating does not mean it can break 600 V DC.']],
  ports: { power: 'DC input from the string, DC output to the inverter.', ctrl: 'Optional: SPD failure contact.' },
  accessories: ['PV-type DC SPD.', 'Warning label “DC – still live when AC is switched off”.'],
  compat: ['Rated DC voltage ≥ string Voc,max.', 'Current ≥ 1.25 × Isc (per regulations).', 'Number of strings → whether fuses are needed.'],
  params: [
    { n: 'Rated DC voltage', m: 'Maximum DC voltage the device can break/withstand.', i: '≥ Voc,max computed at Tmin.', h: 'From the string calculation.', e: '≥ 638 V → choose a 1000 V DC type.', c: 'Pole series wiring to reach Udc.' },
    { n: 'Rated DC current', m: '', i: '≥ string current with a safety factor.', h: 'Isc × factor per regulations.', e: 'Check against the applicable PV rules.', c: '' },
    { n: 'DC SPD', m: 'Ucpv, In, Up.', i: 'Up < inverter impulse withstand.', h: 'Per the lightning risk assessment.', e: 'To be checked.', c: '' }
  ],
  example: { ok: { t: '1000 V DC disconnector + PV SPD, 1 string', d: 'A single string → no string fuses needed (to be verified against regulations).' }, ko: { t: 'Using a 230 V AC MCB as DC isolator', d: 'Not rated for 600 V DC; an arc may be sustained.' } }
},
pvinv: {
  name: 'Grid-tied PV inverter', group: 'Sources',
  func: 'Converts PV DC into AC synchronised with the grid, tracks the maximum power point and accepts power limitation commands.',
  principle: '{{mppt|MPPT}} sets the optimal DC voltage; the inverter stage injects current in phase with the grid voltage ({{gfl|grid-following}}). Built-in {{anti_isl|anti-islanding}}: grid loss → stops output within the required time.',
  notdo: 'Usually does NOT form a grid: no supply on grid loss without a grid-forming source. Does not charge a battery directly (except hybrid inverters).',
  confusions: [['PCS', 'The PCS is a bidirectional converter for the battery; a PV inverter is one-way DC→AC.'], ['BMS', 'The BMS manages the battery and converts no power.']],
  ports: { power: 'DC input (MPPT), AC output 3P+N+PE.', comm: 'Ethernet (Modbus TCP/SunSpec, web) and/or RS485 — depending on the model.', ctrl: 'Depending on the model: power-limitation input, fault relay.' },
  accessories: ['AC circuit breaker per the manufacturer’s recommendation.', 'RCD if required (type A or B depending on the inverter).', 'DC box.', 'Register map/supported SunSpec models.'],
  compat: ['AC voltage/number of phases.', 'MPPT range and Vdc,max versus the PV string.', 'Ability to accept a P-limit setpoint via communication (writable register, response time).', 'Operation on a grid formed by the PCS in island mode (frequency range, P(f) curtailment) — check the PCS manufacturer’s compatibility list.', 'Grid-connection certification for the installation site.'],
  params: [
    { n: 'Rated AC power', m: 'Maximum AC output power.', i: 'AC current and feeder breaker selection.', h: 'From Pdc and objectives.', e: '5 kW, 3P.', c: 'Maximum kVA when supplying Q.' },
    { n: 'Maximum DC voltage', m: 'Absolute input limit.', i: 'String Voc,max must be lower.', h: 'Datasheet.', e: '1000 V (assumed).', c: '' },
    { n: 'MPPT range', m: 'Optimal DC operating voltage.', i: 'String Vmp must lie within it.', h: 'Datasheet.', e: '200–800 V (assumed).', c: 'Number of MPPTs, current per MPPT.' },
    { n: 'Communication', m: 'Port, protocol, read/write quantities.', i: 'Determines whether the EMS can limit the PV.', h: 'Datasheet + register map.', e: 'Modbus TCP — register map: NOT YET AVAILABLE.', c: 'Whether the P-limit register is stored in memory (avoid wearing out the EEPROM with continuous writes).' },
    { n: 'Grid mode', m: 'Grid-following/forming, P(f), Q(U).', i: 'Island operation with a grid-forming PCS.', h: 'Datasheet.', e: 'Grid-following, with P(f) (assumed).', c: 'PCS manufacturer’s “AC coupling” compatibility list.' },
    { n: 'Environment & installation', m: 'IP, temperature, cooling, noise.', i: 'Wall-mounted outside the cabinet, ventilation clearances.', h: 'Datasheet.', e: 'IP65 wall-mounted (common, to be checked).', c: '' }
  ],
  example: {
    ok: { t: '5 kW 3P inverter, MPPT 200–800 V, Modbus TCP with register map', d: 'The 14-module string is within range; the EMS can write the P limit when export must be prevented.' },
    ko: { t: 'Inverter with only an RS485 port and a proprietary protocol', d: 'The physical port can be connected through a gateway, but if the protocol is not published the PLC/EMS cannot read/write.' }
  },
  brands: 'Examples for reference: SMA, Fronius, Huawei, SolarEdge, Schneider (Conext)… — SunSpec/Modbus support varies by model; check the datasheet.'
},
battery: {
  name: 'Storage battery', group: 'Storage',
  func: 'Stores DC energy; supplies/absorbs power via the PCS.',
  principle: 'LFP (lithium iron phosphate) cells in series/parallel form modules, with an internal DC contactor and fuses, monitored by the BMS.',
  notdo: 'Does not connect to AC by itself; does not decide charge/discharge by itself.',
  confusions: [['BMS', 'The battery stores, the BMS manages; often one product but different functions.']],
  ports: { power: 'DC + / − terminals (high voltage or 48 V depending on the system).', comm: 'BMS port (CAN/RS485) — see BMS.' },
  accessories: ['DC protection (fuses/DC breaker) per the manufacturer.', 'Ventilation/room temperature, fire safety clearances.'],
  compat: ['Battery voltage range within the PCS DC range.', 'Continuous charge/discharge current ≥ PCS power / voltage.', 'Battery–PCS pair on the compatibility list.'],
  params: [
    { n: 'Capacity', m: 'Nominal (and usable) energy.', i: 'Supply duration in island mode.', h: 'Load power × desired duration.', e: '10 kWh.', c: 'Usable capacity between SOC min/max.' },
    { n: 'Nominal voltage / range', m: '', i: 'Must match the PCS.', h: 'Datasheet.', e: '200 V (assumed).', c: '' },
    { n: 'Continuous charge/discharge current', m: '', i: 'Limits the actual power.', h: 'P = U × I.', e: '25 A → 5 kW at 200 V.', c: 'Reduced with temperature/SOC (computed by the BMS).' },
    { n: 'Operating SOC limits', m: 'SOC min/max applied by the EMS.', i: 'Reserve for island mode.', h: 'Operating strategy.', e: '20 % / 90 %.', c: '' }
  ],
  example: { ok: { t: '10 kWh LFP battery, 200 V, 25 A continuous', d: 'Enough for a 5 kW PCS (5000/200 = 25 A).' }, ko: { t: '48 V battery for a high-voltage PCS', d: 'DC voltage ranges do not match — cannot be connected.' } }
},
bms: {
  name: 'Battery management system', group: 'Storage',
  func: 'Keeps the battery in its safe area: measures cell voltages, temperature and current; computes SOC/SOH; balances; opens the DC contactor when limits are exceeded; sends charge/discharge limits to the PCS.',
  principle: 'Measuring boards on each module + a master controller. Continuously sends {{bms_lim|CVL/CCL/DCL}} and SOC to the PCS over {{can|CAN}} or RS485 using the manufacturer’s protocol.',
  notdo: 'Does not convert power, does not control the grid, is not an EMS.',
  confusions: [['PCS', 'The PCS charges/discharges; the BMS permits/limits.'], ['EMS', 'The EMS decides strategy (when to charge); the BMS protects the battery.']],
  ports: { comm: 'CAN or RS485 to the PCS (mandatory); possibly a port for monitoring.', ctrl: 'Fault contact, emergency stop input depending on the model.', aux: 'Supply from the battery or external.' },
  accessories: ['Communication cable with the pinout specified by the manufacturer.', 'CAN termination resistor.'],
  compat: ['BMS↔PCS protocol recognised by both manufacturers (compatibility list).', 'RJ45 pinout of the CAN port (no common standard).', 'CAN bit rate (e.g. 250/500 kbit/s).'],
  params: [
    { n: 'Protocol to the PCS', m: 'Message set the PCS understands.', i: 'Mismatch → the PCS will not charge/discharge.', h: 'PCS compatibility list.', e: 'CAN, manufacturer protocol — NOT VERIFIED.', c: 'Firmware versions on both sides.' },
    { n: 'Quantities provided', m: 'SOC, SOH, T, min/max cell U, alarms.', i: 'The EMS needs a reliable SOC.', h: 'Protocol documentation.', e: 'SOC relayed via the PCS over Modbus TCP.', c: '' }
  ],
  example: { ok: { t: 'Battery and PCS both on the official compatibility list', d: 'The PCS receives the CCL/DCL limits and reduces power itself when the battery is cold.' }, ko: { t: 'Same RJ45 CAN port but a different protocol', d: 'The PCS reports “BMS communication lost” and does not discharge — identical ports do not mean compatibility.' } }
},
pcs: {
  name: 'Battery power conversion system', group: 'Storage',
  func: 'Charges and discharges the battery on the AC side per setpoint; if grid-forming, it forms the grid in island mode.',
  principle: 'Bidirectional IGBT bridge. {{gfl|Grid-following}} mode: current control per P/Q setpoint. {{gfm|Grid-forming}} mode: holds U and f, power balances itself with the load.',
  notdo: 'Does not replace the BMS (no cell monitoring). A grid-following unit cannot supply power on grid loss.',
  confusions: [['PV inverter', 'One-way, MPPT; the PCS is bidirectional with the battery.'], ['BMS', 'The BMS protects the battery, the PCS converts power.'], ['UPS', 'An online UPS always goes through the converter; a microgrid PCS changes mode on grid loss (possibly with an interruption).']],
  ports: { power: 'Battery DC, AC 3P+N+PE.', comm: 'CAN/RS485 to the BMS; Ethernet (Modbus TCP) to the PLC/EMS.', ctrl: 'Depending on the model: enable input, status relay, generator start output.' },
  accessories: ['AC circuit breaker, DC protection.', 'A current sensor at the PCC may be required for the manufacturer’s zero-export function.', 'Internal or external N–PE relay in island mode (earthing system) — to be verified.'],
  compat: ['DC voltage range matches the battery.', 'BMS protocol.', 'Grid-forming if island operation is wanted; short-time overload capacity for motor starting current.', 'Transfer time to island mode.', 'Ability to resynchronise with the grid.', 'Works with an AC-coupled PV inverter (P(f)).'],
  params: [
    { n: 'Rated power', m: 'Continuous charge/discharge power.', i: 'Limits load compensation and maximum island load.', h: 'From priority loads + motor.', e: '5 kW 3P.', c: 'Short-time overload (e.g. for a few seconds).' },
    { n: 'Grid-forming', m: 'Ability to form the grid.', u: 'yes/no', i: 'Mandatory for battery-based island operation.', h: 'Datasheet.', e: 'Yes (assumed).', c: 'Whether a separate transfer accessory is needed.' },
    { n: 'Transfer time', m: 'Time from grid loss to restored supply in island mode.', i: 'Sensitive loads (PCs) may reboot.', h: 'Datasheet.', e: 'Check the datasheet.', c: '' },
    { n: 'EMS communication', m: 'Read P, SOC; write P setpoint, mode.', i: 'Control from the EMS.', h: 'Register map.', e: 'Modbus TCP (assumed).', c: 'Watchdog: behaviour when the setpoint is lost.' }
  ],
  example: { ok: { t: '5 kW grid-forming PCS + battery on the compatibility list', d: 'Enables the grid-loss and island scenarios.' }, ko: { t: 'Grid-following PCS with “island mode” switched on', d: 'No grid-forming source → the island scenario is locked.' } },
  brands: 'Examples for reference: Schneider (Conext XW), Victron, SMA (Sunny Island), Studer… — grid-forming capability and compatible battery lists differ; check the datasheet.'
},
genset: {
  name: 'Generator set', group: 'Sources',
  func: 'Backup grid-forming source when the grid is lost and the battery is insufficient.',
  principle: 'An engine drives a synchronous alternator; the AVR holds voltage, the governor holds frequency. Slow response to large load steps.',
  notdo: 'Cannot absorb power (reverse power is dangerous). Must not run in parallel with the grid without a synchroniser, protection and a connection agreement.',
  confusions: [['Battery grid-forming source', 'Both form the grid; the generator is slower but provides long-duration energy.']],
  ports: { power: '3P+N output.', ctrl: 'Connection to the generator controller.' },
  accessories: ['Generator controller.', 'Exhaust and ventilation (in an 80 m² room: install outside or use an emulated source).', 'Starting battery and charger.'],
  compat: ['kVA ≥ priority loads + motor starting current.', 'No parallel operation with the grid in the reference architecture.', 'Limit PV while the generator runs (minimum load, reverse power).'],
  params: [
    { n: 'Apparent power', m: '', u: 'kVA @ cos φ 0.8', i: 'Current and breaker selection.', h: 'Maximum load while on generator.', e: '10 kVA / 8 kW.', c: 'PRP/ESP rating (ISO 8528).' },
    { n: 'Recommended minimum load', m: '', i: 'PV/battery charging must be limited.', h: 'Manufacturer’s instructions.', e: '30 % (assumed).', c: '' },
    { n: 'Location', m: '', i: 'A diesel generator must not be placed in a closed lab.', h: 'Fire and exhaust safety rules.', e: 'Outdoors, or replace with an emulated source.', c: '' }
  ],
  example: { ok: { t: '10 kVA 3P generator + controller with remote start', d: 'Enough for priority loads + a 2.2 kW motor via the drive.' }, ko: { t: '3 kVA generator for a 6 kW load', d: 'Overload → voltage/frequency dip, the generator shuts down to protect itself.' } }
},
genctrl: {
  name: 'Generator controller', group: 'Control',
  func: 'Starts/stops the generator, monitors and protects engine and alternator, reports status to the PLC.',
  principle: 'Receives a “remote start” command (dry contact) or starts automatically on grid loss (AMF). Measures generator U, f, I; signals “ready to take load” when stable.',
  notdo: 'Basic models do not synchronise or share load. Does not replace the PLC in the microgrid source-transfer logic unless configured to do so.',
  confusions: [['PLC', 'The GCU controls only the generator; the PLC coordinates the whole system.'], ['Synchroniser', 'The ANSI 25 function exists only in advanced GCUs or separate devices.']],
  ports: { ctrl: 'Remote start DI, “running/ready” and “common alarm” DOs, possibly a generator contactor close output.', comm: 'RS485 Modbus RTU (common) or Ethernet depending on the model.', aux: '12/24 VDC from the starting battery.' },
  accessories: ['Register map.', 'Interface relay if the remote start input needs a dry contact.'],
  compat: ['Remote start input: dry contact or 12/24 V voltage — compare with the PLC output.', 'GCU supply (generator battery) differs from the cabinet supply → use a dry contact for isolation.', 'Synchronisation function if a no-break transfer is wanted.'],
  params: [
    { n: 'Functions', m: 'Start/stop, AMF, synchronisation, load sharing.', i: 'Determines which scenarios are allowed.', h: 'Datasheet.', e: 'Remote start + Modbus; NO synchronisation (assumed).', c: '' },
    { n: 'Communication', m: '', i: 'The PLC reads P, U, f.', h: 'Datasheet.', e: 'RS485 Modbus RTU, address 1.', c: 'Baud rate/parity.' }
  ],
  example: { ok: { t: 'GCU with a dry-contact remote start input', d: 'The PLC closes KA3 → the GCU starts; the GCU reports “ready” via a DO → the PLC allows KM-GEN to close.' }, ko: { t: 'Wiring a PLC 24 VDC DO directly to a remote start input powered by the generator’s 12 V battery', d: 'Two different supplies may cause circulating currents/damage; use an interface relay.' } }
},
vfd: {
  name: 'Variable-speed drive', group: 'Motor load',
  func: 'Controls motor speed, soft-starts (reduces starting current — important in island mode), protects the motor thermally.',
  principle: 'Rectifier → DC bus → PWM inverter. Receives run commands via DI or communication, speed via AI or communication. Has an {{sto|STO}} function.',
  notdo: 'Not an isolating device; STO does not remove power from the motor (voltage remains). Does not replace the upstream cable-protection breaker.',
  confusions: [['Soft starter', 'A soft starter only reduces starting current, it does not control speed.'], ['Contactor', 'A contactor switches the supply; the drive controls speed and torque.']],
  ports: { power: 'L1-L2-L3 in, U-V-W out to the motor (shielded cable against interference).', ctrl: 'Run/stop/reset DIs, speed AI, fault/running relays, dual-channel STO.', comm: 'Built-in Modbus RTU or Ethernet (depending on the model/option card).' },
  accessories: ['Circuit breaker or fuses per the manufacturer’s instructions.', 'EMC filter, input line choke if needed.', 'Shielded motor cable with 360° shield bonding.', 'Communication card if Ethernet is wanted.'],
  compat: ['Power and current ≥ the motor.', '3P 400 V supply.', 'DI type (PNP/NPN) matches the PLC DO.', 'AI 0–10 V or 4–20 mA matches the PLC AO.', 'High-frequency leakage current → suitable RCD type (per manufacturer).'],
  params: [
    { n: 'Rated power / current', m: '', i: '≥ the motor, mind heavy/normal duty.', h: 'Motor nameplate.', e: '2.2 kW, 400 V.', c: '' },
    { n: 'Control I/O', m: 'Number of DI/AI/relays, PNP/NPN logic.', i: 'Interfacing with the PLC.', h: 'Datasheet.', e: 'DI 24 V PNP, AI 0–10 V, relay R1 fault.', c: '' },
    { n: 'STO', m: 'SIL/PL safety level.', i: 'Emergency stop without a separate contactor (depending on assessment).', h: 'Risk assessment.', e: 'Yes (assumed).', c: 'Wired from the safety relay.' },
    { n: 'Heat dissipation', m: 'Heat losses inside the cabinet.', i: 'Cabinet fan sizing.', h: 'Datasheet.', e: '~3 % of power (estimate).', c: '' }
  ],
  example: { ok: { t: '2.2 kW drive, PNP DI, STO', d: 'The PLC sends a 24 V PNP DO to the run DI; 0–10 V AO for speed; “running” relay back to a DI.' }, ko: { t: 'Drive inputs configured NPN, PLC outputs PNP', d: 'The drive ignores the run command although the DO LED is on. Reconfigure the DI logic or change module.' } },
  brands: 'Examples for reference: Schneider Altivar, ABB ACS, Siemens SINAMICS, Danfoss… — check the datasheet.'
},
motor: {
  name: 'Induction motor', group: 'Motor load',
  func: 'Representative motor load (fan/pump) to study starting, inrush current, speed control and emergency stop.',
  principle: 'A rotating field drives the rotor; direct-on-line starting draws 6–8 × In, via a drive close to In.',
  notdo: '—',
  ports: { power: 'U-V-W + PE.', meas: 'Optional: PTC/PT100 in the windings.' },
  accessories: ['Mechanical load (fan, powder brake) for real power.'],
  compat: ['Star/delta connection matches 400 V.', 'Suitable for drive operation (insulation).'],
  params: [
    { n: 'Mechanical power', m: '', i: 'Drive/protection selection.', h: 'Nameplate.', e: '2.2 kW.', c: '' },
    { n: 'Rated current', m: '', i: 'Set the thermal protection in the drive.', h: 'Nameplate.', e: '≈ 4.7 A at 400 V (estimate).', c: '' },
    { n: 'Efficiency, cos φ', m: '', i: 'Electrical power drawn.', h: 'Nameplate/IE class.', e: 'η 0.85; cos φ 0.82.', c: '' }
  ],
  example: { ok: { t: '2.2 kW 400 V Δ motor', d: '2.2 kW drive.' }, ko: { t: '230/400 V motor connected in Δ on a 400 V supply', d: 'Each winding sees 400 V instead of 230 V → burnt windings. Connect in Y.' } }
},
loadbank: {
  name: 'Adjustable resistive load bank', group: 'Loads',
  func: 'Sheddable load adjustable in steps to test power balancing.',
  principle: 'Resistive steps (cos φ = 1), each switched by its own contactor.',
  notdo: 'No fine adjustment (except with a thyristor controller).',
  ports: { power: '3P input per step.' },
  accessories: ['One contactor per step.', 'Ventilation: all the power becomes heat in the room!'],
  compat: ['Heat in an 80 m² room: 6 kW of heat needs ventilation/air conditioning.', 'AC-1 contactors.'],
  params: [
    { n: 'Number of steps × power', m: '', i: 'Load-shedding granularity.', h: 'Test scenario.', e: '3 × 2 kW.', c: '' },
    { n: 'Heat output', m: '', i: 'Ventilation system.', h: '= power.', e: '6 kW.', c: 'Overtemperature sensor.' }
  ],
  example: { ok: { t: '3 steps of 2 kW, 3P, with fan and thermometer', d: 'Fine enough to see each load-shedding step.' }, ko: { t: '6 kW load inside a closed cabinet', d: 'Overheating, damage to nearby equipment.' } }
},
genericload: {
  name: 'Priority load feeder', group: 'Loads',
  func: 'Loads to keep supplied as far as possible (lighting, instrument sockets, SCADA PC…).',
  principle: 'Never shed; restored first in island mode.',
  notdo: '—',
  ports: { power: '3P+N or 1P+N input.' },
  accessories: ['30 mA RCD for sockets (per regulations).'],
  compat: ['Total priority load < PCS power in island mode.'],
  params: [{ n: 'Power', m: '', i: 'PCS/generator sizing.', h: 'List the equipment.', e: '1.5 kW.', c: '' }],
  example: { ok: { t: '1.5 kW priority load', d: '< 5 kW PCS in island mode.' }, ko: { t: 'Merging the resistive load into the priority load', d: 'In island mode the PCS power is exceeded and nothing is left to shed.' } }
},
evse: {
  name: 'AC EV charging station', group: 'Loads',
  func: 'Charges electric vehicles; the charging current can be limited on EMS command (controllable load).',
  principle: 'Advertises the maximum current to the vehicle via the Control Pilot PWM signal (IEC 61851-1); the vehicle adapts. Receives limits via {{ocpp|OCPP}} or Modbus depending on the charger.',
  notdo: 'Cannot go below the minimum current (usually 6 A per IEC 61851) — it can only pause.',
  confusions: [['Ordinary socket', 'No communication with the vehicle, no current limitation.']],
  ports: { power: '1P+N or 3P+N AC input.', comm: 'Ethernet/4G (OCPP), possibly Modbus.', ctrl: 'Depending on the charger: enable/power-reduction input.' },
  accessories: ['Type A RCD + 6 mA DC detection, or type B (depending on charger and regulations).', 'Dedicated circuit breaker.'],
  compat: ['OCPP version and smart charging support.', 'Whether the EMS has a CSMS/OCPP server.'],
  params: [
    { n: 'Power', m: '', i: 'Strong impact on the power balance.', h: '', e: '7.4 kW 1P 32 A.', c: '' },
    { n: 'Protocol', m: '', i: 'Current limitation from the EMS.', h: '', e: 'OCPP 1.6J (assumed).', c: 'SetChargingProfile supported?' }
  ],
  example: { ok: { t: 'OCPP EVSE + EMS with a CSMS', d: 'The EMS limits to 16 A when the load rises.' }, ko: { t: 'EVSE without communication', d: 'Can only be cut off completely by a contactor → the vehicle may report a fault.' } }
},
spd: {
  name: 'AC surge protective device', group: 'Switching & protection',
  func: 'Limits transient overvoltages on the AC busbar.',
  principle: 'Varistors/spark gaps divert surge current to PE.',
  notdo: 'Does not protect against sustained overvoltage (400 V on a phase), does not replace earthing.',
  confusions: [['Overvoltage relay', 'A 59 relay detects sustained overvoltage and orders a trip.']],
  ports: { power: 'L1-L2-L3-N + PE.', ctrl: 'Failure signalling contact.' },
  accessories: ['Backup protection (MCB/fuse) per the manufacturer.', 'Short wiring to PE.'],
  compat: ['Uc suited to the earthing system.', 'Up < equipment impulse withstand.'],
  params: [{ n: 'Type', m: '', i: '', h: 'Lightning risk assessment.', e: 'Type 2.', c: '' }],
  example: { ok: { t: 'Type 2 SPD with signalling contact', d: 'The PLC reports when replacement is needed.' }, ko: { t: 'SPD without backup protection', d: 'If it fails short-circuited, nothing trips.' } }
},
psu: {
  name: '24 VDC power supply', group: 'Auxiliaries',
  func: 'Supplies control power to the PLC, I/O, relays, switch, HMI and sensors.',
  principle: 'Switched-mode supply with current limiting; a DC-OK contact reports normal output voltage.',
  notdo: 'Does not ride through AC loss (hold-up time only a few tens of ms) → a UPS is needed if control must survive grid loss.',
  confusions: [['UPS', 'A UPS has stored energy.']],
  ports: { power: '230 VAC input (L, N, PE).', aux: '+24 V / 0 V output.', ctrl: 'DC-OK contact.' },
  accessories: ['AC-side MCB.', '24 V distribution with per-branch protection.'],
  compat: ['Total load current ≤ ~80 % of rating (margin).', 'Inrush current of capacitive loads.', 'Enough current to trip the 24 V branch protection (or use electronic protection).'],
  params: [
    { n: 'Rated output current', m: '', i: '≥ total consumption / 0.8.', h: 'Add up each device’s consumption (table on the Selection page).', e: '10 A (240 W).', c: 'Derating with temperature.' },
    { n: 'DC-OK contact', m: '', i: 'Supply monitoring.', h: '', e: 'Yes (assumed).', c: '' }
  ],
  example: { ok: { t: '10 A PSU for a ≈ 4.5 A load', d: 'Load factor ≈ 45 %, with margin for expansion.' }, ko: { t: '2.5 A PSU', d: 'Total consumption > 2.5 A → voltage dip, the PLC reboots when many relays close.' } }
}
});
Object.assign(SG.I18D.en.types, {
dcups: {
  name: '24 VDC UPS', group: 'Auxiliaries',
  func: 'Keeps 24 VDC alive for the PLC, interface relay, switch and HMI during grid loss, to manage source transfer and log events.',
  principle: 'Module after the PSU; when the PSU output is lost it switches to battery/supercapacitor and reports its status to the PLC.',
  notdo: 'Does not supply power loads.',
  confusions: [['PCS', 'The PCS supplies AC loads; the DC-UPS only supplies control.']],
  ports: { aux: '24 V input from the PSU, buffered 24 V output, battery port.', ctrl: '“On battery” and “battery low” contacts.' },
  accessories: ['Suitable battery, battery fuse.'],
  compat: ['Output current ≥ buffered load.', 'Back-up time ≥ source transfer time + generator start + margin.'],
  params: [{ n: 'Back-up time', m: '', u: 'min', i: '', h: 'Buffered load × time.', e: '30 min at 4 A (assumed).', c: '' }],
  example: { ok: { t: '10 A DC-UPS + 7 Ah battery', d: 'Keeps control alive during grid loss and generator start.' }, ko: { t: 'No UPS, PLC supplied from the grid', d: 'Grid loss → PLC off → nobody closes KM-GEN, no event log.' } }
},
dcdist: {
  name: '24 VDC distribution & protection', group: 'Auxiliaries',
  func: 'Splits 24 V into individually protected branches: PLC, I/O, relay coils, communication, field devices.',
  principle: 'Per-channel electronic protection detects overcurrent even when the PSU limits its current (a standard MCB might not trip).',
  notdo: '—',
  ports: { aux: '24 V input, 24 V branch outputs; common 0 V.', ctrl: 'Channel fault contact.' },
  accessories: ['0 V/24 V terminal blocks.'],
  compat: ['Total branch current.', 'Trip characteristic suited to the PSU current.'],
  params: [{ n: 'Number of channels', m: '', u: 'channels', i: '', h: 'Load groups.', e: '4–8 channels.', c: '' }],
  example: { ok: { t: 'Separate branch for relay coils', d: 'A short circuit on field wiring does not bring down the PLC.' }, ko: { t: 'One common fuse', d: 'A single sensor fault removes all control.' } }
},
plc: {
  name: 'Programmable logic controller (CPU)', group: 'Control',
  func: 'Runs the control logic: interlocks, start-up/source-transfer sequences, load shedding, alarm handling, data exchange with devices, HMI and EMS.',
  principle: 'Scan cycle: read I/O → run the program (IEC 61131-3: LD, ST, FBD…) → write outputs. Acts as Modbus client (reading devices) and possibly as server (for the HMI/EMS to read).',
  notdo: 'Does not replace electrical protection (overcurrent, interface protection). A standard PLC is not a safety device (emergency stop must go through a safety relay or a certified safety PLC).',
  confusions: [['RTU', 'Collects & transmits to a remote centre (IEC 104/DNP3), little logic.'], ['IED', 'Intelligent electronic device in a substation, usually a protection relay.'], ['HMI', 'Operator screen; does not run the main control logic.'], ['SCADA/EMS', 'Higher-level supervision and optimisation software; issues setpoints, the PLC executes.']],
  ports: { aux: '24 VDC.', ctrl: 'Internal bus to the I/O modules.', comm: 'Ethernet (1–2 RJ45 ports), possibly a built-in RS485 serial port.' },
  accessories: ['I/O modules, communication modules.', 'Programming software.', 'RTC battery/memory card.'],
  compat: ['Maximum number of expansion modules.', 'Number of simultaneous Modbus TCP client/server connections.', 'Whether RS485 is built in.', 'Support for the required protocols (Modbus; MQTT and OCPP are usually NOT in the PLC → handled by the EMS).'],
  params: [
    { n: 'Ethernet ports', m: 'Number of ports, built-in switch, protocols.', u: 'ports', i: 'Number of directly connected devices.', h: 'Datasheet.', e: '1 port → a switch is needed.', c: 'Maximum number of TCP connections.' },
    { n: 'Serial ports', m: 'Built-in RS485/module.', u: 'ports', i: 'Reading Modbus RTU devices.', h: 'Datasheet.', e: 'Not built in → RS485 module.', c: '' },
    { n: 'I/O expansion capacity', m: '', u: 'modules', i: 'Per the I/O list + 20 % spare.', h: 'I/O list.', e: 'See the I/O list page.', c: '' },
    { n: 'Supply and consumption', m: '', i: '24 V PSU.', h: 'Datasheet.', e: '≈ 10 W (assumed).', c: '' }
  ],
  example: { ok: { t: 'PLC with 1 Ethernet port + RS485 module + 8-port switch', d: 'Reads the PCC meter/inverter/PCS/drive via Modbus TCP, and the generator and feeder meters via Modbus RTU.' }, ko: { t: 'PLC performing the emergency stop with one DI and one DO', d: 'Does not meet safety requirements; a single stuck DO would fail to stop the motor.' } },
  brands: 'Examples for reference: Schneider Modicon M221/M241/M251, Siemens S7-1200, Wago, Phoenix Contact PLCnext… — check the datasheet.'
},
dimod: {
  name: 'Digital input module', group: 'Control',
  func: 'Reads ON/OFF states: breaker/contactor auxiliary contacts, push buttons, fault signals.',
  principle: '24 VDC sink inputs (read +24 V, for PNP sensors) or source inputs; with input filtering.',
  notdo: 'Does not read continuous values.', confusions: [['AI', 'An AI reads continuous values.']],
  ports: { ctrl: 'Input terminals + common (COM).', aux: '24 V supply for the inputs.' },
  accessories: ['Terminal blocks, labels.'], compat: ['{{pnp|PNP/NPN}} type.', '24 VDC voltage.', 'Number of channels + spare.'],
  params: [{ n: 'Number of channels', m: '', u: 'channels', i: '', h: 'I/O list.', e: '16 channels/module.', c: '' }, { n: 'Logic', m: '', u: 'sink/source', i: 'Match the devices.', h: '', e: 'Sink (for PNP).', c: '' }],
  example: { ok: { t: '16-channel sink DI, 24 VDC', d: 'Reads auxiliary (dry) contacts supplied with +24 V.' }, ko: { t: 'NPN sensor on a sink input', d: 'The state cannot be read.' } }
},
domod: {
  name: 'Digital output module', group: 'Control',
  func: 'Outputs ON/OFF commands: interface relays, drive run command, indicator lamps.',
  principle: '24 VDC 0.5 A PNP transistor outputs (fast, long life) or relay outputs (switch a few A AC/DC, slower).',
  notdo: 'Transistors cannot switch AC loads and lack current for large contactor coils.', confusions: [['Interface relay', 'A KA sits after the DO to switch a larger circuit or a different voltage.']],
  ports: { ctrl: 'Output terminals + group supply.', aux: '24 V for the output group.' },
  accessories: ['Interface relays for 230 VAC loads.', 'Suppression diode/RC for inductive loads.'],
  compat: ['Output type (transistor/relay) versus load voltage.', 'Current per channel and total group current.'],
  params: [{ n: 'Number of channels', m: '', u: 'channels', i: '', h: 'I/O list.', e: '16 channels/module.', c: '' }, { n: 'Output type', m: '', i: 'Whether a KA is needed.', h: '', e: 'PNP transistor 0.5 A.', c: 'Total group current.' }],
  example: { ok: { t: 'Transistor DO → KA (24 VDC coil, 20 mA)', d: 'The KA switches the 230 VAC contactor coil.' }, ko: { t: 'Transistor DO wired directly to a 230 VAC contactor coil', d: 'Transistors are for DC only — incompatible.' } }
},
aimod: {
  name: 'Analogue I/O module', group: 'Control',
  func: 'Reads 4–20 mA/0–10 V/RTD sensors and outputs a speed reference signal.',
  principle: 'ADC/DAC with 12–16 bit resolution; each channel is configured for its signal type.',
  notdo: '—',
  ports: { ctrl: 'AI, AO and analogue common terminals.', aux: '24 V (loop supply for 2-wire sensors if any).' },
  accessories: ['Shielded cable, shield earthed at one end.'], compat: ['Signal type of each channel.', 'Loop supply for 2-wire 4–20 mA.', 'RTDs need dedicated RTD channels.'],
  params: [{ n: 'Number of AI/AO channels', m: '', u: 'channels', i: '', h: 'I/O list.', e: '4 AI + 2 AO.', c: '' }, { n: 'Signal type', m: '', i: '', h: '', e: '4–20 mA, 0–10 V, Pt100.', c: '' }],
  example: { ok: { t: '4–20 mA AI for a 2-wire irradiance sensor', d: 'The module supplies the loop, or a 24 V supply is wired in series.' }, ko: { t: 'Channel configured 0–10 V for a 4–20 mA sensor', d: 'Readings are completely wrong.' } }
},
commmod: {
  name: 'RS485 communication module', group: 'Communication',
  func: 'Lets the PLC act as Modbus RTU master on an RS485 bus.',
  principle: 'Isolated RS485 transceiver; the PLC sends requests to each slave in turn.',
  notdo: 'Does not convert to Ethernet for other devices.', confusions: [['Gateway', 'A gateway lets Ethernet devices read the RS485 bus.']],
  ports: { comm: 'D+ / D− / common 0V (terminals or RJ45/SUB-D depending on the manufacturer).' },
  accessories: ['120 Ω termination and biasing resistors.', 'Shielded twisted-pair cable.'], compat: ['Connector pinout.', 'Isolation.', '2-wire mode.'],
  params: [{ n: 'Supported baud rates', m: '', u: 'baud', i: '', h: '', e: '9600–115200.', c: '' }],
  example: { ok: { t: 'Isolated RS485 module + 3 slaves', d: 'Bus 19200 8E1, addresses 1, 11, 12.' }, ko: { t: 'Two RJ45 connectors with different pinouts', d: 'D+/D− swapped or on the wrong pins → no response.' } }
},
relayint: {
  name: 'Interface relay', group: 'Control',
  func: 'Isolates and amplifies: a PLC 24 VDC DO switches a 230 VAC circuit (contactor coil), or provides a dry contact to a device on another supply (generator).',
  principle: '24 VDC coil + contacts rated 230 VAC / a few A; with LED and diode.',
  notdo: 'Does not measure or protect; not a safety relay.', confusions: [['Protection relay', 'A protection relay measures and decides to trip by itself.'], ['Safety relay', 'A safety relay self-monitors and is PL/SIL certified.']],
  ports: { ctrl: 'Coil A1-A2 (from the DO), contact 11-14 (to the device).' },
  accessories: ['Socket.'], compat: ['Contact current ≥ contactor coil inrush current.', '24 VDC coil suited to the DO.'],
  params: [{ n: 'Contact rating', m: '', u: 'A @ V', i: '', h: '', e: '6 A 250 VAC (common, to be checked).', c: '' }],
  example: { ok: { t: 'KA for KM-PCC, KM-GEN, KM-RL', d: 'Each 230 VAC contactor through one KA.' }, ko: { t: 'Using a KA for emergency stop', d: 'No fault monitoring — use a safety relay.' } }
},
safetyrelay: {
  name: 'Safety relay', group: 'Safety',
  func: 'Performs the emergency stop function: monitors a dual-channel E-stop, cuts KM-M1 and the drive STO, allows restart only after a deliberate reset.',
  principle: 'Redundant channels + self-test; cross-fault detection; force-guided contacts.',
  notdo: 'Does not monitor the grid, does not replace electrical protection.', confusions: [['Protection relay', 'Protects the electrical system.'], ['Interface relay', 'No self-test.']],
  ports: { ctrl: 'Inputs S11-S12/S21-S22 from the E-stop, reset button, safety outputs 13-14/23-24, status output to the PLC.', aux: '24 VDC.' },
  accessories: ['Emergency stop button with two NC contacts.', 'Reset button.'], compat: ['PL/SIL meets the risk assessment.', 'Safety contact current suits the KM-M1 coil.'],
  params: [{ n: 'Safety level', m: '', u: 'PL / SIL', i: '', h: 'Risk assessment (ISO 12100, ISO 13849-1).', e: 'Assessment required.', c: '' }],
  example: { ok: { t: 'Dual-channel E-stop → KS → KM-M1 + STO', d: 'Stop category 0/1 per IEC 60204-1 (assessment required).' }, ko: { t: 'E-stop wired only to a PLC DI', d: 'A software fault/stuck output → cannot stop.' } }
},
estop: {
  name: 'Emergency stop button', group: 'Safety',
  func: 'Lets the operator stop a hazard immediately.', principle: 'Positively opened NC contacts, latching, released by twist/pull.',
  notdo: 'Does not cut power to the whole system (unless designed to); does not replace isolation.', confusions: [['Stop button', 'A stop button is a normal operational stop.']],
  ports: { ctrl: '2 NC contacts to the safety relay.' }, accessories: ['Yellow background ring.'], compat: ['IEC 60947-5-5, ISO 13850.'],
  params: [{ n: 'Number of NC contacts', m: '', i: '', h: '', e: '2 NC.', c: '' }],
  example: { ok: { t: 'Buttons on the cabinet door and near the motor', d: 'Wired in series on both channels.' }, ko: { t: 'NO button', d: 'A broken wire goes undetected.' } }
},
opanel: {
  name: 'Panel front: push buttons, lamps, selectors', group: 'Control',
  func: 'Local control in Local mode, Auto/Manual and Local/Remote selection, indicator lamps.',
  principle: 'Contacts to DIs, lamps from DOs.', notdo: '—', confusions: [['HMI', 'The HMI is a screen; hard-wired buttons still work if the HMI fails.']],
  ports: { ctrl: '24 VDC contacts and lamps.' }, accessories: ['Labels.'], compat: ['24 VDC LED lamps; current < DO capacity.'],
  params: [{ n: 'List', m: '', i: '', h: '', e: 'A/M selector, L/R selector, M1 Start/Stop, Reset, 3 lamps.', c: '' }],
  example: { ok: { t: 'NC Stop button', d: 'Broken wire = stop (fail-safe).' }, ko: { t: 'NO Stop', d: 'Broken wire → the Stop button has no effect.' } }
},
switch: {
  name: 'Industrial Ethernet switch', group: 'Communication',
  func: 'Connects the PLC, HMI, EMS, meters, inverter, PCS, drive… in a star.',
  principle: 'Forwards Ethernet frames by MAC address. Does not process application protocols.',
  notdo: 'Does not convert Modbus RTU to TCP; does not make two devices “understand” each other.', confusions: [['Gateway', 'A gateway converts protocols.'], ['Router', 'A router connects two different IP networks.']],
  ports: { comm: 'N RJ45 ports (10/100), possibly fibre ports.', aux: '24 VDC (possibly two redundant inputs).' },
  accessories: ['Shielded Cat5e/6 cable for industrial environments.'], compat: ['Number of ports ≥ devices + spare.', 'Managed if VLANs/network segregation are needed.', '24 V supply.'],
  params: [{ n: 'Number of ports', m: '', u: 'ports', i: '', h: 'Count the Ethernet devices (Selection page).', e: '8 ports.', c: '' }, { n: 'Managed / unmanaged', m: '', i: '', h: '', e: 'Unmanaged is enough for a first version.', c: 'When connecting to the corporate network → segregate with a firewall.' }],
  example: { ok: { t: '8-port 24 VDC DIN switch', d: '7 devices + 1 spare — tight; consider 16 ports.' }, ko: { t: 'Office switch on 230 VAC', d: 'Grid loss → network lost even though the PLC is on UPS.' } }
},
gateway: {
  name: 'Modbus TCP ↔ RTU gateway', group: 'Communication',
  func: 'Lets an Ethernet client (EMS, PLC) read RS485 devices.',
  principle: 'Receives a Modbus TCP request, converts it to an RTU frame with address = Unit ID, and returns the reply.',
  notdo: 'Does not change the register map; does not make the RS485 bus faster.', confusions: [['Switch', 'A switch does not convert protocols.']],
  ports: { comm: 'RJ45 Ethernet + RS485.', aux: '24 VDC.' }, compat: ['Client timeout > bus polling cycle time.', 'Only one master on the RS485 bus.'],
  params: [{ n: 'Mode', m: '', i: '', h: '', e: 'Transparent TCP→RTU.', c: '' }],
  example: { ok: { t: 'EMS reads feeder meters via the gateway', d: 'When the PLC has no RS485 port.' }, ko: { t: 'PLC RS485 module and gateway both acting as master on one bus', d: 'Two masters → frame collisions.' } }
},
hmi: {
  name: 'HMI panel', group: 'Supervision',
  func: 'Displays the diagram, values and alarms; sends operating commands to the PLC.',
  principle: 'Reads/writes PLC variables (tags) over Ethernet; runs no control logic.', notdo: 'Does not replace the emergency stop; does not control field devices directly.',
  confusions: [['SCADA', 'SCADA is system-wide software with many screens and long-term history.']],
  ports: { comm: 'Ethernet.', aux: '24 VDC.' }, compat: ['Communication driver for the PLC (Modbus TCP or manufacturer protocol).'],
  params: [{ n: 'Size', m: '', i: '', h: '', e: '7–10 inch.', c: '' }],
  example: { ok: { t: 'HMI on the cabinet door, Modbus TCP to the PLC', d: '' }, ko: { t: 'HMI writing directly to drive registers', d: 'Bypasses the PLC’s condition checks.' } }
},
ems: {
  name: 'SCADA / EMS (PC)', group: 'Supervision',
  func: 'History, reports, energy-flow optimisation (battery setpoint, PV limit, EV schedule), cloud gateway (MQTT), OCPP server.',
  principle: 'Reads data from the PLC (and possibly directly from devices); writes setpoints to the PLC; the PLC checks limits before passing them on.',
  notdo: 'Does not perform safety interlocks; losing the PC must not make the system unsafe.', confusions: [['PLC', 'The PLC is real-time and close to the devices.'], ['DMS', 'The network operator’s DMS.']],
  ports: { comm: 'Ethernet.', aux: '230 VAC (priority loads) or 24 V (IPC).' }, accessories: ['SCADA/EMS software, database.'], compat: ['Modbus TCP, OCPP, MQTT drivers.'],
  params: [{ n: 'Software', m: '', i: '', h: '', e: 'SCADA + rule-based EMS.', c: '' }],
  example: { ok: { t: 'EMS writes P_bat_set to the PLC', d: 'The PLC limits it to ±5 kW and by SOC.' }, ko: { t: 'EMS writing directly to the PCS while the PLC is controlling it', d: 'Two sources of commands → conflict.' } }
},
pyrano: {
  name: 'Irradiance sensor', group: 'Measurement',
  func: 'Measures irradiance to assess PV performance.', principle: '4–20 mA output proportional to W/m².',
  ports: { meas: '2-wire 4–20 mA loop.' }, compat: ['4–20 mA AI.'],
  params: [{ n: 'Measuring range', m: '', i: '', h: '', e: '0–1500 W/m² ↔ 4–20 mA.', c: '' }],
  example: { ok: { t: '2-wire 4–20 mA sensor', d: '' }, ko: { t: 'Modbus output', d: 'Needs an RS485 port.' } }
},
lora: {
  name: 'LoRaWAN gateway + sensors', group: 'Communication',
  func: 'Battery-powered wireless sensors (room temperature/humidity, cabinet temperature) for monitoring.',
  principle: 'Sensors send small packets every few minutes; the network server decodes them and pushes MQTT to the EMS.',
  notdo: 'Not for control or protection.', confusions: [['Wi-Fi', 'High bandwidth, high power.']],
  ports: { comm: 'Antenna, Ethernet.' }, accessories: ['Network server (LNS).'], compat: ['Regional frequency band (EU868, AS923…).'],
  params: [{ n: 'Frequency band', m: '', i: '', h: 'Regional regulations.', e: 'EU868 (France) — to be checked.', c: '' }],
  example: { ok: { t: 'Room temperature every 5 minutes', d: '' }, ko: { t: 'Load-shedding command over LoRaWAN', d: 'Latency and duty cycle are not guaranteed.' } }
},
cabinet: {
  name: 'Enclosure, DIN rail, trunking, ventilation, terminals, PE', group: 'Switchboard',
  func: 'Houses and protects equipment; separates power/control/communication zones; dissipates heat.',
  principle: 'Per IEC 61439 (assemblies) and installation guides; keep low-level signals away from power cables.',
  compat: ['Heat losses ≤ dissipation capacity.', 'IP rating per environment.'],
  params: [{ n: 'Heat losses', m: '', i: 'Fan/filter.', h: 'Sum of losses.', e: 'Drive + PSU + relays ≈ 150 W (estimate).', c: '' }],
  example: { ok: { t: 'Separate control cabinet', d: 'Reduces interference.' }, ko: { t: 'RS485 cable in the same trunking as the drive motor cable', d: 'Interference causes communication errors.' } }
}
});
