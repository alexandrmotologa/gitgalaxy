<p align="center">
  <img src="docs/images/logo.png?raw=true" alt="GitGalaxy Logo" width="140" style="border-radius: 28px;" />
</p>

<h1 align="center">GitGalaxy</h1>

<p align="center">
  <strong>Interactive 3D WebGL visualizer mapping Git repositories into living galactic universes.</strong>
</p>

<p align="center">
  <a href="https://gitgalaxy-rho.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>
  <a href="https://github.com/alexandrmotologa/gitgalaxy"><img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repository" /></a>
  <img src="https://img.shields.io/badge/Three.js-r174-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/React-19-20232a?style=for-the-badge&logo=react&logoColor=61dafb" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge" alt="License: MIT" />
</p>

<p align="center">
  <img src="docs/images/gitgalaxy-demo.gif?raw=true" alt="GitGalaxy Interactive 3D Playback Demo" width="100%" style="border-radius: 16px; box-shadow: 0 8px 32px rgba(0, 240, 255, 0.15);" />
</p>

---

## Overview

GitGalaxy transforms Git commit histories and directory hierarchies into an interactive 3D WebGL space universe running at 60 FPS in modern browsers.

Instead of scrolling through flat log lists or complex 2D commit graphs, repositories are modeled as planetary systems governed by gravitational dynamics:

- **Galactic Core**: The central glowing star represents `HEAD` and repository trunk.
- **Planetary File Nodes**: Source files orbit their parent directory gravity wells. Nodes are scaled by line count and colored dynamically using thermal code churn decay.
- **Commit Lasers & Shockwaves**: Active commits project high-velocity particle beams from author positions to modified files, triggering seismic shockwaves and procedural Web Audio chimes.
- **Dynamic Branch Belts**: Concentric orbital rings represent branches. By default, rings remain hidden to keep the central space clear, illuminating dynamically during active playback or branch selection.
- **Topological Constellations**: Web filaments link sibling files in the same subsystem to expose architectural coupling.
- **Astral Pilot Flight Deck**: A 6-DOF manual cockpit mode letting you fly through your codebase with keyboard controls and telemetry instruments.

---

## Visual Feature Tour

### 1. Galactic Core & Celestial System View
<p align="center">
  <img src="docs/images/hero-overview.png?raw=true" alt="GitGalaxy 3D Galactic View" width="100%" style="border-radius: 12px;" />
</p>
Directory clusters orbit outward from the galactic center. The top HUD displays real-time telemetry, instant search filters, master audio synth controls, 4K canvas screenshot export, and quick access to the Field Manual guide.

---

### 2. Chronological Playback & Active Commit Stream
<p align="center">
  <img src="docs/images/commit-playback.png?raw=true" alt="GitGalaxy Commit Playback & Holographic Banner" width="100%" style="border-radius: 12px;" />
</p>
The bottom scrubber controls historical playback from `0.1x` to `25x`. When commits execute, particle beams track contributor ships, shockwave rings ripple across affected directories, and an animated commit banner displays commit messages and stats.

---

### 3. Architectural Debt Radar & Volatile Hotspot Leaderboard
<p align="center">
  <img src="docs/images/debt-radar.png?raw=true" alt="Architectural Debt Radar and Churn Leaderboard" width="100%" style="border-radius: 12px;" />
</p>
Pressing `H` activates Debt Radar mode. Stable code is dimmed into deep space, while the highest churn files illuminate with red warning coronas alongside a ranked leaderboard of top volatile hotspots.

---

### 4. Astral Pilot Mode (6-DOF Cockpit Flight)
<p align="center">
  <img src="docs/images/cockpit-pilot.png?raw=true" alt="Astral Pilot 6-DOF Cockpit HUD" width="100%" style="border-radius: 12px;" />
</p>
Press `P` to step inside the cockpit of an interstellar scout ship. Fly directly through directories and around file planets with 6 degrees of freedom using `WASD`, `Space` (elevate), and `Shift` (hyperdrive boost), complete with speed, altitude, and artificial horizon telemetry.

---

### 5. Commit Diff & File Metrics Inspector
<p align="center">
  <img src="docs/images/commit-diff-modal.png?raw=true" alt="Commit Diff Inspector Modal" width="100%" style="border-radius: 12px;" />
</p>
Click the Galactic Core, the active commit card, or the timeline banner to open the Commit Inspector. View full patch breakdowns with line additions (`+green`), deletions (`-red`), contributor attribution, and camera focus reticles.

---

## Keyboard Shortcuts & HUD Controls

