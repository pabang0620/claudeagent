# Android MainActivity 패키지명 불일치 크래시 수정

## 증상
- Flutter 앱이 Android에서 즉시 종료 (켜지자마자 꺼짐)
- 웹 빌드는 정상 작동
- Flutter 에러 화면조차 표시되지 않음 (네이티브 레벨 크래시)

## 원인
`FlutterBuild/{앱코드}/android/app/src/main/kotlin/com/example/{앱명}/MainActivity.kt`의
패키지 선언이 `com.example.*`인데, `build.gradle`의 `namespace`와 `applicationId`는 `com.pabang.*`으로 설정되어 있어서 불일치 발생.

Android가 앱 실행 시 `com.pabang.{앱명}.MainActivity`를 찾지만 실제 DEX에는
`com.example.{앱명}.MainActivity`만 존재해 즉시 크래시.

## 영향을 받은 앱
- **Block Blast** (`blk`): `com.example.block_blast_game` → `com.pabang.block_blast_game`
- **Hospital Rush** (`hrush`): `com.example.hospital_rush` → `com.pabang.hospital_rush`
- **Pixel Nonogram** (`pnono`): 처음부터 `com.pabang.pixel_nonogram`으로 올바르게 설정됨 → 영향 없음

## 수정 방법

### FlutterBuild 디렉토리 (빌드용)
```
C:\FlutterBuild\blk\android\app\src\main\kotlin\com\example\block_blast_game\MainActivity.kt
C:\FlutterBuild\hrush\android\app\src\main\kotlin\com\example\hospital_rush\MainActivity.kt
```

각 파일의 첫 줄을 수정:
```kotlin
// 수정 전
package com.example.block_blast_game

// 수정 후
package com.pabang.block_blast_game
```

### 소스 프로젝트 (원본)
```
C:\Users\이워노\Desktop\myproject\block_blast_game\android\...\MainActivity.kt
C:\Users\이워노\Desktop\myproject\hospital_rush\android\...\MainActivity.kt
```
동일하게 패키지명 수정.

## 주의사항
- `flutter_build.sh`는 `lib/` 폴더만 xcopy로 복사하고 `android/` 폴더는 복사하지 않음
- FlutterBuild 디렉토리의 `android/` 설정 변경 시 소스 프로젝트에도 동일하게 적용해야 함
- 새로운 앱 생성 시 `flutter create --org com.pabang` 옵션으로 처음부터 올바른 패키지명 사용 권장

## 관련 파일
- `FlutterBuild/{코드}/android/app/build.gradle` — namespace, applicationId 선언
- `FlutterBuild/{코드}/android/app/src/main/AndroidManifest.xml` — `.MainActivity` 참조
- `FlutterBuild/{코드}/android/app/src/main/kotlin/.../MainActivity.kt` — 실제 클래스

## 발견 경위 (2026-03-18)
웹 빌드는 정상이고 Android만 즉시 크래시. Debug APK도 Flutter 에러 화면 없이 꺼짐.
Pixel Nonogram(정상)과 Block Blast/Hospital Rush(크래시) 비교 분석 중
GeneratedPluginRegistrant.java → build.gradle → MainActivity.kt 순으로 확인하여 발견.
