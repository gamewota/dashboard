export default function BeatmapEditor() {
  return (
    <div className="p-6 ml-0 md:ml-80">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Beatmap Editor</h1>
          <p className="text-base-content/70 mt-2">
            Create and edit beatmaps for rhythm game songs
          </p>
        </div>

        {/* Embed the beatmap editor from GitHub Pages */}
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body p-0">
            <iframe
              src="https://gamewota.github.io/beatmap-editor/"
              title="Beatmap Editor"
              className="w-full border-0"
              style={{ minHeight: '800px', height: 'calc(100vh - 200px)' }}
              allow="fullscreen"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="card bg-base-100 shadow-lg mt-4">
          <div className="card-body">
            <h2 className="card-title">About</h2>
            <p>
              This beatmap editor is loaded directly from the{' '}
              <a
                href="https://github.com/gamewota/beatmap-editor"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary"
              >
                beatmap-editor repository
              </a>
              . All features and updates from the standalone editor are automatically available here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}