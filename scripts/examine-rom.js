#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to the ROM file
const romPath = path.join(__dirname, '../public/roms/pong.nes');

console.log(`Examining ROM file: ${romPath}`);

try {
  // Read the ROM file
  const romData = fs.readFileSync(romPath);
  console.log(`ROM size: ${romData.length} bytes`);

  // Check if it has a valid iNES header
  if (romData.length < 16 || 
      romData[0] !== 0x4E || romData[1] !== 0x45 || 
      romData[2] !== 0x53 || romData[3] !== 0x1A) {
    console.error('ERROR: Invalid iNES header');
    process.exit(1);
  }

  // Print header information
  console.log('\niNES Header Information:');
  console.log(`Magic: ${String.fromCharCode(romData[0], romData[1], romData[2])} ${romData[3].toString(16)}`);
  console.log(`PRG ROM: ${romData[4]} x 16KB (${romData[4] * 16}KB)`);
  console.log(`CHR ROM: ${romData[5]} x 8KB (${romData[5] * 8}KB)`);
  
  // Parse flags 6
  const flags6 = romData[6];
  console.log(`\nFlags 6: ${flags6.toString(16).padStart(2, '0')} (${flags6.toString(2).padStart(8, '0')})`);
  console.log(`Mirroring: ${(flags6 & 0x01) ? 'Vertical' : 'Horizontal'}`);
  console.log(`Battery-backed RAM: ${(flags6 & 0x02) ? 'Yes' : 'No'}`);
  console.log(`Trainer: ${(flags6 & 0x04) ? 'Yes' : 'No'}`);
  console.log(`4-screen VRAM: ${(flags6 & 0x08) ? 'Yes' : 'No'}`);
  console.log(`Mapper (lower nibble): ${(flags6 >> 4).toString(16)}`);
  
  // Parse flags 7
  const flags7 = romData[7];
  console.log(`\nFlags 7: ${flags7.toString(16).padStart(2, '0')} (${flags7.toString(2).padStart(8, '0')})`);
  console.log(`VS Unisystem: ${(flags7 & 0x01) ? 'Yes' : 'No'}`);
  console.log(`PlayChoice-10: ${(flags7 & 0x02) ? 'Yes' : 'No'}`);
  console.log(`NES 2.0 format: ${(flags7 & 0x0C) === 0x08 ? 'Yes' : 'No'}`);
  console.log(`Mapper (upper nibble): ${(flags7 >> 4).toString(16)}`);
  
  // Calculate mapper number
  const mapper = ((flags7 & 0xf0) | (flags6 >> 4));
  console.log(`\nMapper number: ${mapper}`);
  
  // Check for trainer
  const hasTrainer = (flags6 & 0x04) !== 0;
  const trainerOffset = hasTrainer ? 512 : 0;
  
  // Calculate offsets
  const headerSize = 16;
  const prgRomSize = romData[4] * 16 * 1024;
  const chrRomSize = romData[5] * 8 * 1024;
  
  const prgRomStart = headerSize + trainerOffset;
  const prgRomEnd = prgRomStart + prgRomSize;
  const chrRomStart = prgRomEnd;
  const chrRomEnd = chrRomStart + chrRomSize;
  
  console.log('\nROM Layout:');
  console.log(`Header: bytes 0-${headerSize - 1} (${headerSize} bytes)`);
  if (hasTrainer) {
    console.log(`Trainer: bytes ${headerSize}-${prgRomStart - 1} (512 bytes)`);
  }
  console.log(`PRG ROM: bytes ${prgRomStart}-${prgRomEnd - 1} (${prgRomSize} bytes)`);
  console.log(`CHR ROM: bytes ${chrRomStart}-${chrRomEnd - 1} (${chrRomSize} bytes)`);
  
  // Verify file size matches expected size
  const expectedSize = headerSize + trainerOffset + prgRomSize + chrRomSize;
  console.log(`\nExpected file size: ${expectedSize} bytes`);
  console.log(`Actual file size: ${romData.length} bytes`);
  
  if (romData.length !== expectedSize) {
    console.warn(`WARNING: File size mismatch. Expected ${expectedSize}, got ${romData.length}`);
    console.log(`Difference: ${romData.length - expectedSize} bytes`);
  }
  
  // Check for common issues with jsNES compatibility
  console.log('\nChecking for jsNES compatibility issues:');
  
  // Check if the ROM size is a power of 2
  function isPowerOfTwo(x) {
    return (x & (x - 1)) === 0;
  }
  
  if (!isPowerOfTwo(prgRomSize)) {
    console.warn('WARNING: PRG ROM size is not a power of 2, which can cause issues with some emulators');
  }
  
  if (!isPowerOfTwo(chrRomSize)) {
    console.warn('WARNING: CHR ROM size is not a power of 2, which can cause issues with some emulators');
  }
  
  // Check first 100 bytes of PRG ROM for debugging
  console.log('\nFirst 32 bytes of PRG ROM:');
  for (let i = 0; i < 32 && prgRomStart + i < romData.length; i++) {
    process.stdout.write(romData[prgRomStart + i].toString(16).padStart(2, '0') + ' ');
    if ((i + 1) % 16 === 0) process.stdout.write('\n');
  }
  console.log('\n');
  
  // jsNES specific checks
  const validMappers = [0, 1, 2, 3, 4, 7, 9, 10];
  if (!validMappers.includes(mapper)) {
    console.warn(`WARNING: Mapper ${mapper} may not be supported by jsNES`);
  }
  
  console.log('\nROM examination complete');
  
} catch (error) {
  console.error(`Error examining ROM: ${error.message}`);
  process.exit(1);
} 