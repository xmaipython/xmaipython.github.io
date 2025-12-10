export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export interface Particle3D {
    pos: Vector3;
    vel: Vector3;
    acc: Vector3;
    color: string; // hsla string
    alpha: number;
    size: number;
    decay: number;
    life: number;
    type: 'spark' | 'text' | 'flash';
}

export interface Shell {
    pos: Vector3;
    vel: Vector3;
    targetY: number;
    color: string;
    text?: string; // If present, explodes into text
    exploded: boolean;
}

export interface Particle {
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
    vx: number;
    vy: number;
    rotation: number;
    rotationSpeed: number;
    life: number;
}