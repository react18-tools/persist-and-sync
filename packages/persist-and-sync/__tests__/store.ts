import { create } from "../vitest.setup";
import { PersistNSyncOptionsType, persistNSync } from "../src";

interface MyStoreType {
	count: number;
	_count: number;
	setCount: (c: number) => void;
	set_Count: (c: number) => void;
}

export const useMyStore = create<MyStoreType>(
	persistNSync(
		set => ({
			count: 0,
			_count: 0 /** skipped as it matches the regexp provided */,
			setCount: count => set(state => ({ ...state, count })),
			set_Count: _count => set(state => ({ ...state, _count })),
		}),
		{ name: "example", exclude: [/^_/], initDelay: 0 },
	),
);

export const useCookieStore = create<MyStoreType>(
	persistNSync(
		set => ({
			count: 0,
			_count: 0 /** skipped as it matches the regexp provided */,
			setCount: count => set(state => ({ ...state, count })),
			set_Count: _count => set(state => ({ ...state, _count })),
		}),
		{ name: "example", include: [/count/], exclude: [/^_/], storage: "cookies" },
	),
);

interface StoreWithOptions {
	count: number;
	_count: number;
	__persistNSyncOptions: PersistNSyncOptionsType;
	setCount: (c: number) => void;
	set_Count: (c: number) => void;
	setOptions: (__persistNSyncOptions: PersistNSyncOptionsType) => void;
}

const defaultOptions = { name: "example", include: [/count/], exclude: [/^_/] };

export const useStoreWithOptions = create<StoreWithOptions>(
	persistNSync(
		set => ({
			count: 0,
			_count: 0 /** skipped as it matches the regexp provided */,
			__persistNSyncOptions: defaultOptions,
			setCount: count => set(state => ({ ...state, count })),
			set_Count: _count => set(state => ({ ...state, _count })),
			setOptions: __persistNSyncOptions => set(state => ({ ...state, __persistNSyncOptions })),
		}),
		defaultOptions,
	),
);
