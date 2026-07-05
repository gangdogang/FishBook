package com.fishnote.fish;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fishnote.review.Review;
import com.fishnote.review.ReviewRepository;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FishControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private FishRepository fishRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        reviewRepository.deleteAll();
        fishRepository.deleteAll();
        Fish flounder = fish("광어", false, (short) 2, Set.of((short) 12, (short) 1), Set.of("담백", "쫄깃"));
        flounder.getImages().addAll(List.of("광어 갤러리 1", "광어 갤러리 2", "광어 갤러리 3"));
        flounder.getTips().addAll(List.of("첫 번째 팁", "두 번째 팁"));
        Fish yellowtail = fish("방어", true, (short) 3, Set.of((short) 12, (short) 1), Set.of("고소", "기름진"));
        Fish seabream = fish("참돔", true, (short) 3, Set.of((short) 4, (short) 5), Set.of("담백", "고급"));
        flounder.getSimilarFishes().addAll(Set.of(yellowtail, seabream));
        fishRepository.save(yellowtail);
        fishRepository.save(seabream);
        fishRepository.save(flounder);
    }

    @Test
    void featuredTrueReturnsOnlyEditorsPicksAndIncludesFeaturedField() throws Exception {
        mockMvc.perform(get("/api/v1/fish")
                        .param("featured", "true")
                        .param("sort", "name"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].name", containsInAnyOrder("방어", "참돔")))
                .andExpect(jsonPath("$[*].featured", everyItem(is(true))))
                .andExpect(jsonPath("$[0]", hasKey("featured")));
    }

    @Test
    void monthReturnsOnlyFishesInSeasonForThatMonth() throws Exception {
        mockMvc.perform(get("/api/v1/fish")
                        .param("month", "12")
                        .param("sort", "name"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].name", containsInAnyOrder("광어", "방어")));
    }

    @Test
    void featuredAndMonthCombineWithExistingFilters() throws Exception {
        mockMvc.perform(get("/api/v1/fish")
                        .param("featured", "true")
                        .param("month", "12")
                        .param("taste", "고소")
                        .param("priceLevel", "3")
                        .param("sort", "name"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name", is("방어")))
                .andExpect(jsonPath("$[0].featured", is(true)))
                .andExpect(jsonPath("$.length()", is(1)));
    }

    @Test
    void detailIncludesTipsInStoredOrder() throws Exception {
        Fish fish = fishRepository.findAll().stream()
                .filter(savedFish -> savedFish.getName().equals("광어"))
                .findFirst()
                .orElseThrow();

        mockMvc.perform(get("/api/v1/fish/{id}", fish.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tips[0]", is("첫 번째 팁")))
                .andExpect(jsonPath("$.tips[1]", is("두 번째 팁")))
                .andExpect(jsonPath("$.tips.length()", is(2)));
    }

    @Test
    void detailIncludesImagesInStoredOrder() throws Exception {
        Fish fish = fishRepository.findAll().stream()
                .filter(savedFish -> savedFish.getName().equals("광어"))
                .findFirst()
                .orElseThrow();

        mockMvc.perform(get("/api/v1/fish/{id}", fish.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.images[0]", is("광어 갤러리 1")))
                .andExpect(jsonPath("$.images[1]", is("광어 갤러리 2")))
                .andExpect(jsonPath("$.images[2]", is("광어 갤러리 3")))
                .andExpect(jsonPath("$.images.length()", is(3)));
    }

    @Test
    void detailFallsBackToImageUrlWhenGalleryImagesAreEmpty() throws Exception {
        Fish fish = fishRepository.findAll().stream()
                .filter(savedFish -> savedFish.getName().equals("방어"))
                .findFirst()
                .orElseThrow();

        mockMvc.perform(get("/api/v1/fish/{id}", fish.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.images[0]", is("방어 대표 이미지")))
                .andExpect(jsonPath("$.images.length()", is(1)));
    }

    @Test
    void detailIncludesRatingDistributionMatchingReviewCount() throws Exception {
        Fish fish = fishRepository.findAll().stream()
                .filter(savedFish -> savedFish.getName().equals("광어"))
                .findFirst()
                .orElseThrow();
        reviewRepository.save(review(fish, 5));
        reviewRepository.save(review(fish, 4));
        reviewRepository.save(review(fish, 1));

        String response = mockMvc.perform(get("/api/v1/fish/{id}", fish.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reviewCount", is(3)))
                .andExpect(jsonPath("$.ratingDistribution['5']", is(1)))
                .andExpect(jsonPath("$.ratingDistribution['4']", is(1)))
                .andExpect(jsonPath("$.ratingDistribution['3']", is(0)))
                .andExpect(jsonPath("$.ratingDistribution['2']", is(0)))
                .andExpect(jsonPath("$.ratingDistribution['1']", is(1)))
                .andReturn()
                .getResponse()
                .getContentAsString();

        var root = objectMapper.readTree(response);
        int distributionSum = root.get("ratingDistribution").get("5").asInt()
                + root.get("ratingDistribution").get("4").asInt()
                + root.get("ratingDistribution").get("3").asInt()
                + root.get("ratingDistribution").get("2").asInt()
                + root.get("ratingDistribution").get("1").asInt();
        assertThat(distributionSum).isEqualTo(root.get("reviewCount").asInt());
    }

    @Test
    void detailIncludesExpandedSimilarFishFields() throws Exception {
        Fish flounder = fishRepository.findAll().stream()
                .filter(savedFish -> savedFish.getName().equals("광어"))
                .findFirst()
                .orElseThrow();
        Fish yellowtail = fishRepository.findAll().stream()
                .filter(savedFish -> savedFish.getName().equals("방어"))
                .findFirst()
                .orElseThrow();
        reviewRepository.save(review(yellowtail, 5));
        reviewRepository.save(review(yellowtail, 4));

        mockMvc.perform(get("/api/v1/fish/{id}", flounder.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.similarFishes.length()", is(2)))
                .andExpect(jsonPath("$.similarFishes[0].name", is("방어")))
                .andExpect(jsonPath("$.similarFishes[0].priceLevel", is(3)))
                .andExpect(jsonPath("$.similarFishes[0].avgRating", is(4.5)))
                .andExpect(jsonPath("$.similarFishes[0].seasonMonths", containsInAnyOrder(1, 12)))
                .andExpect(jsonPath("$.similarFishes[1].name", is("참돔")))
                .andExpect(jsonPath("$.similarFishes[1].priceLevel", is(3)))
                .andExpect(jsonPath("$.similarFishes[1].avgRating", is(0.0)))
                .andExpect(jsonPath("$.similarFishes[1].seasonMonths", containsInAnyOrder(4, 5)));
    }

    private Fish fish(String name, boolean featured, Short priceLevel, Set<Short> seasonMonths, Set<String> tasteTags) {
        Fish fish = new Fish();
        fish.setName(name);
        fish.setNameEn(name);
        fish.setImageUrl(name + " 대표 이미지");
        fish.setDescription(name + " 설명");
        fish.setPriceLevel(priceLevel);
        fish.setFeatured(featured);
        fish.getSeasonMonths().addAll(seasonMonths);
        fish.getTasteTags().addAll(tasteTags);
        return fish;
    }

    private Review review(Fish fish, int rating) {
        Review review = new Review();
        review.setFish(fish);
        review.setNickname("테스터" + rating);
        review.setRating((short) rating);
        review.setContent("별점 " + rating + " 후기");
        review.setPasswordHash("password-hash");
        return review;
    }
}
