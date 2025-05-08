window.isDead = false;
window.fuel = 100;
window.score = 0;
window.highestScore = parseInt(localStorage.getItem('highestScore')) || 0;
window.fuelDamage = 1;
window.difficulty = "easy";

class IntroScene extends Phaser.Scene {
    constructor() {
        super("IntroScene");
    }

    preload() {
        this.load.image('stars', 'assets/space.png');
        this.load.image('sun', 'assets/sun.png');
        this.load.image('earth', 'assets/earth.png');
        this.load.image('moon', 'assets/moon.png');
        this.load.image('plane', 'assets/plane.png');
    }

    create() {
        const {width, height} = this.sys.game.config;
        const stars = this.add.image(width/2, height/2, 'stars').setOrigin(0.5);
        const sun = this.add.image(width/50, height / 50, 'sun').setScale(0.5);
        this.moon  = this.add.image(width/2 + 100, height * 0.6, 'moon').setOrigin(0.5).setScale(0.1);
        this.earth = this.add.image(width/2, 20, 'earth').setOrigin(0.5).setScale(2);
        this.plane = this.add.image(width/2, height * 0.9, 'plane').setOrigin(0.5);
        this.isCutscene = false;
        this.difficultyLevels = ['Easy', 'Medium', 'Hard'];
        this.difficultyIndex = 0;
        window.isDead = false;
        window.fuel = 100;
        window.score = 0;
        window.highestScore = parseInt(localStorage.getItem('highestScore')) || 0;
        window.fuelDamage = 1;
        window.difficulty = "easy";
        
        this.difficultyButton = this.add.text(width/2 - 68, height - 70, `Difficulty: ${this.difficultyLevels[this.difficultyIndex]}`, {
            font: '20px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0, 0).setInteractive();
        this.difficultyButton
        .on('pointerover',  () => this.difficultyButton.setStyle({fill: "#ddd"}))
        .on('pointerout',   () => this.difficultyButton.setStyle({fill: "#fff"}))

        this.difficultyButton.on('pointerdown', () => {
            this.difficultyIndex = (this.difficultyIndex + 1) % this.difficultyLevels.length;
            const diff = this.difficultyLevels[this.difficultyIndex];
            window.difficulty = this.difficultyIndex + 1;
            let label = "Difficulty: ";
            this.difficultyButton.setText(`${label}${diff}`);
            window.difficulty = diff.toLowerCase();
            console.log(window.difficulty);
        });
        const play = this.add
            .text(width/2, height - 100, '► PLAY ◄', {
            font: '35px Arial',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setInteractive();
        play
        .on('pointerover',  () => play.setStyle({fill: "#ff0"}))
        .on('pointerout',   () => play.setStyle({fill: "#0f0"}))
        .on('pointerdown', () => {
            window.isDead = false;
            window.fuel = 100;
            window.score = 0;
            window.highestScore = parseInt(localStorage.getItem('highestScore')) || 0;
            window.fuelDamage = 1;
            this.isCutscene = true;
            play.disableInteractive();
            play.setVisible(false);
            this.difficultyButton.disableInteractive();
            this.difficultyButton.setVisible(false);
            this.cameras.main.pan(this.earth.x, this.earth.y-900, 2000, 'Power2');
            this.cameras.main.zoomTo(4, 2000, 'Power2');
            this.cameras.main.fadeOut(2000, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene');
            });
        });
        if (window.score > 0) {
            this.add.text(width/2, height - 100, `SCORE: ${window.score}`, {
                font: '28px Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);
        }
        const controls = this.add.text(width/2, height - 20, 'CONTROLS', {
            font: '20px Arial', fill: '#00aaff', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5).setInteractive();
        controls.on('pointerover', () => controls.setStyle({fill: '#33ccff'}));
        controls.on('pointerout', () => controls.setStyle({fill: '#00aaff'}));
        controls.on('pointerdown', () => {
            this.scene.launch('ControlsScene');
            this.scene.pause('IntroScene');
        });
    }

    update() {
        if (!this.isCutscene) {
            const {width, height} = this.sys.game.config;
            const p = this.input.activePointer;
            const ox = (p.x - width/2) / (width/2);
            const oy = (p.y - height/2) / (height/2);
            this.earth.setPosition(
                width/2 + ox * 10,
                height * 2.2 + oy * 10
            );
            this.moon.setPosition(
                width/2 + 100 + ox * 5,
                height * 0.6 + oy * 5
            );
            this.plane.setPosition(
                width/2 + ox * 20,
                height * 0.75 + oy * 20
            );
        }
    }
}

window.IntroScene = IntroScene;
