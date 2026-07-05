package com.fishnote.fish;

import com.fishnote.fish.dto.FishDetailResponse;
import com.fishnote.fish.dto.FishSummaryResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/fish")
public class FishController {

    private final FishService fishService;

    public FishController(FishService fishService) {
        this.fishService = fishService;
    }

    @GetMapping
    public List<FishSummaryResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String season,
            @RequestParam(required = false) String taste,
            @RequestParam(required = false) Short priceLevel,
            @RequestParam(required = false) Short month,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(defaultValue = "popular") String sort) {
        return fishService.findFishes(search, season, taste, priceLevel, month, featured, sort);
    }

    @GetMapping("/{id}")
    public FishDetailResponse detail(@PathVariable Long id) {
        return fishService.getFish(id);
    }
}
