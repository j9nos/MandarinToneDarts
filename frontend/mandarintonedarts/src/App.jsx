import React, { useState, useEffect } from 'react';
import AuthForm from './components/AuthForm';
import { getCurrentUser, logout } from './security/auth';

import Game from './components/Game';
import Words from './components/Words';
import Menu from './components/Menu';
import Settings from './components/Settings';

import fireImg from './assets/fire.png'

function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('auth');

    useEffect(() => {
        const loggedUser = getCurrentUser();
        if (loggedUser) {
            setUser(loggedUser);
            setView('menu');
        }
    }, []);

    const handleAuthSuccess = () => {
        const loggedUser = getCurrentUser();
        if (loggedUser) {
            setUser(loggedUser);
            setView('menu');
        }
    };

    const handleLogout = () => {
        logout();
        setUser(null);
        setView('auth');
    };

    const goHome = () => setView('menu');

    return (
        <div className="appContainer">
            {view !== 'auth' && (<nav className="navBar">
                {user && (
                    <>
                        <span className="username" onClick={goHome}>
                            {user.username}
                        </span>

                        <div className="navRight">
                            <span className="score">
                                <img src={fireImg} alt="fire" className="fireIconSmall" />
                                {user.highestScore ?? 0}
                            </span>

                            <button onClick={handleLogout} className="logoutBtn">
                                logout
                            </button>
                        </div>
                    </>
                )}
            </nav>)}


            <main className="main">
                {view === 'auth' && (
                    <AuthForm onAuthSuccess={handleAuthSuccess} />
                )}

                {view === 'menu' && (
                    <Menu setView={setView} />
                )}

                <div className="contentWrapper">
                    {view === 'game' && <Game user={user} setUser={setUser} />}
                    {view === 'words' && <Words user={user} />}
                    {view === 'settings' && <Settings user={user} setUser={setUser} />}
                </div>
            </main>
        </div>
    );
}

export default App;