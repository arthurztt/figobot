import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  downloadMediaMessage,
  type WAMessage,
} from '@whiskeysockets/baileys';
import { imageToSticker, videoToSticker, type Mode } from './sticker.js';
import { Boom } from '@hapi/boom'
import qrcode from 'qrcode-terminal'

async function connectToWhatsapp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
  
  const sock = makeWASocket({
    auth: state
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update
    if (qr) {
      qrcode.generate(qr, { small: true })
    }
    if (connection === 'close') {
      const shouldReconnect = 
        (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('connection closed due to', lastDisconnect?.error, ', reconnecting', shouldReconnect)
      if (shouldReconnect) {
        connectToWhatsapp()
      }
    } else if (connection === 'open') {
      console.log('opened connection')
    }
  })

  sock.ev.on('messages.upsert', async (event) => {
    if (event.type !== 'notify') return
    for (const m of event.messages) {
      if (m.key.fromMe || !m.key.remoteJid) continue

      const cmd = getText(m).trim().split(/\s+/)[0].toLowerCase()
      const mode = commands[cmd]
      if (!mode) continue

      const media = getMedia(m)
      if (!media) {
        await sock.sendMessage(m.key.remoteJid, { text: 'Envie ou responda uma imagem/video com o comando. (/s)' }, { quoted: m })
        continue
      }

      try {
        const buffer = (await downloadMediaMessage(media.msg, 'buffer', {})) as Buffer

        if (media.kind === 'image') {
          const webp = await imageToSticker(buffer, mode)
          await sock.sendMessage(m.key.remoteJid, { sticker: webp }, { quoted: m })
        } else if (media.kind === 'video') {
          const webp = await videoToSticker(buffer, mode)
          await sock.sendMessage(m.key.remoteJid, { sticker : webp }, { quoted: m })
        }
            } catch (err) {
              console.error(err)
              await sock.sendMessage(m.key.remoteJid, { text: 'Não consegui criar a figurinha.'}, { quoted: m })
            }
          }
  })

  sock.ev.on('creds.update', saveCreds)
}

function getText(m: WAMessage): string {
  const msg = m.message
  return (
    msg?.conversation ??
    msg?.extendedTextMessage?.text ??
    msg?.imageMessage?.caption ??
    msg?.videoMessage?.caption ??
    ''
  )
}

// acha a mídia na própria mensagem ou na mensagem respondida
function getMedia(m: WAMessage): { kind: 'image' | 'video'; msg: WAMessage } | null {
  const msg = m.message
  if (msg?.imageMessage) return { kind: 'image', msg: m }
  if (msg?.videoMessage) return { kind: 'video', msg: m }

  const quoted = msg?.extendedTextMessage?.contextInfo?.quotedMessage
  if (quoted?.imageMessage) return { kind: 'image', msg: { key: m.key, message: quoted } as WAMessage }
  if (quoted?.videoMessage) return { kind: 'video', msg: { key: m.key, message: quoted } as WAMessage }
  return null
}

const commands: Record<string, Mode> = { '/s': 'f', '/q': 'q' }

connectToWhatsapp()



