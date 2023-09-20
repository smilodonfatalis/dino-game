const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageNames = ['bird', 'cactus', 'dino']

// Global game object
const game = {
  counter: 0,
  background: [],
  bgm1: new Audio('./bgm/fieldSong.mp3'),
  bgm2: new Audio('./bgm/jump.mp3'),
  enemys: [],
  enemyCoutdown: 0,
  image: {},
  score: 0,
  state: 'loading',
  timer: null,
};
game.bgm1.loop = true;

// Load plural images
let imageLoadCounter = 0;
for (const imageName of imageNames) {
  const imagePath = `./images/${imageName}.png`;
  game.image[imageName] = new Image();
  game.image[imageName].src = imagePath;
  game.image[imageName].onload = () => {
    imageLoadCounter++;
    if (imageLoadCounter === imageNames.length) {
      console.log('All images are loaded');
      init();
    }
  }
}

function init() {
  game.counter = 0;
  game.enemys = [];
  game.enemyCoutdown = 0;
  game.score = 0;
  game.state = 'init';
  // clear window
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // display dino
  createDino();
  drawDino();
  // depict background
  createBackGround();
  drawBackGround();
  // display sentence
  ctx.fillStyle = 'black';
  ctx.font = 'bold 60px serif';
  ctx.fillText('Press Space key', 60, 150);
  ctx.fillText('to start', 150, 230);
}

function start() { 
  game.state = 'gaming';
  game.bgm1.play();
  game.timer = setInterval(ticker, 30);
}

function ticker() {
  // clear window
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //create background
  if (game.counter % 10 === 0 ) {
    createBackGround();
  }

  // create enemies
  createEnemys();

  // move characters
  moveBackGround();
  moveDino();
  moveEnemys();

  // draw characters
  drawBackGround();
  drawDino();
  drawEnemys();
  drawScore();

  // detect collision
  hitCheck();

  // update counter
  game.score++;
  game.counter = (game.counter + 1) % 1000000;
  game.enemyCoutdown--;
}

function createBackGround() {
  game.backGround = [];
  for (let x = 0; x < canvas.width; x += 200) {
    game.backGround.push({
      x: x,
      y: canvas.height,
      width: 200,
      moveX: -20,
    });
  }
}

function createDino() {
  game.dino = {
    x: game.image.dino.width / 2,
    y: canvas.height - game.image.dino.height / 2,
    moveY: 0,
    width: game.image.dino.width,
    height: game.image.dino.height,
    image: game.image.dino,
  }
}

function createCactus(createX) {
  game.enemys.push({
      x: createX,
      y: canvas.height - game.image.cactus.height/2,
      width: game.image.cactus.width,
      height: game.image.cactus.height,
      moveX: -10,
      image: game.image.cactus
  });
}

function createBird() {
  const birdY = Math.random() * (300 - game.image.bird.height) + 150;
  game.enemys.push({
      x: canvas.width + game.image.bird.width/2,
      y: birdY,
      width: game.image.bird.width,
      height: game.image.bird.height,
      moveX: -15,
      image: game.image.bird
  });
}

function createEnemys() {
  if (game.enemyCoutdown === 0) {
    game.enemyCoutdown = 60 - Math.floor(game.score / 100);
    if (game.enemyCoutdown <= 30) {
      game.enemyCoutdown = 30;
    }
    switch (Math.floor(Math.random() * 3)) {
      case 0:
        createCactus(canvas.width + game.image.cactus.width/2);
        break;
      case 1:
        createCactus(canvas.width + game.image.cactus.width/2);
        createCactus(canvas.width + game.image.cactus.width*3/2);
        break;
      case 2:
        createBird();
        break;
    }
  }
}

function moveBackGround() {
  for (const backGround of game.backGround) {
    backGround.x += backGround.moveX;
  }
}

function moveDino() {
  game.dino.y += game.dino.moveY;
  if (game.dino.y >= canvas.height - game.dino.height/2) {
    game.dino.y = canvas.height - game.dino.height/2;
    game.dino.moveY = 0;
  } else {
    game.dino.moveY += 3;
  }
}

function moveEnemys() {
  for (const enemy of game.enemys) {
    enemy.x += enemy.moveX;
  }

  game.enemys = game.enemys.filter(enemy => enemy.x > -enemy.width);
}

function drawBackGround() {
  ctx.fillStyle = 'sienna';
  for (const backGround of game.backGround) {
    ctx.fillRect(backGround.x, backGround.y-5, backGround.width, 5);
    ctx.fillRect(backGround.x+20, backGround.y-10, backGround.width-40, 5);
    ctx.fillRect(backGround.x+50, backGround.y-15, backGround.width-100, 5);
  }
}

function drawDino() {
  ctx.drawImage(
    game.dino.image,
    game.dino.x - game.dino.width/2,
    game.dino.y - game.dino.height/2,
  ); 
}

function drawEnemys() {
  for (const enemy of game.enemys) {
    ctx.drawImage(
      enemy.image, 
      enemy.x - enemy.width/2, 
      enemy.y - enemy.height/2
    );
  }
} 

function drawScore() {
  ctx.fillStyle = 'black';
  ctx.font = '24px serif';
  ctx.fillText(`Score: ${game.score}`, 0, 30);
}

function hitCheck() {
  for (const enemy of game.enemys) {
    if (
        Math.abs(game.dino.x - enemy.x) < 
        (game.dino.width*0.8/2 + enemy.width*0.9/2) &&
        Math.abs(game.dino.y - enemy.y) <
        (game.dino.height*0.5/2 + enemy.height*0.9/2)
    ) {
      game.state = 'gameover';
      game.bgm1.pause();
      ctx.fillStyle = 'black';
      ctx.font = 'bold 100px serif';
      ctx.fillText('Game Over', 150, 200);
      clearInterval(game.timer);
    }
  }
} 

document.onkeydown = function (e) {
  if (e.key === ' ' && game.state === 'init') {
    start();
  }
  if (e.key === ' ' && game.dino.moveY === 0) {
    game.dino.moveY = -41;
    game.bgm2.play();
  }
  if (e.key === 'Enter' && game.state === 'gameover') {
    init();
  }
};
