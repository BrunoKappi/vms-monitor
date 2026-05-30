import { Request, Response, NextFunction } from 'express';
import { SystemService } from '../services/System.Service';

export class SystemController {
  private systemService: SystemService;

  constructor() {
    this.systemService = new SystemService();
  }

  // Gracefully shuts down both the Vite frontend server and Express/WS backend processes
  public shutdown = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Trigger background shutdown tasks asynchronously so response can complete
      this.systemService.shutdown();
      
      res.status(200).json({
        success: true,
        message: 'VMS system shutdown process initiated. You can now close this dashboard tab.'
      });
    } catch (error) {
      next(error);
    }
  };
}
