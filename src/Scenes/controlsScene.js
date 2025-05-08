class ControlsScene extends Phaser.Scene {
    constructor() {
        super('ControlsScene');
    }

    create() {
        const { width, height } = this.sys.game.config;
        this.add.rectangle(width/2, height/2, width*0.8, height*0.6, 0x000000, 0.7).setOrigin(0.5);
        const lines = [
            'Controls',
            'A: Move Left',
            'D: Move Right',
            'SPACE: Shoot'
        ];
        lines.forEach((text, i) => {
            this.add.text(width/2, height/2 - 60 + i*30, text, {
                font: '24px Arial', fill: '#ffffff', stroke: '#000000', strokeThickness: 4
            }).setOrigin(0.5);
        });
        const closeX = this.add.text(
            width/2 + width*0.4 - 20,
            height/2 - height*0.3 + 20,
            'X', { font: '28px Arial', fill: '#ff4444' }
        ).setOrigin(0.5).setInteractive();
        closeX.on('pointerdown', () => {
            this.scene.stop('ControlsScene');
            this.scene.resume('IntroScene');
        });
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.stop('ControlsScene');
            this.scene.resume('IntroScene');
        });
    }
}

window.ControlsScene = ControlsScene;
