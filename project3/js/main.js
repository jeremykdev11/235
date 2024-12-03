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

let paused = true;

async function loadImages() {
  // https://pixijs.com/8.x/guides/components/assets#loading-multiple-assets
  PIXI.Assets.addBundle("sprites", {
    
  });

  // The second argument is a callback function that is called whenever the loader makes progress.
  assets = await PIXI.Assets.loadBundle("sprites", (progress) => {
    console.log(`progress=${(progress * 100).toFixed(2)}%`); // 0.4288 => 42.88%
  });

  setup();
}

async function setup() {
  await app.init({ width: 600, height: 600 });

  div.appendChild(app.canvas); 
  //document.body.appendChild(app.canvas);

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
}

function end() {
    paused = true;

    // Clear out level
}