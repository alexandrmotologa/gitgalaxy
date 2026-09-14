import { useState, useEffect, useCallback, useMemo } from 'react';
import { RepositoryData, FileNode, GitCommit, GitAuthor } from '../engine/types';
import { parseGitLog, extractUniqueBranches } from '../engine/gitLogParser';
import { buildGalaxyLayout } from '../engine/galaxyLayout';

export function useGalaxyState() {
  const [repository, setRepository] = useState<RepositoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] = useState<[number, number, number] | null>(null);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  // Filters, Hotspot radar, and Cinematic camera
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthorFilter, setSelectedAuthorFilter] = useState<string | null>(null);
  const [selectedExtensionFilter, setSelectedExtensionFilter] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<GitAuthor | null>(null);
  const [isHotspotMode, setIsHotspotMode] = useState(false);
  const [isCinematicMode, setIsCinematicMode] = useState(false);

  // v3 feature states: Constellations, Branch Belts, Pilot mode, Commit modal, Help guide
  const [isConstellationsVisible, setIsConstellationsVisible] = useState(false);
  const [isBranchBeltsVisible, setIsBranchBeltsVisible] = useState(false);
  const [isPilotMode, setIsPilotMode] = useState(false);
  const [inspectedCommit, setInspectedCommit] = useState<GitCommit | null>(null);
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Load sample dataset
  const loadSampleDemo = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/sample_git_log.json');
      const text = await res.text();
      const commits = parseGitLog(text);
      const data = buildGalaxyLayout(commits, 'hyperion-core');
      setRepository(data);
      setSelectedFileId(null);
      setFocusTarget([0, 0, 0]);
    } catch (err) {
      console.error('Failed to load sample demo:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSampleDemo();
  }, [loadSampleDemo]);

  const loadCustomLog = useCallback((rawText: string, repoName: string = 'Custom Repository') => {
    setIsLoading(true);
    try {
      const commits = parseGitLog(rawText);
      if (commits.length === 0) {
        throw new Error('No valid commits could be parsed from input.');
      }
      const data = buildGalaxyLayout(commits, repoName);
      setRepository(data);
      setSelectedFileId(null);
      setFocusTarget([0, 0, 0]);
      setIsUploaderOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to parse Git log.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCommitsDirectly = useCallback((commits: RepositoryData['commits'], repoName: string) => {
    setIsLoading(true);
    try {
      const data = buildGalaxyLayout(commits, repoName);
      setRepository(data);
      setSelectedFileId(null);
      setFocusTarget([0, 0, 0]);
      setIsUploaderOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to initialize galaxy from commits.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectFile = useCallback(
    (fileId: string) => {
      setSelectedFileId(fileId);
      if (repository) {
        const file = repository.files.get(fileId);
        if (file) {
          setFocusTarget(file.position);
        }
      }
    },
    [repository]
  );

  const closeFileDetails = useCallback(() => {
    setSelectedFileId(null);
  }, []);

  const resetCamera = useCallback(() => {
    setFocusTarget([0, 0, 0]);
  }, []);

  const toggleHotspotMode = useCallback(() => {
    setIsHotspotMode((prev) => !prev);
  }, []);

  const toggleCinematicMode = useCallback(() => {
    setIsCinematicMode((prev) => !prev);
  }, []);

  const toggleConstellations = useCallback(() => {
    setIsConstellationsVisible((prev) => !prev);
  }, []);

  const toggleBranchBelts = useCallback(() => {
    setIsBranchBeltsVisible((prev) => !prev);
  }, []);

  const togglePilotMode = useCallback(() => {
    setIsPilotMode((prev) => !prev);
  }, []);

  const openCommitModal = useCallback((commit: GitCommit) => {
    setInspectedCommit(commit);
    setIsCommitModalOpen(true);
  }, []);

  const closeCommitModal = useCallback(() => {
    setIsCommitModalOpen(false);
  }, []);

  const toggleGuide = useCallback(() => {
    setIsGuideOpen((prev) => !prev);
  }, []);

  const handleAuthorFilterChange = useCallback((author: string | null) => {
    setSelectedAuthorFilter(author);
    if (!repository) return;

    if (author) {
      // Find matching files and focus camera close to cluster centroid
      let cx = 0, cy = 0, cz = 0, count = 0;
      repository.files.forEach((f) => {
        const isMatch = f.authors ? f.authors.includes(author) : f.topAuthor === author;
        if (isMatch) {
          cx += f.position[0];
          cy += f.position[1];
          cz += f.position[2];
          count++;
        }
      });
      if (count > 0) {
        // Offset slightly so camera orbits close to cluster
        const offset = Math.min(40, Math.max(15, count * 2));
        setFocusTarget([cx / count, cy / count + offset * 0.3, cz / count + offset]);
      }
    } else {
      setFocusTarget([0, 0, 0]);
    }
  }, [repository]);

  const handleExtensionFilterChange = useCallback((ext: string | null) => {
    setSelectedExtensionFilter(ext);
    if (!repository) return;

    if (ext) {
      let cx = 0, cy = 0, cz = 0, count = 0;
      repository.files.forEach((f) => {
        if (f.extension === ext) {
          cx += f.position[0];
          cy += f.position[1];
          cz += f.position[2];
          count++;
        }
      });
      if (count > 0) {
        const offset = Math.min(40, Math.max(15, count * 2));
        setFocusTarget([cx / count, cy / count + offset * 0.3, cz / count + offset]);
      }
    } else {
      setFocusTarget([0, 0, 0]);
    }
  }, [repository]);

  const handleFilesUpdated = useCallback((updatedFiles: Map<string, FileNode>) => {
    setRepository((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        files: updatedFiles,
      };
    });
  }, []);

  // Top 5 highest churn hotspots for the leaderboard
  const topHotspots = useMemo(() => {
    if (!repository) return [];
    return Array.from(repository.files.values())
      .sort((a, b) => b.heat - a.heat || (b.additions + b.deletions) - (a.additions + a.deletions))
      .slice(0, 5);
  }, [repository]);

  // Unique file extensions in repository
  const availableExtensions = useMemo(() => {
    if (!repository) return [];
    const set = new Set<string>();
    repository.files.forEach((f) => {
      if (f.extension) set.add(f.extension);
    });
    return Array.from(set).sort();
  }, [repository]);

  // Extract unique visual branch orbits from repository commits
  const branches = useMemo(() => {
    if (!repository || repository.commits.length === 0) return [];
    return extractUniqueBranches(repository.commits);
  }, [repository]);

  const selectBranch = useCallback(
    (branchName: string | null) => {
      setSelectedBranch(branchName);
      if (!repository || !branchName) return;
      const b = branches.find((br) => br.name === branchName);
      if (b) {
        setFocusTarget([b.radius * 0.7, b.radius * 0.3, b.radius * 0.7]);
      }
    },
    [repository, branches]
  );

  const selectAuthor = useCallback((author: GitAuthor | null) => {
    setSelectedAuthor(author);
  }, []);

  // Files modified by commits on the selected branch
  const selectedBranchFiles = useMemo(() => {
    if (!repository || !selectedBranch) return undefined;
    const fileSet = new Set<string>();
    repository.commits.forEach((c) => {
      if ((c.branch || 'main') === selectedBranch) {
        c.diffs.forEach((d) => fileSet.add(d.path));
      }
    });
    return fileSet;
  }, [repository, selectedBranch]);

  const selectedBranchColor = useMemo(() => {
    if (!selectedBranch) return undefined;
    const b = branches.find((br) => br.name === selectedBranch);
    return b ? b.color : '#00f0ff';
  }, [selectedBranch, branches]);

  return {
    repository,
    isLoading,
    selectedFileId,
    hoveredFileId,
    focusTarget,
    isUploaderOpen,
    searchQuery,
    selectedAuthorFilter,
    selectedExtensionFilter,
    selectedBranch,
    selectedAuthor,
    selectedBranchFiles,
    selectedBranchColor,
    isHotspotMode,
    isCinematicMode,
    isConstellationsVisible,
    isBranchBeltsVisible,
    isPilotMode,
    isGuideOpen,
    inspectedCommit,
    isCommitModalOpen,
    topHotspots,
    availableExtensions,
    branches,
    setIsUploaderOpen,
    setIsGuideOpen,
    selectFile,
    closeFileDetails,
    selectBranch,
    selectAuthor,
    setHoveredFileId,
    setFocusTarget,
    resetCamera,
    setSearchQuery,
    setSelectedAuthorFilter: handleAuthorFilterChange,
    setSelectedExtensionFilter: handleExtensionFilterChange,
    toggleHotspotMode,
    toggleCinematicMode,
    toggleConstellations,
    toggleBranchBelts,
    togglePilotMode,
    toggleGuide,
    openCommitModal,
    closeCommitModal,
    loadCustomLog,
    loadCommitsDirectly,
    loadSampleDemo,
    handleFilesUpdated,
  };
}

