const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Elementos del HUD y Overlay
const overlay = document.getElementById("overlay");
const restartBtn = document.getElementById("restart");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");

// Obtener elementos de audio (¡DEBEN ESTAR EN game.html!)
const soundJump = document.getElementById("sound-jump");
const soundHit = document.getElementById("sound-hit");
const soundScore = document.getElementById("sound-score"); 

// CONFIGURACIÓN DEL JUEGO
let gravity = 0.7;
let fastFallGravity = 2.5; // Gravedad para la caída rápida
let baseSpeed = 6;
let maxSpeed = 12;
let speedIncrement = 0.05;

let speed = baseSpeed;
let score = 0;
let best = 0;
let gameFrame = 0;

let gameOver = false;
let gameStarted = false;

// Posición Y del suelo (donde el jugador aterriza)
const groundY = 200;

let obstacles = [];
let spawnCooldown = 0;

// EMOJIS y TAMAÑO
const EMOJI_PLAYER_RUN1 = "🏃‍♂️";
const EMOJI_PLAYER_RUN2 = "🚶‍♂️";
const EMOJI_PLAYER_DUCK = "⬇️"; // Emoji de agachado
const EMOJI_JUNK = "🍔";
const EMOJI_SIZE = 40;

// ALTURAS DE OBSTÁCULOS
const Y_LOW = groundY;                        
const Y_MID = groundY - EMOJI_SIZE ;      
const Y_HIGH = groundY - EMOJI_SIZE * 3;     

// JUGADOR
let player = {
  x: 80,
  y: groundY,
  w: EMOJI_SIZE,
  h: EMOJI_SIZE,
  velocityY: 0,
  jumping: false,
  ducking: false, 
  fastFalling: false, 
  frame: 0,
  animationTimer: 0,
  lastScoreSound: 0,
};

// --- SONIDOS ---

function playSound(audioElement) {
  if (audioElement) {
    audioElement.currentTime = 0; 
    audioElement.play().catch(e => console.log("Error de audio:", e));
  }
}

// --- INPUT & CONTROL ---

document.addEventListener("keydown", e => {
  // Salto con W o Espacio
  if (e.code === "KeyW" || e.code === "Space") handleJump();
  
  // Agacharse con S o Control/Shift
  if (e.code === "KeyS" || e.code === "ShiftLeft" || e.code === "ControlLeft") {
    player.ducking = true;
    if (player.jumping) {
      player.fastFalling = true; // Activar caída rápida
    }
  }
});

document.addEventListener("keyup", e => {
  // Dejar de agacharse
  if (e.code === "KeyS" || e.code === "ShiftLeft" || e.code === "ControlLeft") {
    player.ducking = false;
    player.fastFalling = false; // Desactivar caída rápida al soltar S
  }
});

canvas.addEventListener("touchstart", handleJump);

function handleJump() {
  if (!gameStarted) {
    gameStarted = true;
    overlay.classList.add("hidden");
  }
  if (gameOver) return restartGame();

  if (!player.jumping && !player.ducking) { 
    player.velocityY = -14;
    player.jumping = true;
    playSound(soundJump); 
  }
}

function restartGame() {
  gameOver = false;
  gameStarted = true;
  
  score = 0;
  gameFrame = 0;
  speed = baseSpeed;
  obstacles = [];

  player.y = groundY;
  player.w = EMOJI_SIZE; 
  player.h = EMOJI_SIZE;
  player.velocityY = 0;
  player.jumping = false;
  player.ducking = false; 
  player.fastFalling = false; 
  player.frame = 0;
  player.animationTimer = 0;
  player.lastScoreSound = 0;
  
  spawnCooldown = 0;

  overlay.classList.add("hidden");
}

restartBtn.addEventListener("click", restartGame);

function endGame() {
  gameOver = true;
  overlay.classList.remove("hidden");
  playSound(soundHit); 

  if (score > best) {
    best = score;
    bestEl.textContent = "Mejor: " + best;
  }
}

// --- SPAWN OBJECTS (sin cambios) ---

function spawnObstacle() {
  let obstacleY;
  
  const rand = Math.random(); 

  if (rand < 0.5) { 
    obstacleY = Y_LOW;
  } else if (rand < 0.8) { 
    obstacleY = Y_MID;
  } else { 
    obstacleY = Y_HIGH;
  }

  if (obstacleY === Y_LOW && Math.random() < 0.2) {
      obstacleY = Y_LOW - 30;
  }

  obstacles.push({
    x: canvas.width + 20,
    y: obstacleY,
    w: EMOJI_SIZE,
    h: EMOJI_SIZE
  });
}

