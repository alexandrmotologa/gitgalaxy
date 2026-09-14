import { Compass, Gauge, Zap, X } from 'lucide-react';

export interface FlightTelemetry {
  speed: number;
  boostActive: boolean;
  distanceToCore: number;
  altitude: number;
}

interface CockpitHUDProps {
  telemetry: FlightTelemetry;
  onExit: () => void;
}

export function CockpitHUD({ telemetry, onExit }: CockpitHUDProps) {
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 flex flex-col justify-between p-6">
      {/* Top Header: Compass & Status */}
      <div className="flex items-center justify-between">
        <div className="bg-black/60 backdrop-blur-md border border-cyan-500/40 rounded-xl px-4 py-2 flex items-center gap-3 text-cyan-400 font-mono text-xs">
          <Compass size={16} className="animate-spin-slow text-cyan-300" />
          <span>FLIGHT MODE // ASTRAL INTERCEPTOR ACTIVE</span>
        </div>

        <button
          onClick={onExit}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)]"
        >
          <X size={14} />
          <span>Exit Flight (ESC)</span>
        </button>
      </div>

      {/* Center: Sci-Fi Crosshair Reticle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Outer circle */}
          <div className="absolute inset-0 rounded-full border border-cyan-500/25 animate-pulse" />

          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

          {/* Inner cross */}
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
          <div className="absolute w-8 h-[1px] bg-cyan-500/60" />
          <div className="absolute h-8 w-[1px] bg-cyan-500/60" />

          {telemetry.boostActive && (
            <span className="absolute -bottom-8 font-mono text-[10px] font-black tracking-widest text-amber-400 animate-pulse">
              HYPERDRIVE ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* Bottom Telemetry & Controls */}
      <div className="flex items-end justify-between">
        {/* Left Telemetry Gauges */}
        <div className="bg-black/75 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-4 font-mono text-xs w-64 space-y-2.5 shadow-2xl">
          <div className="flex items-center justify-between text-gray-400 border-b border-gray-800 pb-1.5">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Gauge size={14} />
              SPEED
            </span>
            <span className="font-bold text-white text-sm">{telemetry.speed} AU/s</span>
          </div>

          <div className="flex items-center justify-between text-gray-400 border-b border-gray-800 pb-1.5">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Zap size={14} />
              CORE DISTANCE
            </span>
            <span className="font-bold text-white">{telemetry.distanceToCore} LY</span>
          </div>

          <div className="flex items-center justify-between text-gray-400">
            <span className="text-purple-400">ALTITUDE</span>
            <span className="font-bold text-white">{telemetry.altitude} LY</span>
          </div>
        </div>

        {/* Right Flight Keybindings Guide */}
        <div className="bg-black/75 backdrop-blur-md border border-gray-700/60 rounded-2xl p-4 font-mono text-[11px] text-gray-300 space-y-1.5 shadow-2xl">
          <div className="text-cyan-400 font-bold mb-1">FLIGHT CONTROLS</div>
          <div><span className="text-white bg-gray-800 px-1.5 py-0.5 rounded border border-gray-600">W / S</span> Thrust / Reverse</div>
          <div><span className="text-white bg-gray-800 px-1.5 py-0.5 rounded border border-gray-600">A / D</span> Strafe Left / Right</div>
          <div><span className="text-white bg-gray-800 px-1.5 py-0.5 rounded border border-gray-600">Space / C</span> Ascend / Descend</div>
          <div><span className="text-white bg-gray-800 px-1.5 py-0.5 rounded border border-gray-600">Shift</span> Boost Hyperdrive</div>
          <div><span className="text-white bg-gray-800 px-1.5 py-0.5 rounded border border-gray-600">Drag</span> Pitch & Yaw Flight Direction</div>
        </div>
      </div>
    </div>
  );
}
