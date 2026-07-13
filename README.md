# FishNote

회에 관심 있는 사람이 "내가 먹는 회가 어떤 생선인지, 언제가 제철인지, 맛은 어떤지"를 둘러보고 검색하는 **회 도감** 서비스입니다.

- 운영: https://www.fishnote.kr
- 스택: React(Vite/TS) + Spring Boot(Java 17) + PostgreSQL
- 설계 문서: [`docs/`](docs/) (DB 설계 · API 명세 · 아키텍처 · 리디자인/기능 티켓)

## 아키텍처

```
[React (FE)] ──REST──> [Spring Boot (BE)] ──JPA──> [PostgreSQL]
  Vercel 배포             Render 배포                Neon (serverless)
  fishnote.kr             *.onrender.com             ap-* 리전
                              │
                          [Cloudinary]  ← 후기 사진 업로드
```

## 로컬 개발

### 백엔드

로컬 PostgreSQL이 있으면:

```bash
createdb fishnote
cd BE && ./gradlew bootRun        # http://localhost:8080
```

로컬 PostgreSQL이 없으면 인메모리 H2로 실행할 수 있습니다:

```bash
cd BE && SPRING_PROFILES_ACTIVE=test ./gradlew bootTestRun
```

환경변수 (없으면 해당 기능만 비활성/부팅 실패):

```text
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/fishnote   # 기본값 있음
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=
JWT_SECRET=<32-byte-or-longer-random-secret>           # 로그인 토큰 서명 — 필수
KAKAO_REST_API_KEY=<kakao-rest-api-key>                # 카카오 로그인 — 서버의 코드 교환용
KAKAO_CLIENT_SECRET=<kakao-client-secret>              # 카카오 로그인 — 서버 전용, 외부 노출 금지
CLOUDINARY_URL=cloudinary://<key>:<secret>@<cloud>   # 사진 업로드 — 필수 (부팅 시 검증)
TELEGRAM_WEBHOOK_SECRET=<random-secret>              # 텔레그램 시세 수집 웹훅
HELPFUL_VOTE_PEPPER=<random-secret>                  # 도움돼요 중복 방지 해시
```

### 프론트엔드

```bash
cd FE
npm install
npm run dev                        # http://localhost:5173
```

`FE/.env`:

```text
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_KAKAO_REST_API_KEY=<kakao-rest-api-key>
```

### 카카오 로그인 설정

1. 카카오 디벨로퍼스 앱에서 카카오 로그인을 활성화하고 Client Secret을 발급·활성화합니다.
2. 동의 항목에서 닉네임을 설정합니다. 이메일 권한이 없어도 카카오 서비스 사용자 식별자로 가입할 수 있습니다.
3. Redirect URI에 실제 프론트엔드 origin별 콜백을 정확히 등록합니다.

```text
http://localhost:5173/auth/kakao/callback
https://fishnote.kr/auth/kakao/callback
https://www.fishnote.kr/auth/kakao/callback
```

REST API 키는 프론트와 백엔드에 같은 값을 설정합니다. Client Secret은 `KAKAO_CLIENT_SECRET`으로 백엔드에만 설정하며 저장소나 Vercel 환경변수에는 넣지 않습니다. 카카오가 검증된 이메일을 제공하면 기존 이메일 회원과 연결하고, 이메일이 없으면 카카오 식별자만으로 전용 계정을 만듭니다. 인가 코드는 백엔드가 토큰으로 교환한 뒤 기존 FishNote JWT를 발급합니다.

## API 요약

Base URL: `/api/v1` — 상세 명세는 [`docs/04_API명세.md`](docs/04_API명세.md)

