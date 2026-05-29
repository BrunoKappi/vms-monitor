import { Request, Response, NextFunction } from 'express';
import { CameraService } from '../services/Camera.Service';

export class CameraController {
  private cameraService: CameraService;

  constructor() {
    this.cameraService = new CameraService();
  }

  // Get all currently configured/saved cameras
  public getStoredCameras = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cameras = await this.cameraService.getStoredCameras();
      res.status(200).json({
        success: true,
        data: cameras
      });
    } catch (error) {
      next(error);
    }
  };

  // Run dynamic discovery and IP probes
  public discover = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cameras = await this.cameraService.discover();
      res.status(200).json({
        success: true,
        message: 'Discovery process completed.',
        data: cameras
      });
    } catch (error) {
      next(error);
    }
  };

  // Manually register a new camera
  public addCamera = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ip, port, user, pass, name } = req.body;

      // Basic request payload validation
      if (!ip || !user || !pass || !name) {
        res.status(400).json({
          success: false,
          message: 'Validation failed. Fields "ip", "user", "pass", and "name" are all required.'
        });
        return;
      }

      const parsedPort = port ? parseInt(port, 10) : 80;
      if (isNaN(parsedPort)) {
        res.status(400).json({
          success: false,
          message: 'Validation failed. Port must be a valid integer.'
        });
        return;
      }

      const newCamera = await this.cameraService.addCamera(ip, parsedPort, user, pass, name);
      res.status(201).json({
        success: true,
        message: 'Camera registered successfully.',
        data: newCamera
      });
    } catch (error) {
      next(error);
    }
  };

  // Manually remove a camera
  public deleteCamera = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Validation failed. Camera ID parameter is required.'
        });
        return;
      }

      const deleted = await this.cameraService.deleteCamera(id);
      if (deleted) {
        res.status(200).json({
          success: true,
          message: 'Camera deleted successfully.'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Camera not found.'
        });
      }
    } catch (error) {
      next(error);
    }
  };

  // Reorder cameras
  public reorderCameras = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids)) {
        res.status(400).json({
          success: false,
          message: 'Validation failed. Array "ids" of camera identifiers is required.'
        });
        return;
      }

      const reordered = await this.cameraService.reorder(ids);
      res.status(200).json({
        success: true,
        message: 'Cameras reordered successfully.',
        data: reordered
      });
    } catch (error) {
      next(error);
    }
  };

  // Pan/Tilt movement control handler
  public controlPtz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { direction, speed } = req.body;

      if (!id || !direction) {
        res.status(400).json({
          success: false,
          message: 'Validation failed. Camera ID parameter and direction body field are required.'
        });
        return;
      }

      // Convert speed to float if present
      const parsedSpeed = speed ? parseFloat(speed) : undefined;

      const result = await this.cameraService.controlPtz(id, direction, parsedSpeed);
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'PTZ continuous move executed successfully.'
        });
      } else {
        res.status(502).json({
          success: false,
          message: result.error || 'Failed to dispatch ONVIF PTZ command.'
        });
      }
    } catch (error) {
      next(error);
    }
  };
}
