# MEMO OS — SOMLUTION 영감 노션 위젯 세트

SOMLUTION의 MEMO OS를 노션 네이티브 + 무료 정적 호스팅으로 재현한 위젯 모음.

## 📦 포함된 위젯

| 위젯 | 파일 | 설명 |
|---|---|---|
| 🕐 OS 상단바 | `widget-clock.html` | 핑크 디지털 시계 + 날짜 |
| 💬 말풍선 메모 | `widget-chat.html` | 채팅형 메모 + 폴더 사이드바 + 하트/핀/답글/복사/삭제 |
| 📌 고정 메모 | `widget-pinned.html` | 파스텔 포스트잇 카드 + 색상 토글 + 인라인 편집 |
| ⚡ Quick Memo | `widget-quick.html` | 입력창 + SEND 초간단 위젯 |

## 🚀 빠른 시작 (로컬)

```bash
cd memo-os
python3 -m http.server 8100
# 브라우저에서 http://localhost:8100/widget-chat.html
```

기본 상태로는 **localStorage**에 저장됩니다 (브라우저 새로 고침 OK, 시크릿 모드는 안 됨, 디바이스 간 동기화 ✗).

## 🌐 무료 배포 — GitHub Pages

1. GitHub 새 저장소 생성 → `memo-os` 폴더 전체 푸시
2. Settings → Pages → Branch: `main` / Folder: `/` → Save
3. 5분 후 `https://<username>.github.io/<repo>/widget-chat.html` 사용 가능
4. 노션에서 **/embed** 입력 후 위 URL 붙여넣기

## 🔌 노션 DB 실시간 연동 (선택)

GitHub Pages로 배포한 정적 사이트는 노션 API를 직접 못 부릅니다 (CORS).
서버리스 함수 프록시가 필요해요. **Vercel 무료 플랜**으로 5분만에 가능.

### 사전 준비

1. 노션 통합(integration) 생성 — https://www.notion.so/my-integrations
   - 이름: MEMO OS
   - 워크스페이스 권한 부여
   - **Internal Integration Token** 복사 (`secret_...`)
2. 노션 메모 DB 열고 우상단 `···` → Connections → 방금 만든 통합 추가
3. DB URL에서 ID 추출: `https://www.notion.so/{32자리hex}?v=...`

### Vercel 배포

```bash
cd memo-os
npm install -g vercel
vercel login
vercel
# 프롬프트:
#   Set up and deploy? Y
#   Project name: memo-os
#   Directory: ./
```

배포 후 Vercel 대시보드에서:
- Settings → Environment Variables 추가
  - `NOTION_TOKEN` = `secret_...` (통합 토큰)
  - `NOTION_DB_ID` = `4f7b...` (DB ID, 32자리 hex)
- Deployments → 최신 → Redeploy

### 위젯에 프록시 URL 붙이기

위젯 URL에 쿼리스트링으로 API 주소 전달:

```
https://<your-vercel>.vercel.app/widget-chat.html?api=https://<your-vercel>.vercel.app/api
```

이 URL을 노션 임베드에 붙여넣으면 메모가 실제 노션 DB에 저장됩니다.

## 🎨 메모 DB 스키마 (필수)

위젯이 동작하려면 노션 DB에 아래 속성이 있어야 합니다:

| 속성명 | 타입 | 비고 |
|---|---|---|
| 메모 | Title | 메모 본문 |
| 폴더 | Select | 옵션: IDEA, TO DO, MEMO, PROMPT, WORK, ECT 등 자유 |
| 중요 | Checkbox | 하트 토글 |
| 고정 | Checkbox | 핀 토글 |
| RE | Rich Text | 답글 |
| 이미지 | Files | 첨부 이미지 (옵션) |
| 생성 시각 | Created time | 정렬용 |

이미 본인 노션에 생성된 `📝 메모 DB`가 이 스키마를 따르고 있습니다.

## 🧩 노션 임베드 방법

1. 노션 페이지에서 `/embed` 입력
2. `Embed Link` 클릭
3. 위젯 URL 붙여넣기
4. 크기 조정 (위젯별 권장):
   - Clock: 280 × 200
   - Chat: 640 × 540
   - Pinned: 300 × 600
   - Quick: 420 × 100

## ⚠️ 알아둘 점

- **상업적 재배포 금지**: 이 코드는 SOMLUTION 정품의 시각·UX를 학습 목적으로 재현한 것입니다. 본인 노션에서만 사용하세요.
- 정품(7,000원 ~ 14,000원)이 더 안정적이고 다양한 기능을 제공합니다: https://www.postype.com/@somnote/post/22343409
- 이 코드는 SOMLUTION과 무관합니다.

## 📁 파일 구조

```
memo-os/
├── index.html              # 위젯 갤러리 (모든 위젯 미리보기)
├── widget-clock.html       # OS 상단바 (디지털 시계)
├── widget-chat.html        # 말풍선 메모 (메인)
├── widget-pinned.html      # 고정 메모 (포스트잇)
├── widget-quick.html       # Quick Memo
├── styles.css              # 공통 핑크 테마
├── api.js                  # 노션 API 클라이언트 (브라우저)
├── api/
│   └── notion.js           # Vercel 서버리스 프록시
├── vercel.json             # Vercel 라우팅
├── package.json
└── README.md
```
