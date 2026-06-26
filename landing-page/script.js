/* ============================================================
   VMS Monitor Landing Page — script.js
   i18n + Theme + Interactions
   ============================================================ */

'use strict';

// ============================================================
// TRANSLATIONS
// ============================================================
const translations = {
  en: {
    // Navbar
    'nav.features': 'Features',
    'nav.layouts': 'Layouts',
    'nav.monitoring': 'Monitoring',
    'nav.setup': 'Setup',
    'nav.developer': 'Developer',
    'nav.github': 'GitHub',

    // Hero
    'hero.badge': 'Open Source · Free · Self-hosted',
    'hero.title1': 'Professional',
    'hero.title2': 'IP Camera',
    'hero.title3': 'Surveillance Dashboard',
    'hero.subtitle': 'A high-performance VMS with ONVIF auto-discovery, real-time RTSP transcoding, multiple grid layouts, PTZ control, resource monitoring, and multi-language support — all in a sleek, modern interface.',
    'hero.cta.github': 'View on GitHub',
    'hero.cta.explore': 'Explore Features',
    'hero.stats.layouts': 'Grid Layouts',
    'hero.stats.cameras': 'Cameras Supported',
    'hero.stats.latency': 'Stream Latency',
    'hero.stats.languages': 'Languages',

    // Features
    'features.tag': 'Core Features',
    'features.title': 'Everything You Need for Professional Surveillance',
    'features.subtitle': 'Built with a modern, scalable architecture for real-world CCTV deployments',
    'features.discovery.title': 'Smart Auto-Discovery',
    'features.discovery.desc': 'Automatically scans your local subnet for devices with open RTSP port 554, then probes ONVIF capabilities on common HTTP ports (80, 5000, 8000, 8080, 8899, 37777) — zero manual configuration required.',
    'features.streaming.title': 'Ultra-Low Latency Streaming',
    'features.streaming.desc': 'FFmpeg transcodes RTSP H.264 streams to MPEG-1 in real-time, delivering binary data via WebSockets to a canvas element rendered by JSMpeg — achieving latency under 0.5 seconds.',
    'features.grids.title': '5 Premium Grid Layouts',
    'features.grids.desc': 'Switch between 5 mathematically perfect 16:9 grid layouts — from compact 2x2 dual view to a full 4x4 matrix with 16 simultaneous feeds. All grids maintain exact widescreen proportions.',
    'features.ptz.title': 'ONVIF PTZ Control',
    'features.ptz.desc': 'Control Pan, Tilt and Zoom via an interactive D-Pad with three speed levels (Slow, Medium, Fast) and automatic failsafe stop after 500ms. Full ONVIF SOAP protocol compliance.',
    'features.dragdrop.title': 'Live Drag and Drop Reorder',
    'features.dragdrop.desc': 'Rearrange camera positions in real-time by dragging cards within the grid. New order is instantly applied and persisted to the local database — no page reload required.',
    'features.snapshot.title': 'Instant Snapshots',
    'features.snapshot.desc': 'Capture pixel-perfect screenshots from any live stream at any moment — no black frames. Download camera snapshots directly from the browser with a single click.',
    'features.eco.title': 'Resource Saver Mode',
    'features.eco.desc': 'Activate Eco Mode to pause all active video streams and reduce CPU/bandwidth usage drastically — perfect for long-duration monitoring sessions.',
    'features.i18n.title': 'Multi-Language Interface',
    'features.i18n.desc': 'Full internationalization with i18next. The interface is available in English and Portuguese, with the architecture ready for additional language packs. Switch languages instantly.',
    'features.theme.title': 'Dark and Light Themes',
    'features.theme.desc': 'Automatically detects your OS preference (prefers-color-scheme) with dark mode as fallback. Switch between premium dark glassmorphism and clean light interfaces at any time.',

    // Layouts
    'layouts.tag': 'Grid Layouts',
    'layouts.title': 'Visualize Every Camera, Every Way',
    'layouts.subtitle': 'Five precision-engineered 16:9 grid layouts — from focused views to massive 16-camera matrices',
    'layouts.tab.dark': 'Dark Theme',
    'layouts.tab.light': 'Light Theme',
    'layouts.grid2x2.name': 'Dual Grid 2x2',
    'layouts.grid2x2.desc': '4 cameras in equal cells — perfect for focused monitoring of critical areas.',
    'layouts.grid3x3.name': 'Grid 3x3',
    'layouts.grid3x3.desc': '9 cameras displayed harmonically — ideal for medium-scale surveillance.',
    'layouts.grid4x4.name': 'High-Density 4x4',
    'layouts.grid4x4.desc': '16 simultaneous feeds — maximum coverage for large-scale deployments.',
    'layouts.spotlight3x3.name': 'Spotlight 3x3',
    'layouts.spotlight3x3.desc': '1 enlarged 2x2 focus camera surrounded by 5 satellite feeds.',
    'layouts.spotlight4x4.name': 'Spotlight 4x4',
    'layouts.spotlight4x4.desc': 'Giant 3x3 primary view with 7 satellite cameras — maximum attention where it matters.',

    // Camera List
    'list.tag': 'Camera Management',
    'list.title': 'Complete Camera Control Panel',
    'list.desc': 'Manage your entire camera fleet from a unified table view. Search by name, IP, or brand. Check online/offline status at a glance, start or stop individual streams, and add cameras manually for non-standard setups.',
    'list.feature1': 'Real-time online/offline status badges',
    'list.feature2': 'Search by camera name, IP, or manufacturer',
    'list.feature3': 'One-click stream start/disconnect per camera',
    'list.feature4': 'Manual camera registration with custom credentials',
    'list.feature5': 'Live camera count statistics (Total / Online / Offline)',

    // Monitoring
    'monitoring.tag': 'System Monitoring',
    'monitoring.title': 'Real-Time Resource Dashboard',
    'monitoring.subtitle': 'Keep your system healthy with live metrics refreshed every 2.5 seconds',
    'monitoring.cpu.title': 'CPU Usage',
    'monitoring.cpu.desc': 'Real-time CPU load percentage with processor model and thread count — color-coded progress bar.',
    'monitoring.ram.title': 'RAM Memory',
    'monitoring.ram.desc': 'Tracks total, used, and free memory with percentage gauge and backend process RSS footprint.',
    'monitoring.streams.title': 'Active Streams',
    'monitoring.streams.desc': 'Lists all active FFmpeg transcoding processes with camera IDs and connected client count in real-time.',
    'monitoring.uptime.title': 'System Uptime',
    'monitoring.uptime.desc': 'Displays both host OS uptime and VMS server uptime alongside platform and OS release information.',

    // Stack
    'stack.tag': 'Technology Stack',
    'stack.title': 'Built with Modern, Battle-Tested Technologies',
    'stack.frontend': 'Frontend',
    'stack.backend': 'Backend',
    'stack.react': 'Vite + TypeScript',
    'stack.redux': 'Global state management',
    'stack.tailwind': 'Glassmorphism + neon effects',
    'stack.i18n': 'Full internationalization',
    'stack.jsmpeg': 'Canvas 2D video rendering',
    'stack.node': 'REST API + TypeScript',
    'stack.ws': 'High-speed binary streaming',
    'stack.ffmpeg': 'RTSP to MPEG-1 transcoding',
    'stack.onvif': 'ONVIF SOAP protocol',
    'stack.security': 'Security middleware',

    // Setup
    'setup.tag': 'Quick Start',
    'setup.title': 'Up and Running in Minutes',
    'setup.subtitle': 'Choose between the automated Windows installer or manual setup via CLI',
    'setup.windows.title': 'Windows Quick Start',
    'setup.windows.sub': 'Automated .bat scripts — just double-click',
    'setup.windows.step1.title': 'Clone the repository',
    'setup.windows.step2.title': 'Run scripts/setup-vms.bat',
    'setup.windows.step2.desc': 'Double-click scripts/setup-vms.bat — installs Node.js dependencies, checks FFmpeg, and configures the .env file automatically.',
    'setup.windows.step3.title': 'Launch with scripts/start-vms.bat',
    'setup.windows.step3.desc': 'Double-click scripts/start-vms.bat — starts both servers and opens the dashboard in your browser automatically at http://localhost:42100.',
    'setup.windows.step4.title': 'Stop with scripts/stop-vms.bat',
    'setup.windows.step4.desc': 'Double-click scripts/stop-vms.bat to gracefully shut down all servers and free ports 42100, 42200, and 42300.',
    'setup.manual.title': 'Manual CLI Setup',
    'setup.manual.sub': 'Node.js v18+ and FFmpeg required',
    'setup.manual.prereqs': 'Prerequisites',
    'setup.manual.install': 'Installation',
    'setup.manual.run': 'Run',
    'setup.env.title': 'Environment Variables (backend/.env)',
    'setup.env.port': 'REST API server port',
    'setup.env.ws': 'WebSocket streaming server port',
    'setup.env.frontend': 'Vite dev server port',
    'setup.env.user': 'Default username for camera discovery',
    'setup.env.pass': 'Default password for camera discovery',
    'setup.env.ips': 'Comma-separated known camera IPs for fast discovery',

    // Developer
    'dev.tag': 'About the Developer',
    'dev.title': 'Meet the Creator',
    'dev.status': 'Open to opportunities',
    'dev.role': 'Fullstack Developer & Systems Analyst',
    'dev.bio': 'With a background in both industrial automation and modern web development, Bruno brings a rare blend of technical depth and product vision to everything he builds. He believes software should be elegant, efficient, and most of all, useful.',

    // CTA
    'cta.title': 'Ready to Monitor Your Cameras?',
    'cta.desc': 'Free, open-source, and self-hosted. Deploy VMS Monitor on your own network in minutes.',
    'cta.github': 'Star on GitHub',
    'cta.license': 'Open source · MIT License · No subscription required',
  },

  pt: {
    // Navbar
    'nav.features': 'Recursos',
    'nav.layouts': 'Layouts',
    'nav.monitoring': 'Monitoramento',
    'nav.setup': 'Instalação',
    'nav.developer': 'Desenvolvedor',
    'nav.github': 'GitHub',

    // Hero
    'hero.badge': 'Código Aberto · Gratuito · Self-hosted',
    'hero.title1': 'Dashboard Profissional de',
    'hero.title2': 'Câmeras IP',
    'hero.title3': 'em Tempo Real',
    'hero.subtitle': 'Um VMS de alto desempenho com descoberta automática ONVIF, transcodificação RTSP em tempo real, múltiplos layouts de grade, controle PTZ, monitoramento de recursos e suporte multilíngue — em uma interface moderna e elegante.',
    'hero.cta.github': 'Ver no GitHub',
    'hero.cta.explore': 'Explorar Recursos',
    'hero.stats.layouts': 'Layouts de Grade',
    'hero.stats.cameras': 'Câmeras Suportadas',
    'hero.stats.latency': 'Latência do Stream',
    'hero.stats.languages': 'Idiomas',

    // Features
    'features.tag': 'Recursos Principais',
    'features.title': 'Tudo que Você Precisa para Vigilância Profissional',
    'features.subtitle': 'Construído com uma arquitetura moderna e escalável para implantações CCTV reais',
    'features.discovery.title': 'Descoberta Automática Inteligente',
    'features.discovery.desc': 'Varre automaticamente sua sub-rede local em busca de dispositivos com porta RTSP 554 aberta, sondando capacidades ONVIF em portas HTTP comuns — sem configuração manual.',
    'features.streaming.title': 'Streaming de Latência Ultra-Baixa',
    'features.streaming.desc': 'FFmpeg transcodifica streams RTSP H.264 para MPEG-1 em tempo real, entregando dados binários via WebSockets para um canvas renderizado pelo JSMpeg — latência abaixo de 0,5 segundo.',
    'features.grids.title': '5 Layouts de Grade Premium',
    'features.grids.desc': 'Alterne entre 5 layouts 16:9 matematicamente perfeitos — do compacto 2x2 até uma matriz 4x4 completa com 16 feeds simultâneos. Todas as grades mantêm proporções exatas.',
    'features.ptz.title': 'Controle PTZ ONVIF',
    'features.ptz.desc': 'Controle Pan, Tilt e Zoom via D-Pad interativo com três velocidades (Lento, Médio, Rápido) e parada automática de segurança após 500ms. Protocolo ONVIF SOAP completo.',
    'features.dragdrop.title': 'Reordenação por Arrastar e Soltar',
    'features.dragdrop.desc': 'Reorganize câmeras em tempo real arrastando os cards na grade. A nova ordem é aplicada instantaneamente e persistida no banco de dados local.',
    'features.snapshot.title': 'Capturas Instantâneas',
    'features.snapshot.desc': 'Capture screenshots perfeitas de qualquer stream ao vivo — sem telas pretas. Baixe direto do navegador com um único clique.',
    'features.eco.title': 'Modo de Economia de Recursos',
    'features.eco.desc': 'Ative o Modo Eco para pausar todos os streams ativos e reduzir drasticamente o uso de CPU/banda — perfeito para sessões longas de monitoramento.',
    'features.i18n.title': 'Interface Multilíngue',
    'features.i18n.desc': 'Internacionalização completa com i18next. Interface disponível em inglês e português, com arquitetura pronta para novos idiomas. Troque de idioma instantaneamente.',
    'features.theme.title': 'Temas Claro e Escuro',
    'features.theme.desc': 'Detecta automaticamente a preferência do sistema operacional (prefers-color-scheme) com tema escuro como fallback. Alterne entre glassmorphism escuro premium e interface clara a qualquer momento.',

    // Layouts
    'layouts.tag': 'Layouts de Grade',
    'layouts.title': 'Visualize Cada Câmera, de Todo Jeito',
    'layouts.subtitle': 'Cinco layouts 16:9 de precisão — de visualizações focadas a matrizes de 16 câmeras',
    'layouts.tab.dark': 'Tema Escuro',
    'layouts.tab.light': 'Tema Claro',
    'layouts.grid2x2.name': 'Grade Dupla 2x2',
    'layouts.grid2x2.desc': '4 câmeras em células iguais — perfeito para monitoramento focado.',
    'layouts.grid3x3.name': 'Grade 3x3',
    'layouts.grid3x3.desc': '9 câmeras exibidas harmonicamente — ideal para vigilância em média escala.',
    'layouts.grid4x4.name': 'Alta Densidade 4x4',
    'layouts.grid4x4.desc': '16 feeds simultâneos — cobertura máxima para implantações em larga escala.',
    'layouts.spotlight3x3.name': 'Destaque 3x3',
    'layouts.spotlight3x3.desc': '1 câmera ampliada 2x2 rodeada por 5 feeds satélites em "L".',
    'layouts.spotlight4x4.name': 'Destaque 4x4',
    'layouts.spotlight4x4.desc': 'Visualização primária gigante 3x3 com 7 câmeras satélites.',

    // Camera List
    'list.tag': 'Gerenciamento de Câmeras',
    'list.title': 'Painel de Controle Completo',
    'list.desc': 'Gerencie toda a frota de câmeras em uma visão de tabela unificada. Pesquise por nome, IP ou marca. Verifique o status online/offline, inicie ou pare streams individuais e adicione câmeras manualmente.',
    'list.feature1': 'Badges de status online/offline em tempo real',
    'list.feature2': 'Busca por nome, IP ou fabricante',
    'list.feature3': 'Iniciar/desconectar stream com um clique',
    'list.feature4': 'Registro manual de câmeras com credenciais personalizadas',
    'list.feature5': 'Estatísticas ao vivo (Total / Online / Offline)',

    // Monitoring
    'monitoring.tag': 'Monitoramento do Sistema',
    'monitoring.title': 'Dashboard de Recursos em Tempo Real',
    'monitoring.subtitle': 'Mantenha seu sistema saudável com métricas ao vivo atualizadas a cada 2,5 segundos',
    'monitoring.cpu.title': 'Uso de CPU',
    'monitoring.cpu.desc': 'Percentual de uso da CPU em tempo real com modelo do processador e contagem de threads — barra de progresso codificada por cores.',
    'monitoring.ram.title': 'Memória RAM',
    'monitoring.ram.desc': 'Monitora memória total, usada e livre com indicador percentual e footprint RSS do processo backend.',
    'monitoring.streams.title': 'Streams Ativos',
    'monitoring.streams.desc': 'Lista todos os processos FFmpeg ativos com IDs de câmeras e contagem de clientes conectados em tempo real.',
    'monitoring.uptime.title': 'Tempo de Atividade',
    'monitoring.uptime.desc': 'Exibe o uptime do SO host e do servidor VMS, junto com informações de plataforma e versão do OS.',

    // Stack
    'stack.tag': 'Stack Tecnológica',
    'stack.title': 'Construído com Tecnologias Modernas e Confiáveis',
    'stack.frontend': 'Frontend',
    'stack.backend': 'Backend',
    'stack.react': 'Vite + TypeScript',
    'stack.redux': 'Gerenciamento de estado global',
    'stack.tailwind': 'Glassmorphism + efeitos neon',
    'stack.i18n': 'Internacionalização completa',
    'stack.jsmpeg': 'Renderização de vídeo Canvas 2D',
    'stack.node': 'API REST + TypeScript',
    'stack.ws': 'Streaming binário de alta velocidade',
    'stack.ffmpeg': 'Transcodificação RTSP para MPEG-1',
    'stack.onvif': 'Protocolo SOAP ONVIF',
    'stack.security': 'Middleware de segurança',

    // Setup
    'setup.tag': 'Início Rápido',
    'setup.title': 'Em Funcionamento em Minutos',
    'setup.subtitle': 'Escolha entre o instalador automatizado para Windows ou a configuração manual via CLI',
    'setup.windows.title': 'Início Rápido no Windows',
    'setup.windows.sub': 'Scripts .bat automatizados — basta dar duplo clique',
    'setup.windows.step1.title': 'Clone o repositório',
    'setup.windows.step2.title': 'Execute scripts/setup-vms.bat',
    'setup.windows.step2.desc': 'Dê duplo clique no scripts/setup-vms.bat — instala dependências, verifica FFmpeg e configura o arquivo .env automaticamente.',
    'setup.windows.step3.title': 'Inicie com scripts/start-vms.bat',
    'setup.windows.step3.desc': 'Dê duplo clique no scripts/start-vms.bat — inicia ambos os servidores e abre o painel automaticamente em http://localhost:42100.',
    'setup.windows.step4.title': 'Encerre com scripts/stop-vms.bat',
    'setup.windows.step4.desc': 'Dê duplo clique no scripts/stop-vms.bat para encerrar todos os servidores e liberar as portas 42100, 42200 e 42300.',
    'setup.manual.title': 'Configuração Manual via CLI',
    'setup.manual.sub': 'Node.js v18+ e FFmpeg necessários',
    'setup.manual.prereqs': 'Pré-requisitos',
    'setup.manual.install': 'Instalação',
    'setup.manual.run': 'Executar',
    'setup.env.title': 'Variáveis de Ambiente (backend/.env)',
    'setup.env.port': 'Porta do servidor REST API',
    'setup.env.ws': 'Porta do servidor WebSocket',
    'setup.env.frontend': 'Porta do servidor de desenvolvimento Vite',
    'setup.env.user': 'Usuário padrão para descoberta de câmeras',
    'setup.env.pass': 'Senha padrão para descoberta de câmeras',
    'setup.env.ips': 'IPs de câmeras conhecidos, separados por vírgula',

    // Developer
    'dev.tag': 'Sobre o Desenvolvedor',
    'dev.title': 'Conheça o Criador',
    'dev.status': 'Aberto a oportunidades',
    'dev.role': 'Desenvolvedor Fullstack & Analista de Sistemas',
    'dev.bio': 'Com experiência em automação industrial e desenvolvimento web moderno, Bruno traz uma rara combinação de profundidade técnica e visão de produto em tudo o que constrói. Ele acredita que software deve ser elegante, eficiente e, acima de tudo, útil.',

    // CTA
    'cta.title': 'Pronto para Monitorar suas Câmeras?',
    'cta.desc': 'Gratuito, código aberto e self-hosted. Implante o VMS Monitor na sua rede em minutos.',
    'cta.github': 'Ver no GitHub',
    'cta.license': 'Código aberto · Licença MIT · Sem assinatura necessária',
  },

  es: {
    // Navbar
    'nav.features': 'Características',
    'nav.layouts': 'Diseños',
    'nav.monitoring': 'Monitoreo',
    'nav.setup': 'Instalación',
    'nav.developer': 'Desarrollador',
    'nav.github': 'GitHub',

    // Hero
    'hero.badge': 'Código Abierto · Gratuito · Self-hosted',
    'hero.title1': 'Panel de Vigilancia',
    'hero.title2': 'Cámaras IP',
    'hero.title3': 'Profesional',
    'hero.subtitle': 'Un VMS de alto rendimiento con autodescubrimiento ONVIF, transcodificación RTSP en tiempo real, múltiples diseños de cuadrícula, control PTZ, monitoreo de recursos y soporte multiidioma — en una interfaz moderna y elegante.',
    'hero.cta.github': 'Ver en GitHub',
    'hero.cta.explore': 'Explorar Características',
    'hero.stats.layouts': 'Diseños de Cuadrícula',
    'hero.stats.cameras': 'Cámaras Soportadas',
    'hero.stats.latency': 'Latencia del Stream',
    'hero.stats.languages': 'Idiomas',

    // Features
    'features.tag': 'Características Principales',
    'features.title': 'Todo lo que Necesitas para Vigilancia Profesional',
    'features.subtitle': 'Construido con una arquitectura moderna y escalable para implementaciones CCTV reales',
    'features.discovery.title': 'Autodescubrimiento Inteligente',
    'features.discovery.desc': 'Escanea automáticamente tu subred local en busca de dispositivos con el puerto RTSP 554 abierto, luego sondea las capacidades ONVIF en puertos HTTP comunes — sin configuración manual.',
    'features.streaming.title': 'Streaming de Ultra-Baja Latencia',
    'features.streaming.desc': 'FFmpeg transcodifica streams RTSP H.264 a MPEG-1 en tiempo real, entregando datos binarios vía WebSockets a un canvas renderizado por JSMpeg — latencia inferior a 0,5 segundos.',
    'features.grids.title': '5 Diseños de Cuadrícula Premium',
    'features.grids.desc': 'Cambia entre 5 diseños 16:9 matemáticamente perfectos — desde la cuadrícula compacta 2x2 hasta una matriz 4x4 completa con 16 feeds simultáneos.',
    'features.ptz.title': 'Control PTZ ONVIF',
    'features.ptz.desc': 'Controla Pan, Tilt y Zoom mediante un D-Pad interactivo con tres velocidades (Lento, Medio, Rápido) y parada automática de seguridad tras 500ms.',
    'features.dragdrop.title': 'Reorganización por Arrastrar y Soltar',
    'features.dragdrop.desc': 'Reorganiza las cámaras en tiempo real arrastrando las tarjetas en la cuadrícula. El nuevo orden se aplica instantáneamente y se persiste en la base de datos local.',
    'features.snapshot.title': 'Capturas Instantáneas',
    'features.snapshot.desc': 'Captura screenshots perfectas de cualquier stream en vivo — sin pantallas negras. Descarga desde el navegador con un solo clic.',
    'features.eco.title': 'Modo Ahorro de Recursos',
    'features.eco.desc': 'Activa el Modo Eco para pausar todos los streams activos y reducir drásticamente el uso de CPU/ancho de banda.',
    'features.i18n.title': 'Interfaz Multiidioma',
    'features.i18n.desc': 'Internacionalización completa con i18next. Interfaz disponible en inglés y portugués, con arquitectura lista para más idiomas.',
    'features.theme.title': 'Temas Oscuro y Claro',
    'features.theme.desc': 'Detecta automáticamente la preferencia del sistema operativo con el tema oscuro como alternativa. Cambia entre glassmorphism oscuro premium e interfaz clara en cualquier momento.',

    // Layouts
    'layouts.tag': 'Diseños de Cuadrícula',
    'layouts.title': 'Visualiza Cada Cámara, de Cada Forma',
    'layouts.subtitle': 'Cinco diseños 16:9 de precisión — desde vistas enfocadas hasta matrices de 16 cámaras',
    'layouts.tab.dark': 'Tema Oscuro',
    'layouts.tab.light': 'Tema Claro',
    'layouts.grid2x2.name': 'Cuadrícula Doble 2x2',
    'layouts.grid2x2.desc': '4 cámaras en celdas iguales — perfecto para monitoreo enfocado.',
    'layouts.grid3x3.name': 'Cuadrícula 3x3',
    'layouts.grid3x3.desc': '9 cámaras mostradas armónicamente — ideal para vigilancia de mediana escala.',
    'layouts.grid4x4.name': 'Alta Densidad 4x4',
    'layouts.grid4x4.desc': '16 feeds simultáneos — cobertura máxima para implementaciones a gran escala.',
    'layouts.spotlight3x3.name': 'Spotlight 3x3',
    'layouts.spotlight3x3.desc': '1 cámara ampliada 2x2 rodeada por 5 feeds satélites.',
    'layouts.spotlight4x4.name': 'Spotlight 4x4',
    'layouts.spotlight4x4.desc': 'Vista principal gigante 3x3 con 7 cámaras satélites.',

    // Camera List
    'list.tag': 'Gestión de Cámaras',
    'list.title': 'Panel de Control Completo',
    'list.desc': 'Gestiona toda tu flota de cámaras desde una vista de tabla unificada. Busca por nombre, IP o marca. Verifica el estado online/offline, inicia o detiene streams individuales.',
    'list.feature1': 'Insignias de estado online/offline en tiempo real',
    'list.feature2': 'Búsqueda por nombre, IP o fabricante',
    'list.feature3': 'Iniciar/desconectar stream con un clic',
    'list.feature4': 'Registro manual de cámaras con credenciales personalizadas',
    'list.feature5': 'Estadísticas en vivo (Total / Online / Offline)',

    // Monitoring
    'monitoring.tag': 'Monitoreo del Sistema',
    'monitoring.title': 'Panel de Recursos en Tiempo Real',
    'monitoring.subtitle': 'Mantén tu sistema saludable con métricas en vivo actualizadas cada 2,5 segundos',
    'monitoring.cpu.title': 'Uso de CPU',
    'monitoring.cpu.desc': 'Porcentaje de carga de CPU en tiempo real con modelo del procesador y conteo de hilos.',
    'monitoring.ram.title': 'Memoria RAM',
    'monitoring.ram.desc': 'Rastrea memoria total, usada y libre con indicador porcentual y huella RSS del proceso backend.',
    'monitoring.streams.title': 'Streams Activos',
    'monitoring.streams.desc': 'Lista todos los procesos FFmpeg activos con IDs de cámaras y conteo de clientes conectados.',
    'monitoring.uptime.title': 'Tiempo de Actividad',
    'monitoring.uptime.desc': 'Muestra el uptime del SO anfitrión y del servidor VMS junto con información de plataforma.',

    // Stack
    'stack.tag': 'Stack Tecnológico',
    'stack.title': 'Construido con Tecnologías Modernas y Probadas',
    'stack.frontend': 'Frontend',
    'stack.backend': 'Backend',
    'stack.react': 'Vite + TypeScript',
    'stack.redux': 'Gestión de estado global',
    'stack.tailwind': 'Glassmorphism + efectos neón',
    'stack.i18n': 'Internacionalización completa',
    'stack.jsmpeg': 'Renderizado de video Canvas 2D',
    'stack.node': 'API REST + TypeScript',
    'stack.ws': 'Streaming binario de alta velocidad',
    'stack.ffmpeg': 'Transcodificación RTSP a MPEG-1',
    'stack.onvif': 'Protocolo SOAP ONVIF',
    'stack.security': 'Middleware de seguridad',

    // Setup
    'setup.tag': 'Inicio Rápido',
    'setup.title': 'En Funcionamiento en Minutos',
    'setup.subtitle': 'Elige entre el instalador automatizado para Windows o la configuración manual vía CLI',
    'setup.windows.title': 'Inicio Rápido en Windows',
    'setup.windows.sub': 'Scripts .bat automatizados — solo haz doble clic',
    'setup.windows.step1.title': 'Clonar el repositorio',
    'setup.windows.step2.title': 'Ejecutar scripts/setup-vms.bat',
    'setup.windows.step2.desc': 'Doble clic en scripts/setup-vms.bat — instala dependencias, verifica FFmpeg y configura el archivo .env automáticamente.',
    'setup.windows.step3.title': 'Lanzar con scripts/start-vms.bat',
    'setup.windows.step3.desc': 'Doble clic en scripts/start-vms.bat — inicia ambos servidores y abre el panel automáticamente en http://localhost:42100.',
    'setup.windows.step4.title': 'Detener con scripts/stop-vms.bat',
    'setup.windows.step4.desc': 'Doble clic en scripts/stop-vms.bat para detener todos los servidores y liberar los puertos 42100, 42200 y 42300.',
    'setup.manual.title': 'Configuración Manual vía CLI',
    'setup.manual.sub': 'Node.js v18+ y FFmpeg requeridos',
    'setup.manual.prereqs': 'Prerrequisitos',
    'setup.manual.install': 'Instalación',
    'setup.manual.run': 'Ejecutar',
    'setup.env.title': 'Variables de Entorno (backend/.env)',
    'setup.env.port': 'Puerto del servidor REST API',
    'setup.env.ws': 'Puerto del servidor WebSocket',
    'setup.env.frontend': 'Puerto del servidor de desarrollo Vite',
    'setup.env.user': 'Usuario predeterminado para descubrimiento de cámaras',
    'setup.env.pass': 'Contraseña predeterminada para descubrimiento de cámaras',
    'setup.env.ips': 'IPs de cámaras conocidas, separadas por comas',

    // Developer
    'dev.tag': 'Sobre el Desarrollador',
    'dev.title': 'Conoce al Creador',
    'dev.status': 'Abierto a oportunidades',
    'dev.role': 'Desarrollador Fullstack y Analista de Sistemas',
    'dev.bio': 'Con experiencia en automatización industrial y desarrollo web moderno, Bruno aporta una rara combinación de profundidad técnica y visión de producto. Cree que el software debe ser elegante, eficiente y, sobre todo, útil.',

    // CTA
    'cta.title': '¿Listo para Monitorear tus Cámaras?',
    'cta.desc': 'Gratuito, código abierto y self-hosted. Despliega VMS Monitor en tu red en minutos.',
    'cta.github': 'Ver en GitHub',
    'cta.license': 'Código abierto · Licencia MIT · Sin suscripción requerida',
  }
};

