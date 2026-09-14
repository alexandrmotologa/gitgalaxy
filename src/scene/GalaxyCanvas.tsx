import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { RepositoryData, LaserBeam, Shockwave } from '../engine/types';
import { StarField } from './StarField';
import { GalacticCore } from './GalacticCore';
import { DirectoryOrbits } from './DirectoryOrbits';
import { FileNodesMesh } from './FileNodesMesh';
import { AuthorBeacons } from './AuthorBeacons';
import { CommitLaserTrails } from './CommitLaserTrails';
import { ShockwaveRings } from './ShockwaveRings';
import { CameraController } from './CameraController';

interface GalaxyCanvasProps {
  repository: RepositoryData;
  selectedFileId: string | null;
  focusTarget: [number, number, number] | null;
  activeAuthorName?: string;
  laserBeams: LaserBeam[];
  shockwaves: Shockwave[];
  onSelectFile: (fileId: string) => void;
  onHoverFile: (fileId: string | null, position?: [number, number, number]) => void;
}

export function GalaxyCanvas({
  repository,
  selectedFileId,
  focusTarget,
  activeAuthorName,
  laserBeams,
  shockwaves,
  onSelectFile,
  onHoverFile,
}: GalaxyCanvasProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <div className="w-full h-full relative bg-galaxy-950">
      <Canvas
        camera={{ position: [0, 95, 180], fov: 55, near: 0.5, far: 2000 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#030712']} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[100, 150, 80]} intensity={0.8} />
        <pointLight position={[-80, -50, -80]} color="#38bdf8" intensity={1.5} distance={300} />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.06}
          minDistance={10}
          maxDistance={700}
          maxPolarAngle={Math.PI / 2 + 0.25}
        />

        <CameraController controlsRef={controlsRef} focusTarget={focusTarget} />
        <StarField count={2500} />
        <GalacticCore />
        <DirectoryOrbits directories={repository.directories} />
        <FileNodesMesh
          files={repository.files}
          selectedFileId={selectedFileId}
          onSelectFile={onSelectFile}
          onHoverFile={onHoverFile}
        />
        <AuthorBeacons authors={repository.authors} activeAuthorName={activeAuthorName} />
        <CommitLaserTrails beams={laserBeams} />
        <ShockwaveRings shockwaves={shockwaves} />
      </Canvas>
    </div>
  );
}
