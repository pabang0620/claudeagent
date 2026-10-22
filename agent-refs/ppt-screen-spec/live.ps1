# 열린 PPT의 지정 장을 새 파일의 같은 번호 장으로 바꿔 끼운다. 저장·닫기는 하지 않는다(저장은 사용자).
# 사용: powershell.exe -ExecutionPolicy Bypass -File live.ps1 <새 pptx 윈도우 경로> <장 번호 목록 "3,4,5"> <열린 파일 이름 일부>
param([string]$new,[string]$slides,[string]$namePart)
$app = [Runtime.InteropServices.Marshal]::GetActiveObject("PowerPoint.Application")
$pres = $null
foreach ($p in $app.Presentations) { if ($p.Name -like "*$namePart*") { $pres = $p } }
if ($pres -eq $null) { Write-Output "NOT_OPEN"; exit }
foreach ($i in ($slides -split ',')) {
  $i = [int]$i
  $pres.Slides.InsertFromFile($new, $i, $i, $i) | Out-Null
  $pres.Slides.Item($i).Delete()
}
Write-Output ("OK slides=" + $pres.Slides.Count)
