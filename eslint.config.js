import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'scratch/**', 'public/**', 'coverage/**', 'vite.config.ts.timestamp-*.mjs'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off',
      // React Compiler / Rules-of-React lint rules (from eslint-plugin-react-hooks v7).
      // Set to 'warn' so Rules-of-React violations — the things that make the
      // React Compiler silently bail out of a file — are visible without
      // hard-failing the build. Promote to 'error' once the codebase is clean.
      //
      // Audit CQ-07 — promotion ratchet plan
      // -----------------------------------------------------------------
      // Goal: move every entry below from 'warn' → 'error' so future
      // regressions block CI and the React Compiler can compile every
      // '"use memo"'-annotated file without bailing.
      //
      // Why not promoted yet: the home-page batch (W-01, K-01, S-01, H-06,
      // CQ-03, CQ-06, CQ-12 etc.) cleared the chrome and several hooks,
      // but the broader codebase still has setState-in-effect / impurity
      // warnings in files outside the home page that haven't been
      // touched. Flipping the switch before those are fixed would error
      // the build on unrelated work.
      //
      // Promotion order (cheapest first; flip each individually so you
      // can see which file regresses):
      //
      //   1. 'react-hooks/refs'           — refs are mostly clean already.
      //   2. 'react-hooks/static-components' — depends on no
      //      `function Inner() { ... }` declarations inside render bodies;
      //      `pages/Resources.tsx:41-52` is the known offender, fix or
      //      hoist it then flip this.
      //   3. 'react-hooks/immutability'   — usually trivial to fix
      //      (immutable update spreads); flip after a sweep.
      //   4. 'react-hooks/purity'         — needs the
      //      `document.body.style.overflow` mutation in `Navbar.tsx` to
      //      carry an eslint-disable-next-line (the comment is already
      //      in place from CQ-06; add the suppression line when flipping).
      //   5. 'react-hooks/set-state-in-effect' — last because
      //      `components/Reveal.tsx`'s IntersectionObserver callback is
      //      already annotated with eslint-disable-next-line (CQ-03), but
      //      similar IO bridges elsewhere may need the same treatment.
      //
      // Once all five are 'error', delete this block and rely on
      // `eslint-plugin-react-hooks`'s default error level.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/purity': 'warn',
      'jsx-a11y/no-redundant-roles': 'off',
      'jsx-a11y/anchor-has-content': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'jsx-a11y/role-supports-aria-props': 'off',
      'no-control-regex': 'off',
      'prefer-const': 'off',
    },
  },
);
