module.exports = function () {
  return {
    plugins: [
      [
        'effector/babel-plugin',
        {
          factories: ['framework'],
        },
        'framework/effector',
      ],
    ],
  };
};
