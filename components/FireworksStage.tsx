
import React, { useEffect, useRef } from 'react';
import { Vector3, Particle3D, Shell } from '../types';

// Configuration
const GRAVITY = 0.06;
const DRAG = 0.96; // Less drag for bigger explosions
const TEXT_WISHES = ["孔焕焕", "生日快乐", "永远开心", "光芒万丈", "独一无二", "暴富", "美梦成真", "元气满满"];
const BASE_COLORS = [
    { h: 320, s: 100, l: 60 }, // Hot Pink
    { h: 180, s: 100, l: 60 }, // Cyan
    { h: 40, s: 100, l: 70 },  // Gold
    { h: 270, s: 100, l: 65 }, // Electric Purple
    { h: 100, s: 100, l: 60 }, // Neon Green
    { h: 0, s: 100, l: 65 },   // Red
];

// Helper: Random Range
const random = (min: number, max: number) => Math.random() * (max - min) + min;

const FireworksStage: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle3D[]>([]);
    const shellsRef = useRef<Shell[]>([]);
    const textCtxRef = useRef<CanvasRenderingContext2D | null>(null);
    const animationRef = useRef<number>(0);
    const mouseRef = useRef({ x: 0, y: 0 }); 

    // Schedulers
    const lastMainLaunch = useRef(0);
    const lastMiniLaunch = useRef(0);
    const wishIndex = useRef(0);

    // Initialize Text Generation Canvas (Off-screen)
    useEffect(() => {
        const c = document.createElement('canvas');
        c.width = 1000;
        c.height = 300;
        textCtxRef.current = c.getContext('2d', { willReadFrequently: true });
    }, []);

    // ----------------------------------------------------------------------
    // Logic: Text to Points
    // ----------------------------------------------------------------------
    const getTextPoints = (text: string): Vector3[] => {
        const ctx = textCtxRef.current;
        if (!ctx) return [];

        ctx.clearRect(0, 0, 1000, 300);
        ctx.fillStyle = '#ffffff';
        // Huge bold font for impact
        ctx.font = '900 160px "Microsoft YaHei", sans-serif'; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 500, 150);

        const imageData = ctx.getImageData(0, 0, 1000, 300);
        const data = imageData.data;
        const points: Vector3[] = [];
        
        // Lower step = More particles. 
        const step = 2; // Increased density

        for (let y = 0; y < 300; y += step) {
            for (let x = 0; x < 1000; x += step) {
                const alpha = data[(y * 1000 + x) * 4 + 3];
                if (alpha > 128) {
                    points.push({
                        x: (x - 500) * 2.0, // Spread wider
                        y: (y - 150) * 2.0, // Y grows downwards in canvas and 3D
                        z: random(-15, 15) // Thicker 3D text
                    });
                }
            }
        }
        return points;
    };

    // ----------------------------------------------------------------------
    // Logic: Explosion Generators
    // ----------------------------------------------------------------------
    const createExplosion = (pos: Vector3, colorHue: number, type: 'sphere' | 'text' | 'ring', textStr?: string) => {
        const particles = particlesRef.current;
        const color = `hsla(${colorHue}, 100%, 70%,`;

        if (type === 'text' && textStr) {
            // TEXT EXPLOSION
            const points = getTextPoints(textStr);
            points.forEach(p => {
                particles.push({
                    pos: { x: pos.x, y: pos.y, z: pos.z }, 
                    // Explode rapidly from center then slow down to form text
                    vel: { 
                        x: p.x * 0.15 + random(-1, 1), 
                        y: p.y * 0.15 + random(-1, 1), 
                        z: p.z * 0.15 + random(-1, 1)
                    }, 
                    acc: { x: 0, y: 0, z: 0 },
                    color: color,
                    alpha: 1,
                    size: random(2, 5),
                    decay: random(0.008, 0.015), // Faster fade out (approx 1.5-2s)
                    life: 1,
                    type: 'text'
                });
            });
        } else {
            // STANDARD FIREWORK
            const particleCount = type === 'sphere' ? 500 : 300;
            
            for (let i = 0; i < particleCount; i++) {
                // Sphere math
                const theta = random(0, Math.PI * 2);
                const phi = random(0, Math.PI);
                
                // Ring effect modification
                const ringMod = type === 'ring' ? (Math.abs(Math.cos(phi)) < 0.1 ? 2.5 : 0.1) : 1;

                const speed = random(5, 20) * ringMod;
                
                const vx = speed * Math.sin(phi) * Math.cos(theta);
                const vy = speed * Math.sin(phi) * Math.sin(theta);
                const vz = speed * Math.cos(phi);

                particles.push({
                    pos: { ...pos },
                    vel: { x: vx, y: vy, z: vz },
                    acc: { x: 0, y: GRAVITY, z: 0 },
                    color: color,
                    alpha: 1,
                    size: random(2, 5),
                    decay: random(0.015, 0.03),
                    life: 1,
                    type: 'spark'
                });
            }
        }
    };

    // ----------------------------------------------------------------------
    // Logic: Update Loop
    // ----------------------------------------------------------------------
    const update = (width: number, height: number) => {
        const now = Date.now();

        // SCHEDULER 1: Small Background Fireworks (Constant)
        if (now - lastMiniLaunch.current > 300) { 
            lastMiniLaunch.current = now;
            const x = random(-width/1.5, width/1.5);
            shellsRef.current.push({
                pos: { x: x, y: height + 50, z: random(-400, 400) },
                vel: { x: random(-2, 2), y: random(-22, -32), z: random(-2, 2) },
                targetY: random(-400, -100),
                color: `${random(0, 360)}`,
                exploded: false
            });
        }

        // SCHEDULER 2: Main Text Event (Periodic)
        if (now - lastMainLaunch.current > 4000) {
            lastMainLaunch.current = now;
            
            const text = TEXT_WISHES[wishIndex.current];
            const colorIdx = wishIndex.current % BASE_COLORS.length;
            wishIndex.current = (wishIndex.current + 1) % TEXT_WISHES.length;

            // Launch right in the middle
            shellsRef.current.push({
                pos: { x: 0, y: height + 100, z: 0 },
                vel: { x: 0, y: -28, z: 0 },
                targetY: -200, // Higher up
                color: `${BASE_COLORS[colorIdx].h}`,
                text: text,
                exploded: false
            });
        }

        // Update Shells
        for (let i = shellsRef.current.length - 1; i >= 0; i--) {
            const shell = shellsRef.current[i];
            shell.pos.x += shell.vel.x;
            shell.pos.y += shell.vel.y;
            shell.pos.z += shell.vel.z;
            shell.vel.y += GRAVITY;

            if (shell.vel.y >= 0 || shell.pos.y < shell.targetY) {
                // Determine type
                let type: 'sphere' | 'text' | 'ring' = 'sphere';
                if (shell.text) type = 'text';
                else if (Math.random() > 0.7) type = 'ring';

                createExplosion(shell.pos, parseInt(shell.color), type, shell.text);
                shell.exploded = true;
                shellsRef.current.splice(i, 1);
            }
        }

        // Update Particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const p = particlesRef.current[i];
            
            p.pos.x += p.vel.x;
            p.pos.y += p.vel.y;
            p.pos.z += p.vel.z;

            // Physics
            p.vel.x *= DRAG;
            p.vel.y *= DRAG;
            p.vel.z *= DRAG;
            p.vel.y += GRAVITY;

            // Text Special Physics: Transform from explosion to stillness
            if (p.type === 'text') {
                 p.vel.x *= 0.90; // Stop faster
                 p.vel.y *= 0.90;
                 p.vel.z *= 0.90;
                 // Add "Twinkle"
                 if(Math.random() > 0.95) p.size = random(3, 8);
                 else p.size = random(2, 4);
            }

            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                particlesRef.current.splice(i, 1);
            }
        }
    };

    // ----------------------------------------------------------------------
    // Logic: Draw Loop (3D Projection)
    // ----------------------------------------------------------------------
    const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        // Dark trail background for motion blur feel
        ctx.fillStyle = 'rgba(5, 5, 16, 0.2)'; 
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;
        const fov = 600;

        // Auto Rotation + Mouse Influence
        const time = Date.now() * 0.0002;
        const angleY = (mouseRef.current.x - cx) * 0.0003 + Math.sin(time) * 0.1;
        const angleX = (mouseRef.current.y - cy) * 0.0003 - 0.1; 

        const project = (v: Vector3) => {
            let x = v.x * Math.cos(angleY) - v.z * Math.sin(angleY);
            let z = v.z * Math.cos(angleY) + v.x * Math.sin(angleY);
            let y = v.y * Math.cos(angleX) - z * Math.sin(angleX);
             z = z * Math.cos(angleX) + v.y * Math.sin(angleX);

            const scale = fov / (fov + z + 600); 
            return {
                x: cx + x * scale,
                y: cy + y * scale,
                scale: scale,
                z: z // Return Z for sorting
            };
        };

        // Project all particles
        const renderList: any[] = [];
        
        // Project Shells
        shellsRef.current.forEach(shell => {
            const p = project(shell.pos);
            renderList.push({
                type: 'shell',
                x: p.x, y: p.y, z: p.z, scale: p.scale,
                color: shell.color
            });
        });

        // Project Particles
        particlesRef.current.forEach(p => {
            const proj = project(p.pos);
            // Optimization: Cull particles behind camera or too far
            if (proj.scale > 0 && proj.z > -500) {
                renderList.push({
                    type: p.type,
                    x: proj.x, y: proj.y, z: proj.z, scale: proj.scale,
                    color: p.color,
                    alpha: p.alpha,
                    size: p.size
                });
            }
        });

        // Sort by depth (Painter's Algorithm) - Critical for 3D realism
        renderList.sort((a, b) => b.z - a.z);

        // Render
        renderList.forEach(p => {
            if (p.type === 'shell') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4 * p.scale, 0, Math.PI * 2);
                ctx.fillStyle = `hsl(${p.color}, 100%, 80%)`;
                ctx.fill();
                // Glow
                ctx.shadowBlur = 15;
                ctx.shadowColor = `hsl(${p.color}, 100%, 50%)`;
                ctx.stroke();
                ctx.shadowBlur = 0;
            } else if (p.type === 'text') {
                 const size = Math.max(1, p.size * p.scale);
                 ctx.fillStyle = `${p.color}${p.alpha})`;
                 // Use circles for text for cleaner look
                 ctx.beginPath();
                 ctx.arc(p.x, p.y, size/2, 0, Math.PI * 2);
                 ctx.fill();
            } else {
                 // Spark
                 const size = Math.max(0.6, p.size * p.scale);
                 ctx.beginPath();
                 ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                 ctx.fillStyle = `${p.color}${p.alpha})`;
                 ctx.fill();
            }
        });
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // "lighter" makes overlapping particles glow brightly
        ctx.globalCompositeOperation = 'lighter';

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMouseMove);

        const loop = () => {
            update(canvas.width, canvas.height);
            draw(ctx, canvas.width, canvas.height);
            animationRef.current = requestAnimationFrame(loop);
        };
        loop();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    // Manual Launch on Click
    const handleClick = (e: React.MouseEvent) => {
         const rect = canvasRef.current?.getBoundingClientRect();
         if(!rect) return;
         
         const x = (e.clientX - rect.width/2) * 2; // Exaggerate X for 3D feel
         
         shellsRef.current.push({
            pos: { x: x, y: rect.height, z: random(-200, 200) },
            vel: { x: random(-2,2), y: random(-22, -28), z: random(-2,2) },
            targetY: random(-400, -200),
            color: `${random(0,360)}`,
            exploded: false
        });
    };

    return (
        <canvas 
            ref={canvasRef} 
            className="fixed inset-0 z-10 cursor-pointer"
            onClick={handleClick}
        />
    );
};

export default FireworksStage;
