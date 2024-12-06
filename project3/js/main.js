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
}

function startGame() {
  startScene.visible = false;
  //gameOverScene.visible = false;
  gameScene.visible = true;

  spawnAliens(50);

  // Unpause the game which allows the gameLoop and events to be active
  setTimeout(() => {
      paused = false;
  }, 50);
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
  let targetAlien = new Alien(targetSprite);
  newAlien(targetAlien);
  
  // Spawn all other aliens
  for (let i = 0; i < count - 1; i++) {
    let alien = new Alien(sprites[getRandomInt(0, sprites.length - 1)]);
    newAlien(alien);
  }
}

// Creates a single instance of an alien
function newAlien(alien) {
  alien.x = Math.random() * (sceneWidth - alien.width) + alien.width / 2;
  alien.y = Math.random() * (sceneHeight - alien.height) + alien.height / 2;
  aliens.push(alien);
  gameScene.addChild(alien);
}

function end() {
    paused = true;

    // Clear out level
    aliens.forEach((alien) => gameScene.removeChild(alien));
    aliens = [];
}