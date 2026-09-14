import { Flame, X } from 'lucide-react';
import { FileNode } from '../engine/types';
import { getHeatColorHex } from '../engine/churnCalculator';

interface HotspotLeaderboardProps {
  isOpen: boolean;
  hotspots: FileNode[];
  onSelectFile: (fileId: string) => void;
  onClose: () => void;
}

export function HotspotLeaderboard({
  isOpen,
  hotspots,
  onSelectFile,
  onClose,
}: HotspotLeaderboardProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-24 left-4 z-30 w-80 bg-galaxy-900/90 backdrop-blur-xl border border-rose-500/40 rounded-2xl p-4 shadow-[0_0_30px_rgba(244,63,94,0.25)] pointer-events-auto select-none animate-fade-in">
      <div className="flex items-center justify-between pb-2.5 border-b border-rose-500/20">
        <div className="flex items-center gap-2 text-rose-400">
          <Flame size={18} className="animate-pulse" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
            Architectural Debt Radar
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      <p className="text-[11px] font-sans text-gray-400 my-2 leading-tight">
        Top critical hotspots by modification frequency and churn volatility.
      </p>

      <div className="space-y-2 mt-2">
        {hotspots.map((file, idx) => {
          const heatColor = getHeatColorHex(file.heat);
          return (
            <button
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              className="w-full text-left p-2.5 rounded-xl bg-gray-950/60 border border-gray-800/80 hover:border-rose-500/40 hover:bg-rose-950/20 transition-all flex items-center justify-between gap-2 group"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="font-mono text-xs font-bold text-rose-400 w-4">
                  #{idx + 1}
                </span>
                <div className="truncate">
                  <span className="font-mono text-xs font-semibold text-gray-200 block truncate group-hover:text-white">
                    {file.filename}
                  </span>
                  <span className="font-mono text-[10px] text-gray-500 block truncate">
                    {file.directory}/
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right font-mono text-[10px]">
                  <span className="text-emerald-400">+{file.additions}</span>
                  <span className="text-gray-600">/</span>
                  <span className="text-rose-400">-{file.deletions}</span>
                </div>
                <div
                  className="px-2 py-0.5 rounded font-mono text-xs font-bold"
                  style={{
                    color: heatColor,
                    backgroundColor: `${heatColor}25`,
                    boxShadow: `0 0 10px ${heatColor}40`,
                  }}
                >
                  {(file.heat * 100).toFixed(0)}%
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
