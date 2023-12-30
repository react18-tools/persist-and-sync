import { StateCreator } from "zustand";

export type StorageType = "localStorage" | "sessionStorage" | "cookies";

export interface PersistNSyncOptionsType {
	name: string;
	/** @deprecated */
	regExpToIgnore?: RegExp;
	include?: (string | RegExp)[];
	exclude?: (string | RegExp)[];
	storage?: StorageType;
	/** @defaultValue 100 */
	initDelay?: number;
}

type PersistNSyncType = <T>(
	f: StateCreator<T, [], []>,
	options: PersistNSyncOptionsType,
) => StateCreator<T, [], []>;

const DEFAULT_INIT_DELAY = 100;

function getItem(options: PersistNSyncOptionsType) {
	const cookies = document.cookie.split("; ");
	const cookie = cookies.find(c => c.startsWith(options.name));
	return (
		localStorage.getItem(options.name) ||
		sessionStorage.getItem(options.name) ||
		cookie?.split("=")[1]
	);
}

function setItem(options: PersistNSyncOptionsType, value: string) {
	const { storage } = options;
	if (storage === "cookies") {
		document.cookie = `${options.name}=${value}; max-age=31536000; SameSite=Strict;`;
	}
	if (storage === "sessionStorage") sessionStorage.setItem(options.name, value);
	else localStorage.setItem(options.name, value);
}

export function clearItem(name: string, storage?: StorageType) {
	switch (storage || "localStorage") {
		case "localStorage":
			localStorage.removeItem(name);
			break;
		case "sessionStorage":
			sessionStorage.removeItem(name);
			break;
		case "cookies":
			document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict;`;
			break;
	}
}

export const persistNSync: PersistNSyncType = (stateCreator, options) => (set, get, store) => {
	/** avoid error during serverside render */
	if (!globalThis.localStorage) {
		console.log("Storage APIs not supported.");
		return stateCreator(set, get, store);
	}
	if (!options.storage) options.storage = "localStorage";

	/** timeout 0 is enough. timeout 100 is added to avoid server and client render content mismatch error */
	const delay = options.initDelay === undefined ? DEFAULT_INIT_DELAY : options.initDelay;
	setTimeout(() => {
		const initialState = get() as Record<string, any>;
		const savedState = getItem(options);
		if (savedState) set({ ...initialState, ...JSON.parse(savedState) });
	}, delay);

	const set_: typeof set = (newStateOrPartialOrFunction, replace) => {
		const prevState = get() as Record<string, any>;
		set(newStateOrPartialOrFunction, replace);
		const newState = get() as Record<string, any>;
		saveAndSync({ newState, prevState, options });
	};

	window.addEventListener("storage", e => {
		if (e.key === options.name) set({ ...get(), ...JSON.parse(e.newValue || "{}") });
	});
	return stateCreator(set_, get, store);
};

interface SaveAndSyncProps {
	newState: Record<string, any>;
	prevState: Record<string, any>;
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

function saveAndSync({ newState, prevState, options }: SaveAndSyncProps) {
	if (newState.__persistNSyncOptions) {
		const prevStorage = prevState.__persistNSyncOptions?.storage || options.storage;
		const newStorage = newState.__persistNSyncOptions?.storage || options.storage;
		if (prevState !== newStorage) {
			const name = prevState.__persistNSyncOptions.name || options.name;
			clearItem(name, prevStorage);
		}
		Object.assign(options, newState.__persistNSyncOptions);
	}

	/** temporarily support `regExpToIgnore` */
	if (!options.exclude) options.exclude = [];
	if (options.regExpToIgnore) options.exclude.push(options.regExpToIgnore);
	/** end of temporarily support `regExpToIgnore` */

	const keysToPersistAndSync = getKeysToPersistAndSyncMemoised(Object.keys(newState), options);

	if (keysToPersistAndSync.length === 0) return;

	const stateToStore: Record<string, any> = {};
	keysToPersistAndSync.forEach(key => (stateToStore[key] = newState[key]));
	setItem(options, JSON.stringify(stateToStore));
}
