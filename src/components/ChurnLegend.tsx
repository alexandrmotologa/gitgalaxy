export function ChurnLegend() {
  return (
    <div className="bg-galaxy-900/80 backdrop-blur-md border border-cyan-500/20 rounded-xl px-3 py-2 text-xs font-mono text-gray-300 shadow-xl pointer-events-auto select-none">
      <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5 flex items-center justify-between gap-4">
        <span>Thermal Churn Scale</span>
        <span className="text-[9px] text-cyan-400">LOC & Activity</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] shadow-[0_0_8px_#06b6d4]" />
          <span className="text-[11px] text-gray-300">Stable (&lt;0.2)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]" />
          <span className="text-[11px] text-gray-300">Active (0.2-0.6)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]" />
          <span className="text-[11px] text-gray-300">Hotspot (&ge;0.6)</span>
        </div>
      </div>
    </div>
  );
}
