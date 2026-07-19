-- 제철 교정 — 어식백세(해수부 '이달의 수산물') 2017~2026 지정 이력 108건 분석 기반
-- 근거·방법론: docs/12_어식백세_지정이력.md

-- ① 가자미(id 20): 겨울(11~2월) → 봄(3~6월)
--    정부 지정이 3·4·5·6월에 4회 — 기존 겨울 값은 오류로 판정.
DELETE FROM fish_season_month WHERE fish_id = 20;
INSERT INTO fish_season_month (fish_id, month) VALUES
    (20, 3), (20, 4), (20, 5), (20, 6);

-- ② 감성돔(id 11): 11~2월 → 10~2월 확장
--    2024년 10월 정부 지정 + 해수부 보도자료(10월 제철 물고기 소개) 근거.
INSERT INTO fish_season_month (fish_id, month)
SELECT 11, 10
WHERE NOT EXISTS (SELECT 1 FROM fish_season_month WHERE fish_id = 11 AND month = 10);