// --- UTILIDADES (sin cambios) ---

function collide(a, b) {
  return !(
    a.x + a.w < b.x ||
    a.x > b.x + b.w ||
    a.y + a.h < b.y ||
    a.y > b.y + b.h
  );
}

function drawEmoji(emoji, x, y, size) {
  ctx.font = size + "px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(emoji, x, y);
}

// --- GAME LOOP ---

function update() {
  gameFrame++;
  
  // 1. Puntuación
  if (gameFrame % 5 === 0) {
      score++;
      if (score > 0 && score % 10 === 0 && score !== player.lastScoreSound) {
          playSound(soundScore);
          player.lastScoreSound = score;
      }
  }

  // 2. Aumentar dificultad
  speed = Math.min(baseSpeed + score * speedIncrement, maxSpeed);

  // 3. Física del jugador, Agacharse y Aterrizaje
  
  // A) Aplicar Gravedad
  if (player.fastFalling) {
      player.velocityY += fastFallGravity; 
  } else {
      player.velocityY += gravity;         
  }
  player.y += player.velocityY;

  // B) Ajuste de Bounding Box y Posición (Aterrizaje y Agacharse)
  
  if (player.ducking) {
      // 1. Hitbox pequeño siempre que esté agachado (tierra o aire)
      player.h = EMOJI_SIZE / 2; 
      
      // 2. Comprobar aterrizaje en posición agachada
      const duckingGroundY = groundY + EMOJI_SIZE / 2;
      
      if (player.y >= duckingGroundY) {
          player.y = duckingGroundY; // Fija la posición justo al nivel de agachado
          player.jumping = false; 
          player.fastFalling = false;
          player.velocityY = 0; // Detener movimiento
      }
      
  } else { 
      // 1. Hitbox completo si no está agachado (de pie o saltando)
      player.h = EMOJI_SIZE;
      
      // 2. Comprobar aterrizaje en posición de pie
      if (player.y >= groundY) {
          player.y = groundY; // Fija la posición al nivel de pie
          player.jumping = false; 
          player.fastFalling = false;
          player.velocityY = 0; // Detener movimiento
      }
  }
  // ------------------------------------------

  // Animación de carrera
  if (!player.jumping && !player.ducking) {
    player.animationTimer++;
    if (player.animationTimer % 5 === 0) {
      player.frame = (player.frame + 1) % 2;
    }
  } else if (player.jumping) {
      player.frame = (player.frame + 1) % 2; 
  } else if (player.ducking) {
      player.frame = 3; 
  }

  // 4. Spawns
  spawnCooldown--;
  if (spawnCooldown <= 0) {
    spawnObstacle();
    spawnCooldown = Math.max(40, 60 + Math.random() * 40 - (speed - baseSpeed) * 5);
  }

  // 5. Mover y Colisiones
  obstacles.forEach((o) => {
    o.x -= speed;
    if (collide(player, o)) endGame();
  });
  obstacles = obstacles.filter(o => o.x + o.w > 0);

  // 6. Actualizar HUD
  scoreEl.textContent = score;
}

function draw() {
  // Fondo
  ctx.fillStyle = "#a8d8ff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Suelo
  ctx.fillStyle = "#4aa3ff";
  ctx.fillRect(0, groundY + 40, canvas.width, 80);

  // Dibujar elementos
  let playerEmoji;
  
  // Prioridad 1: Agachado
  if (player.ducking) {
    playerEmoji = EMOJI_PLAYER_DUCK; 
  } 
  // Prioridad 2: Animación de carrera (aplica al correr o al saltar)
  else if (player.frame === 0) {
    playerEmoji = EMOJI_PLAYER_RUN1;
  } else {
    playerEmoji = EMOJI_PLAYER_RUN2;
  }
  
  // Dibuja el emoji
  drawEmoji(playerEmoji, player.x, player.y, EMOJI_SIZE);

  obstacles.forEach(o => drawEmoji(EMOJI_JUNK, o.x, o.y, EMOJI_SIZE));
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameOver && gameStarted) {
    update();
  }

  draw();
  requestAnimationFrame(gameLoop);
}

// Iniciar el loop del juego
gameLoop();