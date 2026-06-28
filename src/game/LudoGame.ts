import Phaser from 'phaser';
import MainScene from './scenes/MainScene';

export function initLudoGame(containerId: string): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 600,
    height: 600,
    parent: containerId,
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
      },
    },
    scene: [MainScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    transparent: true,
  };

  return new Phaser.Game(config);
}
