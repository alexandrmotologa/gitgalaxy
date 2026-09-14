import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { DirectoryNode } from '../engine/types';

interface DirectoryOrbitsProps {
  directories: Map<string, DirectoryNode>;
}

export function DirectoryOrbits({ directories }: DirectoryOrbitsProps) {
  const dirList = useMemo(() => Array.from(directories.values()), [directories]);

  return (
    <group>
      {dirList.map((dir) => {
        if (dir.id === 'root') return null;

        const [x, y, z] = dir.position;

        return (
          <group key={dir.id} position={[x, y, z]}>
            {/* Orbital ring boundary */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[dir.radius * 0.96, dir.radius, 64]} />
              <meshBasicMaterial
                color={dir.color}
                side={THREE.DoubleSide}
                transparent
                opacity={0.25}
              />
            </mesh>

            {/* Subtle central starlet for directory anchor */}
            <mesh>
              <sphereGeometry args={[1.2, 16, 16]} />
              <meshBasicMaterial color={dir.color} transparent opacity={0.7} />
            </mesh>

            {/* Floating label */}
            <Html
              position={[0, 3.5, 0]}
              center
              distanceFactor={80}
              className="pointer-events-none select-none"
            >
              <div
                className="px-2 py-0.5 rounded text-[11px] font-mono tracking-wider font-semibold border backdrop-blur-sm"
                style={{
                  color: dir.color,
                  borderColor: `${dir.color}40`,
                  backgroundColor: 'rgba(11, 15, 25, 0.75)',
                }}
              >
                {dir.name}/
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
