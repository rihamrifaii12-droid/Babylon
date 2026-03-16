import * as BABYLON from 'babylonjs';
import { BOARD_DATA } from './data.js';

export class Board {
    constructor(scene) {
        this.scene = scene;
        this.spaces = [];
        this.createBoard();
    }

    createBoard() {
        // Create the board center (the decorative inner part)
        const center = BABYLON.MeshBuilder.CreateBox("boardCenter", {
            width: 8.5,
            height: 0.05,
            depth: 8.5
        }, this.scene);
        center.position.set(0, 0.025, 0);
        const centerMat = new BABYLON.StandardMaterial("centerMat", this.scene);
        
        // Dynamic texture for the logo
        const logoTexture = new BABYLON.DynamicTexture("logoTexture", { width: 512, height: 512 }, this.scene);
        centerMat.diffuseTexture = logoTexture;
        logoTexture.drawText("MONOPOLY", null, 250, "bold 80px Arial", "#D32F2F", "white", true);
        logoTexture.drawText("3D Edition", null, 320, "30px Arial", "black", "transparent", true);
        center.material = centerMat;

        let spaceIndex = 0;

        // Create the 4 sides of the board
        // Bottom side (Right to Left)
        for (let i = 0; i < 11; i++) {
            this.createSpace(spaceIndex++, 5 - i, -5, 0); // Bottom side
        }
        // Left side (Bottom to Top)
        for (let i = 1; i < 11; i++) {
            this.createSpace(spaceIndex++, -5, -5 + i, Math.PI / 2); // Left side
        }
        // Top side (Left to Right)
        for (let i = 1; i < 11; i++) {
            this.createSpace(spaceIndex++, -5 + i, 5, Math.PI); // Top side
        }
        // Right side (Top to Bottom)
        for (let i = 1; i < 10; i++) {
            this.createSpace(spaceIndex++, 5, 5 - i, -Math.PI / 2); // Right side
        }
    }

    createSpace(index, x, z, rotationY) {
        const data = BOARD_DATA[index];
        if (!data) return;

        const isCorner = index % 10 === 0;
        const width = isCorner ? 1.5 : 1;
        const depth = isCorner ? 1.5 : 1;

        const box = BABYLON.MeshBuilder.CreateBox(`space_${index}`, {
            width: width * 0.98,
            height: 0.1,
            depth: depth * 0.98
        }, this.scene);

        box.position.set(x, 0.05, z);
        box.rotation.y = rotationY;

        // Material with Dynamic Texture for labels
        const dynamicTexture = new BABYLON.DynamicTexture(`texture_${index}`, { width: 256, height: 256 }, this.scene);
        const mat = new BABYLON.StandardMaterial(`mat_${index}`, this.scene);
        mat.diffuseTexture = dynamicTexture;
        box.material = mat;

        // Draw on texture
        const ctx = dynamicTexture.getContext();
        
        // Background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 256, 256);

        // Color bar (only for properties)
        if (data.color && data.type === "property") {
            ctx.fillStyle = data.color;
            ctx.fillRect(0, 0, 256, 60);
        }

        // Dividers
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, 256, 256);

        // Text
        const fontSize = data.name.length > 15 ? "20px" : "24px";
        dynamicTexture.drawText(data.name, null, 140, `bold ${fontSize} Arial`, "black", "transparent", true);
        
        if (data.price > 0) {
            dynamicTexture.drawText(`$${data.price}`, null, 220, "20px Arial", "#2E7D32", "transparent", true);
        }

        this.spaces.push({
            mesh: box,
            data: data,
            index: index,
            position: new BABYLON.Vector3(x, 0.1, z)
        });
    }
}
