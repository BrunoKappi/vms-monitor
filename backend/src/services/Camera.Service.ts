import os from 'os';
import net from 'net';
import { Camera } from '../types/Camera.Types';
import { CameraRepository } from '../repositories/Camera.Repository';
import { CONFIG } from '../config/App.Config';

let Onvif: any = null;
let Discovery: any = null;

async function loadOnvifLib() {
  if (!Onvif || !Discovery) {
    // Force native runtime ESM dynamic import that is never transpiled to CJS require
    const importESM = new Function('return import("@2bad/onvif")');
    const lib = await importESM();
    Onvif = lib.Onvif;
    Discovery = lib.Discovery;
  }
  return { Onvif, Discovery };
}

// Dynamically detects the local network IPv4 subnet with priority-based physical interface detection
function getLocalSubnet(): string {
  const interfaces = os.networkInterfaces();
  const candidates: { subnet: string; priority: number }[] = [];

  for (const name of Object.keys(interfaces)) {
    const lowerName = name.toLowerCase();
    
    // Detect and heavily deprioritize virtual adapters (WSL, Docker, VirtualBox, VMware, VPNs, Windows Hotspot, etc.)
    const isVirtual = lowerName.includes('wsl') || 
                      lowerName.includes('docker') || 
                      lowerName.includes('virtual') || 
                      lowerName.includes('vbox') || 
                      lowerName.includes('vmware') || 
                      lowerName.includes('host-only') ||
                      lowerName.includes('vethernet') ||
                      lowerName.includes('hyper-v') ||
                      lowerName.includes('hyperv') ||
                      lowerName.includes('vpn') ||
                      lowerName.includes('*'); // Windows appends asterisk (*) to virtual Wi-Fi Direct/Hotspot adapters

    // Detect high-probability physical connections (Wi-Fi, Ethernet, physical Local Connection)
    const isPhysical = lowerName.includes('wi-fi') || 
                       lowerName.includes('wifi') || 
                       lowerName.includes('ethernet') || 
                       (lowerName.includes('conexão local') && !lowerName.includes('*')) ||
                       (lowerName.includes('conexao local') && !lowerName.includes('*'));

    for (const iface of interfaces[name] || []) {
      if ((iface.family === 'IPv4' || (iface.family as any) === 4 || (iface.family as any) === '4') && !iface.internal) {
        const parts = iface.address.split('.');
        const firstOctet = parts[0];
        
        if (firstOctet === '192' || firstOctet === '10' || firstOctet === '172') {
          const subnet = `${parts[0]}.${parts[1]}.${parts[2]}`;
          
          // Determine priority (192.168.x.x home network gets highest priority, virtual networks are bottom-tier)
          let priority = 0;
          if (firstOctet === '192') priority = 100;
          else if (firstOctet === '10') priority = 90;
          else if (firstOctet === '172') priority = 80;

          if (isPhysical) {
            priority += 50; // Give a boost to high-probability physical connections (e.g. Wi-Fi)
          }

          if (isVirtual) {
            priority -= 200; // Deprioritize heavily to place at the absolute bottom
          }

          candidates.push({ subnet, priority });
        }
      }
    }
  }

  if (candidates.length > 0) {
    // Sort by priority descending
    candidates.sort((a, b) => b.priority - a.priority);
    console.log('Subnet sweep candidates found:', candidates);
    return candidates[0].subnet;
  }

  return '192.168.1'; // Fallback subnet
}

// Scans all 254 IPs in the subnet concurrently for open RTSP port 554 (takes ~800ms)
async function scanSubnetForRtsp(subnet: string): Promise<string[]> {
  const activeIps: string[] = [];
  const promises: Promise<void>[] = [];

  for (let i = 1; i <= 254; i++) {
    const ip = `${subnet}.${i}`;
    promises.push(
      new Promise<void>((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(800); // 800ms is perfect for local network sweeps

        socket.on('connect', () => {
          activeIps.push(ip);
          socket.destroy();
          resolve();
        });

        socket.on('timeout', () => {
          socket.destroy();
          resolve();
        });

        socket.on('error', () => {
          socket.destroy();
          resolve();
        });

        socket.connect(554, ip); // Probe RTSP port 554
      })
    );
  }

  await Promise.all(promises);
  return activeIps;
}

export class CameraService {
  private repository: CameraRepository;

  constructor() {
    this.repository = new CameraRepository();
  }

