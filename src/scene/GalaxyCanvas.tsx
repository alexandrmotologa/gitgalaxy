import { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { RepositoryData, LaserBeam, Shockwave, GitCommit, BranchTrajectory, SupernovaEvent } from '../engine/types';
import { StarField } from './StarField';
import { GalacticCore } from './GalacticCore';
import { DirectoryOrbits } from './DirectoryOrbits';
import { FileNodesMesh } from './FileNodesMesh';
import { AuthorBeacons } from './AuthorBeacons';
import { AuthorShips } from './AuthorShips';
import { CommitLaserTrails } from './CommitLaserTrails';
import { ShockwaveRings } from './ShockwaveRings';
import { CameraController } from './CameraController';
import { BranchBelts } from './BranchBelts';
import { ConstellationLines } from './ConstellationLines';
import { GalacticSupernova } from './GalacticSupernova';
import { FlightController } from './FlightController';
import { FlightTelemetry } from '../components/CockpitHUD';

interface GalaxyCanvasProps {
  repository: RepositoryData;
  selectedFileId: string | null;
  focusTarget: [number, number, number] | null;
  activeCommit?: GitCommit;
  laserBeams: LaserBeam[];
  shockwaves: Shockwave[];
  supernovas?: SupernovaEvent[];
  branches?: BranchTrajectory[];
  isMergeActive?: boolean;
  isHotspotMode?: boolean;
  isCinematicMode?: boolean;
  isConstellationsVisible?: boolean;
  isPilotMode?: boolean;
  authorFilter?: string | null;
  extensionFilter?: string | null;
  searchQuery?: string;
  activeCommitFiles?: Set<string>;
  onSelectFile: (fileId: string) => void;
  onHoverFile: (fileId: string | null, position?: [number, number, number]) => void;
  onFlightTelemetryUpdate?: (telemetry: FlightTelemetry) => void;
  onBranchClick?: (branchName: string) => void;
}

export function GalaxyCanvas({
  repository,
  selectedFileId,
  focusTarget,
  activeCommit,
  laserBeams,
  shockwaves,
  supernovas = [],
  branches = [],
  isMergeActive = false,
  isHotspotMode = false,
  isCinematicMode = false,
  isConstellationsVisible = true,
  isPilotMode = false,
  authorFilter = null,
  extensionFilter = null,
  searchQuery = '',
  activeCommitFiles,
  onSelectFile,
  onHoverFile,
  onFlightTelemetryUpdate,
  onBranchClick,
}: GalaxyCanvasProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Determine if any filter is active — hides non-essential scene clutter
  const q = searchQuery.trim();
  const isAnyFilterActive = Boolean(authorFilter || extensionFilter || q);

  // Compute active commit center of gravity for cinematic camera
  const activeCommitTarget = useMemo(() => {
    if (!activeCommit || activeCommit.diffs.length === 0) return null;
    const center = new THREE.Vector3();
    let count = 0;
    activeCommit.diffs.forEach((diff) => {
      const file = repository.files.get(diff.path);
      if (file) {
        center.add(new THREE.Vector3(...file.position));
        count++;
      }
    });
    if (count === 0) return null;
    center.divideScalar(count);
    return [center.x, center.y, center.z] as [number, number, number];
  }, [activeCommit, repository]);

  return (
    <div id="galaxy-canvas-container" className="w-full h-full relative bg-galaxy-950">
      <Canvas
        camera={{ position: [0, 95, 180], fov: 55, near: 0.5, far: 5000 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
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
          enabled={!isPilotMode}
        />

        {!isPilotMode && (
          <CameraController
            controlsRef={controlsRef}
            focusTarget={focusTarget}
            isCinematicMode={isCinematicMode}
            activeCommitTarget={activeCommitTarget}
          />
        )}

        <FlightController
          enabled={isPilotMode}
          onTelemetryUpdate={onFlightTelemetryUpdate}
        />

        <StarField count={2800} />
        <GalacticCore />

        {/* Hide orbits, belts, ships, beacons, constellations when filtering */}
        {!isAnyFilterActive && (
          <>
            <DirectoryOrbits directories={repository.directories} />
            <BranchBelts
              branches={branches}
              activeBranch={activeCommit?.branch}
              isMergeActive={isMergeActive}
              onBranchClick={onBranchClick}
            />
            <ConstellationLines
              repository={repository}
              visible={isConstellationsVisible}
            />
            <AuthorBeacons authors={repository.authors} activeAuthorName={activeCommit?.author} />
            <AuthorShips
              authors={repository.authors}
              activeCommit={activeCommit}
              files={repository.files}
            />
          </>
        )}

        <FileNodesMesh
          files={repository.files}
          selectedFileId={selectedFileId}
          isHotspotMode={isHotspotMode}
          authorFilter={authorFilter}
          extensionFilter={extensionFilter}
          searchQuery={searchQuery}
          activeCommitFiles={activeCommitFiles}
          onSelectFile={onSelectFile}
          onHoverFile={onHoverFile}
        />

        <CommitLaserTrails beams={laserBeams} />
        <ShockwaveRings shockwaves={shockwaves} />
        <GalacticSupernova events={supernovas} />
      </Canvas>
    </div>
  );
}

