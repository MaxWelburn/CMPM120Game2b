"use strict"

let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    physics: {
      default: 'arcade',
      arcade: {debug: false}
    },
    render: {
        pixelArt: true
    },
    width: 720/2,
    height: 1280/2,
    scene: [IntroScene, ControlsScene, GameScene, GameOverScene]
}

const game = new Phaser.Game(config);