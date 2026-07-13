package com.fishnote.price;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ParsedShopPrice(
        OffsetDateTime observedAt,
        String sourceType,
        String sourceName,
        String speaker,
        String canonicalFishName,
        String reportedName,
        String condition,
        String origin,
        String sizeGrade,
        String unit,
        int priceMinKrw,
        int priceMaxKrw,
        BigDecimal confidence,
        String rawText) {}