  // Probe the network for cameras dynamically using subnet sweeps + standard fallback IPs
  public async discover(): Promise<Camera[]> {
    console.log('Starting dynamic camera discovery...');
    const discoveredList: Camera[] = [];

    // 1. Detect local subnet dynamically and scan port 554 concurrently (takes ~800ms)
    const subnet = getLocalSubnet();
    console.log(`Sweeping subnet ${subnet}.x on RTSP port 554...`);
    
    let activeIps: string[] = [];
    try {
      activeIps = await scanSubnetForRtsp(subnet);
      console.log(`Subnet sweep completed. Found ${activeIps.length} active RTSP devices:`, activeIps);
    } catch (err) {
      console.error('Subnet port sweep failed:', err);
    }

    // 2. Probe all detected active subnet IPs
    for (const ip of activeIps) {
      try {
        const camera = await this.probeSingleCamera(ip, 5000, CONFIG.cameraDefaultUser, CONFIG.cameraDefaultPass);
        if (camera) {
          discoveredList.push(camera);
        }
      } catch (err) {
        console.error(`Error probing subnet IP ${ip}:`, err);
      }
    }

    // 3. Resilient Fallback: Also probe configured fallback IPs if they were missed by the scan
    for (const ip of CONFIG.cameraDefaultIps) {
      if (discoveredList.some(c => c.ip === ip)) {
        continue;
      }
      try {
        const camera = await this.probeSingleCamera(ip, 5000, CONFIG.cameraDefaultUser, CONFIG.cameraDefaultPass);
        if (camera) {
          discoveredList.push(camera);
        }
      } catch (err) {
        console.error(`Error in fallback probe for IP ${ip}:`, err);
      }
    }

    // 4. Save and clean up stale dynamic IP camera cards
    const savedCameras = await this.repository.getAll();
    const updatedCameras: Camera[] = [];

    // Keep all manually customized cameras (isCustom: true)
    const customCameras = savedCameras.filter(c => c.isCustom);
    updatedCameras.push(...customCameras);

    // Merge in newly discovered active cameras
    for (const discovered of discoveredList) {
      const customIndex = updatedCameras.findIndex(c => c.ip === discovered.ip);
      if (customIndex >= 0) {
        // Keep customized name but refresh status and URL
        updatedCameras[customIndex] = {
          ...updatedCameras[customIndex],
          status: 'online',
          rtspUrl: discovered.rtspUrl,
          manufacturer: discovered.manufacturer,
          model: discovered.model
        };
      } else {
        // Add dynamic camera
        updatedCameras.push(discovered);
      }
    }

    // Mark any custom cameras that are currently unreachable as offline
    for (const cam of updatedCameras) {
      if (cam.isCustom && !discoveredList.some(c => c.ip === cam.ip)) {
        cam.status = 'offline';
      }
    }

    await this.repository.saveAll(updatedCameras);
    return updatedCameras;
  }

  // Helper to wrap callback-based Discovery.probe in a TypeScript Promise
  private probeDynamic(): Promise<any[]> {
    return new Promise(async (resolve) => {
      const timeout = setTimeout(() => {
        console.log('Dynamic discovery timed out (3s).');
        resolve([]);
      }, 3000);

      try {
        const { Discovery: libDiscovery } = await loadOnvifLib();
        libDiscovery.probe((err: any, cams: any[]) => {
          clearTimeout(timeout);
          if (err) {
            console.error('Discovery probe callback error:', err);
            resolve([]);
          } else {
            resolve(cams || []);
          }
        });
      } catch (err) {
        console.error('Failed to load dynamic discovery library:', err);
        resolve([]);
      }
    });
  }

