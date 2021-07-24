import React from 'react';
import { createEvent } from 'effector';

import { createBrowserApplication, createHatch, withHatch } from '../../src';

test('check triggering hatch without binding to domain', () => {
  const homePageHatch = createHatch();
  const HomePage = withHatch(homePageHatch, () => <div>Home page</div>);

  const notFoundPageHatch = createHatch();
  const NotFoundPage = withHatch(notFoundPageHatch, () => <span>Not found</span>);
  const routes = [
    {
      path: '/',
      exact: true,
      component: HomePage,
    },
    {
      path: '*',
      component: NotFoundPage,
    },
  ];

  const ready = createEvent();

  const app = createBrowserApplication({
    ready,
    routes,
  });

  const homePageEnter = jest.fn();
  homePageHatch.enter.watch(homePageEnter);

  const notFoundPageEnter = jest.fn();
  notFoundPageHatch.enter.watch(notFoundPageEnter);

  expect(homePageEnter).not.toBeCalled();
  expect(notFoundPageEnter).not.toBeCalled();

  ready();

  expect(homePageEnter).toBeCalled();
});
