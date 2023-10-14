import { act } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import type { StateCreator } from "zustand";
import { create as actualCreate } from "zustand";

// a variable to hold reset functions for all stores declared in the app
export const storeResetFns = new Set<() => void>();

// when creating a store, we get its initial state, create a reset function and add it in the set
export const create = <S>(createState: StateCreator<S>) => {
	const store = actualCreate(createState);
	const initialState = store.getState();
	storeResetFns.add(() => store.setState(initialState, true));
	return store;
};

afterEach(() => {
	act(() => storeResetFns.forEach(resetFn => resetFn()));
});

declare global {
	var tmp_store: { [key: string]: string };
}

globalThis.tmp_store = {};

globalThis.localStorage = {
	length: Object.keys(tmp_store).length,
	clear: () => {
		tmp_store = {};
	},
	key: (index: number) => Object.keys(tmp_store)[index],
	removeItem: (key: string) => {
		delete tmp_store[key];
	},
	setItem: (key: string, item: string) => {
		tmp_store[key] = item;
	},
	getItem: (key: string) => tmp_store[key],
};

function channelMock() {}
channelMock.prototype.onmessage = function () {};
channelMock.prototype.postMessage = function (data) {
	this.onmessage({ data });
};
// @ts-ignore
global.BroadcastChannel = channelMock;
