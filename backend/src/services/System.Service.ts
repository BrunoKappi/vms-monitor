import { exec } from 'child_process';
import { CONFIG } from '../config/App.Config';

export class SystemService {
  public async shutdown(): Promise<void> {
    console.log('VMS System Shutdown requested.');

    const frontendPort = CONFIG.frontendPort;
    
    // Attempt to kill the frontend server on Windows
    try {
      console.log(`Searching for process listening on frontend port ${frontendPort}...`);
      exec(`netstat -aon | findstr :${frontendPort}`, (err, stdout, stderr) => {
        if (stdout) {
          const lines = stdout.split('\n');
          for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            // In netstat -aon, PID is the last column
            const pid = parts[parts.length - 1];
            if (pid && !isNaN(parseInt(pid, 10)) && parseInt(pid, 10) > 0) {
              console.log(`Killing frontend process PID ${pid} on port ${frontendPort}...`);
              exec(`taskkill /f /pid ${pid} >nul 2>&1`, (killErr) => {
                if (killErr) {
                  console.error(`Failed to kill frontend process with PID ${pid}:`, killErr);
                } else {
                  console.log(`Successfully terminated frontend process PID ${pid}.`);
                }
              });
            }
          }
        }
      });
    } catch (e) {
      console.error('Error during frontend process termination search:', e);
    }

    // Schedule backend exit in 1 second to give the HTTP response time to send
    console.log('Scheduling backend server shutdown in 1 second...');
    setTimeout(() => {
      console.log('Sending shutdown signal to backend process...');
      process.emit('SIGTERM');
    }, 1000);
  }
}
