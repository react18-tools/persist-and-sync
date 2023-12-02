import { act, cleanup, renderHook } from "@testing-library/react";

import { afterEach, describe, test } from "vitest";
import { useCookieStore, useMyStore } from "./store";

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
});
