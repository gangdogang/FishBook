package com.fishnote.fish;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FishRepository extends JpaRepository<Fish, Long> {

    @Override
    @EntityGraph(attributePaths = {"seasonMonths", "tasteTags", "similarFishes"})
    List<Fish> findAll();

    // 상세 조회도 핵심 컬렉션을 한 쿼리로 함께 로딩 (원거리 DB 왕복 최소화)
    @EntityGraph(attributePaths = {"seasonMonths", "tasteTags", "similarFishes"})
    @Query("select f from Fish f where f.id = :id")
    Optional<Fish> findDetailById(@Param("id") Long id);
}
