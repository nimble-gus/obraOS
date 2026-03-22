"use client";

import { useEffect, useRef } from "react";

export function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let particles: Particle[] = [];
    const particleCount = Math.min(Math.floor(width * 0.25), 300); // Responsive amount
    
    const mouse = { x: width / 2, y: height / 2, radius: 200 };

    function handleResize() {
      width = canvas!.width = window.innerWidth;
      height = canvas!.height = window.innerHeight;
      initParticles();
    }
    
    function handleMouseMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }

    // Default to center when mouse leaves window
    function handleMouseLeave() {
      mouse.x = width / 2;
      mouse.y = height / 2;
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseX: number;
      baseY: number;
      color: string;
      angle: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.angle = Math.random() * Math.PI * 2;
        const colors = ['#ccff00', '#ccff00', '#ffffff', '#5c95ff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.angle += 0.01;
        this.x += Math.cos(this.angle) * 0.5 + this.vx;
        this.y += Math.sin(this.angle) * 0.5 + this.vy;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const directionX = dx / distance;
          const directionY = dy / distance;
          // Vortex repulsion
          this.x -= directionX * force * 4;
          this.y -= directionY * force * 4;
          this.angle += 0.05 * force;
        }

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        const length = this.size * 3;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + Math.cos(this.angle) * length, this.y + Math.sin(this.angle) * length);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size / 2;
        ctx.lineCap = "round";
        ctx.stroke();
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    initParticles();

    let animationFrameId: number;
    function animate() {
      if (!ctx) return;
      ctx.fillStyle = "rgba(9, 9, 11, 0.2)";
      ctx.fillRect(0, 0, width, height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
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
      className="fixed inset-0 z-0 h-screen w-screen opacity-50 mix-blend-screen pointer-events-none"
      style={{ background: "#09090b" }}
    />
  );
}
