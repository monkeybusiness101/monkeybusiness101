import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
	site: "https://monkeybusiness101.com",
	base: "/",
	output: "server", // Enable server-side rendering for API routes
	adapter: vercel(),
	integrations: [react(), tailwind()],
});
