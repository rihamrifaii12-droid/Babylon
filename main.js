const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true, { antialias: true });

const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // Warm, sepia-toned background (like old light reflecting on paper)
    scene.clearColor = new BABYLON.Color4(0.86, 0.76, 0.54, 1);

    const camera = new BABYLON.ArcRotateCamera("cam", -Math.PI/2, Math.PI/2.5, 45, BABYLON.Vector3.Zero(), scene);
    
    const hemi = new BABYLON.HemisphericLight("h", new BABYLON.Vector3(0, 1, 0), scene);
    hemi.intensity = 0.8;
    hemi.groundColor = new BABYLON.Color3(0.4, 0.3, 0.1);

    // === EXPLORER ATMOSPHERE ===

    // Floating Dust (Map particles)
    const dustPS = new BABYLON.ParticleSystem("dust", 500, scene);
    dustPS.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);
    dustPS.emitter = BABYLON.Vector3.Zero();
    dustPS.minEmitBox = new BABYLON.Vector3(-35, -15, -5);
    dustPS.maxEmitBox = new BABYLON.Vector3(35, 15, 5);
    
    dustPS.color1 = new BABYLON.Color4(0.5, 0.3, 0.1, 0.4);
    dustPS.color2 = new BABYLON.Color4(0.4, 0.2, 0.05, 0.2);
    dustPS.colorDead = new BABYLON.Color4(0, 0, 0, 0);
    
    dustPS.minSize = 0.05; dustPS.maxSize = 0.2;
    dustPS.minLifeTime = 5; dustPS.maxLifeTime = 10;
    dustPS.emitRate = 40;
    dustPS.blendMode = BABYLON.ParticleSystem.BLENDMODE_MULTIPLY; // Darker particles like ink spots
    dustPS.gravity = new BABYLON.Vector3(0, -0.02, 0);
    
    dustPS.direction1 = new BABYLON.Vector3(-0.2, 0.1, 0.1);
    dustPS.direction2 = new BABYLON.Vector3(0.2, -0.1, -0.1);
    dustPS.start();

    // Subtle fog/parchment haze
    const parchment = BABYLON.MeshBuilder.CreatePlane("p", {size: 100}, scene);
    parchment.position.z = 2;
    const pMat = new BABYLON.StandardMaterial("pMat", scene);
    pMat.diffuseColor = new BABYLON.Color3(0.8, 0.7, 0.5);
    pMat.alpha = 0.1;
    pMat.disableLighting = true;
    parchment.material = pMat;

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
