import api from './api';

const GAME_URL = '/game/';

export const getRandomWord = async () => {
    const response = await api.get(GAME_URL + 'random/word');
    return response.data;
};

export const updateHighestScore = async (score) => {
    const response = await api.post(GAME_URL + 'score', {
        score
    });

    const currentUser = JSON.parse(localStorage.getItem('user'));

    localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        highestScore: response.data.highestScore
    }));

    return response.data;
};

export const updateLanguageMode = async (mode) => {
    const response = await api.post(GAME_URL + 'mode', { mode });

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const updatedUser = {
        ...currentUser,
        languageMode: response.data.languageMode
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));

    return response.data;
};