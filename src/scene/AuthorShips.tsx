import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GitAuthor, GitCommit, FileNode } from '../engine/types';

interface AuthorShipsProps {
  authors: Map<string, GitAuthor>;
  activeCommit?: GitCommit;
  files: Map<string, FileNode>;
}

interface ShipState {
  currentPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  velocity: THREE.Vector3;
  color: string;
}

export function AuthorShips({ authors, activeCommit, files }: AuthorShipsProps) {
  const authorList = useMemo(() => Array.from(authors.values()), [authors]);

  // Persistent ship positions and target states
  const shipsRef = useRef<Map<string, ShipState>>(new Map());

  // Initialize or update ship states
  useMemo(() => {
    authorList.forEach((author) => {
      if (!shipsRef.current.has(author.name)) {
        const beacon = new THREE.Vector3(...author.beaconPosition);
        shipsRef.current.set(author.name, {
          currentPos: beacon.clone().add(new THREE.Vector3(0, -4, 0)),
          targetPos: beacon.clone(),
          velocity: new THREE.Vector3(),
          color: author.color,
        });
      }
    });
  }, [authorList]);

  // Target assignment when active commit changes
  useMemo(() => {
    if (!activeCommit) return;
    const authorShip = shipsRef.current.get(activeCommit.author);
    if (!authorShip) return;

    // Find center of modified files in active commit
    if (activeCommit.diffs.length > 0) {
      const targetVec = new THREE.Vector3();
      let matched = 0;

      activeCommit.diffs.forEach((diff) => {
        const file = files.get(diff.path);
        if (file) {
          targetVec.add(new THREE.Vector3(...file.position));
          matched++;
        }
      });

      if (matched > 0) {
        targetVec.divideScalar(matched);
        // Hover slightly above the file cluster
        targetVec.y += 8;
        authorShip.targetPos.copy(targetVec);
      }
    }
  }, [activeCommit, files]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    authorList.forEach((author, idx) => {
      const shipState = shipsRef.current.get(author.name);
      const shipMesh = groupRef.current!.children[idx] as THREE.Group | undefined;
      if (!shipState || !shipMesh) return;

      const isActive = activeCommit?.author === author.name;

      if (!isActive) {
        // Patrol orbit around beacon
        const beacon = new THREE.Vector3(...author.beaconPosition);
        const patrolAngle = time * 0.4 + idx;
        const patrolRadius = 14;
        shipState.targetPos.set(
          beacon.x + Math.cos(patrolAngle) * patrolRadius,
          beacon.y + Math.sin(time * 0.8 + idx) * 3,
          beacon.z + Math.sin(patrolAngle) * patrolRadius
        );
      }

      // Smoothly steer ship towards target position
      const speed = isActive ? 5.5 : 2.0;
      shipState.currentPos.lerp(shipState.targetPos, delta * speed);

      shipMesh.position.copy(shipState.currentPos);

      // Orient ship towards movement direction
      const lookTarget = shipState.targetPos.clone();
      shipMesh.lookAt(lookTarget);

      // Gentle banking roll animation
      shipMesh.rotation.z += Math.sin(time * 2 + idx) * 0.15;
    });
  });

  // Stealth Delta Fighter Geometry
  const shipGeometry = useMemo(() => {
    const geom = new THREE.ConeGeometry(1.4, 4.2, 4);
    geom.rotateX(Math.PI / 2); // Align nose forward along Z
    return geom;
  }, []);

  return (
    <group ref={groupRef}>
      {authorList.map((author) => {
        const isActive = activeCommit?.author === author.name;

        return (
          <group key={author.name}>
            {/* Main Ship Hull */}
            <mesh geometry={shipGeometry}>
              <meshStandardMaterial
                color={author.color}
                emissive={author.color}
                emissiveIntensity={isActive ? 2.5 : 0.6}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>

            {/* Glowing Ion Thruster Trail */}
            <mesh position={[0, 0, -2.5]}>
              <cylinderGeometry args={[0.2, 0.7, 3, 8]} />
              <meshBasicMaterial
                color={isActive ? '#ffffff' : author.color}
                transparent
                opacity={isActive ? 0.9 : 0.4}
              />
            </mesh>

            {/* Thruster Spotlight */}
            {isActive && (
              <pointLight color={author.color} intensity={3} distance={25} />
            )}
          </group>
        );
      })}
    </group>
  );
}
