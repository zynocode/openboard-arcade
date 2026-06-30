import React from 'react';
import type { GameMode, DifficultyLevel, PieceColor } from '../../types/chess.types';
import { ArrowLeft, Cpu, Users, Play, Settings } from 'lucide-react';

// Time control presets: { time in seconds, Fischer increment in seconds, display label }
export const TIME_CONTROLS = [
  { time: 60,   inc: 0,  label: '1m Bullet'  },
  { time: 180,  inc: 2,  label: '3+2 Blitz'  },
  { time: 300,  inc: 3,  label: '5+3 Blitz'  },
  { time: 600,  inc: 5,  label: '10+5 Rapid' },
  { time: 1800, inc: 0,  label: '30m Slow'   },
];

interface ChessLobbyProps {
  selectedMode: GameMode;
  setSelectedMode: (m: GameMode) => void;
  selectedDifficulty: DifficultyLevel;
  setSelectedDifficulty: (d: DifficultyLevel) => void;
  selectedColor: PieceColor;
  setSelectedColor: (c: PieceColor) => void;
  selectedTC: typeof TIME_CONTROLS[0];
  setSelectedTC: (tc: typeof TIME_CONTROLS[0]) => void;
  selectedAutoQueen: boolean;
  setSelectedAutoQueen: any;
  savedGame: any;
  botEngineName: string;
  formatDiff: (d: string) => string;
  handleResumeGame: () => void;
  handleStartGame: () => void;
  onBackToLobby: () => void;
}

