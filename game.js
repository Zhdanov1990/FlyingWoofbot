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
        // Добавляем фон
        this.add.image(300, 450, 'background');
  
        // Заголовок игры "Flappy Doge"
        this.add.text(300, 150, 'Flappy Doge', {
            fontSize: '60px',
            fill: '#ffdd00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5,
        }).setOrigin(0.5);
  
        // Создаем кнопки для навигации: Играть, Мои рекорды, Мои друзья
        let playText = this.add.text(300, 300, 'Играть', { 
            fontSize: '50px', 
            fill: '#ffffff', 
            stroke: '#000', 
            strokeThickness: 4 
        }).setOrigin(0.5);
  
        let recordsText = this.add.text(300, 400, 'Мои рекорды', { 
            fontSize: '50px', 
            fill: '#ffffff', 
            stroke: '#000', 
            strokeThickness: 4 
        }).setOrigin(0.5);
  
        let friendsText = this.add.text(300, 500, 'Мои друзья', { 
            fontSize: '50px', 
            fill: '#ffffff', 
            stroke: '#000', 
            strokeThickness: 4 
        }).setOrigin(0.5);
  
        // Делаем кнопки интерактивными
        playText.setInteractive();
        recordsText.setInteractive();
        friendsText.setInteractive();
  
        playText.on('pointerdown', () => { this.scene.start('GameScene'); });
        recordsText.on('pointerdown', () => { this.scene.start('RecordsScene'); });
        friendsText.on('pointerdown', () => { this.scene.start('FriendsScene'); });
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
        // Загружаем игровые ресурсы
        this.load.image('background', 'doge/1.png');
        this.load.image('dog', 'doge/doge.png');
        this.load.image('fail', 'doge/fail.png');
        this.load.image('topPipe', 'doge/top.png');
        this.load.image('bottomPipe', 'doge/bottom.png');
        this.load.image('bone', 'doge/bone.png');
    }
  
    create() {
        // Добавляем фон
        this.add.image(300, 450, 'background');
  
        // Параметры игры
        this.gap = 150;           // Расстояние между трубами
        this.pipeSpeed = 15;      // Начальная скорость труб
        this.score = 0;
        this.gameOverFlag = false;
  
        // Параметры прыжка собаки
        this.dogY = 450;
        this.jump = 0;
        this.jumpSpeed = 10;
        this.gravity = 5;
  
        // Массив препятствий и группа для бонусных костей
        this.obstacles = [];
        this.bones = this.physics.add.group();
  
        // Спавним начальные препятствия
        spawnObstaclePair.call(this, 600);
        spawnObstaclePair.call(this, 900);
        spawnObstaclePair.call(this, 1200);
  
        // Отображаем текущий счет в левом верхнем углу (с большим depth, чтобы не перекрывался трубами)
        this.scoreText = this.add.text(20, 20, String(this.score), { 
            fontSize: '40px', 
            fill: '#ffffff' 
        }).setOrigin(0, 0);
        this.scoreText.setDepth(1000);
  
        // Создаем спрайт собаки и отключаем гравитацию (управление реализовано вручную)
        this.dog = this.physics.add.image(70, this.dogY, 'dog').setScale(0.3);
        this.dog.body.allowGravity = false;
  
        // Обработчик для прыжка по клику
        this.input.on('pointerdown', () => {
            if (!this.gameOverFlag) {
                this.jump = 17;
                this.jumpSpeed = 10;
                this.gravity = 5;
            }
        });
  
        // Проверка пересечения собаки с костью для получения бонуса
        this.physics.add.overlap(this.dog, this.bones, collectBone, null, this);
    }
  
    update() {
        if (this.gameOverFlag) return;
  
        // Обновление положения труб
        for (let obs of this.obstacles) {
            obs.x -= this.pipeSpeed;
            obs.top.x = obs.x;
            obs.bottom.x = obs.x;
  
            // Увеличение счета при прохождении трубы
            if (!obs.scored && obs.x < 70) {
                obs.scored = true;
                this.score += 1;
            }
        }
  
        // Удаляем трубы, вышедшие за экран
        while (this.obstacles.length > 0 && this.obstacles[0].x < -80) {
            let obs = this.obstacles.shift();
            obs.top.destroy();
            obs.bottom.destroy();
        }
  
        // Спавним новые трубы, если последний препятствие достаточно далеко
        if (this.obstacles.length > 0 && this.obstacles[this.obstacles.length - 1].x < 600) {
            spawnObstaclePair.call(this, this.obstacles[this.obstacles.length - 1].x + Phaser.Math.Between(250, 300));
            this.pipeSpeed += 0.1; // Постепенное увеличение скорости для повышения сложности
        }
  
        // Обновление положения костей и удаление, если они вышли за экран
        this.bones.getChildren().forEach(bone => {
            bone.x -= this.pipeSpeed;
            if (bone.x < -50) bone.destroy();
        });
  
        // Обновляем позицию собаки с учетом прыжка и гравитации
        if (this.jump > 0) {
            this.jumpSpeed -= 1;
            this.dogY -= this.jumpSpeed;
            this.jump--;
        } else {
            this.dogY += this.gravity;
            this.gravity += 0.2;
        }
        this.dog.y = this.dogY;
  
        // Проверка столкновений собаки с трубами
        let dogRect = this.dog.getBounds();
        for (let obs of this.obstacles) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(dogRect, obs.top.getBounds()) ||
                Phaser.Geom.Intersects.RectangleToRectangle(dogRect, obs.bottom.getBounds())) {
                handleGameOver.call(this);
                return;
            }
        }
  
        // Если собака вышла за границы экрана – завершаем игру
        if (this.dogY < 0 || this.dogY > 900) {
            handleGameOver.call(this);
        }
  
        // Обновляем отображение счета
        this.scoreText.setText(String(this.score));
    }
  }
  
  // ------------------
  // Функция создания пары препятствий (труб)
  // ------------------
  function spawnObstaclePair(x) {
    // Случайное смещение для центра зазора
    let offset = Phaser.Math.Between(-50, 50);
    let gapCenter = 450 + offset;
    
    // Создаем верхнюю трубу
    let topPipe = this.add.image(x, gapCenter - this.gap / 2, 'topPipe').setOrigin(0.5, 1);
    
    // Создаем нижнюю трубу, смещенную влево на 10 пикселей.
    // Если изображение загружено зеркальным, переворачиваем его по горизонтали,
    // устанавливая отрицательный масштаб по оси X.
    let bottomPipe = this.add.image(x - 10, gapCenter + this.gap / 2, 'bottomPipe')
      .setOrigin(0.5, 0);
    bottomPipe.scaleX = -1; // Принудительно переворачиваем изображение по горизонтали
  
    // Добавляем препятствие в массив
    this.obstacles.push({ x, top: topPipe, bottom: bottomPipe, scored: false });
  
    // Рандомно создаем кость для бонуса
    if (x > 700 && Phaser.Math.Between(0, 1) === 1) {
        let bone = this.physics.add.image(x + 100, gapCenter, 'bone').setScale(0.1);
        bone.body.allowGravity = false;
        this.bones.add(bone);
    }
  }
  
  // ------------------
  // Функция обработки сбора кости (бонус)
  // ------------------
  function collectBone(dog, bone) {
    this.score += 5;
    bone.destroy();
  }
  
  // ------------------
  // Функция обработки окончания игры
  // ------------------
  function handleGameOver() {
    // Останавливаем игровой процесс
    this.gameOverFlag = true;
    this.dog.setTexture('fail');
    this.pipeSpeed = 0;
  
    // Обновляем лучший результат в localStorage, если текущий счет больше
    let bestScore = localStorage.getItem('bestScore') || 0;
    if (this.score > bestScore) {
        localStorage.setItem('bestScore', this.score);
    }
  
    // Через небольшую задержку показываем оверлей с вариантами продолжения
    this.time.delayedCall(500, () => {
        // Полупрозрачный фон оверлея
        let overlay = this.add.rectangle(300, 450, 600, 900, 0x000000, 0.5);
        // Текст "Игра окончена"
        this.add.text(300, 350, 'Игра окончена', { fontSize: '60px', fill: '#ff0000' }).setOrigin(0.5);
        // Кнопка "Перезапустить"
        let restartText = this.add.text(300, 450, 'Перезапустить', { 
            fontSize: '50px', 
            fill: '#ffffff', 
            stroke: '#000', 
            strokeThickness: 4 
        }).setOrigin(0.5);
        // Кнопка "Главное меню"
        let menuText = this.add.text(300, 550, 'Главное меню', { 
            fontSize: '50px', 
            fill: '#ffffff', 
            stroke: '#000', 
            strokeThickness: 4 
        }).setOrigin(0.5);
  
        restartText.setInteractive();
        menuText.setInteractive();
  
        restartText.on('pointerdown', () => { this.scene.restart(); });
        menuText.on('pointerdown', () => { this.scene.start('MenuScene'); });
    });
  }
  
  // ------------------
  // Сцена рекордов
  // ------------------
  class RecordsScene extends Phaser.Scene {
    constructor() { 
        super({ key: 'RecordsScene' }); 
    }
  
    preload() { 
        // Загружаем фон сцены
        this.load.image('background', 'doge/1.png'); 
    }
  
    create() {
        // Добавляем фон
        this.add.image(300, 450, 'background');
  
        // Получаем лучший результат из localStorage
        let bestScore = localStorage.getItem('bestScore') || 0;
  
        // Заголовок сцены и текст лучшего результата
        this.add.text(300, 150, 'Мои рекорды', { fontSize: '60px', fill: '#ffdd00' }).setOrigin(0.5);
        this.add.text(300, 300, 'Лучший результат: ' + bestScore, { fontSize: '50px', fill: '#ffffff' }).setOrigin(0.5);
  
        // Кнопка "Назад" под текстом результата, выделенная и по центру
        let backText = this.add.text(300, 400, 'Назад', { 
            fontSize: '50px', 
            fill: '#ffffff', 
            stroke: '#ff0000', 
            strokeThickness: 4 
        }).setOrigin(0.5);
        backText.setInteractive();
        backText.on('pointerdown', () => { this.scene.start('MenuScene'); });
    }
  }
  
  // ------------------
  // Сцена друзей
  // ------------------
  class FriendsScene extends Phaser.Scene {
    constructor() { 
        super({ key: 'FriendsScene' }); 
    }
  
    preload() { 
        this.load.image('background', 'doge/1.png'); 
    }
  
    create() {
        this.add.image(300, 450, 'background');
        this.add.text(300, 150, 'Мои друзья', { fontSize: '60px', fill: '#ffdd00' }).setOrigin(0.5);
  
        // Получаем список друзей из localStorage (если нет — пустой массив)
        let friends = JSON.parse(localStorage.getItem('friends')) || [];
  
        if (friends.length > 0) {
            // Выводим список друзей по центру
            friends.forEach((friend, index) => {
                this.add.text(300, 250 + index * 50, friend, { fontSize: '40px', fill: '#ffffff' }).setOrigin(0.5);
            });
            // Кнопка "Назад" под списком друзей
            let backText = this.add.text(300, 250 + friends.length * 50 + 50, 'Назад', { 
                fontSize: '50px', 
                fill: '#ffffff', 
                stroke: '#ff0000', 
                strokeThickness: 4 
            }).setOrigin(0.5);
            backText.setInteractive();
            backText.on('pointerdown', () => { this.scene.start('MenuScene'); });
        } else {
            // Если список друзей пуст, выводим сообщение и кнопку "Назад" под ним
            this.add.text(300, 300, 'Список друзей пуст', { fontSize: '50px', fill: '#ffffff' }).setOrigin(0.5);
            let backText = this.add.text(300, 400, 'Назад', { 
                fontSize: '50px', 
                fill: '#ffffff', 
                stroke: '#ff0000', 
                strokeThickness: 4 
            }).setOrigin(0.5);
            backText.setInteractive();
            backText.on('pointerdown', () => { this.scene.start('MenuScene'); });
        }
    }
  }
  
  // ------------------
  // Конфигурация игры и запуск
  // ------------------
  const gameConfig = {
    type: Phaser.AUTO,
    width: 600,
    height: 900,
    physics: { 
        default: 'arcade', 
        arcade: { gravity: { y: 0 }, debug: false } 
    },
    scene: [MenuScene, GameScene, RecordsScene, FriendsScene]
  };
  
  const game = new Phaser.Game(gameConfig);
  