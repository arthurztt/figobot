import makeWASocket, {useMultiFileAuthState, DisconnectReason} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom'
import qrdcode from 'qrcode-terminal'

const { state, saveCreds } = await useMultiFileAuthState('auth_info')
const sock = makeWASocket({ auth: state })
sock.ev.on('creds-update', saveCreds)
sock.ev.on('connection.update', ({ qr }) => qr && qrcode.generate(qr, { small: true }))


// Teste de mensagens pelo Baileys
sock.ev.on('connection.update', ({ connection }) => {
  if (connection === 'open') {
    sock.sendMessage('1234567890@s.whatsapp.net', { text: 'Hello from Baileys' })
  }
})