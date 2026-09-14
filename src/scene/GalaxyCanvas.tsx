import { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { RepositoryData, LaserBeam, Shockwave, GitCommit, BranchTrajectory, SupernovaEvent, GitAuthor } from '../engine/types';
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
  selectedBranch?: string | null;
  selectedBranchFiles?: Set<string>;
  selectedBranchColor?: string;
  isMergeActive?: boolean;
  isHotspotMode?: boolean;
  isCinematicMode?: boolean;
  isConstellationsVisible?: boolean;
  isBranchBeltsVisible?: boolean;
  isPilotMode?: boolean;
  isModalOpen?: boolean;
  authorFilter?: string | null;
  extensionFilter?: string | null;
  searchQuery?: string;
  activeCommitFiles?: Set<string>;
  onSelectFile: (fileId: string) => void;
  onHoverFile: (fileId: string | null, position?: [number, number, number]) => void;
  onFlightTelemetryUpdate?: (telemetry: FlightTelemetry) => void;
  onBranchClick?: (branchName: string) => void;
  onSelectAuthor?: (author: GitAuthor) => void;
  onCoreClick?: () => void;
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
  selectedBranch = null,
  selectedBranchFiles,
  selectedBranchColor,
  isMergeActive = false,
  isHotspotMode = false,
  isCinematicMode = false,
  isConstellationsVisible = true,
  isBranchBeltsVisible = false,
  isPilotMode = false,
  isModalOpen = false,
  authorFilter = null,
  extensionFilter = null,
  searchQuery = '',
  activeCommitFiles,
  onSelectFile,
  onHoverFile,
  onFlightTelemetryUpdate,
  onBranchClick,
  onSelectAuthor,
  onCoreClick,
}: GalaxyCanvasProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Determine if specific textual/author/ext filter is active
  const q = searchQuery.trim();
  const isSearchActive = Boolean(authorFilter || extensionFilter || q);

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
        <GalacticCore onCoreClick={onCoreClick} />

        {/* Directory Orbits and Branch Belts */}
        <DirectoryOrbits
          directories={repository.directories}
          isModalOpen={isModalOpen}
        />

        <BranchBelts
          branches={branches}
          activeBranch={activeCommit?.branch}
          selectedBranch={selectedBranch}
          isMergeActive={isMergeActive}
          isModalOpen={isModalOpen}
          showAllBelts={isBranchBeltsVisible}
          onBranchClick={onBranchClick}
        />

        {/* Constellations */}
        <ConstellationLines
          repository={repository}
          visible={isConstellationsVisible && !isSearchActive}
        />

        {/* Author Beacons & Ships */}
        <AuthorBeacons
          authors={repository.authors}
          activeAuthorName={activeCommit?.author}
          isModalOpen={isModalOpen}
          onSelectAuthor={onSelectAuthor}
        />

        <AuthorShips
          authors={repository.authors}
          activeCommit={activeCommit}
          files={repository.files}
        />

        {/* Planetary File Nodes */}
        <FileNodesMesh
          files={repository.files}
          selectedFileId={selectedFileId}
          isHotspotMode={isHotspotMode}
          authorFilter={authorFilter}
          extensionFilter={extensionFilter}
          searchQuery={searchQuery}
          selectedBranchFiles={selectedBranchFiles}
          selectedBranchColor={selectedBranchColor}
          activeCommitFiles={activeCommitFiles}
          isModalOpen={isModalOpen}
          onSelectFile={onSelectFile}
          onHoverFile={onHoverFile}
        />

        {/* Commit trails, shockwaves, and supernovas */}
        <CommitLaserTrails beams={laserBeams} />
        <ShockwaveRings shockwaves={shockwaves} />
        <GalacticSupernova events={supernovas} isModalOpen={isModalOpen} />
      </Canvas>
    </div>
  );
}
