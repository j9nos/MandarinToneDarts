import React, { useState, useEffect } from 'react';
import api from '../security/api';

const Words = ({ user }) => {
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredIndex, setHoveredIndex] = useState(null);

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
                            >
                                <div className="wordMain">
                                    <span className="hanzi">
                                        {isTraditional
                                            ? word.traditional_hanzi
                                            : word.simplified_hanzi}
                                    </span>

                                    <span className="pinyin">{word.pinyin}</span>
                                </div>

                                <div className="english">
                                    {word.english}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="wordsMessage">No words found</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Words;