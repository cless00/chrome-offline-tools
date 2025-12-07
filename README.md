# Offline Tools - Chrome 확장 프로그램

완전한 오프라인 환경에서 작동하는 보안 유틸리티 Chrome 확장 프로그램입니다.
A secure utility Chrome extension that works completely offline.

## 주요 기능

### 🔧 JSON 도구
- **Beautify**: JSON을 보기 좋게 정렬
- **Minify**: JSON을 한 줄로 압축
- **Unescape**: 이스케이프된 JSON 문자열 디코딩
- **Table View**: JSON을 인터랙티브 트리 테이블로 시각화
  - 노드 확장/축소
  - 깊이 레벨 슬라이더
  - 행, 키, 값 개별 복사 기능

### 🔐 비밀번호 생성기
- 암호학적으로 안전한 랜덤 생성
- 길이 조절 (4-64자)
- 문자 유형 선택: 대문자, 소문자, 숫자, 특수문자
- 일괄 생성 (1-50개)
- 원클릭 클립보드 복사

## Features (English)

### 🔧 JSON Tools
- **Beautify**: Format JSON with proper indentation
- **Minify**: Compress JSON to a single line
- **Unescape**: Decode escaped JSON strings
- **Table View**: Visualize JSON as an interactive tree table
  - Expand/collapse nodes
  - Depth level slider
  - Copy row, key, or value individually

### 🔐 Password Generator
- Cryptographically secure random generation
- Adjustable length (4-64 characters)
- Character type selection: uppercase, lowercase, numbers, special characters
- Batch generation (1-50 passwords)
- One-click clipboard copy

## 설치 방법

### Chrome 웹 스토어
*(출시 예정)*

### 소스에서 설치 (개발자 모드)
1. 이 저장소를 클론합니다
2. Chrome에서 `chrome://extensions` 페이지로 이동
3. 우측 상단의 "개발자 모드" 활성화
4. "압축해제된 확장 프로그램을 로드합니다" 클릭
5. 저장소 폴더 선택

## Chrome 웹 스토어 배포용 빌드

```bash
# 빌드 스크립트 실행
./build.sh
```

`dist/` 폴더에 ZIP 파일이 생성되며, Chrome 웹 스토어에 업로드할 수 있습니다.

## 기술 스택
- Vanilla JavaScript (ES6+)
- CSS3 및 CSS 변수
- 외부 의존성 없음 (완전 오프라인)
- Manifest V3

## 개인정보 취급방침

**Offline Tools 확장 프로그램은 사용자의 개인정보를 수집, 저장 또는 전송하지 않습니다.**

이 확장 프로그램은 완전한 오프라인 환경에서 작동하며:
- 사용자 데이터를 외부 서버로 전송하지 않습니다
- 사용자 정보를 저장하지 않습니다
- 분석 도구나 추적 도구를 사용하지 않습니다
- 네트워크 요청을 수행하지 않습니다

모든 JSON 처리 및 비밀번호 생성 작업은 사용자의 브라우저 내에서 로컬로만 수행됩니다.

### Privacy Policy (English)

**Offline Tools does not collect, store, or transmit any user data.**

This extension operates entirely offline and:
- Does not send any data to external servers
- Does not store any user information
- Does not use analytics or tracking tools
- Does not make any network requests

All JSON processing and password generation operations are performed locally within your browser.

## 라이선스
MIT
