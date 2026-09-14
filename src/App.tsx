import { useGalaxyState } from './hooks/useGalaxyState';
import { useGitPlayback } from './hooks/useGitPlayback';
import { GalaxyCanvas } from './scene/GalaxyCanvas';
import { HUDOverlay } from './components/HUDOverlay';
import { TimelineScrubber } from './components/TimelineScrubber';
import { FileDetailDrawer } from './components/FileDetailDrawer';
import { ChurnLegend } from './components/ChurnLegend';
import { GitUploaderModal } from './components/GitUploaderModal';

export function App() {
  const {
    repository,
    isLoading,
    selectedFileId,
    hoveredFileId,
    focusTarget,
    isUploaderOpen,
    setIsUploaderOpen,
    selectFile,
    closeFileDetails,
    setHoveredFileId,
    resetCamera,
    loadCustomLog,
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
    togglePlay,
    seek,
    stepForward,
    stepBackward,
    setSpeed,
  } = useGitPlayback({
    repository,
    onFilesUpdated: handleFilesUpdated,
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
          activeAuthorName={currentCommit?.author}
          laserBeams={laserBeams}
          shockwaves={shockwaves}
          onSelectFile={selectFile}
          onHoverFile={(fileId) => setHoveredFileId(fileId)}
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
        onOpenUploader={() => setIsUploaderOpen(true)}
        onResetCamera={resetCamera}
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

      {/* Git Log Uploader Modal */}
      <GitUploaderModal
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onLoadLog={loadCustomLog}
        onLoadSample={loadSampleDemo}
      />
    </div>
  );
}

export default App;
