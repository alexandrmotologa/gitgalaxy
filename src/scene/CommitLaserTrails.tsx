import { useMemo } from 'react';
import * as THREE from 'three';
import { LaserBeam } from '../engine/types';

interface CommitLaserTrailsProps {
  beams: LaserBeam[];
}

function LaserBeamSegment({ beam }: { beam: LaserBeam }) {
  const fromVec = useMemo(() => new THREE.Vector3(...beam.from), [beam.from]);
  const toVec = useMemo(() => new THREE.Vector3(...beam.to), [beam.to]);

  const currentTip = useMemo(
    () => new THREE.Vector3().lerpVectors(fromVec, toVec, Math.min(1, beam.progress)),
    [fromVec, toVec, beam.progress]
  );
  const currentTail = useMemo(
    () => new THREE.Vector3().lerpVectors(fromVec, toVec, Math.max(0, beam.progress - 0.45)),
    [fromVec, toVec, beam.progress]
  );

  const lineObject = useMemo(() => {
    const points = [currentTail, currentTip];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: beam.color,
      transparent: true,
      opacity: Math.max(0.2, 1 - beam.progress * 0.5),
    });
    return new THREE.Line(geo, mat);
  }, [currentTail, currentTip, beam.color, beam.progress]);

  return (
    <group>
      <primitive object={lineObject} />
      {/* Glowing Laser Particle Tip */}
      <mesh position={currentTip.toArray()}>
        <sphereGeometry args={[0.9, 12, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

export function CommitLaserTrails({ beams }: CommitLaserTrailsProps) {
  if (beams.length === 0) return null;

  return (
    <group>
      {beams.map((beam) => (
        <LaserBeamSegment key={beam.id} beam={beam} />
      ))}
    </group>
  );
}
