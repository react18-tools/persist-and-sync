import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export -- export default is required for config files
export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["vitest.setup.ts"],
		coverage: {
			reporter: ["text", "json", "clover", "html"],
		},
		threads: true,
		mockReset: false,
	},
});
