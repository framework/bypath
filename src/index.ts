import loadable from '@loadable/component';
import { RouteConfig, renderRoutes } from 'react-router-config';

export { createBrowserApplication } from './app';
export { createHatch, getHatch, withHatch, lookupHatch } from './hatch';
export type { Hatch, HatchParams } from './hatch';

export const createPages = (routes: RouteConfig[]) => renderRoutes(routes);

export { loadable };
export type { RouteConfig };
