import { exec } from 'child_process';
import os from 'os';
import { CONFIG } from '../config/App.Config';
import { StreamService } from './Stream.Service';

export class SystemService {
  private static startTime = Date.now();

  private getCpuAverage() {
    const cpus = os.cpus();
    let idleMs = 0;
    let totalMs = 0;
    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalMs += (cpu.times as any)[type];
      }
      idleMs += cpu.times.idle;
    }
    return {
      idle: idleMs / cpus.length,
      total: totalMs / cpus.length
    };
  }

  public async getMetrics() {
    const startMeasure = this.getCpuAverage();
    await new Promise(resolve => setTimeout(resolve, 80));
    const endMeasure = this.getCpuAverage();
    const idleDifference = endMeasure.idle - startMeasure.idle;
    const totalDifference = endMeasure.total - startMeasure.total;
    
    let cpuUsage = 0;
    if (totalDifference > 0) {
      cpuUsage = 100 - Math.round((100 * idleDifference) / totalDifference);
    }

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercentage = Math.round((usedMem / totalMem) * 100);

    const cpus = os.cpus();
    const cpuModel = cpus.length > 0 ? cpus[0].model : 'Unknown Core';

    const activeStreams = StreamService.instance ? StreamService.instance.getActiveSessionsCount() : 0;
    const activeStreamsDetails = StreamService.instance ? StreamService.instance.getActiveSessionsDetails() : [];

    return {
      cpu: {
        usage: cpuUsage,
        cores: cpus.length,
        model: cpuModel
      },
      memory: {
        total: totalMem,
        free: freeMem,
        used: usedMem,
        percentage: memPercentage,
        processRss: process.memoryUsage().rss
      },
      os: {
        platform: os.platform(),
        release: os.release(),
        uptime: os.uptime()
      },
      vms: {
        uptime: Math.floor((Date.now() - SystemService.startTime) / 1000),
        activeStreams,
        activeStreamsDetails
      }
    };
  }

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
