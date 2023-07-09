; Jakob Langtry
; This is code for an automated two player version of pong made in Assembly
; This code and all of its logic was written by me, with occasional help from the
; Nerdy Nights tutorial for iNES headers, reset, and such
; Here is the link to that: https://nerdy-nights.nes.science/


  .inesprg 1   ; 1x 16KB PRG code
  .ineschr 1   ; 1x  8KB CHR data
  .inesmap 0   ; mapper 0 = NROM, no bank swapping
  .inesmir 1   ; background mirroring
  
  .rsset $0000 ; here, we are telling the compiler what memory addess to start saving these variables at

; declaring and reserving bytes for variables
gamestate      .rs 1
p1buttons      .rs 1
p2buttons      .rs 1
index          .rs 1
index2         .rs 1
ballxpos       .rs 1
ballypos       .rs 1
ballup         .rs 1
balldown       .rs 1
ballleft       .rs 1
ballright      .rs 1
ballxspeed     .rs 1
ballyspeed     .rs 1
p1paddle       .rs 1
p2paddle       .rs 1
p1score        .rs 1
p2score        .rs 1

; declaring constants here for ease of use later and better readability (if thats much possible with asm)
title       = $00
playing     = $01

upwall      = $08
downwall    = $E0
leftwall    = $00
rightwall   = $F8

p1paddlex   = $08
p2paddlex   = $F0

centerx		= $7E
centery		= $7E


  .bank 0
  .org $C000 
RESET:
  SEI          ; disable IRQs
  CLD          ; disable decimal mode
  LDX #$40
  STX $4017    ; disable APU frame IRQ
  LDX #$FF
  TXS          ; Set up stack
  INX          ; now X = 0
  STX $2000    ; disable NMI
  STX $2001    ; disable rendering
  STX $4010    ; disable DMC IRQs

vblankwait1:   ; First wait for vblank to make sure PPU is ready
  BIT $2002
  BPL vblankwait1

memclr:
  LDA #$00
  STA $0000, x
  STA $0100, x
  STA $0200, x
  STA $0400, x
  STA $0500, x
  STA $0600, x
  STA $0700, x
  LDA #$FE
  STA $0300, x
  INX
  BNE memclr
   
vblankwait2:            ; Second wait for vblank, PPU is ready after this
  BIT $2002
  BPL vblankwait2


LoadPalettes:
  LDA $2002
  LDA #$3F
  STA $2006             ; write the high byte of $3F00 address
  LDA #$00
  STA $2006             ; write the low byte of $3F00 address
  LDX #$00              ; start out at 0
LoadPalettesLoop:
  LDA palette, x        ; load data from address (palette + the value in x)
  STA $2007             ; write to PPU
  INX                   ; X++;
  CPX #$20
  BNE LoadPalettesLoop 

  ; initial ball stats
  LDA #$01
  STA ballleft
  STA balldown
  LDA #$00
  STA ballup
  STA ballright
  
  LDA #$70
  STA ballypos
  
  LDA #$70
  STA ballxpos
  
  LDA #$01
  STA ballxspeed
  LDA #$01
  STA ballyspeed

  LDA #$70
  STA p1paddle
  STA p2paddle
;;:Set starting game state
  LDA #title
  STA gamestate
              
  LDA #%10010000   ; enable NMI, sprites from Pattern Table 0, background from Pattern Table 1
  STA $2000

  LDA #%00011000   ; enable sprites, enable background, no clipping on left side
  STA $2001



KeepRunning:
  JMP KeepRunning
  
 

NMI:
  LDA #$00
  STA $2003       ; set the low byte (00) of the RAM address
  LDA #$02
  STA $4014       ; set the high byte (02) of the RAM address

  ; clean up ppu for proper frame to frame rendering
  LDA #%10010000  ; enable nmi, sprites from patterntable 0 and background form PT1
  STA $2000
  LDA #%00011100  ; enabling background, sprites, and no clipping on left side
  STA $2001
  LDA #$00        ; no background scrolling
  STA $2005
  STA $2005

