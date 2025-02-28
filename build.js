const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

// Ensure directories exist
fs.ensureDirSync(path.join(__dirname, 'public/js'));
fs.ensureDirSync(path.join(__dirname, 'public/roms'));
fs.ensureDirSync(path.join(__dirname, 'bin'));

// Check if NESASM binary exists, if not, try to download it
const nesasmPath = path.join(__dirname, 'bin', process.platform === 'win32' ? 'nesasm.exe' : 'nesasm');
if (!fs.existsSync(nesasmPath)) {
  console.log('NESASM binary not found. Running download script...');
  try {
    execSync('node scripts/download-nesasm.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to download NESASM:', error.message);
    console.log('Continuing with the build process, but ROM assembly may fail.');
  }
}

// Assemble the ROM if NESASM is installed
try {
  console.log('Assembling NES ROM...');
  // The sprites.chr file is referenced in the ASM file and needs to be placed in the same directory
  // You'll need to provide a sprites.chr file for this to work
  if (fs.existsSync(nesasmPath)) {
    // We need to make sure the sprites.chr file is in the correct location
    if (fs.existsSync(path.join(__dirname, 'sprites.chr'))) {
      fs.copySync(
        path.join(__dirname, 'sprites.chr'),
        path.join(__dirname, 'src/asm/sprites.chr')
      );
    }
    
    // NESASM puts the output file in the same directory as the input file
    execSync(`"/Users/jjalangtry/Sites/nes.jakoblangtry.com/NES-Pong/bin/nesasm" src/asm/PongTwoPlayer.asm`, { stdio: 'inherit' });
    
    // NESASM outputs to the same directory as the source, so we need to move it
    if (fs.existsSync(path.join(__dirname, 'src/asm/PongTwoPlayer.nes'))) {
      fs.copySync(
        path.join(__dirname, 'src/asm/PongTwoPlayer.nes'),
        path.join(__dirname, 'public/roms/pong.nes')
      );
      console.log('Moved ROM file to public/roms directory');
      console.log('ROM assembled successfully');
    } else {
      console.error('ROM file not found after assembly. Check for errors in the assembly process.');
      // Create an empty placeholder ROM file for demonstration
      fs.writeFileSync(path.join(__dirname, 'public/roms/pong.nes'), 'Placeholder ROM - Replace with actual NES ROM');
      console.log('Created placeholder ROM file. Replace with actual ROM later.');
    }
  } else {
    console.error('NESASM binary not found. Cannot assemble ROM.');
    // Create an empty placeholder ROM file for demonstration
    fs.writeFileSync(path.join(__dirname, 'public/roms/pong.nes'), 'Placeholder ROM - Replace with actual NES ROM');
    console.log('Created placeholder ROM file. Replace with actual ROM later.');
  }
} catch (error) {
  console.error('Failed to assemble ROM:', error.message);
  console.log('Make sure you have installed NESASM and have the sprites.chr file in src/asm/');
  
  // Create an empty placeholder ROM file for demonstration
  fs.writeFileSync(path.join(__dirname, 'public/roms/pong.nes'), 'Placeholder ROM - Replace with actual NES ROM');
  console.log('Created placeholder ROM file. Replace with actual ROM later.');
}

// Copy jsnes library to public/js
try {
  console.log('Copying jsNES library...');
  if (fs.existsSync(path.join(__dirname, 'node_modules/jsnes/dist/jsnes.min.js'))) {
    fs.copySync(
      path.join(__dirname, 'node_modules/jsnes/dist/jsnes.min.js'),
      path.join(__dirname, 'public/js/jsnes.min.js')
    );
    console.log('jsNES library copied successfully');
  } else {
    // Create a placeholder JS file for demonstration
    fs.writeFileSync(
      path.join(__dirname, 'public/js/jsnes.min.js'),
      '// Placeholder for jsNES library - Install dependencies first'
    );
    console.log('Created placeholder for jsNES library. Run "pnpm install" to get actual library.');
  }
} catch (error) {
  console.error('Failed to copy jsNES library:', error.message);
  
  // Create a placeholder JS file for demonstration
  fs.writeFileSync(
    path.join(__dirname, 'public/js/jsnes.min.js'),
    '// Placeholder for jsNES library - Install dependencies first'
  );
  console.log('Created placeholder for jsNES library. Run "pnpm install" to get actual library.');
}

