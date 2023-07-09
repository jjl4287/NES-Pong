# NES-Pong

This repository contains two versions of a simple Pong game for the NES (Nintendo Entertainment System). One version features an automated second player, while the other version allows for two-player gameplay using separate controllers. These games were written in 2021 and serve as a demonstration of game development skills using 6504 assembly language.

## Overview

The NES Pong game is a classic arcade game where two players control paddles to hit a ball back and forth across the screen. The objective is to prevent the ball from reaching your side of the screen while trying to score points by getting the ball past your opponent's paddle.

### Features

- Single-player mode with an automated second player (CPU opponent).
- Two-player mode with separate controller support.
- Basic collision detection and ball movement physics.
- Score tracking for each player.

## How It Works

The game is programmed using NES assembly language and runs on NES hardware or compatible emulators. The code utilizes the NES hardware registers and implements game logic to control the ball, paddles, and scoring.

The main components of the game include:

- **Game State Management:** The game manages different states such as the title screen and gameplay state. The state is determined based on user input from the controllers.

- **Controller Input:** The game reads input from the controllers to control the paddles. Player 1 uses the first controller, and in the two-player mode, Player 2 uses the second controller.

- **Ball Movement:** The ball's position is updated based on its speed and direction. It bounces off the walls and paddles using collision detection.

- **Paddle Movement:** The paddles move up or down based on player input. In the single-player mode, the second player's paddle is controlled by automated logic.

- **Collision Detection:** The game checks for collisions between the ball and the paddles, as well as the ball and the walls. When a collision occurs, the ball's direction is adjusted accordingly.

- **Scoring:** The game keeps track of each player's score. A point is awarded when the ball passes beyond the opponent's paddle.

## System Compatibility

The NES Pong game is compatible with NES hardware and NES emulators that support NES assembly code. To run the game, you need to assemble the code and generate a ROM file using the nesasm assembler.

### Prerequisites

- nesasm: The NES assembler. You can download it from [https://github.com/camsaul/nesasm](https://github.com/camsaul/nesasm) and follow the installation instructions for your operating system.

### Building and Running the Game

1. Clone or download this repository to your local machine.
2. Open a terminal or command prompt and navigate to the repository directory.
3. Run the following command to assemble the code and generate a ROM file:

   ```shell
   nesasm pong.asm
   ```
This will create a pong.nes ROM file.

4. Run the ROM file using an NES emulator or flash it to a cartridge to run on NES hardware.

## License

This project is licensed under the MIT License.

Feel free to explore, modify, and use the code for your own purposes.

## Acknowledgments

The code and game logic for this project were primarily developed by [Your Name]. Inspiration and occasional guidance were derived from the Nerdy Nights tutorial for iNES headers and reset. You can find the tutorial at https://nerdy-nights.nes.science/.

Special thanks to the NES development community for their resources, tools, and support.

If you have any questions or suggestions, feel free to reach out!
