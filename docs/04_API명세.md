# FishBook — REST API 명세서

> Base URL: `/api/v1`  ·  Content-Type: `application/json`
> 모든 응답은 DTO 기반 JSON. 에러는 §6 표준 포맷.

---

## 1. 엔드포인트 요약

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/fish` | 생선 목록 (검색·필터·정렬) |
| GET | `/fish/{id}` | 생선 상세 (제철·맛·비슷한생선·후기요약 포함) |
| GET | `/fish/{id}/reviews` | 특정 생선 후기 목록 |
| POST | `/fish/{id}/reviews` | 후기 작성 |
| DELETE | `/reviews/{id}` | 후기 삭제 (비밀번호 확인) |

---

## 2. GET /fish — 목록

쿼리 파라미터 (모두 선택):
| 파라미터 | 타입 | 설명 |
|---|---|---|
| `search` | string | 이름 부분일치 |
| `season` | string | `spring`/`summer`/`fall`/`winter` |
| `taste` | string | 맛 태그 (예: 담백) |
| `priceLevel` | int | 1~3 |
| `sort` | string | `popular`(기본) / `name` |

응답 200:
```json
[
  {
    "id": 1,
    "name": "광어",
    "imageUrl": "https://.../gwangeo.jpg",
    "description": "담백하고 쫄깃한 국민 흰살회",
    "priceLevel": 2,
    "tasteTags": ["담백", "쫄깃"],
    "seasonMonths": [11, 12, 1, 2],
    "avgRating": 4.3,
    "reviewCount": 12
  }
]
```
> 목록은 요약 DTO(`FishSummaryResponse`). `avgRating`/`reviewCount`는 집계값.

---

## 3. GET /fish/{id} — 상세

응답 200:
```json
{
  "id": 1,
  "name": "광어",
  "nameEn": "Olive flounder",
  "imageUrl": "https://.../gwangeo.jpg",
  "description": "국민 흰살생선 회",
  "tasteDesc": "담백하고 쫄깃한 식감. 회 입문자에게 무난.",
  "tasteTags": ["담백", "쫄깃"],
  "seasonMonths": [11, 12, 1, 2],
  "priceLevel": 2,
  "avgRating": 4.3,
  "reviewCount": 12,
  "similarFishes": [
    { "id": 3, "name": "우럭", "imageUrl": "https://.../urok.jpg" },
    { "id": 6, "name": "도미", "imageUrl": "https://.../domi.jpg" }
  ]
}
```
- 없는 id → 404 (§6)

---

## 4. GET /fish/{id}/reviews — 후기 목록

쿼리(선택): `page`(기본 0), `size`(기본 20), `sort`=`latest`(기본)

응답 200:
```json
{
  "fishId": 1,
  "avgRating": 4.3,
  "totalCount": 12,
  "reviews": [
    {
      "id": 101,
      "nickname": "회러버",
      "rating": 5,
      "content": "쫄깃하고 최고예요",
      "imageUrl": null,
      "createdAt": "2026-07-01T12:30:00Z"
    }
  ]
}
```

---

## 5. POST /fish/{id}/reviews — 후기 작성

요청 body:
```json
{
  "nickname": "회러버",
  "rating": 5,
  "content": "쫄깃하고 최고예요",
  "imageUrl": null,
  "password": "1234"
}
```
검증 규칙:
- `nickname`: 필수, 1~30자
- `rating`: 선택, 1~5
- `content`: 필수, 1~1000자
- `password`: 필수, 4~20자 (삭제용, 해시 저장)

응답 201:
```json
{ "id": 101, "fishId": 1, "nickname": "회러버", "rating": 5, "content": "쫄깃하고 최고예요", "imageUrl": null, "createdAt": "2026-07-01T12:30:00Z" }
```
- 검증 실패 → 400 (§6)

---

## 6. DELETE /reviews/{id} — 후기 삭제

요청 body:
```json
{ "password": "1234" }
```
- 비밀번호 일치 → 204 No Content
- 불일치 → 403
- 없는 id → 404

---

## 7. 표준 에러 응답

```json
{
  "timestamp": "2026-07-01T12:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "content는 필수입니다.",
  "path": "/api/v1/fish/1/reviews"
}
```

| 상황 | 코드 |
|---|---|
| 검증 실패 | 400 |
| 비밀번호 불일치 | 403 |
| 리소스 없음 | 404 |
| 서버 오류 | 500 |

> 전역 처리: `@RestControllerAdvice` + `@ExceptionHandler`.

---

## 8. 설계 메모
- 목록=요약 DTO / 상세=풀 DTO로 분리해 페이로드 최적화.
- `avgRating`·`reviewCount`는 쿼리 집계(`@Query` 또는 JPQL). 초기엔 단순 계산, 트래픽 늘면 캐싱.
- `season` 파라미터(spring/…)는 BE에서 월 범위로 매핑 (봄=3~5, 여름=6~8, 가을=9~11, 겨울=12~2).

---

## 9. v1 확장 (디자인 시안 반영)

### 9-1. `GET /fish` 파라미터 추가
| 파라미터 | 타입 | 설명 |
|---|---|---|
| `month` | int (1~12) | 해당 월이 제철인 생선만 (제철 캘린더용) |
| `featured` | boolean | true면 EDITOR'S PICK만 |

`FishSummaryResponse`에 `featured` 필드 추가:
```json
{ "...": "...", "featured": true }
```

### 9-2. `GET /fish/{id}` 상세 응답 필드 추가
```json
{
  "...": "...(기존 필드)",
  "images": ["https://.../1.jpg", "https://.../2.jpg"],
  "tips": ["살짝 숙성하면 단맛이 올라와요", "초장보다 간장+고추냉이 추천"],
  "ratingDistribution": { "5": 7, "4": 3, "3": 1, "2": 0, "1": 1 }
}
```
- `images`: 갤러리(대표 이미지 포함, 순서대로). 없으면 `[imageUrl]`.
- `tips`: "이렇게 즐겨요" 항목(순서 보존).
- `ratingDistribution`: 별점별 후기 수(1~5).

### 9-3. `GET /fish/{id}/reviews` 변경
- 정렬 파라미터 `sort` 추가: `latest`(기본) / `helpful`.
- 응답에 `ratingDistribution` 추가, 각 리뷰에 `helpfulCount` 추가:
```json
{
  "fishId": 1, "avgRating": 4.3, "totalCount": 12,
  "ratingDistribution": { "5": 7, "4": 3, "3": 1, "2": 0, "1": 1 },
  "reviews": [
    { "id": 101, "nickname": "회러버", "rating": 5, "content": "...", "imageUrl": null, "helpfulCount": 4, "createdAt": "2026-07-01T12:30:00Z" }
  ]
}
```

### 9-4. `POST /reviews/{id}/helpful` — 도움돼요
- helpful_count 1 증가. (중복 방지는 프론트 localStorage로 1인 1회 제한)
- 응답 200:
```json
{ "id": 101, "helpfulCount": 5 }
```

### 9-5. 저장(북마크) — 백엔드 없음
- v1은 **프론트 localStorage**로 처리. 저장한 fish id 목록을 보관하고, "저장한 도감"은 그 id들을 `GET /fish` 결과에서 필터링(생선 수가 적어 클라이언트 필터로 충분).
- (선택) 다건 조회가 필요하면 `GET /fish?ids=1,3,5` 추가 가능.

### 9-6. 인기 검색 태그(히어로)
- 백엔드 불필요. 프론트 정적 목록(예: 광어, 방어, 연어, 참돔).
