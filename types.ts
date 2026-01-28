
export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER'
}

export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Character extends GameObject {
  velocityY: number;
  isJumping: boolean;
}

export interface Obstacle extends GameObject {
  id: number;
  type: 'puddle' | 'rock' | 'cow';
}
