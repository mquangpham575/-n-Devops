import React, { useState } from 'react';
import { useTheme, THEMES } from '../context/ThemeContext';

const BASIC_THEMES    = ['default', 'dark'];
const SEASONAL_THEMES = ['tet', 'trungthu', 'giangsinh'];

export default function ThemeSelector() {
    const { theme, setTheme, volumeMap, setVolume } = useTheme();
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Floating trigger */}
            <button
                className="theme-selector-btn"
                onClick={() => setOpen(o => !o)}
                title="Chọn giao diện theo mùa"
                aria-label="Chọn giao diện"
            >
                {THEMES[theme]?.icon ?? '🎨'}
            </button>

            {open && (
                <div className="theme-selector-panel">
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#374151', marginBottom: 10 }}>
                        🎨 Cài đặt giao diện
                    </div>

                    {/* ── Nhóm 1: Mặc định + Tối ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                        {BASIC_THEMES.map(key => {
                            const info = THEMES[key];
                            const active = theme === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => { setTheme(key); setOpen(false); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '8px 10px', borderRadius: 10,
                                        border: active ? '2px solid #0ea5e9' : '2px solid transparent',
                                        background: active ? '#f0f9ff' : 'transparent',
                                        cursor: 'pointer', textAlign: 'left', width: '100%',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f3f4f6'; }}
                                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <span style={{ fontSize: 20, minWidth: 26, textAlign: 'center' }}>{info.icon}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{info.label}</span>
                                    {active && <span style={{ marginLeft: 'auto', color: '#0ea5e9' }}>✓</span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: '#e5e7eb', margin: '0 0 10px' }} />

                    {/* ── Nhóm 2: Tết / Trung Thu / Giáng Sinh + volume ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {SEASONAL_THEMES.map(key => {
                            const info   = THEMES[key];
                            const active = theme === key;
                            const vol    = volumeMap?.[key] ?? 0.22;
                            const volIcon = vol === 0 ? '🔇' : vol < 0.4 ? '🔉' : '🔊';
                            return (
                                <div
                                    key={key}
                                    style={{
                                        borderRadius: 10,
                                        border: active ? '2px solid #0ea5e9' : '2px solid #e5e7eb',
                                        background: active ? '#f0f9ff' : '#f9fafb',
                                        overflow: 'hidden',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {/* Theme row */}
                                    <button
                                        onClick={() => { setTheme(key); setOpen(false); }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '8px 10px 6px',
                                            background: 'transparent', border: 'none',
                                            cursor: 'pointer', textAlign: 'left', width: '100%',
                                        }}
                                    >
                                        <span style={{ fontSize: 20, minWidth: 26, textAlign: 'center' }}>{info.icon}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{info.label}</span>
                                        {active && <span style={{ marginLeft: 'auto', color: '#0ea5e9' }}>✓</span>}
                                    </button>

                                    {/* Volume slider */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '2px 10px 8px',
                                    }}>
                                        <span style={{ fontSize: 13 }}>{volIcon}</span>
                                        <input
                                            type="range"
                                            min="0" max="1" step="0.01"
                                            value={vol}
                                            onChange={e => setVolume(key, parseFloat(e.target.value))}
                                            onClick={e => e.stopPropagation()}
                                            style={{ flex: 1, accentColor: '#0ea5e9', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: 11, color: '#6b7280', minWidth: 30, textAlign: 'right' }}>
                                            {Math.round(vol * 100)}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Đóng */}
                    <button
                        onClick={() => setOpen(false)}
                        style={{
                            width: '100%', marginTop: 10, padding: '6px 0',
                            borderRadius: 8, border: '1px solid #e5e7eb',
                            background: '#f9fafb', cursor: 'pointer',
                            fontSize: 12, color: '#6b7280',
                        }}
                    >
                        Đóng
                    </button>
                </div>
            )}
        </>
    );
}
