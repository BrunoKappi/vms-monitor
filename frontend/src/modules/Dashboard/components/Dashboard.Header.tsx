import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Radio, Languages, Video, LayoutList, Maximize, Minimize, Power, Activity, Leaf } from 'lucide-react';
import { ThemeToggle } from '../../Theme/components/Theme.Toggle';

interface HeaderProps {
  isDiscovering: boolean;
  activeTab: 'live' | 'manage' | 'resources';
  ecoMode: boolean;
  onToggleEco: () => void;
  onDiscover: () => void;
  onTabChange: (tab: 'live' | 'manage' | 'resources') => void;
  onShutdown: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDiscovering,
  activeTab,
  ecoMode,
  onToggleEco,
  onDiscover,
  onTabChange,
  onShutdown,
}) => {
  const { t, i18n } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleLanguage = () => {
    const nextLng = i18n.language === 'pt' ? 'en' : 'pt';
    i18n.changeLanguage(nextLng);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error(err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false));
      }
    }
  };

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  return (
    <header className="glass rounded-2xl px-6 py-3.5 mb-6 flex flex-col sm:flex-row justify-between items-center gap-3 select-none">
      {/* Brand & Subtitle (Compact / Minimalist) */}
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accentViolet opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accentViolet animate-pulse"></span>
        </span>
        <div>
          <h1 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white/90 leading-none">
            {t('dashboard.title')}
          </h1>
          <p className="text-[10px] text-mutedText/85 mt-0.5 font-mono">{t('dashboard.subtitle')}</p>
        </div>
      </div>

      {/* Minimalist Navigation tabs */}
      <div className="flex border border-black/5 dark:border-white/5 rounded-xl overflow-hidden p-0.5 bg-black/5 dark:bg-black/45 w-fit shrink-0 shadow-inner">
        <button
          onClick={() => onTabChange('live')}
          className={`px-4 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all duration-250 ${
            activeTab === 'live'
              ? 'bg-accentViolet text-white shadow-glowViolet/15 font-black'
              : 'text-mutedText hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          Visualização
        </button>
        <button
          onClick={() => onTabChange('manage')}
          className={`px-4 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all duration-250 ${
            activeTab === 'manage'
              ? 'bg-accentViolet text-white shadow-glowViolet/15 font-black'
              : 'text-mutedText hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LayoutList className="w-3.5 h-3.5" />
          Gerenciamento
        </button>
        <button
          onClick={() => onTabChange('resources')}
          className={`px-4 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all duration-250 ${
            activeTab === 'resources'
              ? 'bg-accentViolet text-white shadow-glowViolet/15 font-black'
              : 'text-mutedText hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Recursos
        </button>
      </div>

      {/* Action Commands (Minimalist, Compact) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Compact Discovery Trigger */}
        <button
          disabled={isDiscovering}
          onClick={onDiscover}
          className={`flex items-center justify-center p-2 rounded-lg transition-all border duration-200 ${
            isDiscovering
              ? 'bg-accentViolet/25 border-accentViolet/30 text-accentViolet animate-pulse'
              : 'bg-white/5 border-black/10 dark:border-white/10 hover:border-accentViolet/40 hover:bg-accentViolet/10 text-slate-800 dark:text-white/80 hover:text-accentViolet'
          }`}
          title={isDiscovering ? t('dashboard.actions.discovering') : t('dashboard.actions.discover')}
        >
          <Radio className={`w-4 h-4 ${isDiscovering ? 'animate-pulse' : ''}`} />
        </button>

        {/* Compact Fullscreen Web view Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-white/5 border border-black/10 dark:border-white/10 hover:border-accentViolet/40 hover:bg-accentViolet/10 text-slate-800 dark:text-white/80 hover:text-accentViolet rounded-lg transition-all"
          title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia do Site'}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* Compact Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="p-2 bg-white/5 border border-black/10 dark:border-white/10 hover:border-accentViolet/40 hover:bg-accentViolet/10 text-slate-800 dark:text-white/80 hover:text-accentViolet rounded-lg transition-all"
          title="Switch Language"
        >
          <Languages className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Compact Eco Mode Toggle */}
        <button
          onClick={onToggleEco}
          className={`p-2 border rounded-lg transition-all ${
            ecoMode
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500/20 hover:border-emerald-500/50 shadow-glowEmerald/15'
              : 'bg-white/5 border-black/10 dark:border-white/10 text-slate-800 dark:text-white/80 hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-emerald-500'
          }`}
          title={ecoMode ? 'Desativar Modo Econômico' : 'Ativar Modo Econômico'}
        >
          <Leaf className={`w-4 h-4 ${ecoMode ? 'animate-pulse' : ''}`} />
        </button>

        {/* Compact Shutdown VMS System Trigger */}
        <button
          onClick={onShutdown}
          className="p-2 bg-red-950/20 border border-red-500/20 hover:border-red-500 hover:bg-red-500/10 text-red-400 hover:text-white rounded-lg transition-all cursor-pointer"
          title="Desligar e Encerrar Servidores VMS"
        >
          <Power className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
