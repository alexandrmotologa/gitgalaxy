import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { GitCommit } from '../engine/types';

interface TimelineScrubberProps {
  isPlaying: boolean;
  currentIndex: number;
  totalCommits: number;
  currentCommit?: GitCommit;
  speed: number;
  onTogglePlay: () => void;
  onStepBackward: () => void;
  onStepForward: () => void;
  onSeek: (index: number) => void;
  onSetSpeed: (speed: number) => void;
}

const SPEED_OPTIONS = [0.1, 0.25, 0.5, 1, 5, 25];

export function TimelineScrubber({
  isPlaying,
  currentIndex,
  totalCommits,
  currentCommit,
  speed,
  onTogglePlay,
  onStepBackward,
  onStepForward,
  onSeek,
  onSetSpeed,
}: TimelineScrubberProps) {
  const formattedDate = currentCommit
    ? new Date(currentCommit.date).toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
    : '0000-00-00 00:00 UTC';

  return (
    <div className="bg-galaxy-900/85 backdrop-blur-md border border-cyan-500/30 rounded-2xl px-5 py-3 shadow-[0_4px_30px_rgba(0,240,255,0.15)] flex flex-col gap-2 w-full max-w-3xl pointer-events-auto select-none">
      {/* Top row: controls, current timestamp, speed */}
      <div className="flex items-center justify-between">
        {/* Playback Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onStepBackward}
            disabled={currentIndex <= 0}
            className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-950/40 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Previous Commit"
          >
            <SkipBack size={16} />
          </button>

          <button
            onClick={onTogglePlay}
            className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
            title={isPlaying ? 'Pause' : 'Play Timeline'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
          </button>

          <button
            onClick={onStepForward}
            disabled={currentIndex >= totalCommits - 1}
            className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-950/40 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Next Commit"
          >
            <SkipForward size={16} />
          </button>
        </div>

        {/* Date and Commit Counter */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-gray-400">{formattedDate}</span>
          <span className="text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20">
            {totalCommits > 0 ? currentIndex + 1 : 0} / {totalCommits}
          </span>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-gray-950/60 p-1 rounded-xl border border-gray-800 text-[11px] font-mono">
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSetSpeed(s)}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                speed === s
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Bottom row: Range scrubber slider */}
      <div className="relative flex items-center">
        <input
          type="range"
          min={0}
          max={Math.max(0, totalCommits - 1)}
          value={currentIndex}
          onChange={(e) => onSeek(parseInt(e.target.value, 10))}
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
        />
      </div>
    </div>
  );
}
