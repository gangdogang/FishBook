package com.fishnote.fish;

import java.util.Locale;
import java.util.Set;
import org.springframework.data.jpa.domain.Specification;

/**
 * 생선 목록 필터를 DB 쿼리(WHERE)로 내리는 Specification 모음.
 * 전체 로드 후 인메모리 필터링 대신 인덱스(idx_season_month, idx_taste_tag 등)를 활용한다.
 */
public final class FishSpecifications {

    private FishSpecifications() {
    }

    /** name 또는 nameEn 부분 일치 (대소문자 무시) */
    public static Specification<Fish> matchesSearch(String keyword) {
        String pattern = "%" + escapeLike(keyword.toLowerCase(Locale.ROOT)) + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), pattern, '\\'),
                cb.like(cb.lower(root.get("nameEn")), pattern, '\\'));
    }

    /** 제철 월이 주어진 월 집합(계절)과 하나라도 겹침 */
    public static Specification<Fish> inSeasonMonths(Set<Short> months) {
        return (root, query, cb) -> {
            query.distinct(true);
            return root.join("seasonMonths").in(months);
        };
    }

    /** 특정 월이 제철에 포함 */
    public static Specification<Fish> inMonth(Short month) {
        return (root, query, cb) -> {
            query.distinct(true);
            return cb.equal(root.join("seasonMonths"), month);
        };
    }

    public static Specification<Fish> hasTasteTag(String taste) {
        return (root, query, cb) -> {
            query.distinct(true);
            return cb.equal(root.join("tasteTags"), taste);
        };
    }

    public static Specification<Fish> hasPriceLevel(Short priceLevel) {
        return (root, query, cb) -> cb.equal(root.get("priceLevel"), priceLevel);
    }

    public static Specification<Fish> isFeatured() {
        return (root, query, cb) -> cb.isTrue(root.get("featured"));
    }

    private static String escapeLike(String keyword) {
        return keyword
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
    }
}
