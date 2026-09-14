import { useState } from 'react';
import { GitCommit, RepositoryData, FileNode } from '../engine/types';
import {
  Volume2,
  VolumeX,
  Upload,
  RotateCcw,
  GitCommit as GitCommitIcon,
  GitBranch,
  Folder,
  Users,
  FileCode,
  Check,
  Copy,
  Flame,
  Video,
  Camera,
  Rocket,
  Sliders,
  HelpCircle,
} from 'lucide-react';
import { soundFx } from '../engine/audioSynthesizer';
import { SearchBar3D } from './SearchBar3D';
import { ConstellationIcon } from './ConstellationIcon';

interface HUDOverlayProps {
  repository: RepositoryData | null;
  activeCommit?: GitCommit;
  hoveredFile?: FileNode | null;
  searchQuery: string;
  selectedAuthorFilter: string | null;
  selectedExtensionFilter: string | null;
  selectedBranch?: string | null;
  availableExtensions: string[];
  isHotspotMode: boolean;
  isCinematicMode: boolean;
  isConstellationsVisible?: boolean;
  isBranchBeltsVisible?: boolean;
  isPilotMode?: boolean;
  onSearchChange: (query: string) => void;
  onAuthorFilterChange: (author: string | null) => void;
  onExtensionFilterChange: (ext: string | null) => void;
  onClearBranchFilter?: () => void;
  onSelectFile: (fileId: string) => void;
  onToggleHotspotMode: () => void;
  onToggleCinematicMode: () => void;
  onToggleConstellations?: () => void;
  onToggleBranchBelts?: () => void;
  onTogglePilotMode?: () => void;
  onInspectCommit?: (commit: GitCommit) => void;
  onOpenUploader: () => void;
  onOpenGuide?: () => void;
  onResetCamera: () => void;
}

