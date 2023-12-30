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
