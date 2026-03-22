"use client";

import { useEffect, useRef } from "react";

export function BlocksBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let blocks: Block[] = [];
    // Mantenemos pocos bloques para que "no esté saturado" (minimalista y moderno)
    const blockCount = Math.min(Math.floor(width * 0.04), 40); 
    
    const mouse = { x: -1000, y: -1000, radius: 250 };

    function handleResize() {
      width = canvas!.width = window.innerWidth;
      height = canvas!.height = window.innerHeight;
      initBlocks();
    }
    
    function handleMouseMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }

    function handleMouseLeave() {
      mouse.x = -1000;
      mouse.y = -1000;
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    class Block {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseX: number;
      baseY: number;
      colorBase: string;
      targetOpacity: number;
      currentOpacity: number;
      rotation: number;
      rotSpeed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseX = this.x;
        this.baseY = this.y;
        
        // Tamaños variados pero discretos
        this.size = Math.random() * 40 + 10; 
        
        // Velocidad de flotación muy suave (arquitectura/construcción)
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.8) * 0.4 - 0.1; // Tendencia hacia arriba
        
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.01;

        // Paleta de la plataforma
        const colors = ['204, 255, 0', '255, 255, 255', '92, 149, 255'];
        this.colorBase = colors[Math.floor(Math.random() * colors.length)];
        
        this.targetOpacity = 0.02; // Casi invisible por defecto
        this.currentOpacity = this.targetOpacity;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotSpeed;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Interaction with mouse
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const directionX = dx / distance;
          const directionY = dy / distance;
          
          // Evasión sutil al cursor
          this.x -= directionX * force * 1.5;
          this.y -= directionY * force * 1.5;
          
          // Rotan un poco más rápido si están cerca
          this.rotation += 0.02 * force;

          // Se iluminan (Glow)
          this.targetOpacity = 0.02 + (0.3 * force);
        } else {
          this.targetOpacity = 0.02;
        }

        // Suavizar opacidad
        this.currentOpacity += (this.targetOpacity - this.currentOpacity) * 0.1;

        // Wrap around
        if (this.x < -100) this.x = width + 100;
        if (this.x > width + 100) this.x = -100;
        if (this.y < -100) this.y = height + 100;
        if (this.y > height + 100) this.y = -100;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Fill super tenue
        ctx.fillStyle = `rgba(${this.colorBase}, ${this.currentOpacity})`;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);

        // Borde un poco más visible para dar el tono técnico/moderno
        ctx.strokeStyle = `rgba(${this.colorBase}, ${this.currentOpacity * 1.5})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);

        ctx.restore();
      }
    }

    function initBlocks() {
      blocks = [];
      for (let i = 0; i < blockCount; i++) {
        blocks.push(new Block());
      }
    }

    initBlocks();

    let animationFrameId: number;
    function animate() {
      if (!ctx) return;
      // Fondo oscuro
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, width, height);
      
      // Dibujar grid de blueprint muy tenue (opcional, da textura arquitectónica)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
      ctx.lineWidth = 1;
      const gridSize = 100;
      ctx.beginPath();
      for (let x = 0; x <= width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      for (let i = 0; i < blocks.length; i++) {
        blocks[i].update();
        blocks[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 h-screen w-screen pointer-events-none"
    />
  );
}
