
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


function resizeCanvas() {
    const container = document.getElementById('game-container');
    const maxWidth = Math.min(window.innerWidth - 20, 800);
    const maxHeight = Math.min(window.innerHeight - 100, 400);
    canvas.width = maxWidth;
    canvas.height = maxHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);


let backgroundGradient;

function createBackground() {
    backgroundGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    backgroundGradient.addColorStop(0, '#87CEEB');
    backgroundGradient.addColorStop(1, '#98FB98');
}

createBackground();

const groundHeight = 100;
const gravity = 0.6;
const jumpStrength = 14;

let score = 0;
let gameOver = false;


const player = {
    x: 50,
    y: canvas.height - groundHeight,
    width: 50,
    height: 50,
    velocityY: 0,
    jumping: false,
    draw() {
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    update() {
        this.velocityY += gravity;
        this.y += this.velocityY;

        if (this.y + this.height > canvas.height - groundHeight) {
            this.y = canvas.height - groundHeight - this.height;
            this.velocityY = 0;
            this.jumping = false;
        }
    },
    jump() {
        if (!this.jumping) {
            this.velocityY = -jumpStrength;
            this.jumping = true;
        }
    }
};


class Obstacle {
    constructor() {

        this.type = Math.floor(Math.random() * 3);
        this.speed = 6;

        switch (this.type) {
            case 0:
                this.width = 30 + Math.random() * 20;
                this.height = 30 + Math.random() * 40;
                this.x = canvas.width;
                this.y = canvas.height - groundHeight - this.height;
                break;
            case 1:
                this.width = 15;
                this.height = 80 + Math.random() * 20;
                this.x = canvas.width;
                this.y = canvas.height - groundHeight - this.height;
                break;
            case 2:
                this.width = 60 + Math.random() * 40;
                this.height = 20;
                this.x = canvas.width;
                this.y = canvas.height - groundHeight - this.height;
                break;

        }
    }

    draw() {
        switch (this.type) {
            case 0:
                ctx.fillStyle = '#228B22';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                break;
            case 1:
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                break;
            case 2:
                ctx.fillStyle = '#FF6347';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                break;

        }
    }

    update() {
        this.x -= this.speed;
    }
}


class Collectible {
    constructor() {
        this.width = 20;
        this.height = 20;
        this.x = canvas.width;
        this.y = canvas.height - groundHeight - 100 - Math.random() * 100;
        this.speed = baseSpeed;
    }

    draw() {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.x -= this.speed;
    }
}


class Cloud {
    constructor() {
        this.width = 60 + Math.random() * 40;
        this.height = 30 + Math.random() * 20;
        this.x = canvas.width;
        this.y = 50 + Math.random() * 100;
        this.speed = baseSpeed * 0.5;
    }

    draw() {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.x -= this.speed;
    }
}


class Monster {
    constructor() {
        this.width = 40;
        this.height = 30;
        this.x = canvas.width;
        this.y = 100 + Math.random() * 150;
        this.speed = baseSpeed * 1.2;
        this.amplitude = 20;
        this.frequency = 0.05;
        this.initialY = this.y;
    }

    draw() {
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x + 5, this.y + 5, 5, 5);
        ctx.fillRect(this.x + 25, this.y + 5, 5, 5);
    }

    update() {
        this.x -= this.speed;

        this.y = this.initialY + Math.sin(this.x * this.frequency) * this.amplitude;
    }
}

let obstacles = [];
let obstacleTimer = 0;
let obstacleInterval = 100;
let baseSpeed = 5;


let collectibles = [];
let collectibleTimer = 0;
const collectibleInterval = 150;


let clouds = [];
let cloudTimer = 0;
const cloudInterval = 200;


let monsters = [];
let monsterTimer = 0;
const monsterInterval = 150;


document.addEventListener('keydown', function(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        player.jump();
    }
});


canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    player.jump();
});


function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}


function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFF';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Fim de Jogo!', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText('Recarregue a página para jogar novamente', canvas.width / 2, canvas.height / 2 + 40);
        return;
    }


    if (backgroundGradient) {
        ctx.fillStyle = backgroundGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }


    ctx.fillStyle = '#654321';
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);

    player.update();
    player.draw();


    obstacleTimer++;
    if (obstacleTimer > obstacleInterval) {
        obstacles.push(new Obstacle());
        obstacleTimer = 0;
    }

    obstacles.forEach((obstacle, index) => {
        obstacle.update();
        obstacle.draw();

        if (checkCollision(player, obstacle)) {
            gameOver = true;
        }


        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score++;
            document.getElementById('score').textContent = 'Pontuação: ' + score;
        }
    });


    collectibleTimer++;
    if (collectibleTimer > collectibleInterval) {
        collectibles.push(new Collectible());
        collectibleTimer = 0;
    }

    collectibles.forEach((collectible, index) => {
        collectible.update();
        collectible.draw();


        if (
            player.x < collectible.x + collectible.width &&
            player.x + player.width > collectible.x &&
            player.y < collectible.y + collectible.height &&
            player.y + player.height > collectible.y
        ) {
            collectibles.splice(index, 1);
            score += 5;
            document.getElementById('score').textContent = 'Pontuação: ' + score;
        }


        if (collectible.x + collectible.width < 0) {
            collectibles.splice(index, 1);
        }
    });


    monsterTimer++;
    if (monsterTimer > monsterInterval) {
        monsters.push(new Monster());
        monsterTimer = 0;
    }

    monsters.forEach((monster, index) => {
        monster.update();
        monster.draw();

        if (checkCollision(player, monster)) {
            gameOver = true;
        }


        if (monster.x + monster.width < 0) {
            monsters.splice(index, 1);
        }
    });


    cloudTimer++;
    if (cloudTimer > cloudInterval) {
        clouds.push(new Cloud());
        cloudTimer = 0;
    }

    clouds.forEach((cloud, index) => {
        cloud.update();
        cloud.draw();


        if (cloud.x + cloud.width < 0) {
            clouds.splice(index, 1);
        }
    });


    if (obstacleInterval > 40) {
        obstacleInterval -= 0.005;
    }
    baseSpeed += 0.0005;


    obstacles.forEach(obstacle => {
        obstacle.speed = baseSpeed;
    });
    collectibles.forEach(collectible => {
        collectible.speed = baseSpeed;
    });
    monsters.forEach(monster => {
        monster.speed = baseSpeed * 1.2;
    });
    clouds.forEach(cloud => {
        cloud.speed = baseSpeed * 0.5;
    });

    requestAnimationFrame(gameLoop);
}


gameLoop();
