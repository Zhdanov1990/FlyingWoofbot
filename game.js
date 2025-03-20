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
        // Масштабируем фон
        this.add.image(screenWidth / 2, screenHeight / 2, 'background')
            .setDisplaySize(screenWidth, screenHeight);

        // Заголовок игры
        this.add.text(screenWidth / 2, screenHeight * 0.2, 'Flappy Doge', {
            fontSize: screenWidth * 0.12 + 'px',
            fill: '#ffdd00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5,
        }).setOrigin(0.5);

        // Создаем кнопки
        const buttonStyle = {
            fontSize: screenWidth * 0.08 + 'px',
            fill: '#ffffff',
            stroke: '#000',
            strokeThickness: 4,
        };

        let playText = this.add.text(screenWidth / 2, screenHeight * 0.4, 'Играть', buttonStyle).setOrigin(0.5);
        let recordsText = this.add.text(screenWidth / 2, screenHeight * 0.5, 'Мои рекорды', buttonStyle).setOrigin(0.5);
        let friendsText = this.add.text(screenWidth / 2, screenHeight * 0.6, 'Мои друзья', buttonStyle).setOrigin(0.5);

        // Делаем кнопки интерактивными
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
        // Добавляем фон
        this.add.image(screenWidth / 2, screenHeight / 2, 'background')
            .setDisplaySize(screenWidth, screenHeight);

        this.gap = screenHeight * 0.18; // Расстояние между трубами
        this.pipeSpeed = screenWidth * 0.02;
        this.score = 0;
        this.gameOverFlag = false;

        // Параметры прыжка собаки
        this.dogY = screenHeight / 2;
        this.jump = 0;
        this.jumpSpeed = screenHeight * 0.012;
        this.gravity = screenHeight * 0.005;

        // Спрайт собаки
        this.dog = this.physics.add.image(screenWidth * 0.15, this.dogY, 'dog').setScale(screenWidth * 0.0005);
        this.dog.body.allowGravity = false;

        this.input.on('pointerdown', () => {
            if (!this.gameOverFlag) {
                this.jump = screenHeight * 0.025;
                this.jumpSpeed = screenHeight * 0.012;
                this.gravity = screenHeight * 0.005;
            }
        });
    }

    update() {
        if (this.gameOverFlag) return;

        // Обновляем положение собаки
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
}

// ------------------
// Функция обработки окончания игры
// ------------------
function handleGameOver() {
    this.gameOverFlag = true;
    this.dog.setTexture('fail');
    this.pipeSpeed = 0;

    let bestScore = localStorage.getItem('bestScore') || 0;
    if (this.score > bestScore) {
        localStorage.setItem('bestScore', this.score);
    }

    this.time.delayedCall(500, () => {
        let overlay = this.add.rectangle(screenWidth / 2, screenHeight / 2, screenWidth, screenHeight, 0x000000, 0.5);
        this.add.text(screenWidth / 2, screenHeight * 0.4, 'Игра окончена', {
            fontSize: screenWidth * 0.1 + 'px',
            fill: '#ff0000'
        }).setOrigin(0.5);

        let restartText = this.add.text(screenWidth / 2, screenHeight * 0.5, 'Перезапустить', {
            fontSize: screenWidth * 0.08 + 'px',
            fill: '#ffffff',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        let menuText = this.add.text(screenWidth / 2, screenHeight * 0.6, 'Главное меню', {
            fontSize: screenWidth * 0.08 + 'px',
            fill: '#ffffff',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        restartText.setInteractive({ useHandCursor: true });
        menuText.setInteractive({ useHandCursor: true });

        restartText.on('pointerdown', () => this.scene.restart());
        menuText.on('pointerdown', () => this.scene.start('MenuScene'));
    });
}

// ------------------
// Конфигурация игры и запуск
// ------------------
const gameConfig = {
    type: Phaser.AUTO,
    width: screenWidth,
    height: screenHeight,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [MenuScene, GameScene]
};

const game = new Phaser.Game(gameConfig);

// ------------------
// Адаптация при изменении экрана
// ------------------
window.addEventListener('resize', () => {
    let newWidth = window.innerWidth;
    let newHeight = window.innerHeight;
    game.scale.resize(newWidth, newHeight);
});
