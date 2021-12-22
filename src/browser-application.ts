import { Domain, Event, combine, forward, guard } from 'effector';
import { RouteConfig, matchRoutes } from 'react-router-config';
import { splitMap } from 'patronum';

import { HatchParams, getHatch } from './hatch';
import { createNavigation } from './navigation';
import { defaultDomain } from './default-domain';

// eslint-disable-next-line sonarjs/cognitive-complexity
export function createBrowserApplication(config: {
  ready: Event<void>;
  routes: RouteConfig[];
  domain?: Domain;
}) {
  const domain = config.domain || defaultDomain;
  const navigation = createNavigation(domain, { emitHistory: true });
  forward({ from: config.ready, to: navigation.historyEmitCurrent });

  const routeResolved = navigation.historyChanged.filterMap((change) => {
    const routes = matchRoutes(config.routes, change.pathname);

    if (routes.length > 0) {
      return {
        ...routes[0],
        change,
      };
    }
  });

  for (const { component, path } of config.routes) {
    if (!component) continue;
    if ((component as any).load) {
      throw new Error(
        `[${path}] lazy components temporary is not supported. Please, remove loadable() call`,
      );
    }

    const { routeMatched, __: notMatched } = splitMap({
      source: routeResolved,
      cases: {
        routeMatched: ({ route, match, change }) => {
          if (route.path === path) {
            return {
              // route.path contains params, like /user/:userId
              // :userId is a param
              // match.params contains parsed params values
              // /user/123 will be parsed as { userId: 123 }
              params: match.params,
              query: Object.fromEntries(new URLSearchParams(change.search)),
            };
          }
          return undefined;
        },
      },
    });

    const hatchEnter = domain.createEvent<HatchParams>({ name: `hatchEnter:${path}` });
    const hatchUpdate = domain.createEvent<HatchParams>({ name: `hatchUpdate:${path}` });
    const hatchExit = domain.createEvent<void>({ name: `hatchExit:${path}` });

    const componentHatch = getHatch(component);
    if (componentHatch) {
      forward({ from: hatchEnter, to: componentHatch.enter });
      forward({ from: hatchUpdate, to: componentHatch.update });
      forward({ from: hatchExit, to: componentHatch.exit });
    }

    // Shows that user is on the route
    const $onRoute = domain.createStore(false, { name: `$onRoute:${path}` });

    // Shows that user visited route and waited for page
    // If true, page.hatch.enter is triggered and logic was run
    const $onPage = domain.createStore(false, { name: `$onPage:${path}` });

    //#region route matched
    $onRoute.on(routeMatched, () => true);

    guard({
      clock: routeMatched,
      filter: $onPage,
      target: hatchUpdate,
    });

    guard({
      clock: routeMatched,
      filter: combine($onPage, $onRoute, (page, route) => !page && route),
      target: hatchEnter,
    });

    $onPage.on(hatchEnter, () => true);
    //#endregion route matched

    //#region NOT matched
    $onRoute.on(notMatched, () => false);

    guard({
      clock: notMatched,
      filter: $onPage,
      target: hatchExit,
    });

    $onPage.on(hatchExit, () => false);
    //#endregion NOT matched
  }

  return { navigation };
}
