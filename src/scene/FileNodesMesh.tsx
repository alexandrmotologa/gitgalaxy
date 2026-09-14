import { useRef, useMemo, useEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { FileNode } from '../engine/types';
import { getHeatColorRgb } from '../engine/churnCalculator';

interface FileNodesMeshProps {
  files: Map<string, FileNode>;
  selectedFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onHoverFile: (fileId: string | null, position?: [number, number, number]) => void;
}

const tempMatrix = new THREE.Matrix4();
const tempColor = new THREE.Color();

export function FileNodesMesh({ files, selectedFileId, onSelectFile, onHoverFile }: FileNodesMeshProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const fileArray = useMemo(() => Array.from(files.values()), [files]);
  const count = fileArray.length;

  // Map index -> fileId and fileId -> index
  const indexToFileId = useMemo(() => fileArray.map((f) => f.id), [fileArray]);

  // Sphere geometry for planet nodes
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 16, 16), []);

  // Update instance matrices and initial colors
  useEffect(() => {
    if (!meshRef.current) return;

    fileArray.forEach((file, idx) => {
      const [x, y, z] = file.position;
      const s = file.size;

      tempMatrix.makeTranslation(x, y, z);
      tempMatrix.scale(new THREE.Vector3(s, s, s));
      meshRef.current!.setMatrixAt(idx, tempMatrix);

      const [r, g, b] = getHeatColorRgb(file.heat);
      tempColor.setRGB(r, g, b);
      meshRef.current!.setColorAt(idx, tempColor);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [fileArray]);

  // Real-time frame loop updating colors when heat changes or pulsing selected node
  useFrame((state) => {
    if (!meshRef.current || !meshRef.current.instanceColor) return;

    let needsColorUpdate = false;
    const time = state.clock.elapsedTime;

    fileArray.forEach((file, idx) => {
      const isSelected = file.id === selectedFileId;
      const [r, g, b] = getHeatColorRgb(file.heat);

      if (isSelected) {
        // Pulse selected node with bright neon white/cyan glow
        const pulse = 0.5 + Math.sin(time * 6) * 0.5;
        tempColor.setRGB(Math.min(1, r + pulse * 0.4), Math.min(1, g + pulse * 0.4), Math.min(1, b + pulse * 0.4));
      } else {
        tempColor.setRGB(r, g, b);
      }

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

  // Find selected file position for halo ring
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
          emissiveIntensity={0.35}
        />
      </instancedMesh>

      {/* Target indicator ring around selected node */}
      {selectedNode && (
        <group position={selectedNode.position}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[selectedNode.size * 1.5, selectedNode.size * 1.7, 32]} />
            <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} transparent opacity={0.9} />
          </mesh>
          <pointLight color="#ffffff" intensity={2} distance={15} />
        </group>
      )}
    </group>
  );
}