// Create an index.html file with JSNES emulator
console.log('Creating index.html...');
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NES Pong - by Jakob Langtry</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    h1 {
      margin-top: 0;
      color: #333;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .emulator {
      margin: 20px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    canvas {
      border: 1px solid #ddd;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
      width: 512px;
      height: 480px;
    }
    .controls {
      margin-top: 20px;
      text-align: center;
    }
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .instructions {
      max-width: 512px;
      margin: 20px auto;
      padding: 10px;
      background-color: #f8f9fa;
      border-radius: 4px;
      border-left: 4px solid #007bff;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>NES Pong by Jakob Langtry</h1>
    
    <div class="instructions">
      <h3>Player 1 Controls:</h3>
      <p>Up: W / Up Arrow<br>Down: S / Down Arrow</p>
      
      <h3>Player 2 Controls:</h3>
      <p>Up: Up Arrow<br>Down: Down Arrow</p>
      
      <p>Press Start (Enter) to begin the game</p>
    </div>

    <div class="emulator">
      <canvas id="nes-canvas" width="256" height="240"></canvas>
      <div class="controls">
        <button id="start">Start</button>
        <button id="reset">Reset</button>
      </div>
    </div>
    
    <div class="footer">
      <p>Created by Jakob Langtry. Powered by <a href="https://github.com/bfirsh/jsnes" target="_blank">jsNES</a>.</p>
      <p>View the <a href="https://github.com/jjalangtry/NES-Pong" target="_blank">source code on GitHub</a>.</p>
    </div>
  </div>

  <script src="js/jsnes.min.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const SCREEN_WIDTH = 256;
      const SCREEN_HEIGHT = 240;
      const FRAMEBUFFER_SIZE = SCREEN_WIDTH * SCREEN_HEIGHT;
      
      let canvas_ctx, image;
      let framebuffer_u8, framebuffer_u32;
      
      let nes = new jsnes.NES({
        onFrame: function(framebuffer_24) {
          for(let i = 0; i < FRAMEBUFFER_SIZE; i++) {
            let r = framebuffer_24[i * 3 + 0];
            let g = framebuffer_24[i * 3 + 1];
            let b = framebuffer_24[i * 3 + 2];
            framebuffer_u32[i] = (255 << 24) | (b << 16) | (g << 8) | r;
          }
        },
        onAudioSample: function(left, right) {
          // NES audio is not implemented in this demo
        }
      });
      
      function onAnimationFrame() {
        window.requestAnimationFrame(onAnimationFrame);
        
        image.data.set(framebuffer_u8);
        canvas_ctx.putImageData(image, 0, 0);
      }
      
      function initCanvas() {
        let canvas = document.getElementById('nes-canvas');
        canvas_ctx = canvas.getContext('2d');
        image = canvas_ctx.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
        
        framebuffer_u8 = new Uint8ClampedArray(image.data.buffer);
        framebuffer_u32 = new Uint32Array(image.data.buffer);
        
        for(let i = 0; i < FRAMEBUFFER_SIZE; i++) {
          framebuffer_u32[i] = 0xFF000000;
        }
      }
      
      function loadROM() {
        fetch('roms/pong.nes')
          .then(response => response.arrayBuffer())
          .then(buffer => {
            nes.loadROM(new Uint8Array(buffer));
            window.requestAnimationFrame(onAnimationFrame);
          })
          .catch(error => {
            console.error('Error loading ROM:', error);
            alert('Failed to load ROM. Please check the console for details.');
          });
      }
      
      // Keyboard controls
      const KEYS = {
        // Player 1 controls (left player)
        87: { player: 1, button: jsnes.Controller.BUTTON_UP },    // W - up
        83: { player: 1, button: jsnes.Controller.BUTTON_DOWN },  // S - down
        // Both players can use these
        13: { player: 1, button: jsnes.Controller.BUTTON_START }, // Enter - start
        
        // Player 2 controls (right player) using arrows
        38: { player: 2, button: jsnes.Controller.BUTTON_UP },    // Arrow Up
        40: { player: 2, button: jsnes.Controller.BUTTON_DOWN },  // Arrow Down
      };
      
      document.addEventListener('keydown', function(e) {
        let key = KEYS[e.keyCode];
        if(key) {
          nes.buttonDown(key.player, key.button);
          e.preventDefault();
        }
      });
      
      document.addEventListener('keyup', function(e) {
        let key = KEYS[e.keyCode];
        if(key) {
          nes.buttonUp(key.player, key.button);
          e.preventDefault();
        }
      });
      
      // Buttons
      document.getElementById('start').addEventListener('click', function() {
        nes.buttonDown(1, jsnes.Controller.BUTTON_START);
        setTimeout(function() {
          nes.buttonUp(1, jsnes.Controller.BUTTON_START);
        }, 200);
      });
      
      document.getElementById('reset').addEventListener('click', function() {
        nes.reset();
      });
      
      // Initialize
      initCanvas();
      loadROM();
    });
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'public/index.html'), indexHtml);
console.log('index.html created successfully');

// Create a 404 page
console.log('Creating 404.html...');
const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Page Not Found</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
    }
    h1 {
      font-size: 72px;
      margin: 0;
      color: #333;
    }
    p {
      font-size: 24px;
      color: #666;
    }
    a {
      color: #007bff;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <h1>404</h1>
  <p>Page Not Found</p>
  <p><a href="/">Return to the NES Pong Game</a></p>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'public/404.html'), notFoundHtml);
console.log('404.html created successfully');

console.log('Build completed!'); 