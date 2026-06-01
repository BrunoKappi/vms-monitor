import { WebSocketServer, WebSocket } from 'ws';
import { spawn, ChildProcess } from 'child_process';
import { CameraRepository } from '../repositories/Camera.Repository';
import { CONFIG } from '../config/App.Config';

interface StreamSession {
  cameraId: string;
  ffmpegProcess: ChildProcess | null;
  clients: Set<WebSocket>;
  rtspUrl: string;
}

export class StreamService {
  public static instance: StreamService | null = null;
  private wss: WebSocketServer | null = null;
  private sessions: Map<string, StreamSession> = new Map();
  private repository: CameraRepository;

  constructor() {
    this.repository = new CameraRepository();
    StreamService.instance = this;
  }

  public getActiveSessionsCount(): number {
    return this.sessions.size;
  }

  public getActiveSessionsDetails(): Array<{ cameraId: string; clientCount: number }> {
    const details: Array<{ cameraId: string; clientCount: number }> = [];
    this.sessions.forEach((session, cameraId) => {
      details.push({
        cameraId,
        clientCount: session.clients.size
      });
    });
    return details;
  }

  // Starts the WebSocket streaming server
  public start(): void {
    const port = CONFIG.wsStreamPort;
    this.wss = new WebSocketServer({ port });

    console.log(`WebSocket Stream Server running on ws://localhost:${port}`);

    this.wss.on('connection', async (ws: WebSocket, req) => {
      // Parse camera ID from URL path (e.g., ws://localhost:9999/stream/192_168_1_24)
      const urlPath = req.url || '';
      const cameraId = urlPath.replace('/stream/', '').replace(/^\//, '');

      if (!cameraId) {
        console.warn('WS Connection rejected: Missing camera ID in URL path.');
        ws.close(4000, 'Camera ID is required in path.');
        return;
      }

      console.log(`Client requested stream for camera: ${cameraId}`);

      // Lookup camera in the repository to obtain the RTSP URL
      const camera = await this.repository.findById(cameraId);
      if (!camera || !camera.rtspUrl) {
        console.warn(`WS Connection rejected: Camera with ID ${cameraId} not found or has no RTSP URL.`);
        ws.close(4004, 'Camera RTSP source not found.');
        return;
      }

      // Initialize or reuse stream session
      let session = this.sessions.get(cameraId);
      if (!session) {
        session = {
          cameraId,
          ffmpegProcess: null,
          clients: new Set(),
          rtspUrl: camera.rtspUrl
        };
        this.sessions.set(cameraId, session);
      }

      // Add current client connection to the session
      session.clients.add(ws);

      // Spawn FFmpeg if it is not currently running for this camera
      if (!session.ffmpegProcess) {
        this.startFfmpeg(session);
      }

      // Handle client disconnection
      ws.on('close', () => {
        console.log(`WS Client disconnected from stream: ${cameraId}`);
        session?.clients.delete(ws);
        this.checkAndTeardown(cameraId);
      });

      ws.on('error', (err) => {
        console.error(`WS Stream Client error for camera ${cameraId}:`, err);
        session?.clients.delete(ws);
        this.checkAndTeardown(cameraId);
      });
    });
  }

  // Spawns FFmpeg to capture RTSP stream and transcode it to MPEG1/MPEG-TS piped to stdout
  private startFfmpeg(session: StreamSession): void {
    console.log(`Spawning FFmpeg for camera ${session.cameraId}...`);
    console.log(`Source RTSP URL: ${session.rtspUrl}`);

    // Transcode RTSP into MPEG-1 Video inside an MPEG-TS container, piped to stdout
    const ffmpegArgs = [
      '-loglevel', 'quiet',               // Suppress logging to keep stdin/stdout clean
      '-i', session.rtspUrl,              // Input RTSP URL
      '-f', 'mpegts',                     // Output container format
      '-codec:v', 'mpeg1video',           // Encode to MPEG-1 (highly supported by JSMpeg client)
      '-bf', '0',                         // Disable B-frames for real-time low latency
      '-r', '20',                         // Down-sample frame rate to 20 fps to conserve CPU and network
      '-s', '854x480',                    // Resize to 480p for efficient dashboard grid rendering
      '-an',                              // Disable audio channel to save bandwidth
      '-'                                 // Pipe output to stdout
    ];

    try {
      const process = spawn('ffmpeg', ffmpegArgs);
      session.ffmpegProcess = process;

      // Pipe binary data output to all active WebSocket clients of this session
      process.stdout.on('data', (chunk: Buffer) => {
        session.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(chunk, { binary: true });
          }
        });
      });

      // Handle FFmpeg process termination
      process.on('close', (code) => {
        console.log(`FFmpeg process for camera ${session.cameraId} exited with code ${code}`);
        if (session.ffmpegProcess === process) {
          session.ffmpegProcess = null;
          // Notify clients that stream has ended
          session.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.close(1011, 'FFmpeg stream transcoder terminated.');
            }
          });
          this.sessions.delete(session.cameraId);
        }
      });

      process.on('error', (err) => {
        console.error(`FFmpeg process spawned error for camera ${session.cameraId}:`, err);
      });
    } catch (err) {
      console.error(`Fatal error spawning FFmpeg for camera ${session.cameraId}:`, err);
    }
  }

  // Resource Teardown logic: kills FFmpeg when no client is watching
  private checkAndTeardown(cameraId: string): void {
    const session = this.sessions.get(cameraId);
    if (!session) return;

    if (session.clients.size === 0) {
      console.log(`Zero active clients watching camera ${cameraId}. Tearing down stream resources...`);
      if (session.ffmpegProcess) {
        // Kill FFmpeg process gracefully or forcefully
        session.ffmpegProcess.kill('SIGKILL');
        session.ffmpegProcess = null;
      }
      this.sessions.delete(cameraId);
    }
  }

  // Gracefully shuts down all active streams (useful on server shutdown)
  public shutdown(): void {
    console.log('Shutting down all streaming sessions...');
    this.sessions.forEach((session, cameraId) => {
      if (session.ffmpegProcess) {
        session.ffmpegProcess.kill('SIGINT');
      }
      session.clients.forEach((ws) => ws.close(1001, 'Server shutting down.'));
    });
    this.sessions.clear();
    this.wss?.close();
  }
}
