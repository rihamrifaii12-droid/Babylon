import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import './style.css';
import { Board } from './src/board.js';
import { GameEngine } from './src/gameEngine.js';

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.05, 1);

    // Camera
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 30;

    // Lights
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const pointLight = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 10, 0), scene);
    pointLight.intensity = 0.5;

    // Initialize Board and Engine
    const board = new Board(scene);
    const game = new GameEngine(scene, board);

    // UI elements
    const rollBtn = document.getElementById("roll-button");
    const moneyDisplay = document.getElementById("player-money");
    const currentPlayerDisplay = document.getElementById("current-player");
    const eventLog = document.getElementById("event-log");

    const logEvent = (msg) => {
        const entry = document.createElement("div");
        entry.className = "log-entry";
        entry.innerText = msg;
        eventLog.prepend(entry);
    };

    rollBtn.onclick = async () => {
        if (game.gameState !== "idle") return;

        const roll = game.rollDice();
        const player = game.players[game.currentPlayerIndex];
        
        logEvent(`${player.name} rolled ${roll.total}!`);
        rollBtn.disabled = true;
        
        const spaceData = await game.moveCurrentPlayer(roll.total, scene);
        logEvent(`Landed on ${spaceData.name}`);

        // Logic for property purchase
        if (spaceData.type === "property" && !spaceData.owner) {
            if (confirm(`Buy ${spaceData.name} for $${spaceData.price}?`)) {
                if (game.buyProperty()) {
                    logEvent(`${player.name} bought ${spaceData.name}`);
                } else {
                    logEvent(`Not enough money!`);
                }
            }
        }

        game.nextTurn();
        rollBtn.disabled = false;
        
        // Update UI
        const nextPlayer = game.players[game.currentPlayerIndex];
        currentPlayerDisplay.innerText = nextPlayer.name;
        currentPlayerDisplay.style.borderBottomColor = nextPlayer.color;
        moneyDisplay.innerText = `$${nextPlayer.money}`;
    };

    return scene;
};

const scene = createScene();

engine.runRenderLoop(function () {
    scene.render();
});

window.addEventListener("resize", function () {
    engine.resize();
});
