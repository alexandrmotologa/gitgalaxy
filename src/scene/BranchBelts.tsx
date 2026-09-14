import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { BranchTrajectory } from '../engine/types';

interface BranchBeltsProps {
  branches: BranchTrajectory[];
  activeBranch?: string;
  isMergeActive?: boolean;
  visible?: boolean;
  onBranchClick?: (branchName: string) => void;
}

export function BranchBelts({ branches, activeBranch, isMergeActive, visible = true, onBranchClick }: BranchBeltsProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Very slow planetary rotation
      groupRef.current.rotation.y += delta * 0.03;
    }
  });

  if (!visible || !branches || branches.length === 0) return null;

  return (
    <group ref={groupRef}>
      {branches.map((branch) => {
        const isActive = activeBranch === branch.name;
        const color = new THREE.Color(branch.color);

        return (
          <group
            key={branch.name}
            rotation={[branch.tiltAngle, 0, branch.tiltAngle * 0.5]}
          >
            {/* Luminous orbital ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[branch.radius, isActive ? 0.35 : 0.18, 16, 120]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={isActive ? 0.85 : 0.3}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Faint particle ring along orbit */}
            <points rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[branch.radius - 0.5, branch.radius + 0.5, 64]} />
              <pointsMaterial
                color={color}
                size={isActive ? 1.5 : 0.8}
                transparent
                opacity={isActive ? 0.9 : 0.35}
                blending={THREE.AdditiveBlending}
              />
            </points>

            {/* 3D Floating Branch Label — zIndexRange keeps it behind modals (z-50) */}
            <Html
              position={[branch.radius, 0.5, 0]}
              center
              distanceFactor={80}
              zIndexRange={[0, 0]}
              className="select-none"
            >
              <div
                onClick={() => onBranchClick?.(branch.name)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono whitespace-nowrap transition-all duration-300 backdrop-blur-md flex items-center gap-1.5 cursor-pointer hover:scale-110 ${
                  isActive
                    ? 'bg-cyan-950/90 border border-cyan-400 text-white shadow-[0_0_12px_rgba(0,240,255,0.6)] scale-110'
                    : 'bg-black/60 border border-gray-700/60 text-gray-400 opacity-70 hover:border-cyan-500/50 hover:text-gray-200'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: branch.color }}
                />
                <span className="font-semibold">{branch.name}</span>
                <span className="text-[9px] text-gray-500">({branch.commitCount})</span>
              </div>
            </Html>

            {/* Merge Synthesis Arc to Core */}
            {isMergeActive && isActive && branch.name !== 'main' && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[branch.radius * 0.5, 0.6, 16, 60, Math.PI]} />
                <meshBasicMaterial
                  color="#ffffff"
                  transparent
                  opacity={0.9}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
