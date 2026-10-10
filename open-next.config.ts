// default open-next.config.ts file created by @opennextjs/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default {
	...defineCloudflareConfig({
		incrementalCache: r2IncrementalCache,
	}),
	// OpenNext calls this instead of `npm run build`, which is the OpenNext build itself.
	buildCommand: "npx next build",
};