- `GET /fish` — 목록 (search/season/taste/priceLevel/month/featured/sort)
- `GET /fish/{id}` — 상세 (갤러리·팁·별점 분포·비슷한 생선 포함)
- `GET /fish/{id}/prices?days=14` — 최근 상회 시세 (1~30일, 공개 필드만 제공)
- `GET /fish/{id}/reviews` · `POST /fish/{id}/reviews` — 후기 (익명 + 삭제용 비밀번호)
- `DELETE /reviews/{id}` · `POST /reviews/{id}/helpful`
- `DELETE /auth/me` — 비밀번호 확인 후 회원 탈퇴
- `POST /auth/kakao` — 카카오 인가 코드 검증 후 FishNote JWT 발급
- `POST /images` — 후기 사진 업로드 (Cloudinary 경유, 5MB 이하 image/*)

## 배포

| 영역 | 플랫폼 | 메모 |
|---|---|---|
| FE | Vercel | 루트 디렉터리 `FE`, 빌드 `npm run build` → `dist`. `vercel.json`이 SPA 라우팅 처리 |
| BE | Render (Web Service) | 루트 디렉터리 `BE`, Docker 빌드(`BE/Dockerfile`), `PORT` 자동 주입 |
| DB | Neon (serverless PostgreSQL) | 접속 정보를 Render 환경변수로 주입 |
| 이미지 | Cloudinary | `fishnote/reviews` 폴더 |
| 도메인 | fishnote.kr → Vercel | |

### Render 환경변수

```text
SPRING_DATASOURCE_URL=jdbc:postgresql://<neon-host>/<db>?sslmode=require
SPRING_DATASOURCE_USERNAME=<neon-role>
SPRING_DATASOURCE_PASSWORD=<neon-password>
APP_CORS_ALLOWED_ORIGINS=https://fishnote.kr,https://www.fishnote.kr,https://<vercel-project>.vercel.app
JWT_SECRET=<32-byte-or-longer-random-secret>
KAKAO_REST_API_KEY=<kakao-rest-api-key>
KAKAO_CLIENT_SECRET=<kakao-client-secret>
CLOUDINARY_URL=cloudinary://<key>:<secret>@<cloud>
TELEGRAM_WEBHOOK_SECRET=<random-secret>
HELPFUL_VOTE_PEPPER=<random-secret>
```

> ⚠️ `CLOUDINARY_URL`이 없으면 서버가 부팅되지 않습니다(fail-fast). **환경변수를 먼저 넣고 배포**하세요.

### Vercel 환경변수

```text
VITE_API_BASE_URL=https://<render-service>.onrender.com/api/v1
VITE_KAKAO_REST_API_KEY=<kakao-rest-api-key>
```

### 무료 티어 참고

- Render 무료 인스턴스는 15분 무접속 시 잠듭니다 → `.github/workflows/keep-warm.yml`이 10분마다 헬스체크로 깨워둡니다.
- Neon 무료 티어도 유휴 시 잠들어 첫 DB 쿼리가 ~1초 느릴 수 있습니다.

## 운영 팁

- DB 스키마와 초기 도감 데이터는 `BE/src/main/resources/db/migration/`의 Flyway 마이그레이션으로 관리합니다.
- 이미 적용된 마이그레이션은 수정하지 않고, 스키마·콘텐츠 변경마다 다음 버전(`V3__...sql`) 파일을 추가합니다.
- Hibernate는 운영 스키마를 직접 변경하지 않고 `validate`로 엔티티 매핑만 검증합니다.

## 데이터 수집

상회/카톡방 시세를 1차 가격으로 보고, 노량진 경락가와 KAMIS는 보조 검증용으로 사용합니다.

카카오톡 메시지를 복사한 뒤 클립보드에서 바로 CSV로 파싱할 수 있습니다.

```bash
python3 scripts/kakao_price_parser.py --clipboard --out data/shop-prices/2026-07-13.csv
```

대화 내보내기 `.txt` 파일도 지원합니다.

```bash
python3 scripts/kakao_price_parser.py ~/Downloads/kakao-export.txt --out data/shop-prices/2026-07-13.csv
```

- 기본 출력: `data/shop-prices/<input-name>.csv`
- 어종 매핑: `config/price_species_aliases.csv`
- 기본 파싱 시간대: 오전 6시~11시
- `raw_text`를 함께 저장해 오인식 값을 나중에 검수할 수 있습니다.

텔레그램 봇을 백엔드에 연결하면 CSV 파일을 만들지 않고 바로 DB에 저장할 수 있습니다.

```bash
curl "https://api.telegram.org/bot<bot-token>/setWebhook" \
  -d "url=https://<render-service>.onrender.com/api/v1/integrations/telegram/price-updates" \
  -d "secret_token=$TELEGRAM_WEBHOOK_SECRET"
```

운영 흐름:

1. BotFather에서 봇을 만들고 `<bot-token>`을 받습니다.
2. Render에 `TELEGRAM_WEBHOOK_SECRET`을 추가합니다.
3. 위 `setWebhook` 명령으로 봇을 백엔드 웹훅에 연결합니다.
4. 카카오톡 상회 시세표 전체 텍스트를 텔레그램 봇에게 전달합니다.
5. 백엔드는 `shop_price_observation`에 파싱 결과를 저장하고, 같은 텍스트는 중복 저장하지 않습니다.

`GET /fish/{id}/prices`는 가격·관측 시각·산지·규격·단위와 가격 비교에 필요한 출처·상회명을 공개합니다. 검수용 원문, 발화자, 원문 어종명은 API 응답에 포함하지 않습니다.

노량진 공식 경락시세도 CSV로 수집할 수 있습니다.

```bash
python3 scripts/noryangjin_price_scraper.py --date 2026-07-10
python3 scripts/noryangjin_price_scraper.py --date 2026-07-10 --species 참돔 --out data/noryangjin/chamdom.csv
```

- 기본 출력: `data/noryangjin/YYYY-MM-DD.csv`
- 어종 매핑: `config/noryangjin_species_aliases.csv`
- 원천: 노량진수산주식회사 `오늘의 경락시세`
