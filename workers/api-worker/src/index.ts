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
import {
	type Cookies,
	corsAPIHeaders,
	getCookieHeader,
	getXCookiesHeader,
	initialHeaders,
	parseXCookiesHeader,
	updateCookies,
} from "@workers/shared";

export default {
	async fetch(request: WorkerRequest, _env: unknown, _ctx: ExecutionContext): Promise<Response> {
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204, // No Content
				headers: {
					...corsAPIHeaders,
				},
			});
		}

		if (request.method !== "GET") {
			return new Response("Method not allowed", { status: 405 });
		}

		const targetURL = new URL(request.url).searchParams.get("url");
		if (!targetURL) {
			return new Response("Missing target URL", { status: 400 });
		}

		const targetURLObject = new URL(targetURL);
		console.log(`Proxying request to: ${targetURLObject.href}`);
		// if not https://api.gradfast.com, return 403
		if (targetURLObject.origin !== "https://api.gradfast.com") {
			return new Response("Forbidden", { status: 403 });
		}

		const proxyRequestHeaders = new Headers({ ...initialHeaders, ...Object.fromEntries(request.headers) });
		proxyRequestHeaders.delete("Host");
		proxyRequestHeaders.delete("Origin");

		const xCookiesHeader = request.headers.get("X-Cookies");
		const userCookies: Cookies = [];
		if (xCookiesHeader) {
			// base64 decode the cookies
			// then parse them into Cookies type
			const cookies = parseXCookiesHeader(xCookiesHeader);
			userCookies.push(...cookies);
			proxyRequestHeaders.set("Cookie", getCookieHeader(cookies));
		}

		const proxyResponse = await fetch(targetURL, {
			headers: proxyRequestHeaders,
		});

		const responseHeaders = new Headers(proxyResponse.headers);

		// add CORS headers to the response
		for (const [key, value] of Object.entries(corsAPIHeaders)) {
			responseHeaders.set(key, value);
		}

		let cacheMaxAge = 31536000; // 1 year in seconds
		// update cookies if there are any set-cookie headers in the response
		if (proxyResponse.headers.has("set-cookie")) {
			const proxyRequestCookies = updateCookies(proxyResponse, userCookies);
			if (proxyRequestCookies.length > 0) {
				responseHeaders.set("X-Cookies", getXCookiesHeader(proxyRequestCookies));

				// set cache max-age to 55min if there is a CloudFront-Policy cookie in the response
				// (expires after 1 hour)
				if (proxyRequestCookies.some((cookie) => cookie.name.includes("CloudFront-Policy"))) {
					cacheMaxAge = 3300; // 55 minutes in seconds
				}
			}
			responseHeaders.delete("set-cookie"); // remove set-cookie header from the response
		}
		responseHeaders.set("Cache-Control", `public, max-age=${cacheMaxAge}`);

		return new Response(proxyResponse.body, {
			status: proxyResponse.status,
			statusText: proxyResponse.statusText,
			headers: responseHeaders,
		});
	},
} satisfies ExportedHandler;
