import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface FlightTelemetry {
  speed: number;
  boostActive: boolean;
  distanceToCore: number;
  altitude: number;
}

interface FlightControllerProps {
  enabled: boolean;
  onTelemetryUpdate?: (telemetry: FlightTelemetry) => void;
}

export function FlightController({ enabled, onTelemetryUpdate }: FlightControllerProps) {
  const { camera } = useThree();

  const keysPressed = useRef<Record<string, boolean>>({});
  const velocity = useRef(new THREE.Vector3());
  const rotation = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const isMouseDown = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling on space / arrow keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      keysPressed.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 || e.button === 2) {
        isMouseDown.current = true;
        prevMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      isMouseDown.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown.current) return;
      const dx = e.clientX - prevMousePos.current.x;
      const dy = e.clientY - prevMousePos.current.y;
      prevMousePos.current = { x: e.clientX, y: e.clientY };

      const sensitivity = 0.0035;
      rotation.current.y -= dx * sensitivity;
      rotation.current.x -= dy * sensitivity;
      rotation.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotation.current.x));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [enabled]);

  // Sync initial rotation when enabled
  useEffect(() => {
    if (enabled) {
      rotation.current.copy(camera.rotation);
      rotation.current.order = 'YXZ';
    }
  }, [enabled, camera]);

  useFrame((_, delta) => {
    if (!enabled) return;

    camera.quaternion.setFromEuler(rotation.current);

    const keys = keysPressed.current;
    const isBoost = keys['ShiftLeft'] || keys['ShiftRight'];
    const baseSpeed = isBoost ? 110 : 45;

    const moveVector = new THREE.Vector3();

    if (keys['KeyW'] || keys['ArrowUp']) moveVector.z -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) moveVector.z += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) moveVector.x -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) moveVector.x += 1;
    if (keys['Space']) moveVector.y += 1;
    if (keys['KeyC'] || keys['ControlLeft']) moveVector.y -= 1;

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize();
      moveVector.applyQuaternion(camera.quaternion);
      velocity.current.lerp(moveVector.multiplyScalar(baseSpeed), delta * 5);
    } else {
      // Natural inertia damping
      velocity.current.lerp(new THREE.Vector3(0, 0, 0), delta * 4);
    }

    camera.position.addScaledVector(velocity.current, delta);

    if (onTelemetryUpdate) {
      const dist = camera.position.length();
      onTelemetryUpdate({
        speed: Math.round(velocity.current.length() * 10),
        boostActive: !!isBoost,
        distanceToCore: Math.round(dist),
        altitude: Math.round(camera.position.y),
      });
    }
  });

  return null;
}
