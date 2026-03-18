const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

import { lebanonLandmarks } from './landmarks.js';

const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // Warm Parchment Menu Background
    scene.clearColor = new BABYLON.Color4(0.86, 0.76, 0.54, 1);

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 3.5, 45, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 60;

    const hemiLight = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.4;
    hemiLight.groundColor = new BABYLON.Color3(0.2, 0.1, 0.1);
    hemiLight.diffuse = new BABYLON.Color3(1, 0.95, 0.9);

    const spotlight = new BABYLON.SpotLight("spot", new BABYLON.Vector3(0, 50, 20), new BABYLON.Vector3(0, -1, -0.5), Math.PI / 3, 2, scene);
    spotlight.intensity = 0.7;
    spotlight.setEnabled(false); // Only enable on board mode

    const shadowGenerator = new BABYLON.ShadowGenerator(1024, spotlight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    // === SKYBOX / BACKGROUND ===
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://assets.babylonjs.com/textures/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;

    // === GLOW & POST-PROCESSING ===
    const glow = new BABYLON.GlowLayer("glow", scene);
    glow.intensity = 0.15;

    const pipeline = new BABYLON.DefaultRenderingPipeline("default", true, scene, [camera]);
    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 0.7;
    pipeline.bloomWeight = 0.15;
    pipeline.bloomKernel = 64;
    pipeline.samples = 4; // Anti-aliasing

    // === ATMOSPHERIC PARTICLES (Always there) ===
    const dustPS = new BABYLON.ParticleSystem("dust", 600, scene);
    dustPS.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);
    dustPS.emitter = BABYLON.Vector3.Zero();
    dustPS.minEmitBox = new BABYLON.Vector3(-40, -10, -30);
    dustPS.maxEmitBox = new BABYLON.Vector3(40, 20, 30);
    dustPS.color1 = new BABYLON.Color4(0.5, 0.3, 0.1, 0.4);
    dustPS.color2 = new BABYLON.Color4(0.4, 0.2, 0.05, 0.2);
    dustPS.minSize = 0.05; dustPS.maxSize = 0.2;
    dustPS.emitRate = 40;
    dustPS.start();

    // === THE MONOPOLY BOARD (Hidden initially) ===
    const boardContainer = new BABYLON.TransformNode("boardContainer", scene);
    boardContainer.setEnabled(false);

    // Base
    const boardBase = BABYLON.MeshBuilder.CreateBox("boardBase", { width: 32, height: 1.5, depth: 32 }, scene);
    boardBase.parent = boardContainer;
    boardBase.position.y = -0.75;
    const woodMat = new BABYLON.StandardMaterial("woodMat", scene);
    woodMat.diffuseColor = new BABYLON.Color3(0.2, 0.1, 0.05);
    woodMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    woodMat.specularPower = 32;
    boardBase.material = woodMat;
    boardBase.receiveShadows = true;

    // Center Branding
    const centerPart = BABYLON.MeshBuilder.CreatePlane("center", { size: 21 }, scene);
    centerPart.parent = boardContainer;
    centerPart.rotation.x = Math.PI / 2;
    centerPart.position.y = 0.01;
    const centerMat = new BABYLON.StandardMaterial("cMat", scene);
    const centerTex = new BABYLON.DynamicTexture("cTex", 512, scene);
    const ctxC = centerTex.getContext();
    ctxC.fillStyle = "#f4e4bc"; ctxC.fillRect(0, 0, 512, 512);
    ctxC.strokeStyle = "#4b2c11"; ctxC.lineWidth = 10; ctxC.strokeRect(10, 10, 492, 492);
    ctxC.font = "bold 60px Arial"; ctxC.fillStyle = "#2b1d0e"; ctxC.textAlign = "center";
    ctxC.fillText("LEBANON", 256, 230); ctxC.fillText("EDITION", 256, 310);
    centerTex.update();
    centerMat.diffuseTexture = centerTex;
    centerMat.specularColor = new BABYLON.Color3(0.5, 0.4, 0.2);
    centerMat.roughness = 0.3;
    centerPart.material = centerMat;

    // Monopoly Tiles
    const createTile = (name, x, z, color, isCorner = false) => {
        const tile = BABYLON.MeshBuilder.CreateBox(name, { width: isCorner ? 5 : 3, height: 0.1, depth: 5 }, scene);
        tile.parent = boardContainer;
        tile.position.set(x, 0.05, z);
        const tMat = new BABYLON.StandardMaterial(name + "Mat", scene);
        const tex = new BABYLON.DynamicTexture(name + "Tex", { width: 128, height: 256 }, scene);
        const ctx = tex.getContext();
        ctx.fillStyle = "#fffcf5"; ctx.fillRect(0, 0, 128, 256);
        if (!isCorner && color) { ctx.fillStyle = color; ctx.fillRect(0, 0, 128, 60); }
        ctx.strokeStyle = "#000"; ctx.lineWidth = 4; ctx.strokeRect(0, 0, 128, 256);
        ctx.font = "20px Arial"; ctx.fillStyle = "#000"; ctx.textAlign = "center";
        ctx.fillText(name.substring(0, 6), 64, 150);
        tex.update();
        tMat.diffuseTexture = tex;
        tMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        tMat.specularPower = 50;
        tile.material = tMat;
        return tile;
    };

    // Position tiles (Simplified perimeter)
    const edge = 13;
    for (let i = 0; i < 9; i++) createTile("Prop_B" + i, 11 - i * 2.75, -edge, "#ff3333");
    for (let i = 0; i < 9; i++) {
        const t = createTile("Prop_L" + i, -edge, -11 + i * 2.75, "#3333ff");
        t.rotation.y = Math.PI / 2;
    }
    for (let i = 0; i < 9; i++) createTile("Prop_T" + i, -11 + i * 2.75, edge, "#33ff33");
    for (let i = 0; i < 9; i++) {
        const t = createTile("Prop_R" + i, edge, 11 - i * 2.75, "#ffff33");
        t.rotation.y = Math.PI / 2;
    }

    // Corners
    createTile("GO", 13.5, -13.5, null, true);
    createTile("JAIL", -13.5, -13.5, null, true);
    createTile("PARK", -13.5, 13.5, null, true);
    createTile("GOTO", 13.5, 13.5, null, true);

    // Landmarks
    lebanonLandmarks.forEach((lm, i) => {
        const mesh = BABYLON.MeshBuilder.CreateBox("lm" + i, { size: 2.5 }, scene);
        mesh.parent = boardContainer;
        mesh.position.set(lm.pos.x * 5, 1, lm.pos.z * 5); // Spread them out
        if (lm.name.includes("Baalbek")) mesh.scaling.y = 1.5;
        const mat = new BABYLON.StandardMaterial("m" + i, scene);
        mat.diffuseColor = BABYLON.Color3.FromHexString(lm.color);
        mat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        mat.emissiveColor = BABYLON.Color3.FromHexString(lm.color).scale(0.15);
        mesh.material = mat;
        shadowGenerator.addShadowCaster(mesh);

        mesh.actionManager = new BABYLON.ActionManager(scene);
        mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
            alert(lm.name + ": " + lm.desc);
        }));
    });

    // === BOARD UPDATE FUNCTION ===
    scene.updateBoard = function (title, landmarks) {
        // Update Title on Dynamic Texture
        const ctxC = centerTex.getContext();
        ctxC.fillStyle = "#f4e4bc"; ctxC.fillRect(0, 0, 512, 512);
        ctxC.strokeStyle = "#4b2c11"; ctxC.lineWidth = 10; ctxC.strokeRect(10, 10, 492, 492);
        ctxC.font = "bold 60px Arial"; ctxC.fillStyle = "#2b1d0e"; ctxC.textAlign = "center";
        ctxC.fillText(title, 256, 230); ctxC.fillText("EDITION", 256, 310);
        centerTex.update();

        // Remove existing landmarks
        const existingLandmarks = boardContainer.getChildren().filter(child => child.name.startsWith("lm"));
        existingLandmarks.forEach(child => child.dispose());

        // Add new landmarks
        landmarks.forEach((lm, i) => {
            const mesh = BABYLON.MeshBuilder.CreateBox("lm" + i, { size: 2.5 }, scene);
            mesh.parent = boardContainer;
            mesh.position.set(lm.pos.x * 5, 1, lm.pos.z * 5);

            // Special scaling for tall landmarks
            if (lm.name.includes("Baalbek") || lm.name.includes("Mosque") || lm.name.includes("Hassan II")) {
                mesh.scaling.y = 1.7;
                mesh.position.y = 1.7 * 1.25 / 1; // Adjust position for scaling
            }

            const mat = new BABYLON.StandardMaterial("m" + i, scene);
            mat.diffuseColor = BABYLON.Color3.FromHexString(lm.color);
            mat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
            mat.emissiveColor = BABYLON.Color3.FromHexString(lm.color).scale(0.15);
            mesh.material = mat;
            shadowGenerator.addShadowCaster(mesh);

            mesh.actionManager = new BABYLON.ActionManager(scene);
            mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
                alert(lm.name + ": " + (lm.desc || lm.description));
            }));
        });
    };

    // Handle Switch
    scene.switchToBoard = function () {
        const overlay = document.getElementById("overlay");
        const boardUI = document.getElementById("boardUI");

        overlay.style.transition = "opacity 0.8s ease";
        overlay.style.opacity = "0";
        setTimeout(() => {
            overlay.style.display = "none";
            boardUI.style.display = "block";
            setTimeout(() => boardUI.style.opacity = "1", 50);
        }, 800);

        boardContainer.setEnabled(true);
        spotlight.setEnabled(true);

        const anim = new BABYLON.Animation("a", "radius", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT);
        anim.setKeys([{ frame: 0, value: 45 }, { frame: 60, value: 38 }]);

        const betaAnim = new BABYLON.Animation("b", "beta", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT);
        betaAnim.setKeys([{ frame: 0, value: Math.PI / 3.5 }, { frame: 60, value: Math.PI / 4 }]);

        camera.animations = [anim, betaAnim];
        scene.beginAnimation(camera, 0, 60, false);
    };

    // === BACK TO MENU ===
    window.backToMenu = function () {
        const overlay = document.getElementById("overlay");
        const boardUI = document.getElementById("boardUI");

        boardUI.style.opacity = "0";
        setTimeout(() => {
            boardUI.style.display = "none";
            overlay.style.display = "flex";
            setTimeout(() => overlay.style.opacity = "1", 10);
        }, 500);

        boardContainer.setEnabled(false);
        spotlight.setEnabled(false);

        const anim = new BABYLON.Animation("a", "radius", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT);
        anim.setKeys([{ frame: 0, value: 38 }, { frame: 60, value: 45 }]);

        const betaAnim = new BABYLON.Animation("b", "beta", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT);
        betaAnim.setKeys([{ frame: 0, value: Math.PI / 4 }, { frame: 60, value: Math.PI / 3.5 }]);

        camera.animations = [anim, betaAnim];
        scene.beginAnimation(camera, 0, 60, false);
    };

    document.getElementById("backToMap").addEventListener("click", () => window.backToMenu());

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());

window.switchToLebanon = () => {
    if (scene.updateBoard) scene.updateBoard("LEBANON", lebanonLandmarks);
    if (scene.switchToBoard) scene.switchToBoard();
};

export { scene, engine };
