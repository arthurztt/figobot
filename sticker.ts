import sharp from 'sharp'

export type Mode = 'f' | 'q'

export async function imageToSticker(buf: Buffer, mode: Mode = 'f') {
  const opts = 
    mode === 'q'
      ? { fit: 'cover' as const }
      : { fit: 'contain' as const, background: { r: 0, g: 0, b: 0, alpha: 0 } }

  return sharp(buf).resize(512, 512, opts).webp({ quality: 80 }).toBuffer()
}
