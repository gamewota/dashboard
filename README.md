# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Beatmap Editor Integration

This dashboard integrates with the [gamewota/beatmap-editor](https://github.com/gamewota/beatmap-editor) repository using a separation of concerns architecture.

### Architecture

**Dashboard Responsibilities:**
- **Data Management**: Loads and manages song data from the API
- **RBAC (Role-Based Access Control)**: Controls who can access the beatmap editor via permissions
- **User Context**: Provides authenticated user information to the editor
- **Data Integration**: Passes selected song data to the editor via URL parameters

**Beatmap Editor Responsibilities:**
- **Editor Functionality**: All beatmap editing features and UI
- **Independent Deployment**: Deployed separately on GitHub Pages
- **Zero Dashboard Coupling**: Can be updated without dashboard changes

### Features

- **Permission-Based Access**: Requires `beatmap.edit` permission to access
- **Song Selection**: Dropdown to select which song to edit beatmaps for
- **Data Passing**: Selected song data (ID, title, assets) passed to editor via URL parameters
- **User Context**: User information (ID, username) passed for authentication/tracking
- **Automatic Updates**: Changes to beatmap-editor are automatically available

### Accessing the Editor

Once logged in with the appropriate permissions, navigate to **Content > Beatmap Editor** in the sidebar menu, or visit `/dashboard/beatmap-editor`.

### Technical Details

**Integration Method:**
- iframe embedding from `https://gamewota.github.io/beatmap-editor/`
- URL parameters for data passing:
  - `songId` - Selected song ID
  - `songTitle` - Selected song title
  - `songAssets` - Song asset URL
  - `userId` - Current user ID
  - `username` - Current username

**RBAC:**
- Page requires `beatmap.edit` permission
- Sidebar menu item hidden for users without permission
- Permission error displayed when accessing directly without permission

For more information about the beatmap editor itself, see the [beatmap-editor repository](https://github.com/gamewota/beatmap-editor).

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
