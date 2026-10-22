
$app = [Runtime.InteropServices.Marshal]::GetActiveObject("PowerPoint.Application")
foreach ($p in $app.Presentations) { if ($p.Name -like "*20261020*") { $pres = $p } }
function C($hex) { $r=[Convert]::ToInt32($hex.Substring(0,2),16); $g=[Convert]::ToInt32($hex.Substring(2,2),16); $b=[Convert]::ToInt32($hex.Substring(4,2),16); return $r + $g*256 + $b*65536 }
function Style($cell,$txt,$fill,$col,$bold,$align) {
  $tf=$cell.Shape.TextFrame; $tf.MarginLeft=2.27; $tf.MarginRight=2.27; $tf.MarginTop=0.85; $tf.MarginBottom=0.85; $tf.VerticalAnchor=3
  $tr=$tf.TextRange; $tr.Text=$txt; $tr.Font.Name="Pretendard"; $tr.Font.NameFarEast="Pretendard"; $tr.Font.Size=$fsz; $tr.ParagraphFormat.Alignment=$align
  $cell.Shape.Fill.Visible=-1; $cell.Shape.Fill.Solid(); $cell.Shape.Fill.ForeColor.RGB=(C $fill)
  $tr.Font.Color.RGB=(C $col); $tr.Font.Bold=$bold
  foreach ($b in 1,2,3,4) { $bd=$cell.Borders($b); $bd.Visible=-1; $bd.Weight=0.5; $bd.ForeColor.RGB=(C "BFC4D6") }
}
$srcPath="C:\Users\admin\AppData\Local\Temp\pptqa\bandsrc.pptx"
$src = $app.Presentations.Open($srcPath, $true, $false, $false)
if ($src.FullName -eq $pres.FullName) { "SAME"; exit }
# 8장(활동성) 표 교체
$s8=$pres.Slides.Item(8); $s8.Shapes.Item("BandTable").Delete()
$src.Slides.Item(1).Shapes.Item("BandTable").Copy(); Start-Sleep -Milliseconds 400
$t8=$s8.Shapes.Paste().Item(1); $t8.Name="BandTable"; $t8.Left=21; $t8.Top=91
$s8.Export("C:\Users\admin\AppData\Local\Temp\pptqa\live3\s08.png","PNG",1600,900)
$b8 = [int]($t8.Top+$t8.Height)
$s6 = $pres.Slides.Item(6)
$new = $s6.Duplicate().Item(1)
$tblName=$null; foreach ($sh in @($new.Shapes)) { if ($sh.HasTable -and $sh.Name -ne "Group 1019") { $tblName=$sh.Name } }
$new.Shapes.Item($tblName).Delete()
$bar=$null
foreach ($sh in @($new.Shapes)) {
  if ($sh.Type -eq 6) { foreach ($g in $sh.GroupItems) { if ($g.HasTextFrame -and $g.TextFrame.TextRange.Text -eq "사업안정성 15개 항목 계산식") { [void]$g.TextFrame.TextRange.Replace("사업안정성 15개 항목 계산식","사업안정성 15개 항목 배점표") } } }
  if ($sh.HasTextFrame -and $sh.TextFrame.TextRange.Text -like "사업안정성 15개 항목:*") { $sh.TextFrame.TextRange.Text = "사업안정성 15개 항목 배점표: 구간별 점수 (처음 값 = 엑셀 배점관리 시트)"; $bar=$sh }
}
$src.Slides.Item(2).Shapes.Item("BandTable").Copy(); Start-Sleep -Milliseconds 400
$t = $new.Shapes.Paste().Item(1); $t.Name="BandTable"; $t.Left=21; $t.Top=91
$fs=$null; foreach ($sh in $new.Shapes) { if ($sh.Name -eq "Group 1019") { $fs=$sh } }
$notes=@("사업안정성 15개 배점표 (처음 값 = 엑셀 배점관리 시트)`r- 구간 1부터 차례로 보고 먼저 맞는 구간 하나의 점수를 줌`r- 어느 구간에도 안 걸리면 0점, 원값이 비면 점수 없음`r- 인원변동률·단기연체·채무불이행·공공기록은 감점 항목(최고점 0)`r- 신용·현금흐름등급은 등급을 수치로 바꿔 비교 (AAA 10 ~ NG 0, A 6 ~ E 1)`r- 배점 설정 화면에서 바꿀 수 있음")
for ($r=1;$r -le 10;$r++) { $tr=$fs.Table.Cell($r,2).Shape.TextFrame.TextRange; if ($r -le $notes.Count) { $tr.Text=$notes[$r-1] } else { $tr.Text="" }; $tr.Font.Name="+mn-lt"; $tr.Font.NameFarEast="+mn-ea"; $tr.Font.Size=7; $tr.Font.Bold=0; if ($r -le $notes.Count) { $tr.Paragraphs(1).Font.Bold=-1 } }
for ($r=1;$r -le 10;$r++) { $fs.Table.Rows($r).Height = 1 }
$boxes=@(); foreach ($sh in $new.Shapes) { if ($sh.Name -eq "Rectangle 49") { $boxes += $sh } }
for ($i=1;$i -lt $boxes.Count;$i++) { $boxes[$i].Delete() }
$boxes[0].TextFrame.TextRange.Text="1"; $boxes[0].Left=$bar.Left+$bar.Width-$boxes[0].Width; $boxes[0].Top=$bar.Top; $boxes[0].ZOrder(0)
# 6장: 구간 열 삭제
$t6=$null; foreach ($sh in $s6.Shapes) { if ($sh.HasTable -and $sh.Name -ne "Group 1019") { $t6=$sh } }
$tb6=$t6.Table; $gone=$tb6.Columns(5).Width; $tb6.Columns(5).Delete()
$tb6.Columns(4).Width=[single]($tb6.Columns(4).Width + $gone)
for ($r=1;$r -le $tb6.Rows.Count;$r++) { $tb6.Rows($r).Height = 1 }
foreach ($sh in @($s6.Shapes)) { if ($sh.Name -eq "Rectangle 49") { $k=$sh.TextFrame.TextRange.Text; if ($k -eq "3") { $sh.Delete() } elseif ($k -eq "2") { $sh.Left = $t6.Left + $t6.Width - $sh.Width; $sh.Top=$t6.Top } } }
$fs6=$null; foreach ($sh in $s6.Shapes) { if ($sh.Name -eq "Group 1019") { $fs6=$sh } }
$fs6.Table.Cell(3,2).Shape.TextFrame.TextRange.Text=""
$tr=$fs6.Table.Cell(1,2).Shape.TextFrame.TextRange; [void]$tr.InsertAfter("`r- 구간별 점수는 다음 장 배점표")
$tr.Font.Name="+mn-lt"; $tr.Font.NameFarEast="+mn-ea"; $tr.Font.Size=7
for ($r=1;$r -le 10;$r++) { $fs6.Table.Rows($r).Height = 1 }
$o="C:\Users\admin\AppData\Local\Temp\pptqa\live3"
$s6.Export("$o\s06.png","PNG",1600,900); $new.Export("$o\s07b.png","PNG",1600,900)
$src.Close()
"b8=$b8 b7=" + [int]($t.Top+$t.Height) + " slides=" + $pres.Slides.Count
