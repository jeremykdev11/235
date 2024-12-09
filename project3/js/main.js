// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application();

let sceneWidth, sceneHeight;
let div;
window.onload = () => { 
    div = document.querySelector("div");
}

// aliases
let stage;
let assets;

// game variables
let startScene, gameScene, gameOverScene;

let aliens = [];
let alienSprites = [];
let gameWidth = 550; let gameHeight = 400;
let gameX = 25; let gameY = 175;

let score = 0;
let timer = 30;
let level = 0;
let wantedSprite;

let paused = true;

async function loadImages() {
  // https://pixijs.com/8.x/guides/components/assets#loading-multiple-assets
  PIXI.Assets.addBundle("sprites", {
    alien1: "media/alien_1.png",
    alien2: "media/alien_2.png",
    alien3: "media/alien_3.png",
    alien4: "media/alien_4.png",
    menuBG: "media/BG.png",
    gameBG: "media/gameBG.png",
  });

  // The second argument is a callback function that is called whenever the loader makes progress.
  assets = await PIXI.Assets.loadBundle("sprites", (progress) => {
    console.log(`progress=${(progress * 100).toFixed(2)}%`); // 0.4288 => 42.88%
  });
  
  alienSprites = [assets.alien1, assets.alien2, assets.alien3, assets.alien4];

  setup();
}

async function setup() {
  await app.init({ width: 600, height: 600 });

  // add canvas to div
  div.appendChild(app.canvas);

  stage = app.stage;
  sceneWidth = app.renderer.width;
  sceneHeight = app.renderer.height;

  // Create the `start` scene
  startScene = new PIXI.Container();
  stage.addChild(startScene);

  // Create the 'game' scene and make it invisible
  gameScene = new PIXI.Container();
  gameScene.visible = false;
  stage.addChild(gameScene);

  // Create the `gameOver` scene and make it invisible
  gameOverScene = new PIXI.Container();
  gameOverScene.visible = false;
  stage.addChild(gameOverScene);

  // Create backgrounds for all scenes
  createBackgrounds();

  // Create labels for all scenes
  createLabelsAndButtons();

  // Start update loop
  app.ticker.add(gameLoop);
}

// Creates the backgrounds of each scene
function createBackgrounds() {
  // Start scene
  let startBG = new PIXI.Sprite(assets.menuBG);
  startScene.addChild(startBG);

  // Game scene
  let gameBG = new PIXI.Sprite(assets.gameBG);
  gameScene.addChild(gameBG);

  // Game over scene
  let gameOverBG = new PIXI.Sprite(assets.menuBG);
  gameOverScene.addChild(gameOverBG);
}

function createLabelsAndButtons() {
  let buttonStyle = {
      fill: 0xff0000,
      fontSize: 24,
      fontFamily: "Press Start 2P",
  };

  // Set up startScene
  // Make top start label
  let startLabel1 = new PIXI.Text("Find This Guy!", {
      fill: 0xffffff,
      fontSize: 40,
      fontFamily: "Press Start 2P",
      stroke: 0xff0000,
      strokeThickness: 6,
  });
  startLabel1.x = sceneWidth / 2 - startLabel1.width / 2;
  startLabel1.y = 120;
  startScene.addChild(startLabel1);

  // Make start game button
  let startButton = new PIXI.Text("PRESS TO START", buttonStyle);
  startButton.x = sceneWidth / 2 - startButton.width / 2;
  startButton.y = sceneHeight - 100;
  startButton.interactive = true;
  startButton.buttonMode = true;
  startButton.on("pointerup", startGame); // startGame is a function reference
  startButton.on("pointerover", (e) => (e.target.alpha = 0.7)); // concise arrow function with no brackets
  startButton.on("pointerout", (e) => (e.currentTarget.alpha = 1.0));
  startScene.addChild(startButton);

  // Set up gameScene
  // Make wanted alien
  wantedSprite = new PIXI.Sprite(assets.alien1);
  wantedSprite.x = 275;
  wantedSprite.y = 37;
  gameScene.addChild(wantedSprite);

  // Set up gameOverScene
  // make game over text
    let gameOverText = new PIXI.Text("Game Over!\n\n   :-O", {
      fill: 0xffffff,
      fontSize: 40,
      fontFamily: "Press Start 2P",
      stroke: 0xff0000,
      strokeThickness: 6,
  });
  gameOverText.x = sceneWidth / 2 - gameOverText.width / 2;
  gameOverText.y = sceneHeight / 2 - 160;
  gameOverScene.addChild(gameOverText);
  
  // make "play again?" button
  let playAgainButton = new PIXI.Text("Play Again?", buttonStyle);
  playAgainButton.x = sceneWidth / 2 - playAgainButton.width / 2;
  playAgainButton.y = sceneHeight - 100;
  playAgainButton.interactive = true;
  playAgainButton.buttonMode = true;
  playAgainButton.on("pointerup", startGame); // startGame is a function reference
  playAgainButton.on("pointerover", (e) => (e.target.alpha = 0.7)); // concise arrow function with no brackets
  playAgainButton.on("pointerout", (e) => (e.currentTarget.alpha = 1.0)); // ditto
  gameOverScene.addChild(playAgainButton);
}

