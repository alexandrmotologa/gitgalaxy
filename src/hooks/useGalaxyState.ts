import { useState, useEffect, useCallback } from 'react';
import { RepositoryData, FileNode } from '../engine/types';
import { parseGitLog } from '../engine/gitLogParser';
import { buildGalaxyLayout } from '../engine/galaxyLayout';

export function useGalaxyState() {
  const [repository, setRepository] = useState<RepositoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] = useState<[number, number, number] | null>(null);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

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

  const handleFilesUpdated = useCallback((updatedFiles: Map<string, FileNode>) => {
    setRepository((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        files: updatedFiles,
      };
    });
  }, []);

  return {
    repository,
    isLoading,
    selectedFileId,
    hoveredFileId,
    focusTarget,
    isUploaderOpen,
    setIsUploaderOpen,
    selectFile,
    closeFileDetails,
    setHoveredFileId,
    resetCamera,
    loadCustomLog,
    loadSampleDemo,
    handleFilesUpdated,
  };
}
