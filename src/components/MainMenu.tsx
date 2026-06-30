import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { PlayerColor, AIDifficulty, ConfiguredPlayer } from '../store/gameStore';
import { Volume2, VolumeX, ArrowLeft, Cpu, Users, Play } from 'lucide-react';
import { useAudio } from '../audio/useAudio';

const colorDetails: Record<PlayerColor, { hex: string; label: string }> = {
  red: { hex: '#ef4444', label: 'Red' },
  green: { hex: '#22c55e', label: 'Green' },
  yellow: { hex: '#eab308', label: 'Yellow' },
  blue: { hex: '#3b82f6', label: 'Blue' },
};

const PIN_ORDER: PlayerColor[] = ['blue', 'red', 'green', 'yellow'];
const CANON_ORDER: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
const DIAGONAL_OF: Record<PlayerColor, PlayerColor> = {
  red: 'yellow', yellow: 'red',
  green: 'blue', blue: 'green',
};

type Mode = 'cpu' | 'local';

export default function MainMenu({ onBackToArena }: { onBackToArena?: () => void }) {
  const { setupGame, mute, toggleMute } = useGameStore();
  const { play } = useAudio();

  const [mode, setMode] = useState<Mode>('cpu');
  const [humanColor, setHumanColor] = useState<PlayerColor>('red');
  const [playerCount, setPlayerCount] = useState<2 | 4>(4);
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');

  const handlePlay = () => {
    let colors: PlayerColor[];
    if (playerCount === 4) {
      colors = [...CANON_ORDER];
    } else {
      const dia = DIAGONAL_OF[humanColor];
      colors = CANON_ORDER.filter((c) => c === humanColor || c === dia);
    }

    const configuredPlayers: ConfiguredPlayer[] = colors.map((c) => {
      const label = colorDetails[c].label;
      const isHuman = mode === 'local' ? true : c === humanColor;
      return {
        name: isHuman ? `${label} Player` : `${label} CPU`,
        isHuman,
        color: c,
        difficulty: isHuman ? undefined : difficulty,
      };
    });

    setupGame(configuredPlayers);
  };

  return (
    <div className="splash-container" style={{ '--theme-color-1': '#ef4444', '--theme-color-2': '#a855f7', '--theme-shadow': 'rgba(239,68,68,0.4)' } as React.CSSProperties}>
      
      {/* Background artwork specific to Ludo */}
      <div className="splash-bg" style={{
        background: `radial-gradient(circle at 30% 50%, rgba(239,68,68,0.12) 0%, transparent 50%),
                     radial-gradient(circle at 70% 30%, rgba(168,85,247,0.1) 0%, transparent 50%),
                     linear-gradient(135deg, #020617 0%, #0a0515 100%)`
      }} />

      {/* Back button */}
      {onBackToArena && (
        <button className="splash-back-btn" onClick={() => { play('buttonClick'); onBackToArena(); }}>
          <ArrowLeft size={16} /> Arena
        </button>
      )}

      {/* Sound toggle at top right */}
      <button 
        onClick={() => { play('buttonClick'); toggleMute(); }} 
        title={mute ? 'Unmute' : 'Mute'}
        style={{
          position: 'absolute', top: '40px', right: 'clamp(20px, 4vw, 60px)',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer',
          color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease', zIndex: 50, backdropFilter: 'blur(8px)'
        }}
      >
        {mute ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      <div className="splash-content">
        
        {/* LEFT: Branding & Modes */}
        <div className="splash-left">
          <div className="splash-logo-wrap">
            <div className="splash-icon" style={{ borderColor: 'rgba(239,68,68,0.3)', boxShadow: '0 20px 40px rgba(239,68,68,0.2)' }}>
              🎲
            </div>
            <div>
              <h1 className="splash-title">Ludo Royale</h1>
              <p className="splash-subtitle">A classic board game reimagined for the modern arcade.</p>
            </div>
          </div>

          <div className="splash-modes">
            <button 
              className={`splash-mode-btn ${mode === 'cpu' ? 'active' : ''}`}
              style={mode === 'cpu' ? { '--theme-color': 'rgba(239,68,68,0.15)', '--theme-border': 'rgba(239,68,68,0.4)', '--theme-shadow': 'rgba(239,68,68,0.2)', '--theme-icon': '#ef4444' } as React.CSSProperties : {}}
              onClick={() => { play('popupOpen'); setMode('cpu'); }}
            >
              <Cpu className="splash-mode-btn-icon" />
              <div className="splash-mode-btn-content">
                <h3>Vs Computer</h3>
                <p>Play against AI opponents</p>
              </div>
            </button>
            <button 
              className={`splash-mode-btn ${mode === 'local' ? 'active' : ''}`}
              style={mode === 'local' ? { '--theme-color': 'rgba(168,85,247,0.15)', '--theme-border': 'rgba(168,85,247,0.4)', '--theme-shadow': 'rgba(168,85,247,0.2)', '--theme-icon': '#a855f7' } as React.CSSProperties : {}}
              onClick={() => { play('popupOpen'); setMode('local'); }}
            >
              <Users className="splash-mode-btn-icon" />
              <div className="splash-mode-btn-content">
                <h3>Pass & Play</h3>
                <p>Play locally with friends</p>
              </div>
            </button>
          </div>
        </div>

        {/* RIGHT: Config Panel */}
        <div className="splash-right">
          <div className="splash-config-panel">
            
            {/* Color Selection */}
            <div className="splash-config-section">
              <span className="splash-config-label">Select Your Color</span>
              <div className="splash-config-options">
                {PIN_ORDER.map((c) => {
                  const selected = humanColor === c;
                  return (
                    <button
                      key={c}
                      className={`splash-option-btn ${selected ? 'active' : ''}`}
                      style={selected ? { '--theme-color': colorDetails[c].hex, '--theme-border': colorDetails[c].hex, '--theme-shadow': `rgba(0,0,0,0)` } as React.CSSProperties : {}}
                      onClick={() => { play('buttonClick'); setHumanColor(c); }}
                    >
                      {colorDetails[c].label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Players Selection */}
            <div className="splash-config-section">
              <span className="splash-config-label">Players</span>
              <div className="splash-config-options">
                {([2, 4] as const).map((count) => {
                  const selected = playerCount === count;
                  return (
                    <button
                      key={count}
                      className={`splash-option-btn ${selected ? 'active' : ''}`}
                      style={selected ? { '--theme-color': 'rgba(255,255,255,0.15)', '--theme-border': 'rgba(255,255,255,0.4)', '--theme-shadow': 'rgba(255,255,255,0.1)' } as React.CSSProperties : {}}
                      onClick={() => { play('buttonClick'); setPlayerCount(count); }}
                    >
                      {count} Players
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Selection */}
            {mode === 'cpu' && (
              <div className="splash-config-section">
                <span className="splash-config-label">Bot Difficulty</span>
                <div className="splash-config-options">
                  {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((level) => {
                    const selected = difficulty === level;
                    const diffColors = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };
                    return (
                      <button
                        key={level}
                        className={`splash-option-btn ${selected ? 'active' : ''}`}
                        style={selected ? { '--theme-color': `${diffColors[level]}33`, '--theme-border': diffColors[level], '--theme-shadow': 'rgba(0,0,0,0)', 'color': diffColors[level] } as React.CSSProperties : {}}
                        onClick={() => { play('buttonClick'); setDifficulty(level); }}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button className="splash-play-btn" onClick={() => { play('buttonClick'); handlePlay(); }}>
              <Play size={20} fill="currentColor" /> Start Game
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
