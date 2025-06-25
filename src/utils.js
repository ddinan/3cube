export function writeByte (n) {
  return Buffer.from([n])
}

export function writeSByte (n) {
  return Buffer.from([n & 0xFF])
}

export function writeShort (n) {
  const buf = Buffer.alloc(2)
  buf.writeInt16BE(n, 0)
  return buf
}

export function writeFShort (n) {
  // Multiply by 32, round, then write as signed short
  return writeShort(Math.round(n * 32))
}

export function writeFByte (n) {
  return writeSByte(Math.round(n * 32))
}

export function writePaddedString (str) {
  const buf = Buffer.alloc(64, 0x20) // Space padded
  Buffer.from(str, 'utf8').copy(buf)
  return buf
}
