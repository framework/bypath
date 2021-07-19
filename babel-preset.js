module.exports = function () {
  return {
    plugins: [
      [
        'effector/babel-plugin',
        {
          noDefaults: true,
          importName: 'framework',
        },
        'framework',
      ],
    ],
  };
};
