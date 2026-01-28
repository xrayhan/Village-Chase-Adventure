
import React, { useRef, useEffect, useState } from 'react';
import { GameState, Character, Obstacle } from '../types';

interface Props {
  state: GameState;
  onGameOver: (score: number) => void;
  updateScore: (score: number) => void;
  bgImage: string | null;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;
const GROUND_Y = 360;
const GRAVITY = 0.6;
const JUMP_FORCE = -15;
const BASE_SPEED = 6.5;

const GameCanvas: React.FC<Props> = ({ state, onGameOver, updateScore, bgImage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  
  const gameRef = useRef({
    runner: { x: 220, y: GROUND_Y - 95, width: 55, height: 95, velocityY: 0, isJumping: false } as Character,
    chaser: { x: 50, y: GROUND_Y - 100, width: 60, height: 100, velocityY: 0, isJumping: false } as Character,
    obstacles: [] as Obstacle[],
    bgX: 0,
    score: 0,
    frameCount: 0,
    lastObstacleFrame: 0,
  });

  const bgImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (bgImage) {
      const img = new Image();
      img.src = bgImage;
      img.onload = () => (bgImgRef.current = img);
    }
  }, [bgImage]);

  const handleInput = (e?: any) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (state !== GameState.PLAYING) return;
    if (!gameRef.current.runner.isJumping) {
      gameRef.current.runner.velocityY = JUMP_FORCE;
      gameRef.current.runner.isJumping = true;
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) handleInput();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state]);

  useEffect(() => {
    if (state !== GameState.PLAYING) return;

    gameRef.current = {
      runner: { x: 220, y: GROUND_Y - 95, width: 55, height: 95, velocityY: 0, isJumping: false },
      chaser: { x: 50, y: GROUND_Y - 100, width: 60, height: 100, velocityY: 0, isJumping: false },
      obstacles: [],
      bgX: 0,
      score: 0,
      frameCount: 0,
      lastObstacleFrame: 0,
    };
    setScore(0);

    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawRunner = (ctx: CanvasRenderingContext2D, char: Character, frame: number) => {
      ctx.save();
      ctx.translate(char.x, char.y);
      
      const legMove = char.isJumping ? 0 : Math.sin(frame * 0.25) * 12;
      const bodyBob = char.isJumping ? 0 : Math.abs(Math.sin(frame * 0.25)) * 4;

      // Legs
      ctx.fillStyle = '#fee2e2';
      ctx.fillRect(15, 75 + legMove, 12, 20);
      ctx.fillRect(35, 75 - legMove, 12, 20);

      // Saree (Body)
      ctx.fillStyle = '#065f46'; // Emerald
      ctx.beginPath();
      ctx.moveTo(5, 85);
      ctx.lineTo(55, 85);
      ctx.lineTo(45, 15);
      ctx.lineTo(15, 15);
      ctx.closePath();
      ctx.fill();
      
      // Golden patterns on saree
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1;
      for(let i=0; i<3; i++) {
        ctx.beginPath();
        ctx.moveTo(10, 30 + i*15);
        ctx.lineTo(50, 40 + i*15);
        ctx.stroke();
      }

      // Hands (Animated)
      ctx.fillStyle = '#fee2e2';
      ctx.fillRect(0, 30 + bodyBob, 10, 25);
      ctx.fillRect(50, 30 - bodyBob, 10, 25);

      // Head
      ctx.fillStyle = '#fee2e2';
      ctx.beginPath();
      ctx.arc(30, 0, 22, 0, Math.PI * 2);
      ctx.fill();

      // Hair (Silver bun)
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(30, -5, 23, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(48, 0, 10, 0, Math.PI * 2); // Bun
      ctx.fill();

      // Detailed Face Features
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(18, -4, 10, 8); // Glasses left
      ctx.strokeRect(32, -4, 10, 8); // Glasses right
      ctx.beginPath(); ctx.moveTo(28, 0); ctx.lineTo(32, 0); ctx.stroke(); // Bridge

      ctx.restore();
    };

    const drawChaser = (ctx: CanvasRenderingContext2D, char: Character, frame: number) => {
      ctx.save();
      ctx.translate(char.x, char.y);
      
      const legMove = Math.sin(frame * 0.25) * 15;

      // Legs
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(15, 80 + legMove, 14, 20);
      ctx.fillRect(40, 80 - legMove, 14, 20);

      // Kurta
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 30, 50, 60);
      
      // Saffron Nehru Vest
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(10, 30, 50, 40);

      // Hands
      ctx.fillStyle = '#fee2e2';
      ctx.fillRect(-5, 40 + legMove * 0.5, 12, 28);

      // Head
      ctx.fillStyle = '#fee2e2';
      ctx.beginPath();
      ctx.arc(35, 5, 22, 0, Math.PI * 2);
      ctx.fill();

      // White Beard (Distinctive)
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(15, 10);
      ctx.quadraticCurveTo(35, 45, 55, 10);
      ctx.fill();

      // White Hair
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.arc(35, -2, 23, Math.PI, 0);
      ctx.fill();

      // THE BAMBOO STICK (Bash)
      ctx.save();
      ctx.translate(55, 50);
      const swing = Math.sin(frame * 0.35) * 0.5;
      ctx.rotate(-0.8 + swing);
      
      // Stick Body
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(0, 0, 10, -110);
      // Stick Nodes
      ctx.strokeStyle = '#422006';
      ctx.lineWidth = 2;
      for(let i=0; i<5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, -22 * i);
        ctx.lineTo(10, -22 * i);
        ctx.stroke();
      }
      ctx.restore();

      ctx.restore();
    };

    const gameLoop = () => {
      if (state !== GameState.PLAYING) return;

      const g = gameRef.current;
      g.frameCount++;
      
      const currentSpeed = BASE_SPEED + (g.score / 150);

      // Physics
      g.runner.velocityY += GRAVITY;
      g.runner.y += g.runner.velocityY;

      if (g.runner.y > GROUND_Y - 95) {
        g.runner.y = GROUND_Y - 95;
        g.runner.velocityY = 0;
        g.runner.isJumping = false;
      }

      g.chaser.y = GROUND_Y - 100 + Math.sin(g.frameCount * 0.15) * 5;

      g.bgX -= currentSpeed;
      if (g.bgX <= -CANVAS_WIDTH) g.bgX = 0;

      // Obstacles
      if (g.frameCount - g.lastObstacleFrame > Math.max(45, 110 - (g.score / 12))) {
        const typeRoll = Math.random();
        let type: Obstacle['type'] = 'rock';
        if (typeRoll > 0.7) type = 'cow';
        else if (typeRoll > 0.4) type = 'puddle';

        g.obstacles.push({
          id: g.frameCount,
          x: CANVAS_WIDTH,
          y: GROUND_Y - 45,
          width: type === 'cow' ? 70 : 50,
          height: type === 'cow' ? 55 : 45,
          type
        });
        g.lastObstacleFrame = g.frameCount;
      }

      g.obstacles = g.obstacles.filter(o => {
        o.x -= currentSpeed;
        
        // Strict Hitbox
        const pad = 15;
        if (
          g.runner.x + pad < o.x + o.width &&
          g.runner.x + g.runner.width - pad > o.x &&
          g.runner.y + pad < o.y + o.height &&
          g.runner.y + g.runner.height - pad > o.y
        ) {
          cancelAnimationFrame(animationFrameId);
          onGameOver(Math.floor(g.score));
          return false;
        }
        return o.x > -o.width;
      });

      g.score += 0.2;
      if (Math.floor(g.score) > score) {
        setScore(Math.floor(g.score));
        updateScore(Math.floor(g.score));
      }

      // Drawing
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if (bgImgRef.current) {
        ctx.globalAlpha = 0.9;
        ctx.drawImage(bgImgRef.current, g.bgX, 0, CANVAS_WIDTH, GROUND_Y);
        ctx.drawImage(bgImgRef.current, g.bgX + CANVAS_WIDTH, 0, CANVAS_WIDTH, GROUND_Y);
        ctx.globalAlpha = 1.0;
      } else {
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);
      }

      // Mud Path
      ctx.fillStyle = '#713f12';
      ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
      
      // Path detail
      ctx.fillStyle = '#451a03';
      for(let i=0; i<CANVAS_WIDTH; i+=100) {
        const xPos = (i + g.bgX) % CANVAS_WIDTH;
        ctx.fillRect(xPos < 0 ? xPos + CANVAS_WIDTH : xPos, GROUND_Y + 10, 40, 5);
        ctx.fillRect((xPos + 50 < 0 ? xPos + 50 + CANVAS_WIDTH : xPos + 50), GROUND_Y + 30, 30, 4);
      }

      // Obstacles
      g.obstacles.forEach(o => {
        if (o.type === 'cow') {
          ctx.font = '60px serif';
          ctx.fillText('🐄', o.x, o.y + 45);
        } else if (o.type === 'puddle') {
          ctx.fillStyle = '#2563eb';
          ctx.beginPath();
          ctx.ellipse(o.x + o.width/2, o.y + o.height/2, o.width/2, o.height/4, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Clay Pot
          ctx.fillStyle = '#c2410c';
          ctx.beginPath();
          ctx.arc(o.x + 25, o.y + 30, 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(o.x + 15, o.y + 5, 20, 10);
        }
      });

      drawChaser(ctx, g.chaser, g.frameCount);
      drawRunner(ctx, g.runner, g.frameCount);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [state, onGameOver, updateScore]);

  return (
    <div 
      className="flex-1 flex items-center justify-center bg-slate-900 touch-none select-none overflow-hidden p-2"
      onPointerDown={handleInput}
      style={{ touchAction: 'none' }}
    >
       <canvas 
          ref={canvasRef} 
          width={CANVAS_WIDTH} 
          height={CANVAS_HEIGHT}
          className="max-w-full h-auto bg-white shadow-2xl rounded-xl border-4 border-emerald-500 ring-8 ring-slate-800/50"
       />
    </div>
  );
};

export default GameCanvas;
