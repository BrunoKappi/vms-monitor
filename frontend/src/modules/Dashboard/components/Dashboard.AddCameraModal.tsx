import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus, AlertCircle } from 'lucide-react';

interface AddCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    ip: string;
    port: number;
    user: string;
    pass: string;
    name: string;
  }) => Promise<any>;
}

export const AddCameraModal: React.FC<AddCameraModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [ip, setIp] = useState('');
  const [port, setPort] = useState(80);
  const [user, setUser] = useState('admin');
  const [pass, setPass] = useState('Snulp1234');
  const [name, setName] = useState('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!ip.trim() || !user.trim() || !pass.trim() || !name.trim()) {
      setErrorMsg(t('dashboard.modal.error'));
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ip: ip.trim(),
        port: Number(port) || 80,
        user: user.trim(),
        pass: pass.trim(),
        name: name.trim()
      });
      // Clear and close
      setIp('');
      setPort(80);
      setUser('admin');
      setPass('Snulp1234');
      setName('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err || 'Failed to connect/probe camera. Please check details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-[4px] p-4">
      <div className="glass rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-white/[0.02]">
          <h3 className="text-lg font-bold text-white/95">{t('dashboard.modal.title')}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-mutedText hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-mutedText uppercase tracking-wider mb-1.5">
              {t('dashboard.modal.name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-white/90 text-sm focus:outline-none focus:border-accentViolet/50 transition-colors"
              placeholder="Ex: Câmera da Garagem"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-mutedText uppercase tracking-wider mb-1.5">
                {t('dashboard.modal.ip')}
              </label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-white/90 text-sm font-mono focus:outline-none focus:border-accentViolet/50 transition-colors"
                placeholder="192.168.1.8"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mutedText uppercase tracking-wider mb-1.5">
                {t('dashboard.modal.port')}
              </label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-white/90 text-sm font-mono focus:outline-none focus:border-accentViolet/50 transition-colors"
                placeholder="80"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-mutedText uppercase tracking-wider mb-1.5">
                {t('dashboard.modal.user')}
              </label>
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-white/90 text-sm focus:outline-none focus:border-accentViolet/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mutedText uppercase tracking-wider mb-1.5">
                {t('dashboard.modal.pass')}
              </label>
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-white/90 text-sm focus:outline-none focus:border-accentViolet/50 transition-colors"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-white/10 hover:bg-white/5 text-white/80 font-semibold text-sm rounded-lg transition-colors"
            >
              {t('dashboard.modal.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-accentViolet hover:bg-accentViolet/90 disabled:opacity-40 text-white font-semibold text-sm rounded-lg shadow-glowViolet transition-all"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Probing...' : t('dashboard.modal.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
