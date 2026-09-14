# System architecture

This document outlines the internal design, performance principles, and data flow of GitGalaxy.

## High level pipeline

GitGalaxy processes source repository history through five stages:

1. **Ingestion:** Raw Git log outputs (numstat text or JSON) are parsed into memory.
2. **Analysis:** The engine counts additions, deletions, modifications, and computes thermal decay over chronological commit ranges.
3. **Spatial layout:** The galactic layout engine positions root directories near the core and distributes files along concentric orbital shells using Fibonacci phyllotaxis and hierarchical grouping.
4. **Scene graph rendering:** Three.js renders celestial nodes using `InstancedMesh` buffers, reducing draw calls from thousands to a single render pass.
5. **Timeline simulation:** A playback clock ticks through commits, firing laser beams between author beacons and target files while updating thermal churn values.

## Data structures

The core models reside in `src/engine/types.ts`:

- `GitCommit`: Represents a single revision with author details, timestamp, commit hash, commit message, and an array of file diffs.
- `FileDiff`: Records file path, lines added, lines deleted, and status (added, modified, deleted).
- `FileNode`: Holds spatial coordinates `(x, y, z)`, size radius, current heat level (0.0 to 1.0), cumulative change statistics, and parent directory ID.
- `DirectoryNode`: Represents a folder cluster with center coordinates, bounding radius, and child node references.
- `AuthorBeacon`: Spatial anchor on the outer perimeter representing a contributor, colored uniquely by author hash.

## Rendering optimizations

### InstancedMesh batching

Standard Three.js meshes introduce CPU overhead when handling thousands of individual draw calls. In `FileNodesMesh.tsx`, GitGalaxy allocates a single `InstancedMesh` for all file nodes. Each file node updates:

- A 4x4 transformation matrix for position and scale.
- An instanced RGB color buffer reflecting the node's current thermal state.

This ensures stable 60 FPS performance even when visualizing repositories with more than 3,000 files.

### Churn and thermal decay physics

Code churn indicates architectural instability. When a file receives edits in a commit, its score increases:

```
churnDelta = additions + (deletions * 1.5) + 5
```

The heat value is normalized between 0.0 and 1.0:

- `heat < 0.2`: Calm cyan (`#06B6D4`), indicating stable files.
- `0.2 <= heat < 0.6`: Amber (`#F59E0B`), indicating active iteration.
- `heat >= 0.6`: Crimson (`#EF4444`), highlighting hot spots with heavy churn.

Untouched files decay their heat level exponentially with each advancing commit, gradually returning to the base cold color.

## Laser trails and particle effects

When a commit activates, `CommitLaserTrails.tsx` samples the active author beacon position and the target file node positions. A custom line or ribbon geometry animates along this vector with quadratic easing, followed by a momentary radial shockwave at the target file coordinate.

## Audio synthesis

Rather than loading large audio assets, `audioSynthesizer.ts` uses the browser Web Audio API to synthesize ambient space frequencies and short resonant laser chirps. Audio starts muted and can be toggled through the HUD.
