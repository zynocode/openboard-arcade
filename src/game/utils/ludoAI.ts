import type { Player, AIDifficulty } from '../../store/gameStore';
import { safeZonesGlobalIndices, startIndices } from './boardCoordinates';

/**
 * Evaluates the best token index to move for a CPU player based on difficulty level
 */
export function evaluateCPUMove(
  players: Player[],
  activePlayerIdx: number,
  validMoves: number[],
  roll: number,
  difficulty: AIDifficulty
): number {
  if (validMoves.length === 0) return -1;
  if (validMoves.length === 1) return validMoves[0];

  // 1. Easy Mode: Random choice
  if (difficulty === 'easy') {
    const randomIdx = Math.floor(Math.random() * validMoves.length);
    return validMoves[randomIdx];
  }

  const activePlayer = players[activePlayerIdx];

  // Helpers for threat & capture evaluations
  const isGlobalCellSafe = (globalIdx: number): boolean => {
    return safeZonesGlobalIndices.includes(globalIdx);
  };

  const getGlobalPathIndex = (playerIndex: number, relativePos: number): number => {
    if (relativePos < 0 || relativePos > 50) return -1; // Not on common board path
    const startIdx = startIndices[playerIndex];
    return (startIdx + relativePos) % 52;
  };

  // Check if an opponent token can capture a cell within 6 spaces
  const isCellThreatened = (globalCellIdx: number): boolean => {
    if (isGlobalCellSafe(globalCellIdx)) return false;

    // Check all opponent tokens
    for (let pIdx = 0; pIdx < players.length; pIdx++) {
      if (pIdx === activePlayerIdx) continue; // Skip ourselves

      const opp = players[pIdx];
      for (let tIdx = 0; tIdx < 4; tIdx++) {
        const oppPos = opp.tokens[tIdx];
        if (oppPos >= 0 && oppPos <= 50) {
          const oppGlobalIdx = getGlobalPathIndex(pIdx, oppPos);
          if (oppGlobalIdx !== -1) {
            const distance = (globalCellIdx - oppGlobalIdx + 52) % 52;
            if (distance >= 1 && distance <= 6) {
              return true; // Threat detected
            }
          }
        }
      }
    }
    return false;
  };

  // Check if a move results in a capture
  const checkWillCapture = (targetGlobalIdx: number): boolean => {
    if (targetGlobalIdx === -1 || isGlobalCellSafe(targetGlobalIdx)) return false;

    for (let pIdx = 0; pIdx < players.length; pIdx++) {
      if (pIdx === activePlayerIdx) continue;

      const opp = players[pIdx];
      for (let tIdx = 0; tIdx < 4; tIdx++) {
        const oppPos = opp.tokens[tIdx];
        if (oppPos >= 0 && oppPos <= 50) {
          const oppGlobalIdx = getGlobalPathIndex(pIdx, oppPos);
          if (oppGlobalIdx === targetGlobalIdx) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // 2. Medium Mode: Simple priority list
  if (difficulty === 'medium') {
    // Priority 1: Capture
    for (const tokenIdx of validMoves) {
      const curPos = activePlayer.tokens[tokenIdx];
      const nextPos = curPos === -1 ? 0 : curPos + roll;
      const targetGlobalIdx = getGlobalPathIndex(activePlayerIdx, nextPos);
      if (checkWillCapture(targetGlobalIdx)) {
        return tokenIdx;
      }
    }

    // Priority 2: Escape danger
    for (const tokenIdx of validMoves) {
      const curPos = activePlayer.tokens[tokenIdx];
      if (curPos >= 0 && curPos <= 50) {
        const curGlobalIdx = getGlobalPathIndex(activePlayerIdx, curPos);
        if (isCellThreatened(curGlobalIdx)) {
          // Verify if next position is safe or not threatened
          const nextPos = curPos + roll;
          const nextGlobalIdx = getGlobalPathIndex(activePlayerIdx, nextPos);
          if (nextGlobalIdx === -1 || !isCellThreatened(nextGlobalIdx) || isGlobalCellSafe(nextGlobalIdx)) {
            return tokenIdx;
          }
        }
      }
    }

    // Priority 3: Release from base
    if (roll === 6) {
      const baseTokenIdx = validMoves.find(idx => activePlayer.tokens[idx] === -1);
      if (baseTokenIdx !== undefined) {
        return baseTokenIdx;
      }
    }

    // Priority 4: Lead token closest to home
    let bestTokenIdx = validMoves[0];
    let maxPos = -2;
    validMoves.forEach((tokenIdx) => {
      const pos = activePlayer.tokens[tokenIdx];
      if (pos > maxPos) {
        maxPos = pos;
        bestTokenIdx = tokenIdx;
      }
    });

    return bestTokenIdx;
  }

  // 3. Hard Mode: Scoring matrix evaluation (Advanced Expert AI)
  let bestTokenIdx = validMoves[0];
  let highestScore = -Infinity;

  const getCaptureValue = (targetGlobalIdx: number): number => {
    if (targetGlobalIdx === -1 || isGlobalCellSafe(targetGlobalIdx)) return -1;
    let maxCap = -1;
    for (let pIdx = 0; pIdx < players.length; pIdx++) {
      if (pIdx === activePlayerIdx) continue;
      players[pIdx].tokens.forEach(oppPos => {
        if (oppPos >= 0 && oppPos <= 50 && getGlobalPathIndex(pIdx, oppPos) === targetGlobalIdx) {
          maxCap = Math.max(maxCap, oppPos);
        }
      });
    }
    return maxCap;
  };

  const getThreatScore = (globalCellIdx: number): number => {
    if (globalCellIdx === -1 || isGlobalCellSafe(globalCellIdx)) return 0;
    let totalThreat = 0;
    for (let pIdx = 0; pIdx < players.length; pIdx++) {
      if (pIdx === activePlayerIdx) continue;
      players[pIdx].tokens.forEach(oppPos => {
        if (oppPos >= 0 && oppPos <= 50) {
          const distance = (globalCellIdx - getGlobalPathIndex(pIdx, oppPos) + 52) % 52;
          if (distance >= 1 && distance <= 6) {
             // 6 is slightly more likely due to tension engine boosting 6s
             totalThreat += (distance === 6 ? 40 : 25); 
          }
        }
      });
    }
    return totalThreat;
  };

  const getStalkingBonus = (globalCellIdx: number): number => {
    if (globalCellIdx === -1) return 0;
    let bonus = 0;
    for (let pIdx = 0; pIdx < players.length; pIdx++) {
      if (pIdx === activePlayerIdx) continue;
      players[pIdx].tokens.forEach(oppPos => {
        if (oppPos >= 15 && oppPos <= 50) { // Opponent is advanced
          const oppGlobal = getGlobalPathIndex(pIdx, oppPos);
          const distanceBehind = (oppGlobal - globalCellIdx + 52) % 52;
          if (distanceBehind >= 1 && distanceBehind <= 6) {
             bonus = Math.max(bonus, 35); // Stalking an advanced opponent
          }
        }
      });
    }
    return bonus;
  };

  const getWingmanBonus = (globalCellIdx: number, excludeTokenIdx: number): number => {
    if (globalCellIdx === -1) return 0;
    let bonus = 0;
    activePlayer.tokens.forEach((pos, idx) => {
      if (idx !== excludeTokenIdx && pos >= 0 && pos <= 50) {
         const friendlyGlobal = getGlobalPathIndex(activePlayerIdx, pos);
         const distanceBehind = (globalCellIdx - friendlyGlobal + 52) % 52;
         if (distanceBehind >= 1 && distanceBehind <= 6) {
            bonus = 20; // Protected by a friendly token behind
         }
      }
    });
    return bonus;
  };

  validMoves.forEach((tokenIdx) => {
    const curPos = activePlayer.tokens[tokenIdx];
    const nextPos = curPos === -1 ? 0 : curPos + roll;
    const curGlobalIdx = getGlobalPathIndex(activePlayerIdx, curPos);
    const nextGlobalIdx = getGlobalPathIndex(activePlayerIdx, nextPos);

    let score = 0;

    // A. Capture Opponent: Bounty System (Priority 1)
    const captureVal = getCaptureValue(nextGlobalIdx);
    if (captureVal !== -1) {
      // Base capture score 200, plus bounty based on how far the opponent is (up to 50 * 3 = 150)
      score += 200 + (captureVal * 3);
    }

    // B. Reaching Goal
    if (nextPos === 56) {
      score += 180; // High priority to finish tokens
    }

    // C. Entering Home Column
    if (curPos < 51 && nextPos >= 51 && nextPos < 56) {
      score += 75;
    }

    // D. Escaping Imminent Threat
    const curThreat = getThreatScore(curGlobalIdx);
    const nextThreat = getThreatScore(nextGlobalIdx);
    
    if (curPos >= 0 && curPos <= 50 && curThreat > 0) {
      if (nextPos >= 51 || isGlobalCellSafe(nextGlobalIdx)) {
        score += curThreat * 2; // Huge bonus for moving to safety when threatened
      } else if (nextThreat < curThreat) {
        score += curThreat - nextThreat; // Bonus for moving to a less threatened square
      }
    }

    // E. Landing on Safe Zone
    const wasSafe = curPos >= 0 && curPos <= 50 && isGlobalCellSafe(curGlobalIdx);
    const isNowSafeZone = nextPos >= 0 && nextPos <= 50 && isGlobalCellSafe(nextGlobalIdx);
    if (!wasSafe && isNowSafeZone) {
      score += 50;
    }

    // F. Releasing from Base
    if (curPos === -1 && roll === 6) {
      score += 65;
    }

    // G. Probability-Based Danger Penalty
    if (!isNowSafeZone && nextPos >= 0 && nextPos <= 50) {
      score -= nextThreat;
    }

    // H. Psychological Stalking Bonus
    if (!isNowSafeZone && nextPos >= 0 && nextPos <= 50) {
      score += getStalkingBonus(nextGlobalIdx);
    }

    // I. Wingman Formation Bonus
    if (!isNowSafeZone && nextPos >= 0 && nextPos <= 50) {
      score += getWingmanBonus(nextGlobalIdx, tokenIdx);
    }

    // J. Proximity Progress Bonus
    score += nextPos * 0.5;

    // Pick maximum score
    if (score > highestScore) {
      highestScore = score;
      bestTokenIdx = tokenIdx;
    }
  });

  return bestTokenIdx;
}
