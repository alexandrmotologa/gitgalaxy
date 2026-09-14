import { X, FileCode, Flame, GitCommit as GitCommitIcon, User, Crosshair } from 'lucide-react';
import { FileNode, GitCommit } from '../engine/types';
import { getHeatColorHex } from '../engine/churnCalculator';

interface FileDetailDrawerProps {
  file: FileNode | null;
  commits: GitCommit[];
  onClose: () => void;
  onFocusNode: (position: [number, number, number]) => void;
}

export function FileDetailDrawer({
  file,
  commits,
  onClose,
  onFocusNode,
}: FileDetailDrawerProps) {
  if (!file) return null;

  // Filter commits that affected this file
  const fileCommits = commits
    .filter((c) => c.diffs.some((d) => d.path === file.path))
    .slice(-8)
    .reverse();

  const heatColor = getHeatColorHex(file.heat);

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-galaxy-900/90 backdrop-blur-xl border-l border-cyan-500/30 p-5 shadow-[-10px_0_30px_rgba(0,0,0,0.7)] flex flex-col justify-between z-40 animate-slide-left pointer-events-auto">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <FileCode size={20} />
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold text-white truncate max-w-[210px]" title={file.filename}>
                {file.filename}
              </h3>
              <p className="font-mono text-[11px] text-gray-400 truncate max-w-[210px]" title={file.directory}>
                {file.directory}/
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Heat Meter */}
        <div className="mt-4 p-3.5 rounded-xl bg-gray-950/60 border border-gray-800">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Flame size={14} style={{ color: heatColor }} />
              Thermal Churn
            </span>
            <span className="font-bold" style={{ color: heatColor }}>
              {(file.heat * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${Math.max(5, file.heat * 100)}%`,
                backgroundColor: heatColor,
                boxShadow: `0 0 10px ${heatColor}`,
              }}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 mt-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-gray-950/50 border border-gray-800">
            <span className="text-gray-400 text-[10px] block uppercase">Additions</span>
            <span className="text-emerald-400 font-bold text-sm">+{file.additions}</span>
          </div>
          <div className="p-3 rounded-xl bg-gray-950/50 border border-gray-800">
            <span className="text-gray-400 text-[10px] block uppercase">Deletions</span>
            <span className="text-rose-400 font-bold text-sm">-{file.deletions}</span>
          </div>
          <div className="p-3 rounded-xl bg-gray-950/50 border border-gray-800">
            <span className="text-gray-400 text-[10px] block uppercase">Total Commits</span>
            <span className="text-cyan-300 font-bold text-sm">{file.commitCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-gray-950/50 border border-gray-800">
            <span className="text-gray-400 text-[10px] block uppercase">Top Contributor</span>
            <span className="text-amber-300 font-bold text-xs truncate block" title={file.topAuthor}>
              {file.topAuthor || 'None'}
            </span>
          </div>
        </div>

        {/* Commit History for this file */}
        <div className="mt-5">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-400 mb-2.5 flex items-center gap-1.5">
            <GitCommitIcon size={14} className="text-cyan-400" />
            Recent Revisions ({fileCommits.length})
          </h4>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {fileCommits.map((c) => (
              <div
                key={c.hash}
                className="p-2.5 rounded-lg bg-gray-950/40 border border-gray-800/80 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="text-cyan-400">{c.hash.slice(0, 7)}</span>
                  <span className="text-gray-400 flex items-center gap-1">
                    <User size={10} />
                    {c.author}
                  </span>
                </div>
                <p className="text-xs font-sans text-gray-300 line-clamp-1">{c.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Focus in 3D Button */}
      <div className="pt-4 border-t border-gray-800">
        <button
          onClick={() => onFocusNode(file.position)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-mono text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
        >
          <Crosshair size={16} />
          <span>Focus in 3D Space</span>
        </button>
      </div>
    </div>
  );
}
