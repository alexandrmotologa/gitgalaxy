import { useState } from 'react';
import { GitCommit, RepositoryData, FileNode } from '../engine/types';
import { Volume2, VolumeX, Upload, RotateCcw, GitCommit as GitCommitIcon, Folder, Users, FileCode, Check, Copy } from 'lucide-react';
import { soundFx } from '../engine/audioSynthesizer';

interface HUDOverlayProps {
  repository: RepositoryData | null;
  activeCommit?: GitCommit;
  hoveredFile?: FileNode | null;
  onOpenUploader: () => void;
  onResetCamera: () => void;
}

export function HUDOverlay({
  repository,
  activeCommit,
  hoveredFile,
  onOpenUploader,
  onResetCamera,
}: HUDOverlayProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [copied, setCopied] = useState(false);

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundFx.setMuted(nextState);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const author = activeCommit && repository ? repository.authors.get(activeCommit.author) : null;
  const authorColor = author ? author.color : '#00f0ff';

  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between select-none">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-4">
        {/* Active Commit Card */}
        {activeCommit ? (
          <div className="bg-galaxy-900/85 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 w-96 shadow-[0_4px_30px_rgba(0,240,255,0.15)] pointer-events-auto transition-all duration-200">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: authorColor }}
                />
                <span className="font-mono text-xs font-bold text-gray-200">
                  {activeCommit.author}
                </span>
              </div>
              <button
                onClick={() => copyHash(activeCommit.hash)}
                className="flex items-center gap-1 font-mono text-[11px] text-cyan-400 hover:text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20 transition-colors"
                title="Copy commit hash"
              >
                <span>{activeCommit.hash.slice(0, 7)}</span>
                {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
              </button>
            </div>

            <div className="text-sm font-sans font-medium text-gray-100 mb-2.5 line-clamp-2 leading-snug">
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
          </div>
        ) : (
          <div className="bg-galaxy-900/80 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-4 text-xs font-mono text-gray-400 pointer-events-auto">
            Initializing celestial commit stream...
          </div>
        )}

        {/* Repository Telemetry & Action Bar */}
        <div className="bg-galaxy-900/85 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-3 shadow-xl pointer-events-auto flex items-center gap-3">
          {/* Telemetry Stats */}
          {repository && (
            <div className="flex items-center gap-4 px-2 text-xs font-mono border-r border-gray-800 pr-4">
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

          {/* Action Buttons */}
          <button
            onClick={onResetCamera}
            className="p-2 rounded-xl text-gray-300 hover:text-cyan-300 hover:bg-cyan-950/50 transition-colors border border-transparent hover:border-cyan-500/30"
            title="Recenter Camera to Galactic Core"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl transition-colors border ${
              !isMuted
                ? 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                : 'text-gray-400 hover:text-gray-200 border-transparent hover:bg-gray-800'
            }`}
            title={isMuted ? 'Unmute Space Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button
            onClick={onOpenUploader}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all"
          >
            <Upload size={14} />
            <span>Import Log</span>
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
