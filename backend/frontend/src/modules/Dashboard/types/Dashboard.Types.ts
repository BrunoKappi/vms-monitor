export interface CameraUI {
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

export interface DashboardState {
  cameras: CameraUI[];
  activeStreams: string[]; // List of cameraIds currently active
  isDiscovering: boolean;
  searchQuery: string;
  gridLayout: 'grid_2x2' | 'grid_3x3' | 'grid_4x4' | 'destaque_3x3' | 'destaque_4x4';
  error: string | null;
  activeTab: 'live' | 'manage' | 'resources';
  ecoMode: boolean;
}
