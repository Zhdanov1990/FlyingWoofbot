// ------------------
// Сцена главного меню
// ------------------
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('background', 'doge/1.png');
    }

    create() {
        let { width, height } = this.scale;

        this.add.image(width / 2, height / 2, 'background')
            .setDisplaySize(width, height);

        this.add.text(width / 2, height * 0.2, 'Flappy Doge', {
            fontSize: '60px',
            fill: '#ffdd00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5,
        }).setOrigin(0.5);

        let playText = this.add.text(width / 2, height * 0.4, 'Играть', {
            fontSize: '50px',
            fill: '#ffffff',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        let recordsText = this.add.text(width / 2, height * 0.5, 'Мои рекорды', {
            fontSize: '50px',
            fill: '#ffffff',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        let friendsText = this.add.text(width / 2, height * 0.6, 'Мои друзья', {
            fontSize: '50px',
            fill: '#ffffff',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        playText.setInteractive();
        recordsText.setInteractive();
        friendsText.setInteractive();

        playText.on('pointerdown', () => this.scene.start('GameScene'));
        recordsText.on('pointerdown', () => this.scene.start('RecordsScene'));
        friendsText.on('pointerdown', () => this.scene.start('FriendsScene'));
    }
}

// ------------------
// Сцена игры
// ------------------
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('background', 'doge/1.png');
        this.load.image('dog', 'doge/doge.png');
        this.load.image('fail', 'doge/fail.png');
        this.load.image('topPipe', 'doge/top.png');
        this.load.image('bottomPipe', 'doge/bottom.png');
        this.load.image('bone', 'doge/bone.png');
    }

    create() {
        let { width, height } = this.scale;
        this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);

        this.gap = height * 0.2;
        this.pipeSpeed = 15;
        this.score = 0;
        this.gameOverFlag = false;

        this.dogY = height * 0.5;
        this.jump = 0;
        this.jumpSpeed = 10;
        this.gravity = 5;

        this.obstacles = [];
        this.bones = this.physics.add.group();

        spawnObstaclePair.call(this, width);
        spawnObstaclePair.call(this, width + 300);
        spawnObstaclePair.call(this, width + 600);

        this.scoreText = this.add.text(20, 20, String(this.score), {
            fontSize: '40px',
            fill: '#ffffff'
        }).setOrigin(0, 0);
        this.scoreText.setDepth(1000);

        this.dog = this.physics.add.image(width * 0.15, this.dogY, 'dog').setScale(0.3);
        this.dog.body.allowGravity = false;

        this.input.on('pointerdown', () => {
            if (!this.gameOverFlag) {
                this.jump = 17;
                this.jumpSpeed = 10;
                this.gravity = 5;
            }
        });

        this.physics.add.overlap(this.dog, this.bones, collectBone, null, this);
    }

    update() {
        if (this.gameOverFlag) return;

        for (let obs of this.obstacles) {
            obs.x -= this.pipeSpeed;
            obs.top.x = obs.x;
            obs.bottom.x = obs.x;

            if (!obs.scored && obs.x < this.dog.x) {
                obs.scored = true;
                this.score += 1;
            }
        }

        while (this.obstacles.length > 0 && this.obstacles[0].x < -80) {
            let obs = this.obstacles.shift();
            obs.top.destroy();
            obs.bottom.destroy();
        }

        if (this.obstacles.length > 0 && this.obstacles[this.obstacles.length - 1].x < this.scale.width - 300) {
            spawnObstaclePair.call(this, this.obstacles[this.obstacles.length - 1].x + Phaser.Math.Between(250, 300));
            this.pipeSpeed += 0.1;
        }

        this.bones.getChildren().forEach(bone => {
            bone.x -= this.pipeSpeed;
            if (bone.x < -50) bone.destroy();
        });

        if (this.jump > 0) {
            this.jumpSpeed -= 1;
            this.dogY -= this.jumpSpeed;
            this.jump--;
        } else {
            this.dogY += this.gravity;
            this.gravity += 0.2;
        }
        this.dog.y = this.dogY;

        let dogRect = this.dog.getBounds();
        for (let obs of this.obstacles) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(dogRect, obs.top.getBounds()) ||
                Phaser.Geom.Intersects.RectangleToRectangle(dogRect, obs.bottom.getBounds())) {
                handleGameOver.call(this);
                return;
            }
        }

        if (this.dogY < 0 || this.dogY > this.scale.height) {
            handleGameOver.call(this);
        }

        this.scoreText.setText(String(this.score));
    }
}

// ------------------
// Функция создания препятствий
// ------------------
function spawnObstaclePair(x) {
    let { height } = this.scale;
    let offset = Phaser.Math.Between(-50, 50);
    let gapCenter = height / 2 + offset;

    let topPipe = this.add.image(x, gapCenter - this.gap / 2, 'topPipe').setOrigin(0.5, 1);
    let bottomPipe = this.add.image(x - 10, gapCenter + this.gap / 2, 'bottomPipe').setOrigin(0.5, 0);
    bottomPipe.scaleX = -1;

    this.obstacles.push({ x, top: topPipe, bottom: bottomPipe, scored: false });

    if (x > 700 && Phaser.Math.Between(0, 1) === 1) {
        let bone = this.physics.add.image(x + 100, gapCenter, 'bone').setScale(0.1);
        bone.body.allowGravity = false;
        this.bones.add(bone);
    }
}

// ------------------
// Конфигурация игры
// ------------------
const gameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [MenuScene, GameScene]
};

const game = new Phaser.Game(gameConfig);
