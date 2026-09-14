import { useState } from 'react';
import { GitCommit } from '../engine/types';
import {
  X,
  GitCommit as GitCommitIcon,
  GitBranch,
  Calendar,
  User,
  Copy,
  Check,
  FileCode,
  Plus,
  Minus,
  Crosshair,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface CommitDetailModalProps {
  commit: GitCommit | null;
  isOpen: boolean;
  onClose: () => void;
  onFocusFile?: (filePath: string) => void;
  onPrevCommit?: () => void;
  onNextCommit?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function CommitDetailModal({
  commit,
  isOpen,
  onClose,
  onFocusFile,
  onPrevCommit,
  onNextCommit,
  hasPrev = false,
  hasNext = false,
}: CommitDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [filterText, setFilterText] = useState('');

  if (!isOpen || !commit) return null;

  const copyHash = () => {
    navigator.clipboard.writeText(commit.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const totalAdditions = commit.diffs.reduce((acc, d) => acc + d.additions, 0);
  const totalDeletions = commit.diffs.reduce((acc, d) => acc + d.deletions, 0);

  const filteredDiffs = commit.diffs.filter((d) =>
    d.path.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-galaxy-900/95 border border-cyan-500/40 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                <GitCommitIcon size={13} />
                <span>{commit.hash.slice(0, 8)}</span>
              </span>

              {commit.branch && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-purple-950/70 border border-purple-500/40 text-purple-300">
                  <GitBranch size={12} />
                  <span>{commit.branch}</span>
                </span>
              )}

              <button
                onClick={copyHash}
                className="p-1 rounded-lg text-gray-400 hover:text-cyan-300 hover:bg-gray-800 transition-colors"
                title="Copy Full Hash"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>

            <h2 className="text-lg font-bold text-white leading-snug pt-1">
              {commit.message}
            </h2>

            <div className="flex items-center gap-4 text-xs font-mono text-gray-400 flex-wrap pt-1">
              <span className="flex items-center gap-1.5 text-gray-300">
                <User size={13} className="text-cyan-400" />
                {commit.author} {commit.email ? `<${commit.email}>` : ''}
              </span>
              <span className="flex items-center gap-1.5 text-gray-400">
                <Calendar size={13} />
                {new Date(commit.date).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Prev / Next buttons */}
            <button
              onClick={onPrevCommit}
              disabled={!hasPrev}
              className="p-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Previous Commit"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={onNextCommit}
              disabled={!hasNext}
              className="p-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Next Commit"
            >
              <ChevronRight size={16} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-800/80 hover:bg-rose-900/60 text-gray-300 hover:text-rose-300 transition-colors"
              title="Close Dialog (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Diff Summary Stats Bar */}
        <div className="px-6 py-3 bg-black/40 border-b border-gray-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="text-gray-300 font-semibold">
              {commit.diffs.length} changed {commit.diffs.length === 1 ? 'file' : 'files'}
            </span>
            <span className="text-emerald-400 flex items-center gap-0.5">
              <Plus size={13} />
              {totalAdditions.toLocaleString()} lines
            </span>
            <span className="text-rose-400 flex items-center gap-0.5">
              <Minus size={13} />
              {totalDeletions.toLocaleString()} lines
            </span>
          </div>

          {/* Quick Filter */}
          {commit.diffs.length > 5 && (
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter files in commit..."
              className="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 w-48"
            />
          )}
        </div>

        {/* File Diff Breakdown List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5">
          {filteredDiffs.map((diff) => {
            const sum = diff.additions + diff.deletions || 1;
            const addPct = Math.round((diff.additions / sum) * 100);

            return (
              <div
                key={diff.path}
                className="bg-gray-950/60 border border-gray-800/80 hover:border-cyan-500/40 rounded-xl p-3.5 flex items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <FileCode size={16} className="text-cyan-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-xs text-white truncate font-medium">
                      {diff.path}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase font-bold ${
                          diff.type === 'added'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : diff.type === 'deleted'
                            ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {diff.type}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">+{diff.additions}</span>
                      <span className="text-[10px] font-mono text-rose-400">-{diff.deletions}</span>
                    </div>
                  </div>
                </div>

                {/* Diff proportion visual bar */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${addPct}%` }}
                    />
                    <div
                      className="bg-rose-500 h-full"
                      style={{ width: `${100 - addPct}%` }}
                    />
                  </div>

                  {onFocusFile && (
                    <button
                      onClick={() => {
                        onFocusFile(diff.path);
                        onClose();
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-300 hover:bg-cyan-950/50 border border-transparent hover:border-cyan-500/30 transition-all"
                      title="Focus in 3D Galaxy"
                    >
                      <Crosshair size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
