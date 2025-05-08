class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    preload() {
        this.load.image('plane', 'assets/plane.png');
        this.load.image('laser', 'assets/laser.png');
        this.load.image('enemy', 'assets/enemy.png');
        this.load.image('enemyBullet', 'assets/enemyBullet.png');
        this.load.image('explosion', 'assets/explosion.png');
        this.load.image('flash1', 'assets/flash1.png');
        this.load.image('flash2', 'assets/flash2.png');
        this.load.image('flash3', 'assets/flash3.png');
        this.load.image('water', 'assets/water.png');
        this.load.image('map1', 'assets/map1.png');
        this.load.image('map2', 'assets/map2.png');
        this.load.image('map3', 'assets/map3.png');
        this.load.audio('planeSound', 'assets/planeSound.mp3');
        this.load.audio('shootSound', 'assets/shootSound.mp3');
        this.load.audio('enemyShootSound', 'assets/enemyShootSound.mp3');
    }

    create() {
        const {width, height} = this.sys.game.config;
        const levels = {easy: 1, medium: 2, hard: 4};
        this.damageMultiplier = levels[window.difficulty];
        this.water = this.add.image(0, 0, 'water').setOrigin(0, 0).setScale(20);
        this.mapKeys = ['map1','map2','map3'];
        let firstKey = Phaser.Math.RND.pick(this.mapKeys);
        let secondKey;
        do { secondKey = Phaser.Math.RND.pick(this.mapKeys); } while(secondKey === firstKey);
        const src = this.textures.get(firstKey).getSourceImage();
        const scaleX = width/src.width;
        this.segmentH = src.height * scaleX;
        this.segA = this.add.image(0,0,firstKey).setOrigin(0).setScale(scaleX);
        this.segB = this.add.image(0,-this.segmentH,secondKey).setOrigin(0).setScale(scaleX);
        this.flashKeys = ['flash1', 'flash2', 'flash3'];
        this.nextWaveTime = 0;
        this.player = this.physics.add.sprite(width/2, height-50, 'plane').setCollideWorldBounds(true).setScale(2);
        this.planeSound = this.sound.add('planeSound',{loop:true, volume:0.5});
        this.planeSound.play();
        this.keys = this.input.keyboard.addKeys({left:'A', right:'D', fire:'SPACE'});
        this.lasers = this.physics.add.group({defaultKey:'laser',maxSize:30});
        this.enemies = this.physics.add.group();
        this.enemyBullets = this.physics.add.group({defaultKey:'enemyBullet',maxSize:50});
        this.lastFired = 0; this.fireCooldown = 250;
        this.physics.add.overlap(this.lasers, this.enemies, this.onEnemyHit, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.onPlayerHit, null, this);
        this.physics.add.overlap(this.enemyBullets, this.player, this.onBulletHitPlayer, null, this);
        this.scoreText = this.add.text(10, 10, 'Score: 0', {font:'16px Arial', fill:'#fff', stroke:'#000', strokeThickness:6}).setDepth(1000);
        this.fuelText = this.add.text(10, 30, 'Fuel: 100', {font:'16px Arial', fill:'#fff', stroke:'#000', strokeThickness:6}).setDepth(1000);
        this.highText = this.add.text(10, 50, `High Score: ${window.highestScore||0}`,{font:'16px Arial', fill:'#fff', stroke:'#000', strokeThickness:6}).setDepth(1000);
    }

    update(time, deltaTime) {
        if(window.isDead) {
            this.planeSound.stop(); this.sound.stopAll();
            if(window.score>window.highestScore) {window.highestScore=Math.floor(window.score);localStorage.setItem('highestScore',window.highestScore);}
            this.scene.start('GameOverScene'); return;
        }
        window.fuel -= (0.01 * window.fuelDamage);
        if (window.fuel <= 0) { window.isDead=true; return; }
        this.player.setVelocityX(0);
        if (this.keys.left.isDown) { this.player.setVelocityX(-300); }
        if (this.keys.right.isDown) { this.player.setVelocityX(300); }
        if (this.keys.fire.isDown && time > this.lastFired + this.fireCooldown) {
            let laser = this.lasers.get(this.player.x, this.player.y - 20);
            if (laser) {
                laser.setActive(true).setVisible(true).body.reset(this.player.x, this.player.y-20);
                laser.setVelocityY(-400);
                this.createFlash(this.player.x, this.player.y - 20);
                this.lastFired=time;
                let dry=this.sound.add('shootSound',{volume:0.3});dry.play({rate:Phaser.Math.FloatBetween(0.8,1.2)});dry.once('complete',()=>dry.destroy());
            }
        }
        this.lasers.getChildren().forEach(l => { if (l.active&&l.y < -10) { l.setActive(false).setVisible(false); } });
        if (time > this.nextWaveTime) { this.spawnWave(); this.nextWaveTime = time + 5000; }
        this.enemies.getChildren().forEach(e => { if (e.active && e.canShoot && time > (e.lastShot || 0) + e.fireRate) { this.fireEnemyBullet(e); e.lastShot=time; }});
        this.enemyBullets.getChildren().forEach(b => { if (b.active && b.y > this.sys.game.config.height + 10) { b.setActive(false).setVisible(false); }});
        let dy = deltaTime / 10;
        [this.segA, this.segB].forEach(seg => {
            seg.y += dy;
            if (seg.y >= this.sys.game.config.height) {
                let other = seg === this.segA ? this.segB : this.segA;
                seg.y = other.y - this.segmentH;
                seg.setTexture(Phaser.Math.RND.pick(this.mapKeys));
            }
        });
        this.scoreText.setText(`Score: ${Math.floor(window.score || 0)}`);
        this.fuelText.setText(`Fuel: ${Math.floor(window.fuel)}`);
        this.highText.setText(`High Score: ${window.highestScore}`);
    }

    createFlash(x, y) {
        const key = Phaser.Math.RND.pick(this.flashKeys);
        const flash = this.add.image(x, y, key).setOrigin(0.5).setDepth(10);
        this.tweens.add({ targets: flash, alpha: 0, duration: 200, onComplete: () => flash.destroy() });
    }

    spawnWave() {
        const count = 5;
        const width = this.sys.game.config.width;
        const yStart = -50;
        const formation = Phaser.Math.RND.pick(['line', 'v', 'random']);
        const positions = [];

        if (formation === 'line') {
            const hole = Phaser.Math.Between(1, count);
            const spacing = width / (count + 1);
            for (let i = 1; i <= count; i++) if (i !== hole) positions.push({ x: spacing * i, y: yStart });
        } else if (formation === 'v') {
            const cx = width / 2;
            for (let i = 0; i < count; i++) {
                const off = (i % 2 ? -1 : 1) * Math.ceil((i + 1) / 2) * 50;
                positions.push({ x: cx + off, y: yStart - Math.floor(i / 2) * 30 });
            }
            positions.splice(Phaser.Math.Between(0, positions.length - 1), 1);
        } else {
            for (let i = 0; i < count; i++) positions.push({x: Phaser.Math.Between(50, width - 50), y: yStart - Phaser.Math.Between(0, 100)});
            positions.splice(Phaser.Math.Between(0, positions.length - 1), 1);
        }

        const wave = positions.map(pos => {
            const e = this.enemies.create(pos.x, pos.y, 'enemy').setScale(2).setAngle(180);
            e.setVelocityY(30);
            e.setCollideWorldBounds(true);
            e.setBounce(1, 0);
            e.setVelocityX(Phaser.Math.Between(-50, 50));
            e.fireRate = Phaser.Math.Between(4000, 8000);
            e.lastShot = 0;
            e.canShoot = false;
            return e;
        });
        Phaser.Utils.Array.Shuffle(wave).slice(0, Math.ceil(wave.length / 4)).forEach(e => e.canShoot = true);
    }

    fireEnemyBullet(enemy) {
        const b = this.enemyBullets.get(enemy.x, enemy.y + 20);
        if (b) {
            b.setActive(true).setVisible(true);
            b.body.reset(enemy.x, enemy.y + 20);
            b.setVelocityY(200 * this.damageMultiplier);
            this.createFlash(enemy.x, enemy.y);
            const snd = this.sound.add('enemyShootSound', { volume: 0.3 }); snd.play(); snd.once('complete', () => snd.destroy());
        }
    }

    onEnemyHit(laser, enemy) {
        laser.setActive(false).setVisible(false);
        const explosion = this.add.image(enemy.x, enemy.y, 'explosion').setDepth(10).setScale(3);
        this.time.delayedCall(200, () => explosion.destroy());
        enemy.destroy();
        window.score=(window.score||0)+10;
        window.fuel=Math.min((window.fuel||0)+(10*(4-this.damageMultiplier)),100);
    }

    onPlayerHit(player, enemy) {
        enemy.destroy();
        const explosion = this.add.image(player.x, player.y, 'explosion').setDepth(10).setScale(3);
        this.time.delayedCall(200, () => explosion.destroy());
        window.isDead = true;
    }

    onBulletHitPlayer(player, bullet) {
        if (!bullet.active) return;
        bullet.disableBody(true,true);
        const explosion = this.add.image(player.x, player.y, 'explosion').setDepth(10).setScale(3);
        this.time.delayedCall(200, () => explosion.destroy());
        window.fuelDamage += this.damageMultiplier;
    }
}

window.GameScene = GameScene;