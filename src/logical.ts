import { Store, combine } from 'effector';

export function or(...stores: Array<Store<boolean>>): Store<boolean> {
  return combine(stores, (list) => list.reduce((all, current) => all || current));
}

export function and(...stores: Array<Store<boolean>>): Store<boolean> {
  return combine(stores, (list) => list.reduce((all, current) => all && current));
}

export function not(store: Store<boolean>): Store<boolean> {
  return store.map((is) => !is);
}
