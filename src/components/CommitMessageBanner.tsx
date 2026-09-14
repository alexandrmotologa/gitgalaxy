import { useEffect, useState } from 'react';
import { GitCommit } from '../engine/types';
import { GitCommit as GitCommitIcon } from 'lucide-react';

interface CommitMessageBannerProps {
  commit: GitCommit | undefined;
  isPlaying: boolean;
}

export function CommitMessageBanner({ commit, isPlaying }: CommitMessageBannerProps) {
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

    // Hide after 2.2 seconds
    const timer = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(timer);
  }, [commit?.hash, isPlaying]);

  if (!displayCommit) return null;

  const totalAdds = displayCommit.diffs.reduce((a, d) => a + d.additions, 0);
  const totalDels = displayCommit.diffs.reduce((a, d) => a + d.deletions, 0);

  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 bottom-28 z-20 pointer-events-none transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-galaxy-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl px-5 py-3 shadow-[0_0_40px_rgba(0,240,255,0.15)] max-w-lg">
        <div className="flex items-center gap-2.5 mb-1">
          <GitCommitIcon size={14} className="text-cyan-400 shrink-0" />
          <span className="text-xs font-mono text-cyan-400 font-bold">{displayCommit.hash.slice(0, 7)}</span>
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
        <p className="text-sm font-sans text-white leading-snug line-clamp-2 mb-1.5">
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
