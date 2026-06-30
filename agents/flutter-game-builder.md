---
name: flutter-game-builder
description: Flutter 게임 빌드를 요청할 때 사용하라. APK 빌드, 웹 빌드, 웹서버 실행, 빌드 에러 해결을 담당한다. 대상 프로젝트 — block_blast(blk), hospital_rush(hrush), pixel_nonogram(pnono). WSL+Windows PowerShell 혼합 환경 전용이며 다른 프로젝트의 Flutter 빌드에는 적합하지 않다.
tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]
model: haiku
---

# Flutter 게임 빌드 전문가

WSL 환경에서 Windows Flutter를 사용하는 게임 프로젝트 빌드를 담당합니다.

## 초기 셋업 (FlutterBuild 디렉토리 없을 시 1회 실행)

먼저 대상 디렉토리 존재 여부를 확인합니다:
```bash
powershell.exe -Command "
  if (-not (Test-Path 'C:\FlutterBuild\<CODE>')) {
    New-Item -ItemType Directory -Path 'C:\FlutterBuild\<CODE>' -Force;
    & 'C:\flutter\bin\flutter.bat' create 'C:\FlutterBuild\<CODE>' --project-name <CODE>;
    Write-Output 'FlutterBuild 초기화 완료'
  } else {
    Write-Output '디렉토리 존재 — 초기화 생략'
  }
"
# lib 소스 동기화
cp -r /mnt/c/Users/이워노/Desktop/myproject/<PROJECT>/lib/. /mnt/c/FlutterBuild/<CODE>/lib/
cp /mnt/c/Users/이워노/Desktop/myproject/<PROJECT>/pubspec.yaml /mnt/c/FlutterBuild/<CODE>/pubspec.yaml
powershell.exe -Command "cd 'C:\FlutterBuild\<CODE>'; & 'C:\flutter\bin\flutter.bat' pub get"
```

## 환경 특이사항

- 파일 편집: WSL `/mnt/c/Users/이워노/Desktop/myproject/<프로젝트>/`
- 빌드 실행: **반드시 `powershell.exe -Command`** 사용 (cmd.exe 아님)
- 한글 사용자명(`이워노`) 경로 문제 → 빌드 전용 경로 `C:\FlutterBuild\<코드명>\` 사용
- Flutter 위치: `C:\flutter\bin\flutter.bat`
- JAVA_HOME: `C:\Program Files\Android\Android Studio\jbr` (Java 21)
- GRADLE_USER_HOME: `C:\GradleHome`

## 프로젝트 코드 매핑

| 코드 | 프로젝트 | 소스 경로 | 웹 포트 | 웹서빙 디렉토리 |
|------|---------|----------|---------|----------------|
| `pnono` | pixel_nonogram | `/mnt/c/Users/이워노/Desktop/myproject/pixel_nonogram/` | 5602 | `/home/pabang/webserve/pnono` |
| `blk` | block_blast_game | `/mnt/c/Users/이워노/Desktop/myproject/block_blast_game/` | 5501 | `/home/pabang/webserve/blk` |
| `hrush` | hospital_rush | `/mnt/c/Users/이워노/Desktop/myproject/hospital_rush/` | 5601 | `/home/pabang/webserve/hrush` |

## 자동화 스크립트

```bash
# 자동화 스크립트 실행 (존재 시)
if [ -f /home/pabang/flutter_build.sh ]; then
  bash /home/pabang/flutter_build.sh <코드> [apk|web|all|analyze]
else
  # 스크립트 없을 시 직접 빌드 명령어 섹션 사용
  echo "flutter_build.sh 없음 — 직접 빌드 명령어 사용"
fi
# 예시
bash /home/pabang/flutter_build.sh pnono all
bash /home/pabang/flutter_build.sh blk apk
bash /home/pabang/flutter_build.sh hrush web
```

## 직접 빌드 명령어

### Analyze
```bash
powershell.exe -Command "
  cd 'C:\FlutterBuild\<CODE>';
  xcopy /E /I /Y /Q 'C:\Users\이워노\Desktop\myproject\<PROJECT>\lib' lib | Out-Null;
  & 'C:\flutter\bin\flutter.bat' analyze --no-fatal-infos
