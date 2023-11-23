import { StateCreator } from "zustand";

export type PersistNSyncOptionsType = {
	name: string;
	/** @deprecated */
	regExpToIgnore?: RegExp;
	include?: (string | RegExp)[];
	exclude?: (string | RegExp)[];
};
type PersistNSyncType = <T>(
	f: StateCreator<T, [], []>,
	options: PersistNSyncOptionsType,
) => StateCreator<T, [], []>;

export const persistNSync: PersistNSyncType = (stateCreator, options) => (set, get, store) => {
	/** avoid error during serverside render */
	if (!globalThis.localStorage) return stateCreator(set, get, store);

	/** temporarily support `regExpToIgnore` */
	if (!options.exclude) options.exclude = [];
	if (options.regExpToIgnore) options.exclude.push(options.regExpToIgnore);
	/** end of temporarily support `regExpToIgnore` */

	const { name } = options;
	const savedState = localStorage.getItem(name);
	/** timeout 0 is enough. timeout 100 is added to avoid server and client render content mismatch error */
	if (savedState) setTimeout(() => set({ ...get(), ...JSON.parse(savedState) }), 100);

	const channel = globalThis.BroadcastChannel ? new BroadcastChannel(name) : undefined;

	const set_: typeof set = (newStateOrPartialOrFunction, replace) => {
		const prevState = get() as { [k: string]: any };
		set(newStateOrPartialOrFunction, replace);
		const newState = get() as { [k: string]: any };
		saveAndSync({ newState, prevState, channel, options });
	};

	if (channel) {
		channel.onmessage = e => {
			set({ ...get(), ...e.data });
		};
	}
	return stateCreator(set_, get, store);
};

interface SaveAndSyncProps {
	newState: { [k: string]: any };
	prevState: { [k: string]: any };
	channel?: BroadcastChannel;
	options: PersistNSyncOptionsType;
}

/** Encapsulate cache in closure */
const getKeysToPersistAndSyncMemoised = (() => {
	const persistAndSyncKeysCache: { [k: string]: string[] } = {};

	const getKeysToPersistAndSync = (keys: string[], options: PersistNSyncOptionsType) => {
		const { exclude, include } = options;

		const keysToInlcude = include?.length
			? keys.filter(key => {
					for (const patternOrKey of include) {
						if (typeof patternOrKey === "string" && key === patternOrKey) return true;
						else if (patternOrKey instanceof RegExp && patternOrKey.test(key)) return true;
					}
					return false;
			  })
			: keys;

		const keysToPersistAndSync = keysToInlcude.filter(key => {
			for (const patternOrKey of exclude || []) {
				if (typeof patternOrKey === "string" && key === patternOrKey) return false;
				else if (patternOrKey instanceof RegExp && patternOrKey.test(key)) return false;
			}
			return true;
		});
		return keysToPersistAndSync;
	};

	return (keys: string[], options: PersistNSyncOptionsType) => {
		const cacheKey = JSON.stringify({ options, keys });
		if (!persistAndSyncKeysCache[cacheKey])
			persistAndSyncKeysCache[cacheKey] = getKeysToPersistAndSync(keys, options);
		return persistAndSyncKeysCache[cacheKey];
	};
})();

function saveAndSync({ newState, prevState, channel, options }: SaveAndSyncProps) {
	const keysToPersistAndSync = getKeysToPersistAndSyncMemoised(Object.keys(newState), options);

	if (keysToPersistAndSync.length === 0) return;

	const stateToStore: { [k: string]: any } = {};
	keysToPersistAndSync.forEach(key => (stateToStore[key] = newState[key]));
	localStorage.setItem(options.name, JSON.stringify(stateToStore));

	if (!channel) return;
	const stateUpdates: { [k: string]: any } = {};
	keysToPersistAndSync.forEach(key => {
		if (newState[key] !== prevState[key]) stateUpdates[key] = newState[key];
	});
	if (Object.keys(stateUpdates).length) {
		channel?.postMessage(stateUpdates);
	}
}
