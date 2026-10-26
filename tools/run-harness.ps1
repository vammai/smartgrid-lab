# Chạy trang kiểm tra i18n bằng Edge headless, ghi kết quả JSON vào %TEMP%\i18n_out.json
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$p = (Resolve-Path "$PSScriptRoot\..\smartgrid-lab\_i18n_test.html").Path
$u = "file:///" + $p.Replace('\', '/').Replace(' ', '%20')
$o = "$env:TEMP\i18n_dom.html"
Start-Process -FilePath $edge -ArgumentList @('--headless', '--disable-gpu', "--user-data-dir=$env:TEMP\edgeprof-i18n", '--window-size=1440,1000', '--virtual-time-budget=120000', '--dump-dom', $u) -RedirectStandardOutput $o -RedirectStandardError "$env:TEMP\i18n_err.txt" -Wait -NoNewWindow
$h = Get-Content $o -Raw -Encoding UTF8
$m = [regex]::Match($h, '<pre id="OUT">([\s\S]*?)</pre>')
if ($m.Success) { [System.Net.WebUtility]::HtmlDecode($m.Groups[1].Value) | Out-File "$env:TEMP\i18n_out.json" -Encoding utf8; "OK " + $m.Groups[1].Value.Length } else { "NO OUTPUT, dom length " + $h.Length }