// ============================================================
// STATE
// ============================================================
let currentLang = 'en';
let currentTheme = 'dark';

// ============================================================
// THEME
// ============================================================
function initTheme() {
  const saved = localStorage.getItem('vms-theme');
  if (saved) {
    currentTheme = saved;
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    currentTheme = prefersDark ? 'dark' : 'light';
  }
  applyTheme(currentTheme);
}

function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('vms-theme', theme);
}

function toggleTheme() {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

// ============================================================
// I18N
// ============================================================
function applyTranslations(lang) {
  currentLang = lang;
  const t = translations[lang] || translations['en'];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) {
      el.textContent = t[key];
    }
  });
  document.documentElement.lang = lang;
  localStorage.setItem('vms-lang', lang);
  // Update active lang button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
}

function initI18n() {
  const saved = localStorage.getItem('vms-lang');
  const lang = saved && translations[saved] ? saved : 'en';
  applyTranslations(lang);
}

// ============================================================
// NAVBAR SCROLL
// ============================================================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ============================================================
// LAYOUT TABS (Dark / Light screenshot)
// ============================================================
function initLayoutTabs() {
  const tabs = document.querySelectorAll('.layout-tab');
  const imgDark = document.getElementById('layoutImgDark');
  const imgLight = document.getElementById('layoutImgLight');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const layout = tab.getAttribute('data-layout');
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (layout === 'dark') {
        imgDark.classList.add('active');
        imgLight.classList.remove('active');
      } else {
        imgLight.classList.add('active');
        imgDark.classList.remove('active');
      }
    });
  });
}

