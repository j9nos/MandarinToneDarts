package com.j9nos.mandarintonedarts.controller;

import com.j9nos.mandarintonedarts.model.LanguageMode;
import com.j9nos.mandarintonedarts.model.VocabularyEntry;
import com.j9nos.mandarintonedarts.repository.UserRepository;
import com.j9nos.mandarintonedarts.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/game")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;
    private final UserRepository userRepository;

    @GetMapping("/random/word")
    public ResponseEntity<?> randomWord() {
        final VocabularyEntry word = gameService.getRandomWord();
        if (null == word) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Please wait for vocabulary to load.");
        }

        return ResponseEntity.ok(word);
    }

    @GetMapping("/words")
    public ResponseEntity<?> getWords() {
        final List<VocabularyEntry> words = gameService.getWords();
        if (null == words || words.isEmpty()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Damn");
        }
        return ResponseEntity.ok(words);
    }


    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(final Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .map(user -> ResponseEntity.ok(Map.of(
                        "username", user.getUsername(),
                        "highestScore", user.getHighestScore()
                )))
                .orElse(ResponseEntity.status(404).build());
    }

    @PostMapping("/score")
    public ResponseEntity<?> updateHighestScore(
            Authentication authentication,
            @RequestBody Map<String, Integer> request) {

        final Integer newScore = request.get("score");

        if (newScore == null) {
            return ResponseEntity.badRequest().body("Score is required");
        }

        return userRepository.findByUsername(authentication.getName())
                .map(user -> {
                    if (newScore > user.getHighestScore()) {
                        user.setHighestScore(newScore);
                        userRepository.save(user);
                    }

                    return ResponseEntity.ok(Map.of(
                            "username", user.getUsername(),
                            "highestScore", user.getHighestScore()
                    ));
                })
                .orElse(ResponseEntity.status(404).build());
    }

    @PostMapping("/mode")
    public ResponseEntity<?> updateMode(Authentication authentication,
                                        @RequestBody Map<String, Object> request) {

        final String rawMode = String.valueOf(request.get("mode"));

        LanguageMode mode;

        try {
            mode = LanguageMode.valueOf(rawMode.toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            return ResponseEntity.badRequest().body("Wrong mode");
        }

        return userRepository.findByUsername(authentication.getName())
                .map(user -> {
                    user.setLanguageMode(mode);
                    userRepository.save(user);

                    return ResponseEntity.ok(Map.of(
                            "username", user.getUsername(),
                            "languageMode", user.getLanguageMode().name()
                    ));
                })
                .orElse(ResponseEntity.status(404).build());
    }


}