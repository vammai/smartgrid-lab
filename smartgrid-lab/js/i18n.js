/* HỆ THỐNG ĐA NGÔN NGỮ VI / EN / FR
   - Chuỗi giao diện: SG.t('khóa', {biến}) → bộ dịch SG.I18N.vi / .en / .fr (i18n/vi.js, en.js, fr.js).
   - Dữ liệu mô tả: tiếng Việt là bản gốc trong data/*.js; bản EN/FR là lớp phủ theo mã (SG.I18D.en / .fr,
     i18n/en.data.js, fr.data.js). Mã thiết bị, model, giao thức, ký hiệu không bao giờ được dịch.
   - Khóa thiếu được ghi vào SG.i18nMiss để kiểm tra; khi thiếu sẽ hiển thị bản tiếng Việt. */
window.SG = window.SG || {};
SG.LANGS = { vi: { n: 'Tiếng Việt', s: 'VI', loc: 'vi-VN' }, en: { n: 'English', s: 'EN', loc: 'en-GB' }, fr: { n: 'Français', s: 'FR', loc: 'fr-FR' } };
SG.I18N = SG.I18N || { vi: {}, en: {}, fr: {} };
SG.I18D = SG.I18D || { en: {}, fr: {} };
SG.i18nMiss = new Set();
SG.lang = (function () { try { const v = JSON.parse(localStorage.getItem('sglab.lang')); return SG.LANGS[v] ? v : 'vi'; } catch (e) { return 'vi'; } })();
SG.bilingual = (function () { try { return JSON.parse(localStorage.getItem('sglab.bilingual')) || 'off'; } catch (e) { return 'off'; } })();
SG.t = function (k, v) {
  let s = SG.I18N[SG.lang] && SG.I18N[SG.lang][k];
  if (s == null) { if (SG.lang !== 'vi') SG.i18nMiss.add(SG.lang + ':' + k); s = SG.I18N.vi[k]; if (s == null) { SG.i18nMiss.add('vi:' + k); s = k; } }
  if (typeof s === 'function') return s(v || {});
  return v ? String(s).replace(/\{(\w+)\}/g, (m, x) => v[x] != null ? v[x] : m) : s;
};
/* đơn vị điện áp theo ngôn ngữ: FR viết « V CA / V CC » */
SG.volt = s => SG.lang === 'fr' ? String(s).replace(/ ?VAC/g, ' V CA').replace(/ ?VDC/g, ' V CC') : s;
SG.loc = () => SG.LANGS[SG.lang].loc;
SG.num = (n, d) => (n == null || isNaN(n)) ? '—' : (+n).toLocaleString(SG.loc(), d == null ? { maximumFractionDigits: 2 } : { minimumFractionDigits: d, maximumFractionDigits: d });

/* sao chép sâu giữ nguyên hàm/RegExp */
SG.clone = function c(o) {
  if (Array.isArray(o)) return o.map(c);
  if (o && typeof o === 'object' && !(o instanceof RegExp)) { const r = {}; for (const k in o) r[k] = c(o[k]); return r; }
  return o;
};
/* ghép lớp phủ: đối tượng ghép theo khóa; mảng chuỗi/mảng con thay theo chỉ số; null = giữ bản gốc */
SG.merge = function m(base, ov) {
  if (ov == null) return base;
  if (Array.isArray(ov)) { if (!Array.isArray(base)) return ov; return base.map((b, i) => i < ov.length && ov[i] != null ? (typeof ov[i] === 'object' && typeof b === 'object' && b ? m(b, ov[i]) : ov[i]) : b); }
  if (typeof ov === 'object' && base && typeof base === 'object' && !(base instanceof RegExp)) { const r = Array.isArray(base) ? base.slice() : Object.assign({}, base); for (const k in ov) r[k] = m(base[k], ov[k]); return r; }
  return ov;
};
SG.I18N_COLL = ['glossary', 'types', 'devices', 'links', 'commLayers', 'comms', 'traces', 'scenarios', 'compare', 'extensions', 'refs', 'products', 'CAB'];
SG.byId = { devices: 1, links: 1, commLayers: 1, comms: 1, traces: 1, scenarios: 1, products: 1 };
SG.snapI18n = function () { SG._i18nBase = {}; SG.I18N_COLL.forEach(k => { if (SG[k]) SG._i18nBase[k] = SG.clone(SG[k]); }); };
SG.applyI18n = function () {
  if (!SG._i18nBase) SG.snapI18n();
  const O = SG.lang === 'vi' ? {} : (SG.I18D[SG.lang] || {});
  SG.I18N_COLL.forEach(k => {
    const base = SG._i18nBase[k]; if (!base) return;
    let v = SG.clone(base); const ov = O[k];
    if (ov) {
      if (SG.byId[k]) v = v.map(x => ov[x.id] ? SG.merge(x, ov[x.id]) : x);
      else if (Array.isArray(v)) v = v.map((x, i) => ov[i] ? SG.merge(x, ov[i]) : x);
      else Object.keys(ov).forEach(id => { if (v[id]) v[id] = SG.merge(v[id], ov[id]); });
    }
    SG[k] = v;
  });
};
/* thiếu lớp phủ dữ liệu (dùng khi kiểm tra) */
SG.i18nDataGaps = function (lang) {
  const O = SG.I18D[lang] || {}, gaps = [];
  const walk = (b, o, path) => {
    if (typeof b === 'string') { if (/[ạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹđĐăâêôơư]/i.test(b) && (o == null || typeof o !== 'string' && typeof o !== 'function')) gaps.push(path); return; }
    if (Array.isArray(b)) { b.forEach((x, i) => walk(x, o && o[i], path + '[' + i + ']')); return; }
    if (b && typeof b === 'object' && !(b instanceof RegExp)) Object.keys(b).forEach(k => { if (['id', 'url', 'x', 'y', 'w', 'h', 'd', 's', 'cond', 'slot', 'slots', 'lb', 't', 'layer', 'lane', 'sig', 'k', 'u', 'fr'].includes(k) && path.split('.').length > 1 && typeof b[k] !== 'object') return; walk(b[k], o && o[k], path + '.' + k); });
  };
  SG.I18N_COLL.forEach(k => {
    const base = SG._i18nBase[k]; if (!base) return;
    if (SG.byId[k]) base.forEach(x => walk(x, (O[k] || {})[x.id], k + '.' + x.id));
    else if (Array.isArray(base)) base.forEach((x, i) => walk(x, (O[k] || {})[i], k + '[' + i + ']'));
    else Object.keys(base).forEach(id => walk(base[id], (O[k] || {})[id], k + '.' + id));
  });
  return gaps;
};
/* tên thuật ngữ theo ngôn ngữ (cho chế độ song ngữ) */
SG.termName = function (id, lang) {
  const g = SG._i18nBase && SG._i18nBase.glossary && SG._i18nBase.glossary[id]; if (!g) return '';
  if (lang === 'vi') return g.vi;
  const o = SG.I18D[lang] && SG.I18D[lang].glossary && SG.I18D[lang].glossary[id];
  return (o && o.vi) || (lang === 'fr' ? g.fr : g.vi);
};
SG.setLang = function (l) {
  if (!SG.LANGS[l]) return; SG.lang = l;
  try { localStorage.setItem('sglab.lang', JSON.stringify(l)); } catch (e) { /* bỏ qua */ }
  document.documentElement.lang = l;
  SG.applyI18n();
  if (SG.afterLang) SG.afterLang();
};
