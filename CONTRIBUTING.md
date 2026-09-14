# Contributing to GitGalaxy

Thank you for your interest in contributing to GitGalaxy.

## Development setup

1. Fork and clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Coding standards

- Write strict TypeScript with explicit types for public functions and component props.
- Keep 3D scene computations inside frame loops lean to maintain 60 FPS.
- Avoid allocating new Three.js geometry or material objects inside `useFrame`. Reuse instances.
- Documentation must follow plain language standards: concise sentences, no marketing buzzwords, and sentence case headings.

## Pull request process

1. Create a descriptive feature branch:
   ```bash
   git checkout -b feat/custom-orbit-controls
   ```
2. Ensure automated tests pass:
   ```bash
   npm test
   ```
3. Ensure the project builds cleanly:
   ```bash
   npm run build
   ```
4. Commit your changes using Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `perf:`).
5. Open a pull request against the `main` branch.
