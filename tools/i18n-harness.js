// Tạo trang kiểm tra i18n tạm thời (smartgrid-lab/_i18n_test.html) từ index.html.
// Trang đi qua mọi màn hình ở VI/EN/FR, ghi khóa thiếu và chữ tiếng Việt lọt vào EN/FR vào <pre id="OUT">.
// Cách dùng: node tools/i18n-harness.js  rồi  powershell tools/run-harness.ps1 ; xóa _i18n_test.html sau khi kiểm tra.
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'smartgrid-lab');
let s = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const test = fs.readFileSync(path.join(__dirname, 'i18n-run.js'), 'utf8');
const onerr = '<script>window.onerror=function(m,u,l){document.title="ERR "+m+" @"+String(u||"").split("/").pop()+":"+l;};</script>\n';
s = s.replace('<script src="js/i18n.js"></script>', onerr + '<script src="js/i18n.js"></script>');
s = s.replace('<script>SG.snapI18n(); SG.applyI18n(); SG.r = SG.calc(SG.cfg); SG.syncProj(); SG.start();</script>',
  '<script>try{localStorage.clear()}catch(e){}SG.snapI18n(); SG.applyI18n(); SG.r = SG.calc(SG.cfg); SG.syncProj(); SG.start();</script>\n<script>' + test + '</script>');
fs.writeFileSync(path.join(dir, '_i18n_test.html'), s);
console.log('ok');
