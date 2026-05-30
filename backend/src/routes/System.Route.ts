import { Router } from 'express';
import { SystemController } from '../controllers/System.Controller';

const router = Router();
const systemController = new SystemController();

// Define express routes and delegate execution to the controller layer
router.post('/shutdown', systemController.shutdown);

export default router;
