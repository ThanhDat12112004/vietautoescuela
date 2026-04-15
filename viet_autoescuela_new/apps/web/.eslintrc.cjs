/**
 * Import rules for apps/web. See docs/STRUCTURE.md.
 * @type {import('eslint').Linter.Config}
 */
const restrictedPaths = [
  {
    name: '@/constants/routes',
    message: "Import APP_ROUTES from '@/config/routes'.",
  },
];

const restrictedPatternsBase = [
  {
    group: [
      '@/components/Footer',
      '@/components/Navbar',
      '@/components/AuthSplitLayout',
      '@/components/LanguageDropdown',
      '@/components/FloatingContactButton',
    ],
    message: "Import from '@/components/layout' (barrel).",
  },
  {
    group: ['@/components/BrandLogo', '@/components/BrandIcons'],
    message: "Import from '@/components/brand' (barrel).",
  },
  {
    group: ['@/components/LocaleLink'],
    message: "Import LocaleLink from '@/components/navigation' (barrel).",
  },
  {
    group: [
      '@/components/AppProviders',
      '@/components/AppChrome',
      '@/components/RequireAuthClient',
      '@/components/SetDocumentLang',
    ],
    message: "Import from '@/components/shell' (barrel).",
  },
  {
    group: ['@/components/layout/*'],
    message:
      "Import from '@/components/layout' (barrel). Inside layout/, use relative imports for sibling files.",
  },
  {
    group: ['@/components/brand/*'],
    message: "Import from '@/components/brand' (barrel).",
  },
  {
    group: ['@/components/shell/*'],
    message: "Import from '@/components/shell' (barrel).",
  },
  {
    group: ['@/components/navigation/*'],
    message: "Import from '@/components/navigation' (barrel).",
  },
  {
    group: ['@/screens/*'],
    message:
      "Import page screens from '@/screens' (barrel). Add new screens to screens/index.ts.",
  },
  {
    group: ['@/features/profile/*'],
    message: "Import from '@/features/profile' (barrel).",
  },
  {
    group: ['@/features/quiz-take/*'],
    message: "Import from '@/features/quiz-take' (barrel).",
  },
];

const restrictedPatternsOutsideIndexAndAdmin = [
  ...restrictedPatternsBase,
  {
    group: ['@/features/index/*'],
    message:
      "Import from '@/features/index' (barrel). Deep paths are only for files inside src/features/index/.",
  },
  {
    group: ['@/features/admin/*'],
    message:
      "Import from '@/features/admin' (barrel). Deep paths are only for files inside src/features/admin/.",
  },
];

module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    '@next/next/no-img-element': 'off',
    'no-restricted-imports': [
      'error',
      { paths: restrictedPaths, patterns: restrictedPatternsBase },
    ],
  },
  overrides: [
    {
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      excludedFiles: ['src/features/index/**', 'src/features/admin/**'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: restrictedPaths,
            patterns: restrictedPatternsOutsideIndexAndAdmin,
          },
        ],
      },
    },
  ],
};