; graphics updates done, everything next is the game engine
 
  JSR Readp1controller ; jumps to section that reads controller buttons
  JSR Readp2controller ; jumpsto p2 controller section


GameStateChooser:
  LDA gamestate		   ; depending on controller input, decides what state of game to load
  CMP #title
  BEQ TitleEngine	   ; this will show title screen

  LDA gamestate
  CMP #playing
  BEQ PlayingEngine	 ; this will actually be the game

TitleEngine:
  JSR LoadTitleSprites
TitleLoop:
  LDA p1buttons
  AND #%00010000
  BEQ NoStart
  JSR ClearSprites
  LDA #playing
  STA gamestate
NoStart:
  RTI

PlayingEngine:
  JSR LoadGameSprites

MoveBallRight:
  LDA ballright
  BEQ MoveBallRightDone  ; if ballright=0, skip

  LDA ballxpos
  CLC
  ADC ballxspeed         ; ballxpos = ballxpos + ballspeedx
  STA ballxpos

  LDA ballxpos
  CMP #rightwall
  BNE MoveBallRightDone  ; if ball x < right wall, still on screen, skip next section
  LDA #centerx
  STA ballxpos
  LDA #centery
  STA ballypos           ; reset if ball passes
  LDA p1score            ; tell update sprites to increment score sprite
  CLC
  ADC #$01
  STA p1score
MoveBallRightDone:

MoveBallLeft:
  LDA ballleft
  BEQ MoveBallLeftDone   ; if ballleft=0, skip

  LDA ballxpos
  SEC
  SBC ballxspeed         ; ballxpos = ballxpos - ballspeedx
  STA ballxpos

  LDA ballxpos
  CMP #leftwall
  BNE MoveBallLeftDone   ; if ball x > left wall, still on screen, skip next section
  LDA #centerx
  STA ballxpos
  LDA #centery
  STA ballypos           ; reset if ball passes
  LDA p2score            ; tell update sprites to increment score sprite
  CLC
  ADC #$01
  STA p2score
MoveBallLeftDone:

MoveBallUp:
  LDA ballup
  BEQ MoveBallUpDone      ; if ballup=0, skip this section

  LDA ballypos
  SEC
  SBC ballyspeed          ; bally position = bally - ballspeedy
  STA ballypos

  LDA ballypos
  CMP #upwall
  BNE MoveBallUpDone      ; if ball y > top wall, still on screen, skip next section
  LDA #$01
  STA balldown
  LDA #$00
  STA ballup              ; bounce, ball now moving down
MoveBallUpDone:


MoveBallDown:
  LDA balldown
  BEQ MoveBallDownDone    ; if ballup=0, skip this section

  LDA ballypos
  CLC
  ADC ballyspeed          ; bally position = bally + ballspeedy
  STA ballypos

  LDA ballypos
  CMP #downwall
  BNE MoveBallDownDone    ; if ball y < bottom wall, still on screen, skip next section
  LDA #$00
  STA balldown
  LDA #$01
  STA ballup              ;bounce, ball now moving down
MoveBallDownDone:

MovePaddle1Up:
  LDA p1buttons			      ; if up button pressed
  AND #%00001000
  BEQ MovePaddle1UpDone

  LDA $0204
  CMP #upwall
  BEQ MovePaddle1UpDone  ; if paddle top > top wall

  LDA p1paddle 			     ; Move paddle sprites up
  SEC
  SBC #$02
  STA p1paddle

MovePaddle1UpDone:

MovePaddle1Down:
  LDA p1buttons			     ; if down button pressed
  AND #%00000100
  BEQ MovePaddle1DownDone

  LDA $0210				       ; and it is not at the bottom
  CMP #downwall
  BEQ MovePaddle1DownDone

  LDA p1paddle 			     ; move it down
  CLC
  ADC #$02
  STA p1paddle

