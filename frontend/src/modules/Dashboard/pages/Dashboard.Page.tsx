import React, { useState, useEffect } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { Header } from '../components/Dashboard.Header';
import { Grid } from '../components/Dashboard.Grid';
import { Table } from '../components/Dashboard.Table';
import { ZoomModal } from '../components/Dashboard.ZoomModal';
import { Eye, ShieldAlert, ChevronUp, ChevronDown } from 'lucide-react';
import { DashboardService } from '../services/Dashboard.Service';

export const DashboardPage: React.FC = () => {
  const [zoomedCameraId, setZoomedCameraId] = useState<string | null>(null);
  const [isFooterExpanded, setIsFooterExpanded] = useState(false);
  const [isShuttingDown, setIsShuttingDown] = useState(false);

  const {
    cameras,
    filteredCameras,
    activeStreams,
    isDiscovering,
    gridLayout,
    error,
    activeTab,
    handleDiscover,
    handleDeleteCamera,
    handleSetGridLayout,
    handleStartStream,
    handleStopStream,
    handleSetTab,
    handleReorderCameras,
  } = useDashboard();

  // Automatically trigger subnet discovery on mount to auto-find and auto-start online feeds
  useEffect(() => {
    handleDiscover();
  }, []);

  const handleShutdown = async () => {
    const confirmShutdown = window.confirm(
      "Deseja realmente encerrar a Central VMS? Todos os servidores em segundo plano serão desligados e as portas do PC serão liberadas."
    );
    if (!confirmShutdown) return;

    setIsShuttingDown(true);
    try {
      await DashboardService.shutdownSystem();
    } catch (err) {
      console.error("Erro ao solicitar desligamento do sistema:", err);
    }
  };

  // Find camera currently requested for zoomed fullscreen popup
  const zoomedCamera = cameras.find(c => c.id === zoomedCameraId);

  if (isShuttingDown) {
    return (
      <div className="min-h-screen bg-[#060608] text-white flex flex-col items-center justify-center font-sans p-6 relative overflow-hidden">
        {/* Neon Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="glass rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl flex flex-col items-center text-center relative z-10 animate-scaleUp">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
            <span className="w-6 h-6 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-white/95 font-mono mb-2">Encerrando Central VMS</h2>
          <p className="text-sm text-mutedText leading-relaxed mb-6">
            Os servidores de vídeo e processos em segundo plano estão sendo desativados. As portas de rede do seu PC foram liberadas com sucesso.
          </p>
          <div className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs text-red-400 font-mono font-bold animate-pulse">
            SISTEMA ENCERRADO COM SEGURANÇA
          </div>
          <p className="text-[10px] text-mutedText/60 mt-4">
            Você pode fechar esta aba do navegador agora.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-slate-800 dark:text-white/90 p-4 md:p-6 flex flex-col font-sans pb-24">
      {/* Decorative Widescreen Neon Background Glows */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-accentViolet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-accentEmerald/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container - Full width expansion for high-density monitoring! */}
      <div className="w-full max-w-full mx-auto flex-grow relative z-10">
        
        {/* Main Dashboard Control Header (Space-Optimized, Manual Add removed) */}
        <Header
          isDiscovering={isDiscovering}
          activeTab={activeTab}
          onDiscover={handleDiscover}
          onTabChange={handleSetTab}
          onShutdown={handleShutdown}
        />

        {/* Global Error Banner Display */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-scaleUp">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <div className="text-sm font-semibold">
              <span className="font-bold">System Alert:</span> {error}
            </div>
          </div>
        )}

        {/* Dynamic Tab Render Area */}
        {filteredCameras.length > 0 ? (
          activeTab === 'live' ? (
            <Grid
              cameras={filteredCameras}
              activeStreams={activeStreams}
              gridLayout={gridLayout}
              onStartStream={handleStartStream}
              onStopStream={handleStopStream}
              onDeleteCamera={handleDeleteCamera}
              onReorderCameras={handleReorderCameras}
              onZoomCamera={setZoomedCameraId}
            />
          ) : (
            <Table
              cameras={filteredCameras}
              activeStreams={activeStreams}
              onStartStream={handleStartStream}
              onStopStream={handleStopStream}
              onDeleteCamera={handleDeleteCamera}
            />
          )
        ) : (
          <div className="glass rounded-2xl p-16 flex flex-col items-center justify-center text-center mt-6">
            <div className="p-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full mb-4">
              <Eye className="w-8 h-8 text-slate-400 dark:text-white/40" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white/90 font-mono">No Active Feed Connections</h3>
            <p className="text-sm text-mutedText max-w-sm mt-2">
              There are no cameras currently discovered or manual feeds registered on your subnet. Dynamic Discovery is sweeping the network.
            </p>
          </div>
        )}
      </div>
      {/* Collapsible VMS Control Panel Footer (only visible in live view tab!) */}
      {activeTab === 'live' && filteredCameras.length > 0 && (
        isFooterExpanded ? (
          // Expanded VMS footer Layout Options
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass rounded-2xl p-2 shadow-2xl flex items-center gap-3 animate-scaleUp bg-cardBg/95 border border-cardBorder select-none">
            <span className="text-[10px] text-mutedText uppercase font-extrabold tracking-widest pl-3 pr-2 border-r border-black/10 dark:border-white/10 font-mono">
              Layout
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleSetGridLayout('grid_2x2')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  gridLayout === 'grid_2x2'
                    ? 'bg-accentViolet text-white shadow-glowViolet/15 font-black'
                    : 'text-mutedText hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                Duplo 2x2
              </button>
              <button
                onClick={() => handleSetGridLayout('grid_3x3')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  gridLayout === 'grid_3x3'
                    ? 'bg-accentViolet text-white shadow-glowViolet/15 font-black'
                    : 'text-mutedText hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                Grid 3x3
              </button>
              <button
                onClick={() => handleSetGridLayout('grid_4x4')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  gridLayout === 'grid_4x4'
                    ? 'bg-accentViolet text-white shadow-glowViolet/15 font-black'
                    : 'text-mutedText hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                Grid 4x4
              </button>
              <button
                onClick={() => handleSetGridLayout('destaque_3x3')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  gridLayout === 'destaque_3x3'
                    ? 'bg-accentViolet text-white shadow-glowViolet/15 font-black'
                    : 'text-mutedText hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                Destaque 3x3
              </button>
              <button
                onClick={() => handleSetGridLayout('destaque_4x4')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  gridLayout === 'destaque_4x4'
                    ? 'bg-accentViolet text-white shadow-glowViolet/15 font-black'
                    : 'text-mutedText hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                Destaque 4x4
              </button>
            </div>
            <div className="border-l border-black/10 dark:border-white/10 pl-2 pr-1 flex items-center">
              <button
                onClick={() => setIsFooterExpanded(false)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-mutedText hover:text-slate-800 dark:hover:text-white transition-colors"
                title="Minimizar Painel"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          // Collapsed minimal visual layout tab
          <div
            onClick={() => setIsFooterExpanded(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass rounded-full px-4 py-2 shadow-2xl flex items-center gap-2.5 cursor-pointer bg-cardBg/90 border border-cardBorder hover:border-accentViolet/50 transition-all duration-300 hover:scale-105 select-none hover:bg-cardBg"
          >
            <span className="text-[10px] text-slate-800 dark:text-white/95 uppercase font-extrabold tracking-widest font-mono">
              Layouts
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-accentViolet animate-pulse" />
            <ChevronUp className="w-3.5 h-3.5 text-mutedText" />
          </div>
        )
      )}      {/* Camera Spotlight Fullscreen Modal */}
      {zoomedCamera && (
        <ZoomModal
          camera={zoomedCamera}
          isOpen={!!zoomedCameraId}
          onClose={() => setZoomedCameraId(null)}
        />
      )}
    </div>
  );
};
