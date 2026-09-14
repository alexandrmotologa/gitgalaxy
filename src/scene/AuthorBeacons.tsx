import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { GitAuthor } from '../engine/types';

interface AuthorBeaconsProps {
  authors: Map<string, GitAuthor>;
  activeAuthorName?: string;
}

export function AuthorBeacons({ authors, activeAuthorName }: AuthorBeaconsProps) {
  const authorList = useMemo(() => Array.from(authors.values()), [authors]);

  return (
    <group>
      {authorList.map((author) => {
        const [x, y, z] = author.beaconPosition;
        const isActive = author.name === activeAuthorName;

        return (
          <group key={author.name} position={[x, y, z]}>
            {/* Astral Satellite Beacon */}
            <mesh>
              <octahedronGeometry args={[isActive ? 3.5 : 2.2]} />
              <meshStandardMaterial
                color={author.color}
                emissive={author.color}
                emissiveIntensity={isActive ? 2.5 : 0.8}
                wireframe={!isActive}
              />
            </mesh>

            {/* Pulsing beacon light */}
            {isActive && (
              <pointLight color={author.color} intensity={4} distance={60} />
            )}

            {/* Contributor Label */}
            <Html
              position={[0, 4.5, 0]}
              center
              distanceFactor={90}
              className="pointer-events-none select-none whitespace-nowrap"
            >
              <div
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-all duration-300 ${
                  isActive
                    ? 'bg-opacity-95 shadow-[0_0_15px_rgba(0,240,255,0.6)] scale-110'
                    : 'bg-opacity-70 opacity-85'
                }`}
                style={{
                  backgroundColor: '#0b0f19',
                  borderColor: author.color,
                  borderWidth: '1px',
                  color: isActive ? '#ffffff' : author.color,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: author.color }}
                />
                <span>{author.name}</span>
                <span className="text-[10px] text-gray-400">({author.commitCount})</span>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
