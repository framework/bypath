import React from 'react';
import { sample } from 'effector';

import { createRoute, withRoute } from '../../../src';
import { pageNameSet, root } from './internal';

const route = createRoute(root);

const PageAnother = withRoute(route, () => {
  return <div>For example just another page</div>;
});

export default PageAnother;

sample({
  source: route.enter,
  fn: () => 'page-another',
  target: pageNameSet,
});
