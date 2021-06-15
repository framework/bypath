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
import { createDomain, createEvent } from 'effector';

import * as navigation from 'entities/navigation';
import { routes } from './pages';

const applicationLoaded = createEvent()

const root = createDomain()

const app = createBrowserApplication({
  routes,
  ready: applicationLoaded,
  domain: root
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
// some-page.ts
import { guard, createDomain } from 'effector';
import { createHatch, withHatch } from 'framework';

import { historyPush } from 'entities/navigation';
import { $isAuthenticated } from 'entities/session';

const hatch = createHatch(createDomain())
// domain is optional
// for debug/logging

const Page = withHatch(hatch, () => {
  //...
})

guard({
  source: hatch.enter,
  filter: $isAuthenticated.map((is) => !is),
  target: historyPush.prepend(() => '/login')
})
```
