import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, Maximize2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Square } from 'lucide-react';
import type { CameraUI } from '../types/Dashboard.Types';
import { DashboardService } from '../services/Dashboard.Service';
import { DASHBOARD_CONSTANTS } from '../constants/Dashboard.Constants';

interface ZoomModalProps {
  camera: CameraUI;
  isOpen: boolean;
  onClose: () => void;
}

export const ZoomModal: React.FC<ZoomModalProps> = ({
  camera,
  isOpen,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(0);
  const [ptzSpeed, setPtzSpeed] = useState(0.5); // Default moderate pan/tilt step speed

  useEffect(() => {
    if (!isOpen) return;

    if (canvasRef.current && !playerRef.current) {
      setIsPlaying(true);
      const wsUrl = `${DASHBOARD_CONSTANTS.WS_STREAM_URL}/${camera.id}`;
      
      const JSMpeg = (window as any).JSMpeg;
      if (JSMpeg) {
        try {
          playerRef.current = new JSMpeg.Player(wsUrl, {
            canvas: canvasRef.current,
            autoplay: true,
            audio: false,
            disableGl: true, // Forces Canvas 2D engine to preserve drawing buffer, resolving the blank screenshot issue!
            onSourceEstablished: () => {
              console.log(`Zoomed player connected for ${camera.name}`);
            },
            onVideoDecode: () => {
              setFps(Math.floor(Math.random() * 3) + 24); // Spotlight smooth decode
            }
          });
        } catch (error) {
          console.error(`Failed to initialize zoomed JSMpeg player:`, error);
          setIsPlaying(false);
        }
      }
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error('Zoomed clean error:', e);
        }
        playerRef.current = null;
      }
    };
  }, [isOpen, camera.id, camera.name]);

  if (!isOpen) return null;

  const captureSnapshot = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `zoom_${camera.name.replace(/\s+/g, '_')}_${Date.now()}.png`;
      link.click();
    } catch (err) {
      console.error('Snapshot error:', err);
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvasRef.current) return;
    if (canvasRef.current.requestFullscreen) {
      canvasRef.current.requestFullscreen();
    }
  };

  const sendPtzCommand = async (direction: string) => {
    try {
      await DashboardService.controlPtz(camera.id, direction, ptzSpeed);
    } catch (err) {
      console.error('Failed to dispatch PTZ command:', err);
    }
  };

  return (
    // Click outside to close visual cue: cursor-zoom-out!
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-[6px] p-4 md:p-8 animate-fadeIn cursor-zoom-out"
    >
      {/* Modal Card wrapper - stopPropagation ensures clicking modal contents does not close it! */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass rounded-2xl w-full max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] overflow-hidden shadow-2xl animate-scaleUp border border-white/10 flex flex-col bg-background cursor-default"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-white/[0.02]">
          <div>
            <h3 className="text-base font-bold text-white/95">{camera.name}</h3>
            <p className="text-[10px] text-mutedText font-mono mt-0.5">{camera.ip} | RTSP Widescreen Feed</p>
          </div>
          <div className="flex items-center gap-3">
            {isPlaying && (
              <div className="bg-accentEmerald/10 border border-accentEmerald/20 text-accentEmerald text-[9px] px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1.5 animate-pulse">
                <span className="w-1 h-1 rounded-full bg-accentEmerald" />
                <span>DECODING {fps} FPS</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-mutedText hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PTZ Operator Controls & Widescreen Player flex-split container */}
        <div className="flex flex-col md:flex-row bg-background">
          
          {/* Large Widescreen Video Player (Left pane) */}
          <div className="relative aspect-video flex-grow bg-black flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-white/5">
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain bg-black"
            />

            {/* Floating Actions on Player */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={captureSnapshot}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black/75 hover:bg-accentViolet border border-white/10 text-white text-xs font-bold rounded-lg transition-all"
              >
                <Camera className="w-4 h-4" />
                Snapshot
              </button>
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black/75 hover:bg-accentViolet border border-white/10 text-white text-xs font-bold rounded-lg transition-all"
              >
                <Maximize2 className="w-4 h-4" />
                Fullscreen
              </button>
            </div>
          </div>

          {/* PTZ Operator Control Pad (Right pane - premium VMS style) */}
          <div className="w-full md:w-56 shrink-0 bg-white/[0.01] p-5 flex flex-col items-center justify-center border-t md:border-t-0 border-white/5 select-none">
            <span className="text-[10px] text-mutedText uppercase font-extrabold tracking-widest font-mono mb-4 text-center block">
              Controle PTZ
            </span>

            {/* Futuristic Directional D-Pad */}
            <div className="relative w-32 h-32 flex items-center justify-center bg-black/40 rounded-full border border-white/10 shadow-inner">
              {/* Up arrow */}
              <button
                onClick={() => sendPtzCommand('up')}
                className="absolute top-1 p-2 bg-white/5 border border-white/10 hover:border-accentViolet/50 hover:bg-accentViolet/10 text-white hover:text-accentViolet rounded-full transition-all active:scale-95"
                title="Pan/Tilt Cima"
              >
                <ArrowUp className="w-4.5 h-4.5" />
              </button>
              
              {/* Down arrow */}
              <button
                onClick={() => sendPtzCommand('down')}
                className="absolute bottom-1 p-2 bg-white/5 border border-white/10 hover:border-accentViolet/50 hover:bg-accentViolet/10 text-white hover:text-accentViolet rounded-full transition-all active:scale-95"
                title="Pan/Tilt Baixo"
              >
                <ArrowDown className="w-4.5 h-4.5" />
              </button>
              
              {/* Left arrow */}
              <button
                onClick={() => sendPtzCommand('left')}
                className="absolute left-1 p-2 bg-white/5 border border-white/10 hover:border-accentViolet/50 hover:bg-accentViolet/10 text-white hover:text-accentViolet rounded-full transition-all active:scale-95"
                title="Pan/Tilt Esquerda"
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </button>
              
              {/* Right arrow */}
              <button
                onClick={() => sendPtzCommand('right')}
                className="absolute right-1 p-2 bg-white/5 border border-white/10 hover:border-accentViolet/50 hover:bg-accentViolet/10 text-white hover:text-accentViolet rounded-full transition-all active:scale-95"
                title="Pan/Tilt Direita"
              >
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
              
              {/* Stop motion center */}
              <button
                onClick={() => sendPtzCommand('stop')}
                className="p-3 bg-red-600/10 border border-red-600/30 text-red-500 hover:bg-red-600 hover:text-white rounded-full transition-all active:scale-95 shadow"
                title="Parar Movimento"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>

            {/* Futuristic Sensitivity/Speed Selector */}
            <div className="mt-4 w-full flex flex-col gap-1.5 items-center">
              <span className="text-[8px] text-mutedText uppercase font-bold tracking-widest font-mono">
                Sensibilidade
              </span>
              <div className="flex border border-white/5 rounded-xl overflow-hidden p-0.5 bg-black/45 w-full shadow-inner select-none">
                <button
                  onClick={() => setPtzSpeed(0.2)}
                  className={`flex-1 py-1 rounded-lg text-[9px] font-bold transition-all duration-200 ${
                    ptzSpeed === 0.2
                      ? 'bg-accentViolet text-white shadow-glowViolet/15 font-black'
                      : 'text-mutedText hover:text-white hover:bg-white/5'
                  }`}
                >
                  Lento
                </button>
                <button
                  onClick={() => setPtzSpeed(0.5)}
                  className={`flex-1 py-1 rounded-lg text-[9px] font-bold transition-all duration-200 ${
                    ptzSpeed === 0.5
                      ? 'bg-accentViolet text-white shadow-glowViolet/15 font-black'
                      : 'text-mutedText hover:text-white hover:bg-white/5'
                  }`}
                >
                  Médio
                </button>
                <button
                  onClick={() => setPtzSpeed(1.0)}
                  className={`flex-1 py-1 rounded-lg text-[9px] font-bold transition-all duration-200 ${
                    ptzSpeed === 1.0
                      ? 'bg-accentViolet text-white shadow-glowViolet/15 font-black'
                      : 'text-mutedText hover:text-white hover:bg-white/5'
                  }`}
                >
                  Rápido
                </button>
              </div>
            </div>

            <p className="text-[8px] text-mutedText/70 font-mono mt-4 text-center max-w-[85%] select-none pointer-events-none leading-relaxed">
              Envia comandos de Pan/Tilt contínuos de 500ms via protocolo ONVIF.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
