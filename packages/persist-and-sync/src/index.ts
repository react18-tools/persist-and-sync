import { StateCreator } from "zustand";

export interface PersistNSyncOptionsType {
	name: string;
	/** @deprecated */
	regExpToIgnore?: RegExp;
	include?: (string | RegExp)[];
	exclude?: (string | RegExp)[];
	storage?: "localStorage" | "sessionStorage" | "cookies";
	/** @defaultValue 100 */
	initDelay?: number;
};

type PersistNSyncType = <T>(
	f: StateCreator<T, [], []>,
	options: PersistNSyncOptionsType,
) => StateCreator<T, [], []>;

const DEFAULT_INIT_DELAY = 100;

function getItem(options: PersistNSyncOptionsType) {
	const { storage } = options;
	if (storage === "cookies") {
		const cookies = document.cookie.split("; ");
		const cookie = cookies.find(c => c.startsWith(options.name));
		return cookie?.split("=")[1];
	}
	if (storage === "sessionStorage") return sessionStorage.getItem(options.name);
	return localStorage.getItem(options.name);
}

function setItem(options: PersistNSyncOptionsType, value: string) {
	const { storage } = options;
	if (storage === "cookies") {
		document.cookie = `${options.name}=${value}; max-age=31536000; SameSite=Strict;`;
	}
	if (storage === "sessionStorage") sessionStorage.setItem(options.name, value);
	else localStorage.setItem(options.name, value);
}

export const persistNSync: PersistNSyncType = (stateCreator, options) => (set, get, store) => {
	/** avoid error during serverside render */
	if (!globalThis.localStorage) return stateCreator(set, get, store);
	if (!options.storage) options.storage = "localStorage";

	const savedState = getItem(options);
	/** timeout 0 is enough. timeout 100 is added to avoid server and client render content mismatch error */
	const delay = options.initDelay === undefined ? DEFAULT_INIT_DELAY : options.initDelay;
	if (savedState) setTimeout(() => set({ ...get(), ...JSON.parse(savedState) }), delay);

	const set_: typeof set = (newStateOrPartialOrFunction, replace) => {
		set(newStateOrPartialOrFunction, replace);
		const newState = get() as { [k: string]: any };
		saveAndSync({ newState, options });
	};

	window.addEventListener("storage", e => {
		if (e.key === options.name) set({ ...get(), ...JSON.parse(e.newValue || "{}") });
	});
	return stateCreator(set_, get, store);
};

interface SaveAndSyncProps {
	newState: { [k: string]: any };
	options: PersistNSyncOptionsType;
}

/** Encapsulate cache in closure */
const getKeysToPersistAndSyncMemoised = (() => {
	const persistAndSyncKeysCache: { [k: string]: string[] } = {};

	const getKeysToPersistAndSync = (keys: string[], options: PersistNSyncOptionsType) => {
		const { exclude, include } = options;

		const keysToInlcude = include?.length
			? keys.filter(key => matchPatternOrKey(key, include))
			: keys;

		const keysToPersistAndSync = keysToInlcude.filter(
			key => !matchPatternOrKey(key, exclude || []),
		);
		return keysToPersistAndSync;
	};

	return (keys: string[], options: PersistNSyncOptionsType) => {
		const cacheKey = JSON.stringify({ options, keys });
		if (!persistAndSyncKeysCache[cacheKey])
			persistAndSyncKeysCache[cacheKey] = getKeysToPersistAndSync(keys, options);
		return persistAndSyncKeysCache[cacheKey];
	};
})();

function matchPatternOrKey(key: string, patterns: (string | RegExp)[]) {
	for (const patternOrKey of patterns) {
		if (typeof patternOrKey === "string" && key === patternOrKey) return true;
		else if (patternOrKey instanceof RegExp && patternOrKey.test(key)) return true;
	}
	return false;
}

function saveAndSync({ newState, options }: SaveAndSyncProps) {
	if (newState.__persistNSyncOptions) Object.assign(options, newState.__persistNSyncOptions);
	
	/** temporarily support `regExpToIgnore` */
	if (!options.exclude) options.exclude = [];
	if (options.regExpToIgnore) options.exclude.push(options.regExpToIgnore);
	/** end of temporarily support `regExpToIgnore` */

	const keysToPersistAndSync = getKeysToPersistAndSyncMemoised(Object.keys(newState), options);

	if (keysToPersistAndSync.length === 0) return;

	const stateToStore: { [k: string]: any } = {};
	keysToPersistAndSync.forEach(key => (stateToStore[key] = newState[key]));
	setItem(options, JSON.stringify(stateToStore));
}
