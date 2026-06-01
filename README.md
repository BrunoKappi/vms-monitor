# CamerasLive - VMS Dashboard

Um sistema profissional e de alto desempenho de **Video Management System (VMS)** para monitoramento e controle de câmeras IP em tempo real. Construído com uma arquitetura moderna e escalável, o **CamerasLive** realiza a descoberta dinâmica de câmeras ONVIF/RTSP em rede local, transcodifica fluxos RTSP em tempo real de forma ultra-eficiente e oferece uma interface limpa com grades geométricas perfeitas e controles PTZ responsivos.

---

## 🚀 Principais Recursos (Key Features)

### 1. 📐 Grades Geométricas Perfeitas com Proporção Estrita 16:9
A interface monitora os feeds de vídeo em contêineres calculados matematicamente para manter sempre a proporção **16:9** exata (widescreen), eliminando qualquer barra preta lateral (pillarbox) ou superior (letterbox). O sistema suporta **5 modos de grade premium**:
* **Duplo 2x2 (4 Câmeras):** 4 células iguais com preenchimento total.
* **Grid 3x3 (9 Câmeras):** 9 células iguais dispostas harmonicamente.
* **Grid 4x4 (16 Câmeras):** 16 células iguais de alta densidade.
* **Destaque 3x3 (1 Destaque 2x2 + 5 Satélites):** 1 tela ampliada centralizada cercada por 5 canais.
* **Destaque 4x4 (1 Destaque 3x3 + 7 Satélites):** 1 tela gigante em evidência cercada por 7 canais em formato de "L".

### 2. ⚡ Transcodificação Ultra-Eficiente com JSMpeg & WebSockets
Em vez de utilizar plugins pesados ou reprodutores proprietários lentos, o backend do **CamerasLive** faz o spawn sob demanda de processos filhos do **FFmpeg** para converter o fluxo RTSP H.264 para MPEG1 em tempo real, enviando o fluxo de dados binários via **WebSockets** diretamente para um elemento `<canvas>` renderizado no navegador via motor **JSMpeg Canvas 2D**, garantindo:
* Latência extremamente baixa (< 0.5s).
* Uso mínimo de CPU no cliente.
* Capturas de tela (snapshots) perfeitas sem telas pretas.

### 3. 🔍 Descoberta Dinâmica Inteligente (Dynamic Subnet Scan)
O sistema realiza varreduras ultra-rápidas na sub-rede local buscando dispositivos com a porta RTSP `554` aberta e, em seguida, sonda as capacidades ONVIF em portas HTTP comuns (`80`, `5000`, `8000`, `8080`, `8899`, `37777`), auto-resolvendo e configurando os canais automaticamente.

### 4. 🎮 Controle PTZ ONVIF Responsivo
A partir do painel ampliado de foco de qualquer câmera online, operadores podem acionar comandos de movimentação contínua de Pan & Tilt em tempo real por meio de um D-Pad interativo, com suporte a três níveis de sensibilidade de velocidade (Lento, Médio, Rápido) e interrupção failsafe automática após 500ms.

### 5. 🎛️ Reordenação por Arrastar e Soltar (Live Drag & Drop)
Reorganize facilmente a disposição das suas câmeras arrastando qualquer card para outra posição. A nova ordem das imagens atualiza na hora e é persistida no banco de dados local imediatamente.

---

## 🛠️ Stack Tecnológica

### Frontend:
* **React 18** (Vite + TypeScript)
* **Redux Toolkit** (Gerenciamento de estado global)
* **TailwindCSS** (Estilização premium com efeitos de glassmorphism e neon)
* **i18next** (Suporte à internacionalização completa)
* **Lucide React** (Pacote de ícones vetoriais modernos)

### Backend:
* **Node.js** (TypeScript)
* **Express** (API REST robusta)
* **ws** (Servidor de WebSockets de alta velocidade para dados binários)
* **fluent-ffmpeg** (Orquestração do processo de transcodificação binária)
* **@2bad/onvif** (Protocolo ONVIF para handshakes e comandos de movimentação de soquete SOAP)

---

## 📦 Estrutura do Código (Clean N-Tier Architecture)

O projeto segue um padrão rígido de **Domain-Driven Design (DDD)** no frontend e **N-Tier (Controller-Service-Repository)** no backend:

```txt
CamerasLive/
├── frontend/                 # Aplicação React
│   ├── src/
│   │   ├── modules/
│   │   │   └── Dashboard/    # Domínio principal do VMS
│   │   │       ├── components/
│   │   │       ├── hooks/
│   │   │       ├── pages/
│   │   │       ├── services/
│   │   │       └── store/
├── backend/                  # Servidor de Transcodificação & API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── routes/
│   │   └── server.ts
```

---

## 🚀 Como Rodar o Projeto (Passo a Passo)

### 📋 Pré-requisitos:
1. **Node.js** v18+ instalado.
2. **FFmpeg** instalado na máquina e adicionado às variáveis de ambiente (PATH).
   - *No Windows:* Baixe o FFmpeg, extraia a pasta, copie o caminho da subpasta `bin` (ex: `C:\ffmpeg\bin`) e adicione-o às Variáveis de Ambiente do Sistema em "Path".
   - *No Linux/macOS:* Instale via gerenciador de pacotes (`sudo apt install ffmpeg` ou `brew install ffmpeg`).

---

### 💻 Passo a Passo via CMD (Após Clonar o Repositório)

Se você acabou de clonar o repositório, abra o seu terminal (**CMD** ou **PowerShell**) e execute as etapas abaixo em ordem para configurar e inicializar a central de monitoramento:

1. **Navegue até a pasta do projeto:**
   ```cmd
   cd CamerasLive
   ```

2. **Instale as dependências da raiz (Workspace):**
   ```cmd
   npm install
   ```

3. **Instale as dependências de todos os submódulos (Frontend + Backend):**
   ```cmd
   npm run install-all
   ```

4. **Inicie os servidores integrados (Vite + Express em paralelo):**
   ```cmd
   npm run dev
   ```

5. **Acesse o painel do VMS no navegador:**
   Abra seu navegador e acesse: [http://localhost:42100](http://localhost:42100)

---

### ⚡ Inicialização Automatizada no Windows (Recomendado)

Para usuários do Windows, criamos scripts automatizados em lote (`.bat`) que facilitam e agilizam todo o processo:

1. **[setup-vms.bat](file:///c:/Users/Bruno/Desktop/Projetos/Pessoais/CamerasLive/setup-vms.bat) (Executar apenas na primeira vez):**
   Dê um duplo clique neste arquivo para verificar os pré-requisitos do sistema (Node.js e FFmpeg) e instalar automaticamente todas as dependências necessárias para a raiz e submódulos do projeto.
2. **[start-vms.bat](file:///c:/Users/Bruno/Desktop/Projetos/Pessoais/CamerasLive/start-vms.bat) (Executar para rodar o projeto):**
   Dê um duplo clique para iniciar os servidores integrados em segundo plano e abrir automaticamente a interface do **CamerasLive** em seu navegador padrão.
3. **[stop-vms.bat](file:///c:/Users/Bruno/Desktop/Projetos/Pessoais/CamerasLive/stop-vms.bat) (Executar para desligar o projeto):**
   Dê um duplo clique para parar instantaneamente todos os servidores e processos de transcodificação de streams ativos, liberando as portas de rede do seu PC (`42100`, `42200` e `42300`).
