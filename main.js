const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Landmarks Data directly in main.js to avoid import issues
const lebanonLandmarks = [
    { name: "Raouche Rocks", pos: { x: -2, y: 0.5, z: -1 }, desc: "The iconic Pigeon Rocks of Beirut.", color: "#c2b280" },
    { name: "Baalbek Citadel", pos: { x: 2, y: 0.5, z: 2 }, desc: "Colossal Roman Temple complex.", color: "#d4af37" },
    { name: "Cedars of God", pos: { x: 1, y: 0.5, z: 3 }, desc: "Ancient cedar forest sanctuary.", color: "#2e7d32" },
    { name: "Byblos Port", pos: { x: -1.5, y: 0.5, z: 1.5 }, desc: "Ancient Phoenician port city.", color: "#4682b4" },
    { name: "Jeita Grotto", pos: { x: -0.5, y: 0.5, z: 0.5 }, desc: "Stunning crystal limestone caves.", color: "#708090" }
];

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    
    // Warm Parchment Menu Background
    scene.clearColor = new BABYLON.Color4(0.86, 0.76, 0.54, 1);

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 45, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 60;

    const hemiLight = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.6;

    const spotlight = new BABYLON.SpotLight("spot", new BABYLON.Vector3(0, 50, 20), new BABYLON.Vector3(0, -1, -0.5), Math.PI / 3, 2, scene);
    spotlight.intensity = 1.2;
    spotlight.setEnabled(false); // Only enable on board mode

    const shadowGenerator = new BABYLON.ShadowGenerator(1024, spotlight);

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
    woodMat.diffuseColor = new BABYLON.Color3(0.15, 0.08, 0.04);
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
    ctxC.fillStyle = "#f4e4bc"; ctxC.fillRect(0,0,512,512);
    ctxC.strokeStyle = "#4b2c11"; ctxC.lineWidth = 10; ctxC.strokeRect(10,10,492,492);
    ctxC.font = "bold 60px Arial"; ctxC.fillStyle = "#2b1d0e"; ctxC.textAlign = "center";
    ctxC.fillText("LEBANON", 256, 230); ctxC.fillText("EDITION", 256, 310);
    centerTex.update();
    centerMat.diffuseTexture = centerTex;
    centerPart.material = centerMat;

    // Monopoly Tiles
    const createTile = (name, x, z, color, isCorner = false) => {
        const tile = BABYLON.MeshBuilder.CreateBox(name, { width: isCorner ? 5 : 3, height: 0.1, depth: 5 }, scene);
        tile.parent = boardContainer;
        tile.position.set(x, 0.05, z);
        const tMat = new BABYLON.StandardMaterial(name + "Mat", scene);
        const tex = new BABYLON.DynamicTexture(name + "Tex", {width:128, height:256}, scene);
        const ctx = tex.getContext();
        ctx.fillStyle = "#fffcf5"; ctx.fillRect(0,0,128,256);
        if (!isCorner && color) { ctx.fillStyle = color; ctx.fillRect(0, 0, 128, 60); }
        ctx.strokeStyle = "#000"; ctx.lineWidth = 4; ctx.strokeRect(0,0,128,256);
        ctx.font = "20px Arial"; ctx.fillStyle = "#000"; ctx.textAlign = "center";
        ctx.fillText(name.substring(0,6), 64, 150);
        tex.update();
        tMat.diffuseTexture = tex;
        tile.material = tMat;
        return tile;
    };

    // Position tiles (Simplified perimeter)
    const edge = 13;
    for(let i=0; i<9; i++) createTile("Prop_B"+i, 11 - i*2.75, -edge, "#ff3333");
    for(let i=0; i<9; i++) {
        const t = createTile("Prop_L"+i, -edge, -11 + i*2.75, "#3333ff");
        t.rotation.y = Math.PI / 2;
    }
    for(let i=0; i<9; i++) createTile("Prop_T"+i, -11 + i*2.75, edge, "#33ff33");
    for(let i=0; i<9; i++) {
        const t = createTile("Prop_R"+i, edge, 11 - i*2.75, "#ffff33");
        t.rotation.y = Math.PI / 2;
    }

    // Corners
    createTile("GO", 13.5, -13.5, null, true);
    createTile("JAIL", -13.5, -13.5, null, true);
    createTile("PARK", -13.5, 13.5, null, true);
    createTile("GOTO", 13.5, 13.5, null, true);

    // Landmarks
    lebanonLandmarks.forEach((lm, i) => {
        const mesh = BABYLON.MeshBuilder.CreateBox("lm"+i, {size: 2.5}, scene);
        mesh.parent = boardContainer;
        mesh.position.set(lm.pos.x * 5, 1, lm.pos.z * 5); // Spread them out
        if(lm.name.includes("Baalbek")) mesh.scaling.y = 1.5;
        const mat = new BABYLON.StandardMaterial("m"+i, scene);
        mat.diffuseColor = BABYLON.Color3.FromHexString(lm.color);
        mesh.material = mat;
        shadowGenerator.addShadowCaster(mesh);

        mesh.actionManager = new BABYLON.ActionManager(scene);
        mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
             alert(lm.name + ": " + lm.desc);
        }));
    });

    // Handle Switch
    scene.switchToBoard = function() {
        document.getElementById("overlay").style.display = "none";
        boardContainer.setEnabled(true);
        spotlight.setEnabled(true);
        scene.clearColor = new BABYLON.Color4(0.1, 0.08, 0.05, 1);
        
        const anim = new BABYLON.Animation("a", "radius", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT);
        anim.setKeys([{frame:0, value:45}, {frame:60, value:38}]);
        camera.animations = [anim];
        scene.beginAnimation(camera, 0, 60, false);
    };

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());

window.switchToLebanon = () => {
    if (scene.switchToBoard) scene.switchToBoard();
};
