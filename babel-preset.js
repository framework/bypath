module.exports = function () {
  return {
    plugins: [
      [
        'effector/babel-plugin',
        {
          noDefaults: true,
          factories: ['bypath'],
        },
        'bypath',
      ],
    ],
  };
};
