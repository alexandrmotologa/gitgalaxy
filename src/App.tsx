import { useState } from 'react';
import { useGalaxyState } from './hooks/useGalaxyState';
import { useGitPlayback } from './hooks/useGitPlayback';
import { GalaxyCanvas } from './scene/GalaxyCanvas';
import { HUDOverlay } from './components/HUDOverlay';
import { TimelineScrubber } from './components/TimelineScrubber';
import { FileDetailDrawer } from './components/FileDetailDrawer';
import { ChurnLegend } from './components/ChurnLegend';
import { GitUploaderModal } from './components/GitUploaderModal';
import { HotspotLeaderboard } from './components/HotspotLeaderboard';
import { CommitDetailModal } from './components/CommitDetailModal';
import { CockpitHUD, FlightTelemetry } from './components/CockpitHUD';

export function App() {
  const {
    repository,
    isLoading,
    selectedFileId,
    hoveredFileId,
    focusTarget,
    isUploaderOpen,
    searchQuery,
    selectedAuthorFilter,
    selectedExtensionFilter,
    isHotspotMode,
    isCinematicMode,
    isConstellationsVisible,
    isPilotMode,
    inspectedCommit,
    isCommitModalOpen,
    topHotspots,
    availableExtensions,
    branches,
    setIsUploaderOpen,
    selectFile,
    closeFileDetails,
    setHoveredFileId,
    resetCamera,
    setSearchQuery,
    setSelectedAuthorFilter,
    setSelectedExtensionFilter,
    toggleHotspotMode,
    toggleCinematicMode,
    toggleConstellations,
    togglePilotMode,
    openCommitModal,
    closeCommitModal,
    loadCustomLog,
    loadCommitsDirectly,
    loadSampleDemo,
    handleFilesUpdated,
  } = useGalaxyState();

  const {
    isPlaying,
    currentIndex,
    totalCommits,
    currentCommit,
    speed,
    laserBeams,
    shockwaves,
    supernovas,
    isMergeActive,
    togglePlay,
    seek,
    stepForward,
    stepBackward,
    setSpeed,
  } = useGitPlayback({
    repository,
    onFilesUpdated: handleFilesUpdated,
  });

  const [flightTelemetry, setFlightTelemetry] = useState<FlightTelemetry>({
    speed: 0,
    boostActive: false,
    distanceToCore: 0,
    altitude: 0,
  });

  const selectedFile = selectedFileId && repository ? repository.files.get(selectedFileId) || null : null;
  const hoveredFile = hoveredFileId && repository ? repository.files.get(hoveredFileId) || null : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-galaxy-950 font-sans">
      {/* 3D Scene */}
      {repository ? (
        <GalaxyCanvas
          repository={repository}
          selectedFileId={selectedFileId}
          focusTarget={focusTarget}
          activeCommit={currentCommit}
          laserBeams={laserBeams}
          shockwaves={shockwaves}
          supernovas={supernovas}
          branches={branches}
          isMergeActive={isMergeActive}
          isHotspotMode={isHotspotMode}
          isCinematicMode={isCinematicMode}
          isConstellationsVisible={isConstellationsVisible}
          isPilotMode={isPilotMode}
          authorFilter={selectedAuthorFilter}
          extensionFilter={selectedExtensionFilter}
          searchQuery={searchQuery}
          onSelectFile={selectFile}
          onHoverFile={(fileId) => setHoveredFileId(fileId)}
          onFlightTelemetryUpdate={setFlightTelemetry}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-galaxy-950 text-cyan-400 font-mono text-sm">
          {isLoading ? 'Synthesizing 3D Galaxy Universe...' : 'No Repository Loaded'}
        </div>
      )}

      {/* Floating HUD Overlay */}
      <HUDOverlay
        repository={repository}
        activeCommit={currentCommit}
        hoveredFile={hoveredFile}
        searchQuery={searchQuery}
        selectedAuthorFilter={selectedAuthorFilter}
        selectedExtensionFilter={selectedExtensionFilter}
        availableExtensions={availableExtensions}
        isHotspotMode={isHotspotMode}
        isCinematicMode={isCinematicMode}
        isConstellationsVisible={isConstellationsVisible}
        isPilotMode={isPilotMode}
        onSearchChange={setSearchQuery}
        onAuthorFilterChange={setSelectedAuthorFilter}
        onExtensionFilterChange={setSelectedExtensionFilter}
        onSelectFile={selectFile}
        onToggleHotspotMode={toggleHotspotMode}
        onToggleCinematicMode={toggleCinematicMode}
        onToggleConstellations={toggleConstellations}
        onTogglePilotMode={togglePilotMode}
        onInspectCommit={openCommitModal}
        onOpenUploader={() => setIsUploaderOpen(true)}
        onResetCamera={resetCamera}
      />

      {/* First-Person Pilot Cockpit HUD */}
      {isPilotMode && (
        <CockpitHUD
          telemetry={flightTelemetry}
          onExit={togglePilotMode}
        />
      )}

      {/* Architectural Debt Radar Leaderboard */}
      <HotspotLeaderboard
        isOpen={isHotspotMode}
        hotspots={topHotspots}
        onSelectFile={selectFile}
        onClose={toggleHotspotMode}
      />

      {/* Bottom Controls Area */}
      <div className="absolute bottom-5 inset-x-0 flex items-end justify-center pointer-events-none px-6 z-30">
        <div className="flex items-end justify-between w-full max-w-7xl">
          {/* Empty left spacer to center scrubber */}
          <div className="w-64 hidden lg:block" />

          {/* Central Timeline Scrubber */}
          <TimelineScrubber
            isPlaying={isPlaying}
            currentIndex={currentIndex}
            totalCommits={totalCommits}
            currentCommit={currentCommit}
            speed={speed}
            onTogglePlay={togglePlay}
            onStepBackward={stepBackward}
            onStepForward={stepForward}
            onSeek={seek}
            onSetSpeed={setSpeed}
          />

          {/* Bottom Right Churn Legend */}
          <div className="w-64 flex justify-end hidden lg:flex">
            <ChurnLegend />
          </div>
        </div>
      </div>

      {/* Selected File Details Drawer */}
      <FileDetailDrawer
        file={selectedFile}
        commits={repository?.commits || []}
        onClose={closeFileDetails}
        onFocusNode={() => selectFile(selectedFileId!)}
      />

      {/* Commit Diff & Detail Inspection Modal */}
      <CommitDetailModal
        commit={inspectedCommit || currentCommit || null}
        isOpen={isCommitModalOpen}
        onClose={closeCommitModal}
        onFocusFile={(filePath) => selectFile(filePath)}
        onPrevCommit={() => {
          stepBackward();
          if (currentIndex > 0 && repository) {
            openCommitModal(repository.commits[currentIndex - 1]);
          }
        }}
        onNextCommit={() => {
          stepForward();
          if (currentIndex < totalCommits - 1 && repository) {
            openCommitModal(repository.commits[currentIndex + 1]);
          }
        }}
        hasPrev={currentIndex > 0}
        hasNext={currentIndex < totalCommits - 1}
      />

      {/* Git Log / GitHub URL Uploader Modal */}
      <GitUploaderModal
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onLoadLog={loadCustomLog}
        onLoadCommits={loadCommitsDirectly}
        onLoadSample={loadSampleDemo}
      />
    </div>
  );
}

export default App;
