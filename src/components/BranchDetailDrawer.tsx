import { X, GitBranch, GitCommit as GitCommitIcon, Crosshair, RotateCcw } from 'lucide-react';
import { BranchTrajectory, GitCommit, RepositoryData } from '../engine/types';

interface BranchDetailDrawerProps {
  branch: BranchTrajectory | null;
  repository: RepositoryData | null;
  onClose: () => void;
  onFocusBranch: (radius: number) => void;
  onInspectCommit: (commit: GitCommit) => void;
}

export function BranchDetailDrawer({
  branch,
  repository,
  onClose,
  onFocusBranch,
  onInspectCommit,
}: BranchDetailDrawerProps) {
  if (!branch || !repository) return null;

  // Commits belonging to this branch
  const branchCommits = repository.commits
    .filter((c) => (c.branch || 'main') === branch.name)
    .slice(0, 10);

  // Authors who worked on this branch
  const branchAuthors = new Set<string>();
  branchCommits.forEach((c) => branchAuthors.add(c.author));

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-galaxy-900/95 backdrop-blur-2xl border-l border-cyan-500/30 p-5 shadow-[-15px_0_40px_rgba(0,0,0,0.8)] flex flex-col justify-between z-[100] animate-slide-left pointer-events-auto select-none">
      <div className="flex-1 overflow-y-auto pr-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold font-mono text-base shadow-[0_0_20px_currentColor] border border-white/20 shrink-0"
              style={{
                backgroundColor: `${branch.color}25`,
                color: branch.color,
                borderColor: branch.color,
              }}
            >
              <GitBranch size={22} />
            </div>
            <div>
              <h3 className="font-mono text-base font-bold text-white truncate max-w-[200px]" title={branch.name}>
                {branch.name}
              </h3>
              <p className="font-mono text-[11px] text-gray-400 truncate max-w-[200px]">
                Orbital Radius: {branch.radius} AU
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={() => onFocusBranch(branch.radius)}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold transition-all hover:scale-[1.02]"
          >
            <Crosshair size={14} />
            Focus Ring
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gray-800/60 hover:bg-gray-700/80 border border-gray-700 text-gray-300 text-xs font-mono font-semibold transition-all hover:scale-[1.02]"
          >
            <RotateCcw size={14} />
            Show All
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 mt-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800">
            <span className="text-gray-400 text-[10px] block uppercase">Branch Commits</span>
            <span className="text-cyan-300 font-bold text-base mt-0.5 block">{branch.commitCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800">
            <span className="text-gray-400 text-[10px] block uppercase">Contributors</span>
            <span className="text-purple-300 font-bold text-base mt-0.5 block">{branchAuthors.size}</span>
          </div>
        </div>

        {/* Recent Commits on this branch */}
        <div className="mt-5">
          <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400 font-semibold mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <GitCommitIcon size={14} className="text-cyan-400" />
              Branch Commits ({branchCommits.length})
            </span>
            <span className="text-[10px] text-gray-500 font-normal">Click to inspect</span>
          </h4>

          <div className="space-y-2">
            {branchCommits.map((c) => (
              <div
                key={c.hash}
                onClick={() => onInspectCommit(c)}
                className="p-3 rounded-xl bg-gray-950/40 hover:bg-cyan-950/40 border border-gray-800/80 hover:border-cyan-500/40 cursor-pointer transition-all hover:scale-[1.01] group"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-1">
                  <span className="text-cyan-400 font-bold group-hover:text-cyan-300">
                    {c.hash.slice(0, 7)}
                  </span>
                  <span className="text-amber-300 font-semibold truncate max-w-[130px]">{c.author}</span>
                </div>
                <p className="text-xs text-gray-200 line-clamp-2 leading-relaxed">
                  {c.message}
                </p>
                <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono text-gray-500">
                  <span>{c.diffs.length} files modified</span>
                  <span>{new Date(c.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
