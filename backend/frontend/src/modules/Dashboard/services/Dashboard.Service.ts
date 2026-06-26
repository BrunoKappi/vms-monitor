import axios from 'axios';
import type { CameraUI } from '../types/Dashboard.Types';
import { DASHBOARD_CONSTANTS } from '../constants/Dashboard.Constants';

const api = axios.create({
  baseURL: DASHBOARD_CONSTANTS.BACKEND_URL,
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

  public static async shutdownSystem(): Promise<void> {
    await api.post('/system/shutdown');
  }

  public static async fetchSystemMetrics(): Promise<any> {
    const response = await api.get('/system/metrics');
    return response.data.data;
  }
}
