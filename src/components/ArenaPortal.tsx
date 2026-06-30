import { useState, useEffect } from 'react';
import { Play, Search } from 'lucide-react';

interface GameItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'playable' | 'upcoming';
  tags: string[];
  accentColor: string;
  glowColor: string;
}

const gamesList: GameItem[] = [
  {
    id: 'ludo',
    title: 'Ludo Royale',
    description: 'Premium Ludo experience. Smart AI bots, bouncy 3D gotis, tumbling 3D dice, and smooth canvas gameplay.',
    icon: '🎲',
    status: 'playable',
    tags: ['AI', 'Multiplayer', '2-4 Players'],
    accentColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.35)',
  },
  {
    id: 'chess',
    title: 'Chess Pro',
    description: 'Play with strong AI bot or local offline friend. Complete move history log, checkmate highlights.',
    icon: '♟',
    status: 'playable',
    tags: ['AI', 'Strategy', '2 Players'],
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.25)',
  },
  {
    id: 'snake_ladder',
    title: 'Snake & Ladder',
    description: 'Procedural dice, slides, chutes and ladders. Local pass-and-play or vs active computer bots.',
    icon: '🎯',
    status: 'upcoming',
    tags: ['Family', '2-4 Players'],
    accentColor: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.25)',
  },
  {
    id: 'tic_tac_toe',
    title: 'Tic Tac Toe',
    description: 'Neon styled X & O grids. Minimax bot engine that never makes mistakes.',
    icon: '❌',
    status: 'upcoming',
    tags: ['AI', '2 Players', 'Quick'],
    accentColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.25)',
  },
  {
    id: 'snake_game',
    title: 'Snake Game',
    description: 'Grow your snake, eat apples, avoid walls. Retro arcade classic, modernized with smooth canvas rendering.',
    icon: '🐍',
    status: 'upcoming',
    tags: ['Arcade', 'Solo', 'Highscore'],
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.25)',
  },
  {
    id: 'sudoku',
    title: 'Sudoku',
    description: 'Endless puzzles across Easy, Medium, Hard, and Expert difficulties with a hint system.',
    icon: '🧩',
    status: 'upcoming',
    tags: ['Puzzle', 'Solo', 'Logic'],
    accentColor: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.25)',
  },
  {
    id: 'card_games',
    title: 'Card Games',
    description: 'Solitaire and Blackjack in one suite. Smooth card animations with a premium casino feel.',
    icon: '🃏',
    status: 'upcoming',
    tags: ['Cards', 'Casino', 'Solo'],
    accentColor: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.25)',
  },
  {
    id: 'pong',
    title: 'Pong Arcade',
    description: 'Retro paddle physics. Face off against a progressively faster AI opponent.',
    icon: '🏓',
    status: 'upcoming',
    tags: ['Arcade', 'AI', '2 Players'],
    accentColor: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.25)',
  },
];

interface ArenaPortalProps {
  onSelectGame: (gameId: string) => void;
}

