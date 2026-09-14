import {
  X,
  BookOpen,
  Sun,
  Globe,
  Share2,
  Zap,
  Flame,
  Rocket,
  Video,
  Volume2,
  Camera,
  Upload,
  Search,
  Sliders,
} from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpGuideModal({ isOpen, onClose }: HelpGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-galaxy-900/95 border border-cyan-500/40 rounded-3xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-[0_0_60px_rgba(0,240,255,0.25)] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                GitGalaxy Field Manual & Visual Guide
              </h2>
              <p className="text-xs font-mono text-gray-400">
                Understanding the 3D celestial universe and interactive controls
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-800/80 hover:bg-rose-900/60 text-gray-300 hover:text-rose-300 transition-colors"
            title="Close Guide (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-sans text-gray-300">
          {/* Section 1: Celestial Elements */}
          <div>
            <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sun size={16} />
              1. Celestial Elements (What You See in 3D Space)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="bg-black/40 border border-gray-800 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold font-mono">
                  <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f0ff]" />
                  Galactic Core (The Sun / Nucleus)
                </div>
                <p className="text-gray-400 leading-relaxed">
                  The luminous glowing star at the very center represents the Git trunk (<code className="text-cyan-300">HEAD / main</code>). Every commit passes through this nucleus before changes propagate outward to individual files.
                </p>
              </div>

              <div className="bg-black/40 border border-gray-800 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold font-mono">
                  <Globe size={14} className="text-purple-400" />
                  Celestial Bodies (File Nodes)
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Every floating sphere is a source file. <strong>Sphere size</strong> represents file volume (LOC). <strong>Color</strong> indicates thermal churn heat:
                  <br />
                  <span className="text-cyan-400">• Cyan</span>: Stable, cold code.
                  <br />
                  <span className="text-amber-400">• Amber</span>: Actively edited code.
                  <br />
                  <span className="text-rose-400">• Crimson</span>: High-churn volatile architectural hotspot.
                </p>
              </div>

              <div className="bg-black/40 border border-gray-800 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold font-mono">
                  <Share2 size={14} className="text-emerald-400" />
                  Orbital Belts & Constellations
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Concentric rings represent directory systems grouping related modules. Tilted Keplerian outer belts represent Git branches (<code className="text-cyan-300">main</code>, <code className="text-purple-300">feature/*</code>, <code className="text-amber-300">fix/*</code>). Glowing constellation lines link sibling files.
                </p>
              </div>

              <div className="bg-black/40 border border-gray-800 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold font-mono">
                  <Zap size={14} className="text-amber-400" />
                  Laser Beams, Ships & Supernovas
                </div>
                <p className="text-gray-400 leading-relaxed">
                  When a commit is executed:
                  <br />
                  1. Particle beams shoot from author beacons to Core and into modified files.
                  <br />
                  2. Contributor scout ships fly with ion thrusters toward touched files.
                  <br />
                  3. Massive merges and release tags ignite expanding Supernova shockwaves!
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: HUD Controls */}
          <div>
            <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sliders size={16} />
              2. HUD Action Bar Controls (What Each Button Does)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="bg-black/40 border border-gray-800 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shrink-0">
                  <Search size={16} />
                </div>
                <div>
                  <div className="font-bold text-white font-mono">Search & Filters (Ctrl+K)</div>
                  <p className="text-gray-400 text-[11px] leading-relaxed mt-0.5">
                    Search files with instant autocomplete, lock 3D camera to any file, or filter by specific author or extension. Matching files enlarge while non-matching files shrink into faint background motes.
                  </p>
                </div>
              </div>

              <div className="bg-black/40 border border-gray-800 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-400 shrink-0">
                  <Flame size={16} />
                </div>
                <div>
                  <div className="font-bold text-white font-mono">Architectural Debt Radar</div>
                  <p className="text-gray-400 text-[11px] leading-relaxed mt-0.5">
                    X-Ray mode: Dims stable code and illuminates the top volatile hotspots with glowing danger coronas and a real-time leaderboard of highest churn files.
                  </p>
                </div>
              </div>

              <div className="bg-black/40 border border-gray-800 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shrink-0">
                  <Rocket size={16} />
                </div>
                <div>
                  <div className="font-bold text-white font-mono">Astral Pilot Flight Mode</div>
                  <p className="text-gray-400 text-[11px] leading-relaxed mt-0.5">
                    Enter the cockpit of an interstellar scout ship! Fly manually in 6-DOF using <kbd className="bg-gray-800 px-1 py-0.2 rounded text-white">W/S/A/D</kbd>, <kbd className="bg-gray-800 px-1 py-0.2 rounded text-white">Space</kbd>, and <kbd className="bg-gray-800 px-1 py-0.2 rounded text-white">Shift</kbd> for hyperdrive boost.
                  </p>
                </div>
              </div>

              <div className="bg-black/40 border border-gray-800 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shrink-0">
                  <Share2 size={16} />
                </div>
                <div>
                  <div className="font-bold text-white font-mono">Code Constellations</div>
                  <p className="text-gray-400 text-[11px] leading-relaxed mt-0.5">
                    Toggles topological celestial lines connecting sibling files and modules within the same subsystem, revealing structural coupling.
                  </p>
                </div>
              </div>

              <div className="bg-black/40 border border-gray-800 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shrink-0">
                  <Video size={16} />
                </div>
                <div>
                  <div className="font-bold text-white font-mono">Cinematic Auto-Director</div>
                  <p className="text-gray-400 text-[11px] leading-relaxed mt-0.5">
                    Automated dynamic cinematography: Camera smoothly tracks the active commit center of gravity, alternating between close-up file tracking and wide orbital sweeps.
                  </p>
                </div>
              </div>

              <div className="bg-black/40 border border-gray-800 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shrink-0">
                  <Volume2 size={16} />
                </div>
                <div>
                  <div className="font-bold text-white font-mono">Audio Synthesizer & Mixer</div>
                  <p className="text-gray-400 text-[11px] leading-relaxed mt-0.5">
                    Generates procedural ambient deep-space drone pads, laser sweep sounds, merge chords (D-Major), deletion fizzles, and milestone fanfare chimes. Includes a master volume slider.
                  </p>
                </div>
              </div>

              <div className="bg-black/40 border border-gray-800 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shrink-0">
                  <Camera size={16} />
                </div>
                <div>
                  <div className="font-bold text-white font-mono">4K Screenshot Capture</div>
                  <p className="text-gray-400 text-[11px] leading-relaxed mt-0.5">
                    Instantly exports a clean, high-resolution WebGL canvas snapshot of the current view directly to your computer as a PNG.
                  </p>
                </div>
              </div>

              <div className="bg-black/40 border border-gray-800 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shrink-0">
                  <Upload size={16} />
                </div>
                <div>
                  <div className="font-bold text-white font-mono">Import Repository / GitHub Stream</div>
                  <p className="text-gray-400 text-[11px] leading-relaxed mt-0.5">
                    Paste custom Git log text or stream commits live from any public GitHub repository URL (e.g. <code className="text-cyan-300">facebook/react</code>, <code className="text-cyan-300">torvalds/linux</code>).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Commit Inspection & Timeline */}
          <div className="bg-black/40 border border-gray-800 rounded-2xl p-4 space-y-2">
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <span>💡 Pro Tip: Inspecting Commits & Files</span>
            </h3>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              • <strong>Click the Active Commit card</strong> (top-left) to open the <em>Commit Diff Inspector Modal</em> with full author stats, line count diffs (+green / -red), and focus reticle buttons.
              <br />
              • <strong>Click on any 3D planet node</strong> to zoom camera into that file and open the <em>File Details Drawer</em> showing blame metrics, revision history, and top contributors.
              <br />
              • <strong>Use the bottom timeline scrubber</strong> to jump forward/backward in time or ramp up speed to <strong>5x</strong> or <strong>25x</strong> for fast-forward evolution!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-mono text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
          >
            Got it, take me back to space &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