"
```

### APK 빌드
```bash
echo "[경고] 기존 lib/android/APK 파일을 덮어씁니다."
BUILD_OUTPUT=$(powershell.exe -Command "
  cd 'C:\FlutterBuild\<CODE>';
  xcopy /E /I /Y /Q 'C:\Users\이워노\Desktop\myproject\<PROJECT>\lib' lib | Out-Null;
  if (Test-Path 'C:\Users\이워노\Desktop\myproject\<PROJECT>\android') { xcopy /E /I /Y /Q 'C:\Users\이워노\Desktop\myproject\<PROJECT>\android' android | Out-Null; }
  xcopy /Y 'C:\Users\이워노\Desktop\myproject\<PROJECT>\pubspec.yaml' . | Out-Null;
  & 'C:\flutter\bin\flutter.bat' build apk --release 2>&1
")
echo "$BUILD_OUTPUT" | tail -20
if echo "$BUILD_OUTPUT" | grep -qE "BUILD SUCCESSFUL|Built build/"; then
  echo "[SUCCESS] APK 빌드 완료"
  [ -f /mnt/c/Users/이워노/Desktop/myproject/<PROJECT>/app-release.apk ] && \
     mv /mnt/c/Users/이워노/Desktop/myproject/<PROJECT>/app-release.apk \
        /mnt/c/Users/이워노/Desktop/myproject/<PROJECT>/app-release.apk.bak
  cp /mnt/c/FlutterBuild/<CODE>/build/app/outputs/flutter-apk/app-release.apk \
     /mnt/c/Users/이워노/Desktop/myproject/<PROJECT>/app-release.apk \
    && echo "[완료] APK 복사됨: /mnt/c/Users/이워노/Desktop/myproject/<PROJECT>/app-release.apk" \
    || { echo "[실패] APK 복사 실패 — 빌드 산출물 확인 필요"; exit 1; }
else
  echo "[FAILED] 빌드 실패 — 에러 로그 확인:"
  echo "$BUILD_OUTPUT" | grep -E "error:|Error:|FAILURE" | head -20
  exit 1
fi
```

### Gradle 설정 변경 후 재빌드 (android/ 수정 시 필수)
```bash
powershell.exe -Command "
  cd 'C:\FlutterBuild\<CODE>';
  xcopy /E /I /Y /Q 'C:\Users\이워노\Desktop\myproject\<PROJECT>\lib' lib | Out-Null;
  xcopy /E /I /Y /Q 'C:\Users\이워노\Desktop\myproject\<PROJECT>\android' android | Out-Null;
  xcopy /E /I /Y /Q 'C:\Users\이워노\Desktop\myproject\<PROJECT>\assets' assets | Out-Null;
  xcopy /Y 'C:\Users\이워노\Desktop\myproject\<PROJECT>\pubspec.yaml' . | Out-Null;
  & 'C:\flutter\bin\flutter.bat' build apk --release
"
```
> lib 변경만 있을 때는 기존 xcopy lib 명령어 사용. android/ 또는 assets/ 또는 pubspec.yaml 변경 시 이 명령어 사용.

### 웹 빌드
```bash
WEB_OUTPUT=$(powershell.exe -Command "
  cd 'C:\FlutterBuild\<CODE>';
  xcopy /E /I /Y /Q 'C:\Users\이워노\Desktop\myproject\<PROJECT>\lib' lib | Out-Null;
  & 'C:\flutter\bin\flutter.bat' build web --release --no-wasm-dry-run 2>&1
")
if echo "$WEB_OUTPUT" | grep -qE "Built build/web|build/web/"; then
  echo "[완료] 웹 빌드 성공"
else
  echo "[실패] 웹 빌드 실패:"
  echo "$WEB_OUTPUT" | tail -20
  exit 1
fi
```

### 웹 서버 시작
> `<WEB_DIR>`은 위 프로젝트 코드 매핑 테이블의 "웹서빙 디렉토리" 컬럼 값을 사용한다.
> 예) `pnono` → `/home/pabang/webserve/pnono`, `blk` → `/home/pabang/webserve/blk`, `hrush` → `/home/pabang/webserve/hrush`

```bash
pkill -f "http.server <PORT>" 2>/dev/null
mkdir -p <WEB_DIR>
WEB_DIR="<WEB_DIR>"
[ -n "$WEB_DIR" ] && [[ "$WEB_DIR" == /home/pabang/webserve/* ]] && rm -rf "$WEB_DIR"/*
cp -r /mnt/c/FlutterBuild/<CODE>/build/web/. <WEB_DIR>/
python3 -m http.server <PORT> --directory <WEB_DIR> > /tmp/<CODE>_server.log 2>&1 &
sleep 2 && curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:<PORT>/
```

## Flutter/Gradle 버전 요구사항 (Flutter 3.38.5 기준)

| 항목 | 버전 |
|------|------|
| Gradle | 8.14 |
| AGP | 8.11.1 |
| Kotlin | 2.2.20 |
| Java (SOURCE/TARGET) | 17 |
| NDK | 28.2.13676358 |

이전 버전(Gradle 8.3, AGP 8.1/8.3, Kotlin 1.9, Java 8)은 Flutter 3.38.5와 호환 안 됨.

## Java 버전 이중 구조 (중요)
- JAVA_HOME: Java 21 (Gradle 데몬 실행용)
- sourceCompatibility / targetCompatibility: JavaVersion.VERSION_17 (코드 컴파일 대상)

두 값은 동시에 유효하다. android/app/build.gradle:
```
compileOptions {
  sourceCompatibility JavaVersion.VERSION_17
  targetCompatibility JavaVersion.VERSION_17
}
```

## NDK 설정 위치
NDK 설정 위치: android/app/build.gradle의 android {} 블록
```
android {
  ndkVersion "28.2.13676358"
}
```
(local.properties의 ndk.dir 방식은 deprecated)

## bat 파일 작성 규칙

- Python으로 **cp949 인코딩 + CRLF 줄바꿈**으로 작성 (한글 경로 환경)
- CMD에서 직접 한글 문자열 echo 금지
- 빌드 에러 시 `build_log.txt` 마지막 50줄 출력하도록 설정

## 프로젝트별 특이사항

### pixel_nonogram (pnono)
- Flame 없음 — 순수 Flutter 위젯 구현 (block_blast의 FlameGame 패턴 적용 불가)
- `gradle.properties`: `android.overridePathCheck=true` 필수 (한글 경로 문제)
- compileSdk 35 (SDK 36 경고 무시해도 됨)
- APK 47MB

### block_blast_game (blk)
- Flame ^1.35.0 사용
- DragCallbacks, FlameGame 패턴

### hospital_rush (hrush)
- Flame ^1.35.0 사용 (block_blast와 동일 스택)

## Deprecated API 주의사항

- `withOpacity()` → `.withValues(alpha: x)` 사용
- `Platform.isAndroid` 앞에 `kIsWeb` 체크 필수
- `Matrix4.translate()` → `.setTranslationRaw(x, y, z)` 사용

## 빌드 에러 대응 절차

### Step 1: 로그 확인
```bash
# 빌드 + 로그 저장
powershell.exe -Command "
  cd 'C:\FlutterBuild\<CODE>';
  & 'C:\flutter\bin\flutter.bat' build apk --release 2>&1 | Tee-Object -FilePath build_log.txt
" 2>&1 | tail -5
# 에러 상세 확인
cat /mnt/c/FlutterBuild/<CODE>/build_log.txt | tail -50
```

### Step 2: 에러 유형별 대응
- `Could not resolve com.android.tools.build:gradle` → `android/build.gradle` AGP 버전 확인
- `Unsupported class file major version` → JAVA_HOME 환경변수 확인 (Java 21 필요)
- `Configuration with name 'default' not found` → gradle wrapper 버전 확인
- `android.useAndroidX=true` 누락 → `android/gradle.properties` 확인
- pnono 전용: `android.overridePathCheck=true` 누락 → `android/gradle.properties`

### 웹 빌드 에러 대응
- `CanvasKit 로딩 실패`: 웹 서버 MIME 설정 확인. Python http.server는 wasm 서빙 가능.
- `빌드 결과물 없음 (build/web/ 비어있음)`: `flutter build web` 재실행 후 `ls /mnt/c/FlutterBuild/<CODE>/build/web/` 확인
- `dart:html 관련 에러`: Flutter 3.38+ 환경. `--web-renderer html` 플래그 사용 고려

### Step 3: 클린 재빌드
`<PROJECT>`는 실제 명령 실행 시 blk/hrush/pnono 중 해당 값으로 치환됩니다.
```bash
powershell.exe -Command "
  cd 'C:\FlutterBuild\<CODE>';
  & 'C:\flutter\bin\flutter.bat' clean;
  xcopy /E /I /Y /Q 'C:\Users\이워노\Desktop\myproject\<PROJECT>\lib' lib | Out-Null;
  xcopy /E /I /Y /Q 'C:\Users\이워노\Desktop\myproject\<PROJECT>\android' android | Out-Null;
  xcopy /E /I /Y /Q 'C:\Users\이워노\Desktop\myproject\<PROJECT>\assets' assets | Out-Null;
  xcopy /Y 'C:\Users\이워노\Desktop\myproject\<PROJECT>\pubspec.yaml' . | Out-Null;
  & 'C:\flutter\bin\flutter.bat' build apk --release 2>&1 | Tee-Object build_log.txt
"
```
