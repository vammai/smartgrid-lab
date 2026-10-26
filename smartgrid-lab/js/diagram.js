/* SƠ ĐỒ TƯƠNG TÁC — SVG thuần, dùng chung cho trang Sơ đồ, Kịch bản, Truyền thông, HMI. */
SG.LAYERS = {
  ac: { w: 3.2, dash: '', arrow: false },
  dc: { w: 3.2, dash: '11 4', arrow: false },
  aux: { w: 2, dash: '6 3', arrow: false },
  di: { w: 1.5, dash: '', arrow: true },
  ai: { w: 1.6, dash: '2 3', arrow: true },
  eth: { w: 2.4, dash: '', arrow: false },
  rs485: { w: 2, dash: '9 3 2 3', arrow: false },
  can: { w: 2, dash: '4 2', arrow: false },
  wl: { w: 1.8, dash: '1 5', arrow: false }
};
SG.VIEWS = {
  power: { on: ['ac', 'dc'], ghost: ['aux'] },
  meas: { on: ['ai', 'eth', 'rs485', 'can', 'wl'], ghost: ['ac', 'dc'] },
  ctrl: { on: ['di', 'ai', 'aux'], ghost: ['ac', 'dc'] },
  comm: { on: ['eth', 'rs485', 'can', 'wl'], ghost: ['ac', 'dc'] },
  all: { on: ['ac', 'dc', 'aux', 'di', 'ai', 'eth', 'rs485', 'can', 'wl'], ghost: [] }
};
SG.CANVAS = { w: 1720, h: 1270 };

SG.activeModel = function (c) {
  const on = d => !d.cond || SG.conds[d.cond](c);
  const devs = SG.devices.filter(d => !d.nodiag && on(d));
  const ids = new Set(devs.map(d => d.id));
  const links = SG.links.concat(SG.rs485Links(c)).filter(l => on(l) && ids.has(l.a.d) && ids.has(l.b.d));
  return { devs, links, ids };
};

