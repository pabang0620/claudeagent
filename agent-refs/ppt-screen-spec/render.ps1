param([string]$src,[string]$out)
$app = New-Object -ComObject PowerPoint.Application
$before = $app.Presentations.Count
$p = $app.Presentations.Open($src, $true, $false, $false)
if (!(Test-Path $out)) { New-Item -ItemType Directory -Path $out | Out-Null }
$i=1; foreach ($s in $p.Slides) { $s.Export((Join-Path $out ("s{0:D2}.png" -f $i)), "PNG", 1600, 900); $i++ }
$p.Close()
if ($before -eq 0 -and $app.Presentations.Count -eq 0) { $app.Quit() }
