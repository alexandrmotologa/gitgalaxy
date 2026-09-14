import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { GitAuthor } from '../engine/types';

interface AuthorBeaconsProps {
  authors: Map<string, GitAuthor>;
  activeAuthorName?: string;
  isModalOpen?: boolean;
  onSelectAuthor?: (author: GitAuthor) => void;
}

export function AuthorBeacons({
  authors,
  activeAuthorName,
  isModalOpen = false,
  onSelectAuthor,
}: AuthorBeaconsProps) {
  const authorList = useMemo(() => Array.from(authors.values()), [authors]);

  return (
    <group>
      {authorList.map((author) => {
        const [x, y, z] = author.beaconPosition;
        const isActive = author.name === activeAuthorName;

        return (
          <group key={author.name} position={[x, y, z]}>
            {/* Astral Satellite Beacon */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelectAuthor?.(author);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
              }}
            >
              <octahedronGeometry args={[isActive ? 3.5 : 2.4]} />
              <meshStandardMaterial
                color={author.color}
                emissive={author.color}
                emissiveIntensity={isActive ? 2.8 : 1.0}
                wireframe={!isActive}
              />
            </mesh>

            {/* Pulsing beacon light */}
            {isActive && (
              <pointLight color={author.color} intensity={4} distance={60} />
            )}

            {/* Contributor Label — hidden when modal is open and zIndexRange locked to 0 */}
            {!isModalOpen && (
              <Html
                position={[0, 4.5, 0]}
                center
                distanceFactor={90}
                zIndexRange={[0, 0]}
                className="select-none whitespace-nowrap"
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAuthor?.(author);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-all duration-300 cursor-pointer hover:scale-110 ${
                    isActive
                      ? 'bg-opacity-95 shadow-[0_0_15px_rgba(0,240,255,0.6)] scale-110'
                      : 'bg-opacity-70 opacity-85 hover:opacity-100'
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
            )}
          </group>
        );
      })}
    </group>
  );
}
