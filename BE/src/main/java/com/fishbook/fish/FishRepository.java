package com.fishbook.fish;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FishRepository extends JpaRepository<Fish, Long> {

    @Override
    @EntityGraph(attributePaths = {"seasonMonths", "tasteTags", "similarFishes"})
    List<Fish> findAll();
}
