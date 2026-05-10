import React, { useState, useEffect } from 'react';
import { updateLanguageMode } from '../security/game';

const Settings = ({ user, setUser }) => {
    const [mode, setMode] = useState('SIMPLIFIED');

    useEffect(() => {
        if (user?.languageMode) {
            setMode(user.languageMode);
        }
    }, [user]);

    const toggle = async (newMode) => {
        try {
            const normalizedMode = newMode.toUpperCase();

            setMode(normalizedMode);

            const response = await updateLanguageMode(normalizedMode);

            const updatedMode =
                response?.languageMode ?? normalizedMode;

            if (setUser) {
                setUser(prev => ({
                    ...(prev || {}),
                    languageMode: updatedMode
                }));
            }

            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

            localStorage.setItem(
                'user',
                JSON.stringify({
                    ...storedUser,
                    languageMode: updatedMode
                })
            );

        } catch (err) {
            console.error('Failed to update language mode:', err);
        }
    };

    return (
        <div className="settingsContainer">
            <h2 className="settingsTitle">Settings</h2>

            <div className="segmentedToggle">
                <div
                    className={`segmentSlider ${mode === 'SIMPLIFIED' ? 'left' : 'right'
                        }`}
                />

                <div
                    className={`segmentText ${mode === 'SIMPLIFIED' ? 'active' : ''
                        }`}
                    onClick={() => toggle('SIMPLIFIED')}
                >
                    Simplified
                </div>

                <div
                    className={`segmentText ${mode === 'TRADITIONAL' ? 'active' : ''
                        }`}
                    onClick={() => toggle('TRADITIONAL')}
                >
                    Traditional
                </div>
            </div>

            <p className="settingsHint">
                Current: <strong>{mode}</strong>
            </p>
        </div>
    );
};

export default Settings;