| Key / Control | Action | Description |
| :---: | :--- | :--- |
| <kbd>Space</kbd> | **Play / Pause** | Toggle chronological commit playback stream. |
| <kbd>C</kbd> | **Code Constellations** | Toggle structural web lines between sibling files in directories. |
| <kbd>B</kbd> | **Branch Belts** | Toggle permanent 3D orbital rings for all Git branches (OFF by default for clarity). |
| <kbd>H</kbd> | **Debt Radar** | Dim stable code and isolate volatile hotspots with a real-time leaderboard. |
| <kbd>P</kbd> | **Astral Pilot Mode** | Enter 6-DOF cockpit flight mode (`WASD`, `Space`, `Shift` for boost). |
| <kbd>Ctrl</kbd>+<kbd>K</kbd> | **Search Engine** | Search files by name, filter by author, or filter by file extension. |
| <kbd>Esc</kbd> | **Close / Dismiss** | Close any open drawer, modal dialog, or active filter selection. |
| <kbd>Camera</kbd> | **4K Screenshot** | Export a clean high-resolution PNG snapshot of the current 3D viewport. |

---

## Quick Start

### Prerequisites
- Node.js 20+
- npm 10+

### Installation & Local Run

```bash
git clone https://github.com/alexandrmotologa/gitgalaxy.git
cd gitgalaxy
npm install
npm run dev
```

Open `http://localhost:3000` to explore the pre-bundled 500-commit repository universe.

---

## Visualizing Your Own Repository

GitGalaxy supports any Git repository through drag-and-drop log import or direct GitHub streaming.

### Method 1: Generate a Local Git Log

In the root of your local Git repository, run:

```bash
git log --pretty=format:'COMMIT_START%n%H%n%an%n%ae%n%ad%n%s' --date=iso-strict --numstat > gitgalaxy-log.txt
```

Click **Import** in the top-right HUD of GitGalaxy, then paste or drop the generated file.

### Method 2: Export to Structured JSON

```bash
git log --pretty=format:'{"hash":"%H","author":"%an","email":"%ae","date":"%ad","message":"%f"},' --date=iso-strict
```

See [docs/GIT_LOG_SPEC.md](docs/GIT_LOG_SPEC.md) for data schemas and parsing details.

---

## Project Architecture

```
gitgalaxy/
├── docs/
│   ├── images/                   # Official logo, real screenshots, and demo GIF
│   ├── ARCHITECTURE.md           # Three.js instance rendering & memory architecture
│   └── GIT_LOG_SPEC.md           # Log specification for custom repository imports
├── src/
│   ├── engine/
│   │   ├── types.ts              # Core contracts (GitCommit, FileNode, RepositoryData)
│   │   ├── gitLogParser.ts       # Git numstat & stream parser
│   │   ├── churnCalculator.ts    # Code churn scoring and thermal decay formulas
│   │   ├── galaxyLayout.ts       # 3D spherical coordinate mapping & directory clustering
│   │   └── audioSynthesizer.ts   # Web Audio API ambient hum, laser sweeps, and milestone chords
│   ├── scene/
│   │   ├── GalaxyCanvas.tsx      # Main WebGL canvas, lighting, and camera coordinator
│   │   ├── FileNodesMesh.tsx     # InstancedMesh rendering for high planetary node counts
│   │   ├── CommitLaserTrails.tsx # Real-time laser projectile trails
│   │   ├── BranchBelts.tsx       # Dynamic branch orbital rings with selective illumination
│   │   ├── ConstellationLines.tsx# Topological sibling connection filaments
│   │   ├── GalacticCore.tsx      # Central pulsating star (repository trunk)
│   │   ├── AuthorBeacons.tsx     # Perimeter contributor satellite beacons
│   │   ├── AuthorShips.tsx       # 3D scout ships tracking active committers
│   │   ├── FlightController.tsx  # 6-DOF astral cockpit flight physics
│   │   └── StarField.tsx         # Background deep-space star particles
│   ├── components/
│   │   ├── HUDOverlay.tsx        # Top telemetry bar, audio mixer, and feature toggles
│   │   ├── TimelineScrubber.tsx  # Scrubber bar with speed multipliers (0.1x to 25x)
│   │   ├── CommitMessageBanner.tsx # Dynamic commit message banner during playback
│   │   ├── CockpitHUD.tsx        # First-person astral flight instruments
│   │   ├── HotspotLeaderboard.tsx# Architectural debt rankings drawer
│   │   ├── CommitDetailModal.tsx # Full commit diff inspector with additions/deletions
│   │   ├── FileDetailDrawer.tsx  # Planetary node stats and contributor breakdown
│   │   ├── BranchDetailDrawer.tsx# Branch file modification analysis
│   │   └── HelpGuideModal.tsx    # Field manual and visual legend
│   ├── hooks/
│   │   ├── useGalaxyState.ts     # Global repository state and camera targets
│   │   └── useGitPlayback.ts     # Timeline playback clock and frame stepper
│   └── App.tsx                   # Top-level view coordinator
```

---

## Verification & Testing

Run unit tests covering churn calculation, GitHub ingestion, layout mathematics, and log parsing:

```bash
npm test
```

Create an optimized production bundle:

```bash
npm run build
```

---

## License

This project is open source and available under the [MIT License](LICENSE).
