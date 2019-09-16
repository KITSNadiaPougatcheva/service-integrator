'use strict';
module.exports = {
  extends: 'eslint-config-airbnb-base',
  env: {
    node: true,
    mocha: true,
  },
  rules: {
    'no-console': 0,
    'linebreak-style': 0,
    strict: ['error', 'global'],
  },
  parserOptions: {
    sourceType: 'script',
  },
  
};