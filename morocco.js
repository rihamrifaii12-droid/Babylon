import { scene } from './main.js';
import { moroccoLandmarks } from './morocco_landmarks.js';

window.switchToMorocco = () => {
    if (scene.updateBoard) {
        scene.updateBoard("MOROCCO", moroccoLandmarks);
    }
    if (scene.switchToBoard) {
        scene.switchToBoard();
    }
};