export const ChessLobby: React.FC<ChessLobbyProps> = ({
  selectedMode, setSelectedMode,
  selectedDifficulty, setSelectedDifficulty,
  selectedColor, setSelectedColor,
  selectedTC, setSelectedTC,
  selectedAutoQueen, setSelectedAutoQueen,
  savedGame, botEngineName, formatDiff,
  handleResumeGame, handleStartGame, onBackToLobby,
}) => {
  return (
    <div className="splash-container" style={{ '--theme-color-1': '#0f172a', '--theme-color-2': '#38bdf8', '--theme-shadow': 'rgba(56,189,248,0.3)' } as React.CSSProperties}>
      
      {/* Background artwork specific to Chess */}
      <div className="splash-bg" style={{
        background: `radial-gradient(circle at 70% 50%, rgba(56,189,248,0.12) 0%, transparent 60%),
                     radial-gradient(circle at 30% 30%, rgba(148,163,184,0.05) 0%, transparent 50%),
                     linear-gradient(135deg, #020617 0%, #050b14 100%)`
      }} />

      {/* Back button */}
      <button className="splash-back-btn" onClick={onBackToLobby}>
        <ArrowLeft size={16} /> Arena
      </button>

      <div className="splash-content">
        
        {/* LEFT: Branding & Modes */}
        <div className="splash-left">
          <div className="splash-logo-wrap">
            <div className="splash-icon" style={{ borderColor: 'rgba(56,189,248,0.3)', boxShadow: '0 20px 40px rgba(56,189,248,0.2)' }}>
              ♟️
            </div>
            <div>
              <h1 className="splash-title">Chess Pro</h1>
              <p className="splash-subtitle">Challenge the Grandmaster Engine or play locally.</p>
            </div>
          </div>

          <div className="splash-modes">
            <button 
              className={`splash-mode-btn ${selectedMode === 'ai' ? 'active' : ''}`}
              style={selectedMode === 'ai' ? { '--theme-color': 'rgba(56,189,248,0.15)', '--theme-border': 'rgba(56,189,248,0.4)', '--theme-shadow': 'rgba(56,189,248,0.2)', '--theme-icon': '#38bdf8' } as React.CSSProperties : {}}
              onClick={() => setSelectedMode('ai')}
            >
              <Cpu className="splash-mode-btn-icon" />
              <div className="splash-mode-btn-content">
                <h3>Vs Computer</h3>
                <p>Play against {botEngineName}</p>
              </div>
            </button>
            <button 
              className={`splash-mode-btn ${selectedMode === 'local' ? 'active' : ''}`}
              style={selectedMode === 'local' ? { '--theme-color': 'rgba(248,113,113,0.15)', '--theme-border': 'rgba(248,113,113,0.4)', '--theme-shadow': 'rgba(248,113,113,0.2)', '--theme-icon': '#f87171' } as React.CSSProperties : {}}
              onClick={() => setSelectedMode('local')}
            >
              <Users className="splash-mode-btn-icon" />
              <div className="splash-mode-btn-content">
                <h3>Pass & Play</h3>
                <p>Play locally with a friend</p>
              </div>
            </button>
          </div>
        </div>

        {/* RIGHT: Config Panel */}
        <div className="splash-right">
          <div className="splash-config-panel">
            
            {/* Time Control */}
            <div className="splash-config-section">
              <span className="splash-config-label">Time Control</span>
              <div className="splash-config-options">
                {TIME_CONTROLS.map((tc) => {
                  const selected = selectedTC.label === tc.label;
                  return (
                    <button
                      key={tc.label}
                      className={`splash-option-btn ${selected ? 'active' : ''}`}
                      style={selected ? { '--theme-color': 'rgba(16,185,129,0.2)', '--theme-border': '#10b981', '--theme-shadow': 'rgba(16,185,129,0.3)', color: '#34d399' } as React.CSSProperties : { padding: '12px 4px', fontSize: '12px' }}
                      onClick={() => setSelectedTC(tc)}
                    >
                      {tc.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Selection */}
            {selectedMode === 'ai' && (
              <div className="splash-config-section">
                <span className="splash-config-label">Bot Difficulty</span>
                <div className="splash-config-options">
                  {(['beginner','easy','medium','hard','expert','master'] as DifficultyLevel[]).map((level) => {
                    const selected = selectedDifficulty === level;
                    return (
                      <button
                        key={level}
                        className={`splash-option-btn ${selected ? 'active' : ''}`}
                        style={selected ? { '--theme-color': 'rgba(245,158,11,0.2)', '--theme-border': '#f59e0b', '--theme-shadow': 'rgba(245,158,11,0.3)', color: '#fbbf24' } as React.CSSProperties : {}}
                        onClick={() => setSelectedDifficulty(level)}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {selectedMode === 'ai' && (
              <div className="splash-config-section">
                <span className="splash-config-label">Your Side</span>
                <div className="splash-config-options">
                  <button
                    className={`splash-option-btn ${selectedColor === 'w' ? 'active' : ''}`}
                    style={selectedColor === 'w' ? { '--theme-color': 'rgba(255,255,255,0.15)', '--theme-border': '#fff', '--theme-shadow': 'rgba(255,255,255,0.2)' } as React.CSSProperties : {}}
                    onClick={() => setSelectedColor('w')}
                  >
                    ⚪ White
                  </button>
                  <button
                    className={`splash-option-btn ${selectedColor === 'b' ? 'active' : ''}`}
                    style={selectedColor === 'b' ? { '--theme-color': 'rgba(56,189,248,0.2)', '--theme-border': '#38bdf8', '--theme-shadow': 'rgba(56,189,248,0.3)' } as React.CSSProperties : {}}
                    onClick={() => setSelectedColor('b')}
                  >
                    ⚫ Black
                  </button>
                </div>
              </div>
            )}

            {/* Auto-promote toggle */}
            <div className="splash-config-section" style={{ marginBottom: '24px' }}>
               <button
                  onClick={() => setSelectedAutoQueen(!selectedAutoQueen)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 18px',
                    borderRadius: '14px',
                    border: `1px solid ${selectedAutoQueen ? '#6366f1' : 'rgba(255,255,255,0.07)'}`,
                    background: selectedAutoQueen ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
                    color: '#cbd5e1',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings size={16} /> <span>Auto-promote to Queen</span>
                  </div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: selectedAutoQueen ? '#818cf8' : '#64748b',
                  }}>
                    {selectedAutoQueen ? 'ON' : 'OFF'}
                  </span>
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
              {savedGame && (
                <button onClick={handleResumeGame} style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  border: '1px solid rgba(16,185,129,0.5)',
                  background: 'rgba(16,185,129,0.12)',
                  color: '#34d399',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}>
                  ⏳ Resume Game
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: 500, opacity: 0.8, marginTop: '2px' }}>
                    {savedGame.mode === 'ai'
                      ? `vs ${botEngineName} (${formatDiff(savedGame.difficulty)})`
                      : 'Pass & Play'}
                  </span>
                </button>
              )}
              <button className="splash-play-btn" onClick={handleStartGame}>
                <Play size={20} fill="currentColor" /> Start Match
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
