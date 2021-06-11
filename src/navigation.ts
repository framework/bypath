import { Domain, sample } from 'effector';
import { createBrowserHistory } from 'history';

export interface HistoryChange {
  pathname: string;
  hash: string;
  search: string;
  action: 'PUSH' | 'POP' | 'REPLACE';
}

export function createNavigation(domain: Domain) {
  const history = typeof document !== 'undefined' ? createBrowserHistory() : null;

  const historyPush = domain.createEffect<string, void>();
  const historyPushSearch = domain.createEffect<string, void>();
  const historyReplace = domain.createEffect<string, void>();

  const historyChanged = domain.createEvent<HistoryChange>();

  const historyEmitCurrent = domain.createEvent();

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
