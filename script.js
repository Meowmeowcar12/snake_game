const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("high-score");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const startBtn = document.getElementById("start-btn");

// Game Constants
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;
const GAME_SPEED = 100; // milliseconds per frame

// Colors (matching CSS variables)
const COLOR_SNAKE_HEAD = "#66fcf1";
const COLOR_SNAKE_BODY = "#45a29e";
const COLOR_APPLE = "#ff0055";

// Load Images
const headImg = new Image();
headImg.src = 'head.png';

const bodyImg = new Image();
bodyImg.src = 'body.png';

const appleImg = new Image();
appleImg.src = 'apple.png';

// Game State
let snake = [];
let dx = 0;
let dy = 0;
let appleX = 15;
let appleY = 15;
let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;
let gameLoopInterval = null;
let isGameOver = false;

// Initialize High Score Display
highScoreElement.textContent = highScore;

// Event Listeners
document.addEventListener("keydown", handleKeyPress);
startBtn.addEventListener("click", resetGame);

function drawGame() {
    if (isGameOver) return;

    clearCanvas();
    
    // Only move and check collisions if the snake has started moving
    if (dx !== 0 || dy !== 0) {
        moveSnake();
        checkCollision();
        
        if (isGameOver) return;
        
        checkAppleCollision();
    }
    
    drawApple();
    drawSnake();
}

function clearCanvas() {
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    snake.forEach((part, index) => {
        if (index === 0) {
            // Draw head with rotation
            let angle = 0;
            if (dy === -1) angle = 0; // Up
            else if (dy === 1) angle = Math.PI; // Down
            else if (dx === -1) angle = -Math.PI / 2; // Left
            else if (dx === 1) angle = Math.PI / 2; // Right
            
            ctx.save();
            ctx.translate(part.x * GRID_SIZE + GRID_SIZE / 2, part.y * GRID_SIZE + GRID_SIZE / 2);
            ctx.rotate(angle);
            ctx.drawImage(headImg, -GRID_SIZE / 2, -GRID_SIZE / 2, GRID_SIZE, GRID_SIZE);
            ctx.restore();
        } else {
            // Draw body
            ctx.drawImage(bodyImg, part.x * GRID_SIZE, part.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        }
    });
}

function drawApple() {
    ctx.drawImage(appleImg, appleX * GRID_SIZE, appleY * GRID_SIZE, GRID_SIZE, GRID_SIZE);
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head); // Add new head
    
    // We will pop the tail later if no apple is eaten
}

function checkCollision() {
    const head = snake[0];

    // Wall collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
    }

    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
        }
    }
}

function checkAppleCollision() {
    if (snake[0].x === appleX && snake[0].y === appleY) {
        score += 10;
        scoreElement.textContent = score;
        spawnApple();
    } else {
        snake.pop(); // Remove tail if no apple eaten
    }
}

function spawnApple() {
    let newAppleX, newAppleY;
    let isCollision = true;

    // Ensure apple doesn't spawn on the snake or on the edges
    while (isCollision) {
        // Generate coordinates between 1 and TILE_COUNT - 2 (exclusive of borders)
        newAppleX = Math.floor(Math.random() * (TILE_COUNT - 2)) + 1;
        newAppleY = Math.floor(Math.random() * (TILE_COUNT - 2)) + 1;
        
        isCollision = snake.some(part => part.x === newAppleX && part.y === newAppleY);
    }

    appleX = newAppleX;
    appleY = newAppleY;
}

function handleKeyPress(e) {
    if (isGameOver) {
        if(e.key === "Enter") resetGame();
        return;
    }

    const key = e.key.toLowerCase();
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if ((key === "arrowup" || key === "w") && !goingDown) {
        // Prevent moving immediately back into the body
        if (snake.length > 1 && snake[1].y === snake[0].y - 1) return;
        dx = 0;
        dy = -1;
    }
    if ((key === "arrowdown" || key === "s") && !goingUp) {
        if (snake.length > 1 && snake[1].y === snake[0].y + 1) return;
        dx = 0;
        dy = 1;
    }
    if ((key === "arrowleft" || key === "a") && !goingRight) {
        if (snake.length > 1 && snake[1].x === snake[0].x - 1) return;
        dx = -1;
        dy = 0;
    }
    if ((key === "arrowright" || key === "d") && !goingLeft) {
        if (snake.length > 1 && snake[1].x === snake[0].x + 1) return;
        dx = 1;
        dy = 0;
    }
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    isGameOver = false;
    
    spawnApple();
    overlay.classList.add("hidden");
    
    // Clear existing interval just in case
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    
    gameLoopInterval = setInterval(drawGame, GAME_SPEED);
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameLoopInterval);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("snakeHighScore", highScore);
        highScoreElement.textContent = highScore;
    }
    
    overlayTitle.textContent = "GAME OVER";
    startBtn.textContent = "PLAY AGAIN";
    overlay.classList.remove("hidden");
}

// Initial draw before start
function initialDraw() {
    clearCanvas();
    if (appleImg.complete && headImg.complete) {
        drawApple();
        ctx.save();
        ctx.translate(10 * GRID_SIZE + GRID_SIZE / 2, 10 * GRID_SIZE + GRID_SIZE / 2);
        ctx.drawImage(headImg, -GRID_SIZE / 2, -GRID_SIZE / 2, GRID_SIZE, GRID_SIZE);
        ctx.restore();
    }
}
initialDraw();
headImg.onload = initialDraw;
appleImg.onload = initialDraw;
