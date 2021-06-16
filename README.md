# framework

Simple framework for React, TypeScript and effector applications.

## Installation

```bash
npm install framework
```

## Usage

```ts
// index.ts
import { createBrowserApplication } from 'framework';
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
import { createHatch } from 'framework';

import { navigationDomain } from 'entities/navigation';

export const hatch = createHatch(navigationDomain);
// domain is optional
// for debug/logging
```

```ts
// some-page/index.tsx
import { guard, createDomain } from 'effector';
import { withHatch } from 'framework';

import { historyPush } from 'entities/navigation';
import { $isAuthenticated } from 'entities/session';

import { hatch } from './contract';

export const Page = withHatch(hatch, () => {
  //...
});

guard({
  source: hatch.enter,
  filter: $isAuthenticated.map((is) => !is),
  target: historyPush.prepend(() => '/login')
});
```
