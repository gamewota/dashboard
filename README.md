# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Beatmap Editor Integration

This dashboard includes an integrated beatmap editor from the [gamewota/beatmap-editor](https://github.com/gamewota/beatmap-editor) repository.

### Features
The beatmap editor is embedded directly from GitHub Pages, providing all features from the standalone editor:
- Create and edit beatmaps for rhythm game songs
- All controls and functionality from the standalone editor
- Automatic updates when the beatmap-editor is updated

### Accessing the Editor
Once logged in, navigate to **Content > Beatmap Editor** in the sidebar menu, or visit `/dashboard/beatmap-editor`.

### Technical Details
The beatmap editor is loaded as an iframe from GitHub Pages:
- URL: `https://gamewota.github.io/beatmap-editor/`
- All features and updates from the standalone editor are automatically available
- No duplication of controls or logic needed

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
