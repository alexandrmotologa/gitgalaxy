import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LaserBeam } from '../engine/types';

interface CommitLaserTrailsProps {
  beams: LaserBeam[];
}

const TRAIL_SEGMENTS = 28;

function SpiralLaserSegment({ beam }: { beam: LaserBeam }) {
  const lineRef = useRef<THREE.Line>(null);
  const headMeshRef = useRef<THREE.Mesh>(null);
  const impactGlowRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // 3D Quadratic Bezier with graceful cosmic elevation & lateral spiral offset
  const curve = useMemo(() => {
    const from = new THREE.Vector3(...beam.from);
    const to = new THREE.Vector3(...beam.to);
    const dist = from.distanceTo(to);
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);

    // Arch upwards through celestial space
    mid.y += Math.min(32, Math.max(8, dist * 0.25));

    // Lateral organic curve
    const dir = new THREE.Vector3().subVectors(to, from).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const lateral = new THREE.Vector3().crossVectors(dir, up).normalize();
    const lateralOffset = Math.sin((from.x + to.z) * 0.1) * Math.min(18, dist * 0.16);
    mid.addScaledVector(lateral, lateralOffset);

    return new THREE.QuadraticBezierCurve3(from, mid, to);
  }, [beam.from, beam.to]);

  // Pre-allocate buffer geometry points for line trail
  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(TRAIL_SEGMENTS * 3);
    const colors = new Float32Array(TRAIL_SEGMENTS * 3);
    const baseColor = new THREE.Color(beam.color);

    for (let i = 0; i < TRAIL_SEGMENTS; i++) {
      const alpha = i / (TRAIL_SEGMENTS - 1);
      // Tail is dimmer, head is glowing bright white-tinted
      const c = baseColor.clone().lerp(new THREE.Color('#ffffff'), alpha * 0.7);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [beam.color]);

  // Trailing sparks along the tail
  const sparkCount = 8;
  const sparksGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(sparkCount * 3), 3));
    return geo;
  }, []);

  useFrame(() => {
    const now = performance.now();
    const elapsed = now - beam.startTime;
    const rawProgress = elapsed / beam.duration;

    // Head moves from 0 to 1
    const headT = Math.min(1.0, Math.max(0, rawProgress));
    // Tail follows behind (trail length = 0.32)
    const tailT = Math.min(1.0, Math.max(0, rawProgress - 0.32));

    // Overall trail opacity fades smoothly after head arrives at destination (between 1.0 and 1.35)
    let opacity = 1.0;
    if (rawProgress > 1.0) {
      opacity = Math.max(0, 1.0 - (rawProgress - 1.0) / 0.35);
    }

    // 1. Update line trail points along 3D spiral curve
    if (lineRef.current) {
      const positions = lineGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < TRAIL_SEGMENTS; i++) {
        const step = i / (TRAIL_SEGMENTS - 1);
        const t = tailT + (headT - tailT) * step;
        const pt = curve.getPoint(t);

        // Add helical ripple to simulate luminous spiral energy
        if (headT > 0 && headT < 1.0) {
          const helixRadius = Math.sin(step * Math.PI) * 0.6;
          pt.x += Math.sin(t * 24 + i) * helixRadius;
          pt.y += Math.cos(t * 24 + i) * helixRadius;
        }

        positions[i * 3] = pt.x;
        positions[i * 3 + 1] = pt.y;
        positions[i * 3 + 2] = pt.z;
      }
      lineGeometry.attributes.position.needsUpdate = true;
      (lineRef.current.material as THREE.LineBasicMaterial).opacity = opacity * 0.95;
    }

    // 2. Position glowing meteor head at current tip
    if (headMeshRef.current) {
      if (headT >= 1.0 || rawProgress >= 1.05) {
        headMeshRef.current.visible = false;
      } else {
        headMeshRef.current.visible = true;
        const tipPos = curve.getPoint(headT);
        headMeshRef.current.position.copy(tipPos);
        const headMat = headMeshRef.current.material as THREE.MeshBasicMaterial;
        headMat.opacity = opacity;
      }
    }

    // 3. Impact glow on arrival at target
    if (impactGlowRef.current) {
      if (rawProgress >= 0.95 && rawProgress < 1.35) {
        impactGlowRef.current.visible = true;
        const targetPos = curve.getPoint(1.0);
        impactGlowRef.current.position.copy(targetPos);
        const impactProgress = (rawProgress - 0.95) / 0.4;
        const scale = 1.0 + impactProgress * 2.5;
        impactGlowRef.current.scale.set(scale, scale, scale);
        const mat = impactGlowRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.85 * (1 - impactProgress));
      } else {
        impactGlowRef.current.visible = false;
      }
    }

    // 4. Spark particles along the tail
    if (pointsRef.current) {
      const sparkPositions = sparksGeometry.attributes.position.array as Float32Array;
      for (let s = 0; s < sparkCount; s++) {
        const randOffset = (s / sparkCount) * 0.9;
        const st = Math.max(0, Math.min(1, tailT + (headT - tailT) * randOffset));
        const p = curve.getPoint(st);
        const jitter = 0.4 * (1 - randOffset);
        sparkPositions[s * 3] = p.x + (Math.sin(s * 7 + now * 0.01) * jitter);
        sparkPositions[s * 3 + 1] = p.y + (Math.cos(s * 5 + now * 0.01) * jitter);
        sparkPositions[s * 3 + 2] = p.z + (Math.sin(s * 3 + now * 0.01) * jitter);
      }
      sparksGeometry.attributes.position.needsUpdate = true;
      (pointsRef.current.material as THREE.PointsMaterial).opacity = opacity * 0.8;
    }
  });

  return (
    <group>
      {/* Luminous Glowing Trail Line */}
      <primitive
        ref={lineRef}
        object={
          new THREE.Line(
            lineGeometry,
            new THREE.LineBasicMaterial({
              vertexColors: true,
              transparent: true,
              opacity: 0.9,
              blending: THREE.AdditiveBlending,
              linewidth: 2,
            })
          )
        }
      />

      {/* Glowing Meteor Tip */}
      <mesh ref={headMeshRef}>
        <sphereGeometry args={[1.2, 14, 14]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.95} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Trailing Sparkle Embers */}
      <points ref={pointsRef} geometry={sparksGeometry}>
        <pointsMaterial
          size={1.5}
          color={beam.color}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Target Impact Burst Ring */}
      <mesh ref={impactGlowRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.8, 24]} />
        <meshBasicMaterial color={beam.color} side={THREE.DoubleSide} transparent opacity={0} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

export function CommitLaserTrails({ beams }: CommitLaserTrailsProps) {
  if (beams.length === 0) return null;

  return (
    <group>
      {beams.map((beam) => (
        <SpiralLaserSegment key={beam.id} beam={beam} />
      ))}
    </group>
  );
}
