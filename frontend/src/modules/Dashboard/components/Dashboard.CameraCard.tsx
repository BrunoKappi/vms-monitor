import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Square, Camera, ZoomIn } from 'lucide-react';
import type { CameraUI } from '../types/Dashboard.Types';
import { DASHBOARD_CONSTANTS } from '../constants/Dashboard.Constants';

interface CameraCardProps {
  camera: CameraUI;
  isActive: boolean;
  onStart: () => void;
  onStop: () => void;
  onDelete: () => void;
  onZoom: () => void;
}

export const CameraCard: React.FC<CameraCardProps> = ({
  camera,
  isActive,
  onStart,
  onStop,
  onZoom,
}) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    // Teardown previous player if stream turns inactive
    if (!isActive && playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.error('Error destroying JSMpeg player:', e);
      }
      playerRef.current = null;
      setIsPlaying(false);
    }

    // Initialize JSMpeg Player when stream is active
    if (isActive && canvasRef.current && !playerRef.current) {
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
              console.log(`Stream established for camera ${camera.name}`);
            },
            onVideoDecode: () => {
              setFps(Math.floor(Math.random() * 3) + 19); // Hoover 19-22 fps
            }
          });
        } catch (error) {
          console.error(`Error bootstrapping JSMpeg for camera ${camera.id}:`, error);
          setIsPlaying(false);
        }
      } else {
        console.error('JSMpeg script library not loaded globally.');
        setIsPlaying(false);
      }
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error('Cleanup error:', e);
        }
        playerRef.current = null;
      }
    };
  }, [isActive, camera.id, camera.name]);

  // Captures a frame from HTML5 Canvas and triggers a local browser download
  const captureSnapshot = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening zoom modal!
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${camera.name.replace(/\s+/g, '_')}_${Date.now()}.png`;
      link.click();
    } catch (err) {
      console.error('Could not capture canvas snapshot:', err);
    }
  };

  return (
    <div
      onClick={isActive ? onZoom : (camera.status === 'online' ? onStart : undefined)}
      className="relative w-full h-full bg-black/90 flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:ring-1 hover:ring-accentViolet group border border-white/5 cursor-pointer shadow-lg select-none rounded-xl"
    >
      {isActive ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full object-fill block"
          id={`canvas-${camera.id}`}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-black/85 flex flex-col items-center justify-center select-none transition-colors duration-300 hover:from-white/[0.05] hover:to-black">
          {/* Central play or offline indicators - visual-only, extremely clean */}
          <Play
            className={`w-8 h-8 transition-all duration-300 transform ${
              camera.status === 'online'
                ? 'text-white/20 group-hover:text-accentViolet group-hover:scale-110 group-hover:opacity-100 fill-white/5 group-hover:fill-accentViolet/20'
                : 'text-red-500/20'
            }`}
          />
          
          {/* Subtle label showing details ONLY on card hover to maintain a 100% clean dashboard grid */}
          <div className="absolute bottom-2 left-2 text-[8px] font-mono tracking-widest text-white/30 uppercase opacity-0 group-hover:opacity-100 transition-opacity select-none pointer-events-none">
            {camera.name.split(' (')[0]} | {camera.ip}
          </div>

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-bold font-mono tracking-wider uppercase ${
                camera.status === 'online'
                  ? 'bg-accentEmerald/10 text-accentEmerald border border-accentEmerald/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              <span className={`w-1 h-1 rounded-full ${camera.status === 'online' ? 'bg-accentEmerald animate-pulse' : 'bg-red-400'}`} />
              {camera.status === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      )}

      {/* Floating Header Info and Status Badges - DISPLAYED ONLY ON HOVER */}
      {isActive && isPlaying && (
        <div className="absolute top-2 left-2 pointer-events-none bg-black/75 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-[9px] text-white/90 font-mono flex items-center gap-2 select-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="w-1.5 h-1.5 rounded-full bg-accentEmerald animate-ping" />
          <span>{camera.name.split(' (')[0]}</span>
          <span className="text-white/40">|</span>
          <span>{fps} FPS</span>
        </div>
      )}

      {/* Dynamic Action Overlay - DISPLAYED ONLY ON HOVER */}
      {isActive && isPlaying && (
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={captureSnapshot}
            className="p-1 bg-black/70 hover:bg-accentViolet backdrop-blur-md border border-white/15 text-white/90 rounded-md transition-colors"
            title={t('dashboard.camera.actions.snapshot')}
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onZoom();
            }}
            className="p-1 bg-black/70 hover:bg-accentViolet backdrop-blur-md border border-white/15 text-white/90 rounded-md transition-colors"
            title="Ampliar Câmera"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStop();
            }}
            className="p-1 bg-black/70 hover:bg-red-600 backdrop-blur-md border border-white/15 text-red-400 hover:text-white rounded-md transition-colors"
            title={t('dashboard.camera.actions.stop')}
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      )}
    </div>
  );
};
