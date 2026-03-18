// === DEVELOPER: [LEBANON TEAM] ===
// Edit this file to add monuments and logic specifically for Lebanon/Baalbek.
import { scene, boardContainer, shadowGenerator } from './main.js';
import { lebanonLandmarks } from './lebanon_landmarks.js';

const buildColumn = (x, z) => {
    const pillar = BABYLON.MeshBuilder.CreateCylinder("env_pillar", { height: 10, diameter: 1.0 }, scene);
    pillar.parent = boardContainer;
    pillar.position.set(x, 10, z); // Podium base
    const pMat = new BABYLON.StandardMaterial("pMat", scene);
    pMat.diffuseColor = new BABYLON.Color3(0.85, 0.75, 0.5);
    pillar.material = pMat;
    shadowGenerator.addShadowCaster(pillar);
    
    const capital = BABYLON.MeshBuilder.CreateBox("env_cap", { width: 1.6, height: 0.8, depth: 1.6 }, scene);
    capital.parent = pillar;
    capital.position.y = 5.2;
    capital.material = pMat;
    return pillar;
};

export const createLebanonEnvironment = () => {
    // Huge Podium
    const base = BABYLON.MeshBuilder.CreateBox("env_base", { width: 25, height: 5, depth: 10 }, scene);
    base.parent = boardContainer;
    base.position.set(-15, 2.5, 20);
    const sMat = new BABYLON.StandardMaterial("sMat", scene);
    sMat.diffuseColor = new BABYLON.Color3(0.75, 0.65, 0.5);
    base.material = sMat;

    // Jupiter Pillars
    const pillars = [];
    for(let i=0; i<6; i++) pillars.push(buildColumn(-20 + i*2.2, 20));

    const architrave = BABYLON.MeshBuilder.CreateBox("env_arch", { width: 13.5, height: 1.5, depth: 2 }, scene);
    architrave.parent = boardContainer;
    architrave.position.set(-14.5, 16.2, 20);
    architrave.material = pillars[0].material;

    // Lebanese House
    const house = BABYLON.MeshBuilder.CreateBox("env_house", { size: 4 }, scene);
    house.parent = boardContainer; house.position.set(20, 2, 20);
    const rMat = new BABYLON.StandardMaterial("rMat", scene); rMat.diffuseColor = new BABYLON.Color3(0.7, 0.2, 0.1);
    const roof = BABYLON.MeshBuilder.CreateCylinder("env_roof", { diameter: 6, height: 2, tessellation: 4 }, scene);
    roof.parent = house; roof.position.y = 3; roof.rotation.y = Math.PI / 4; roof.material = rMat;
};

window.switchToLebanon = () => {
    scene.updateBoard("BAALBEK", lebanonLandmarks);
    createLebanonEnvironment();
    scene.switchToBoard(33, 1.0); // Focus spécifique au Liban
};
