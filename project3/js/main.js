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

let paused = true;

async function loadImages() {
  // https://pixijs.com/8.x/guides/components/assets#loading-multiple-assets
  PIXI.Assets.addBundle("sprites", {
    alien1: "media/alien_1.png",
    alien2: "media/alien_2.png",
    alien3: "media/alien_3.png",
    alien4: "media/alien_4.png",
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

  // Create labels for all scenes
  createLabelsAndButtons();

  // Start update loop
  app.ticker.add(gameLoop);
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


function startGame() {
  startScene.visible = false;
  gameOverScene.visible = false;
  gameScene.visible = true;
  spawnAliens(50);

  // Unpause the game which allows the gameLoop and events to be active
  setTimeout(() => {
      paused = false;
      app.view.onclick = clickAlien;
  }, 50);
}

function clickAlien() {
  let mousePos = app.renderer.events.pointer.global;

  for (let alien of aliens) {
    // find first clicked alien and check if it is the target
    if (pointInRect(mousePos.x, mousePos.y, alien)) {
      // clicked alien is the correct target
      if (alien.isTarget) {

      }
      // clicked alien is not the correct target
      else {
        end();
      }

      break;
    }
  }

  
}

function gameLoop(){
  if (paused) return;
  
  // Calculate "delta time"
  let dt = 1 / app.ticker.FPS;
  if (dt > 1 / 12) dt = 1 / 12;

  // move aliens
  for (let alien of aliens) {
    alien.move(dt);
    
    // reflect off of screen bounds
    if (alien.x < alien.width / 2 && alien.fwd.x < 0) {                 // left bound
      alien.reflectX();
    }
    if (alien.x > sceneWidth - alien.width / 2 && alien.fwd.x > 0) {    // right bound
      alien.reflectX();
    }
    if (alien.y < alien.height / 2 && alien.fwd.y < 0) {                // top bound
      alien.reflectY();
    }
    if (alien.y > sceneHeight - alien.height / 2 && alien.fwd.y > 0) {  // bottom bound
      alien.reflectY();
    }
  }
}

// Spawns a number of aliens to the game screen
function spawnAliens(count = 10) {
  console.log("spawning aliens");

  // Create new array with alien sprites
  let sprites = alienSprites.map((x) => x);
  let targetSprite = alienSprites[getRandomInt(0, 3)];
  sprites = sprites.filter((sprite) => sprite != targetSprite);

  // Spawn target alien
  let targetAlien = newAlien(targetSprite, true)
  
  // Spawn all other aliens
  for (let i = 0; i < count - 1; i++) {
    let alien = newAlien(sprites[getRandomInt(0, sprites.length - 1)], false);
  }
}

// Creates a single instance of an alien
function newAlien(sprite, isTarget) {
  let alien = new Alien(sprite);

  if (isTarget) alien.isTarget = true;

  alien.x = Math.random() * (sceneWidth - alien.width) + alien.width / 2;
  alien.y = Math.random() * (sceneHeight - alien.height) + alien.height / 2;
  aliens.push(alien);
  gameScene.addChild(alien);

  return alien;
}

function end() {
    paused = true;

    // Clear out level
    aliens.forEach((alien) => gameScene.removeChild(alien));
    aliens = [];

    // disable onclick event
    app.view.onclick = null;
    
    gameOverScene.visible = true;
    gameScene.visible = false;
}