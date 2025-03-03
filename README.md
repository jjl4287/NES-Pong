# NES Pong

A simple Pong game for the NES, written in 6502 Assembly and playable in the browser using jsNES.

## Overview

This project is a two-player Pong game for the Nintendo Entertainment System (NES). The game is written in 6502 Assembly and compiled using NESASM. The compiled ROM is then served in a web browser using the jsNES emulator.

## Controls

- **Player 1 (Left Paddle)**
  - Up: W
  - Down: S

- **Player 2 (Right Paddle)**
  - Up: Up Arrow
  - Down: Down Arrow

- **Start Game**: Enter key or click the Start button

## Project Structure

- `src/asm/` - Contains the 6502 Assembly source code
- `public/` - Contains the web files served to the browser
- `bin/` - Contains the NESASM compiler binary

## Building the Project

1. Make sure you have Node.js installed
2. Install dependencies: `pnpm install`
3. Build the project: `pnpm run build`
4. Serve the project: `cd public && python3 -m http.server 8000`
5. Open your browser to `http://localhost:8000`

## How It Works

1. The 6502 Assembly code (`PongTwoPlayer.asm`) is compiled using NESASM to create a NES ROM file
2. The ROM file is copied to the `public/roms` directory
3. The jsNES emulator is used to run the ROM in the browser
4. The game is controlled using keyboard inputs mapped to NES controller buttons

## Troubleshooting

If you see a black screen:
- Check the browser console for errors
- Make sure the ROM file is being loaded correctly
- Verify that the jsNES library is being loaded

## Credits

Created by Jakob Langtry. Powered by [jsNES](https://github.com/bfirsh/jsnes).