MovePaddle1DownDone:
  
CheckPaddle1Collision:
  LDA #p1paddlex         ; if ball x < p1paddlex
  CMP ballxpos
  BNE CheckPaddle1CollisionDone
  
  LDA p1paddle
  CMP ballypos
  BCS CheckPaddle1CollisionDone ; if bally > paddle y top
  
  LDA p1paddle
  CLC
  ADC #$20
  CMP ballypos
  BCC CheckPaddle1CollisionDone ; if bally < paddle y bottom
  
  LDA #$01
  STA ballright
  LDA #$00
  STA ballleft    	     ; bounce, ball now moving right
  
CheckPaddle1CollisionDone:



MovePaddle2Up:
  ;LDA p2buttons			     ; if up button pressed
  ;AND #%00001000
  ;BEQ MovePaddle2UpDone

  ;LDA $0214
  ;CMP #upwall
  ;BEQ MovePaddle2UpDone  ; if paddle top > top wall

  ;LDA p2paddle 			     ; Move paddle sprites up
  ;SEC
  ;SBC #$02
  ;STA p2paddle

MovePaddle2UpDone:

MovePaddle2Down:
  ;LDA p2buttons	   		  ; if down button pressed
  ;AND #%00000100
  ;BEQ MovePaddle2DownDone

  ;LDA $0220				     ; and it is not at the bottom
  ;CMP #downwall
  ;BEQ MovePaddle2DownDone

  ;LDA p2paddle 			   ; move it down
  ;CLC
  ;ADC #$02
  LDA ballypos        ; to remove p2 auto or add it in (just do opposite) simply comment out lines 355-357 
  CLC                 ; and uncomment lines 328-354
  SBC #$10
  STA p2paddle

MovePaddle2DownDone:
  
CheckPaddle2Collision:
  LDA #p2paddlex       ; if ball x < p2paddlex
  CMP ballxpos
  BNE CheckPaddle2CollisionDone
  
  LDA p2paddle
  CMP ballypos
  BCS CheckPaddle2CollisionDone ; if bally > paddle y top
  
  LDA p2paddle
  CLC
  ADC #$20
  CMP ballypos
  BCC CheckPaddle2CollisionDone ; if bally < paddle y bottom
  
  LDA #$01
  STA ballleft
  LDA #$00
  STA ballright    		 ; bounce, ball now moving left

CheckPaddle2CollisionDone:

  LDA p1buttons
  AND #%00100000       ; Checks to see if select button was pressed, and exits the game 
  BEQ NoGameOver
  LDA #title
  STA gamestate
  JMP RESET
NoGameOver:
  JSR DrawScore
  JSR UpdateSprites
  RTI

Readp1controller:
  LDA #$01             ; Latch Controller, get ready to loop
  STA $4016
  LDA #$00
  STA $4016
  LDX #$08
P1ContollerLoop:
  LDA $4016            ; This loop grabs controller input
  LSR A                ; stores it to p1buttons, clears accumulator
  ROL p1buttons        ; and shifts the data left in p1buttons
  DEX                  ; 8 times, so we have one superbyte with all controller data
  BNE P1ContollerLoop
  RTS
Readp2controller:
  LDA #$01
  STA $4016
  LDA #$00
  STA $4016
  LDX #$08
P2ContollerLoop:
  LDA $4017            ; This loop grabs controller input
  LSR A                ; stores it to p1buttons, clears accumulator
  ROL p2buttons        ; and shifts the data left in p2buttons
  DEX                  ; 8 times, so we have one superbyte with all controller data
  BNE P2ContollerLoop
  RTS

LoadTitleSprites:
  LDX index
  CPX #$00
  BNE AlreadyLoaded
  LDX #$2C              ; start at 24
