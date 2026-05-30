import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

export interface AppConfig {
  port: number;
  wsStreamPort: number;
  frontendPort: number;
  cameraDefaultUser: string;
  cameraDefaultPass: string;
  cameraDefaultIps: string[];
  dbFilePath: string;
}

export const CONFIG: AppConfig = {
  port: parseInt(process.env.PORT || '42200', 10),
  wsStreamPort: parseInt(process.env.WS_STREAM_PORT || '42300', 10),
  frontendPort: parseInt(process.env.FRONTEND_PORT || '42100', 10),
  cameraDefaultUser: process.env.CAMERA_DEFAULT_USER || 'admin',
  cameraDefaultPass: process.env.CAMERA_DEFAULT_PASS || 'Snulp1234',
  cameraDefaultIps: (process.env.CAMERA_DEFAULT_IPS || '')
    .split(',')
    .map(ip => ip.trim())
    .filter(Boolean),
  dbFilePath: path.join(__dirname, '../../data/cameras.json')
};
