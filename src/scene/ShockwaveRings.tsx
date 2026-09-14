import * as THREE from 'three';
import { Shockwave } from '../engine/types';

interface ShockwaveRingsProps {
  shockwaves: Shockwave[];
}

export function ShockwaveRings({ shockwaves }: ShockwaveRingsProps) {
  if (shockwaves.length === 0) return null;

  return (
    <group>
      {shockwaves.map((wave) => (
        <mesh
          key={wave.id}
          position={wave.position}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[Math.max(0.1, wave.radius - 0.4), wave.radius, 32]} />
          <meshBasicMaterial
            color={wave.color}
            side={THREE.DoubleSide}
            transparent
            opacity={wave.opacity}
          />
        </mesh>
      ))}
    </group>
  );
}
