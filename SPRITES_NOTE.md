# About the sprites.chr File

The `sprites.chr` file is crucial for assembling the NES ROM correctly. This file contains the graphical data (sprites and tiles) used by the game.

## What is sprites.chr?

In NES development, the .chr files contain pattern tables that define how sprites and background tiles look. The NES PPU (Picture Processing Unit) reads this data to display graphics on the screen.

## How to Get the Real sprites.chr File

There are several ways to obtain a valid sprites.chr file:

1. **Extract from the original ROM**: If you have a compiled .nes file of your Pong game, you can extract the CHR data using tools like FCEUX or Nintendulator.

2. **Create your own**: You can create a new sprites.chr file using NES graphics editors like:
   - YY-CHR
   - NES Screen Tool
   - Tile Layer Pro

3. **Use the original file**: If you still have the original sprites.chr that was used when developing the PongTwoPlayer.asm file, simply place it in the `src/asm/` directory.

## Placeholder Solution

Currently, the build system will create a placeholder ROM if the sprites.chr file is missing. While this allows the website structure to be set up, the emulator won't be able to run a proper game without a valid ROM.

For the final production version, please ensure you have a valid sprites.chr file in the `src/asm/` directory before deploying.

## File Size

A typical NES CHR file is 8KB (8,192 bytes) in size. If your file differs significantly, it may not be compatible with the assembly code. 