package com.fishnote.price;

import com.fishnote.price.dto.FishPriceSummaryResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/fish/{fishId}/prices")
public class FishPriceController {

    private final FishPriceQueryService fishPriceQueryService;

    public FishPriceController(FishPriceQueryService fishPriceQueryService) {
        this.fishPriceQueryService = fishPriceQueryService;
    }

    @GetMapping
    public FishPriceSummaryResponse recentPrices(
            @PathVariable Long fishId, @RequestParam(required = false) Integer days) {
        return fishPriceQueryService.getRecentPrices(fishId, days);
    }
}
