import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RepositoryData } from '../engine/types';

interface ConstellationLinesProps {
  repository: RepositoryData;
  visible?: boolean;
  activeDirectoryId?: string | null;
}

export function ConstellationLines({
  repository,
  visible = true,
  activeDirectoryId = null,
}: ConstellationLinesProps) {
  const lineMeshRef = useRef<THREE.LineSegments>(null);

  // Generate constellation connection vertices between sibling files in each directory
  const { linePositions, lineColors } = useMemo(() => {
    const posList: number[] = [];
    const colList: number[] = [];

    repository.directories.forEach((dir) => {
      const filesInDir = dir.fileIds
        .map((fId) => repository.files.get(fId))
        .filter((f): f is NonNullable<typeof f> => f !== undefined);

      if (filesInDir.length < 2) return;

      const dirColor = new THREE.Color(dir.color || '#38bdf8');

      // 1. Connect files to directory orbital centroid
      const [dx, dy, dz] = dir.position;

      // Connect files in a star constellation graph (to nearest siblings and to cluster center)
      for (let i = 0; i < filesInDir.length; i++) {
        const fileA = filesInDir[i];
        const [ax, ay, az] = fileA.position;

        // Line from File to Directory Core
        posList.push(ax, ay, az, dx, dy, dz);
        colList.push(dirColor.r * 0.7, dirColor.g * 0.7, dirColor.b * 0.7);
        colList.push(dirColor.r * 0.3, dirColor.g * 0.3, dirColor.b * 0.3);

        // Line to next sibling file (forming a constellation polygon/web)
        if (i < filesInDir.length - 1) {
          const fileB = filesInDir[i + 1];
          const [bx, by, bz] = fileB.position;

          const dist = Math.hypot(ax - bx, ay - by, az - bz);
          if (dist < 45) {
            posList.push(ax, ay, az, bx, by, bz);
            colList.push(dirColor.r * 0.9, dirColor.g * 0.9, dirColor.b * 0.9);
            colList.push(dirColor.r * 0.9, dirColor.g * 0.9, dirColor.b * 0.9);
          }
        }
      }
    });

    return {
      linePositions: new Float32Array(posList),
      lineColors: new Float32Array(colList),
    };
  }, [repository]);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    return geom;
  }, [linePositions, lineColors]);

  useFrame(({ clock }) => {
    if (lineMeshRef.current && visible) {
      const mat = lineMeshRef.current.material as THREE.LineBasicMaterial;
      // Gentle cosmic breathing glow
      const t = clock.getElapsedTime();
      mat.opacity = (activeDirectoryId ? 0.45 : 0.22) + Math.sin(t * 1.5) * 0.05;
    }
  });

  if (!visible || linePositions.length === 0) return null;

  return (
    <lineSegments ref={lineMeshRef} geometry={geometry}>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.25}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}
