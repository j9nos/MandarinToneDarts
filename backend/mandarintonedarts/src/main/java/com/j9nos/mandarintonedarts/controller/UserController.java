package com.j9nos.mandarintonedarts.controller;


import com.j9nos.mandarintonedarts.model.LanguageMode;
import com.j9nos.mandarintonedarts.model.User;
import com.j9nos.mandarintonedarts.repository.UserRepository;
import com.j9nos.mandarintonedarts.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        if (userRepository.findByUsername(request.get("username")).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        final User user = User.builder()
                .username(request.get("username"))
                .passwordHash(passwordEncoder.encode(request.get("password")))
                .highestScore(0)
                .languageMode(LanguageMode.SIMPLIFIED)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        final String username = request.get("username");
        final String password = request.get("password");

        final User user = userRepository.findByUsername(username)
                .orElse(null);

        if (user == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            return ResponseEntity.status(401).body("Invalid username or password");
        }

        final String token = jwtService.generateToken(user.getUsername());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "username", user.getUsername(),
                "highestScore", user.getHighestScore(),
                "languageMode", user.getLanguageMode()
        ));
    }


}