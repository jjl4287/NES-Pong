const fs = require('fs-extra');
const path = require('path');

// Paths
const srcRomPath = path.join(__dirname, '../src/asm/PongTwoPlayer.nes');
const destRomPath = path.join(__dirname, '../public/roms/pong.nes');

console.log('Creating jsNES-compatible ROM...');

// Ensure directories exist
fs.ensureDirSync(path.dirname(destRomPath));

// Read the ROM file
let romData;
try {
  romData = fs.readFileSync(srcRomPath);
  console.log(`Read ROM file: ${srcRomPath} (${romData.length} bytes)`);
} catch (error) {
  console.error(`Failed to read ROM file: ${error.message}`);
  process.exit(1);
}

// Check if the ROM already has an iNES header
const hasHeader = romData.length >= 16 && 
                 romData[0] === 0x4E && romData[1] === 0x45 && 
                 romData[2] === 0x53 && romData[3] === 0x1A;

// Extract PRG and CHR data from the ROM
let prgData, chrData;
if (hasHeader) {
  // Skip the 16-byte header to get the PRG data
  console.log('ROM has an iNES header, extracting PRG and CHR data...');
  
  // Get PRG and CHR sizes from the header
  const prgSize = romData[4] * 16384; // 16KB units
  const chrSize = romData[5] * 8192;  // 8KB units
  
  // Extract the data
  prgData = Buffer.alloc(prgSize);
  romData.copy(prgData, 0, 16, 16 + prgSize);
  
  if (chrSize > 0) {
    chrData = Buffer.alloc(chrSize);
    romData.copy(chrData, 0, 16 + prgSize, 16 + prgSize + chrSize);
  } else {
    console.log('No CHR data in ROM, looking for separate sprites.chr file');
    try {
      const chrPath = path.join(__dirname, '../src/asm/sprites.chr');
      chrData = fs.readFileSync(chrPath);
      console.log(`Read CHR file: ${chrPath} (${chrData.length} bytes)`);
    } catch (error) {
      console.error(`Failed to read CHR file: ${error.message}`);
      // Create an empty CHR ROM to ensure compatibility
      chrData = Buffer.alloc(8192);
    }
  }
} else {
  console.warn('ROM does not have an iNES header, assuming it\'s just PRG data');
  // Assume the entire file is PRG data
  prgData = Buffer.from(romData);
  
  // Look for CHR data in a separate file
  try {
    const chrPath = path.join(__dirname, '../src/asm/sprites.chr');
    chrData = fs.readFileSync(chrPath);
    console.log(`Read CHR file: ${chrPath} (${chrData.length} bytes)`);
  } catch (error) {
    console.error(`Failed to read CHR file: ${error.message}`);
    // Create an empty CHR ROM to ensure compatibility
    chrData = Buffer.alloc(8192);
  }
}

// Ensure the PRG data is a multiple of 16KB (pad if necessary)
if (prgData.length % 16384 !== 0) {
  const paddedSize = Math.ceil(prgData.length / 16384) * 16384;
  const oldSize = prgData.length;
  const newPrgData = Buffer.alloc(paddedSize, 0);
  prgData.copy(newPrgData);
  prgData = newPrgData;
  console.log(`Padded PRG data from ${oldSize} to ${paddedSize} bytes`);
}

// Ensure the CHR data is at least 8KB
if (!chrData || chrData.length < 8192) {
  const oldSize = chrData ? chrData.length : 0;
  const newChrData = Buffer.alloc(8192, 0);
  if (chrData) {
    chrData.copy(newChrData);
  }
  chrData = newChrData;
  console.log(`Padded CHR data from ${oldSize} to 8192 bytes`);
}

// Create a new ROM with a proper iNES header
const prgBanks = Math.floor(prgData.length / 16384);
const chrBanks = Math.floor(chrData.length / 8192);

console.log(`Creating ROM with ${prgBanks} PRG banks and ${chrBanks} CHR banks`);

// Create the header
const header = Buffer.alloc(16);
header[0] = 0x4E; // 'N'
header[1] = 0x45; // 'E'
header[2] = 0x53; // 'S'
header[3] = 0x1A; // MS-DOS EOF

header[4] = prgBanks; // PRG ROM size in 16KB units
header[5] = chrBanks; // CHR ROM size in 8KB units

// Flags 6: Mapper low, mirroring, battery, trainer
// Setting vertical mirroring (bit 0), no battery (bit 1), no trainer (bit 2)
// Mapper 0 (bits 4-7)
header[6] = 0x01; // Vertical mirroring

// Flags 7: Mapper high, VS/Playchoice, NES 2.0
// Setting Mapper 0 high bits (bits 4-7)
header[7] = 0x00;

// Flags 8-15 are zero for compatibility
for (let i = 8; i < 16; i++) {
  header[i] = 0x00;
}

// Combine header, PRG, and CHR data
const newRom = Buffer.concat([header, prgData, chrData]);

// Write the new ROM
fs.writeFileSync(destRomPath, newRom);
console.log(`jsNES-compatible ROM written to: ${destRomPath} (${newRom.length} bytes)`);

// Print hexdump of the first 32 bytes for debugging
console.log('\nFirst 32 bytes of the ROM:');
for (let i = 0; i < 32; i++) {
  process.stdout.write(newRom[i].toString(16).padStart(2, '0') + ' ');
  if ((i + 1) % 16 === 0) process.stdout.write('\n');
}
console.log('\n');

console.log('ROM creation completed successfully!'); 