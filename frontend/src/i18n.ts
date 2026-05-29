import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "dashboard.title": "CamerasLive Command Center",
          "dashboard.subtitle": "Real-time ONVIF CCTV Network Monitor",
          "dashboard.actions.discover": "Discover Cameras",
          "dashboard.actions.add": "Add Camera",
          "dashboard.actions.discovering": "Probing Network...",
          "dashboard.search.placeholder": "Search cameras by name, IP, or brand...",
          "dashboard.stats.total": "Total Cameras",
          "dashboard.stats.online": "Online",
          "dashboard.stats.offline": "Offline",
          "dashboard.grid.1x1": "Focus Mode",
          "dashboard.grid.2x2": "Dual Grid",
          "dashboard.grid.auto": "Widescreen Grid",
          "dashboard.camera.status.online": "ONLINE",
          "dashboard.camera.status.offline": "OFFLINE",
          "dashboard.camera.actions.stream": "Start Live Stream",
          "dashboard.camera.actions.stop": "Disconnect",
          "dashboard.camera.actions.snapshot": "Snapshot",
          "dashboard.camera.actions.fullscreen": "Fullscreen",
          "dashboard.camera.actions.delete": "Remove",
          "dashboard.camera.info.model": "Model",
          "dashboard.camera.info.manufacturer": "Brand",
          "dashboard.camera.info.ip": "IP Address",
          "dashboard.camera.info.port": "ONVIF Port",
          "dashboard.camera.loading": "Connecting to RTSP video transcoder stream...",
          "dashboard.modal.title": "Register Custom Camera",
          "dashboard.modal.ip": "IP Address",
          "dashboard.modal.port": "ONVIF Port (default 80)",
          "dashboard.modal.user": "Username",
          "dashboard.modal.pass": "Password",
          "dashboard.modal.name": "Camera Widescreen Label",
          "dashboard.modal.cancel": "Cancel",
          "dashboard.modal.submit": "Register Feed",
          "dashboard.modal.error": "All validation fields are mandatory."
        }
      },
      pt: {
        translation: {
          "dashboard.title": "Centro de Comando CamerasLive",
          "dashboard.subtitle": "Monitoramento CCTV ONVIF em Tempo Real",
          "dashboard.actions.discover": "Descobrir na Rede",
          "dashboard.actions.add": "Adicionar Câmera",
          "dashboard.actions.discovering": "Varrendo Rede...",
          "dashboard.search.placeholder": "Buscar câmeras por nome, IP ou marca...",
          "dashboard.stats.total": "Total de Câmeras",
          "dashboard.stats.online": "Online",
          "dashboard.stats.offline": "Offline",
          "dashboard.grid.1x1": "Modo Foco",
          "dashboard.grid.2x2": "Grade Dupla",
          "dashboard.grid.auto": "Grade Automática",
          "dashboard.camera.status.online": "ONLINE",
          "dashboard.camera.status.offline": "OFFLINE",
          "dashboard.camera.actions.stream": "Iniciar Transmissão",
          "dashboard.camera.actions.stop": "Desconectar",
          "dashboard.camera.actions.snapshot": "Captura",
          "dashboard.camera.actions.fullscreen": "Tela Cheia",
          "dashboard.camera.actions.delete": "Remover",
          "dashboard.camera.info.model": "Modelo",
          "dashboard.camera.info.manufacturer": "Marca",
          "dashboard.camera.info.ip": "Endereço IP",
          "dashboard.camera.info.port": "Porta ONVIF",
          "dashboard.camera.loading": "Conectando ao stream do transcodificador RTSP...",
          "dashboard.modal.title": "Registrar Câmera Manualmente",
          "dashboard.modal.ip": "Endereço IP",
          "dashboard.modal.port": "Porta ONVIF (padrão 80)",
          "dashboard.modal.user": "Usuário",
          "dashboard.modal.pass": "Senha",
          "dashboard.modal.name": "Nome da Câmera",
          "dashboard.modal.cancel": "Cancelar",
          "dashboard.modal.submit": "Registrar Câmera",
          "dashboard.modal.error": "Todos os campos de validação são obrigatórios."
        }
      }
    },
    lng: 'pt', // Default to Portuguese
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
