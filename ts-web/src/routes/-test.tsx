import React from "react";
import { Button } from "@/components/ui/button.tsx";

export interface Cookie {
	name: string;
	value: string;
	expires?: Date | number | string;
	path?: string;
	domain?: string;
	secure?: boolean;
	sameSite?: "Strict" | "Lax" | "None";
	maxAge?: number;
	httpOnly?: boolean;
}

const fileProxyURL = import.meta.env.VITE_CDN_PROXY;
const apiProxyURL = import.meta.env.VITE_API_PROXY;
const authProxyURL = import.meta.env.VITE_AUTH_PROXY;

// import { createFileRoute } from "@tanstack/react-router";

// export const Route = createFileRoute("/test")({ component: Test });

export default function Test() {
	const [cookies, setCookies] = React.useState<string | null>(null);
	const getCookies = async () => {
		const req = await fetch(`${authProxyURL}/auth`, {
			method: "GET",
		});
		if (!req.ok) {
			alert(`Failed to get cookies: ${req.status}`);
			return;
		}
		// const data = await req.json();
		// console.log("Cookies:", data.cookies);
		// alert("Cookies: " + JSON.stringify(data.cookies));
		// setCookies(data.cookies);

		// set cookies using x-cookies header
		// console.log("Response headers:", Object.fromEntries(req.headers.entries()));
		// console.log(`req.headers.get("x-cookies")`, req.headers.get("x-cookies"));
		// console.log(`req.headers.get("X-Cookies")`, req.headers.get("X-Cookies"));
		const cookieHeader =
			req.headers.get("x-cookies") || req.headers.get("X-Cookies");
		// console.log("Cookies from header:", cookieHeader);
		setCookies(cookieHeader);
		// alert("Cookies: " + atob(cookieHeader || ""));
	};

	const makeProxyRequest = async () => {
		const url =
			"https://cdn.gradfast.com/COS216/COS216%20-%202016%20-%20Class%20Test%201.pdf";
		if (cookies === null) {
			alert(`No cookies available. Please get cookies first.`);
			return;
		}
		const resp = await fetch(
			`${fileProxyURL}/proxy?url=${encodeURIComponent(url)}`,
			{
				method: "GET",
				headers: {
					"X-Cookies": cookies,
				},
			},
		);
		if (!resp.ok) {
			alert(`Request failed with status ${resp.status}`);
			return;
		}
		alert(
			`Request succeeded with status ${resp.status} and content type ${resp.headers.get("content-type")}`,
		);
	};

	const makeAPIrequest = async () => {
		// const url = "https://api.gradfast.com/categories";
		// const url = "https://api.gradfast.com/modules";
		// const url = "https://api.gradfast.com/module/COS216";
		const url = "https://api.gradfast.com/module/COS216/past-papers";

		// const urlObj = new URL(url);
		// const urlObj = new URL(`${apiProxyURL}/proxy?url=${encodeURIComponent(url)}`);
		const urlObj = new URL(`${apiProxyURL}/module/COS216/past-papers`);
		console.log("Making API request to URL:", urlObj);
		// print /module/COS216/past-papers
		console.log("Making API request to path:", urlObj.pathname);
		let targetURL: URL;
		if (urlObj.pathname === "/proxy") {
			targetURL = new URL(urlObj.searchParams.get("url") || "");
			if (!targetURL) {
				return new Response("Missing target URL", { status: 400 });
			}

			const targetURLObject = new URL(targetURL);
			console.log(`Proxying request to: ${targetURLObject.href}`);
			// if not https://api.gradfast.com, return 403
			if (targetURLObject.origin !== "https://api.gradfast.com") {
				return new Response("Forbidden", { status: 403 });
			}
		} else {
			targetURL = new URL(`https://api.gradfast.com${urlObj.pathname}`);
		}
		console.log("Target URL for API request:", targetURL);
		// throw new Error("Stopping execution for debugging purposes");

		const requestHeaders = new Headers({
			"Content-Type": "application/json",
		});
		if (cookies) {
			// console.log("Making API request with cookies:", cookies);
			requestHeaders.append("X-Cookies", cookies);
		}
		const resp = await fetch(
			`${apiProxyURL}/proxy?url=${encodeURIComponent(url)}`,
			{
				method: "GET",
				headers: requestHeaders,
			},
		);
		if (!resp.ok) {
			alert(`Request failed with status ${resp.status}`);
			return;
		}
		const data = await resp.json();
		alert(
			`Request succeeded with status ${resp.status} and data: ${JSON.stringify(data)}`,
		);

		// SET COOKIES FROM RESPONSE HEADER
		const cookieHeader =
			resp.headers.get("x-cookies") || resp.headers.get("X-Cookies");
		if (cookieHeader) {
			setCookies(cookieHeader);
			alert(`Updated cookies from response: ${cookieHeader}`);
		}
	};

	return (
		<>
			<Button variant="default" onClick={getCookies}>
				Get Cookies
			</Button>
			<Button
				variant="default"
				onClick={makeProxyRequest}
				disabled={cookies === null}
			>
				Make Proxy Request
			</Button>
			<Button variant="default" onClick={makeAPIrequest}>
				Make API Request
			</Button>
		</>
	);
}
