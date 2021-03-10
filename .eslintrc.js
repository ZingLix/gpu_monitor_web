module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  globals: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
    page: false,
  },
  rules: {
    'no-unused-vars': 'off',
    'no-console': 'off',
  },
};
