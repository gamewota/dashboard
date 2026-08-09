# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Testing

Vitest with jsdom and Testing Library.

```bash
npm test              # run the suite once
npm run test:watch    # re-run on change
npm run test:coverage # coverage report
npm run typecheck     # type-check app AND test files
```

Tests live beside the code they cover as `*.test.ts(x)`. Shared helpers are in
`src/test/`: `setup.ts` (global setup) and `renderWithProviders.tsx`, which wraps
a component in a Redux store and router and exposes `setViewport()` for
switching between the desktop and mobile breakpoints.

Test files are excluded from `tsconfig.app.json` so they never ship in a build;
`tsconfig.test.json` type-checks them instead. `npm run build` does not run the
tests — run `npm test` before pushing.

Two suites are regression guards for bugs that reached production, and are worth
keeping green:

- `src/features/authHeaderCoverage.test.ts` scans every slice and fails if any
  request outside the login endpoint omits `getAuthHeader()`. `GET /gacha/prices`
  once 401'd for exactly this reason.
- `src/components/AppLayout.test.tsx` asserts the sidebar opens *and* closes at
  both breakpoints, and that no responsive class can hide the toggle. Note that
  jsdom does not apply CSS, so those checks assert on class names rather than
  computed visibility.

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
