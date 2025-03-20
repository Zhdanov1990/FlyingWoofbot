// ------------------
// Автоопределение размеров экрана
// ------------------
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

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
        this.add.image(screenWidth / 2, screenHeight / 2, 'background')
            .setDisplaySize(screenWidth, screenHeight);

        this.add.text(screenWidth / 2, screenHeight * 0.2, 'Flappy Doge', {
            fontSize: screenWidth * 0.12 + 'px',
            fill: '#ffdd00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5,
        }).setOrigin(0.5);

        const buttonStyle = {
            fontSize: screenWidth * 0.08 + 'px',
            fill: '#ffffff',
            stroke: '#000',
            strokeThickness: 4,
        };

        let playText = this.add.text(screenWidth / 2, screenHeight * 0.4, 'Играть', buttonStyle).setOrigin(0.5);
        let recordsText = this.add.text(screenWidth / 2, screenHeight * 0.5, 'Мои рекорды', buttonStyle).setOrigin(0.5);
        let friendsText = this.add.text(screenWidth / 2, screenHeight * 0.6, 'Мои друзья', buttonStyle).setOrigin(0.5);

        [playText, recordsText, friendsText].forEach(btn => btn.setInteractive({ useHandCursor: true }));

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
        this.add.image(screenWidth / 2, screenHeight / 2, 'background')
            .setDisplaySize(screenWidth, screenHeight);

        this.gap = screenHeight * 0.18;
        this.pipeSpeed = screenWidth * 0.01;
        this.score = 0;
        this.gameOverFlag = false;

        this.dogY = screenHeight / 2;
        this.jump = 0;
        this.jumpSpeed = screenHeight * 0.012;
        this.gravity = screenHeight * 0.005;

        this.dog = this.physics.add.image(screenWidth * 0.15, this.dogY, 'dog').setScale(screenWidth * 0.0005);
        this.dog.body.allowGravity = false;

        this.pipes = this.physics.add.group();
        this.spawnPipe();

        this.input.on('pointerdown', () => {
            if (!this.gameOverFlag) {
                this.jump = screenHeight * 0.025;
                this.jumpSpeed = screenHeight * 0.012;
                this.gravity = screenHeight * 0.005;
            }
        });

        this.timer = this.time.addEvent({
            delay: 1500,
            callback: this.spawnPipe,
            callbackScope: this,
            loop: true
        });
    }

    update() {
        if (this.gameOverFlag) return;

        if (this.jump > 0) {
            this.jumpSpeed -= screenHeight * 0.0012;
            this.dogY -= this.jumpSpeed;
            this.jump--;
        } else {
            this.dogY += this.gravity;
            this.gravity += screenHeight * 0.0002;
        }

        this.dog.y = this.dogY;

        if (this.dogY < 0 || this.dogY > screenHeight) {
            handleGameOver.call(this);
        }
    }

    spawnPipe() {
        let pipeY = Phaser.Math.Between(screenHeight * 0.2, screenHeight * 0.8);
        let topPipe = this.pipes.create(screenWidth, pipeY - this.gap, 'topPipe').setOrigin(0.5, 1);
        let bottomPipe = this.pipes.create(screenWidth, pipeY + this.gap, 'bottomPipe').setOrigin(0.5, 0);
        topPipe.setVelocityX(-this.pipeSpeed);
        bottomPipe.setVelocityX(-this.pipeSpeed);
    }
}

// ------------------
// Сцена "Мои рекорды"
// ------------------
class RecordsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RecordsScene' });
    }

    create() {
        this.add.text(screenWidth / 2, screenHeight * 0.2, 'Мои рекорды', {
            fontSize: screenWidth * 0.1 + 'px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        let bestScore = localStorage.getItem('bestScore') || 0;
        this.add.text(screenWidth / 2, screenHeight * 0.4, `Лучший результат: ${bestScore}`, {
            fontSize: screenWidth * 0.08 + 'px',
            fill: '#ffdd00'
        }).setOrigin(0.5);

        let backText = this.add.text(screenWidth / 2, screenHeight * 0.6, 'Назад', {
            fontSize: screenWidth * 0.08 + 'px',
            fill: '#ffffff',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        backText.on('pointerdown', () => this.scene.start('MenuScene'));
    }
}

// ------------------
// Сцена "Мои друзья"
// ------------------
class FriendsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FriendsScene' });
    }

    create() {
        this.add.text(screenWidth / 2, screenHeight * 0.2, 'Мои друзья', {
            fontSize: screenWidth * 0.1 + 'px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        let addFriendText = this.add.text(screenWidth / 2, screenHeight * 0.4, 'Добавить друга', {
            fontSize: screenWidth * 0.08 + 'px',
            fill: '#ffffff',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        addFriendText.on('pointerdown', () => {
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.requestContact();
            } else {
                alert("Функция доступна только в Telegram Mini App!");
            }
        });

        let backText = this.add.text(screenWidth / 2, screenHeight * 0.6, 'Назад', {
            fontSize: screenWidth * 0.08 + 'px',
            fill: '#ffffff',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        backText.on('pointerdown', () => this.scene.start('MenuScene'));
    }
}

// ------------------
// Запуск игры
// ------------------
const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: screenWidth,
    height: screenHeight,
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    scene: [MenuScene, GameScene, RecordsScene, FriendsScene]
});
