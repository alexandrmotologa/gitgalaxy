import { useState, useCallback, useEffect } from 'react';
import { useGalaxyState } from './hooks/useGalaxyState';
import { useGitPlayback } from './hooks/useGitPlayback';
import { GalaxyCanvas } from './scene/GalaxyCanvas';
import { HUDOverlay } from './components/HUDOverlay';
import { TimelineScrubber } from './components/TimelineScrubber';
import { FileDetailDrawer } from './components/FileDetailDrawer';
import { AuthorDetailDrawer } from './components/AuthorDetailDrawer';
import { BranchDetailDrawer } from './components/BranchDetailDrawer';
import { ChurnLegend } from './components/ChurnLegend';
import { GitUploaderModal } from './components/GitUploaderModal';
import { HotspotLeaderboard } from './components/HotspotLeaderboard';
import { CommitDetailModal } from './components/CommitDetailModal';
import { CockpitHUD, FlightTelemetry } from './components/CockpitHUD';
import { HelpGuideModal } from './components/HelpGuideModal';
import { CommitMessageBanner } from './components/CommitMessageBanner';

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
    selectedBranch,
    selectedAuthor,
    selectedBranchFiles,
    selectedBranchColor,
    isHotspotMode,
    isCinematicMode,
    isConstellationsVisible,
    isPilotMode,
    isGuideOpen,
    inspectedCommit,
    isCommitModalOpen,
    topHotspots,
    availableExtensions,
    branches,
    setIsUploaderOpen,
    setIsGuideOpen,
    selectFile,
    closeFileDetails,
    selectBranch,
    selectAuthor,
    setHoveredFileId,
    setFocusTarget,
    resetCamera,
    setSearchQuery,
    setSelectedAuthorFilter,
    setSelectedExtensionFilter,
    toggleHotspotMode,
    toggleCinematicMode,
    toggleConstellations,
    togglePilotMode,
    toggleGuide,
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
    activeCommitFiles,
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

  // Global Keyboard Shortcuts (C = Constellations, H = Hotspots, P = Pilot, Space = Play/Pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        toggleConstellations();
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        toggleHotspotMode();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        togglePilotMode();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'Escape') {
        if (isGuideOpen) setIsGuideOpen(false);
        if (isCommitModalOpen) closeCommitModal();
        if (isUploaderOpen) setIsUploaderOpen(false);
        if (selectedAuthor) selectAuthor(null);
        if (selectedBranch) selectBranch(null);
        if (selectedFileId) closeFileDetails();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    toggleConstellations,
    toggleHotspotMode,
    togglePilotMode,
    togglePlay,
    isGuideOpen,
    isCommitModalOpen,
    isUploaderOpen,
    selectedAuthor,
    selectedBranch,
    selectedFileId,
    setIsGuideOpen,
    closeCommitModal,
    setIsUploaderOpen,
    selectAuthor,
    selectBranch,
    closeFileDetails,
  ]);

  // Clicking a branch label focuses that branch orbit & highlights its changes without hiding galaxy
  const handleBranchClick = useCallback(
    (branchName: string) => {
      selectBranch(selectedBranch === branchName ? null : branchName);
    },
    [selectBranch, selectedBranch]
  );

  const selectedFile = selectedFileId && repository ? repository.files.get(selectedFileId) || null : null;
  const hoveredFile = hoveredFileId && repository ? repository.files.get(hoveredFileId) || null : null;

  // Determine if any modal/drawer is open to conceal 3D HTML overlays
  const isAnyModalOpen = Boolean(
    isGuideOpen ||
    isCommitModalOpen ||
    isUploaderOpen ||
    selectedFileId ||
    selectedAuthor ||
    selectedBranch
  );

  const activeBranchData = selectedBranch ? branches.find((b) => b.name === selectedBranch) || null : null;

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
          selectedBranch={selectedBranch}
          selectedBranchFiles={selectedBranchFiles}
          selectedBranchColor={selectedBranchColor}
          isMergeActive={isMergeActive}
          isHotspotMode={isHotspotMode}
          isCinematicMode={isCinematicMode}
          isConstellationsVisible={isConstellationsVisible}
          isPilotMode={isPilotMode}
          isModalOpen={isAnyModalOpen}
          authorFilter={selectedAuthorFilter}
          extensionFilter={selectedExtensionFilter}
          searchQuery={searchQuery}
          activeCommitFiles={activeCommitFiles}
          onSelectFile={selectFile}
          onHoverFile={(fileId) => setHoveredFileId(fileId)}
          onFlightTelemetryUpdate={setFlightTelemetry}
          onBranchClick={handleBranchClick}
          onSelectAuthor={(author) => selectAuthor(author)}
          onCoreClick={() => currentCommit && openCommitModal(currentCommit)}
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
        selectedBranch={selectedBranch}
        availableExtensions={availableExtensions}
        isHotspotMode={isHotspotMode}
        isCinematicMode={isCinematicMode}
        isConstellationsVisible={isConstellationsVisible}
        isPilotMode={isPilotMode}
        onSearchChange={setSearchQuery}
        onAuthorFilterChange={setSelectedAuthorFilter}
        onExtensionFilterChange={setSelectedExtensionFilter}
        onClearBranchFilter={() => selectBranch(null)}
        onSelectFile={selectFile}
        onToggleHotspotMode={toggleHotspotMode}
        onToggleCinematicMode={toggleCinematicMode}
        onToggleConstellations={toggleConstellations}
        onTogglePilotMode={togglePilotMode}
        onInspectCommit={openCommitModal}
        onOpenUploader={() => setIsUploaderOpen(true)}
        onOpenGuide={toggleGuide}
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

      {/* Commit Message Banner — animated interactive overlay during playback */}
      <CommitMessageBanner
        commit={currentCommit}
        isPlaying={isPlaying}
        onInspectCommit={openCommitModal}
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

      {/* Selected Author Profile Drawer */}
      <AuthorDetailDrawer
        author={selectedAuthor}
        repository={repository}
        onClose={() => selectAuthor(null)}
        onFocusBeacon={(pos) => setFocusTarget(pos)}
        onFilterAuthor={(name) => {
          setSelectedAuthorFilter(name);
          selectAuthor(null);
        }}
        onInspectCommit={openCommitModal}
      />

      {/* Selected Branch Details Drawer */}
      <BranchDetailDrawer
        branch={activeBranchData}
        repository={repository}
        onClose={() => selectBranch(null)}
        onFocusBranch={(radius) => setFocusTarget([radius * 0.7, radius * 0.3, radius * 0.7])}
        onInspectCommit={openCommitModal}
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

      {/* Field Manual & Visual Guide Modal */}
      <HelpGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}

export default App;
