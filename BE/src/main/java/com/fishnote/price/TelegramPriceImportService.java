package com.fishnote.price;

import com.fishnote.fish.Fish;
import com.fishnote.fish.FishRepository;
import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TelegramPriceImportService {

    private final ShopPriceParser parser;
    private final ShopPriceObservationRepository shopPriceObservationRepository;
    private final FishRepository fishRepository;

    public TelegramPriceImportService(
            ShopPriceParser parser,
            ShopPriceObservationRepository shopPriceObservationRepository,
            FishRepository fishRepository) {
        this.parser = parser;
        this.shopPriceObservationRepository = shopPriceObservationRepository;
        this.fishRepository = fishRepository;
    }

    @Transactional
    public TelegramPriceImportResponse importText(String text, OffsetDateTime fallbackObservedAt) {
        List<ParsedShopPrice> parsedRows = parser.parse(text, fallbackObservedAt);
        int savedCount = 0;
        LinkedHashSet<String> sourceNames = new LinkedHashSet<>();

        for (ParsedShopPrice row : parsedRows) {
            if (!row.sourceName().isBlank()) {
                sourceNames.add(row.sourceName());
            }
            if (shopPriceObservationRepository.existsDuplicate(
                    row.observedAt(),
                    row.sourceType(),
                    row.sourceName(),
                    row.reportedName(),
                    row.priceMinKrw(),
                    row.priceMaxKrw(),
                    row.rawText())) {
                continue;
            }

            shopPriceObservationRepository.save(toEntity(row));
            savedCount++;
        }

        return new TelegramPriceImportResponse(parsedRows.size(), savedCount, List.copyOf(sourceNames));
    }

    private ShopPriceObservation toEntity(ParsedShopPrice row) {
        ShopPriceObservation observation = new ShopPriceObservation();
        observation.setFish(findFish(row.canonicalFishName()));
        observation.setObservedAt(row.observedAt());
        observation.setSourceType(row.sourceType());
        observation.setSourceName(blankToNull(row.sourceName()));
        observation.setSpeaker(blankToNull(row.speaker()));
        observation.setCanonicalFishName(blankToNull(row.canonicalFishName()));
        observation.setReportedName(row.reportedName());
        observation.setCondition(blankToNull(row.condition()));
        observation.setOrigin(blankToNull(row.origin()));
        observation.setSizeGrade(blankToNull(row.sizeGrade()));
        observation.setUnit(blankToNull(row.unit()));
        observation.setPriceMinKrw(row.priceMinKrw());
        observation.setPriceMaxKrw(row.priceMaxKrw());
        observation.setConfidence(row.confidence());
        observation.setRawText(row.rawText());
        return observation;
    }

    private Fish findFish(String canonicalFishName) {
        if (canonicalFishName == null || canonicalFishName.isBlank()) {
            return null;
        }
        return fishRepository.findByName(canonicalFishName).orElse(null);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
