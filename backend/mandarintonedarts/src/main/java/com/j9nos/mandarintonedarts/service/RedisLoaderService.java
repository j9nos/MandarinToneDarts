package com.j9nos.mandarintonedarts.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.j9nos.mandarintonedarts.model.VocabularyEntry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class RedisLoaderService implements CommandLineRunner {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting Mandarin Tone Darts Vocabulary Loader...");

        try (InputStream inputStream = getClass().getResourceAsStream("/data/vocabulary.json")) {
            if (inputStream == null) {
                log.error("CRITICAL: vocabulary.json not found in src/main/resources/data/");
                return;
            }

            final List<VocabularyEntry> entries = objectMapper.readValue(inputStream, new TypeReference<>() {
            });

            for (final VocabularyEntry entry : entries) {
                final List<Integer> indices = new ArrayList<>();
                final String normalized = processPinyin(entry.getPinyin(), indices);

                entry.setNormalizedPinyin(normalized);
                entry.setAccentedIndexes(indices);

                final String redisKey = generateKey(entry);

                final String jsonValue = objectMapper.writeValueAsString(entry);
                redisTemplate.opsForValue().set(redisKey, jsonValue);
            }

            log.info("Successfully loaded {} words into Redis.", entries.size());
        } catch (final Exception e) {
            log.error("Error loading vocabulary: {}", e.getMessage());
        }
    }

    private String processPinyin(String input, List<Integer> indices) {
        if (input == null) return "";
        final StringBuilder sb = new StringBuilder();

        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            String charDecomposed = Normalizer.normalize(String.valueOf(c), Normalizer.Form.NFD);

            if (charDecomposed.length() > 1) {
                indices.add(i);
            }
            sb.append(charDecomposed.charAt(0));
        }
        return sb.toString();
    }

    private String generateKey(VocabularyEntry entry) {
        String cleanEng = entry.getEnglish().toLowerCase().replaceAll("\\s+", "_");
        String cleanPinyin = Normalizer.normalize(entry.getPinyin(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .replaceAll("\\s+", "");

        return "vocab:" + cleanEng + ":" + cleanPinyin;
    }
}