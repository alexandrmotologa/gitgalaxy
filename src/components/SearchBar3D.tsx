import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, FileCode } from 'lucide-react';
import { RepositoryData, FileNode } from '../engine/types';
import { getHeatColorHex } from '../engine/churnCalculator';

interface SearchBar3DProps {
  repository: RepositoryData | null;
  searchQuery: string;
  selectedAuthorFilter: string | null;
  selectedExtensionFilter: string | null;
  availableExtensions: string[];
  onSearchChange: (query: string) => void;
  onAuthorFilterChange: (author: string | null) => void;
  onExtensionFilterChange: (ext: string | null) => void;
  onSelectFile: (fileId: string) => void;
}

export function SearchBar3D({
  repository,
  searchQuery,
  selectedAuthorFilter,
  selectedExtensionFilter,
  availableExtensions,
  onSearchChange,
  onAuthorFilterChange,
  onExtensionFilterChange,
  onSelectFile,
}: SearchBar3DProps) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkey Ctrl+K or '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement?.tagName !== 'INPUT')) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered files
  const matchingFiles = useMemo(() => {
    if (!repository || !searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: FileNode[] = [];

    for (const file of repository.files.values()) {
      if (file.path.toLowerCase().includes(q)) {
        results.push(file);
        if (results.length >= 8) break;
      }
    }
    return results;
  }, [repository, searchQuery]);

  const authors = useMemo(() => {
    if (!repository) return [];
    return Array.from(repository.authors.values());
  }, [repository]);

  return (
    <div className="relative pointer-events-auto select-none">
      {/* Search Input Bar */}
      <div className="flex items-center gap-2 bg-galaxy-900/85 backdrop-blur-md border border-cyan-500/30 rounded-2xl px-3 py-1.5 shadow-lg w-80 lg:w-96 focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(0,240,255,0.25)] transition-all">
        <Search size={15} className="text-cyan-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search files or Ctrl+K..."
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-transparent text-xs font-mono text-gray-100 placeholder-gray-500 focus:outline-none"
        />

        {searchQuery && (
          <button
            onClick={() => {
              onSearchChange('');
              setIsOpen(false);
            }}
            className="text-gray-400 hover:text-white p-0.5"
          >
            <X size={13} />
          </button>
        )}

        {/* Filter Trigger Dropdown for Authors */}
        <select
          value={selectedAuthorFilter || ''}
          onChange={(e) => onAuthorFilterChange(e.target.value || null)}
          className="bg-gray-950/60 border border-gray-800 text-[10px] font-mono text-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-cyan-500/40 shrink-0 cursor-pointer"
          title="Filter by Author"
        >
          <option value="">All Authors</option>
          {authors.map((a) => (
            <option key={a.name} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>

        {/* Filter Trigger for Extensions */}
        {availableExtensions.length > 0 && (
          <select
            value={selectedExtensionFilter || ''}
            onChange={(e) => onExtensionFilterChange(e.target.value || null)}
            className="bg-gray-950/60 border border-gray-800 text-[10px] font-mono text-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-cyan-500/40 shrink-0 cursor-pointer"
            title="Filter by Extension"
          >
            <option value="">All Types</option>
            {availableExtensions.map((ext) => (
              <option key={ext} value={ext}>
                .{ext}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Active Filter Badges */}
      {(selectedAuthorFilter || selectedExtensionFilter) && (
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {selectedAuthorFilter && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/90 border border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.3)] animate-fade-in">
              <span>Author: {selectedAuthorFilter}</span>
              <button
                onClick={() => onAuthorFilterChange(null)}
                className="hover:text-white ml-0.5 p-0.5 rounded hover:bg-cyan-900/60"
                title="Remove author filter"
              >
                <X size={10} />
              </button>
            </div>
          )}

          {selectedExtensionFilter && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-950/90 border border-purple-500/60 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)] animate-fade-in">
              <span>Type: .{selectedExtensionFilter}</span>
              <button
                onClick={() => onExtensionFilterChange(null)}
                className="hover:text-white ml-0.5 p-0.5 rounded hover:bg-purple-900/60"
                title="Remove extension filter"
              >
                <X size={10} />
              </button>
            </div>
          )}

          <button
            onClick={() => {
              onAuthorFilterChange(null);
              onExtensionFilterChange(null);
            }}
            className="text-[10px] font-mono text-gray-400 hover:text-rose-400 px-1 py-0.5 rounded transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Autocomplete Dropdown List */}
      {isOpen && matchingFiles.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-galaxy-900/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
          <div className="p-2 border-b border-gray-800 text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>Found {matchingFiles.length} files</span>
            <span className="text-cyan-400">Click to lock camera</span>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {matchingFiles.map((file) => {
              const heatColor = getHeatColorHex(file.heat);
              return (
                <button
                  key={file.id}
                  onClick={() => {
                    onSelectFile(file.id);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-cyan-950/50 border-b border-gray-800/40 last:border-none flex items-center justify-between gap-2 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode size={14} style={{ color: heatColor }} className="shrink-0" />
                    <div className="truncate font-mono text-xs">
                      <span className="text-white font-semibold">{file.filename}</span>
                      <span className="text-gray-500 text-[10px] ml-1.5">{file.directory}/</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-[10px] font-mono">
                    <span className="text-gray-400">{file.commitCount} revs</span>
                    <span
                      className="px-1.5 py-0.5 rounded font-bold"
                      style={{ color: heatColor, backgroundColor: `${heatColor}20` }}
                    >
                      {(file.heat * 100).toFixed(0)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
