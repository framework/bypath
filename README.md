# framework

Simple framework for React, TypeScript and effector applications.

## Installation

```bash
npm install framework
```

## Usage

```ts
import { createBrowserApplication } from 'framework';
import { createDomain } from 'effector';
import { routes } from './pages';


const root = createDomain();
const app = createBrowserApplication({ domain: root, routes });
```
