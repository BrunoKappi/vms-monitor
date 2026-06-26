import React, { useEffect, useState } from 'react';
import { Cpu, HardDrive, Cpu as ServerIcon, RefreshCw, Activity, Clock } from 'lucide-react';
import { DashboardService } from '../services/Dashboard.Service';

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    model: string;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    percentage: number;
    processRss: number;
  };
  os: {
    platform: string;
    release: string;
    uptime: number;
  };
  vms: {
    uptime: number;
    activeStreams: number;
    activeStreamsDetails: Array<{ cameraId: string; clientCount: number }>;
  };
}

export const ResourcesView: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const data = await DashboardService.fetchSystemMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching system metrics:', err);
      setError('Não foi possível carregar os dados de recursos do sistema.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Auto-refresh metrics every 2.5 seconds for real-time monitoring
    const interval = setInterval(() => {
      fetchMetrics(true);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
  };

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-16 flex flex-col items-center justify-center text-center mt-6 min-h-[400px]">
        <div className="w-12 h-12 rounded-full border-4 border-accentViolet border-t-transparent animate-spin mb-4" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-white/90 font-mono">Coletando Métricas do Sistema</h3>
        <p className="text-xs text-mutedText mt-1">Interrogando subsistemas e transcodificadores FFmpeg...</p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="glass rounded-2xl p-16 flex flex-col items-center justify-center text-center mt-6 min-h-[400px] border-red-500/20">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
          <Activity className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-red-500 dark:text-red-400 font-mono">Erro Diagnóstico</h3>
        <p className="text-sm text-mutedText mt-2 max-w-xs">{error || 'Dados inválidos'}</p>
        <button
          onClick={() => fetchMetrics()}
          className="mt-6 px-4 py-2 bg-accentViolet hover:bg-accentViolet/90 text-white text-xs font-bold rounded-xl transition-all shadow-glowViolet/15 flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Tentar Novamente
        </button>
      </div>
    );
  }

  const { cpu, memory, os, vms } = metrics;

  return (
    <div className="mt-6 flex flex-col gap-6 animate-scaleUp">
      {/* Metrics Section Header */}
      <div className="flex justify-between items-center bg-cardBg/30 p-4 rounded-xl border border-cardBorder">
        <div className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-accentViolet animate-pulse" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white/90">Painel de Recursos em Tempo Real</h2>
            <p className="text-[10px] text-mutedText">Monitoramento de hardware e motor de transcodificação de feeds.</p>
          </div>
        </div>
        <button
          disabled={isRefreshing}
          onClick={() => fetchMetrics()}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all duration-200 ${
            isRefreshing
              ? 'bg-accentViolet/25 border-accentViolet/30 text-accentViolet'
              : 'bg-white/5 border-black/10 dark:border-white/10 text-slate-800 dark:text-white/80 hover:border-accentViolet/40 hover:bg-accentViolet/10 hover:text-accentViolet'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      {/* Grid containing primary gauge/progress cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CPU Resource Card */}
        <div className="glass rounded-2xl p-5 border border-cardBorder flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-accentViolet" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider font-mono text-slate-800 dark:text-white/90">CPU Host</h3>
            </div>
            <span className="text-xs font-bold font-mono text-accentViolet">{cpu.usage}%</span>
          </div>

          <div className="w-full bg-black/10 dark:bg-black/35 rounded-full h-2 overflow-hidden border border-black/5 dark:border-white/5">
            <div
              className="bg-gradient-to-r from-accentIndigo to-accentViolet h-full rounded-full transition-all duration-500 ease-out shadow-glowViolet"
              style={{ width: `${cpu.usage}%` }}
            />
          </div>

          <div className="flex flex-col gap-1.5 text-[11px] font-mono mt-1">
            <div className="flex justify-between">
              <span className="text-mutedText">Núcleos Lógicos:</span>
              <span className="font-bold text-slate-900 dark:text-white">{cpu.cores} Threads</span>
            </div>
            <div className="flex flex-col gap-0.5 mt-1 border-t border-black/5 dark:border-white/5 pt-1.5">
              <span className="text-mutedText text-[9px] uppercase tracking-wider">Modelo:</span>
              <span className="font-bold text-slate-800 dark:text-white/85 truncate text-[10px]" title={cpu.model}>
                {cpu.model}
              </span>
            </div>
          </div>
        </div>

        {/* Memory Resource Card */}
        <div className="glass rounded-2xl p-5 border border-cardBorder flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-accentCyan" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider font-mono text-slate-800 dark:text-white/90">Memória RAM</h3>
            </div>
            <span className="text-xs font-bold font-mono text-accentCyan">{memory.percentage}%</span>
          </div>

          <div className="w-full bg-black/10 dark:bg-black/35 rounded-full h-2 overflow-hidden border border-black/5 dark:border-white/5">
            <div
              className="bg-gradient-to-r from-accentCyan to-accentIndigo h-full rounded-full transition-all duration-500 ease-out shadow-glowCyan"
              style={{ width: `${memory.percentage}%` }}
            />
          </div>

          <div className="flex flex-col gap-1.5 text-[11px] font-mono mt-1">
            <div className="flex justify-between">
              <span className="text-mutedText">Em uso:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatBytes(memory.used)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mutedText">Livre / Total:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatBytes(memory.free)} / {formatBytes(memory.total)}
              </span>
            </div>
          </div>
        </div>

        {/* FFmpeg Video Engine Resource Card */}
        <div className="glass rounded-2xl p-5 border border-cardBorder flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ServerIcon className="w-4 h-4 text-accentEmerald" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider font-mono text-slate-800 dark:text-white/90">Motor de Vídeo</h3>
            </div>
            <span className="text-xs font-bold font-mono text-accentEmerald">{vms.activeStreams} Feeds Act.</span>
          </div>

          <div className="w-full bg-black/10 dark:bg-black/35 rounded-full h-2 overflow-hidden border border-black/5 dark:border-white/5">
            <div
              className="bg-gradient-to-r from-accentEmerald to-accentCyan h-full rounded-full transition-all duration-500 ease-out shadow-glowEmerald"
              style={{ width: `${vms.activeStreams > 0 ? Math.min(vms.activeStreams * 20, 100) : 0}%` }}
            />
          </div>

          <div className="flex flex-col gap-1.5 text-[11px] font-mono mt-1">
            <div className="flex justify-between">
              <span className="text-mutedText">Processos FFmpeg:</span>
              <span className="font-bold text-slate-900 dark:text-white">{vms.activeStreams} ativos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mutedText">RAM do Backend (RSS):</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatBytes(memory.processRss)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* OS & VMS Diagnostics Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Operating System Panel */}
        <div className="glass rounded-2xl p-5 border border-cardBorder flex flex-col gap-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider font-mono text-slate-800 dark:text-white/90 border-b border-black/5 dark:border-white/5 pb-2.5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-accentViolet" />
            Diagnóstico do Sistema Operacional
          </h3>
          <div className="flex flex-col gap-3 text-xs font-mono">
            <div className="flex justify-between items-center py-1 border-b border-black/5 dark:border-white/5">
              <span className="text-mutedText">Plataforma:</span>
              <span className="font-bold uppercase text-slate-900 dark:text-white">{os.platform} ({os.release})</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-black/5 dark:border-white/5">
              <span className="text-mutedText">Tempo de Atividade (Host):</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatUptime(os.uptime)}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-mutedText">Uptime da Central VMS:</span>
              <span className="font-bold text-accentViolet">{formatUptime(vms.uptime)}</span>
            </div>
          </div>
        </div>

        {/* Transcoded RTSP Streams Details */}
        <div className="glass rounded-2xl p-5 border border-cardBorder flex flex-col gap-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider font-mono text-slate-800 dark:text-white/90 border-b border-black/5 dark:border-white/5 pb-2.5 flex items-center gap-2">
            <Activity className="w-4 h-4 text-accentEmerald" />
            Transcodificações de Canais RTSP
          </h3>

          {vms.activeStreamsDetails.length > 0 ? (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[140px] pr-1">
              {vms.activeStreamsDetails.map((stream) => (
                <div
                  key={stream.cameraId}
                  className="flex justify-between items-center bg-black/5 dark:bg-black/25 p-2 rounded-lg border border-black/5 dark:border-white/5 text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accentEmerald animate-pulse shrink-0" />
                    <span className="text-[10px] text-slate-900 dark:text-white/90 font-bold truncate max-w-[180px]">
                      Feeds: {stream.cameraId.replace(/_/g, '.')}
                    </span>
                  </div>
                  <span className="text-[9px] bg-accentViolet/10 border border-accentViolet/20 px-1.5 py-0.5 rounded text-accentViolet font-bold shrink-0">
                    {stream.clientCount} cliente(s)
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-mutedText text-xs font-mono">
              <ServerIcon className="w-6 h-6 text-mutedText/40 mb-2" />
              Nenhum canal ativo sendo transcodificado
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
