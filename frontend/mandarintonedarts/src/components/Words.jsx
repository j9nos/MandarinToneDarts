import React, { useState, useEffect } from 'react';
import api from '../security/api';
import axios from 'axios';

const Words = ({ user }) => {
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const [selectedWord, setSelectedWord] = useState(null);
    const [decomposition, setDecomposition] = useState([]);
    const [loadingDecomp, setLoadingDecomp] = useState(false);

    useEffect(() => {
        fetchWords();
    }, []);

    const fetchWords = async () => {
        try {
            setLoading(true);
            const response = await api.get('/game/words');
            setWords(response.data);
        } catch (error) {
            console.error("Error fetching word library:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleWordClick = async (wordObj) => {
        const targetWord = isTraditional ? wordObj.traditional_hanzi : wordObj.simplified_hanzi;
        setSelectedWord(wordObj);
        setLoadingDecomp(true);
        setDecomposition([]);

        try {
            const response = await axios.get(`http://localhost:8000/decompose`, {
                params: { word: targetWord }
            });
            setDecomposition(response.data.decomposition);
        } catch (error) {
            console.error("Error fetching decomposition:", error);
        } finally {
            setLoadingDecomp(false);
        }
    };

    const isTraditional = user?.languageMode === 'TRADITIONAL';

    const filteredWords = words.filter(word =>
        (word.simplified_hanzi && word.simplified_hanzi.includes(searchTerm)) ||
        (word.traditional_hanzi && word.traditional_hanzi.includes(searchTerm)) ||
        (word.pinyin && word.pinyin.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (word.english && word.english.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="wordsPage">
            <div className="wordsContainer">

                <input
                    type="text"
                    placeholder="SEARCH"
                    className="wordsSearchBar"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="wordsList">
                    {loading ? (
                        <div className="wordsMessage">GETTING READY...</div>
                    ) : filteredWords.length > 0 ? (
                        filteredWords.map((word, index) => (
                            <div
                                key={word.id || index}
                                className={`wordCard ${hoveredIndex === index ? 'wordCardHover' : ''}`}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                onClick={() => handleWordClick(word)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="wordMain">
                                    <span className="hanzi">
                                        {isTraditional
                                            ? word.traditional_hanzi
                                            : word.simplified_hanzi}
                                    </span>
                                    <span className="pinyin">{word.pinyin}</span>
                                </div>
                                <div className="english">{word.english}</div>
                            </div>
                        ))
                    ) : (
                        <div className="wordsMessage">No words found</div>
                    )}
                </div>
            </div>

            {selectedWord && (
                <div className="modalOverlay" onClick={() => setSelectedWord(null)}>
                    <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                        <button className="modalCloseBtn" onClick={() => setSelectedWord(null)}>×</button>

                        <h3>{selectedWord.pinyin} - {selectedWord.english}</h3>

                        <hr />

                        {loadingDecomp ? (
                            <div className="modalLoading">Decomposing characters...</div>
                        ) : (
                            <div className="decompContainer">
                                {decomposition.map((item, index) => (
                                    <div key={index} className="charBreakdownBlock">
                                        <div className="parentChar">{item.character}</div>
                                        <div className="arrow">➔</div>
                                        <div className="childComponents">
                                            {item.components.map((comp, cIdx) => (
                                                <span key={cIdx} className="componentBadge">{comp}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Words;