// Sets up and starts gameplay
function startGame() {
  startScene.visible = false;
  gameOverScene.visible = false;
  gameScene.visible = true;

  // Reset game variables
  timer = 10;
  score = 0;
  level = 0;

  // load level
  nextLevel();

  // Unpause the game which allows the gameLoop and events to be active
  setTimeout(() => {
      paused = false;
      app.view.onclick = clickAlien;
  }, 50);
}

// Start the next level of the game
function nextLevel() {
  clearAliens();
  if (timer > 50) timer = 50;

  let count = Math.min(100, 3 + level * 2);
  let speed = Math.min(250, 100 + level * 5);
  spawnAliens(count, speed);
}

// Check if an alien is clicked and determine if it was the target
function clickAlien() {
  let mousePos = app.renderer.events.pointer.global;

  for (let alien of aliens) {
    // find first clicked alien and check if it is the target
    if (pointInRect(mousePos.x, mousePos.y, alien)) {
      // clicked alien is the correct target
      if (alien.isTarget) {
        timer += 5;
        score += 1;
        level += 1;
        nextLevel();
      }
      // clicked alien is not the correct target
      else {
        timer -= 10;
      }
      break;
    }
  }
}

// Run game loop
function gameLoop(){
  if (paused) return;
  
  // Calculate "delta time"
  let dt = 1 / app.ticker.FPS;
  if (dt > 1 / 12) dt = 1 / 12;

  // move aliens
  for (let alien of aliens) {
    alien.move(dt);
    
    // reflect off of game bounds
    if (alien.x < gameX + alien.width / 2 && alien.fwd.x < 0) {                 // left bound
      alien.reflectX();
    }
    if (alien.x > gameX + gameWidth - alien.width / 2 && alien.fwd.x > 0) {    // right bound
      alien.reflectX();
    }
    if (alien.y < gameY + alien.height / 2 && alien.fwd.y < 0) {                // top bound
      alien.reflectY();
    }
    if (alien.y > gameY + gameHeight - alien.height / 2 && alien.fwd.y > 0) {  // bottom bound
      alien.reflectY();
    }
  }

  // Decrease timer
  timer -= dt;
  if (timer < 0) end();
}

// Spawns a number of aliens to the game screen
function spawnAliens(count = 3, speed = 100) {

  // Create new array with filtered alien sprites
  let sprites = alienSprites.map((x) => x);
  let targetSprite = alienSprites[getRandomInt(0, 3)];
  sprites = sprites.filter((sprite) => sprite != targetSprite);

  // Spawn target alien
  newAlien(targetSprite, speed, true)
  
  // Spawn all other aliens
  for (let i = 0; i < count - 1; i++) {
    newAlien(sprites[getRandomInt(0, sprites.length - 1)], speed, false);
  }

  // Update wanted alien label
  wantedSprite.texture = targetSprite;
}

// Creates a single instance of an alien
function newAlien(sprite, speed, isTarget) {
  let alien = new Alien(sprite, speed);

  if (isTarget) alien.isTarget = true;

  alien.x = gameX + Math.random() * (gameWidth - alien.width) + alien.width / 2;
  alien.y = gameY + Math.random() * (gameHeight - alien.height) + alien.height / 2;
  aliens.push(alien);
  gameScene.addChild(alien);

  return alien;
}

// Brings the game to game over
function end() {
    paused = true;

    clearAliens();

    // disable onclick event
    app.view.onclick = null;
    
    gameOverScene.visible = true;
    gameScene.visible = false;
}

// Removes all aliens from the game
function clearAliens() {
  // Clear out level
  aliens.forEach((alien) => gameScene.removeChild(alien));
  aliens = [];
}