export default function ArenaPortal({ onSelectGame }: ArenaPortalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'playable' | 'upcoming'>('all');

  const playableGames = gamesList.filter(g => g.status === 'playable');
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % playableGames.length);
    }, 5000); // Rotate every 5 seconds
    return () => clearInterval(interval);
  }, [playableGames.length]);

  const featuredGame = playableGames[featuredIndex];
  
  const filteredGames = gamesList.filter((game) => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = activeFilter === 'all' || game.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const playableCount = gamesList.filter(g => g.status === 'playable').length;
  const upcomingCount = gamesList.filter(g => g.status === 'upcoming').length;

  return (
    <div className="ap-root">
      {/* Animated Background */}
      <div className="ap-bg">
        <div className="ap-bg-sym" style={{ top: '10%', left: '15%', fontSize: '120px', animationDelay: '0s' }}>🎲</div>
        <div className="ap-bg-sym" style={{ top: '60%', left: '85%', fontSize: '180px', animationDelay: '2s' }}>♟</div>
        <div className="ap-bg-sym" style={{ top: '80%', left: '20%', fontSize: '100px', animationDelay: '1s' }}>🎮</div>
      </div>
      
      {/* ── HERO SECTION ── */}
      <header className="ap-hero">
        <div className="ap-hero-eyebrow">
          <div className="ap-live-dot" /> LOCAL PLAY ACTIVE
        </div>
        
        <h1 className="ap-hero-title">
          <span className="ap-gradient-text">OpenBoard</span> Arcade
        </h1>
        
        <p className="ap-hero-sub">
          Select a game to start playing locally. Runs 100% offline with zero latency.
        </p>
        
        <div className="ap-stats">
          <div className="ap-stat">
            <span className="ap-stat-num">{playableCount}</span>
            <span className="ap-stat-label">Playable</span>
          </div>
          <div className="ap-stat-divider" />
          <div className="ap-stat">
            <span className="ap-stat-num">{upcomingCount}</span>
            <span className="ap-stat-label">Upcoming</span>
          </div>
        </div>
      </header>

      {/* ── FEATURED GAME ── */}
      <section className="ap-section">
        <div className="ap-section-label">Featured Game</div>
        
        <div className="ap-featured-card" onClick={() => featuredGame.status === 'playable' && onSelectGame(featuredGame.id)}>
          <div className="ap-featured-left">
            <div className="ap-featured-icon">{featuredGame.icon}</div>
            <div>
              <div className="ap-featured-badge">● {featuredGame.status === 'playable' ? 'Playable' : 'Upcoming'}</div>
              <h2 className="ap-featured-title">{featuredGame.title}</h2>
              <p className="ap-featured-desc">{featuredGame.description}</p>
              
              <div className="ap-featured-tags">
                {featuredGame.tags.map(t => (
                  <span className="ap-tag" key={t}>{t}</span>
                ))}
              </div>
              
              <button 
                className="ap-cta-primary ap-featured-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectGame(featuredGame.id);
                }}
              >
                <Play size={16} fill="currentColor" /> Play Now
              </button>
            </div>
          </div>
          
          <div className="ap-featured-right">
            <div className="ap-board-preview">
              <div className="ap-board-grid">
                {/* 5x5 decorative grid to look like a board */}
                {Array.from({ length: 25 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="ap-board-cell"
                    style={{
                      background: i % 2 === 0 ? 'rgba(255,255,255,0.04)' : featuredGame.glowColor,
                      border: i === 12 ? `1px solid ${featuredGame.accentColor}` : 'none'
                    }}
                  />
                ))}
              </div>
              <span className="ap-board-label">Render Engine Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── GAMES GRID ── */}
      <section className="ap-section">
        <div className="ap-section-label">The Arcade Collection</div>
        
        <div className="ap-toolbar">
          <div className="ap-search-wrap">
            <Search size={16} className="ap-search-icon" />
            <input
              type="text"
              className="ap-search"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="ap-filters">
            {([
              { key: 'all', label: `All (${gamesList.length})` },
              { key: 'playable', label: `Playable (${gamesList.filter(g => g.status === 'playable').length})` },
              { key: 'upcoming', label: `Soon (${gamesList.filter(g => g.status === 'upcoming').length})` },
            ] as const).map(f => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`ap-filter-btn ${activeFilter === f.key ? 'active' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="ap-grid">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              onClick={() => game.status === 'playable' && onSelectGame(game.id)}
              className={`ap-card ${game.status === 'playable' ? 'ap-card-playable' : 'ap-card-upcoming'}`}
              style={{
                '--card-accent': game.accentColor,
                '--card-glow': game.glowColor
              } as React.CSSProperties}
            >
              <div className="ap-card-glow-bg" />
              
              <div className="ap-card-header">
                <span className="ap-card-icon">{game.icon}</span>
                <span className={`ap-card-status ${game.status}`}>
                  {game.status === 'playable' ? '● Playable' : '○ Upcoming'}
                </span>
              </div>

              <h3 className="ap-card-title">{game.title}</h3>
              <p className="ap-card-desc">{game.description}</p>

              <div className="ap-card-tags">
                {game.tags.map(t => (
                  <span className="ap-tag-sm" key={t}>{t}</span>
                ))}
              </div>

              <div className="ap-card-footer">
                <button
                  disabled={game.status !== 'playable'}
                  className={`ap-card-btn ${game.status}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (game.status === 'playable') onSelectGame(game.id);
                  }}
                >
                  {game.status === 'playable' ? (
                    <><Play size={13} fill="currentColor" /> Play Now</>
                  ) : (
                    'Coming Soon'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="ap-empty">
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🔍</span>
            <p style={{ margin: 0 }}>No games found matching "<strong>{searchQuery}</strong>"</p>
          </div>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer className="ap-footer">
        <div className="ap-footer-brand">
          <span className="ap-footer-logo">OpenBoard</span>
          <span className="ap-footer-version">v1.1.0</span>
        </div>
        <p className="ap-footer-tagline">Local Host Dashboard & Game Launcher</p>
        
        <div className="ap-footer-links">
          <a href="#">Arcade Core</a>
          <span className="ap-footer-dot">·</span>
          <a href="#">Offline Play</a>
          <span className="ap-footer-dot">·</span>
          <a href="#">Render Engine</a>
        </div>
      </footer>
    </div>
  );
}
