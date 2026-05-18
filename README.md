<p align="center">
  <img src=".readme/dragon.png" width="150" alt="Mandarin Tone Darts Logo">
</p>

# 🎯 Mandarin Tone Darts

A gamified approach to mastering Mandarin Chinese tones.  
Practice recognizing the four tones of Mandarin in a fast-paced, interactive environment designed to build reflexive tone recognition.

---

## 🕹️ Gameplay Overview

<p align="center">
  <img src=".readme/game.gif" alt="Gameplay Demo">
</p>

Players are presented with Mandarin syllables and must quickly identify the correct tone. The goal is to train instant recognition through repetition and speed, turning tone learning into an arcade-style experience.

---

## 🚀 New Features

- Decomposer Service: Clicked elements in the word list will now be presented in a beautifully broken-down, decomposed format to help you analyze individual characters and components.
<p align="center">
  <img src=".readme/decomposer.gif" alt="Decomposer Demo">
</p>


---

## 🏮 Mandarin Tones Explained

Mandarin Chinese has four primary tones. The same syllable can have different meanings depending on tone:

- **1st Tone (ˉ)** — High and level  
  Stable pitch, like holding a single high note.

- **2nd Tone (´)** — Rising  
  Starts mid and rises upward, similar to asking a question in English.

- **3rd Tone (ˇ)** — Dipping  
  Falls then rises again; the most dynamic and complex tone.

- **4th Tone (ˋ)** — Falling  
  Sharp and decisive drop in pitch.

---

## 🚀 Quick Start

The entire project is fully containerized using Docker.
```bash
docker-compose up -d --build
```

## 🧰 Tech Stack

This project uses a modern full-stack architecture designed for scalability and performance:

- **Frontend:** React.js (interactive UI for gameplay)
- **Backend:** Spring Boot (REST API + game logic)
- **Database:** PostgreSQL (user data management)
- **Caching Layer:** Redis (cached vocabulary data)
- **Decomposer Service:** Flask & HanziChaizi (Microservice for linguistic breakdown and character analysis)
- **Infrastructure:** Docker (containerized deployment)