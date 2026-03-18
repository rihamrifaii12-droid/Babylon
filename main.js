const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Main Scene setup
const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    
    // Default Sky
    scene.clearColor = new BABYLON.Color4(0.4, 0.7, 1.0, 1);

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2.2, 1.1, 45, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 100;

    const hemiLight = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.7;

    const spotlight = new BABYLON.SpotLight("sun", new BABYLON.Vector3(0, 80, 20), new BABYLON.Vector3(0, -1, -0.5), Math.PI / 3, 2, scene);
    spotlight.intensity = 1.0;
    spotlight.setEnabled(false); 

    const shadowGenerator = new BABYLON.ShadowGenerator(1024, spotlight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    // Skybox
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://assets.babylonjs.com/textures/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;

    // Glow
    new BABYLON.GlowLayer("glow", scene).intensity = 0.15;

    // Monopoly Board Container
    const boardContainer = new BABYLON.TransformNode("boardContainer", scene);
    boardContainer.setEnabled(false);

    // Board Base
    const boardBase = BABYLON.MeshBuilder.CreateBox("boardBase", { width: 32, height: 1.5, depth: 32 }, scene);
    boardBase.parent = boardContainer;
    boardBase.position.y = -0.75;
    const woodMat = new BABYLON.StandardMaterial("woodMat", scene);
    woodMat.diffuseColor = new BABYLON.Color3(0.2, 0.1, 0.05);
    boardBase.material = woodMat;
    boardBase.receiveShadows = true;

    // Center Branding
    const centerPart = BABYLON.MeshBuilder.CreatePlane("center", { size: 21 }, scene);
    centerPart.parent = boardContainer;
    centerPart.rotation.x = Math.PI / 2;
    centerPart.position.y = 0.01;
    const centerMat = new BABYLON.StandardMaterial("cMat", scene);
    const centerTex = new BABYLON.DynamicTexture("cTex", 512, scene);
    centerMat.diffuseTexture = centerTex;
    centerPart.material = centerMat;

    // Tiles Creation Helper
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
        tile.material = tMat;
        return tile;
    };

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
    createTile("GO", 13.5, -13.5, null, true);
    createTile("JAIL", -13.5, -13.5, null, true);
    createTile("PARK", -13.5, 13.5, null, true);
    createTile("GOTO", 13.5, 13.5, null, true);

    // Environment cleaning
    scene.clearEnvironment = function() {
        const env = boardContainer.getChildren().filter(child => 
            child.name.startsWith("env_") || child.name.startsWith("lm")
        );
        env.forEach(child => child.dispose());
    };

    // Generic Update
    scene.updateBoard = function (title, landmarks) {
        scene.clearEnvironment();
        
        // Update Brand
        const ctxC = centerTex.getContext();
        ctxC.fillStyle = "#f4e4bc"; ctxC.fillRect(0, 0, 512, 512);
        ctxC.strokeStyle = "#4b2c11"; ctxC.lineWidth = 10; ctxC.strokeRect(10, 10, 492, 492);
        ctxC.font = "bold 60px Arial"; ctxC.fillStyle = "#2b1d0e"; ctxC.textAlign = "center";
        ctxC.fillText(title, 256, 230); ctxC.fillText("EDITION", 256, 310);
        centerTex.update();

        // Add Landmarks
        landmarks.forEach((lm, i) => {
            const mesh = BABYLON.MeshBuilder.CreateBox("lm" + i, { size: 2.5 }, scene);
            mesh.parent = boardContainer;
            mesh.position.set(lm.pos.x * 5, 1.25, lm.pos.z * 5);
            if (lm.name.match(/Temple|Mosque|Hassan/i)) mesh.scaling.y = 1.7;
            const mat = new BABYLON.StandardMaterial("m" + i, scene);
            mat.diffuseColor = BABYLON.Color3.FromHexString(lm.color);
            mesh.material = mat;
            shadowGenerator.addShadowCaster(mesh);
            mesh.actionManager = new BABYLON.ActionManager(scene);
            mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
                alert(lm.name + ": " + (lm.desc || lm.description));
            }));
        });
    };

    scene.switchToBoard = function (targetRadius = 45, targetBeta = 1.1) {
        document.getElementById("overlay").style.display = "none";
        document.getElementById("boardUI").style.display = "block";
        document.getElementById("boardUI").style.opacity = "1";
        boardContainer.setEnabled(true);
        spotlight.setEnabled(true);
        const anim = new BABYLON.Animation("a", "radius", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT);
        anim.setKeys([{ frame: 0, value: 45 }, { frame: 60, value: targetRadius }]);
        const betaAnim = new BABYLON.Animation("b", "beta", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT);
        betaAnim.setKeys([{ frame: 0, value: 1.1 }, { frame: 60, value: targetBeta }]);
        camera.animations = [anim, betaAnim];
        scene.beginAnimation(camera, 0, 60, false);
    };

    return { scene, boardContainer, shadowGenerator };
};

const setup = createScene();
const scene = setup.scene;
const boardContainer = setup.boardContainer;
const shadowGenerator = setup.shadowGenerator;

engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());

document.getElementById("backToMap").addEventListener("click", () => {
    document.getElementById("boardUI").style.display = "none";
    document.getElementById("overlay").style.display = "flex";
    boardContainer.setEnabled(false);
});

export { scene, boardContainer, shadowGenerator };
