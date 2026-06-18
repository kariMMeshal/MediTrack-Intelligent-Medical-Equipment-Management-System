package com.MediTrack.meditrack_backend.Ai_Module;

import com.MediTrack.meditrack_backend.Ai_Module.dto.RfFlaskRequest;
import com.MediTrack.meditrack_backend.Ai_Module.dto.RfFlaskResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.http.client.ClientHttpRequestFactorySettings;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;

/**
 * Client for the Random Forest General Risk Classifier (lifetime device review).
 * Calls POST /predict/rf on the Flask/FastAPI ML service.
 */
@Component
@Slf4j
public class RfAiClient {

    private final RestClient restClient;
    private final String apiKey;

    public RfAiClient(
            @Value("${ai.service.url}") String baseUrl,
            @Value("${ai.service.api-key:}") String apiKey
    ) {
        this.apiKey = apiKey;

        // HF Spaces can take 30-60s to wake up from a cold start.
        ClientHttpRequestFactorySettings settings = ClientHttpRequestFactorySettings.defaults()
                .withConnectTimeout(Duration.ofSeconds(10))
                .withReadTimeout(Duration.ofSeconds(60));

        ClientHttpRequestFactory requestFactory = ClientHttpRequestFactoryBuilder
                .detect()
                .build(settings);

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @CircuitBreaker(name = "rfService", fallbackMethod = "predictRfFallback")
    @Retry(name = "rfService")
    public RfFlaskResponse predict(RfFlaskRequest request) {

        log.info("Sending RF risk assessment request to ML service");

        try {
            return restClient.post()
                    .uri("/predict/rf")
                    .headers(this::applyApiKeyIfPresent)
                    .body(request)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                            (req, res) -> {
                                String body = new String(res.getBody().readAllBytes());
                                log.error("RF ML failure response: {}", body);
                                throw new RuntimeException(body);
                            })
                    .body(RfFlaskResponse.class);

        } catch (Exception ex) {
            log.error("RF client exception: {}", ex.getMessage());
            throw ex; // ensures circuit breaker fallback triggers
        }
    }

    private void applyApiKeyIfPresent(HttpHeaders headers) {
        if (apiKey != null && !apiKey.isBlank()) {
            headers.set("X-API-Key", apiKey);
        }
    }
}