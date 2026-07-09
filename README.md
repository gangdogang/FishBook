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
CLOUDINARY_URL=cloudinary://<key>:<secret>@<cloud>   # 사진 업로드 — 필수 (부팅 시 검증)
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
```

## API 요약

Base URL: `/api/v1` — 상세 명세는 [`docs/04_API명세.md`](docs/04_API명세.md)

- `GET /fish` — 목록 (search/season/taste/priceLevel/month/featured/sort)
- `GET /fish/{id}` — 상세 (갤러리·팁·별점 분포·비슷한 생선 포함)
- `GET /fish/{id}/reviews` · `POST /fish/{id}/reviews` — 후기 (익명 + 삭제용 비밀번호)
- `DELETE /reviews/{id}` · `POST /reviews/{id}/helpful`
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
CLOUDINARY_URL=cloudinary://<key>:<secret>@<cloud>
```

> ⚠️ `CLOUDINARY_URL`이 없으면 서버가 부팅되지 않습니다(fail-fast). **환경변수를 먼저 넣고 배포**하세요.

### Vercel 환경변수

```text
VITE_API_BASE_URL=https://<render-service>.onrender.com/api/v1
```

### 무료 티어 참고

- Render 무료 인스턴스는 15분 무접속 시 잠듭니다 → `.github/workflows/keep-warm.yml`이 10분마다 헬스체크로 깨워둡니다.
- Neon 무료 티어도 유휴 시 잠들어 첫 DB 쿼리가 ~1초 느릴 수 있습니다.

## 운영 팁

- 시드 데이터는 `BE/src/main/resources/data.sql` — 부팅마다 실행되므로 멱등(UPSERT/가드 DELETE)으로 유지할 것.
- 생선/서비스 데이터 변경은 data.sql 수정 → push → 자동 배포로 반영됩니다.
