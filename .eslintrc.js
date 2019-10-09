const os = require('os');

module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es6': true,
    'node': true,
  },
  'extends': [
    'eslint:recommended',
    'google',
  ],
  'plugins': [
    'html',
  ],
  'globals': {
    'Atomics': 'readonly',
    'Eider': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parserOptions': {
    'ecmaVersion': 2018,
  },
  'rules': {
    'arrow-parens': [
        'error',
        'as-needed',
    ],
    'camelcase': [
      'off',
    ],
    'indent': [
        'error',
        4,
        {
            'outerIIFEBody': 0,
        }
    ],
    'linebreak-style': [
        'error',
        (os.platform() === 'win32' ? 'windows' : 'unix'),
    ],
    'quotes': [
        'error',
        'single',
        { 'avoidEscape': true },
    ],
    'require-jsdoc': [
        'off',
    ],
  },
};