// ============================================================
// COPY CODE BUTTONS
// ============================================================
const codeMap = {
  prereqs: 'code-prereqs',
  install: 'code-install',
  run: 'code-run'
};

function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-clipboard');
      const el = document.getElementById(`code-${key}`);
      if (!el) return;
      navigator.clipboard.writeText(el.textContent.trim()).then(() => {
        btn.classList.add('copied');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>`;
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.classList.remove('copied');
        }, 1800);
      }).catch(() => {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = el.textContent.trim();
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      });
    });
  });
}

// ============================================================
// INTERSECTION OBSERVER — Fade-in animation on scroll
// ============================================================
function initScrollAnimations() {
  const style = document.createElement('style');
  style.textContent = `
    .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.55s ease, transform 0.55s ease; }
    .reveal.visible { opacity: 1; transform: translateY(0); }
  `;
  document.head.appendChild(style);

  const targets = document.querySelectorAll(
    '.feature-card, .layout-card, .metric-card, .stack-group, .setup-card, .env-item, .developer-card'
  );

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 6) * 60}ms`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(el => observer.observe(el));
}

// ============================================================
// SMOOTH ANCHOR SCROLL (offset for navbar)
// ============================================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initI18n();
  initNavbar();
  initLayoutTabs();
  initCopyButtons();
  initScrollAnimations();
  initSmoothScroll();

  // Theme toggle button
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      applyTranslations(lang);
    });
  });

  // Listen for OS theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('vms-theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
});
