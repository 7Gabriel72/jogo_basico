// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    const container = document.getElementById('game-container');
    const maxWidth = Math.min(window.innerWidth - 20, 800);
    const maxHeight = Math.min(window.innerHeight - 100, 400);
    canvas.width = maxWidth;
    canvas.height = maxHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const groundHeight = 100;
const gravity = 0.6;
const jumpStrength = 12;

let score = 0;
let gameOver = false;

// Player object
const player = {
    x: 50,
    y: canvas.height - groundHeight,
    width: 50,
    height: 50,
    velocityY: 0,
    jumping: false,
    draw() {
        ctx.fillStyle = '#FF4500'; // Orange-red color
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

// Obstacle class
class Obstacle {
    constructor() {
        this.width = 30 + Math.random() * 20;
        this.height = 30 + Math.random() * 40;
        this.x = canvas.width;
        this.y = canvas.height - groundHeight - this.height;
        this.speed = 6;
    }

    draw() {
        ctx.fillStyle = '#228B22'; // Forest green
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x -= this.speed;
    }
}

let obstacles = [];
let obstacleTimer = 0;
const obstacleInterval = 90; // frames

// Handle keyboard input
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        player.jump();
    }
});

// Handle touch input for mobile
canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    player.jump();
});

// Collision detection
function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// Game loop
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#654321'; // Brown ground
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);

    player.update();
    player.draw();

    // Handle obstacles
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

        // Remove off-screen obstacles
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score++;
            document.getElementById('score').textContent = 'Pontuação: ' + score;
        }
    });

    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
