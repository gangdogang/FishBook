# FishNote — Codex 구현 티켓

> 사용법: 위에서부터 **하나씩** Codex에 넘겨. 각 티켓의 "프롬프트" 블록을 복사하면 됨.
> 참고문서: `01_DB설계.md`, `03_구현_아키텍처.md`, `04_API명세.md`
> 순서 중요 — 백엔드(T1~T5) → 프론트(T6~T11) → 통합/배포(T12).

---

## 진행 체크리스트
- [x] T1 BE 프로젝트 셋업
- [x] T2 Fish 도메인 (엔티티/리포지토리/시드)
- [x] T3 Fish 조회 API (목록/상세)
- [x] T4 Review 도메인 + API
- [x] T5 전역 예외처리 + 검증
- [x] T6 FE 프로젝트 셋업
- [x] T7 타입 + API 클라이언트
- [x] T8 둘러보기(목록) 페이지
- [x] T9 상세 페이지
- [x] T10 후기 작성/삭제
- [x] T11 검색·필터 결과 페이지
- [ ] T12 배포 (Railway + Vercel)

---

# 백엔드

## T1 — BE 프로젝트 셋업
**목표**: Spring Boot 실행 + PostgreSQL 연결 + CORS 기본.
**프롬프트**:
> `BE/` 폴더에 Spring Boot 3.3 / Java 17 / Gradle 프로젝트를 만들어줘. 의존성은 Spring Web, Spring Data JPA, Validation, Lombok, PostgreSQL Driver. 패키지는 `com.fishnote`. `application.yml`에 PostgreSQL(fishnote DB) 접속을 환경변수(SPRING_DATASOURCE_*)로 받게 설정하고 `ddl-auto: update`. `config/CorsConfig`로 `http://localhost:5173` 허용. 루트 헬스체크 `GET /api/v1/health` → `{"status":"ok"}` 추가.

**DoD**: `./gradlew bootRun` 실행, `/api/v1/health` 200 응답, DB 연결 성공.

---

## T2 — Fish 도메인
**목표**: 생선 엔티티 + 컬렉션 + 리포지토리 + 시드.
**참고**: `01_DB설계.md` (DDL·JPA 매핑 노트)
**프롬프트**:
> `01_DB설계.md` 기준으로 `fish` 도메인을 구현해줘. `Fish` 엔티티(@Entity), 제철월/맛태그는 @ElementCollection, 비슷한 생선은 self @ManyToMany. `FishRepository`(JpaRepository). `resources/data.sql`에 광어·방어·우럭·참돔·연어·도미 6종 시드(제철·맛태그·가격대·소개 포함). 엔티티는 외부로 직접 노출하지 말 것(다음 티켓에서 DTO).

**DoD**: 앱 기동 시 테이블 생성 + 시드 6종 입력 확인(DB 조회).

---

## T3 — Fish 조회 API
**목표**: 목록(검색·필터·정렬) + 상세 API.
**참고**: `04_API명세.md` §2~§3
**프롬프트**:
> `04_API명세.md`의 `GET /fish`, `GET /fish/{id}`를 구현해줘. `FishSummaryResponse`(목록)·`FishDetailResponse`(상세) DTO 분리. 목록은 search/season/taste/priceLevel/sort 필터 지원(season은 봄3~5·여름6~8·가을9~11·겨울12~2로 월 매핑). avgRating·reviewCount 집계 포함(후기 없으면 0). Controller→Service→Repository 계층 준수. 없는 id는 404.

**DoD**: 목록/상세 API가 명세대로 JSON 반환, 필터 동작, 없는 id 404.

---

## T4 — Review 도메인 + API
**목표**: 후기 작성/조회/삭제.
**참고**: `01_DB설계.md`, `04_API명세.md` §4~§6
**프롬프트**:
> `review` 도메인을 구현해줘. `Review` 엔티티(fish와 @ManyToOne). API 3개: `GET /fish/{id}/reviews`(목록+avg+count, 페이지네이션), `POST /fish/{id}/reviews`(작성, @Valid 검증 — nickname 1~30, content 1~1000, rating 1~5, password 4~20), `DELETE /reviews/{id}`(body의 password 일치 시 204, 불일치 403). password는 해시 저장(BCrypt). DTO: `ReviewRequest`/`ReviewResponse`.

**DoD**: 후기 작성→조회→삭제 전체 흐름 동작, 검증 실패 400, 비번 불일치 403.

---

## T5 — 전역 예외처리 + 표준 응답
**목표**: 일관된 에러 포맷.
**참고**: `04_API명세.md` §7
**프롬프트**:
> `common` 패키지에 `@RestControllerAdvice` 전역 예외처리를 추가해줘. 검증 실패(400)·리소스 없음(404)·권한 불일치(403)·서버오류(500)를 `04_API명세.md §7` 표준 JSON 포맷으로 반환. 커스텀 예외(NotFoundException 등) 정의.

**DoD**: 각 에러 상황이 표준 포맷으로 응답.

