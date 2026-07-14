-- ============================================================
-- 시세 수집 대상인데 도감에 없던 8종 추가 (id 20~27)
-- : 가자미, 붉바리, 능성어, 자바리, 전복, 시마아지, 어름돔, 점성어
-- 배경: ShopPriceParser가 인식하는 어종 중 fish 테이블에 없는 종은
--       시세(shop_price_observation)가 fish_id = NULL로 쌓여 UI에 노출되지 않음.
-- ⚠️ 제철·맛 정보는 통용 상식 기준으로 작성됨. 출처 검증 전 상태이며
--    BACKLOG.md P1-1(데이터 출처 확보)에서 전수 교차검증·교정 예정.
-- ============================================================

INSERT INTO fish (id, name, name_en, image_url, taste_desc, price_level, featured, description, created_at)
VALUES
    (20, '가자미', 'Flatfish', NULL, '담백하고 쫄깃하며 씹을수록 은은한 단맛이 올라옵니다. 뼈째 썰어 먹는 세꼬시로도 인기가 많아요.', 1, false, '도다리와 형제뻘인 담백한 흰살 횟감', now()),
    (21, '붉바리', 'Red spotted grouper', NULL, '탄력 있는 살에 진한 감칠맛 — 바리류 중에서도 손꼽히는 귀한 어종입니다.', 3, false, '귀해서 더 유명한 최고급 바리류', now()),
    (22, '능성어', 'Sevenband grouper', NULL, '단단하고 쫄깃한 살에 은은한 단맛과 깊은 감칠맛이 있습니다. 제주에서는 구문쟁이로도 불려요.', 3, false, '제주에서 구문쟁이로 불리는 고급 바리류', now()),
    (23, '자바리', 'Longtooth grouper', NULL, '차지고 탄력 있는 살에 깊은 감칠맛 — 제주에서는 다금바리라는 이름으로 최고급 대접을 받습니다.', 3, false, '제주 다금바리로 불리는 최고급 횟감', now()),
    (24, '전복', 'Abalone', NULL, '오독오독한 식감과 은은한 단맛, 특유의 바다향이 매력입니다. 양식이 활발해 연중 즐길 수 있어요.', 3, false, '오독오독 씹는 맛의 바다 보양 별미', now()),
    (25, '시마아지', 'White trevally', NULL, '전갱이류 특유의 고소한 기름기와 쫄깃한 식감이 좋아 스시집에서 인기가 많습니다.', 3, false, '스시집 단골 고급 흰살, 줄무늬전갱이', now()),
    (26, '어름돔', 'Crescent sweetlips', NULL, '흰살이 단단하고 담백하며 은은한 감칠맛이 있는 귀한 어종입니다.', 3, false, '시장에서 가끔 만나는 귀한 돔', now()),
    (27, '점성어', 'Red drum', NULL, '민어와 비슷한 결의 담백하고 부드러운 맛. 양식이라 연중 가격이 안정적입니다.', 1, false, '민어를 닮은 가성비 대중 횟감', now())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    name_en = EXCLUDED.name_en,
    image_url = EXCLUDED.image_url,
    taste_desc = EXCLUDED.taste_desc,
    price_level = EXCLUDED.price_level,
    featured = EXCLUDED.featured,
    description = EXCLUDED.description;

INSERT INTO fish_season_month (fish_id, month) VALUES
    (20, 11), (20, 12), (20, 1), (20, 2),
    (21, 6), (21, 7), (21, 8),
    (22, 9), (22, 10), (22, 11),
    (23, 6), (23, 7), (23, 8),
    (24, 1), (24, 2), (24, 3), (24, 4), (24, 5), (24, 6),
    (24, 7), (24, 8), (24, 9), (24, 10), (24, 11), (24, 12),
    (25, 6), (25, 7), (25, 8),
    (26, 6), (26, 7), (26, 8),
    (27, 1), (27, 2), (27, 3), (27, 4), (27, 5), (27, 6),
    (27, 7), (27, 8), (27, 9), (27, 10), (27, 11), (27, 12)
