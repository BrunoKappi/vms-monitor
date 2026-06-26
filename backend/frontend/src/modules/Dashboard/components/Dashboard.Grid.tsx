import React, { useState, useEffect, useRef } from 'react';
import type { CameraUI } from '../types/Dashboard.Types';
import { CameraCard } from './Dashboard.CameraCard';
import { VideoOff } from 'lucide-react';

interface GridProps {
  cameras: CameraUI[];
  activeStreams: string[];
  gridLayout: 'grid_2x2' | 'grid_3x3' | 'grid_4x4' | 'destaque_3x3' | 'destaque_4x4';
  onStartStream: (id: string) => void;
  onStopStream: (id: string) => void;
  onDeleteCamera: (id: string) => void;
  onReorderCameras: (cameras: CameraUI[]) => void;
  onZoomCamera: (id: string) => void;
}

const GRID_CELL_STYLES: Record<string, { gridColumn: string, gridRow: string }[]> = {
  grid_2x2: [
    { gridColumn: '1 / 2', gridRow: '1 / 2' },
    { gridColumn: '2 / 3', gridRow: '1 / 2' },
    { gridColumn: '1 / 2', gridRow: '2 / 3' },
    { gridColumn: '2 / 3', gridRow: '2 / 3' },
  ],
  grid_3x3: [
    { gridColumn: '1 / 2', gridRow: '1 / 2' },
    { gridColumn: '2 / 3', gridRow: '1 / 2' },
    { gridColumn: '3 / 4', gridRow: '1 / 2' },
    { gridColumn: '1 / 2', gridRow: '2 / 3' },
    { gridColumn: '2 / 3', gridRow: '2 / 3' },
    { gridColumn: '3 / 4', gridRow: '2 / 3' },
    { gridColumn: '1 / 2', gridRow: '3 / 4' },
    { gridColumn: '2 / 3', gridRow: '3 / 4' },
    { gridColumn: '3 / 4', gridRow: '3 / 4' },
  ],
  grid_4x4: [
    { gridColumn: '1 / 2', gridRow: '1 / 2' },
    { gridColumn: '2 / 3', gridRow: '1 / 2' },
    { gridColumn: '3 / 4', gridRow: '1 / 2' },
    { gridColumn: '4 / 5', gridRow: '1 / 2' },
    { gridColumn: '1 / 2', gridRow: '2 / 3' },
    { gridColumn: '2 / 3', gridRow: '2 / 3' },
    { gridColumn: '3 / 4', gridRow: '2 / 3' },
    { gridColumn: '4 / 5', gridRow: '2 / 3' },
    { gridColumn: '1 / 2', gridRow: '3 / 4' },
    { gridColumn: '2 / 3', gridRow: '3 / 4' },
    { gridColumn: '3 / 4', gridRow: '3 / 4' },
    { gridColumn: '4 / 5', gridRow: '3 / 4' },
    { gridColumn: '1 / 2', gridRow: '4 / 5' },
    { gridColumn: '2 / 3', gridRow: '4 / 5' },
    { gridColumn: '3 / 4', gridRow: '4 / 5' },
    { gridColumn: '4 / 5', gridRow: '4 / 5' },
  ],
  destaque_3x3: [
    { gridColumn: '1 / 3', gridRow: '1 / 3' }, // Spotlight (Camera 0) - 2x2 block (4 cells)
    { gridColumn: '3 / 4', gridRow: '1 / 2' }, // Camera 1
    { gridColumn: '3 / 4', gridRow: '2 / 3' }, // Camera 2
    { gridColumn: '3 / 4', gridRow: '3 / 4' }, // Camera 3
    { gridColumn: '2 / 3', gridRow: '3 / 4' }, // Camera 4
    { gridColumn: '1 / 2', gridRow: '3 / 4' }, // Camera 5
  ],
  destaque_4x4: [
    { gridColumn: '1 / 4', gridRow: '1 / 4' }, // Spotlight (Camera 0) - 3x3 block (9 cells)
    { gridColumn: '4 / 5', gridRow: '1 / 2' }, // Camera 1
    { gridColumn: '4 / 5', gridRow: '2 / 3' }, // Camera 2
    { gridColumn: '4 / 5', gridRow: '3 / 4' }, // Camera 3
    { gridColumn: '4 / 5', gridRow: '4 / 5' }, // Camera 4
    { gridColumn: '3 / 4', gridRow: '4 / 5' }, // Camera 5
    { gridColumn: '2 / 3', gridRow: '4 / 5' }, // Camera 6
    { gridColumn: '1 / 2', gridRow: '4 / 5' }, // Camera 7
  ],
};

