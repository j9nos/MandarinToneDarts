package com.j9nos.mandarintonedarts.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.j9nos.mandarintonedarts.model.VocabularyEntry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class GameService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public VocabularyEntry getRandomWord() {
        final Set<String> keys = redisTemplate.keys("vocab:*");

        if (keys.isEmpty()) {
            log.warn("Redis is empty. No vocabulary targets available.");
            return null;
        }

        final List<String> keyList = new ArrayList<>(keys);
        final String randomKey = keyList.get(new Random().nextInt(keyList.size()));

        final String json = redisTemplate.opsForValue().get(randomKey);
        try {
            return objectMapper.readValue(json, VocabularyEntry.class);
        } catch (Exception e) {
            log.error("Failed to parse vocabulary JSON for key: {}", randomKey);
            return null;
        }
    }

    public List<VocabularyEntry> getWords() {
        final Set<String> keys = redisTemplate.keys("vocab:*");

        if (keys.isEmpty()) {
            log.warn("Redis is empty. No vocabulary targets available.");
            return Collections.emptyList();
        }

        final List<String> keyList = new ArrayList<>(keys);
        final List<String> values = redisTemplate.opsForValue().multiGet(keyList);

        if (values == null || values.isEmpty()) {
            return Collections.emptyList();
        }

        final List<VocabularyEntry> words = new ArrayList<>();

        for (String json : values) {
            if (json == null) {
                continue;
            }

            try {
                words.add(objectMapper.readValue(json, VocabularyEntry.class));
            } catch (Exception e) {
                log.error("Failed to parse vocabulary JSON", e);
            }
        }

        return words;
    }
}