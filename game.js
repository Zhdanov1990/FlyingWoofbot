// ------------------
// Сцена главного меню
// ------------------
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Загружаем фон для главного меню
        this.load.image('background', 'doge/1.png');
    }

    create() {
        const { width, height } = this.cameras.main;

        // Добавляем фон и масштабируем его
        this.add.image(width / 2, height / 2, 'background')
            .setDisplaySize(width, height);

        // Заголовок игры
        this.add.text(width / 2, height * 0.2, 'Flappy Doge', {
            fontSize: `${width * 0.1}px`,
            fill: '#ffdd00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5,
        }).setOrigin(0.5);

        // Функция для создания кнопки
        const createButton = (y, text, sceneKey) => {
            let btn = this.add.text(width / 2, y, text, {
                fontSize: `${width * 0.08}px`,
                fill: '#ffffff',
                stroke: '#000',
                strokeThickness: 4
            }).setOrigin(0.5);
            btn.setInteractive();
            btn.on('pointerdown', () => { this.scene.start(sceneKey); });
            return btn;
        };

        createButton(height * 0.4, 'Играть', 'GameScene');
        createButton(height * 0.5, 'Мои рекорды', 'RecordsScene');
        createButton(height * 0.6, 'Мои друзья', 'FriendsScene');
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
        const { width, height } = this.cameras.main;

        this.add.image(width / 2, height / 2, 'background')
            .setDisplaySize(width, height);

        this.gap = height * 0.2;
        this.pipeSpeed = width * 0.01;
        this.score = 0;
        this.gameOverFlag = false;

        this.dogY = height / 2;
        this.jump = 0;
        this.jumpSpeed = height * 0.02;
        this.gravity = height * 0.005;

        this.obstacles = [];
        this.bones = this.physics.add.group();

        spawnObstaclePair.call(this, width * 1.2);
        spawnObstaclePair.call(this, width * 1.5);
        spawnObstaclePair.call(this, width * 1.8);

        this.scoreText = this.add.text(width * 0.05, height * 0.05, String(this.score), {
            fontSize: `${width * 0.1}px`,
            fill: '#ffffff'
        }).setOrigin(0, 0);

        this.dog = this.physics.add.image(width * 0.15, this.dogY, 'dog').setScale(width * 0.0005);
        this.dog.body.allowGravity = false;

        this.input.on('pointerdown', () => {
            if (!this.gameOverFlag) {
                this.jump = 17;
                this.jumpSpeed = height * 0.02;
                this.gravity = height * 0.005;
            }
        });

        this.physics.add.overlap(this.dog, this.bones, collectBone, null, this);
    }

    update() {
        if (this.gameOverFlag) return;

        this.obstacles.forEach(obs => {
            obs.x -= this.pipeSpeed;
            obs.top.x = obs.x;
            obs.bottom.x = obs.x;

            if (!obs.scored && obs.x < this.dog.x) {
                obs.scored = true;
                this.score += 1;
            }
        });

        this.obstacles = this.obstacles.filter(obs => obs.x > -100);

        if (this.obstacles.length > 0 && this.obstacles[this.obstacles.length - 1].x < this.cameras.main.width * 0.7) {
            spawnObstaclePair.call(this, this.obstacles[this.obstacles.length - 1].x + this.cameras.main.width * 0.4);
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

        if (this.dogY < 0 || this.dogY > this.cameras.main.height) {
            handleGameOver.call(this);
        }

        this.scoreText.setText(String(this.score));
    }
}

function spawnObstaclePair(x) {
    let { height } = this.cameras.main;
    let offset = Phaser.Math.Between(-50, 50);
    let gapCenter = height / 2 + offset;

    let topPipe = this.add.image(x, gapCenter - this.gap / 2, 'topPipe').setOrigin(0.5, 1);
    let bottomPipe = this.add.image(x, gapCenter + this.gap / 2, 'bottomPipe').setOrigin(0.5, 0);
    bottomPipe.scaleX = -1;

    this.obstacles.push({ x, top: topPipe, bottom: bottomPipe, scored: false });

    if (Phaser.Math.Between(0, 1) === 1) {
        let bone = this.physics.add.image(x + 100, gapCenter, 'bone').setScale(0.1);
        bone.body.allowGravity = false;
        this.bones.add(bone);
    }
}

function collectBone(dog, bone) {
    this.score += 5;
    bone.destroy();
}

function handleGameOver() {
    this.gameOverFlag = true;
    this.dog.setTexture('fail');
    this.pipeSpeed = 0;
}

const gameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: { 
        default: 'arcade', 
        arcade: { gravity: { y: 0 }, debug: false } 
    },
    scene: [MenuScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    }
};

const game = new Phaser.Game(gameConfig);
