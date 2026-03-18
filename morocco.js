// === DEVELOPER: [MOROCCO TEAM] ===
// Edit this file to add monuments and logic specifically for Morocco.
import { scene, boardContainer, shadowGenerator } from './main.js';
import { moroccoLandmarks } from './morocco_landmarks.js';

const createPalm = (x, z) => {
    const trunk = BABYLON.MeshBuilder.CreateCylinder("env_palm", {height: 8, diameter: 0.5}, scene);
    trunk.parent = boardContainer; trunk.position.set(x, 4, z);
    const tMat = new BABYLON.StandardMaterial("tMat", scene); tMat.diffuseColor = new BABYLON.Color3(0.4, 0.2, 0.1);
    trunk.material = tMat;

    for(let i=0; i<5; i++) {
        const leaf = BABYLON.MeshBuilder.CreateBox("env_leaf", {width: 0.5, height: 4, depth: 0.1}, scene);
        leaf.parent = trunk; leaf.position.y = 4;
        leaf.rotation.x = Math.PI / 3;
        leaf.rotation.y = (i * Math.PI * 2) / 5;
        const lMat = new BABYLON.StandardMaterial("lMat", scene); lMat.diffuseColor = new BABYLON.Color3(0.1, 0.5, 0.1);
        leaf.material = lMat;
    }
};

export const createMoroccoEnvironment = () => {
    // Hassan II Mosque Minaret
    const minaret = BABYLON.MeshBuilder.CreateBox("env_minaret", {width: 4, height: 15, depth: 4}, scene);
    minaret.parent = boardContainer; minaret.position.set(-20, 7.5, -20);
    const mMat = new BABYLON.StandardMaterial("mMat", scene); mMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.8);
    minaret.material = mMat;
    
    const top = BABYLON.MeshBuilder.CreateBox("env_top", {width: 5, height: 2, depth: 5}, scene);
    top.parent = minaret; top.position.y = 8; top.material = mMat;

    // Some Palms
    createPalm(20, 20);
    createPalm(25, 15);
    createPalm(-25, 25);
    
    // Sand Dunes (Simple humps)
    for(let i=0; i<3; i++) {
        const dune = BABYLON.MeshBuilder.CreateSphere("env_dune", {diameterX: 15, diameterY: 5, diameterZ: 10}, scene);
        dune.parent = boardContainer;
        dune.position.set(-25 + i*10, 0, 25);
        const dMat = new BABYLON.StandardMaterial("dMat", scene);
        dMat.diffuseColor = new BABYLON.Color3(0.94, 0.8, 0.5);
        dune.material = dMat;
    }
};

window.switchToMorocco = () => {
    scene.updateBoard("MOROCCO", moroccoLandmarks);
    createMoroccoEnvironment();
    scene.switchToBoard();
};
