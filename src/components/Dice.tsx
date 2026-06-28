import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { PlayerColor } from '../store/gameStore';

interface DiceProps {
  onRoll?: () => void;
}

// Face rotation map: target rotateX / rotateY to show each face
const FACE_ROTATIONS: Record<number, { x: number; y: number }> = {
  1: { x:   0, y:   0 },   // front  face = 1
  2: { x:   0, y: 180 },   // back   face = 6
  3: { x:   0, y:  -90 },  // right  face = 2
  4: { x:   0, y:  90 },   // left   face = 5
  5: { x: -90, y:   0 },   // top    face = 3
  6: { x:  90, y:   0 },   // bottom face = 4
};

// Pip positions for each value on a 3x3 grid
const PIPS: Record<number, number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
};

// Map dice value (1-6) to which face shows it
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

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: 'repeat(3, 1fr)',
      padding: '12%',
      boxSizing: 'border-box',
      gap: '3%',
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
              <div className="dice-pip" style={{ '--dice-border-color': colorHex } as React.CSSProperties} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Dice({ onRoll }: DiceProps = {}) {
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

  const [rotation, setRotation] = useState({ x: -20, y: 30 });
  const rotationRef = useRef({ x: -20, y: 30 });
  const prevIsRolling = useRef(false);

  const updateRotation = (r: { x: number; y: number }) => {
    rotationRef.current = r;
    setRotation(r);
  };

  useEffect(() => {
    if (isRolling && !prevIsRolling.current) {
      const cur = rotationRef.current;
      const spinX = cur.x - 720 - Math.random() * 540;
      const spinY = cur.y + 720 + Math.random() * 540;
      updateRotation({ x: spinX, y: spinY });
    }

    if (!isRolling && prevIsRolling.current && diceValue > 0) {
      const face = VALUE_TO_FACE[diceValue];
      const target = FACE_ROTATIONS[face];
      const cur = rotationRef.current;
      const baseX = Math.round(cur.x / 360) * 360;
      const baseY = Math.round(cur.y / 360) * 360;
      
      updateRotation({ x: baseX + target.x, y: baseY + target.y });
    }

    prevIsRolling.current = isRolling;
  }, [isRolling, diceValue]);

  return (
    <div
      onClick={() => canRoll && handleRoll()}
      className="dice-scene"
      style={{
        cursor: canRoll ? 'pointer' : 'default',
        filter: (!canRoll && !isRolling) ? 'brightness(0.7)' : 'none',
        '--dice-border-color': activeColorHex
      } as React.CSSProperties}
      aria-label={canRoll ? 'Roll dice' : 'Waiting'}
    >
      {/* Glow ring behind dice for active state */}
      {(canRoll || isRolling) && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '25%',
          background: 'transparent',
          boxShadow: `0 0 ${isRolling ? '12px' : '6px'} ${activeColorHex}${isRolling ? '88' : '44'}`,
          pointerEvents: 'none',
          transition: 'box-shadow 0.3s ease',
          zIndex: -1,
        }} />
      )}

      <div
        className="dice-cube"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: isRolling
            ? 'transform 0.6s linear'
            : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.18)',
        }}
      >
        {/* Front  = 1 */}
        <div className="dice-face" style={{ transform: 'translateZ(calc(var(--dice-size) / 2))' }}>
          <DiceFace value={1} colorHex={activeColorHex} />
        </div>
        {/* Back   = 6 */}
        <div className="dice-face" style={{ transform: 'rotateY(180deg) translateZ(calc(var(--dice-size) / 2))' }}>
          <DiceFace value={6} colorHex={activeColorHex} />
        </div>
        {/* Right  = 2 */}
        <div className="dice-face" style={{ transform: 'rotateY(90deg) translateZ(calc(var(--dice-size) / 2))' }}>
          <DiceFace value={2} colorHex={activeColorHex} />
        </div>
        {/* Left   = 5 */}
        <div className="dice-face" style={{ transform: 'rotateY(-90deg) translateZ(calc(var(--dice-size) / 2))' }}>
          <DiceFace value={5} colorHex={activeColorHex} />
        </div>
        {/* Top    = 3 */}
        <div className="dice-face" style={{ transform: 'rotateX(90deg) translateZ(calc(var(--dice-size) / 2))' }}>
          <DiceFace value={3} colorHex={activeColorHex} />
        </div>
        {/* Bottom = 4 */}
        <div className="dice-face" style={{ transform: 'rotateX(-90deg) translateZ(calc(var(--dice-size) / 2))' }}>
          <DiceFace value={4} colorHex={activeColorHex} />
        </div>
      </div>
    </div>
  );
}
