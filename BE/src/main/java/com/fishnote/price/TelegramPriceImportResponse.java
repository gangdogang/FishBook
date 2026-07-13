package com.fishnote.price;

import java.util.List;

public record TelegramPriceImportResponse(int parsedCount, int savedCount, List<String> sourceNames) {}
