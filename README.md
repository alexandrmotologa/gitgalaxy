# GitGalaxy

GitGalaxy is an interactive 3D WebGL visualizer for Git repositories. It parses commit history and models repository structure as a dynamic galactic system in the browser. Folders and modules form orbital clusters, files act as celestial bodies scaled by line count, and commits fire particle beams between contributors and modified files.

The application includes a heat calculation engine that highlights frequently modified files in crimson and cools inactive files to cyan over time.

## Features

- In-browser 3D space scene rendered with Three.js and React Three Fiber at 60 FPS
- Dual data input: pre-bundled 500-commit repository log or custom Git log import
- Hierarchical galactic layout mapping folders to orbital rings and files to planetary nodes
- Code churn analysis with normalized heat scores and exponential time decay
- Animated commit beams connecting author beacons to changed files during playback
- Scrubber timeline with play, pause, step controls, and variable playback speeds (0.5x to 25x)
- Detailed inspector drawer showing commit counts, line changes, and author breakdown per file
- Synthesized Web Audio soundscapes for ambient space hum and commit laser pulses

## Quick start

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer

### Installation

```bash
git clone https://github.com/alexandrmotologa/gitgalaxy.git
cd gitgalaxy
npm install
npm run dev
```

Open `http://localhost:3000` in your browser to explore the bundled repository demo.

## Visualizing your own repository

To generate a compatible log from any Git repository on your machine, navigate to your project directory and run this command:

```bash
git log --pretty=format:'COMMIT_START%n%H%n%an%n%ae%n%ad%n%s' --date=iso-strict --numstat > gitgalaxy-log.txt
```

Then click **Import Git Log** in the GitGalaxy interface and drag or paste the file.

Alternatively, you can export directly to a structured JSON file:

```bash
git log --pretty=format:'{"hash":"%H","author":"%an","email":"%ae","date":"%ad","message":"%f"},' --date=iso-strict
```

See [docs/GIT_LOG_SPEC.md](docs/GIT_LOG_SPEC.md) for full format specifications and edge case handling.

## Project architecture

```
gitgalaxy/
├── src/
│   ├── engine/
│   │   ├── types.ts              # Data contracts for commits, authors, and nodes
│   │   ├── gitLogParser.ts       # Numstat and JSON stream parser
│   │   ├── churnCalculator.ts    # Code churn scoring and thermal decay formulas
│   │   ├── galaxyLayout.ts       # 3D spherical coordinate mapping and clustering
│   │   └── audioSynthesizer.ts   # Web Audio API ambient drone and laser synthesis
│   ├── scene/
│   │   ├── GalaxyCanvas.tsx      # Three.js canvas setup, camera, and lighting
│   │   ├── FileNodesMesh.tsx     # InstancedMesh rendering for high node counts
│   │   ├── CommitLaserTrails.tsx # Real-time particle beams for active commits
│   │   ├── DirectoryOrbits.tsx   # Orbital boundary rings for folder systems
│   │   ├── StarField.tsx         # Deep space background particles
│   │   └── AuthorBeacons.tsx     # Contributor positions around the perimeter
│   ├── components/
│   │   ├── HUDOverlay.tsx        # Commit message, author, and repository statistics
│   │   ├── TimelineScrubber.tsx  # Playback bar with calendar timestamp and speed controls
│   │   ├── FileDetailDrawer.tsx  # Selected file history and change statistics
│   │   ├── ChurnLegend.tsx       # Thermal scale indicator
│   │   └── GitUploaderModal.tsx  # Drag-and-drop log import modal
│   ├── hooks/
│   │   ├── useGitPlayback.ts     # Timeline playback clock and frame stepper
│   │   └── useGalaxyState.ts     # Global repository and camera focus state
│   └── App.tsx                   # Top-level view coordinator
```

Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details on memory management, instance rendering, and performance optimizations.

## Verification and testing

Run the automated test suite:

```bash
npm test
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Contributing

Review [CONTRIBUTING.md](CONTRIBUTING.md) for development workflows, pull request conventions, and coding guidelines.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
