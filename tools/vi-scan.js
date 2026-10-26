// Liệt kê dòng code còn chuỗi tiếng Việt (bỏ qua chú thích) — dùng khi chuyển sang i18n.
// Cách dùng: node tools/vi-scan.js <file.js> ...
const fs = require('fs');
const VI = /[ạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹđĐăâêôơưÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáãèéìíòóõùúý]/;
for (const f of process.argv.slice(2)) {
  const src = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\r\n]/g, ' '));
  src.split(/\r?\n/).forEach((l, i) => {
    const code = l.replace(/(^|[^:'"`])\/\/.*$/, '$1');
    if (VI.test(code)) console.log(f + ':' + (i + 1) + ': ' + code.trim().slice(0, 150));
  });
}
