import { useEffect, useState } from 'react';
import { GitCommit } from '../engine/types';
import { GitCommit as GitCommitIcon, ExternalLink } from 'lucide-react';

interface CommitMessageBannerProps {
  commit: GitCommit | undefined;
  isPlaying: boolean;
  onInspectCommit?: (commit: GitCommit) => void;
}

export function CommitMessageBanner({ commit, isPlaying, onInspectCommit }: CommitMessageBannerProps) {
  const [visible, setVisible] = useState(false);
  const [displayCommit, setDisplayCommit] = useState<GitCommit | null>(null);

  useEffect(() => {
    if (!commit || !isPlaying) {
      setVisible(false);
      return;
    }

    // Show new commit banner
    setDisplayCommit(commit);
    setVisible(true);

    // Keep banner visible long enough to read and click
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [commit?.hash, isPlaying]);

  if (!displayCommit) return null;

  const totalAdds = displayCommit.diffs.reduce((a, d) => a + d.additions, 0);
  const totalDels = displayCommit.diffs.reduce((a, d) => a + d.deletions, 0);

  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 bottom-28 z-30 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div
        onClick={() => onInspectCommit?.(displayCommit)}
        className="bg-galaxy-900/95 backdrop-blur-xl border border-cyan-500/40 hover:border-cyan-400 rounded-2xl px-5 py-3 shadow-[0_0_40px_rgba(0,240,255,0.2)] hover:shadow-[0_0_50px_rgba(0,240,255,0.35)] max-w-lg cursor-pointer transition-all hover:scale-[1.02] group"
        title="Click to inspect commit diff"
      >
        <div className="flex items-center justify-between gap-2.5 mb-1">
          <div className="flex items-center gap-2">
            <GitCommitIcon size={14} className="text-cyan-400 shrink-0 group-hover:rotate-45 transition-transform" />
            <span className="text-xs font-mono text-cyan-400 font-bold group-hover:text-cyan-300">
              {displayCommit.hash.slice(0, 7)}
            </span>
            <span className="text-[10px] font-mono text-gray-500">by</span>
            <span className="text-xs font-mono text-amber-300 font-semibold truncate max-w-[120px]">
              {displayCommit.author}
            </span>
            {displayCommit.branch && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30">
                {displayCommit.branch}
              </span>
            )}
          </div>

          <span className="text-[10px] font-mono text-cyan-400/80 group-hover:text-cyan-300 flex items-center gap-1 opacity-80 group-hover:opacity-100">
            Inspect <ExternalLink size={10} />
          </span>
        </div>

        <p className="text-sm font-sans text-white leading-snug line-clamp-2 mb-1.5 group-hover:text-cyan-100 transition-colors">
          {displayCommit.message}
        </p>

        <div className="flex items-center gap-3 text-[11px] font-mono text-gray-400">
          <span className="text-emerald-400">+{totalAdds}</span>
          <span className="text-rose-400">-{totalDels}</span>
          <span>{displayCommit.diffs.length} {displayCommit.diffs.length === 1 ? 'file' : 'files'}</span>
        </div>
      </div>
    </div>
  );
}
