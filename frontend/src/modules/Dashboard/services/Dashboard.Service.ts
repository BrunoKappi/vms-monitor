import axios from 'axios';
import type { CameraUI } from '../types/Dashboard.Types';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export class DashboardService {
  public static async fetchStoredCameras(): Promise<CameraUI[]> {
    const response = await api.get('/cameras');
    return response.data.data;
  }

  public static async discoverCameras(): Promise<CameraUI[]> {
    const response = await api.post('/cameras/discover');
    return response.data.data;
  }

  public static async addCamera(payload: {
    ip: string;
    port: number;
    user: string;
    pass: string;
    name: string;
  }): Promise<CameraUI> {
    const response = await api.post('/cameras', payload);
    return response.data.data;
  }

  public static async deleteCamera(id: string): Promise<void> {
    await api.delete(`/cameras/${id}`);
  }

  public static async reorderCameras(ids: string[]): Promise<CameraUI[]> {
    const response = await api.put('/cameras/reorder', { ids });
    return response.data.data;
  }

  public static async controlPtz(id: string, direction: string, speed?: number): Promise<any> {
    const response = await api.post(`/cameras/${id}/ptz`, { direction, speed });
    return response.data;
  }
}