export function HUDOverlay({
  repository,
  activeCommit,
  hoveredFile,
  searchQuery,
  selectedAuthorFilter,
  selectedExtensionFilter,
  selectedBranch,
  availableExtensions,
  isHotspotMode,
  isCinematicMode,
  isConstellationsVisible = true,
  isBranchBeltsVisible = false,
  isPilotMode = false,
  onSearchChange,
  onAuthorFilterChange,
  onExtensionFilterChange,
  onClearBranchFilter,
  onSelectFile,
  onToggleHotspotMode,
  onToggleCinematicMode,
  onToggleConstellations,
  onToggleBranchBelts,
  onTogglePilotMode,
  onInspectCommit,
  onOpenUploader,
  onOpenGuide,
  onResetCamera,
}: HUDOverlayProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.85);
  const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundFx.setMuted(nextState);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundFx.setMasterVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
      soundFx.setMuted(false);
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const captureScreenshot = () => {
    setIsCapturing(true);
    try {
      const container = document.querySelector('#galaxy-canvas-container');
      const canvas = container?.querySelector('canvas') as HTMLCanvasElement | null;
      if (!canvas) {
        alert('Could not locate canvas element.');
        return;
      }

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const repoTitle = repository?.name ? repository.name.replace(/\//g, '_') : 'galaxy';
      link.download = `gitgalaxy-${repoTitle}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Screenshot failed:', err);
      alert('Could not export screenshot.');
    } finally {
      setIsCapturing(false);
    }
  };

  const author = activeCommit && repository ? repository.authors.get(activeCommit.author) : null;
  const authorColor = author ? author.color : '#00f0ff';

  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between select-none">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Active Commit Card */}
        {activeCommit ? (
          <div
            onClick={() => onInspectCommit && onInspectCommit(activeCommit)}
            className="bg-galaxy-900/85 backdrop-blur-md border border-cyan-500/30 hover:border-cyan-400/80 rounded-2xl p-4 w-80 lg:w-96 shadow-[0_4px_30px_rgba(0,240,255,0.15)] pointer-events-auto transition-all duration-200 cursor-pointer group hover:scale-[1.01]"
            title="Click to inspect full commit diff and stats"
          >
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: authorColor }}
                />
                <span className="font-mono text-xs font-bold text-gray-200">
                  {activeCommit.author}
                </span>
                {activeCommit.branch && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                    {activeCommit.branch}
                  </span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyHash(activeCommit.hash);
                }}
                className="flex items-center gap-1 font-mono text-[11px] text-cyan-400 hover:text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20 transition-colors"
                title="Copy commit hash"
              >
                <span>{activeCommit.hash.slice(0, 7)}</span>
                {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
              </button>
            </div>

            <div className="text-sm font-sans font-medium text-gray-100 mb-2.5 line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
              {activeCommit.message}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
              <span>{new Date(activeCommit.date).toLocaleDateString()}</span>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">
                  +{activeCommit.diffs.reduce((acc, d) => acc + d.additions, 0)}
                </span>
                <span className="text-rose-400">
                  -{activeCommit.diffs.reduce((acc, d) => acc + d.deletions, 0)}
                </span>
                <span className="text-gray-500">
                  ({activeCommit.diffs.length} {activeCommit.diffs.length === 1 ? 'file' : 'files'})
                </span>
              </div>
            </div>
            <div className="mt-2 pt-1 border-t border-gray-800/60 text-[10px] font-mono text-cyan-400/70 group-hover:text-cyan-400 flex items-center justify-between">
              <span>Inspect diffs & metrics &rarr;</span>
            </div>
          </div>
        ) : (
          <div className="bg-galaxy-900/80 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-4 text-xs font-mono text-gray-400 pointer-events-auto">
            Initializing celestial commit stream...
          </div>
        )}

        {/* Center: 3D Search & Filter Engine */}
        <div className="hidden md:block">
          <SearchBar3D
            repository={repository}
            searchQuery={searchQuery}
            selectedAuthorFilter={selectedAuthorFilter}
            selectedExtensionFilter={selectedExtensionFilter}
            selectedBranch={selectedBranch}
            availableExtensions={availableExtensions}
            onSearchChange={onSearchChange}
            onAuthorFilterChange={onAuthorFilterChange}
            onExtensionFilterChange={onExtensionFilterChange}
            onClearBranchFilter={onClearBranchFilter}
            onSelectFile={onSelectFile}
          />
        </div>

        {/* Right: Repository Telemetry & Action Bar */}
        <div className="bg-galaxy-900/85 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-3 shadow-xl pointer-events-auto flex items-center gap-2.5 relative">
          {/* Telemetry Stats */}
          {repository && (
            <div className="hidden xl:flex items-center gap-4 px-2 text-xs font-mono border-r border-gray-800 pr-4">
              <div className="flex items-center gap-1.5 text-gray-300">
                <FileCode size={14} className="text-cyan-400" />
                <span>{repository.files.size}</span>
                <span className="text-[10px] text-gray-500">files</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-300">
                <Folder size={14} className="text-purple-400" />
                <span>{repository.directories.size}</span>
                <span className="text-[10px] text-gray-500">dirs</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-300">
                <Users size={14} className="text-amber-400" />
                <span>{repository.authors.size}</span>
                <span className="text-[10px] text-gray-500">authors</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-300">
                <GitCommitIcon size={14} className="text-emerald-400" />
                <span>{repository.commits.length}</span>
                <span className="text-[10px] text-gray-500">commits</span>
              </div>
            </div>
          )}

          {/* Astral Flight Pilot Mode Toggle */}
          <button
            onClick={onTogglePilotMode}
            className={`p-2 rounded-xl transition-all border ${
              isPilotMode
                ? 'text-cyan-300 bg-cyan-950/80 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.6)] scale-105 animate-pulse'
                : 'text-gray-400 hover:text-cyan-300 border-transparent hover:bg-gray-800'
            }`}
            title="Astral Pilot Mode: Fly manually through the codebase in 6-DOF cockpit mode (WASD + Space + Shift)"
          >
            <Rocket size={16} />
          </button>

          {/* Code Constellation Lines Toggle */}
          <button
            onClick={onToggleConstellations}
            className={`px-2.5 py-1.5 rounded-xl transition-all border flex items-center gap-1.5 ${
              isConstellationsVisible
                ? 'text-cyan-300 bg-cyan-950/80 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)] scale-105'
                : 'text-gray-400 hover:text-gray-200 border-gray-800 hover:bg-gray-800/80'
            }`}
            title="Code Constellations [Shortcut: C]: Toggle celestial web lines between sibling files in directories"
          >
            <ConstellationIcon
              size={16}
              className={isConstellationsVisible ? 'text-cyan-400 animate-pulse' : 'text-gray-400'}
            />
            <span
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                isConstellationsVisible
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {isConstellationsVisible ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Branch Belts Orbital Rings Toggle */}
          <button
            onClick={onToggleBranchBelts}
            className={`px-2.5 py-1.5 rounded-xl transition-all border flex items-center gap-1.5 ${
              isBranchBeltsVisible
                ? 'text-purple-300 bg-purple-950/80 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-105'
                : 'text-gray-400 hover:text-gray-200 border-gray-800 hover:bg-gray-800/80'
            }`}
            title="Branch Belts [Shortcut: B]: Toggle permanent 3D planetary orbital rings for all Git branches"
          >
            <GitBranch
              size={16}
              className={isBranchBeltsVisible ? 'text-purple-400 animate-pulse' : 'text-gray-400'}
            />
            <span
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                isBranchBeltsVisible
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {isBranchBeltsVisible ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Hotspot Debt Radar Toggle */}
          <button
            onClick={onToggleHotspotMode}
            className={`p-2 rounded-xl transition-all border ${
              isHotspotMode
                ? 'text-rose-400 bg-rose-950/60 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.4)] scale-105'
                : 'text-gray-400 hover:text-rose-400 border-transparent hover:bg-gray-800'
            }`}
            title="Architectural Debt Radar: Dim stable code and isolate top volatile hotspots with leaderboard"
          >
            <Flame size={16} className={isHotspotMode ? 'animate-pulse' : ''} />
          </button>

          {/* Cinematic Auto-Director Cam Toggle */}
          <button
            onClick={onToggleCinematicMode}
            className={`p-2 rounded-xl transition-all border ${
              isCinematicMode
                ? 'text-cyan-400 bg-cyan-950/60 border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.4)] scale-105'
                : 'text-gray-400 hover:text-cyan-400 border-transparent hover:bg-gray-800'
            }`}
            title="Cinematic Auto-Director: Hands-free dynamic camera smoothly tracking active commits"
          >
            <Video size={16} />
          </button>

          {/* Recenter Camera */}
          <button
            onClick={onResetCamera}
            className="p-2 rounded-xl text-gray-300 hover:text-cyan-300 hover:bg-cyan-950/50 transition-colors border border-transparent hover:border-cyan-500/30"
            title="Recenter Camera: Return viewpoint to Galactic Core (Trunk)"
          >
            <RotateCcw size={16} />
          </button>

          {/* Audio Synthesizer Master Volume & Mute */}
          <div className="relative">
            <button
              onClick={toggleSound}
              onContextMenu={(e) => {
                e.preventDefault();
                setIsAudioMenuOpen(!isAudioMenuOpen);
              }}
              className={`p-2 rounded-xl transition-colors border ${
                !isMuted
                  ? 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'text-gray-400 hover:text-gray-200 border-transparent hover:bg-gray-800'
              }`}
              title="Audio Synthesizer: Master volume, ambient hum & procedural commit chimes (Click to mute, click sliders for volume)"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* Quick volume toggle button next to mute */}
            <button
              onClick={() => setIsAudioMenuOpen(!isAudioMenuOpen)}
              className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-gray-800 text-gray-400 hover:text-cyan-300"
              title="Adjust Master Volume Slider"
            >
              <Sliders size={9} />
            </button>

            {/* Audio Volume Popover */}
            {isAudioMenuOpen && (
              <div className="absolute right-0 top-12 bg-galaxy-900/95 border border-cyan-500/40 rounded-2xl p-3 shadow-2xl w-48 z-50 font-mono text-xs animate-fade-in">
                <div className="flex items-center justify-between text-gray-300 mb-2">
                  <span>Master Volume</span>
                  <span className="text-cyan-400 font-bold">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Screenshot Capture */}
          <button
            onClick={captureScreenshot}
            disabled={isCapturing}
            className="p-2 rounded-xl text-gray-300 hover:text-cyan-300 hover:bg-cyan-950/50 transition-colors border border-transparent hover:border-cyan-500/30"
            title="4K Screenshot: Export clean high-resolution PNG snapshot of the 3D galaxy"
          >
            <Camera size={16} />
          </button>

          {/* Field Manual / Guide Button */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold text-amber-300 bg-amber-950/70 hover:bg-amber-900/80 border border-amber-500/50 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all"
            title="Field Manual & Visual Legend: Learn what all 3D celestial elements and buttons do"
          >
            <HelpCircle size={14} />
            <span>Guide</span>
          </button>

          {/* Import Modal Button */}
          <button
            onClick={onOpenUploader}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all"
            title="Import Repository: Paste local git log or stream live from any public GitHub repository"
          >
            <Upload size={14} />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* Hover Node Tooltip */}
      {hoveredFile && (
        <div className="self-center bg-galaxy-900/90 backdrop-blur-md border border-cyan-500/40 rounded-xl px-4 py-2 shadow-2xl text-xs font-mono pointer-events-auto flex items-center gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            <span className="font-bold text-white">{hoveredFile.path}</span>
          </div>
          <span className="text-gray-500">|</span>
          <span className="text-gray-300">{hoveredFile.commitCount} commits</span>
          <span className="text-gray-500">|</span>
          <span className="text-cyan-400">Heat: {(hoveredFile.heat * 100).toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}
