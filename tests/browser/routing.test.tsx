import React from 'react';
import { Effect, Event, Store, createEvent } from 'effector';

import { createBrowserApplication, createRoute, withRoute } from '../../src';

test('check triggering route without binding to domain', () => {
  const homePageHatch = createRoute();
  const HomePage = withRoute(homePageHatch, () => <div>Home page</div>);

  const notFoundPageHatch = createRoute();
  const NotFoundPage = withRoute(notFoundPageHatch, () => <span>Not found</span>);
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

  const homePageEnter = watch(homePageHatch.enter);
  const notFoundPageEnter = watch(notFoundPageHatch.enter);

  expect(app).not.toBeUndefined();
  expect(homePageEnter).not.toBeCalled();
  expect(notFoundPageEnter).not.toBeCalled();

  ready();
  expect(homePageEnter).toBeCalled();
  expect(notFoundPageEnter).not.toBeCalled();

  homePageEnter.mockClear();
  notFoundPageEnter.mockClear();
  app!.navigation.historyPush('/random/address');

  expect(homePageEnter).not.toBeCalled();
  expect(notFoundPageEnter).toBeCalledWith({ params: { '0': '/random/address' }, query: {} }); // TODO: change structure of * matcher
});

test('trigger hatch on enter and leave', () => {
  const hatchHomePage = createRoute();
  const HomePage = withRoute(hatchHomePage, () => <div>Home page</div>);

  const hatchNotFoundPage = createRoute();
  const NotFoundPage = withRoute(hatchNotFoundPage, () => <span>Not found</span>);
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

  const homePageEnter = watch(hatchHomePage.enter);
  const homePageUpdate = watch(hatchHomePage.update);
  const homePageExit = watch(hatchHomePage.exit);
  const notFoundPageEnter = watch(hatchNotFoundPage.enter);
  const notFoundPageUpdate = watch(hatchNotFoundPage.update);
  const notFoundPageExit = watch(hatchNotFoundPage.exit);

  function cleanup() {
    homePageEnter.mockClear();
    homePageUpdate.mockClear();
    homePageExit.mockClear();
    notFoundPageEnter.mockClear();
    notFoundPageUpdate.mockClear();
    notFoundPageExit.mockClear();
  }

  ready();
  expect(homePageEnter).toBeCalled();
  expect(homePageUpdate).not.toBeCalled();
  expect(homePageExit).not.toBeCalled();
  expect(notFoundPageEnter).not.toBeCalled();
  expect(notFoundPageUpdate).not.toBeCalled();
  expect(notFoundPageExit).not.toBeCalled();
  cleanup();

  app.navigation.historyPush('/not-found');
  expect(homePageEnter).not.toBeCalled();
  expect(homePageUpdate).not.toBeCalled();
  expect(homePageExit).toBeCalled();
  expect(notFoundPageEnter).toBeCalled();
  expect(notFoundPageUpdate).not.toBeCalled();
  expect(notFoundPageExit).not.toBeCalled();
  cleanup();

  app.navigation.historyPush('/');
  expect(homePageEnter).toBeCalled();
  expect(homePageUpdate).not.toBeCalled();
  expect(homePageExit).not.toBeCalled();
  expect(notFoundPageEnter).not.toBeCalled();
  expect(notFoundPageUpdate).not.toBeCalled();
  expect(notFoundPageExit).toBeCalled();
  cleanup();
});

/** Triggers fn on effect start */
function watch<T>(unit: Event<T> | Store<T> | Effect<T, any, any>) {
  const fn = jest.fn();
  unit.watch(fn);
  return fn;
}
