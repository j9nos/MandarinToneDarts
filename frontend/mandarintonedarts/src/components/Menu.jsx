import gameIcon from "../assets/game.png";
import wordsIcon from "../assets/words.png";
import settingsIcon from "../assets/settings.png";

const items = [
    { key: 'game', icon: gameIcon, label: 'PLAY' },
    { key: 'words', icon: wordsIcon, label: 'WORDS' },
    { key: 'settings', icon: settingsIcon, label: 'SETTINGS' },
];

const Menu = ({ setView }) => {
    return (
        <div className="menuContainer">
            {items.map(item => (
                <div
                    key={item.key}
                    className="menuItemWrapper"
                    onClick={() => setView(item.key)}
                >
                    <img src={item.icon} alt={item.label} className="menuIcon" />
                    <span className="menuText">{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export default Menu;