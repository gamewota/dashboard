# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Beatmap Editor Integration

This dashboard includes an integrated beatmap editor micro-frontend from the [gamewota/beatmap-editor](https://github.com/gamewota/beatmap-editor) repository.

### Features
- Create and edit beatmaps for rhythm game songs
- Adjustable BPM, snap division, offset, zoom, and duration
- Export beatmaps as JSON files
- Import previously created beatmaps
- Real-time note statistics

### Accessing the Editor
Once logged in, navigate to **Content > Beatmap Editor** in the sidebar menu, or visit `/dashboard/beatmap-editor`.

### Technical Details
The beatmap editor is loaded as a web component from GitHub Pages:
- Script URL: `https://gamewota.github.io/beatmap-editor/beatmap-editor.es.js`
- Custom element: `<beatmap-editor>`
- Events: `noteschange` - fired when notes are added/deleted
- Methods: `exportBeatmap()`, `importBeatmap(json)`

For more information about the beatmap editor, see the [beatmap-editor repository](https://github.com/gamewota/beatmap-editor).

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
