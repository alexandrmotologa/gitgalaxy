import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

interface CameraControllerProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  focusTarget: [number, number, number] | null;
  isCinematicMode?: boolean;
  activeCommitTarget?: [number, number, number] | null;
}

export function CameraController({
  controlsRef,
  focusTarget,
  isCinematicMode = false,
  activeCommitTarget,
}: CameraControllerProps) {
  const { camera } = useThree();
  const targetVec = useRef(new THREE.Vector3(0, 0, 0));
  const isTransitioning = useRef(false);

  // Manual target focus (e.g. click from Search or Leaderboard)
  useEffect(() => {
    if (focusTarget) {
      targetVec.current.set(...focusTarget);
      isTransitioning.current = true;
    }
  }, [focusTarget]);

  // Cinematic tracking of active commit
  useEffect(() => {
    if (isCinematicMode && activeCommitTarget) {
      targetVec.current.set(...activeCommitTarget);
      isTransitioning.current = true;
    }
  }, [isCinematicMode, activeCommitTarget]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    if (isTransitioning.current) {
      // Smoothly lerp OrbitControls target to focused node
      controlsRef.current.target.lerp(targetVec.current, delta * 3.5);

      const offset = isCinematicMode
        ? new THREE.Vector3(25, 20, 35)
        : new THREE.Vector3(12, 16, 24);

      const desiredCamPos = new THREE.Vector3()
        .copy(targetVec.current)
        .add(offset);

      camera.position.lerp(desiredCamPos, delta * 2.2);
      controlsRef.current.update();

      if (controlsRef.current.target.distanceTo(targetVec.current) < 0.3) {
        isTransitioning.current = false;
      }
    } else if (isCinematicMode) {
      // Subtle continuous slow orbit around action
      const orbitSpeed = 0.15;
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = orbitSpeed;
      controlsRef.current.update();
    } else {
      controlsRef.current.autoRotate = false;
    }
  });

  return null;
}
