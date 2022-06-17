# bypath

Simple framework for React, TypeScript and effector applications.

## Installation

```bash
npm install bypath
```

## Usage

```ts
// index.ts
import { createBrowserApplication } from 'bypath';
import { createEvent } from 'effector';

import * as navigation from 'entities/navigation';
import { routes } from './pages';

const applicationLoaded = createEvent()

const app = createBrowserApplication({
  routes,
  ready: applicationLoaded,
  domain: navigation.navigationDomain
  // domain is optional
  // for debug/logging
});

// connect local route events

forward({
  from: navigation.historyPush,
  to: app.navigation.historyPush
})
forward({
  from: navigation.historyPushSearch,
  to: app.navigation.historyPushSearch
})
forward({
  from: navigation.historyReplace,
  to: app.navigation.historyReplace
})
```

```ts
// some-page/contract.ts
import { createRoute } from 'bypath';

import { navigationDomain } from 'entities/navigation';

export const route = createRoute(navigationDomain);
// domain is optional
// for debug/logging
```

```ts
// some-page/index.tsx
import { sample, createDomain } from 'effector';
import { withRoute } from 'bypath';

import { historyPush } from 'entities/navigation';
import { $isAuthenticated } from 'entities/session';

import { route } from './contract';

export const Page = withRoute(route, () => {
  //...
});

sample({
  source: route.enter,
  filter: $isAuthenticated.map((is) => !is),
  target: historyPush.prepend(() => '/login')
});
```
