# CPBC 가톨릭평화방송 배차 시스템 배포 가이드

## 데이터 관리 시스템

이 시스템은 파일 기반 데이터 저장을 사용하여 코드 업데이트 시에도 데이터가 유지됩니다.

### 데이터 파일 구조
```
data/
├── vehicles.json      # 차량 정보
├── dispatches.json    # 배차 신청 정보
├── operations.json    # 운행 기록
├── inspections.json   # 점검 기록
└── config.json        # 시스템 설정
```

### 백업 시스템
- 자동 백업: 데이터 변경 시 자동으로 localStorage에 백업
- 수동 백업: 관리자 페이지에서 수동으로 백업 생성
- 백업 복원: 특정 날짜의 백업으로 데이터 복원 가능

## 방법 1: GitHub Pages (무료, 추천)

### 1단계: GitHub 계정 생성
1. https://github.com 접속
2. "Sign up" 클릭하여 계정 생성
3. 이메일 인증 완료

### 2단계: 새 저장소 생성
1. GitHub 로그인 후 우측 상단 "+" 버튼 클릭
2. "New repository" 선택
3. Repository name: `vehicle-dispatch-system` 입력
4. "Public" 선택 (무료)
5. "Create repository" 클릭

### 3단계: 파일 업로드
1. 생성된 저장소 페이지에서 "uploading an existing file" 클릭
2. 모든 파일 (`index.html`, `styles.css`, `script.js`, `README.md`) 드래그 앤 드롭
3. "Commit changes" 클릭

### 4단계: GitHub Pages 활성화
1. 저장소 페이지에서 "Settings" 탭 클릭
2. 좌측 메뉴에서 "Pages" 클릭
3. "Source" 섹션에서 "Deploy from a branch" 선택
4. "Branch" 드롭다운에서 "main" 선택
5. "Save" 클릭

### 5단계: 사이트 접속
- 몇 분 후 `https://[사용자명].github.io/vehicle-dispatch-system` 접속 가능

## 방법 2: Netlify (무료, 더 간단)

### 1단계: Netlify 가입
1. https://netlify.com 접속
2. "Sign up" 클릭하여 GitHub 계정으로 로그인

### 2단계: 사이트 배포
1. Netlify 대시보드에서 "New site from Git" 클릭
2. GitHub 선택 후 저장소 연결
3. "Deploy site" 클릭

### 3단계: 도메인 설정
- 자동으로 `https://[랜덤이름].netlify.app` 생성
- "Site settings" → "Change site name"에서 원하는 이름으로 변경 가능

## 방법 3: Vercel (무료, 빠름)

### 1단계: Vercel 가입
1. https://vercel.com 접속
2. GitHub 계정으로 로그인

### 2단계: 프로젝트 배포
1. "New Project" 클릭
2. GitHub 저장소 선택
3. "Deploy" 클릭

### 3단계: 접속
- `https://[프로젝트명].vercel.app` 접속 가능

## 방법 4: 로컬 서버 (개발용)

### Windows에서 실행:
```powershell
cd vehicle-dispatch-system
npm install
npm start
```
- 브라우저에서 `http://localhost:3000` 접속

### 다른 컴퓨터에서 접속:
- 같은 Wi-Fi 네트워크에서 `http://[컴퓨터IP]:8000` 접속
- IP 확인: `ipconfig` 명령어 실행

## 보안 고려사항

### 현재 상태 (파일 기반 저장)
- 데이터가 JSON 파일로 서버에 저장됨
- 코드 업데이트 시에도 데이터 유지
- 자동 백업 시스템으로 데이터 손실 방지

### 향후 개선 방안
- 클라우드 데이터베이스 연동
- 사용자 인증 시스템 강화
- HTTPS 보안 연결
- 실시간 데이터 동기화

## 추천 배포 순서

1. **개발/테스트**: 로컬 서버
2. **소규모 사용**: GitHub Pages
3. **정식 서비스**: Netlify 또는 Vercel
4. **대규모 서비스**: AWS, Google Cloud 등

## 문제 해결

### Q: 사이트가 제대로 로드되지 않아요
A: 브라우저 캐시 삭제 후 새로고침

### Q: 모바일에서 접속이 안 돼요
A: HTTPS 사용 확인, 네트워크 설정 확인

### Q: 데이터가 사라져요
A: 파일 기반 저장으로 코드 업데이트 시에도 데이터가 유지됩니다. 백업 기능을 활용하여 데이터를 보호하세요. 