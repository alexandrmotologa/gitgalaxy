import { X, GitCommit as GitCommitIcon, Crosshair, Filter } from 'lucide-react';
import { GitAuthor, GitCommit, RepositoryData } from '../engine/types';

interface AuthorDetailDrawerProps {
  author: GitAuthor | null;
  repository: RepositoryData | null;
  onClose: () => void;
  onFocusBeacon: (pos: [number, number, number]) => void;
  onFilterAuthor: (authorName: string) => void;
  onInspectCommit: (commit: GitCommit) => void;
}

export function AuthorDetailDrawer({
  author,
  repository,
  onClose,
  onFocusBeacon,
  onFilterAuthor,
  onInspectCommit,
}: AuthorDetailDrawerProps) {
  if (!author || !repository) return null;

  const totalRepoCommits = repository.commits.length;
  const authorPercentage = totalRepoCommits > 0 ? ((author.commitCount / totalRepoCommits) * 100).toFixed(1) : '0';

  // Commits authored by this contributor
  const authorCommits = repository.commits
    .filter((c) => c.author.toLowerCase() === author.name.toLowerCase())
    .slice(0, 10);

  // Files modified by this contributor
  const touchedFiles = new Set<string>();
  let totalAdditions = 0;
  let totalDeletions = 0;

  repository.commits.forEach((c) => {
    if (c.author.toLowerCase() === author.name.toLowerCase()) {
      c.diffs.forEach((d) => {
        touchedFiles.add(d.path);
        totalAdditions += d.additions;
        totalDeletions += d.deletions;
      });
    }
  });

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-galaxy-900/95 backdrop-blur-2xl border-l border-cyan-500/30 p-5 shadow-[-15px_0_40px_rgba(0,0,0,0.8)] flex flex-col justify-between z-[100] animate-slide-left pointer-events-auto select-none">
      <div className="flex-1 overflow-y-auto pr-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold font-mono text-base shadow-[0_0_20px_currentColor] border border-white/20 shrink-0"
              style={{
                backgroundColor: `${author.color}25`,
                color: author.color,
                borderColor: author.color,
              }}
            >
              {author.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-mono text-base font-bold text-white truncate max-w-[200px]" title={author.name}>
                {author.name}
              </h3>
              <p className="font-mono text-[11px] text-gray-400 truncate max-w-[200px]">
                {author.email || 'Celestial Contributor'}
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
            onClick={() => onFocusBeacon(author.beaconPosition)}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold transition-all hover:scale-[1.02]"
          >
            <Crosshair size={14} />
            Focus Beacon
          </button>
          <button
            onClick={() => onFilterAuthor(author.name)}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-300 text-xs font-mono font-semibold transition-all hover:scale-[1.02]"
          >
            <Filter size={14} />
            Filter Files
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 mt-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800">
            <span className="text-gray-400 text-[10px] block uppercase">Total Commits</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-cyan-300 font-bold text-base">{author.commitCount}</span>
              <span className="text-[10px] text-gray-500">({authorPercentage}%)</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800">
            <span className="text-gray-400 text-[10px] block uppercase">Files Touched</span>
            <span className="text-white font-bold text-base mt-0.5 block">{touchedFiles.size}</span>
          </div>
          <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800">
            <span className="text-gray-400 text-[10px] block uppercase">Additions</span>
            <span className="text-emerald-400 font-bold text-sm mt-0.5 block">+{totalAdditions}</span>
          </div>
          <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800">
            <span className="text-gray-400 text-[10px] block uppercase">Deletions</span>
            <span className="text-rose-400 font-bold text-sm mt-0.5 block">-{totalDeletions}</span>
          </div>
        </div>

        {/* Recent Commits by Author */}
        <div className="mt-5">
          <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400 font-semibold mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <GitCommitIcon size={14} className="text-cyan-400" />
              Recent Commits ({authorCommits.length})
            </span>
            <span className="text-[10px] text-gray-500 font-normal">Click to inspect diff</span>
          </h4>

          <div className="space-y-2">
            {authorCommits.map((c) => (
              <div
                key={c.hash}
                onClick={() => onInspectCommit(c)}
                className="p-3 rounded-xl bg-gray-950/40 hover:bg-cyan-950/40 border border-gray-800/80 hover:border-cyan-500/40 cursor-pointer transition-all hover:scale-[1.01] group"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-1">
                  <span className="text-cyan-400 font-bold group-hover:text-cyan-300">
                    {c.hash.slice(0, 7)}
                  </span>
                  <span>{new Date(c.date).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-gray-200 line-clamp-2 leading-relaxed">
                  {c.message}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-gray-500">
                  <span>{c.diffs.length} files</span>
                  {c.branch && (
                    <span className="px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30">
                      {c.branch}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
