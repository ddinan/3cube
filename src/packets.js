import * as utils from './utils.js'

let client = null

function setClient (socket) {
  client = socket
}

function sendPacket (packetId, parts) {
  // Calculate buffer length: 1 byte for ID + length of all parts
  const totalLength = 1 + parts.reduce((sum, buf) => sum + buf.length, 0)

  const packet = Buffer.alloc(totalLength) // Create a Buffer of the full packet size
  packet.writeUInt8(packetId, 0) // Write the packet ID at the start

  // Copy each part sequentially after the packet ID
  let offset = 1
  for (const part of parts) {
    part.copy(packet, offset)
    offset += part.length
  }

  client.write(packet)
}
function sendIdentification (username, verificationKey) {
  sendPacket(0x00, [
    utils.writeByte(0x07),
    utils.writePaddedString(username),
    utils.writePaddedString(verificationKey),
    utils.writeByte(0x00)
  ])
}

function sendSetBlock (x, y, z, mode, blockType) {
  sendPacket(0x05, [
    utils.writeShort(x),
    utils.writeShort(y),
    utils.writeShort(z),
    utils.writeByte(mode),
    utils.writeByte(blockType)
  ])
}

function sendPosition (x, y, z, yaw, pitch) {
  sendPacket(0x08, [
    utils.writeSByte(0xFF),
    utils.writeFShort(x),
    utils.writeFShort(y),
    utils.writeFShort(z),
    utils.writeByte(yaw),
    utils.writeByte(pitch)
  ])
}

function sendChat (msg) {
  sendPacket(0x0d, [
    utils.writeSByte(0xFF),
    utils.writePaddedString(msg)
  ])
}

export default {
  setClient,
  sendIdentification,
  sendSetBlock,
  sendPosition,
  sendChat
}
