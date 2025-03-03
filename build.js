const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

console.log('Assembling NES ROM...');

// Ensure directories exist
fs.ensureDirSync(path.join(__dirname, 'public/js'));
fs.ensureDirSync(path.join(__dirname, 'public/roms'));
fs.ensureDirSync(path.join(__dirname, 'src/asm'));

// Make sure sprites.chr is in the right location
const rootSpritesPath = path.join(__dirname, 'sprites.chr');
const asmSpritesPath = path.join(__dirname, 'src/asm/sprites.chr');

// Always copy the sprites.chr from root to ensure we have the latest version
if (fs.existsSync(rootSpritesPath)) {
  console.log('Copying sprites.chr to src/asm directory...');
  fs.copySync(rootSpritesPath, asmSpritesPath);
  console.log('sprites.chr copied successfully');
} else {
  console.error('Warning: sprites.chr not found in root directory.');
  
  if (!fs.existsSync(asmSpritesPath)) {
    console.error('Error: sprites.chr not found in src/asm/ directory either.');
    console.log('Please ensure you have a sprites.chr file in the root or src/asm/ directory.');
    process.exit(1);
  } else {
    console.log('Using existing sprites.chr in src/asm/ directory.');
  }
}

// Verify sprites.chr file size
const spritesSize = fs.statSync(asmSpritesPath).size;
console.log(`sprites.chr size: ${spritesSize} bytes`);
if (spritesSize !== 8192) {
  console.warn(`Warning: sprites.chr size is ${spritesSize} bytes, expected 8192 bytes.`);
}

// Check if NESASM binary exists
const nesasmPath = path.join(__dirname, 'bin', process.platform === 'win32' ? 'nesasm.exe' : 'nesasm');
if (!fs.existsSync(nesasmPath)) {
  console.error('Error: NESASM binary not found at', nesasmPath);
  console.log('Please make sure the NESASM binary is in the bin directory.');
  process.exit(1);
}

try {
  // Assemble the ROM
  console.log(`Running NESASM: "${nesasmPath}" src/asm/PongTwoPlayer.asm`);
  execSync(`"${nesasmPath}" src/asm/PongTwoPlayer.asm`, { stdio: 'inherit' });
  
  // Check if the ROM was created
  const romFile = path.join(__dirname, 'src/asm/PongTwoPlayer.nes');
  
  if (fs.existsSync(romFile)) {
    console.log('ROM assembled successfully.');
    
    // Copy the ROM to the public directory
    const destFile = path.join(__dirname, 'public/roms/pong.nes');
    fs.copySync(romFile, destFile);
    console.log(`ROM copied to ${destFile}`);
    
    // Log the first 32 bytes of the ROM for debugging
    const romData = fs.readFileSync(destFile);
    console.log('First 32 bytes of the ROM:');
    console.log(Array.from(romData.slice(0, 32)).map(b => b.toString(16).padStart(2, '0')).join(' '));
    
    // Verify iNES header
    if (romData.length >= 16) {
      const header = Array.from(romData.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(' ');
      console.log('iNES Header:', header);
      
      // Check for valid iNES header
      if (romData[0] !== 0x4E || romData[1] !== 0x45 || romData[2] !== 0x53 || romData[3] !== 0x1A) {
        console.warn('Warning: ROM does not have a valid iNES header (NES\\x1A)');
      }
      
      console.log(`PRG ROM size: ${romData[4]} x 16KB`);
      console.log(`CHR ROM size: ${romData[5]} x 8KB`);
      console.log(`Mapper: ${(romData[6] >> 4) | (romData[7] & 0xF0)}`);
      console.log(`Mirroring: ${romData[6] & 0x01 ? 'vertical' : 'horizontal'}`);
    }
  } else {
    console.error('ROM file not created. Please check the assembly process.');
    process.exit(1);
  }
} catch (error) {
  console.error('Failed to assemble ROM:', error.message);
  process.exit(1);
}

// Copy jsnes library to public/js
try {
  console.log('Copying jsNES library...');
  const jsnesPath = path.join(__dirname, 'node_modules/jsnes/dist/jsnes.min.js');
  
  if (fs.existsSync(jsnesPath)) {
    fs.copySync(jsnesPath, path.join(__dirname, 'public/js/jsnes.min.js'));
    console.log('jsNES library copied successfully');
  } else {
    console.error('jsNES library not found. Run "pnpm install" first.');
    process.exit(1);
  }
} catch (error) {
  console.error('Failed to copy jsNES library:', error.message);
  process.exit(1);
}

console.log('Build completed successfully!'); 