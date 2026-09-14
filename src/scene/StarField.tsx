import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StarFieldProps {
  count?: number;
}

/**
 * Creates a soft glowing circular sprite texture on a canvas.
 * Discards harsh square edges and ensures smooth circular anti-aliased stars.
 */
function createCircularGlowTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, 64, 64);
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    gradient.addColorStop(0.0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.25, 'rgba(230, 245, 255, 0.85)');
    gradient.addColorStop(0.55, 'rgba(100, 190, 255, 0.35)');
    gradient.addColorStop(0.85, 'rgba(50, 120, 240, 0.08)');
    gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Circulating cosmic stardust layer: 1,400 glowing circular particles
 * orbiting inside the galaxy among the planetary files and directories.
 */
function CirculatingStardust({ texture }: { texture: THREE.Texture }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1400;

  const [positions, colors, speeds, angles, radii, yOffsets] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const ang = new Float32Array(count);
    const rad = new Float32Array(count);
    const yOff = new Float32Array(count);

    const dustColors = [
      new THREE.Color('#00f0ff'), // Neon cyan
      new THREE.Color('#38bdf8'), // Ice blue
      new THREE.Color('#c084fc'), // Soft violet
      new THREE.Color('#f43f5e'), // Rose
      new THREE.Color('#fef08a'), // Starlight gold
      new THREE.Color('#34d399'), // Emerald
    ];

    for (let i = 0; i < count; i++) {
      // Orbiting radius from near core (20) to outer planetary rim (290)
      const r = 20 + Math.random() * 270;
      const a = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 45;

      rad[i] = r;
      ang[i] = a;
      yOff[i] = y;

      // Keplerian angular velocity: inner particles orbit faster
      spd[i] = (0.04 + Math.random() * 0.06) / Math.sqrt(r / 40);

      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(a) * r;

      const c = dustColors[Math.floor(Math.random() * dustColors.length)];
      const brightness = 0.55 + Math.random() * 0.45;
      col[i * 3] = c.r * brightness;
      col[i * 3 + 1] = c.g * brightness;
      col[i * 3 + 2] = c.b * brightness;
    }

    return [pos, col, spd, ang, rad, yOff];
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      angles[i] += speeds[i] * delta * 0.5;
      const r = radii[i];
      const a = angles[i];

      posArr[i * 3] = Math.cos(a) * r;
      // Gentle cosmic undulation
      posArr[i * 3 + 1] = yOffsets[i] + Math.sin(time * 0.7 + i * 0.1) * 3;
      posArr[i * 3 + 2] = Math.sin(a) * r;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={3.2}
        map={texture}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function StarField({ count = 3000 }: StarFieldProps) {
  const celestialRef = useRef<THREE.Points>(null);
  const starTexture = useMemo(() => createCircularGlowTexture(), []);

  // Background celestial stars on a distant sphere (radius 1400 - 2500)
  const [starPositions, starColors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const baseColors = [
      new THREE.Color('#38bdf8'), // Cyan / Ice blue
      new THREE.Color('#818cf8'), // Periwinkle
      new THREE.Color('#ffffff'), // White
      new THREE.Color('#fef08a'), // Warm gold
      new THREE.Color('#f472b6'), // Rose
    ];

    for (let i = 0; i < count; i++) {
      const radius = 1400 + Math.random() * 1100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const color = baseColors[Math.floor(Math.random() * baseColors.length)];
      const brightness = 0.65 + Math.random() * 0.35;
      col[i * 3] = color.r * brightness;
      col[i * 3 + 1] = color.g * brightness;
      col[i * 3 + 2] = color.b * brightness;
    }

    return [pos, col];
  }, [count]);

  useFrame((_, delta) => {
    if (celestialRef.current) {
      celestialRef.current.rotation.y += delta * 0.003;
    }
  });

  return (
    <group>
      {/* 1. Circulating local stardust (swirling inside the galaxy with circular glowing particles) */}
      <CirculatingStardust texture={starTexture} />

      {/* 2. Crisp distant celestial backdrop stars */}
      <points ref={celestialRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[starColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={3.0}
          map={starTexture}
          vertexColors
          transparent
          opacity={0.85}
          sizeAttenuation={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
