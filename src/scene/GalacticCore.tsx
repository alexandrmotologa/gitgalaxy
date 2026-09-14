import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function GalacticCore() {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (coreRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.08;
      coreRef.current.scale.set(scale, scale, scale);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.4;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z -= delta * 0.2;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central glowing core / black hole event horizon */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[4.5, 32, 32]} />
        <meshStandardMaterial
          color="#030712"
          emissive="#00f0ff"
          emissiveIntensity={1.8}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Internal Accretion Disc */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2.3, 0, 0]}>
        <ringGeometry args={[6.5, 12.5, 64]} />
        <meshBasicMaterial
          color="#38bdf8"
          side={THREE.DoubleSide}
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* Outer Accretion Ring */}
      <mesh ref={outerRingRef} rotation={[-Math.PI / 2.1, 0, 0]}>
        <ringGeometry args={[14, 21, 64]} />
        <meshBasicMaterial
          color="#818cf8"
          side={THREE.DoubleSide}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Point light radiating from galactic core */}
      <pointLight color="#38bdf8" intensity={3.5} distance={120} decay={1.5} />
    </group>
  );
}
