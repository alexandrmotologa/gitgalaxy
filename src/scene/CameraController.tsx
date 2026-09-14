import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

interface CameraControllerProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  focusTarget: [number, number, number] | null;
}

export function CameraController({ controlsRef, focusTarget }: CameraControllerProps) {
  const { camera } = useThree();
  const targetVec = useRef(new THREE.Vector3(0, 0, 0));
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (focusTarget) {
      targetVec.current.set(...focusTarget);
      isTransitioning.current = true;
    }
  }, [focusTarget]);

  useFrame((_, delta) => {
    if (!controlsRef.current || !isTransitioning.current) return;

    // Smoothly lerp OrbitControls target to focused node
    controlsRef.current.target.lerp(targetVec.current, delta * 3.5);

    // Keep camera at comfortable observation distance
    const desiredCamPos = new THREE.Vector3()
      .copy(targetVec.current)
      .add(new THREE.Vector3(12, 16, 24));

    camera.position.lerp(desiredCamPos, delta * 2.5);
    controlsRef.current.update();

    if (controlsRef.current.target.distanceTo(targetVec.current) < 0.2) {
      isTransitioning.current = false;
    }
  });

  return null;
}
