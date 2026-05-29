export interface Camera {
  id: string;
  ip: string;
  port: number;
  name: string;
  user: string;
  pass: string;
  status: 'online' | 'offline';
  rtspUrl?: string;
  manufacturer?: string;
  model?: string;
  hardwareId?: string;
  isCustom?: boolean;
}

export interface StreamSession {
  cameraId: string;
  ffmpegProcess: any; // child_process.ChildProcess
  clients: Set<any>; // Set of ws.WebSocket connections
  rtspUrl: string;
}
