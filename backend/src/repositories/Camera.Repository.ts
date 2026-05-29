import fs from 'fs';
import path from 'path';
import { Camera } from '../types/Camera.Types';
import { CONFIG } from '../config/App.Config';

export class CameraRepository {
  private filePath: string;

  constructor() {
    this.filePath = CONFIG.dbFilePath;
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  public async getAll(): Promise<Camera[]> {
    try {
      const data = await fs.promises.readFile(this.filePath, 'utf-8');
      return JSON.parse(data) as Camera[];
    } catch (error) {
      console.error('Error reading cameras database:', error);
      return [];
    }
  }

  public async saveAll(cameras: Camera[]): Promise<void> {
    try {
      await fs.promises.writeFile(this.filePath, JSON.stringify(cameras, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing cameras database:', error);
    }
  }

  public async findById(id: string): Promise<Camera | null> {
    const cameras = await this.getAll();
    return cameras.find(c => c.id === id) || null;
  }

  public async save(camera: Camera): Promise<Camera> {
    const cameras = await this.getAll();
    const index = cameras.findIndex(c => c.id === camera.id);

    if (index >= 0) {
      cameras[index] = camera;
    } else {
      cameras.push(camera);
    }

    await this.saveAll(cameras);
    return camera;
  }

  public async delete(id: string): Promise<boolean> {
    const cameras = await this.getAll();
    const initialLength = cameras.length;
    const filtered = cameras.filter(c => c.id !== id);

    if (filtered.length !== initialLength) {
      await this.saveAll(filtered);
      return true;
    }
    return false;
  }
}
