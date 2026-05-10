import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getRandomWord, updateHighestScore } from '../security/game';
import fireImg from '../assets/fire.png';

const MAX_SECONDS = 5;

const addAccent = (vowel, tone) => {
    const tones = {
        1: "\u0304",
        2: "\u0301",
        3: "\u030C",
        4: "\u0300"
    };

    return (vowel.normalize("NFD") + tones[tone]).normalize("NFC");
};

const replaceCharAt = (str, index, replacement) => {
    if (index < 0 || index >= str.length) return str;
    return str.slice(0, index) + replacement + str.slice(index + 1);
};

const Game = ({ user, setUser }) => {
    const [word, setWord] = useState(null);
    const [accentedIndexes, setAccentedIndexes] = useState([]);
    const [userPinyin, setUserPinyin] = useState("");
    const [streak, setStreak] = useState(0);

    const [timerWidth, setTimerWidth] = useState(0);

    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    const timerRef = useRef(null);
    const hasSubmittedScoreRef = useRef(false);

    const isTraditional = user?.languageMode === 'TRADITIONAL';

    useEffect(() => {
        const style = document.createElement('style');

        style.innerHTML = `
            @keyframes errorRise {
                from { transform: scaleY(0); }
                to { transform: scaleY(1); }
            }

            @keyframes errorFade {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @keyframes successPop {
                0% { transform: scale(0.7); opacity: 0; }
                70% { transform: scale(1.1); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }
        `;

        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    const stopTimer = () => clearInterval(timerRef.current);

    const handleGameOver = useCallback(() => {
        stopTimer();
        setShowError(true);
    }, []);

    const startTimer = useCallback(() => {
        stopTimer();
        setTimerWidth(0);

        const start = Date.now();

        timerRef.current = setInterval(() => {
            const elapsed = Date.now() - start;
            const percent = (elapsed / (MAX_SECONDS * 1000)) * 100;

            if (percent >= 100) {
                setTimerWidth(100);
                handleGameOver();
            } else {
                setTimerWidth(percent);
            }
        }, 50);
    }, [handleGameOver]);

    const loadWord = useCallback(async () => {
        const data = await getRandomWord();

        setWord(data);
        setAccentedIndexes(data.accentedIndexes);
        setUserPinyin(data.normalizedPinyin);
        setShowError(false);
        setShowSuccess(false);

        startTimer();
    }, [startTimer]);

    useEffect(() => {
        loadWord();
        return stopTimer;
    }, [loadWord]);

    useEffect(() => {
        if (!showError) {
            hasSubmittedScoreRef.current = false;
        }
    }, [showError]);

    useEffect(() => {
        if (!showError) return;
        if (hasSubmittedScoreRef.current) return;

        hasSubmittedScoreRef.current = true;

        const submitScore = async () => {
            try {
                const response = await updateHighestScore(streak);

                if (setUser) {
                    setUser(prev => ({
                        ...prev,
                        highestScore: response.highestScore
                    }));
                }
            } catch (err) {
                console.error('Failed to update high score:', err);
            }
        };

        submitScore();
    }, [showError, streak, setUser]);

    const selectAccent = (tone) => {
        if (!accentedIndexes.length || showError) return;

        const index = accentedIndexes[0];

        const accented = addAccent(userPinyin[index], tone);

        setUserPinyin(prev => replaceCharAt(prev, index, accented));
        setAccentedIndexes(prev => prev.slice(1));
    };

    useEffect(() => {
        const onKey = (e) => {
            if (showError || !accentedIndexes.length) return;

            if (["1", "2", "3", "4"].includes(e.key)) {
                selectAccent(Number(e.key));
            }
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [accentedIndexes, showError]);

    useEffect(() => {
        if (!word || showError) return;

        if (accentedIndexes.length === 0) {
            if (word.pinyin !== userPinyin) {
                handleGameOver();
                return;
            }

            stopTimer();
            setShowSuccess(true);
            setStreak(s => s + 1);

            setTimeout(() => {
                setShowSuccess(false);
                loadWord();
            }, 750);
        }
    }, [accentedIndexes, userPinyin, word, showError, handleGameOver, loadWord]);

    const retry = () => {
        setStreak(0);
        setShowError(false);
        loadWord();
    };

    if (!word) {
        return <div className="gameLoader">GETTING READY...</div>;
    }

    const hanzi = isTraditional
        ? word.traditional_hanzi
        : word.simplified_hanzi;

    return (
        <div className="gameContainer">

            {showSuccess && (
                <div className="successOverlay">
                    <div className="successNumber">{streak}</div>
                </div>
            )}

            <div className="gameCard">
                <p className="gameEnglish">{word.english}</p>

                <h1 className="gameHanzi">{hanzi}</h1>

                <div className="gamePinyin">
                    {userPinyin.split("").map((char, i) => (
                        <span
                            key={i}
                            className={i === accentedIndexes[0] ? "activeChar" : ""}
                        >
                            {char}
                        </span>
                    ))}
                </div>
            </div>

            <div className="toneControls">
                {[1, 2, 3, 4].map(tone => (
                    <button
                        key={tone}
                        onClick={() => selectAccent(tone)}
                        className="toneBtn"
                    >
                        {['—', '／', '∨', '＼'][tone - 1]}
                    </button>
                ))}
            </div>

            <div className="timerTrack">
                <div
                    className="timerFill"
                    style={{ width: `${timerWidth}%` }}
                />
            </div>

            {showError && (
                <div className="errorScreen">
                    <div className="errorFill" />

                    <div className="errorContent">
                        <div className="streakBadge">
                            <img src={fireImg} alt="fire" className="fireIconLarge" />
                            {streak}
                        </div>

                        <p className="errorEnglish">{word.english}</p>

                        <h1 className="errorHanzi">{hanzi}</h1>

                        <p className="errorPinyin">{word.pinyin}</p>

                        <button className="retryBtn" onClick={retry}>
                            RETRY
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Game;