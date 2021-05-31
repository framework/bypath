import { Event, combine, createEffect, createEvent, createStore, forward, guard } from 'effector';
import { RouteConfig, matchRoutes } from 'react-router-config';
import { splitMap } from 'patronum';

import { HatchParams, getHatch } from './hatch';
import { createNavigation } from './navigation';

export function createBrowserApplication(config: { ready: Event<void>; routes: RouteConfig[] }) {
  const navigation = createNavigation();
  forward({ from: config.ready, to: navigation.historyEmitCurrent });

  const routesMatched = navigation.historyChanged.map((change) => ({
    routes: matchRoutes(config.routes, change.pathname),
    change,
  }));

  const routeResolved = routesMatched.filterMap(({ routes, change }) => {
    const found = routes.find((route) => route.route.path === change.pathname);
    if (found) {
      return {
        ...found,
        change,
      };
    }
  });

  for (const { component, path } of config.routes) {
    if (!component) return;
    const { routeMatched, __: notMatched } = splitMap({
      source: routeResolved,
      cases: {
        routeMatched: ({ route, match, change }) => {
          if (route.path === path) {
            return {
              params: match.params, // /user/:userId -> /user/123 -> { userId: 123 }
              query: Object.fromEntries(new URLSearchParams(change.search)),
            };
          }
          return undefined;
        },
      },
    });

    const hatchEnter = createEvent<HatchParams>();
    const hatchUpdate = createEvent<HatchParams>();
    const hatchExit = createEvent<void>();

    // Triggered when hatch is used from the main bundle
    const dontNeedLoadChunk = createEvent();

    const $chunkLoaded = createStore(false);
    const $hasHatch = createStore(getHatch(component) !== undefined);

    const loadPageFx = createEffect(async () => {
      const loader = (component as any).load;
      if (typeof loader === 'function') {
        const module = await loader();
        if (!module.default) {
          console.info(`Not found default export for "${path}" route`);
          return null;
        }
        // eslint-disable-next-line @typescript-eslint/ban-types
        return module.default as {};
      }
      return component;
    });

    const setupHatchLinksFx = createEffect((page: any) => {
      const hatch = getHatch(page);
      if (hatch) {
        forward({ from: hatchEnter, to: hatch.enter });
        forward({ from: hatchUpdate, to: hatch.update });
        forward({ from: hatchExit, to: hatch.exit });
        return true;
      }
      return false;
    });

    // Shows that user is on the route
    const $onRoute = createStore(false)
      .on(routeMatched, () => true)
      .on(notMatched, () => false);

    // Shows that user visited route and wait for page
    // If true, page.hatch.enter is triggered and logic is ran
    const $onPage = createStore(false)
      .on(hatchEnter, () => true)
      .on(hatchExit, () => false);

    $chunkLoaded.on(loadPageFx.done, () => true).on(dontNeedLoadChunk, () => true);
    $hasHatch.on(setupHatchLinksFx.doneData, (_, has) => has);

    // When hatch not found on component from route and chunk don't load before
    guard({
      source: routeMatched,
      filter: combine(
        $hasHatch,
        $chunkLoaded,
        (hasHatch, chunkLoaded) => !hasHatch && !chunkLoaded,
      ),
      target: loadPageFx,
    });

    // After loading page chunk check that it has Page and try to connect with local events
    guard({
      source: loadPageFx.doneData,
      filter: (value) => value !== null,
      target: setupHatchLinksFx,
    });

    // Hatch found on component from route, but chunk never loaded
    // We need to setup connections between hatch from component and local triggers
    guard({
      source: routeMatched,
      filter: combine($hasHatch, $chunkLoaded, (hasHatch, chunkLoaded) => hasHatch && !chunkLoaded),
      target: [setupHatchLinksFx.prepend(() => component), dontNeedLoadChunk],
    });

    // Trigger local unit only after loading chunk and setup connections
    // Set onPage = true
    guard({
      source: routeMatched,
      clock: setupHatchLinksFx.doneData,
      filter: $onRoute,
      target: hatchEnter,
    });

    guard({
      source: routeMatched,
      filter: $onPage,
      target: hatchUpdate,
    });

    // onPage = false should set only after exit logic is run
    guard({
      source: notMatched,
      filter: $onPage,
      target: hatchExit,
    });
  }

  return { navigation };
}
