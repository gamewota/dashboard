// Type declarations for beatmap-editor web component

export interface BeatmapNote {
  id: string;
  lane: number;
  time: number;
  type: 'tap' | 'hold';
  duration?: number;
}

export interface BeatmapEditorElement extends HTMLElement {
  exportBeatmap(): string;
  importBeatmap(json: string): void;
}

export interface NotesChangeEvent extends CustomEvent {
  detail: {
    notes: BeatmapNote[];
  };
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'beatmap-editor': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          bpm?: string | number;
          'snap-enabled'?: string | boolean;
          'snap-division'?: string | number;
          'offset-ms'?: string | number;
          zoom?: string | number;
          duration?: string | number;
          notes?: string;
          ref?: React.Ref<BeatmapEditorElement>;
        },
        HTMLElement
      >;
    }
  }
}
