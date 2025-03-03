#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Creating jsNES-compatible ROM...');

// Paths
const chrPath = path.join(__dirname, '../src/asm/sprites.chr');
const asmPath = path.join(__dirname, '../src/asm/PongTwoPlayer.nes');
const outputPath = path.join(__dirname, '../public/roms/pong.nes');

// Ensure the output directory exists
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

// Read the assembled code
let prgData;
try {
  prgData = fs.readFileSync(asmPath);
  console.log(`Read assembled code: ${asmPath} (${prgData.length} bytes)`);
  
  // Skip any existing header if present
  if (prgData.length >= 16 && 
      prgData[0] === 0x4E && prgData[1] === 0x45 && 
      prgData[2] === 0x53 && prgData[3] === 0x1A) {
    console.log('Detected existing iNES header, will strip it');
    prgData = prgData.slice(16);
  }
} catch (error) {
  console.error(`Failed to read PRG data: ${error.message}`);
  process.exit(1);
}

// Read CHR data
let chrData;
try {
  chrData = fs.readFileSync(chrPath);
  console.log(`Read CHR data: ${chrPath} (${chrData.length} bytes)`);
} catch (error) {
  console.error(`Failed to read CHR data: ${error.message}`);
  process.exit(1);
}

// Create a new ROM file from scratch
const createRom = () => {
  // Calculate sizes and padding needed
  const headerSize = 16;
  const prgSize = 16384; // 16KB
  const chrSize = 8192;  // 8KB
  const totalSize = headerSize + prgSize + chrSize;
  
  // Create buffer
  const romBuffer = Buffer.alloc(totalSize, 0);
  
  // Write iNES header - exactly as jsNES expects it
  romBuffer[0] = 0x4E; // 'N'
  romBuffer[1] = 0x45; // 'E'
  romBuffer[2] = 0x53; // 'S'
  romBuffer[3] = 0x1A; // EOF
  romBuffer[4] = 0x01; // 1x 16KB PRG ROM
  romBuffer[5] = 0x01; // 1x 8KB CHR ROM
  romBuffer[6] = 0x01; // Flags 6: Vertical mirroring, no battery, mapper lower bits
  romBuffer[7] = 0x00; // Flags 7: Mapper upper bits all 0
  // Bytes 8-15 should be zero for iNES 1.0 compatibility
  
  // Copy PRG data with padding if needed
  const prgDataToCopy = Math.min(prgData.length, prgSize);
  prgData.copy(romBuffer, headerSize, 0, prgDataToCopy);
  console.log(`Copied ${prgDataToCopy} bytes of PRG data`);
  
  // If PRG data is smaller than 16KB, pad with zeros
  if (prgDataToCopy < prgSize) {
    console.log(`Padding PRG data with ${prgSize - prgDataToCopy} bytes of zeros`);
  }
  
  // Copy CHR data with padding if needed
  const chrDataToCopy = Math.min(chrData.length, chrSize);
  chrData.copy(romBuffer, headerSize + prgSize, 0, chrDataToCopy);
  console.log(`Copied ${chrDataToCopy} bytes of CHR data`);
  
  // If CHR data is smaller than 8KB, pad with zeros
  if (chrDataToCopy < chrSize) {
    console.log(`Padding CHR data with ${chrSize - chrDataToCopy} bytes of zeros`);
  }
  
  return romBuffer;
};

// Create and write the ROM
const rom = createRom();
fs.writeFileSync(outputPath, rom);
console.log(`jsNES-compatible ROM created at ${outputPath} (${rom.length} bytes)`);

// Debug output of header bytes for verification
console.log('ROM header bytes:');
for (let i = 0; i < 16; i++) {
  console.log(`Byte ${i}: 0x${rom[i].toString(16).padStart(2, '0')}`);
}

console.log('ROM creation completed successfully!'); 