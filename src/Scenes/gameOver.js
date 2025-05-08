class GameOverScene extends Phaser.Scene {
    constructor() {
        super("GameOverScene");
    }

    preload() {
        this.load.audio('gameOver', 'assets/gameOver.mp3');
    }

    create() {
        this.sound.stopAll();
        const { width, height } = this.sys.game.config;
        
        const snd = this.sound.add('gameOver', { volume: 0.3 }); snd.play(); snd.once('complete', () => snd.destroy());

        this.add.text(width / 2, height / 2 - 80, '💀 GAME OVER 💀', {
            font: '35px Arial',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2, `Score: ${Math.floor(window.score)}`, {
            font: '28px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 40, `High Score: ${window.highestScore}`, {
            font: '24px Arial',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        const retryButton = this.add.text(width / 2, height / 2 + 100, '↻ RETRY', {
            font: '32px Arial',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setInteractive();

        retryButton
            .on('pointerover', () => retryButton.setStyle({ fill: '#ffff00' }))
            .on('pointerout', () => retryButton.setStyle({ fill: '#00ff00' }))
            .on('pointerdown', () => {
                window.score = 0;
                window.fuel = 100;
                window.isDead = false;
                this.scene.start("IntroScene");
            });
    }
}

window.GameOverScene = GameOverScene;
