import { useEffect, useRef, useState } from 'react';
import type { BeatmapEditorElement, BeatmapNote, NotesChangeEvent } from '../types/beatmap-editor';

export default function BeatmapEditor() {
  const editorRef = useRef<BeatmapEditorElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [snapDivision, setSnapDivision] = useState(4);
  const [offsetMs, setOffsetMs] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [duration, setDuration] = useState(300);
  const [notes, setNotes] = useState<BeatmapNote[]>([]);

  useEffect(() => {
    // Load the web component script from GitHub Pages
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://gamewota.github.io/beatmap-editor/beatmap-editor.es.js';
    script.onload = () => {
      setIsLoaded(true);
      // Create the editor element after script loads
      if (containerRef.current) {
        const editor = document.createElement('beatmap-editor') as BeatmapEditorElement;
        editor.style.minHeight = '600px';
        editor.style.display = 'block';
        containerRef.current.appendChild(editor);
        editorRef.current = editor;
      }
    };
    script.onerror = () => {
      console.error('Failed to load beatmap editor web component');
    };
    document.head.appendChild(script);

    // Listen for notes change events
    const handleNotesChange = (e: Event) => {
      const event = e as NotesChangeEvent;
      setNotes(event.detail.notes);
    };
    document.addEventListener('noteschange', handleNotesChange);

    return () => {
      document.removeEventListener('noteschange', handleNotesChange);
      // Cleanup the container
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  // Update editor attributes when they change
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setAttribute('bpm', String(bpm));
      editorRef.current.setAttribute('snap-enabled', String(snapEnabled));
      editorRef.current.setAttribute('snap-division', String(snapDivision));
      editorRef.current.setAttribute('offset-ms', String(offsetMs));
      editorRef.current.setAttribute('zoom', String(zoom));
      editorRef.current.setAttribute('duration', String(duration));
    }
  }, [bpm, snapEnabled, snapDivision, offsetMs, zoom, duration]);

  const handleExport = () => {
    if (editorRef.current) {
      const json = editorRef.current.exportBeatmap();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beatmap-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const json = event.target?.result as string;
          if (editorRef.current) {
            editorRef.current.importBeatmap(json);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClear = () => {
    if (editorRef.current && confirm('Are you sure you want to clear all notes?')) {
      editorRef.current.importBeatmap('[]');
      setNotes([]);
    }
  };

  return (
    <div className="p-6 ml-0 md:ml-80">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Beatmap Editor</h1>
          <p className="text-base-content/70 mt-2">
            Create and edit beatmaps for rhythm game songs
          </p>
        </div>

        {!isLoaded && (
          <div className="alert alert-info mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Loading beatmap editor...</span>
          </div>
        )}

        {/* Controls */}
        <div className="card bg-base-200 shadow-lg mb-4">
          <div className="card-body">
            <h2 className="card-title">Controls</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">BPM</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
                  min="1"
                  max="300"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Snap Division</span>
                </label>
                <select
                  className="select select-bordered"
                  value={snapDivision}
                  onChange={(e) => setSnapDivision(parseInt(e.target.value))}
                >
                  <option value="1">1/1</option>
                  <option value="2">1/2</option>
                  <option value="4">1/4</option>
                  <option value="8">1/8</option>
                  <option value="16">1/16</option>
                  <option value="32">1/32</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Offset (ms)</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={offsetMs}
                  onChange={(e) => setOffsetMs(parseInt(e.target.value) || 0)}
                  step="10"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Zoom (%)</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={zoom}
                  onChange={(e) => setZoom(parseInt(e.target.value) || 100)}
                  min="50"
                  max="200"
                  step="10"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Duration (s)</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 300)}
                  min="1"
                  max="600"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Snap</span>
                </label>
                <div className="flex items-center h-12">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={snapEnabled}
                    onChange={(e) => setSnapEnabled(e.target.checked)}
                  />
                  <span className="ml-2 text-sm">{snapEnabled ? 'On' : 'Off'}</span>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            <div className="flex flex-wrap gap-2">
              <button className="btn btn-primary" onClick={handleExport}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Beatmap
              </button>
              <button className="btn btn-secondary" onClick={handleImport}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import Beatmap
              </button>
              <button className="btn btn-error" onClick={handleClear}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Notes
              </button>
            </div>

            <div className="stats shadow mt-4">
              <div className="stat">
                <div className="stat-title">Total Notes</div>
                <div className="stat-value text-primary">{notes.length}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Tap Notes</div>
                <div className="stat-value text-secondary">{notes.filter((n) => n.type === 'tap').length}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Hold Notes</div>
                <div className="stat-value text-accent">{notes.filter((n) => n.type === 'hold').length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body p-0">
            <div ref={containerRef} />
          </div>
        </div>

        {/* Instructions */}
        <div className="card bg-base-100 shadow-lg mt-4">
          <div className="card-body">
            <h2 className="card-title">How to Use</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Click</strong> on the grid to add tap notes</li>
              <li><strong>Click and drag</strong> to create hold notes</li>
              <li><strong>Right-click</strong> on notes to delete them</li>
              <li><strong>Adjust BPM</strong> to match your song's tempo</li>
              <li><strong>Use snap division</strong> to align notes to beats</li>
              <li><strong>Set offset</strong> if your audio doesn't start at 0ms</li>
              <li><strong>Export</strong> when done to save your beatmap as JSON</li>
              <li><strong>Import</strong> to load a previously saved beatmap</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
