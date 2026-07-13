package com.fishnote.price;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.MissingNode;
import com.fishnote.common.UnauthorizedException;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/integrations/telegram")
public class TelegramPriceWebhookController {

    private static final String TELEGRAM_SECRET_HEADER = "X-Telegram-Bot-Api-Secret-Token";

    private final TelegramPriceImportService telegramPriceImportService;
    private final String webhookSecret;

    public TelegramPriceWebhookController(
            TelegramPriceImportService telegramPriceImportService,
            @Value("${app.telegram.webhook-secret:}") String webhookSecret) {
        this.telegramPriceImportService = telegramPriceImportService;
        this.webhookSecret = webhookSecret;
    }

    @PostMapping("/price-updates")
    public ResponseEntity<TelegramPriceImportResponse> receivePriceUpdate(
            @RequestHeader HttpHeaders headers, @RequestBody JsonNode update) {
        verifySecret(headers.getFirst(TELEGRAM_SECRET_HEADER));

        JsonNode message = extractMessage(update);
        String text = extractText(message);
        if (text.isBlank()) {
            return ResponseEntity.ok(new TelegramPriceImportResponse(0, 0, List.of()));
        }

        TelegramPriceImportResponse response =
                telegramPriceImportService.importText(text, extractObservedAt(message));
        return ResponseEntity.ok(response);
    }

    private void verifySecret(String requestSecret) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            throw new UnauthorizedException("TELEGRAM_WEBHOOK_SECRET is not configured.");
        }
        if (!webhookSecret.equals(requestSecret)) {
            throw new UnauthorizedException("Invalid Telegram webhook secret.");
        }
    }

    private JsonNode extractMessage(JsonNode update) {
        for (String field : List.of("message", "edited_message", "channel_post", "edited_channel_post")) {
            JsonNode message = update.path(field);
            if (!message.isMissingNode() && !message.isNull()) {
                return message;
            }
        }
        return MissingNode.getInstance();
    }

    private String extractText(JsonNode message) {
        if (message.path("text").isTextual()) {
            return message.path("text").asText();
        }
        if (message.path("caption").isTextual()) {
            return message.path("caption").asText();
        }
        return "";
    }

    private OffsetDateTime extractObservedAt(JsonNode message) {
        if (message.path("date").canConvertToLong()) {
            return Instant.ofEpochSecond(message.path("date").asLong()).atOffset(ShopPriceParser.KST);
        }
        return OffsetDateTime.now(ShopPriceParser.KST);
    }
}
