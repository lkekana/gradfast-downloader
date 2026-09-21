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
	authenticate,
	type Cookies,
	corsCDNHeaders,
	getCookieHeader,
	initialHeaders,
	parseCloudfrontPolicy,
	parseXCookiesHeader,
} from "@workers/shared";

export default {
	async fetch(request: WorkerRequest, _env: unknown, _ctx: ExecutionContext): Promise<Response> {
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204, // No Content
				headers: {
					...corsCDNHeaders,
				},
			});
		}

		if (request.method !== "GET" && request.method !== "HEAD") {
			return new Response("Method not allowed", { status: 405 });
		}

		const requestURL = new URL(request.url);

		// for /proxy
		// if (request.url.includes("/proxy?url=")) {
		if (requestURL.pathname === "/proxy") {
			const targetURL = new URL(request.url).searchParams.get("url");
			if (!targetURL) {
				return new Response("Missing target URL", { status: 400 });
			}

			const targetURLObject = new URL(targetURL);
			console.log(`Proxying request to: ${targetURLObject.href}`);
			// if not https://cdn.gradfast.com, return 403
			if (targetURLObject.origin !== "https://cdn.gradfast.com") {
				return new Response("Forbidden", { status: 403 });
			}

			// handle x-cookies header
			const xCookiesHeader = request.headers.get("x-cookies");
			const requestCookies: Cookies = [];
			if (xCookiesHeader) {
				requestCookies.push(...parseXCookiesHeader(xCookiesHeader));
			} else {
				return new Response("Missing x-cookies header", { status: 400 });
			}

			console.log("Request cookies:", requestCookies);

			let cookiesStillValid = false;
			for (const cookie of requestCookies) {
				if (cookie.name.includes("CloudFront-Policy")) {
					const policyb64 = cookie.value;
					const obj = parseCloudfrontPolicy(policyb64);
					if (
						!obj ||
						!obj.Statement ||
						!obj.Statement[0] ||
						!obj.Statement[0].Condition ||
						!obj.Statement[0].Condition.DateLessThan ||
						!obj.Statement[0].Condition.DateLessThan["AWS:EpochTime"]
					) {
						console.error("Invalid CloudFront policy:", obj);
						continue;
					}

					if (Date.now() / 1000 < obj.Statement[0].Condition.DateLessThan["AWS:EpochTime"]) {
						cookiesStillValid = true;
					}
				}
			}

			let cookies: Cookies = [];
			if (!cookiesStillValid) {
				// check if we have valid cookies in our cache, else get new ones
				// const cookieCach

				cookies = await authenticate();
				requestCookies.push(...cookies);
			}

			console.log("Final request cookies:", requestCookies);
			// const proxyRequestHeaders = {
			// 	...proxyHeaders,
			// 	Cookie: getCookieHeader(requestCookies),
			// };
			const proxyRequestHeaders = new Headers({
				...initialHeaders,
				...Object.fromEntries(request.headers),
				Cookie: getCookieHeader(requestCookies),
			});
			proxyRequestHeaders.delete("Host");
			proxyRequestHeaders.delete("Origin");
			console.log("Proxy request headers:", proxyRequestHeaders);
			const proxyResponse = await fetch(targetURL, {
				// method: request.method,
				headers: proxyRequestHeaders,
			});

			// if (proxyResponse.status === 403) {
			// 	// if we get a 403, try to re-authenticate and retry the request
			// 	console.log("Received 403 response, re-authenticating and retrying...");
			// 	await authenticate();
			// 	requestCookies.push(...cookies);
			// 	const retryResponse = await fetch(targetURL, {
			// 		method: request.method,
			// 		headers: {
			// 			...initialHeaders,
			// 			Cookie: getCookieHeader(requestCookies),
			// 		},
			// 	});
			// 	return retryResponse;
			// }

			// return proxyResponse;
			const responseHeaders = new Headers(proxyResponse.headers);

			// add CORS headers to the response
			for (const [key, value] of Object.entries(corsCDNHeaders)) {
				responseHeaders.set(key, value);
			}

			// if HEAD request, cache for 1 year
			// else if GET request, don't cache
			if (request.method === "HEAD") {
				responseHeaders.set("Cache-Control", "public, max-age=31536000");
			} else if (request.method === "GET") {
				responseHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
			}

			return new Response(proxyResponse.body, {
				status: proxyResponse.status,
				statusText: proxyResponse.statusText,
				headers: responseHeaders,
			});
		} else {
			/*
		else if (request.url.includes("/auth")) {
			// for /auth
			console.time("authenticate");
			const cookies = await authenticate();
			console.timeEnd("authenticate");
			// return 200 with the current cookies via x-cookies header
			const responseHeaders = new Headers({
				...corsCDNHeaders,
				"x-cookies": getXCookiesHeader(cookies),
				// cache for 55min (CloudFront cookies expire in 60min)
				"Cache-Control": "public, max-age=3300",
			});
			return new Response("Authentication successful. CloudFront cookies obtained.", {
				headers: responseHeaders,
			});
		}
		*/
			const responseHeaders = new Headers(corsCDNHeaders);
			return new Response(null, {
				status: 200,
				headers: responseHeaders,
			});
		}
	},
} satisfies ExportedHandler;
