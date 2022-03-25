module.exports = {
  extends: '@loopback/eslint-config',
  rules: {
    'unused-imports/no-unused-imports': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports-ts': 'off',
  },
  overrides: [
    {
      files: ['**/*.{ts}'],
      rules: {
        'unused-imports/no-unused-imports': 'off',
        'no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'off',
        '@typescript-eslint/no-shadow': 'off',
        'unused-imports/no-unused-imports-ts': 'off',
      },
    },
  ],
};
