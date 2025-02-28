# NES-Pong

This repository contains two versions of a simple Pong game for the NES (Nintendo Entertainment System). One version features an automated second player, while the other version allows for two-player gameplay using separate controllers. These games were written in 2021 and serve as a demonstration of game development skills using 6504 assembly language.

## Overview

The NES Pong game is a classic arcade game where two players control paddles to hit a ball back and forth across the screen. The objective is to prevent the ball from reaching your side of the screen while trying to score points by getting the ball past your opponent's paddle.

### Features

- Single-player mode with an automated second player (CPU opponent).
- Two-player mode with separate controller support.
- Basic collision detection and ball movement physics.
- Score tracking for each player.

## Online Demo

You can play the NES Pong game online at [nes.jakoblangtry.com](https://nes.jakoblangtry.com). The web version uses jsNES to emulate the NES hardware in your browser.

## Project Structure

The project is organized as follows:

```
NES-Pong/
├── src/
│   └── asm/           # Assembly source code
│       ├── PongTwoPlayer.asm
│       └── sprites.chr # Sprite data
├── public/            # Web assets for jsNES
│   ├── js/            # JavaScript files
│   ├── roms/          # Compiled NES ROMs
│   ├── index.html     # Main webpage
│   └── 404.html       # 404 error page
├── scripts/           # Utility scripts
├── bin/               # Binaries (asm6 assembler)
├── build.js           # Build script
├── cloudbuild.yaml    # Google Cloud Build configuration
└── package.json       # Node.js package configuration
```

## How It Works

The game is programmed using NES assembly language and runs on NES hardware or compatible emulators. The code utilizes the NES hardware registers and implements game logic to control the ball, paddles, and scoring.

## Local Development

To set up the project for local development:

1. Install [Node.js](https://nodejs.org/) (v16 or higher recommended)
2. Install [pnpm](https://pnpm.io/installation) by running `npm install -g pnpm`
3. Clone this repository
4. Install dependencies:
   ```
   pnpm install
   ```
5. Download the asm6 assembler:
   ```
   pnpm run download-asm6
   ```
6. Build the project:
   ```
   pnpm run build
   ```
7. Start the local development server:
   ```
   pnpm start
   ```
8. Open [http://localhost:8080](http://localhost:8080) in your browser

## Google Cloud Hosting

This project is hosted on Google Cloud Storage, with automatic deployments via Google Cloud Build.

### Infrastructure

- **Google Cloud Project**: `jakoblangtry-com`
- **Storage Bucket**: `nes.jakoblangtry.com`
- **Domain**: The website is accessible at [nes.jakoblangtry.com](https://nes.jakoblangtry.com)
- **Continuous Deployment**: Changes to the main branch automatically trigger a new build and deployment

### Manual Deployment

If you want to deploy manually:

```
pnpm run build
pnpm run deploy
```

## System Compatibility

The NES Pong game is compatible with NES hardware and NES emulators that support NES assembly code. The web version uses jsNES to emulate the NES hardware in your browser.

## License

This project is licensed under the MIT License.

Feel free to explore, modify, and use the code for your own purposes.

## Acknowledgments

The code and game logic for this project were primarily developed by Jakob Langtry. Inspiration and occasional guidance were derived from the Nerdy Nights tutorial for iNES headers and reset. You can find the tutorial at https://nerdy-nights.nes.science/.

Special thanks to the NES development community for their resources, tools, and support, and to the jsNES project for providing the JavaScript NES emulator.

If you have any questions or suggestions, feel free to reach out!
