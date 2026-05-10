package com.j9nos.mandarintonedarts.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class VocabularyEntry {
    private String english;

    @JsonProperty("simplified_hanzi")
    private String simplifiedHanzi;

    @JsonProperty("traditional_hanzi")
    private String traditionalHanzi;

    private String pinyin;

    private String normalizedPinyin;
    private List<Integer> accentedIndexes;

    public String generateRedisKey() {
        final String cleanEnglish = this.english.toLowerCase().replaceAll("\\s+", "_");

        final String cleanPinyin = java.text.Normalizer.normalize(this.pinyin, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .replaceAll("\\s+", "");

        return "vocab:" + cleanEnglish + ":" + cleanPinyin;
    }
}