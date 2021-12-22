const presets = ['@babel/preset-react', '@babel/preset-typescript'];

const common = {
  presets,
  plugins: [
    ['effector/babel-plugin', { factories: ['src/contract', 'src/logical'] }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-transform-react-constant-elements',
  ],
  overrides: [
    {
      test(filename, { envName }) {
        return envName === 'test';
      },
      plugins: ['@babel/plugin-transform-runtime'],
      presets: [
        [
          '@babel/preset-env',
          {
            loose: true,
            useBuiltIns: 'entry',
            corejs: 3,
            modules: 'commonjs',
            shippedProposals: true,
            targets: {
              node: '10',
              browsers: [
                'last 2 Chrome versions',
                'last 2 Firefox versions',
                'last 2 Safari versions',
                'last 1 Edge versions',
              ],
            },
          },
        ],
      ],
    },
    {
      test(_filename, { envName }) {
        return envName !== 'test';
      },
      presets: [
        [
          '@babel/preset-env',
          {
            loose: true,
            useBuiltIns: 'entry',
            corejs: 3,
            modules: false,
            shippedProposals: true,
            targets: {
              node: '10',
              browsers: [
                'last 2 Chrome versions',
                'last 2 Firefox versions',
                'last 2 Safari versions',
                'last 1 Edge versions',
              ],
            },
          },
        ],
      ],
    },
    {
      test(filename) {
        return filename?.endsWith('.tsx') || filename?.endsWith('.ts');
      },
      presets: [
        [
          '@babel/preset-typescript',
          {
            isTSX: true,
            allExtensions: true,
          },
        ],
      ],
    },
  ],
  sourceMaps: true,
};

module.exports = (api) => {
  if (api && api.cache && api.cache.never) api.cache.never();
  return common;
};
