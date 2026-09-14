import { useRef, useMemo, useEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { FileNode } from '../engine/types';
import { getHeatColorRgb } from '../engine/churnCalculator';

interface FileNodesMeshProps {
  files: Map<string, FileNode>;
  selectedFileId: string | null;
  isHotspotMode?: boolean;
  authorFilter?: string | null;
  extensionFilter?: string | null;
  searchQuery?: string;
  onSelectFile: (fileId: string) => void;
  onHoverFile: (fileId: string | null, position?: [number, number, number]) => void;
}

const tempMatrix = new THREE.Matrix4();
const tempColor = new THREE.Color();

export function FileNodesMesh({
  files,
  selectedFileId,
  isHotspotMode = false,
  authorFilter = null,
  extensionFilter = null,
  searchQuery = '',
  onSelectFile,
  onHoverFile,
}: FileNodesMeshProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const fileArray = useMemo(() => Array.from(files.values()), [files]);
  const count = fileArray.length;

  // Map index -> fileId
  const indexToFileId = useMemo(() => fileArray.map((f) => f.id), [fileArray]);

  // Sphere geometry for planet nodes
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 16, 16), []);

  // Update instance matrices and initial colors
  useEffect(() => {
    if (!meshRef.current) return;

    fileArray.forEach((file, idx) => {
      const [x, y, z] = file.position;
      let s = file.size;

      // In Hotspot mode, enlarge critical hotspots
      if (isHotspotMode && file.heat >= 0.5) {
        s *= 1.4;
      }

      tempMatrix.makeTranslation(x, y, z);
      tempMatrix.scale(new THREE.Vector3(s, s, s));
      meshRef.current!.setMatrixAt(idx, tempMatrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [fileArray, isHotspotMode]);

  // Real-time frame loop updating colors
  useFrame((state) => {
    if (!meshRef.current || !meshRef.current.instanceColor) return;

    let needsColorUpdate = false;
    const time = state.clock.elapsedTime;
    const q = searchQuery.toLowerCase().trim();

    fileArray.forEach((file, idx) => {
      const isSelected = file.id === selectedFileId;
      const isSearchMatch = q.length > 0 && file.path.toLowerCase().includes(q);
      const isAuthorMatch = !authorFilter || file.topAuthor === authorFilter;
      const isExtMatch = !extensionFilter || file.extension === extensionFilter;

      let [r, g, b] = getHeatColorRgb(file.heat);

      if (isHotspotMode) {
        if (file.heat < 0.25) {
          // Dim non-hotspots in X-Ray mode
          r *= 0.15;
          g *= 0.15;
          b *= 0.15;
        } else {
          // Pulsing plasma brightness on hotspots
          const pulse = 1 + Math.sin(time * 5 + idx) * 0.25;
          r = Math.min(1, r * pulse);
          g = Math.min(1, g * pulse);
          b = Math.min(1, b * pulse);
        }
      } else if (!isAuthorMatch || !isExtMatch) {
        // Dim filtered out nodes
        r *= 0.18;
        g *= 0.18;
        b *= 0.18;
      } else if (isSearchMatch) {
        // Highlight search matches
        const pulse = 0.5 + Math.sin(time * 8) * 0.5;
        r = Math.min(1, 0.2 + pulse * 0.8);
        g = Math.min(1, 0.9 + pulse * 0.1);
        b = 1;
      } else if (isSelected) {
        // Selected node pulse
        const pulse = 0.5 + Math.sin(time * 6) * 0.5;
        r = Math.min(1, r + pulse * 0.4);
        g = Math.min(1, g + pulse * 0.4);
        b = Math.min(1, b + pulse * 0.4);
      }

      tempColor.setRGB(r, g, b);
      meshRef.current!.setColorAt(idx, tempColor);
      needsColorUpdate = true;
    });

    if (needsColorUpdate) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.instanceId !== undefined && e.instanceId < indexToFileId.length) {
      const fileId = indexToFileId[e.instanceId];
      onSelectFile(fileId);
    }
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.instanceId !== undefined && e.instanceId < indexToFileId.length) {
      const fileId = indexToFileId[e.instanceId];
      const file = files.get(fileId);
      if (file) {
        onHoverFile(fileId, file.position);
      }
    }
  };

  const handlePointerOut = () => {
    onHoverFile(null);
  };

  const selectedNode = selectedFileId ? files.get(selectedFileId) : null;

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[geometry, undefined, count]}
        onPointerDown={handlePointerDown}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <meshStandardMaterial
          roughness={0.25}
          metalness={0.75}
          emissive="#00f0ff"
          emissiveIntensity={isHotspotMode ? 0.6 : 0.35}
        />
      </instancedMesh>

      {/* Target indicator ring around selected node */}
      {selectedNode && (
        <group position={selectedNode.position}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[selectedNode.size * 1.5, selectedNode.size * 1.7, 32]} />
            <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} transparent opacity={0.9} />
          </mesh>
          <pointLight color="#ffffff" intensity={2.5} distance={20} />
        </group>
      )}

      {/* Pulsing danger corona rings for top hotspots when in Hotspot mode */}
      {isHotspotMode &&
        fileArray
          .filter((f) => f.heat >= 0.5)
          .map((hotspot) => (
            <group key={hotspot.id} position={hotspot.position}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[hotspot.size * 1.8, hotspot.size * 2.2, 32]} />
                <meshBasicMaterial
                  color="#ef4444"
                  side={THREE.DoubleSide}
                  transparent
                  opacity={0.8}
                />
              </mesh>
            </group>
          ))}
    </group>
  );
}
