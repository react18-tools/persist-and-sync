import { act, cleanup, renderHook } from "@testing-library/react";

import { afterEach, describe, test } from "vitest";
import { useCookieStore, useMyStore, useStoreWithOptions } from "./store";

describe.concurrent("Setting state", () => {
	afterEach(cleanup);
	test("test initial state", async ({ expect }) => {
		const { result } = renderHook(() => useMyStore());
		expect(result.current.count).toBe(0);
	});

	test("test setting state", async ({ expect }) => {
		const { result } = renderHook(() => useCookieStore());
		act(() => result.current.setCount(5));
		expect(result.current.count).toBe(5);
		expect(localStorage.getItem("example")).toBe('{"count":5}');
	});

	test("test exclude key", async ({ expect }) => {
		const { result } = renderHook(() => useCookieStore());
		act(() => result.current.set_Count(6));
		expect(result.current._count).toBe(6);
		expect(localStorage.getItem("example")).not.toBe('{"count":6}');
	});

	test("store with __persistNSyncOptions", async ({ expect }) => {
		const { result } = renderHook(() => useStoreWithOptions());
		act(() => result.current.set_Count(6));
		expect(result.current._count).toBe(6);
		expect(localStorage.getItem("example")).not.toContain('"_count":6');
		act(() =>
			result.current.setOptions({
				...result.current.__persistNSyncOptions,
				include: [],
				exclude: [],
			}),
		);

		act(() => result.current.set_Count(10));
		expect(result.current._count).toBe(10);
		expect(localStorage.getItem("example")).toContain('"_count":10');
	});
});