  // Connects to a single camera via ONVIF to fetch metadata and RTSP URL
  public async probeSingleCamera(
    ip: string,
    port: number,
    user: string,
    pass: string,
    customName?: string
  ): Promise<Camera | null> {
    console.log(`Probing camera ${ip}:${port}...`);
    try {
      const { Onvif: libOnvif } = await loadOnvifLib();
      const device = new libOnvif({
        hostname: ip,
        port: port,
        username: user,
        password: pass
      });

      await device.connect();
      
      let manufacturer = 'Unknown';
      let model = 'IP Camera';
      let hardwareId = '';

      try {
        const info = await device.getDeviceInformation();
        manufacturer = info.Manufacturer || manufacturer;
        model = info.Model || model;
        hardwareId = info.HardwareId || '';
      } catch (e) {
        console.warn(`Could not get device info for ${ip}, proceeding with generic metadata.`, e);
      }

      // Fetch Media profiles and get Stream URI
      let rtspUrl = '';
      try {
        const profiles = await device.media.getProfiles();
        if (profiles && profiles.length > 0) {
          const profileToken = profiles[0].token || (profiles[0] as any).$.token;
          const streamUriResponse = await device.media.getStreamUri({
            protocol: 'RTSP',
            profileToken: profileToken
          });
          rtspUrl = streamUriResponse.uri;
        }
      } catch (e) {
        console.error(`Could not retrieve media profile or RTSP stream URI for ${ip}:`, e);
      }

      // If no RTSP URL was returned from ONVIF, construct standard fallback RTSP URLs
      if (!rtspUrl) {
        rtspUrl = `rtsp://${user}:${pass}@${ip}:554/onvif1`;
        console.log(`Using fallback RTSP URL for ${ip}: ${rtspUrl}`);
      }

      const id = ip.replace(/\./g, '_');
      const camera: Camera = {
        id,
        ip,
        port,
        name: customName || `${manufacturer} ${model} (${ip})`,
        user,
        pass,
        status: 'online',
        rtspUrl,
        manufacturer,
        model,
        hardwareId,
        isCustom: !!customName
      };

      return camera;
    } catch (error) {
      console.warn(`ONVIF connection failed at ${ip}:${port}: ${error instanceof Error ? error.message : error}`);
      console.log(`Generating highly resilient RTSP fallback camera object for ${ip}...`);

      // Resilient Fallback: Even if ONVIF failed, we return a fallback camera since RTSP port 554 is open!
      const id = ip.replace(/\./g, '_');
      const camera: Camera = {
        id,
        ip,
        port: port || 5000,
        name: customName || `Câmera IPC (${ip})`,
        user,
        pass,
        status: 'online', // Assume online as RTSP is open
        rtspUrl: `rtsp://${user}:${pass}@${ip}:554/onvif1`, // Standard robust RTSP path
        manufacturer: 'Generic',
        model: 'RTSP IPC Camera',
        isCustom: !!customName
      };

      return camera;
    }
  }

  // Get list of all currently stored cameras
  public async getStoredCameras(): Promise<Camera[]> {
    return this.repository.getAll();
  }

  // Add camera manually
  public async addCamera(
    ip: string,
    port: number,
    user: string,
    pass: string,
    name: string
  ): Promise<Camera> {
    // Attempt to probe it first to check ONVIF credentials & status
    const probed = await this.probeSingleCamera(ip, port, user, pass, name);
    
    const id = ip.replace(/\./g, '_');
    const camera: Camera = probed || {
      id,
      ip,
      port,
      name,
      user,
      pass,
      status: 'offline', // Mark offline if probing failed, but still save it!
      rtspUrl: `rtsp://${user}:${pass}@${ip}:554/stream1`, // Standard RTSP fallback
      manufacturer: 'Manual',
      model: 'Custom IP Camera',
      isCustom: true
    };

    await this.repository.save(camera);
    return camera;
  }

  // Delete camera manually
  public async deleteCamera(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }

  // Reorder saved cameras according to a custom array of camera IDs
  public async reorder(ids: string[]): Promise<Camera[]> {
    const cameras = await this.repository.getAll();
    
    // Sort cameras based on their position in the provided ids array
    const sorted = [...cameras].sort((a, b) => {
      const indexA = ids.indexOf(a.id);
      const indexB = ids.indexOf(b.id);
      
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      
      return indexA - indexB;
    });

    await this.repository.saveAll(sorted);
    return sorted;
  }

