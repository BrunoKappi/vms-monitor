import { Router } from 'express';
import { CameraController } from '../controllers/Camera.Controller';

const router = Router();
const cameraController = new CameraController();

// Define express routes and delegate execution directly to the controller layer
router.get('/', cameraController.getStoredCameras);
router.post('/discover', cameraController.discover);
router.post('/', cameraController.addCamera);
router.put('/reorder', cameraController.reorderCameras);
router.delete('/:id', cameraController.deleteCamera);
router.post('/:id/ptz', cameraController.controlPtz);

export default router;
