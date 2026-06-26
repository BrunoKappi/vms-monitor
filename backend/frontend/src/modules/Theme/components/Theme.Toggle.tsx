import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/Theme.Hook';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 bg-white/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-accentViolet/40 hover:bg-accentViolet/10 dark:hover:bg-accentViolet/10 text-slate-800 dark:text-white/80 hover:text-accentViolet dark:hover:text-accentViolet rounded-lg transition-all"
      title={theme === 'dark' ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
      aria-label="Alternar tema claro/escuro"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
};
