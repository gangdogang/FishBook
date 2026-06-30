package com.fishbook.review;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fishbook.fish.Fish;
import com.fishbook.fish.FishRepository;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
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
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private FishRepository fishRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Fish fish;

    @BeforeEach
    void setUp() {
        reviewRepository.deleteAll();
        fishRepository.deleteAll();
        fish = fishRepository.save(fish("광어"));
    }

    @AfterEach
    void tearDown() {
        reviewRepository.deleteAll();
        fishRepository.deleteAll();
    }

    @Test
    void helpfulIncrementsCountAndReviewListIncludesHelpfulCount() throws Exception {
        Review review = reviewRepository.save(review(fish, "회러버", 5, 4));

        mockMvc.perform(post("/api/v1/reviews/{id}/helpful", review.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(review.getId().intValue())))
                .andExpect(jsonPath("$.helpfulCount", is(5)));

        mockMvc.perform(get("/api/v1/fish/{id}/reviews", fish.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reviews[0].id", is(review.getId().intValue())))
                .andExpect(jsonPath("$.reviews[0].helpfulCount", is(5)));
    }

    @Test
    void helpfulSortReturnsHigherHelpfulCountFirst() throws Exception {
        reviewRepository.save(review(fish, "낮은추천", 4, 1));
        Review popular = reviewRepository.save(review(fish, "높은추천", 5, 8));

        mockMvc.perform(get("/api/v1/fish/{id}/reviews", fish.getId())
                        .param("sort", "helpful"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reviews[0].id", is(popular.getId().intValue())))
                .andExpect(jsonPath("$.reviews[0].helpfulCount", is(8)));
    }

    @Test
    void reviewListIncludesRatingDistributionWithZeroBucketsAndTotalCountSum() throws Exception {
        reviewRepository.save(review(fish, "별다섯1", 5, 0));
        reviewRepository.save(review(fish, "별다섯2", 5, 0));
        reviewRepository.save(review(fish, "별셋", 3, 0));
        reviewRepository.save(review(fish, "별하나", 1, 0));

        String response = mockMvc.perform(get("/api/v1/fish/{id}/reviews", fish.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCount", is(4)))
                .andExpect(jsonPath("$.ratingDistribution['5']", is(2)))
                .andExpect(jsonPath("$.ratingDistribution['4']", is(0)))
                .andExpect(jsonPath("$.ratingDistribution['3']", is(1)))
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
        assertThat(distributionSum).isEqualTo(root.get("totalCount").asInt());
    }

    private Fish fish(String name) {
        Fish fish = new Fish();
        fish.setName(name);
        fish.setNameEn(name);
        fish.setDescription(name + " 설명");
        fish.setPriceLevel((short) 2);
        fish.getSeasonMonths().addAll(Set.of((short) 1, (short) 12));
        fish.getTasteTags().addAll(Set.of("담백", "쫄깃"));
        return fish;
    }

    private Review review(Fish fish, String nickname, int rating, int helpfulCount) {
        Review review = new Review();
        review.setFish(fish);
        review.setNickname(nickname);
        review.setRating((short) rating);
        review.setContent(nickname + " 후기");
        review.setPasswordHash("password-hash");
        review.setHelpfulCount(helpfulCount);
        return review;
    }
}
