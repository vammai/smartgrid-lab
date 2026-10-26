/* Chạy trong trang kiểm tra: duyệt mọi màn hình ở VI/EN/FR. */
(function () {
  const VI = /[ạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹđĐăươ]/;
  const out = { errors: [], vi: {}, foreign: {}, miss: [], gaps: {}, overflow: {}, n: 0, samples: {} };
  const SAMPLE = ['dev:QF0:C', 'dev:KM-PCC:B', 'scen:gridloss:4', 'scen:genstart:4', 'sel:pairs', 'hmi-run', 'comm:mbrtu', 'trace:CMD_SHED', 'page:glossary', 'page:bom', 'bilingual', 'io:io'];
  const textNoVi = () => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const bad = new Set(); let n;
    while ((n = w.nextNode())) {
      const el = n.parentElement; if (!el || el.closest('[lang="vi"],#OUT,script,style')) continue;
      const tx = n.nodeValue.trim(); if (tx && VI.test(tx)) bad.add(tx.slice(0, 120));
    }
    document.querySelectorAll('[title],[placeholder],[aria-label]').forEach(e => { if (e.closest('[lang="vi"]')) return; ['title', 'placeholder', 'aria-label'].forEach(a => { const v = e.getAttribute(a); if (v && VI.test(v)) bad.add('@' + a + ': ' + v.slice(0, 100)); }); });
    return [...bad];
  };
  const FW = { fr: /\b(the|and|with|from|when|which|should|cannot|loss|load|shed|Remote|Running|Stop|Start|Check|Missing|Yes|No)\b/, en: /(^|\s)(le|la|les|des|du|une|avec|pour|dans|selon|vérifier|Oui|Non|Arrêt|Marche|Délestage)(?=\s|$)/ };
  const foreign = lang => {
    const w = document.createTreeWalker(document.getElementById('page'), NodeFilter.SHOW_TEXT); const bad = new Set(); let n;
    while ((n = w.nextNode())) { const el = n.parentElement; if (!el || el.closest('[lang]:not(html),script,style,a,code,.mono,pre')) continue; const tx = n.nodeValue.trim(); if (tx.length > 2 && FW[lang].test(tx)) bad.add(tx.slice(0, 110)); }
    return [...bad];
  };
  const overflow = () => {
    const L = [];
    document.querySelectorAll('.btn,.tile,.chip,.nav a,.tabs button,.seg button,th').forEach(e => { if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible' && e.clientWidth > 0) L.push(e.textContent.trim().slice(0, 60)); });
    if (document.documentElement.scrollWidth > window.innerWidth + 2) L.push('PAGE HORIZONTAL SCROLL ' + document.documentElement.scrollWidth);
    return L;
  };
  const visit = (lang, tag, fn) => {
    out.n++;
    try { fn(); } catch (e) { out.errors.push(lang + ' ' + tag + ': ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
    if (lang !== 'vi') { const f = foreign(lang); if (f.length) (out.foreign[lang] = out.foreign[lang] || {})[tag] = f.slice(0, 8); }
    if (lang !== 'vi') { const b = textNoVi(); if (b.length) (out.vi[lang] = out.vi[lang] || {})[tag] = b.slice(0, 12); }
    if (lang !== 'vi' && SAMPLE.includes(tag)) (out.samples[lang] = out.samples[lang] || {})[tag] = document.getElementById('page').innerText.replace(/\s+/g, ' ').slice(-300);
    const o = overflow(); if (o.length) (out.overflow[lang] = out.overflow[lang] || {})[tag] = o.slice(0, 6);
  };
  ['vi', 'en', 'fr'].forEach(lang => {
    SG.setLang(lang);
    SG.PAGES.forEach(p => visit(lang, 'page:' + p, () => SG.go(p)));
    SG.SELTABS.forEach(tb => visit(lang, 'sel:' + tb, () => { SG.selSt = { tab: tb }; SG.go('selector'); }));
    ['io', 'cab', 'chain'].forEach(tb => visit(lang, 'io:' + tb, () => { SG.ioState = { tab: tb, f: '', type: '' }; SG.go('io'); }));
    visit(lang, 'chain-run', () => { SG.chainState = { remote: true, ks: true, qf: true, km: true, flt: false, nofb: true, res: 'x' }; SG.ioState = { tab: 'chain', f: '', type: '' }; SG.go('io'); });
    visit(lang, 'lib-cmp', () => { SG.libState = { q: '', lb: 0, only: false, sel: 'QF0', tab: 'A', mode: 'cmp' }; SG.go('library'); });
    SG.devices.forEach(d => ['A', 'B', 'C', 'D'].forEach(tb => visit(lang, 'dev:' + d.id + ':' + tb, () => { SG.libState = { q: '', lb: 0, only: false, sel: d.id, tab: tb, mode: 'dev' }; SG.go('library'); })));
    SG.allLinks().forEach(l => visit(lang, 'link:' + l.id, () => { SG.dgSel = { kind: 'link', id: l.id }; SG.go('diagram'); }));
    SG.traces.forEach(tr => visit(lang, 'trace:' + tr.id, () => { SG.dgSel = { kind: 'trace', id: tr.id }; SG.go('diagram'); }));
    SG.comms.forEach(c => visit(lang, 'comm:' + c.id, () => SG.go('comms', c.id)));
    SG.scenarios.forEach(sc => { for (let i = 0; i < 9; i++) visit(lang, 'scen:' + sc.id + ':' + i, () => { SG.scState = { sel: sc.id, i }; SG.go('scenarios'); }); });
    visit(lang, 'hmi-run', () => {
      SG.go('hmi'); const S = SG.simObj; S.ui.gridAvail = false; for (let i = 0; i < 40; i++) S.step(60); S.ui.gridAvail = true; for (let i = 0; i < 40; i++) S.step(60);
      S.ui.commPM = true; S.ui.rlFault = true; S.ui.m1FailInject = true; S.ui.m1Req = true; for (let i = 0; i < 10; i++) S.step(5);
      document.querySelectorAll('[data-cmd]').forEach(b => b.click()); document.querySelectorAll('[data-src]').forEach(b => b.click());
      SG.go('hmi');
    });
    visit(lang, 'diagram-cab', () => { SG.dgState = { view: 'all', layers: Object.keys(SG.LAYERS), loc: 'cab', tab: 'A' }; SG.dgSel = { kind: 'dev', id: 'RLY-DEC' }; SG.go('diagram'); });
    visit(lang, 'bilingual', () => { SG.bilingual = lang === 'en' ? 'fr' : 'en'; SG.go('library', 'QF0'); SG.bilingual = 'off'; });
    visit(lang, 'pairs-all', () => { SG.pairFilter = ''; SG.selSt = { tab: 'pairs' }; SG.go('selector'); document.querySelectorAll('details').forEach(d => d.open = true); });
    visit(lang, 'suggest-open', () => { SG.selSt = { tab: 'suggest' }; SG.go('selector'); document.querySelectorAll('details').forEach(d => d.open = true); });
    if (lang !== 'vi') out.gaps[lang] = SG.i18nDataGaps(lang).slice(0, 400);
  });
  out.miss = [...SG.i18nMiss].sort();
  const pre = document.createElement('pre'); pre.id = 'OUT'; pre.textContent = JSON.stringify(out, null, 1); document.body.appendChild(pre);
  document.title = 'DONE';
})();
