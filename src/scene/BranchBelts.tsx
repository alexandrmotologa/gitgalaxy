import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { BranchTrajectory } from '../engine/types';

interface BranchBeltsProps {
  branches: BranchTrajectory[];
  activeBranch?: string;
  selectedBranch?: string | null;
  isMergeActive?: boolean;
  visible?: boolean;
  isModalOpen?: boolean;
  showAllBelts?: boolean;
  onBranchClick?: (branchName: string) => void;
}

export function BranchBelts({
  branches,
  activeBranch,
  selectedBranch = null,
  isMergeActive,
  visible = true,
  isModalOpen = false,
  showAllBelts = false,
  onBranchClick,
}: BranchBeltsProps) {
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
        const isCommitActive = activeBranch === branch.name;
        const isSelected = selectedBranch === branch.name;
        const isHighlighted = isCommitActive || isSelected;

        // By default (Option A): Only render the ring when actively playing or selected.
        // If showAllBelts is enabled (toggle ON): render all branch rings.
        if (!showAllBelts && !isHighlighted) {
          return null;
        }

        const color = new THREE.Color(branch.color);

        return (
          <group
            key={branch.name}
            rotation={[branch.tiltAngle, 0, branch.tiltAngle * 0.5]}
          >
            {/* Luminous orbital ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[branch.radius, isHighlighted ? 0.42 : 0.12, 16, 120]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={isSelected ? 0.95 : isCommitActive ? 0.85 : 0.22}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Faint particle ring along orbit */}
            <points rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[branch.radius - 0.5, branch.radius + 0.5, 64]} />
              <pointsMaterial
                color={color}
                size={isHighlighted ? 2.0 : 0.6}
                transparent
                opacity={isHighlighted ? 0.95 : 0.2}
                blending={THREE.AdditiveBlending}
              />
            </points>

            {/* 3D Floating Branch Label — hidden when modal is open and locked to zIndexRange 0 */}
            {!isModalOpen && (
              <Html
                position={[branch.radius, 0.5, 0]}
                center
                distanceFactor={80}
                zIndexRange={[0, 0]}
                className="select-none"
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onBranchClick?.(branch.name);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono whitespace-nowrap transition-all duration-300 backdrop-blur-md flex items-center gap-1.5 cursor-pointer hover:scale-110 ${
                    isSelected
                      ? 'bg-cyan-900/95 border-2 border-cyan-300 text-white shadow-[0_0_18px_rgba(0,240,255,0.8)] scale-115 ring-2 ring-cyan-400/40'
                      : isCommitActive
                      ? 'bg-cyan-950/90 border border-cyan-400 text-white shadow-[0_0_12px_rgba(0,240,255,0.6)] scale-110'
                      : 'bg-black/70 border border-gray-700/60 text-gray-300 opacity-80 hover:border-cyan-500/50 hover:text-white hover:opacity-100'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shadow-[0_0_6px_currentColor]"
                    style={{ backgroundColor: branch.color }}
                  />
                  <span className="font-bold">{branch.name}</span>
                  <span className="text-[9px] text-gray-400 font-normal">({branch.commitCount})</span>
                </div>
              </Html>
            )}

            {/* Merge Synthesis Arc to Core */}
            {isMergeActive && isCommitActive && branch.name !== 'main' && (
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
