import loadable from '@loadable/component';
import { RouteConfig, renderRoutes } from 'react-router-config';

export { createBrowserApplication } from './browser-application';
export { createRoute, getRoute, withRoute, lookupRoute } from './routing';
export type { Route, RouteParams } from './routing';

export { contract } from './contract';

export const createPages = (routes: RouteConfig[]) => renderRoutes(routes);

export { loadable };
export type { RouteConfig };
