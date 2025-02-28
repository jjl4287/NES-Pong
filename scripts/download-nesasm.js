const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// Create directory for binaries
const binDir = path.join(__dirname, '../bin');
fs.ensureDirSync(binDir);

// Determine platform and appropriate command
const platform = os.platform();
let nesasmBinary;

if (platform === 'darwin' || platform === 'linux') {
  console.log(`Downloading NESASM for ${platform === 'darwin' ? 'macOS' : 'Linux'}...`);
  nesasmBinary = path.join(binDir, 'nesasm');
  
  try {
    // Download the source code from a reliable fork
    execSync('curl -L -o nesasm.zip https://github.com/camsaul/nesasm/archive/refs/heads/master.zip', { stdio: 'inherit' });
    execSync('unzip -o nesasm.zip', { stdio: 'inherit' });
    
    // Compile it - the compiled binary might be in the source directory or in the project root
    console.log('Compiling NESASM...');
    execSync('cd nesasm-master/source && make', { stdio: 'inherit' });
    
    // Check different possible locations for the binary
    let binaryPath = '';
    if (fs.existsSync('nesasm-master/source/nesasm')) {
      binaryPath = 'nesasm-master/source/nesasm';
    } else if (fs.existsSync('nesasm-master/nesasm')) {
      binaryPath = 'nesasm-master/nesasm';
    } else if (fs.existsSync('nesasm-master/source/nesasm.exe')) {
      binaryPath = 'nesasm-master/source/nesasm.exe';
    } else {
      // Try to compile with cc if gcc fails
      console.log('Trying alternative compilation method...');
      execSync('cd nesasm-master/source && cc -O *.c -o nesasm', { stdio: 'inherit' });
      
      if (fs.existsSync('nesasm-master/source/nesasm')) {
        binaryPath = 'nesasm-master/source/nesasm';
      } else {
        throw new Error('Could not find compiled NESASM binary');
      }
    }
    
    // Move the binary to our bin directory
    fs.copySync(binaryPath, nesasmBinary);
    execSync('chmod +x ' + nesasmBinary, { stdio: 'inherit' });
    
    // Clean up
    fs.removeSync('nesasm.zip');
    fs.removeSync('nesasm-master');
    
    console.log('NESASM has been downloaded and compiled successfully!');
  } catch (error) {
    console.error('Failed to download or compile NESASM:', error.message);
    console.log('You may need to install NESASM manually.');
    
    // Create a placeholder script that will show an error message when executed
    console.log('Creating placeholder NESASM script...');
    const placeholderScript = `#!/bin/sh
echo "ERROR: NESASM could not be downloaded or compiled automatically."
echo "Please install NESASM manually and place the binary in the bin directory."
exit 1
`;
    
    fs.writeFileSync(nesasmBinary, placeholderScript);
    execSync('chmod +x ' + nesasmBinary, { stdio: 'inherit' });
  }
} else if (platform === 'win32') {
  console.log('Downloading NESASM for Windows...');
  nesasmBinary = path.join(binDir, 'nesasm.exe');
  
  try {
    // For Windows, download a pre-compiled binary if possible
    execSync('curl -L -o nesasm.zip https://github.com/camsaul/nesasm/archive/refs/heads/master.zip', { stdio: 'inherit' });
    execSync('powershell Expand-Archive -Path nesasm.zip -DestinationPath . -Force', { stdio: 'inherit' });
    
    // Compile it if needed - note that the Makefile is in the 'source' directory
    console.log('Compiling NESASM...');
    execSync('cd nesasm-master/source && make', { stdio: 'inherit' });
    
    // Check different possible locations for the binary
    let binaryPath = '';
    if (fs.existsSync('nesasm-master/source/nesasm.exe')) {
      binaryPath = 'nesasm-master/source/nesasm.exe';
    } else if (fs.existsSync('nesasm-master/nesasm.exe')) {
      binaryPath = 'nesasm-master/nesasm.exe';
    } else {
      throw new Error('Could not find compiled NESASM binary');
    }
    
    // Move the binary to our bin directory
    fs.copySync(binaryPath, nesasmBinary);
    
    // Clean up
    fs.removeSync('nesasm.zip');
    fs.removeSync('nesasm-master');
    
    console.log('NESASM has been downloaded and compiled successfully!');
  } catch (error) {
    console.error('Failed to download or compile NESASM:', error.message);
    console.log('You may need to install NESASM manually.');
    console.log('For Windows, you can often find pre-compiled binaries online.');
    
    // Create a placeholder batch script that will show an error message when executed
    console.log('Creating placeholder NESASM script...');
    const placeholderScript = `@echo off
echo ERROR: NESASM could not be downloaded or compiled automatically.
echo Please install NESASM manually and place the binary in the bin directory.
exit /b 1
`;
    
    fs.writeFileSync(nesasmBinary, placeholderScript);
  }
} else {
  console.error('Unsupported platform:', platform);
  console.log('You will need to install NESASM manually.');
}

// Update build.js to use the downloaded binary
console.log('Updating build script to use the downloaded NESASM binary...');
const buildPath = path.join(__dirname, '../build.js');
let buildContent = fs.readFileSync(buildPath, 'utf8');

// We'll do a thorough replacement to ensure we're updating any previous references
if (fs.existsSync(nesasmBinary)) {
  // Look for any commands that execute an assembler with our specific assembly file
  buildContent = buildContent.replace(
    /execSync\(`"?.*?(asm6|nesasm).*?"? src\/asm\/PongTwoPlayer\.asm.*?`/,
    `execSync(\`"${nesasmBinary.replace(/\\/g, '\\\\')}" src/asm/PongTwoPlayer.asm\``
  );
  
  fs.writeFileSync(buildPath, buildContent);
  console.log('Build script updated successfully!');
} else {
  console.log('NESASM binary not found, skipping build script update.');
} 