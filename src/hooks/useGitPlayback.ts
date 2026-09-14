import { useState, useEffect, useRef, useCallback } from 'react';
import { GitCommit, RepositoryData, LaserBeam, Shockwave, SupernovaEvent } from '../engine/types';
import { calculateChurnDelta, applyHeatDecay, normalizeHeat } from '../engine/churnCalculator';
import { soundFx } from '../engine/audioSynthesizer';

interface UseGitPlaybackProps {
  repository: RepositoryData | null;
  onFilesUpdated: (updatedFiles: RepositoryData['files']) => void;
}

export function useGitPlayback({ repository, onFilesUpdated }: UseGitPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [laserBeams, setLaserBeams] = useState<LaserBeam[]>([]);
  const [shockwaves, setShockwaves] = useState<Shockwave[]>([]);
  const [supernovas, setSupernovas] = useState<SupernovaEvent[]>([]);
  const [isMergeActive, setIsMergeActive] = useState(false);

  const animFrameRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(performance.now());
  const activeBeamsRef = useRef<LaserBeam[]>([]);
  const activeShockwavesRef = useRef<Shockwave[]>([]);
  const activeSupernovasRef = useRef<SupernovaEvent[]>([]);
  const lastCommitTargetPosRef = useRef<[number, number, number] | null>(null);

  const commits = repository?.commits || [];
  const totalCommits = commits.length;
  const currentCommit: GitCommit | undefined = commits[currentIndex];

  // Dispatch commit effects: lasers, audio, shockwaves, and thermal churn update
  const applyCommit = useCallback(
    (index: number) => {
      if (!repository || index < 0 || index >= repository.commits.length) return;

      const commit = repository.commits[index];
      const author = repository.authors.get(commit.author);
      const authorPos = author ? author.beaconPosition : ([0, 50, 0] as [number, number, number]);
      const authorColor = author ? author.color : '#00f0ff';

      const now = performance.now();
      const newBeams: LaserBeam[] = [];
      const newShockwaves: Shockwave[] = [];

      // Decay heat on all files
      const updatedFiles = new Map(repository.files);
      for (const [id, file] of updatedFiles.entries()) {
        const decayedHeat = applyHeatDecay(file.heat, 1);
        updatedFiles.set(id, { ...file, heat: decayedHeat });
      }

      const corePos: [number, number, number] = [0, 0, 0];
      const prevPos = lastCommitTargetPosRef.current;

      // 1. Author Beacon -> Galactic Core (Trunk commit registration)
      newBeams.push({
        id: `beam-trunk-${commit.hash}-${now}`,
        from: authorPos,
        to: corePos,
        color: authorColor,
        progress: 0,
        duration: Math.max(220, 600 / speed),
        startTime: now,
        fileName: 'Trunk (HEAD)',
      });

      // Core pulse shockwave when commit registers
      newShockwaves.push({
        id: `shock-core-${commit.hash}-${now}`,
        position: corePos,
        radius: 5,
        maxRadius: 32,
        color: authorColor,
        opacity: 0.9,
        startTime: now,
      });

      // 2. Commit DAG History link from previous commit target to Core
      if (prevPos) {
        newBeams.push({
          id: `beam-dag-${commit.hash}-${now}`,
          from: prevPos,
          to: corePos,
          color: '#38bdf8', // Cyber blue history thread
          progress: 0,
          duration: Math.max(280, 800 / speed),
          startTime: now,
          fileName: 'Commit DAG Parent',
        });
      }

      // 3. Core -> Modified Files (Applying changes to planetary nodes)
      let primaryTarget: [number, number, number] | null = null;

      commit.diffs.forEach((diff, dIdx) => {
        const fileNode = updatedFiles.get(diff.path);
        if (fileNode) {
          primaryTarget = fileNode.position;
          const beamId = `beam-${commit.hash}-${dIdx}-${now}`;
          newBeams.push({
            id: beamId,
            from: corePos,
            to: fileNode.position,
            color: authorColor,
            progress: 0,
            duration: Math.max(250, 700 / speed),
            startTime: now,
            fileName: fileNode.filename,
          });

          // Increase churn heat on modified file
          const delta = calculateChurnDelta(diff);
          const newHeat = Math.min(1.0, fileNode.heat + normalizeHeat(delta));

          updatedFiles.set(fileNode.id, {
            ...fileNode,
            heat: newHeat,
            lastModifiedCommitHash: commit.hash,
          });

          // Queue shockwave upon impact
          newShockwaves.push({
            id: `shock-${commit.hash}-${dIdx}-${now}`,
            position: fileNode.position,
            radius: fileNode.size * 1.2,
            maxRadius: fileNode.size * 3.2,
            color: authorColor,
            opacity: 0.85,
            startTime: now,
          });
        }
      });

      if (primaryTarget) {
        lastCommitTargetPosRef.current = primaryTarget;
      }

      // Check commit characteristics for dynamic procedural audio & supernovas
      const lowerMsg = commit.message.toLowerCase();
      const isMerge = lowerMsg.includes('merge');
      const isMilestone =
        commit.diffs.length >= 7 ||
        lowerMsg.includes('release') ||
        lowerMsg.includes('tag') ||
        /v\d+\./.test(lowerMsg);

      const totalAdds = commit.diffs.reduce((a, d) => a + d.additions, 0);
      const totalDels = commit.diffs.reduce((a, d) => a + d.deletions, 0);

      if (isMerge) {
        setIsMergeActive(true);
        soundFx.playMergeChord();
        setTimeout(() => setIsMergeActive(false), 900);
      } else if (isMilestone) {
        soundFx.playMilestoneSupernova();
        const supernovaDuration = Math.max(1200, 2000 / speed);
        const newSupernova: SupernovaEvent = {
          id: `supernova-${commit.hash}-${now}`,
          position: corePos,
          color: authorColor,
          maxRadius: 180,
          startTime: now,
          duration: supernovaDuration,
          label: commit.message.length > 28 ? commit.message.slice(0, 28) + '...' : commit.message,
        };
        activeSupernovasRef.current = [...activeSupernovasRef.current, newSupernova];
        setSupernovas([...activeSupernovasRef.current]);
      } else if (totalDels > totalAdds + 5) {
        soundFx.playDeletionFizzle();
      } else if (newBeams.length > 0) {
        soundFx.playLaser();
        soundFx.playCommitTone(commit.message);
      }

      activeBeamsRef.current = [...activeBeamsRef.current, ...newBeams];
      activeShockwavesRef.current = [...activeShockwavesRef.current, ...newShockwaves];
      setLaserBeams(activeBeamsRef.current);
      setShockwaves(activeShockwavesRef.current);

      onFilesUpdated(updatedFiles);
    },
    [repository, speed, onFilesUpdated]
  );

  // Animation frame loop for smooth laser progression, shockwaves, and supernovas
  useEffect(() => {
    const loop = (time: number) => {
      // 1. Advance lasers
      if (activeBeamsRef.current.length > 0) {
        const remainingBeams: LaserBeam[] = [];
        activeBeamsRef.current.forEach((beam) => {
          const elapsed = time - beam.startTime;
          const progress = elapsed / beam.duration;

          if (progress < 1.0) {
            remainingBeams.push({ ...beam, progress });
          }
        });

        if (remainingBeams.length !== activeBeamsRef.current.length) {
          activeBeamsRef.current = remainingBeams;
          setLaserBeams([...remainingBeams]);
        }
      }

      // 2. Expand and fade shockwaves
      if (activeShockwavesRef.current.length > 0) {
        const remainingWaves: Shockwave[] = [];
        activeShockwavesRef.current.forEach((wave) => {
          const elapsed = (time - wave.startTime) / 500;
          if (elapsed < 1.0) {
            remainingWaves.push({
              ...wave,
              radius: wave.radius + elapsed * (wave.maxRadius - wave.radius),
              opacity: Math.max(0, 0.85 * (1 - elapsed)),
            });
          }
        });

        activeShockwavesRef.current = remainingWaves;
        setShockwaves([...remainingWaves]);
      }

      // 3. Supernova events
      if (activeSupernovasRef.current.length > 0) {
        const remainingSupernovas = activeSupernovasRef.current.filter((s) => {
          return time - s.startTime < s.duration;
        });
        if (remainingSupernovas.length !== activeSupernovasRef.current.length) {
          activeSupernovasRef.current = remainingSupernovas;
          setSupernovas([...remainingSupernovas]);
        }
      }

      // 4. Auto advance commit timeline if playing
      if (isPlaying && totalCommits > 0) {
        const interval = Math.max(120, 1400 / speed);
        if (time - lastTickTimeRef.current >= interval) {
          lastTickTimeRef.current = time;
          setCurrentIndex((prev) => {
            const next = prev + 1;
            if (next >= totalCommits) {
              setIsPlaying(false);
              return prev;
            }
            applyCommit(next);
            return next;
          });
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, totalCommits, speed, applyCommit]);

  const togglePlay = () => {
    if (!isPlaying && currentIndex >= totalCommits - 1) {
      // Loop around to start if at end
      setCurrentIndex(0);
      applyCommit(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const seek = (index: number) => {
    const safeIndex = Math.max(0, Math.min(totalCommits - 1, index));
    setCurrentIndex(safeIndex);
    applyCommit(safeIndex);
  };

  const stepForward = () => {
    if (currentIndex < totalCommits - 1) {
      seek(currentIndex + 1);
    }
  };

  const stepBackward = () => {
    if (currentIndex > 0) {
      seek(currentIndex - 1);
    }
  };

  return {
    isPlaying,
    currentIndex,
    totalCommits,
    currentCommit,
    speed,
    laserBeams,
    shockwaves,
    supernovas,
    isMergeActive,
    togglePlay,
    seek,
    stepForward,
    stepBackward,
    setSpeed,
  };
}
