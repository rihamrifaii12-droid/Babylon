export class Player {
    constructor(id, name, color, scene) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.money = 1500;
        this.position = 0; // Index on board
        this.properties = [];
        this.inJail = false;
        this.jailTurns = 0;

        // 3D Token
        this.mesh = this.createToken(scene);
    }

    createToken(scene) {
        const token = BABYLON.MeshBuilder.CreateCylinder(`token_${this.id}`, {
            diameterTop: 0.2,
            diameterBottom: 0.4,
            height: 0.6
        }, scene);
        
        const mat = new BABYLON.StandardMaterial(`tokenMat_${this.id}`, scene);
        mat.diffuseColor = BABYLON.Color3.FromHexString(this.color);
        token.material = mat;
        
        token.position.y = 0.5; // Slightly above board
        return token;
    }

    moveTo(targetSpace, scene, onAnimationEnd) {
        const frameRate = 30;
        const animationX = new BABYLON.Animation("moveX", "position.x", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        const animationZ = new BABYLON.Animation("moveZ", "position.z", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

        const keysX = [
            { frame: 0, value: this.mesh.position.x },
            { frame: frameRate, value: targetSpace.position.x }
        ];
        const keysZ = [
            { frame: 0, value: this.mesh.position.z },
            { frame: frameRate, value: targetSpace.position.z }
        ];

        animationX.setKeys(keysX);
        animationZ.setKeys(keysZ);

        this.mesh.animations = [animationX, animationZ];
        scene.beginAnimation(this.mesh, 0, frameRate, false, 1, onAnimationEnd);
    }
}

export class GameEngine {
    constructor(scene, board) {
        this.scene = scene;
        this.board = board;
        this.players = [
            new Player(0, "Player 1", "#FF5252", scene),
            new Player(1, "Player 2", "#2196F3", scene)
        ];
        this.currentPlayerIndex = 0;
        this.gameState = "idle"; // rolling, moving, buying, etc.
        
        this.updatePlayerTokens();
    }

    rollDice() {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        return { total: d1 + d2, doubles: d1 === d2 };
    }

    async moveCurrentPlayer(steps, scene) {
        const player = this.players[this.currentPlayerIndex];
        this.gameState = "moving";

        for (let i = 0; i < steps; i++) {
            player.position = (player.position + 1) % 40;
            const targetSpace = this.board.spaces[player.position];
            
            await new Promise(resolve => {
                player.moveTo(targetSpace, scene, resolve);
                // Play a small sound or effect here later
            });
        }

        const finalSpace = this.board.spaces[player.position];
        this.gameState = "idle";
        return finalSpace.data;
    }

    buyProperty() {
        const player = this.players[this.currentPlayerIndex];
        const space = this.board.spaces[player.position];
        const data = space.data;

        if (data.type === "property" && !data.owner && player.money >= data.price) {
            player.money -= data.price;
            data.owner = player.id;
            player.properties.push(space.index);
            return true;
        }
        return false;
    }

    nextTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    updatePlayerTokens() {
        this.players.forEach((p, i) => {
            const space = this.board.spaces[p.position];
            p.updatePosition(space.position);
        });
    }
}