---

# 프론트엔드

## T6 — FE 프로젝트 셋업
**목표**: React 개발 환경 + API 클라이언트 골격.
**프롬프트**:
> `FE/`에 Vite + React 18 + TypeScript 프로젝트를 만들어줘. Tailwind CSS, react-router-dom v6, @tanstack/react-query, axios 설치/설정. `src/api/client.ts`에 axios 인스턴스(baseURL = `import.meta.env.VITE_API_BASE_URL`). `.env`에 `VITE_API_BASE_URL=http://localhost:8080/api/v1`. App에 QueryClientProvider + 라우터(`/`, `/fish/:id`, `/search`) 골격.

**DoD**: `npm run dev` 실행, 3개 라우트 빈 페이지 렌더, BE health 호출 성공.

---

## T7 — 타입 + API 함수
**목표**: BE DTO와 맞는 타입 + 호출 함수 + 데이터 훅.
**참고**: `04_API명세.md`
**프롬프트**:
> `04_API명세.md` 기준으로 `src/types/`에 Fish/FishDetail/Review 타입, `src/api/fish.ts`·`review.ts`에 호출 함수, `src/hooks/`에 TanStack Query 훅(useFishList, useFishDetail, useReviews) 작성. 목록 페이지에서 useFishList로 데이터 받아 임시 렌더해 연동 확인.

**DoD**: 목록 API 데이터가 화면에 출력(연동 검증).

---

## T8 — 둘러보기(목록) 페이지
**목표**: 디자인 반영된 홈 화면.
**참고**: 클로드 디자인 산출물(시안), `02_디자인_프롬프트.md` 토큰
**프롬프트**:
> 디자인 시안 기준으로 HomePage를 구현해줘. SearchBar, 제철/맛 FilterChips, FishCard 그리드(사진·이름·제철뱃지·소개·맛태그·가격대·별점). Teal 토큰(#0F9488 등) 적용, 반응형. 카드 클릭 → `/fish/:id`. 필터/검색은 useFishList 쿼리 파라미터에 연결.

**DoD**: 시안과 유사한 목록 화면, 필터·검색 동작, 카드 클릭 이동.

---

## T9 — 상세 페이지
**목표**: 생선 상세 + 후기 섹션.
**참고**: `04_API명세.md` §3~§4
**프롬프트**:
> FishDetailPage를 구현해줘. 대표사진, 이름(국/영), 제철뱃지, 가격대, 평균별점, 맛 설명/태그, 제철 정보 시각화(SeasonBar — 12개월 막대), 비슷한 생선 가로 카드, 후기 목록(ReviewList). useFishDetail·useReviews 사용.

**DoD**: 상세 데이터 표시, 비슷한 생선 클릭 이동, 후기 목록 표시.

---

## T10 — 후기 작성/삭제
**목표**: 후기 폼 + 뮤테이션.
**참고**: `04_API명세.md` §5~§6
**프롬프트**:
> ReviewForm(닉네임·별점·내용·이미지URL·삭제용 비밀번호)을 모달로 구현하고 POST 연동(react-query mutation). 작성 성공 시 목록 갱신(invalidate). 각 후기에 삭제 버튼 → 비밀번호 입력 후 DELETE 연동. 검증·에러 메시지 표시.

**DoD**: 후기 작성→즉시 목록 반영, 삭제 동작, 검증 에러 표시.

---

## T11 — 검색·필터 결과 페이지
**목표**: 검색 결과 + 빈 상태.
**프롬프트**:
> SearchPage를 구현해줘. 상단/사이드 필터(제철·맛·가격대), 결과 개수, 정렬(인기순/이름순), 결과 카드 그리드. 결과 없을 때 empty state. URL 쿼리스트링과 필터 상태 동기화.

**DoD**: 필터 조합 검색 동작, 빈 상태 표시, URL 공유 가능.

---

# 통합 / 배포

## T12 — 배포
**목표**: 운영 환경 배포 + 도메인 연결.
**참고**: `03_구현_아키텍처.md` §7~§8
**프롬프트**:
> 배포를 설정해줘. (1) Railway에 PostgreSQL + BE(Spring Boot) 배포, 환경변수로 DB 접속 주입, 운영 CORS에 Vercel/도메인 오리진 추가. (2) Vercel에 FE 배포, `VITE_API_BASE_URL`을 운영 BE 주소로. (3) 구매한 도메인을 Vercel에 연결(BE는 api 서브도메인 권장). 배포 절차를 README에 정리.

**DoD**: 운영 URL에서 목록·상세·후기 전 기능 동작, 도메인 접속 OK.

---

## 작업 팁
- 각 티켓 끝나면 체크리스트 체크 + 커밋(`feat(be): fish 조회 API` 식).
- BE 먼저 완성하면 FE가 실제 데이터로 개발돼서 수월함.
- 막히면 해당 티켓 + 참고문서 섹션을 Codex에 같이 주면 정확도 올라감.
