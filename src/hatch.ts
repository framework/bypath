import * as React from 'react';
import { Domain, Event, Store, combine, is } from 'effector';
import { MatchedRoute } from 'react-router-config';

import { defaultDomain } from './default-domain';

const HATCH = 'framework/page-hatch';

export interface HatchParams {
  params: Record<string, string>;
  query: Record<string, string>;
}

/**
 * Hatch is like a Gate, but just for models
 */
export interface Hatch {
  // Called by history from withHatch
  enter: Event<HatchParams>;
  update: Event<HatchParams>;
  exit: Event<void>;

  $opened: Store<boolean>;
  $params: Store<Record<string, string>>;
  $query: Store<Record<string, string>>;

  $props: Store<HatchParams>;
}

interface Config {
  enter: Event<HatchParams>;
  update: Event<HatchParams>;
  exit: Event<void>;
  domain?: Domain;
}

/**
 * Events here is an input signal, history should call them when route enters, updates, and exits.
 * Stores is derived from this events and holds specific parameters
 * `$opened` holds current state of page, if user visited page but not left, it is `true`
 */
export function createHatch(config_: Config | Domain = defaultDomain): Hatch {
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

  const hatch = {
    enter: config.enter ?? domain.createEvent<HatchParams>(),
    update: config.update ?? domain.createEvent<HatchParams>(),
    exit: config.exit ?? domain.createEvent<void>(),
    $opened,
    $params,
    $query,
    $props: combine({ params: $params, query: $query }),
  };

  $params.on([hatch.enter, hatch.update], (_, { params }) => params);
  $query.on([hatch.enter, hatch.update], (_, { query }) => query);

  hatch.$opened.on(hatch.enter, () => Boolean(true)).reset(hatch.exit);
  // Developer may want to read props when user leaves the page
  // if $opened store will reset on hatch.exit, data will be deleted

  return hatch;
}

export function withHatch<C extends React.ComponentType>(hatch: Hatch, component: C): C {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (component as any)[HATCH] = hatch;
  return component;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getHatch<T extends React.ComponentType<any>>(component: T): Hatch | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (component as any)[HATCH];
}

export function lookupHatch<P>(match: MatchedRoute<P>): Hatch | undefined {
  if (match.route.component) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return getHatch(match.route.component as any);
  }
}
