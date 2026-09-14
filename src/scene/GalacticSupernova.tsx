import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { SupernovaEvent } from '../engine/types';

interface GalacticSupernovaProps {
  events: SupernovaEvent[];
}

export function GalacticSupernova({ events }: GalacticSupernovaProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    // Dynamic updates handled via props and timing
  });

  if (!events || events.length === 0) return null;

  const now = performance.now();

  return (
    <group ref={groupRef}>
      {events.map((event) => {
        const elapsed = (now - event.startTime) / event.duration;
        if (elapsed < 0 || elapsed >= 1.0) return null;

        const currentRadius = 8 + elapsed * (event.maxRadius - 8);
        const opacity = Math.max(0, (1 - elapsed) * 0.95);
        const color = new THREE.Color(event.color || '#00f0ff');

        return (
          <group key={event.id} position={event.position}>
            {/* Expanding equatorial ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[currentRadius - 2, currentRadius, 64]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={opacity}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Expanding 3D spherical geodesic wavefront */}
            <mesh>
              <icosahedronGeometry args={[currentRadius * 0.92, 2]} />
              <meshBasicMaterial
                color={color}
                wireframe
                transparent
                opacity={opacity * 0.5}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Outer secondary halo ring */}
            <mesh rotation={[Math.PI / 2 + 0.3, 0.4, 0]}>
              <ringGeometry args={[currentRadius * 0.6 - 1, currentRadius * 0.6, 48]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={opacity * 0.8}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Optional Floating 3D Milestone Label */}
            {event.label && elapsed < 0.85 && (
              <Html
                position={[0, currentRadius * 0.4 + 10, 0]}
                center
                distanceFactor={100}
                className="pointer-events-none select-none"
              >
                <div className="bg-gradient-to-r from-cyan-500/90 to-purple-600/90 text-white font-mono text-xs font-black tracking-widest px-3.5 py-1.5 rounded-full border border-white/40 shadow-[0_0_25px_rgba(0,240,255,0.8)] uppercase whitespace-nowrap animate-bounce">
                  ⚡ {event.label}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
