# 📸 Figobot
![Demonstração](./assets/test.mp4)

O **Figobot** é um bot de WhatsApp desenvolvido em TypeScript focado em criar figurinhas (stickers) de forma rápida e prática. Ele aceita imagens, vídeos e até mesmo **links** de redes sociais (como YouTube e Twitter/X), convertendo-os automaticamente para o formato WebP exigido pelo WhatsApp.

## 🚀 Funcionalidades

- **Conversão Direta**: Envie ou responda a uma imagem/vídeo com um comando para gerar a figurinha.
- **Suporte a Links**: Envie um link do YouTube, Twitter/X, Instagram, etc., acompanhado do comando, e o bot fará o download e a conversão.
- **Otimização de Mídia**: Redimensionamento inteligente e compressão automática para garantir que a figurinha não exceda o limite de tamanho do WhatsApp (500 KB).
- **Modos de Recorte**:
  - `/s` (**Fit**): Mantém a proporção original da mídia, adicionando fundo transparente (padding) nas sobras.
  - `/q` (**Crop**): Recorta a mídia no centro para criar um quadrado perfeito, preenchendo todo o espaço da figurinha.

## 🛠️ Tecnologias Utilizadas

- **[Node.js](https://nodejs.org/)** & **[TypeScript](https://www.typescriptlang.org/)**: Ambiente de execução e linguagem base.
- **[Baileys](https://github.com/WhiskeySockets/Baileys)**: Biblioteca para interação com o WhatsApp Web.
- **[Sharp](https://sharp.pixelplumbing.com/)**: Processamento e conversão de imagens de alta performance.
- **[FFmpeg](https://ffmpeg.org/)**: Processamento e conversão de vídeos.
- **[yt-dlp](https://github.com/yt-dlp/yt-dlp)**: Download de mídias a partir de URLs.

## 📋 Pré-requisitos

Para rodar o Figobot na sua máquina, você precisará ter instalado:

1. **Node.js** (v20 ou superior)
2. **FFmpeg** (necessário para a conversão de vídeos)
3. **yt-dlp** (necessário para baixar mídias de links)

### Instalando as dependências no Linux (Fedora)
```bash
# Habilita o RPM Fusion (necessário para o FFmpeg completo)
sudo dnf install https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm https://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm

# Instala o FFmpeg e o yt-dlp
sudo dnf install ffmpeg yt-dlp