SG.Diagram = function (el, opt) {
  opt = Object.assign({ view: 'all', layers: null, onSelect: null, compact: false }, opt || {});
  const self = this;
  this.el = el; this.opt = opt;
  this.vb = { x: 0, y: 0, w: SG.CANVAS.w, h: SG.CANVAS.h };
  this.hl = null; this.values = {}; this.states = {}; this.sel = null;

  const NS = 'http://www.w3.org/2000/svg';
  const dirOf = { t: [0, -1], b: [0, 1], l: [-1, 0], r: [1, 0] };

  this.build = function (c) {
    self.c = c;
    const m = SG.activeModel(c);
    self.devs = m.devs; self.links = m.links;
    self.node = {};
    m.devs.forEach(d => { self.node[d.id] = { d, x: d.x, y: d.y, w: d.w || 120, h: d.h || 40 }; });
    // endpoints grouped by device+side
    const groups = {};
    self.links.forEach(l => ['a', 'b'].forEach(k => {
      const e = l[k]; if (e.d === 'BUS') return;
      const key = e.d + '|' + e.s; (groups[key] = groups[key] || []).push({ l, k });
    }));
    const other = (l, k) => self.node[l[k === 'a' ? 'b' : 'a'].d];
    self.pt = {};
    Object.keys(groups).forEach(key => {
      const [id, side] = key.split('|'); const n = self.node[id]; const arr = groups[key];
      const vert = side === 't' || side === 'b';
      arr.sort((p, q) => { const o1 = other(p.l, p.k), o2 = other(q.l, q.k); return vert ? (o1.x - o2.x) : (o1.y - o2.y); });
      const span = (vert ? n.w : n.h) * 0.8, N = arr.length;
      arr.forEach((it, i) => {
        const off = N === 1 ? 0 : -span / 2 + (i + 0.5) * span / N;
        const [dx, dy] = dirOf[side];
        const x = vert ? n.x + off : n.x + dx * n.w / 2, y = vert ? n.y + dy * n.h / 2 : n.y + off;
        self.pt[it.l.id + it.k] = { x, y, s: side };
      });
    });
    self.links.forEach(l => ['a', 'b'].forEach(k => { const e = l[k]; if (e.d === 'BUS') { const n = self.node.BUS; self.pt[l.id + k] = { x: e.x, y: n.y + (e.s === 't' ? -n.h / 2 : n.h / 2), s: e.s }; } }));
    // risers per column (horizontal sides)
    const risers = {};
    self.links.filter(l => l.lane).forEach(l => ['a', 'b'].forEach(k => {
      const p = self.pt[l.id + k]; if (p.s === 'l' || p.s === 'r') { const key = p.s + Math.round(p.x); (risers[key] = risers[key] || []).push({ l, k, y: p.y }); }
    }));
    self.riserX = {};
    Object.values(risers).forEach(arr => { arr.sort((a, b) => a.y - b.y); const N = arr.length; arr.forEach((it, i) => { const p = self.pt[it.l.id + it.k]; const k = N - 1 - i; self.riserX[it.l.id + it.k] = p.x + (p.s === 'r' ? 1 : -1) * (9 + k * 4.5); }); });
    // lanes
    const order = ['ai', 'di', 'aux', 'eth', 'rs485', 'can', 'wl'];
    const laneLinks = self.links.filter(l => l.lane).sort((p, q) => (order.indexOf(p.layer) - order.indexOf(q.layer)) || (self.pt[p.id + 'a'].x - self.pt[q.id + 'a'].x));
    const top = 848, bot = 1036, step = Math.min(6, (bot - top) / Math.max(1, laneLinks.length));
    self.lane = {}; laneLinks.forEach((l, i) => { self.lane[l.id] = top + i * step; });
    // paths
    self.path = {};
    self.links.forEach(l => { self.path[l.id] = route(l); });
  };

  function route(l) {
    const A = self.pt[l.id + 'a'], B = self.pt[l.id + 'b'];
    const vA = A.s === 't' || A.s === 'b', vB = B.s === 't' || B.s === 'b';
    const P = [[A.x, A.y]];
    if (l.lane) {
      const ly = self.lane[l.id];
      if (vA) P.push([A.x, ly]); else { const rx = self.riserX[l.id + 'a']; P.push([rx, A.y], [rx, ly]); }
      if (vB) P.push([B.x, ly], [B.x, B.y]); else { const rx = self.riserX[l.id + 'b']; P.push([rx, ly], [rx, B.y], [B.x, B.y]); }
      return P;
    }
    if (vA && vB) {
      if (Math.abs(A.x - B.x) < 1) { P.push([B.x, B.y]); return P; }
      const my = (A.y + B.y) / 2; P.push([A.x, my], [B.x, my], [B.x, B.y]); return P;
    }
    if (!vA && !vB) {
      if (A.s !== B.s) { const mx = (A.x + B.x) / 2; P.push([mx, A.y], [mx, B.y], [B.x, B.y]); return P; }
      const x = A.s === 'l' ? Math.min(A.x, B.x) - 16 : Math.max(A.x, B.x) + 16; P.push([x, A.y], [x, B.y], [B.x, B.y]); return P;
    }
    if (vA) { P.push([A.x, B.y], [B.x, B.y]); return P; }
    P.push([B.x, A.y], [B.x, B.y]); return P;
  }

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const trunc = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;
  const grpClass = d => SG.typeGroup(d.t);

  this.render = function () {
    const c = self.c; const v = SG.VIEWS[opt.view] || SG.VIEWS.all;
    const onL = opt.view === 'all' && opt.layers ? opt.layers : v.on;
    const ghost = opt.view === 'all' ? [] : v.ghost;
    let s = `<svg xmlns="${NS}" class="dg" viewBox="${self.vb.x} ${self.vb.y} ${self.vb.w} ${self.vb.h}" role="img" aria-label="${SG.esc(SG.t('dg.aria'))}">`;
    s += '<defs>' + Object.keys(SG.LAYERS).map(k => `<marker id="ar-${k}-${self.uid}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L8,4 L0,8 z" class="mk mk-${k}"/></marker>`).join('') + '</defs>';
    // zones
    s += `<g class="zones"><rect x="10" y="400" width="1700" height="430" class="zone"/><text x="20" y="420" class="zone-t">${SG.esc(SG.t('dg.zoneP'))}</text>`;
    s += `<rect x="10" y="836" width="1700" height="206" class="zone zone-lane"/><text x="20" y="852" class="zone-t">${SG.esc(SG.t('dg.zoneL'))}</text>`;
    s += `<rect x="10" y="1044" width="1700" height="216" class="zone zone-ctrl"/><text x="20" y="1262" class="zone-t">${SG.esc(SG.t('dg.zoneC'))}</text></g>`;
    // links
    const hl = self.hl;
    const vis = l => onL.includes(l.layer) ? 'on' : ghost.includes(l.layer) ? 'ghost' : null;
    s += '<g class="links">';
    self.links.forEach(l => {
      const st = vis(l); if (!st) return;
      const L = SG.LAYERS[l.layer];
      const d = 'M' + self.path[l.id].map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L');
      const dim = hl && !hl.has(l.id) ? ' dim' : '', hot = hl && hl.has(l.id) ? ' hot' : '', sel = self.sel === l.id ? ' sel' : '';
      const mk = L.arrow ? ` marker-end="url(#ar-${l.layer}-${self.uid})"` : '';
      s += `<g class="lk lk-${l.layer} ${st}${dim}${hot}${sel}" data-link="${l.id}"><path d="${d}" class="hit"/><path d="${d}" class="ln" stroke-width="${L.w}" stroke-dasharray="${L.dash}"${mk}/><title>${esc(SG.layerName(l.layer) + ': ' + l.label)}</title></g>`;
    });
    s += '</g>';
    // ports
    s += '<g class="ports">';
    self.links.forEach(l => { const st = vis(l); if (st !== 'on' || l.a.d === 'BUS' && l.b.d === 'BUS') return; ['a', 'b'].forEach(k => { if (l[k].d === 'BUS') return; const p = self.pt[l.id + k]; const dim = hl && !hl.has(l.id) ? ' dim' : ''; s += `<circle cx="${p.x}" cy="${p.y}" r="2.6" class="pt pt-${l.layer}${dim}" data-port="${l.id}|${k}"><title>${esc((l[k].p || SG.t('sheet.port')) + ' — ' + SG.layerName(l.layer))}</title></circle>`; }); });
    s += '</g>';
    // nodes
    s += '<g class="nodes">';
    self.devs.forEach(d => {
      const n = self.node[d.id];
      const dim = hl && !hl.has(d.id) ? ' dim' : '', hot = hl && hl.has(d.id) ? ' hot' : '', sel = self.sel === d.id ? ' sel' : '';
      if (d.id === 'BUS') {
        s += `<g class="nd bus${dim}${hot}${sel}" data-dev="BUS"><rect x="${n.x - n.w / 2}" y="${n.y - n.h / 2}" width="${n.w}" height="${n.h}" rx="2"/><text x="${n.x - n.w / 2 + 600}" y="${n.y - 9}" class="bus-t">${esc(SG.t('dg.bus', { U: c.U, ph: c.phases === 3 ? '3P+N' : '1P+N', f: c.f }))}</text><title>${esc(SG.dev('BUS').n)}</title></g>`;
        return;
      }
      const x = n.x - n.w / 2, y = n.y - n.h / 2;
      const st = self.states[d.id];
      s += `<g class="nd g-${grpClass(d)} lb${d.lb}${dim}${hot}${sel}${st ? ' st-' + st : ''}" data-dev="${d.id}" tabindex="0"><rect x="${x}" y="${y}" width="${n.w}" height="${n.h}" rx="5"/>`;
      s += `<text x="${x + 7}" y="${y + 15}" class="nd-id">${esc(d.id)}</text>`;
      if (n.h >= 38) s += `<text x="${x + 7}" y="${y + 30}" class="nd-n">${esc(trunc(d.n, Math.floor(n.w / 6.1)))}</text>`;
      else s += `<text x="${x + 7 + d.id.length * 7.4 + 4}" y="${y + 15}" class="nd-n">${esc(trunc(d.n, Math.floor((n.w - d.id.length * 7.4 - 14) / 6.1)))}</text>`;
      if (d.lb > 1) s += `<g class="lbadge"><rect x="${x + n.w - 17}" y="${y + 3}" width="14" height="13" rx="3"/><text x="${x + n.w - 10}" y="${y + 13}">${d.lb}</text></g>`;
      if (st) s += `<g class="stb"><rect x="${x + n.w - 17}" y="${y + n.h - 15}" width="14" height="12" rx="2"/><text x="${x + n.w - 10}" y="${y + n.h - 6}">${st === 'on' ? 'I' : st === 'trip' ? '!' : 'O'}</text></g>`;
      if (self.values[d.id]) s += `<g class="val"><rect x="${x + n.w + 4}" y="${n.y - 9}" width="${self.values[d.id].length * 6.4 + 10}" height="17" rx="8"/><text x="${x + n.w + 9}" y="${n.y + 3}">${esc(self.values[d.id])}</text></g>`;
      s += `<title>${esc(d.id + ' — ' + d.n + ((a => a ? ' (' + a.t + ')' : '')(SG.typeAltShown(d.t))))}</title></g>`;
    });
    s += '</g>';
    // labels for highlighted links
    if (hl) {
      s += '<g class="lk-labels">';
      self.links.forEach(l => {
        if (!hl.has(l.id) || !vis(l)) return;
        const P = self.path[l.id]; let best = 0, bi = 0;
        for (let i = 0; i < P.length - 1; i++) { const len = Math.abs(P[i + 1][0] - P[i][0]) + Math.abs(P[i + 1][1] - P[i][1]); if (len > best) { best = len; bi = i; } }
        const mx = (P[bi][0] + P[bi + 1][0]) / 2, my = (P[bi][1] + P[bi + 1][1]) / 2;
        const t = trunc(l.label, 46);
        s += `<g class="lkl"><rect x="${mx - t.length * 2.9 - 5}" y="${my - 8}" width="${t.length * 5.8 + 10}" height="15" rx="3"/><text x="${mx}" y="${my + 3}" text-anchor="middle">${esc(t)}</text></g>`;
      });
      s += '</g>';
    }
    s += '</svg>';
    self.el.innerHTML = s;
    self.svg = self.el.querySelector('svg');
    bind();
  };

  function bind() {
    const svg = self.svg;
    svg.addEventListener('click', e => {
      if (self.dragMoved) return;
      const port = e.target.closest('[data-port]'), lk = e.target.closest('[data-link]'), nd = e.target.closest('[data-dev]');
      if (port) { const [id, k] = port.dataset.port.split('|'); opt.onSelect && opt.onSelect({ kind: 'port', id, end: k }); }
      else if (nd) opt.onSelect && opt.onSelect({ kind: 'dev', id: nd.dataset.dev });
      else if (lk) opt.onSelect && opt.onSelect({ kind: 'link', id: lk.dataset.link });
      else opt.onSelect && opt.onSelect(null);
    });
    svg.addEventListener('keydown', e => { const nd = e.target.closest('[data-dev]'); if (nd && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); opt.onSelect && opt.onSelect({ kind: 'dev', id: nd.dataset.dev }); } });
    svg.addEventListener('wheel', e => {
      e.preventDefault();
      const r = svg.getBoundingClientRect();
      const px = self.vb.x + (e.clientX - r.left) / r.width * self.vb.w, py = self.vb.y + (e.clientY - r.top) / r.height * self.vb.h;
      self.zoomAt(e.deltaY < 0 ? 0.85 : 1.18, px, py);
    }, { passive: false });
    svg.addEventListener('pointerdown', e => { if (e.button !== 0) return; self.drag = { x: e.clientX, y: e.clientY, vb: Object.assign({}, self.vb) }; self.dragMoved = false; });
  }
  window.addEventListener('pointermove', e => {
    const drag = self.drag, svg = self.svg; if (!drag || !svg || !svg.isConnected) return; const r = svg.getBoundingClientRect();
    const dx = (e.clientX - drag.x) / r.width * drag.vb.w, dy = (e.clientY - drag.y) / r.height * drag.vb.h;
    if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 4) { self.dragMoved = true; svg.classList.add('panning'); }
    if (self.dragMoved) { self.vb.x = drag.vb.x - dx; self.vb.y = drag.vb.y - dy; applyVB(); }
  });
  window.addEventListener('pointerup', () => { if (self.drag) { self.drag = null; if (self.svg) self.svg.classList.remove('panning'); setTimeout(() => { self.dragMoved = false; }, 0); } });
  function applyVB() { if (self.svg) self.svg.setAttribute('viewBox', `${self.vb.x} ${self.vb.y} ${self.vb.w} ${self.vb.h}`); }
  this.zoomAt = function (f, px, py) {
    const nw = Math.max(250, Math.min(SG.CANVAS.w * 1.6, self.vb.w * f)); const k = nw / self.vb.w;
    if (px == null) { px = self.vb.x + self.vb.w / 2; py = self.vb.y + self.vb.h / 2; }
    self.vb = { x: px - (px - self.vb.x) * k, y: py - (py - self.vb.y) * k, w: nw, h: self.vb.h * k }; applyVB();
  };
  this.fit = function () { self.vb = { x: 0, y: 0, w: SG.CANVAS.w, h: SG.CANVAS.h }; applyVB(); };
  this.focus = function (ids) {
    const ns = ids.map(i => self.node[i]).filter(Boolean); if (!ns.length) return;
    let x0 = Math.min(...ns.map(n => n.x - n.w / 2)) - 80, x1 = Math.max(...ns.map(n => n.x + n.w / 2)) + 80, y0 = Math.min(...ns.map(n => n.y - n.h / 2)) - 80, y1 = Math.max(...ns.map(n => n.y + n.h / 2)) + 80;
    const ar = SG.CANVAS.h / SG.CANVAS.w; let w = Math.max(x1 - x0, 500), h = Math.max(y1 - y0, w * ar); w = Math.max(w, h / ar);
    self.vb = { x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w, h }; applyVB();
  };
  this.related = function (id) {
    const set = new Set([id]);
    self.links.forEach(l => { if (l.a.d === id || l.b.d === id) { set.add(l.id); set.add(l.a.d); set.add(l.b.d); } });
    return set;
  };
  this.setView = function (v, layers) { opt.view = v; opt.layers = layers || null; self.render(); };
  this.setHighlight = function (set, sel) { self.hl = set && set.size ? set : null; self.sel = sel || null; self.render(); };
  this.uid = Math.random().toString(36).slice(2, 7);
};
