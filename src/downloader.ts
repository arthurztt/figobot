import { execFile } from "child_process";
import { promisify } from "util";
import { tmpdir } from "os";
import { join } from "path";
import { mkdtemp, readdir, readFile, rm } from "fs/promises";

const run = promisify(execFile);

export async function downloadMediaFromUrl(url: string): Promise<{ buffer: Buffer; isVideo: boolean }> {
  // Cria um diretorio temporário
  const tempDir = await mkdtemp(join(tmpdir(), 'figobot'));

  try {
    // --no-playlist: Evita baixar a playlist inteira do YT
    // -f: Limita a 720p
    // --max-filesize: Trava de segurança em 20MB
    const args = [
      '--no-playlist',
      '-f', 'b[ext=mp4][height<=720]/b',
      '--max-filesize', '20M',
      '-o', join(tempDir, 'media.%(ext)s'),
      url
    ];

    await run('yt-dlp', args);

    const files = await readdir(tempDir);
    if (files.length === 0) {
      throw new Error('Nenhum arquivo foi baixado');
    }

    const filePath = join(tempDir, files[0]);
    const buffer = await readFile(filePath);

    //Checagem de extensão da midia
    const isVideo = /\.(mp4|webm|mkv|avi|mov$/i.test(files[0]);

    return { buffer, isVideo };
  } catch (error) {
    console.log('Erro no Download via yt-dlp:', error);
    throw new Error('Falha ao baixar a mídia. Verifique se o link é válidoo ou se a mídia é privada. ')
  } finally {
    // Limpeza da pasta tempDir
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}