ON CONFLICT DO NOTHING;

INSERT INTO fish_taste_tag (fish_id, tag) VALUES
    (20, '담백'), (20, '쫄깃'),
    (21, '쫄깃'), (21, '감칠맛'), (21, '고급'),
    (22, '쫄깃'), (22, '담백'), (22, '고급'),
    (23, '쫄깃'), (23, '감칠맛'), (23, '고급'),
    (24, '쫄깃'), (24, '단맛'),
    (25, '고소'), (25, '기름진'), (25, '쫄깃'),
    (26, '담백'), (26, '쫄깃'),
    (27, '담백'), (27, '부드러운')
ON CONFLICT DO NOTHING;

INSERT INTO fish_similar (fish_id, similar_fish_id) VALUES
    (20, 10), (10, 20),
    (20, 1),
    (21, 23), (23, 21),
    (21, 22), (22, 21),
    (22, 23), (23, 22),
    (24, 12),
    (25, 2), (2, 25),
    (26, 12), (12, 26),
    (27, 7), (7, 27)
ON CONFLICT DO NOTHING;

INSERT INTO fish_tip (fish_id, tip_order, content) VALUES
    (20, 0, '뼈째 썰기(세꼬시)로 먹으면 고소함이 배가돼요'),
    (20, 1, '도다리와 헷갈리기 쉬워요 — 눈이 오른쪽이면 가자미류랍니다'),
    (21, 0, '귀한 만큼 껍질·부레 같은 특수부위도 챙겨보세요'),
    (21, 1, '하루 정도 숙성하면 감칠맛이 더 깊어져요'),
    (22, 0, '살이 단단해 얇게 썰어야 식감이 살아나요'),
    (22, 1, '남은 뼈와 머리는 맑은탕으로 끓이면 국물이 진해요'),
    (23, 0, '부위별(뱃살·목살·껍질)로 나눠 내는 집이 진짜예요'),
    (23, 1, '제주 다금바리 이름으로 팔릴 땐 자바리인지 확인해보세요'),
    (24, 0, '내장(게우)은 고소해서 죽이나 젓갈로 즐겨요'),
    (24, 1, '얇게 썰수록 부드럽고, 도톰하게 썰수록 오독한 맛이에요'),
    (25, 0, '기름기가 좋은 뱃살부터 맛보세요'),
    (25, 1, '간장보다 소금+와사비가 고소함을 살려줘요'),
    (26, 0, '단단한 흰살이라 살짝 숙성하면 부드러워져요'),
    (26, 1, '만나기 어려운 어종이니 보이면 한 번 도전해보세요'),
    (27, 0, '민어로 혼동되기 쉬우니 메뉴 표기를 확인하고 드세요'),
    (27, 1, '가격이 부담 없어 모둠회에서 자주 만나는 생선이에요')
ON CONFLICT (fish_id, tip_order) DO UPDATE SET
    content = EXCLUDED.content;

-- 그동안 도감에 없어서 fish_id 없이 쌓인 시세를 새 어종에 연결 (백필)
UPDATE shop_price_observation o
SET fish_id = f.id
FROM fish f
WHERE o.fish_id IS NULL
  AND o.canonical_fish_name = f.name;

-- 감성돔 시세 교정: 파서가 감성돔을 참돔 별칭으로 잘못 묶어 참돔 시세로 저장돼 있었음.
-- (파서 별칭도 함께 수정됨 — ShopPriceParser.buildAliases)
UPDATE shop_price_observation
SET canonical_fish_name = '감성돔',
    fish_id = (SELECT id FROM fish WHERE name = '감성돔')
WHERE reported_name = '감성돔';

SELECT setval('fish_id_seq', (SELECT MAX(id) FROM fish));
