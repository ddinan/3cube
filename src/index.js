import net from 'net'
import Packet from './packets.js'

// === CONFIGURATION ===
const host = '127.0.0.1'
const port = 25560
const username = '3Cube'
const verificationKey = '12345' // (depends on server config)

const client = new net.Socket()
Packet.setClient(client)

client.connect(port, host, () => {
  console.log(`Connected to server at ${host}:${port}`)
  Packet.sendIdentification(username, verificationKey)
  Packet.sendChat('Hello, I am a bot!')
})

client.on('data', (data) => {
  const packetId = data.readUInt8(0)

  switch (packetId) {
    case 0x00:
      console.log('Server Identification')
      break
    case 0x01:
      console.log('Ping')
      break
    case 0x02:
      console.log('Level Initialize')
      break
    case 0x03:
      console.log('Level Data Chunk')
      break
    case 0x04:
      console.log('Level Finalize')
      break
    case 0x06:
      console.log('Set Block')
      break
    case 0x07:
      console.log('Spawn Player')
      break
    case 0x08:
      console.log('Set Position and Orientation (TP)')
      break
    case 0x09:
      console.log('Position and Orientation Update')
      break
    case 0x0a:
      console.log('Position update')
      break
    case 0x0b:
      console.log('Orientation update')
      break
    case 0x0c:
      console.log('Despawn player')
      break
    case 0x0d:
      console.log('Chat Message')
      const msg = data.toString('utf8', 2, 66).trim() // Skip 2 bytes (ID + player ID)
      console.log('Message:', msg)
      break
    case 0x0e:
      console.log('Disconnected:', data.toString('utf8', 1, 65).trim())
      break
    case 0x0f:
      console.log('Update user type')
      break
    default:
      console.log('Unknown packet ID:', packetId, data)
  }
})

client.on('close', () => {
  console.log('Connection closed.')
})

client.on('error', (err) => {
  console.error('Error:', err)
})
