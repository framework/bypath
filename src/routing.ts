import * as React from 'react';
import { Domain, Event, Store, combine, is } from 'effector';
import { MatchedRoute } from 'react-router-config';

import { defaultDomain } from './default-domain';

const ROUTE_PROPERTY = 'bypath/page-route';

export interface RouteParams {
  params: Record<string, string>;
  query: Record<string, string>;
}

/**
 * Route is like a Gate, but just for models
 */
export interface Route {
  // Called by history from withHatch
  enter: Event<RouteParams>;
  update: Event<RouteParams>;
  exit: Event<void>;

  $opened: Store<boolean>;
  $params: Store<Record<string, string>>;
  $query: Store<Record<string, string>>;

  $props: Store<RouteParams>;
}

interface Config {
  enter: Event<RouteParams>;
  update: Event<RouteParams>;
  exit: Event<void>;
  domain?: Domain;
}

/**
 * Events here is an input signal, history should call them when route enters, updates, and exits.
 * Stores is derived from this events and holds specific parameters
 * `$opened` holds current state of page, if user visited page but not left, it is `true`
 */
export function createRoute(config_: Config | Domain = defaultDomain): Route {
  let domain;
  let config: Partial<Config>;
  if (is.domain(config_)) {
    domain = config_;
    config = {};
  } else if (is.domain(config_.domain)) {
    domain = config_.domain;
    config = config_;
  } else {
    domain = defaultDomain;
    config = {};
  }

  const $opened = domain.createStore(Boolean(false));
  const $params = domain.createStore<Record<string, string>>({});
  const $query = domain.createStore<Record<string, string>>({});

  const route = {
    enter: config.enter ?? domain.createEvent<RouteParams>(),
    update: config.update ?? domain.createEvent<RouteParams>(),
    exit: config.exit ?? domain.createEvent<void>(),
    $opened,
    $params,
    $query,
    $props: combine({ params: $params, query: $query }),
  };

  $params.on([route.enter, route.update], (_, { params }) => params);
  $query.on([route.enter, route.update], (_, { query }) => query);

  route.$opened.on(route.enter, () => Boolean(true)).reset(route.exit);
  // Developer may want to read props when user leaves the page
  // if $opened store will reset on route.exit, data will be deleted

  return route;
}

export function withRoute<C extends React.ComponentType>(hatch: Route, component: C): C {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (component as any)[ROUTE_PROPERTY] = hatch;
  return component;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getRoute<T extends React.ComponentType<any>>(component: T): Route | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (component as any)[ROUTE_PROPERTY];
}

export function lookupRoute<P>(match: MatchedRoute<P>): Route | undefined {
  if (match.route.component) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return getRoute(match.route.component as any);
  }
}
