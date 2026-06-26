import React from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Trash2, Video, Globe, Power } from 'lucide-react';
import type { CameraUI } from '../types/Dashboard.Types';

interface TableProps {
  cameras: CameraUI[];
  activeStreams: string[];
  onStartStream: (id: string) => void;
  onStopStream: (id: string) => void;
  onDeleteCamera: (id: string) => void;
}

export const Table: React.FC<TableProps> = ({
  cameras,
  activeStreams,
  onStartStream,
  onStopStream,
  onDeleteCamera,
}) => {
  const { t } = useTranslation();

  return (
    <div className="glass rounded-2xl overflow-hidden border border-white/5 shadow-xl animate-fadeIn">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02] text-xs font-semibold text-mutedText uppercase tracking-wider">
              <th className="px-6 py-4">{t('dashboard.camera.info.model')} / Nome</th>
              <th className="px-6 py-4">{t('dashboard.camera.info.ip')}</th>
              <th className="px-6 py-4">{t('dashboard.camera.info.port')}</th>
              <th className="px-6 py-4">{t('dashboard.camera.info.manufacturer')}</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {cameras.map((camera) => {
              const isActive = activeStreams.includes(camera.id);
              return (
                <tr
                  key={camera.id}
                  className="hover:bg-white/[0.01] transition-colors group"
                >
                  {/* Name & Model */}
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accentViolet/10 text-accentViolet border border-accentViolet/15">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-white/95 group-hover:text-accentViolet transition-colors">
                        {camera.name}
                      </div>
                      <div className="text-[10px] text-mutedText uppercase font-mono mt-0.5">
                        {camera.model || 'Generic IP Camera'}
                      </div>
                    </div>
                  </td>

                  {/* IP Address */}
                  <td className="px-6 py-4 font-mono text-white/80">{camera.ip}</td>

                  {/* Port */}
                  <td className="px-6 py-4 font-mono text-white/80">{camera.port}</td>

                  {/* Manufacturer */}
                  <td className="px-6 py-4 text-white/80">
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-mutedText" />
                      <span>{camera.manufacturer || 'Generic'}</span>
                    </div>
                  </td>

                  {/* Status Badges */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        camera.status === 'online'
                          ? 'bg-accentEmerald/10 text-accentEmerald border border-accentEmerald/15'
                          : 'bg-red-500/10 text-red-400 border border-red-500/15'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          camera.status === 'online' ? 'bg-accentEmerald' : 'bg-red-400'
                        }`}
                      />
                      {camera.status === 'online' ? t('dashboard.camera.status.online') : t('dashboard.camera.status.offline')}
                    </span>
                  </td>

                  {/* Action Controls */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      {isActive ? (
                        <button
                          onClick={() => onStopStream(camera.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Power className="w-3.5 h-3.5" />
                          {t('dashboard.camera.actions.stop')}
                        </button>
                      ) : (
                        <button
                          disabled={camera.status !== 'online'}
                          onClick={() => onStartStream(camera.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-accentViolet/10 hover:bg-accentViolet/20 disabled:opacity-30 disabled:cursor-not-allowed text-accentViolet border border-accentViolet/20 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          {t('dashboard.camera.actions.stream')}
                        </button>
                      )}

                      {camera.isCustom && (
                        <button
                          onClick={() => onDeleteCamera(camera.id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400/80 hover:text-red-400 border border-red-500/10 hover:border-red-500/25 rounded-lg transition-all"
                          title={t('dashboard.camera.actions.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
