#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Paths
const srcRomPath = path.join(__dirname, '../src/asm/PongTwoPlayer.nes');
const destRomPath = path.join(__dirname, '../public/roms/pong.nes');

console.log('Fixing ROM header for jsNES compatibility...');

// Ensure directories exist
const destDir = path.dirname(destRomPath);
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Read the ROM file
let romData;
try {
  romData = fs.readFileSync(srcRomPath);
  console.log(`Read ROM file: ${srcRomPath} (${romData.length} bytes)`);
} catch (error) {
  console.error(`Failed to read ROM file: ${error.message}`);
  process.exit(1);
}

// Create a new ROM with proper iNES header
const newRom = Buffer.alloc(romData.length < 16 ? romData.length + 16 : romData.length);

// Add iNES header (ensuring it's exactly right for jsNES)
newRom[0] = 0x4E; // 'N'
newRom[1] = 0x45; // 'E'
newRom[2] = 0x53; // 'S'
newRom[3] = 0x1A; // MS-DOS EOF
newRom[4] = 0x01; // 1 PRG ROM (16KB)
newRom[5] = 0x01; // 1 CHR ROM (8KB)
newRom[6] = 0x01; // Mapper 0, vertical mirroring
newRom[7] = 0x00; // Mapper 0 (continued)
// Padding
newRom[8] = 0x00;
newRom[9] = 0x00;
newRom[10] = 0x00;
newRom[11] = 0x00;
newRom[12] = 0x00;
newRom[13] = 0x00;
newRom[14] = 0x00;
newRom[15] = 0x00;

// Copy the ROM data, skipping any existing header
const dataOffset = romData[0] === 0x4E && romData[1] === 0x45 && romData[2] === 0x53 && romData[3] === 0x1A ? 16 : 0;
romData.copy(newRom, 16, dataOffset);

// Write the fixed ROM
fs.writeFileSync(destRomPath, newRom);
console.log(`Fixed ROM written to: ${destRomPath} (${newRom.length} bytes)`);

// CHR file handling - make sure it's directly included
const chrPath = path.join(__dirname, '../src/asm/sprites.chr');
if (fs.existsSync(chrPath)) {
  const chrData = fs.readFileSync(chrPath);
  console.log(`Read CHR file: ${chrPath} (${chrData.length} bytes)`);
  
  // CHR data should be immediately after the PRG data in the ROM
  // For jsNES, we need to make sure it's positioned correctly
  // PRG data is after header (16 bytes) + 16K (16384 bytes) = 16400
  // Ensure the ROM is large enough
  const fullRomSize = 16 + 16384 + 8192; // Header + PRG + CHR
  const fullRom = Buffer.alloc(fullRomSize);
  
  // Copy the header and PRG data
  newRom.copy(fullRom, 0, 0, Math.min(newRom.length, 16 + 16384));
  
  // Copy the CHR data
  chrData.copy(fullRom, 16 + 16384, 0, Math.min(chrData.length, 8192));
  
  // Write the final ROM with PRG + CHR
  fs.writeFileSync(destRomPath, fullRom);
  console.log(`Final ROM with CHR data written to: ${destRomPath} (${fullRom.length} bytes)`);
}

console.log('ROM fix completed successfully!'); 