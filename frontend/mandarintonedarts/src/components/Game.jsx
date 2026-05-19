import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getRandomWord, updateHighestScore } from '../security/game';
import fireImg from '../assets/fire.png';

const MAX_SECONDS = 5;
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8001/ws/transcribe';

const processorCode = `
  class PCMConvertProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
      const input = inputs[0];
      if (input && input.length > 0) {
        const inputChannel = input[0];
        const l = inputChannel.length;
        const pcm16 = new Int16Array(l);
        
        for (let i = 0; i < l; i++) {
          let s = Math.max(-1, Math.min(1, inputChannel[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
      }
      return true;
    }
  }
  registerProcessor('pcm-convert-processor', PCMConvertProcessor);
`;

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

    const [isMicOn, setIsMicOn] = useState(false);
    const [spokenText, setSpokenText] = useState("");
    const [micError, setMicError] = useState(null);

    const timerRef = useRef(null);
    const hasSubmittedScoreRef = useRef(false);

    const wsRef = useRef(null);
    const audioContextRef = useRef(null);
    const streamRef = useRef(null);

    const isTraditional = user?.languageMode === 'TRADITIONAL';

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
        
        setSpokenText(""); 
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

    const startRecording = async () => {
        try {
            setMicError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            wsRef.current = new WebSocket(WS_URL);
            wsRef.current.binaryType = 'arraybuffer';

            wsRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'partial' || data.type === 'final') {
                    setSpokenText(data.text);
                }
            };

            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 16000,
            });

            const blob = new Blob([processorCode], { type: 'application/javascript' });
            const objectURL = URL.createObjectURL(blob);
            await audioContextRef.current.audioWorklet.addModule(objectURL);

            const source = audioContextRef.current.createMediaStreamSource(stream);
            const recorderNode = new AudioWorkletNode(audioContextRef.current, 'pcm-convert-processor');

            recorderNode.port.onmessage = (e) => {
                const pcm16Buffer = e.data;
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(pcm16Buffer);
                }
            };

            source.connect(recorderNode);
            recorderNode.connect(audioContextRef.current.destination);
        } catch (err) {
            console.error(err);
            setMicError("Could not access microphone.");
            setIsMicOn(false);
        }
    };

    const stopRecording = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null; 
        }
        
        if (audioContextRef.current) {
            if (audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(err => 
                    console.warn("AudioContext close ignored:", err)
                );
            }
            audioContextRef.current = null;
        }
        
        if (wsRef.current) {
            if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
                wsRef.current.close();
            }
            wsRef.current = null;
        }
        
        setSpokenText("");
    }, []);

    useEffect(() => {
        if (isMicOn) {
            startRecording();
        } else {
            stopRecording();
        }
        return () => stopRecording();
    }, [isMicOn, stopRecording]);

    useEffect(() => {
        if (showSuccess || showError) {
            setSpokenText("");
        }
    }, [showSuccess, showError]);

    useEffect(() => {
        if (!word || showError || showSuccess || !spokenText) return;

        const hanzi = isTraditional ? word.traditional_hanzi : word.simplified_hanzi;

        if (spokenText.includes(hanzi)) {
            setUserPinyin(word.pinyin);
            setAccentedIndexes([]);
        }
    }, [spokenText, word, showError, showSuccess, isTraditional]);

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

            const timeoutId = setTimeout(() => {
                loadWord();
            }, 750);
            
            return () => clearTimeout(timeoutId);
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
                <button
                    className={`micToggleBtn ${isMicOn ? 'on' : 'off'}`}
                    onClick={() => setIsMicOn(prev => !prev)}
                >
                    {isMicOn ? "STOP RECORDING" : "START RECORDING"}
                </button>

                {micError && <p style={{ color: 'red', fontSize: '0.8rem' }}>{micError}</p>}

                <div className="spokenText">
                    {isMicOn && (spokenText || "Listening...")}
                </div>

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