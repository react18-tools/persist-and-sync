import { StateCreator } from "zustand";

export type PersistNSyncOptionsType = { name: string; regExpToIgnore?: RegExp };
type PersistNSyncType = <T>(f: StateCreator<T, [], []>, options: PersistNSyncOptionsType) => StateCreator<T, [], []>;

export const persistNSync: PersistNSyncType = (f, options) => (set, get, store) => {
  const { name, regExpToIgnore } = options;

  /** avoid error during serverside render */
  if (!globalThis.localStorage) return f(set, get, store);
  const initRef = { init: process.env.NODE_ENV == "development" ? 4 : 2 };
  const savedState = localStorage.getItem(name);

  const channel = globalThis.BroadcastChannel ? new BroadcastChannel(name) : undefined;

  const set_: typeof set = (p, replace) => {
    const prevState = get() as { [k: string]: any };
    // @ts-ignore
    const newState = (typeof p === "function" ? p(prevState) : p) as { [k: string]: any };
    if (savedState && initRef.init > 0) {
      set({ ...newState, ...JSON.parse(savedState) });
      initRef.init--;
    } else {
      // @ts-ignore
      set(newState);
      if (regExpToIgnore) {
        const stateToStore: { [k: string]: any } = {};
        Object.keys(newState).forEach(k => {
          if (!regExpToIgnore.test(k)) stateToStore[k] = newState[k];
        });
        localStorage.setItem(name, JSON.stringify(stateToStore));
      } else localStorage.setItem(name, JSON.stringify(newState));
      if (!channel) return;
      const stateUpdates: { [k: string]: any } = {};
      Object.keys(newState).forEach(k => {
        if (!regExpToIgnore?.test(k) && newState[k] !== prevState[k]) {
          stateUpdates[k] = newState[k];
        }
      });
      if (Object.keys(stateUpdates).length) {
        channel?.postMessage(stateUpdates);
      }
    }
  };

  if (channel) {
    channel.onmessage = e => {
      set({ ...get(), ...e.data });
    };
  }
  return f(set_, get, store);
};
