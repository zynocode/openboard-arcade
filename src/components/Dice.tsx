import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { PlayerColor } from '../store/gameStore';

interface DiceProps {
  onRoll?: () => void;
  compact?: boolean;
}

// Face rotation map: target rotateX / rotateY to show each face
// Face 1 = front, 2 = back, 3 = right, 4 = left, 5 = top, 6 = bottom
const FACE_ROTATIONS: Record<number, { x: number; y: number }> = {
  1: { x:   0, y:   0 },   // front  face = 1
  2: { x:   0, y: 180 },   // back   face = 6 → remapped below
  3: { x:   0, y:  -90 },  // right  face = 2
  4: { x:   0, y:  90 },   // left   face = 5
  5: { x: -90, y:   0 },   // top    face = 3
  6: { x:  90, y:   0 },   // bottom face = 4
};

// Pip positions for each value (on a 3×3 grid, 1-indexed positions 1-9)
//  1 2 3
//  4 5 6
//  7 8 9
const PIPS: Record<number, number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
};

// Map dice value (1-6) to which face shows it
// Face layout: front=1, right=2, top=3, bottom=4, left=5, back=6
const VALUE_TO_FACE: Record<number, number> = {
  1: 1,   // front
  2: 3,   // right
  3: 5,   // top
  4: 6,   // bottom
  5: 4,   // left
  6: 2,   // back
};

