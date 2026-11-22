import sharp from 'sharp'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { randomUUID } from 'crypto'
import { tmpdir } from 'os'
import { join } from 'path' 
import { readFile, writeFile, rm } from 'fs/promises'

export type Mode = 'f' | 'q'

const run = promisify(execFile)

const videoFilters: Record<Mode, string> = {
  q: "crop='min(iw,ih)':'min(iw,ih)', scale=512:512",
  f: 'scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:-1:-1:color=#00000000'
}

const MAX_BYTES = 500 * 1024
// tenta qualidade menores até caber no limite do whatsapp
const attempts = [
  { q: 50, fps: 15 },
  { q: 30, fps: 12 },
  { q: 20, fps: 10 }
]

export async function imageToSticker(buf: Buffer, mode: Mode = 'f') {
  const opts = 
    mode === 'q'
      ? { fit: 'cover' as const }
      : { fit: 'contain' as const, background: { r: 0, g: 0, b: 0, alpha: 0 } }

  return sharp(buf).resize(512, 512, opts).webp({ quality: 80 }).toBuffer()
}

export async function videoToSticker(buf: Buffer, mode: Mode = 'f') {
  const id = randomUUID()
  const input = join(tmpdir(), `${id}.mp4`)
  const output = join(tmpdir(), `${id}.webp`)
  await writeFile(input, buf)

  try {
    let result = Buffer.alloc(0)
    for (const a of attempts) {
      await run('ffmpeg', [
        '-y', '-i', input,
        '-t', '6',
        '-vf', `${videoFilters[mode]}, fps=${a.fps}`,
        '-c:v', 'libwebp',
        '-q:V', String(a.q),
        '-loop', '0',
        '-an',
        output
      ])
      result = await readFile(output)
      if (result.length <= MAX_BYTES) break
    }
    return result
  } finally {
    await rm(input, { force: true })
    await rm(output, { force: true })
  }
}