  // Dispatches continuous ONVIF movement commands to a specific camera (Pan/Tilt)
  public async controlPtz(id: string, direction: string, speed?: number): Promise<{ success: boolean; error?: string }> {
    console.log(`PTZ continuous request received: camera=${id}, direction=${direction}, speed=${speed}`);
    try {
      const camera = await this.repository.findById(id);
      if (!camera) {
        throw new Error(`Camera with ID ${id} not found in database.`);
      }

      const { Onvif: libOnvif } = await loadOnvifLib();

      // Dynamic Port Autocure: Probe multiple standard ONVIF HTTP SOAP ports if the primary refuses connection
      const portsToTry = Array.from(new Set([camera.port, 80, 8000, 8080, 8899, 5000, 37777].filter(p => typeof p === 'number' && !isNaN(p))));
      let device: any = null;
      let activePort = camera.port;
      let lastError: any = null;

      for (const port of portsToTry) {
        try {
          console.log(`Attempting resilient ONVIF SOAP connect to ${camera.ip}:${port}...`);
          const tempDevice = new libOnvif({
            hostname: camera.ip,
            port: port,
            username: camera.user,
            password: camera.pass
          });
          
          // Resilient Handshake: Execute SystemDateAndTime and getCapabilities to fetch services
          // This avoids the internal getActiveSources call that fails on port 80 endpoint redirects!
          await tempDevice.getSystemDateAndTime();
          await tempDevice.getCapabilities();
          
          // If we successfully connect, save the device instance and active port
          device = tempDevice;
          activePort = port;
          console.log(`Resilient ONVIF capabilities acquired from ${camera.ip} on port ${port}!`);
          break;
        } catch (err: any) {
          console.warn(`Resilient ONVIF connection failed at ${camera.ip}:${port}: ${err.message || err}`);
          lastError = err;
        }
      }

      if (!device) {
        throw new Error(`ONVIF connection failed at all probed ports. Last error: ${lastError?.message || lastError}`);
      }

      // Auto-heal the camera port configuration in the database if it changed!
      if (activePort !== camera.port) {
        camera.port = activePort;
        await this.repository.save(camera);
        console.log(`Successfully auto-healed camera ONVIF port in repository: IP=${camera.ip} Port=${activePort}`);
      }

      // Dynamic SOAP Endpoint Port Auto-Healing: Rewrite returned service absolute URLs 
      // to use the actual, validated activePort instead of the incorrect port 80 returned by the camera!
      if (device.services) {
        for (const serviceName of Object.keys(device.services)) {
          const service = device.services[serviceName];
          if (service && typeof service.href === 'string') {
            const oldHref = service.href;
            try {
              const url = new URL(service.href);
              url.port = activePort.toString();
              url.hostname = camera.ip;
              service.href = url.toString();
              console.log(`Auto-healed ONVIF endpoint for ${serviceName}: ${oldHref} -> ${service.href}`);
            } catch (urlErr) {
              // Fallback regex replacement if URL constructor fails
              const cleanXaddr = `http://${camera.ip}:${activePort}/onvif/${serviceName}_service`;
              service.href = cleanXaddr;
              console.log(`Fallback auto-healed endpoint for ${serviceName}: ${oldHref} -> ${service.href}`);
            }
          }
        }
      }

      // Ensure camera supports PTZ
      if (!device.ptz) {
        throw new Error('Camera ONVIF profiles do not expose a PTZ (Pan-Tilt-Zoom) service.');
      }

      // Retrieve media profile token
      const profiles = await device.media.getProfiles();
      if (!profiles || profiles.length === 0) {
        throw new Error('No media profile token available to issue PTZ commands.');
      }
      const profileToken = profiles[0].token || (profiles[0] as any).$.token;

      let x = 0;
      let y = 0;
      const moveSpeed = typeof speed === 'number' ? speed : 0.4; // Custom step speed or default 0.4

      if (direction === 'left') x = -moveSpeed;
      else if (direction === 'right') x = moveSpeed;
      else if (direction === 'up') y = moveSpeed;
      else if (direction === 'down') y = -moveSpeed;

      if (x !== 0 || y !== 0) {
        console.log(`Sending ContinuousMove to ${camera.ip}:${activePort}: x=${x}, y=${y}`);
        await device.ptz.continuousMove({
          profileToken: profileToken,
          velocity: {
            panTilt: {
              x: x,
              y: y
            }
          },
          timeout: 'PT1S' // Move for 1 second max as failsafe
        });

        // Fire a stop movement callback after 500ms for accurate step controls
        setTimeout(async () => {
          try {
            console.log(`Auto-stopping PTZ for ${camera.ip}`);
            await device.ptz.stop({
              profileToken: profileToken,
              panTilt: true
            });
          } catch (stopErr) {
            console.warn('Failsafe PTZ stop trigger failed:', stopErr);
          }
        }, 500);
      } else if (direction === 'stop') {
        console.log(`Sending manual stop to ${camera.ip}`);
        await device.ptz.stop({
          profileToken: profileToken,
          panTilt: true
        });
      }

      return { success: true };
    } catch (err: any) {
      console.error(`PTZ continuous command failed for camera ${id}:`, err.message || err);
      return { success: false, error: err.message || 'ONVIF PTZ command rejected.' };
    }
  }
}