function DiceFace({ value, colorHex }: { value: number; colorHex: string }) {
  const pips = PIPS[value] || [];
  const size = 10;

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: 'repeat(3, 1fr)',
      padding: '14%',
      boxSizing: 'border-box',
      gap: '4%',
    }}>
      {Array.from({ length: 9 }).map((_, i) => {
        const pos = i + 1;
        const hasPip = pips.includes(pos);
        return (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {hasPip && (
              <div style={{
                width: `${size}px`, height: `${size}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 30%, #fff 0%, ${colorHex} 80%)`,
                boxShadow: `0 1px 3px rgba(0,0,0,0.5), 0 0 6px ${colorHex}88`,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Dice({ onRoll, compact = false }: DiceProps = {}) {
  const { diceValue, gameStatus, players, activePlayerIndex, rollDice } = useGameStore();

  const handleRoll = onRoll ?? rollDice;

  const activePlayer = players[activePlayerIndex];
  const isHuman = activePlayer?.isHuman ?? false;
  const isRolling = gameStatus === 'ROLLING';
  const canRoll = gameStatus === 'WAITING_FOR_ROLL' && isHuman;

  const getColorHex = (color: PlayerColor) => {
    switch (color) {
      case 'red': return '#ef4444';
      case 'green': return '#22c55e';
      case 'yellow': return '#eab308';
      case 'blue': return '#3b82f6';
      default: return '#ffffff';
    }
  };

  const activeColorHex = activePlayer ? getColorHex(activePlayer.color) : '#6366f1';

  // Track animation state
  const [rotation, setRotation] = useState({ x: -20, y: 30 });
  const rotationRef = useRef({ x: -20, y: 30 });
  const [isAnimating, setIsAnimating] = useState(false);
  const animRef = useRef<number | null>(null);
  const prevIsRolling = useRef(false);

  // Keep ref in sync with state
  const updateRotation = (r: { x: number; y: number }) => {
    rotationRef.current = r;
    setRotation(r);
  };

  // When rolling starts, begin the tumble animation
  useEffect(() => {
    if (isRolling && !prevIsRolling.current) {
      setIsAnimating(true);
      // 2+ full 3D spins in random direction
      const cur = rotationRef.current;
      const spinX = cur.x - 720 - Math.random() * 360;
      const spinY = cur.y + 720 + Math.random() * 360;
      updateRotation({ x: spinX, y: spinY });
    }

    // When rolling stops, settle on the exact face for diceValue
    if (!isRolling && prevIsRolling.current && diceValue > 0) {
      const face = VALUE_TO_FACE[diceValue];
      const target = FACE_ROTATIONS[face];
      const cur = rotationRef.current;
      // Nearest full-rotation base so the die doesn't jump backwards
      const baseX = Math.round(cur.x / 360) * 360;
      const baseY = Math.round(cur.y / 360) * 360;
      setTimeout(() => {
        updateRotation({ x: baseX + target.x, y: baseY + target.y });
        setIsAnimating(false);
      }, 80);
    }

    prevIsRolling.current = isRolling;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRolling, diceValue]);

  const size = compact ? 64 : 80;
  const faceSize = size;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const faceStyle = (transform: string, faceValue: number): React.CSSProperties => ({
    position: 'absolute',
    width: `${faceSize}px`,
    height: `${faceSize}px`,
    background: isAnimating
      ? `linear-gradient(145deg, rgba(20,30,50,0.97), rgba(10,18,35,0.99))`
      : `linear-gradient(145deg, rgba(15,23,42,0.98), rgba(8,14,28,0.99))`,
    border: `2px solid ${isRolling || isAnimating ? 'rgba(255,255,255,0.15)' : activeColorHex}`,
    borderRadius: compact ? '12px' : '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `inset 0 2px 8px rgba(255,255,255,0.07), inset 0 -2px 6px rgba(0,0,0,0.5)`,
    transform,
    backfaceVisibility: 'visible',
    overflow: 'hidden',
  });

  const half = faceSize / 2;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: compact ? '6px' : '10px',
      width: compact ? 'auto' : '100%',
    }}>
      {/* 3D Dice Scene */}
      <div
        onClick={() => canRoll && handleRoll()}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          perspective: `${size * 4}px`,
          cursor: canRoll ? 'pointer' : 'default',
          filter: (!canRoll && !isRolling) ? 'brightness(0.6)' : 'none',
          transition: 'filter 0.3s ease',
        }}
        aria-label={canRoll ? 'Roll dice' : 'Waiting'}
      >
        {/* Glow ring behind dice for active state */}
        {(canRoll || isRolling) && (
          <div style={{
            position: 'absolute',
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: compact ? '16px' : '20px',
            background: 'transparent',
            boxShadow: `0 0 ${isRolling ? '28px' : '18px'} ${activeColorHex}${isRolling ? '88' : '44'}`,
            pointerEvents: 'none',
            transition: 'box-shadow 0.3s ease',
            zIndex: -1,
          }} />
        )}

        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: isAnimating
              ? `transform ${isRolling ? '0.4s' : '0.6s'} cubic-bezier(0.25, 0.46, 0.45, 0.94)`
              : 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Front  = 1 */}
          <div style={faceStyle(`translateZ(${half}px)`, 1)}>
            <DiceFace value={1} colorHex={activeColorHex} />
          </div>
          {/* Back   = 6 */}
          <div style={faceStyle(`rotateY(180deg) translateZ(${half}px)`, 6)}>
            <DiceFace value={6} colorHex={activeColorHex} />
          </div>
          {/* Right  = 2 */}
          <div style={faceStyle(`rotateY(90deg) translateZ(${half}px)`, 2)}>
            <DiceFace value={2} colorHex={activeColorHex} />
          </div>
          {/* Left   = 5 */}
          <div style={faceStyle(`rotateY(-90deg) translateZ(${half}px)`, 5)}>
            <DiceFace value={5} colorHex={activeColorHex} />
          </div>
          {/* Top    = 3 */}
          <div style={faceStyle(`rotateX(90deg) translateZ(${half}px)`, 3)}>
            <DiceFace value={3} colorHex={activeColorHex} />
          </div>
          {/* Bottom = 4 */}
          <div style={faceStyle(`rotateX(-90deg) translateZ(${half}px)`, 4)}>
            <DiceFace value={4} colorHex={activeColorHex} />
          </div>
        </div>
      </div>

      {/* Roll label — only in non-compact, canRoll state */}
      {canRoll && !compact && (
        <span style={{
          fontSize: '10px',
          fontFamily: "'Chakra Petch', monospace",
          color: activeColorHex,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          animation: 'pulse 1.5s infinite',
          textShadow: `0 0 10px ${activeColorHex}44`,
        }}>
          Tap to Roll
        </span>
      )}
    </div>
  );
}
