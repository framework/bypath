import { createBrowserHistory } from 'history';
import { createEffect, createEvent, sample } from 'effector';

export interface HistoryChange {
  pathname: string;
  hash: string;
  search: string;
  action: 'PUSH' | 'POP' | 'REPLACE';
}

export function createNavigation() {
  const history = typeof document !== 'undefined' ? createBrowserHistory() : null;

  const historyPush = createEffect<string, void>();
  const historyPushSearch = createEffect<string, void>();
  const historyReplace = createEffect<string, void>();

  const historyChanged = createEvent<HistoryChange>();

  const historyEmitCurrent = createEvent();

  if (process.env.NODE_ENV !== 'test') {
    historyPush.use((url) => history?.push(url));
    historyReplace.use((url) => history?.replace(url));
    historyPushSearch.use((search) => history?.push({ search }));

    history?.listen(({ pathname, search, hash }, action) => {
      historyChanged({ pathname, search, hash, action });
    });

    // do not actual change history, just trigger history changed with correct arguments
    sample({
      source: historyEmitCurrent,
      fn: () =>
        ({
          action: 'REPLACE',
          hash: history?.location.hash,
          pathname: history?.location.pathname,
          search: history?.location.search,
        } as HistoryChange),
      target: historyChanged,
    });
  }

  return {
    history,
    historyPush,
    historyPushSearch,
    historyReplace,
    historyChanged,
    historyEmitCurrent,
  };
}