LoadTitleSpritesLoop:
  LDA sprites, x        ; load data from address (sprites +  x)
  STA $0200, x          ; store into RAM address ($0200 + x)
  INX
  CPX #$3C
  BNE LoadTitleSpritesLoop

  STX index

  LDA #%10000000   ; enable NMI and sprites from pattern table 1
  STA $2000

  LDA #%00010000   ; enable sprites
  STA $2001
AlreadyLoaded:
  RTS

LoadGameSprites:
  LDX index2
  CPX #$00
  bne NotAgain
  LDX #$00              ; start at 24
LoadGameSpritesLoop:
  LDA sprites, x        ; load data from address (sprites +  x)
  STA $0200, x          ; store into RAM address ($0200 + x)
  INX
  CPX #$2C
  BNE LoadGameSpritesLoop

  STX index2

  LDA #%10000000   ; enable NMI and sprites from pattern table 1
  STA $2000

  LDA #%00010000   ; enable sprites
  STA $2001
NotAgain:
  RTS

ClearSprites:
  LDX #$2C              ; start at 24
ClearSpritesLoop:
  LDA #$00              ; load data from address (sprites +  x)
  STA $0200, x          ; store into RAM address ($0200 + x)
  INX
  CPX #$3C
  BNE ClearSpritesLoop

  LDA #%10010000   ; enable NMI and sprites from pattern table 1
  STA $2000

  LDA #%00011000   ; enable sprites
  STA $2001
  RTS

DrawScore:
  LDA p1score  ; This part checks if p1 got 10 points, and ends the game if so
  CMP #$0A
  BEQ VicRoy
  LDA #$30    ; reset the count, then add current score
  STA $0229
  LDA #$30
  CLC
  ADC p1score
  STA $0229

  LDA p2score  ; This part checks if p1 got 10 points, and ends the game if so
  CMP #$0A
  BEQ VicRoy
  LDA $30      ; reset the count, then add current score
  STA $0225
  LDA #$30
  CLC
  ADC p2score
  STA $0225

  RTS

VicRoy:
  LDA #title
  STA gamestate
  JMP RESET

UpdateSprites:

  LDA p1paddle  ; loads any changes to p1 paddle and applies them
  STA $0204
  CLC
  ADC #$08
  STA $0208
  CLC
  ADC #$08
  STA $020C
  CLC
  ADC #$08
  STA $0210

  LDA p2paddle  ; loads any changes to p2 paddle and applies them
  STA $0214
  CLC
  ADC #$08
  STA $0218
  CLC
  ADC #$08
  STA $021C
  CLC
  ADC #$08
  STA $0220

  LDA ballypos  ; update all ball vert sprite info
  STA $0200

  LDA ballxpos  ; update all ball horizontal info
  STA $0203
  
  RTS

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
; pallete data, sprite data, file includes
  
  .bank 1
  .org $E000
palette:
  .db $0A,$31,$32,$33,   $34,$35,$36,$37,   $38,$39,$3A,$3B,   $3C,$3D,$3E,$0F
  .db $0A,$24,$15,$30,   $0F,$30,$26,$05,   $0F,$20,$10,$00,   $0F,$06,$15,$36

sprites:
	 ;vert tile Colr horiz
  .db $7E, $1, $00, $7E   ;ball

  .db $6E, $5, $00, $00   ;paddle left
  .db $76, $6, $00, $00
  .db $7E, $7, $00, $00
  .db $86, $8, $00, $00

  .db $6E, $5, $00, $F8   ;paddle right
  .db $76, $6, $00, $F8
  .db $7E, $7, $00, $F8
  .db $86, $8, $00, $F8

  .db $18, $30, $00, $C0   ;Score
  .db $18, $30, $00, $38   ;Score

  .db $70, $50, $00, $6E  ;P
  .db $70, $4F, $00, $76  ;O
  .db $70, $4E, $00, $7E  ;N
  .db $70, $47, $00, $86  ;G

  .org $FFFA 
  .dw NMI
  .dw RESET
  .dw 0
  
  .bank 2
  .org $0000
  .incbin "sprites.chr"