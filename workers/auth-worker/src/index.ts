/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import type { ExecutionContext, ExportedHandler, Request as WorkerRequest } from "@cloudflare/workers-types";
import { authenticate, corsAuthHeaders, getXCookiesHeader } from "@workers/shared";

export default {
	async fetch(request: WorkerRequest, _env: unknown, _ctx: ExecutionContext): Promise<Response> {
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204, // No Content
				headers: {
					...corsAuthHeaders,
				},
			});
		}

		const requestURL = new URL(request.url);
		if (requestURL.pathname === "/auth") {
			// if (request.url.includes("/auth")) {
			// for /auth
			console.time("authenticate");
			const cookies = await authenticate();
			console.timeEnd("authenticate");
			// return 200 with the current cookies via x-cookies header
			const responseHeaders = new Headers({
				...corsAuthHeaders,
				"x-cookies": getXCookiesHeader(cookies),
				// cache for 55min (CloudFront cookies expire in 60min)
				"Cache-Control": "public, max-age=3300",
			});
			return new Response(null, {
				headers: responseHeaders,
			});
		} else {
			const responseHeaders = new Headers(corsAuthHeaders);
			return new Response(null, {
				status: 200,
				headers: responseHeaders,
			});
		}
		// return new Response("Hello World!");
	},
} satisfies ExportedHandler;
