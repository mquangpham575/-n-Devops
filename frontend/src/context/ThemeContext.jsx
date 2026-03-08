import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEMES = {
    default:   { label: 'Mặc định',   icon: '✨', description: 'Giao diện tiêu chuẩn',      bg: null },
    dark:      { label: 'Chế độ tối', icon: '🌙', description: 'Giao diện tối huyền bí',     bg: 'dark' },
    tet:       { label: 'Tết',         icon: '🎆', description: 'Vui xuân đón Tết',            bg: 'tet' },
    trungthu:  { label: 'Trung Thu',  icon: '🏮', description: 'Tết Trung Thu rực rỡ',        bg: 'trungthu' },
    giangsinh: { label: 'Giáng Sinh', icon: '🎄', description: 'Noel vui vẻ an lành',         bg: 'giangsinh' },
};

const DEFAULT_VOLUMES = { tet: 0.22, trungthu: 0.22, giangsinh: 0.22 };

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        const saved = localStorage.getItem('bt-theme');
        return saved && THEMES[saved] ? saved : 'default';
    });

    const [volumeMap, setVolumeMapState] = useState(() => {
        try {
            const s = localStorage.getItem('bt-volume');
            return s ? { ...DEFAULT_VOLUMES, ...JSON.parse(s) } : { ...DEFAULT_VOLUMES };
        } catch { return { ...DEFAULT_VOLUMES }; }
    });

    useEffect(() => {
        localStorage.setItem('bt-theme', theme);
        // Remove old theme classes then apply new one
        const body = document.body;
        const classes = body.className.split(' ').filter(c => !c.startsWith('theme-'));
        body.className = [...classes, `theme-${theme}`].join(' ').trim();
    }, [theme]);

    const setTheme = (t) => {
        if (THEMES[t]) setThemeState(t);
    };

    const setVolume = (key, val) => {
        setVolumeMapState(prev => {
            const next = { ...prev, [key]: val };
            localStorage.setItem('bt-volume', JSON.stringify(next));
            return next;
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, THEMES, volumeMap, setVolume }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
