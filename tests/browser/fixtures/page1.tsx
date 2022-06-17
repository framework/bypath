import React from 'react';
import { sample } from 'effector';

import { createRoute, withRoute } from '../../../src';
import { pageNameSet, root } from './internal';

const route = createRoute(root);

route.enter.watch((e) => console.info('PAGE1 Hatch Enter', e));

const Page1 = withRoute(route, () => {
  return <div>For example first page</div>;
});

export default Page1;

sample({
  source: route.enter,
  fn: () => 'page1',
  target: pageNameSet,
});