const GRID_CONFIG = {
  grid_2x2: { cols: 2, rows: 2 },
  grid_3x3: { cols: 3, rows: 3 },
  grid_4x4: { cols: 4, rows: 4 },
  destaque_3x3: { cols: 3, rows: 3 },
  destaque_4x4: { cols: 4, rows: 4 },
};

export const Grid: React.FC<GridProps> = ({
  cameras,
  activeStreams,
  gridLayout,
  onStartStream,
  onStopStream,
  onDeleteCamera,
  onReorderCameras,
  onZoomCamera,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const activeLayout = GRID_CELL_STYLES[gridLayout] ? gridLayout : 'destaque_4x4';
  const cellStyles = GRID_CELL_STYLES[activeLayout];
  const config = GRID_CONFIG[activeLayout];

  // Calculate container dimensions keeping a strict 16:9 ratio and fitting viewport bounds perfectly without scrollbars
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const maxAvailableHeight = window.innerHeight - 170; // Leaves ample space for VMS header, margins and spacing
      const parentWidth = containerRef.current.parentElement?.clientWidth || window.innerWidth;
      
      const maxAvailableWidth = parentWidth - 32; // Leave horizontal padding margins

      const ratio = 16 / 9;
      let width = maxAvailableWidth;
      let height = maxAvailableWidth / ratio;

      if (height > maxAvailableHeight) {
        height = maxAvailableHeight;
        width = maxAvailableHeight * ratio;
      }

      setDimensions({ width, height });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [gridLayout]); // Re-calculate dimensions whenever the selected grid layout changes!

  // HTML5 Drag & Drop handlers for seamless camera shuffling
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnter = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    if (targetIndex >= cameras.length) return; // Only swap active camera items

    const reordered = [...cameras];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    onReorderCameras(reordered);
    setDraggedIndex(targetIndex);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="w-full flex-grow flex items-center justify-center min-h-0 select-none p-2 animate-fadeIn" ref={containerRef}>
      <div
        className="grid gap-2 bg-black/40 border border-white/5 overflow-hidden rounded-2xl p-2 relative shadow-2xl transition-all duration-300"
        style={{
          width: dimensions.width ? `${dimensions.width}px` : '100%',
          height: dimensions.height ? `${dimensions.height}px` : 'auto',
          gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${config.rows}, minmax(0, 1fr))`,
        }}
      >
        {cellStyles.map((cellStyle, index) => {
          const camera = cameras[index];
          const isSpotlight = (activeLayout === 'destaque_3x3' || activeLayout === 'destaque_4x4') && index === 0;

          if (camera) {
            return (
              <div
                key={camera.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                style={{
                  ...cellStyle,
                  cursor: 'grab',
                }}
                className={`transition-all duration-200 h-full w-full min-h-0 overflow-hidden flex items-center justify-center p-0.5 ${
                  draggedIndex === index ? 'opacity-30 border border-accentViolet animate-pulse' : 'opacity-100 border border-transparent'
                }`}
              >
                <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl border border-white/5 bg-black">
                  <div className={draggedIndex !== null ? 'pointer-events-none w-full h-full' : 'w-full h-full'}>
                    <CameraCard
                      camera={camera}
                      isActive={activeStreams.includes(camera.id)}
                      onStart={() => onStartStream(camera.id)}
                      onStop={() => onStopStream(camera.id)}
                      onDelete={() => onDeleteCamera(camera.id)}
                      onZoom={() => onZoomCamera(camera.id)}
                    />
                  </div>
                </div>
              </div>
            );
          } else {
            // Render high-end premium empty placeholder card maintaining pristine 16:9 grid dimensions
            return (
              <div
                key={`empty-${index}`}
                style={cellStyle}
                className="h-full w-full min-h-0 overflow-hidden flex items-center justify-center p-0.5 animate-fadeIn"
              >
                <div className="w-full h-full rounded-xl border border-dashed border-white/10 bg-white/[0.02] backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-white/20 hover:bg-white/[0.04] hover:border-white/25 transition-all duration-300">
                  <VideoOff className={`${isSpotlight ? 'w-10 h-10' : 'w-5 h-5'} opacity-40`} />
                  <span className={`${isSpotlight ? 'text-xs' : 'text-[9px]'} font-mono uppercase tracking-widest font-bold opacity-30`}>
                    Sem Sinal
                  </span>
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};
