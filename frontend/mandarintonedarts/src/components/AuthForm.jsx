import React, { useState } from 'react';
import { login, register } from '../security/auth';

import dragonImg from '../assets/dragon.png';

const AuthForm = ({ onAuthSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!username || !password || loading) return;

        setMessage('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(username, password);
                onAuthSuccess();
            } else {
                await register(username, password);
                setMessage('Account Created! Logging in...');
                await login(username, password);
                setTimeout(() => onAuthSuccess(), 1000);
            }
        } catch (error) {
            const errorMsg =
                error.response?.data?.message ||
                error.response?.data ||
                "Auth Failed";

            setMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="authContainer">
            <img src={dragonImg} alt="Dragon" className="authDragon" />

            <h1 className="authTitle">Mandarin Tone Darts</h1>

            <div className="segmentedToggle" onClick={() => setIsLogin(!isLogin)}>

                <div
                    className={`segmentSlider ${
                        isLogin ? 'left' : 'right'
                    }`}
                />

                <span
                    className={`segmentText ${isLogin ? 'active' : ''}`}
                    onClick={() => setIsLogin(true)}
                >
                    LOGIN
                </span>

                <span
                    className={`segmentText ${!isLogin ? 'active' : ''}`}
                    onClick={() => setIsLogin(false)}
                >
                    REGISTER
                </span>

            </div>

            <form className="authForm" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="USERNAME"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    className="authInput"
                />

                <input
                    type="password"
                    placeholder="PASSWORD"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="authInput"
                />

                <button
                    type="submit"
                    disabled={loading || !username || !password}
                    className="authButton"
                >
                    {loading ? '...' : isLogin ? 'GO!' : 'CREATE ACCOUNT'}
                </button>
            </form>

            {message && (
                <p className={`authMessage ${message.includes('Created') ? 'success' : 'error'}`}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default AuthForm;