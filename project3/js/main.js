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
let startScene;

let aliens = [];
let alienSprites = [];

let paused = false;

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

  // Create labels for all scenes
  createLabelsAndButtons();

  // Start update loop
  app.ticker.add(gameLoop);
}

function createLabelsAndButtons() {
  // TEMP
  spawnAliens(50);
}

function startGame() {
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

function spawnAliens(count = 10) {
  console.log("spawning aliens");

  let target = new Alien(alienSprites[3]);
  target.x = Math.random() * (sceneWidth - 50) + 25;
  target.y = Math.random() * (sceneHeight - 400) + 25;
  aliens.push(target);
  startScene.addChild(target);
  for (let i = 0; i < count; i++) {
    let alien = new Alien(alienSprites[getRandomInt(0, 2)]);
    alien.x = Math.random() * (sceneWidth - 50) + 25;
    alien.y = Math.random() * (sceneHeight - 400) + 25;
    aliens.push(alien);
    startScene.addChild(alien);
  }
}

function end() {
    paused = true;

    // Clear out level
}