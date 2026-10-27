import UserAgent from "user-agents";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
function getRandomInt(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min; // Both min and max are inclusive
}

export type Module = {
	prefix: string;
	code: number;
	name: string;
};

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

export type Cookies = Cookie[];

export type CloudfrontPolicy = {
	Statement: {
		Resource: string;
		Condition: {
			DateLessThan: {
				"AWS:EpochTime": number;
			};
		};
	}[];
};

const userAgent = new UserAgent();
console.log(userAgent.toString());

// allow all CORS
export const corsAPIHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers": "X-Cookies, Content-Type",
	"Access-Control-Allow-Methods": "GET,OPTIONS",
	"Access-Control-Expose-Headers": "X-Cookies",
};
export const corsCDNHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers": "X-Cookies, Content-Type",
	"Access-Control-Allow-Methods": "GET,HEAD,OPTIONS",
	"Access-Control-Expose-Headers": "X-Cookies",
};
export const corsAuthHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers": "X-Cookies, Content-Type",
	"Access-Control-Allow-Methods": "GET,OPTIONS",
	"Access-Control-Expose-Headers": "X-Cookies",
};

// console.log(JSON.stringify(userAgent.data, null, 2));
export const initialHeaders = {
	Accept: "application/json, text/plain, */*",
	"Accept-Language": "en-US,en;q=0.9",
	// Connection: "keep-alive",
	DNT: "1",
	Referer: "https://www.gradfast.com/",
	"Sec-Fetch-Dest": "empty",
	"Sec-Fetch-Mode": "cors",
	"Sec-Fetch-Site": "same-origin",
	"User-Agent": userAgent.toString(),
};

export const proxyHeaders = {
	Accept:
		"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
	"Accept-Language": "en-US,en;q=0.9",
	// Connection: "keep-alive",
	DNT: "1",
	Referer: "https://www.gradfast.com/",
	"Sec-Fetch-Dest": "empty",
	"Sec-Fetch-Mode": "cors",
	"Sec-Fetch-Site": "same-origin",
	"Upgrade-Insecure-Requests": "1",
	"User-Agent": userAgent.toString(),
};

export const getCookieHeader = (cookies: Cookies): string => {
	if (cookies.length === 0) {
		return "";
	}
	return cookies.map((cookie: { name: string; value: string }) => `${cookie.name}=${cookie.value}`).join("; ");
};

export const updateCookies = (response: Response, cookies: Cookies): Cookies => {
	// console.log("Response headers:", response.headers);
	const responseCookies = response.headers.get("set-cookie");
	// console.log("Response set-cookie header:", responseCookies);
	if (responseCookies === null) {
		return cookies;
	}
	const newCookies: Cookies = [];
	responseCookies.split(";").forEach((cookie) => {
		const [name, value] = cookie.split("=");
		if (name && value) {
			// newCookies.push({ name, value });
			if (name.includes("CloudFront-Policy") || name.includes("CloudFront-Signature") || name.includes("CloudFront-Key-Pair-Id")) {
				// trim anything before the CloudFront cookie name (e.g., "HttpOnly, ")
				const trimmedName = name.replace(/^(HttpOnly, )?/, "");
				newCookies.push({
					name: trimmedName,
					value: value,
				});
			}
		}
	});

	newCookies.forEach((newCookie) => {
		const index = cookies.findIndex((cookie) => cookie.name === newCookie.name);
		if (index === -1) {
			cookies.push(newCookie);
		} else {
			cookies[index] = newCookie;
		}
	});
	return cookies;
};

export const parseCloudfrontPolicy = (policyb64: string): CloudfrontPolicy | null => {
	try {
		const cleanedB64 = policyb64.replace(/-/g, "+").replace(/_/g, "=").replace(/~/g, "/");
		const decodedText = Buffer.from(cleanedB64, "base64").toString("utf8");
		const obj = JSON.parse(decodedText) as CloudfrontPolicy;
		return obj;
	} catch (error) {
		console.error("Failed to parse CloudFront-Policy cookie value:", error);
		return null;
	}
};

export const parseXCookiesHeader = (xCookiesHeader: string): Cookies => {
	const cookies: Cookies = [];
	try {
		const parsedCookies = JSON.parse(Buffer.from(xCookiesHeader, "base64").toString("utf8"));
		if (Array.isArray(parsedCookies)) {
			parsedCookies.forEach((cookie) => {
				if (cookie.name && cookie.value && typeof cookie.name === "string" && typeof cookie.value === "string") {
					if (
						cookie.name.includes("CloudFront-Policy") ||
						cookie.name.includes("CloudFront-Signature") ||
						cookie.name.includes("CloudFront-Key-Pair-Id")
					) {
						// trim anything before the CloudFront cookie name (e.g., "HttpOnly, ")
						const trimmedName = cookie.name.replace(/^(HttpOnly, )?/, "");
						cookies.push({
							name: trimmedName,
							value: cookie.value,
						});
					}
				}
			});
		}
	} catch (error) {
		console.error("Failed to parse x-cookies header:", error);
	}
	return cookies;
};

export const getXCookiesHeader = (cookies: Cookies): string => {
	if (cookies.length === 0) {
		return "";
	}
	return Buffer.from(JSON.stringify(cookies)).toString("base64");
};

const getFetchHeaders = (cookies: Cookies) => {
	if (cookies.length > 0) {
		return {
			...initialHeaders,
			Cookie: getCookieHeader(cookies),
		};
	}
	return initialHeaders;
};

const cloudfrontCookiesReceived = (cookies: Cookies): boolean => {
	// must have CloudFront-Policy, CloudFront-Signature, and CloudFront-Key-Pair-Id
	const hasPolicy = cookies.some((cookie) => cookie.name.includes("CloudFront-Policy"));
	const hasSignature = cookies.some((cookie) => cookie.name.includes("CloudFront-Signature"));
	const hasKeyPairId = cookies.some((cookie) => cookie.name.includes("CloudFront-Key-Pair-Id"));
	// console.log("Current cookies:", cookies);
	// console.log("CloudFront-Policy cookie present:", hasPolicy);
	// console.log("CloudFront-Signature cookie present:", hasSignature);
	// console.log("CloudFront-Key-Pair-Id cookie present:", hasKeyPairId);
	return hasPolicy && hasSignature && hasKeyPairId;
};

export const authenticate = async (): Promise<Cookies> => {
	let cookies: Cookies = [];
	let totalSleepTime = 0;
	const r1 = await fetch("https://www.gradfast.com/modules", {
		method: "GET",
		headers: getFetchHeaders(cookies),
	});
	if (!r1.ok) {
		console.log(`Total sleep time before failure: ${totalSleepTime} milliseconds`);
		console.error("Failed to load main page", r1.status, await r1.text());
		throw new Error("Failed to load main page");
	}
	cookies = updateCookies(r1, cookies);
	// console.log("Cookies after first request:", cookies);
	// let sleepTime = randomIntegerBetween(500, 1500);
	let sleepTime = getRandomInt(500, 1500);
	totalSleepTime += sleepTime;
	console.log(`Sleeping for ${sleepTime} milliseconds before next request...`);
	await sleep(sleepTime);

	const r2 = await fetch("https://api.gradfast.com/categories", {
		method: "GET",
		headers: getFetchHeaders(cookies),
	});
	if (!r2.ok) {
		console.log(`Total sleep time before failure: ${totalSleepTime} milliseconds`);
		console.error("Failed to load categories", r2.status, await r2.text());
		throw new Error("Failed to load categories");
	}
	cookies = updateCookies(r2, cookies);
	// console.log("Cookies after second request:", cookies);

	// sleepTime = randomIntegerBetween(500, 1500);
	sleepTime = getRandomInt(500, 1500);
	totalSleepTime += sleepTime;
	console.log(`Sleeping for ${sleepTime} milliseconds before next request...`);
	await sleep(sleepTime);

	const r3 = await fetch("https://api.gradfast.com/modules", {
		method: "GET",
		headers: getFetchHeaders(cookies),
	});
	if (!r3.ok) {
		console.log(`Total sleep time before failure: ${totalSleepTime} milliseconds`);
		console.error("Failed to load modules", r3.status, await r3.text());
		throw new Error("Failed to load modules");
	}
	const modules: Module[] = (await r3.json()) as Module[];
	cookies = updateCookies(r3, cookies);
	// console.log("Cookies after third request:", cookies);

	let tries = 0;
	while (!cloudfrontCookiesReceived(cookies)) {
		if (tries >= 5) {
			console.log(`Total sleep time before failure: ${totalSleepTime} milliseconds`);
			throw new Error("Failed to obtain CloudFront cookies after 5 tries");
		}

		// const randomModule = modules[randomIntegerBetween(0, modules.length - 1)];
		const randomModule = modules[getRandomInt(0, modules.length - 1)];
		const randomModuleCode = `${randomModule.prefix}${randomModule.code}`;
		console.log(`Requesting module ${randomModuleCode} page to obtain CloudFront cookies...`);

		// sleepTime = randomIntegerBetween(500, 1500);
		sleepTime = getRandomInt(500, 1500);
		totalSleepTime += sleepTime;
		console.log(`Sleeping for ${sleepTime} milliseconds before next request...`);
		await sleep(sleepTime);

		const lr1 = await fetch(`https://api.gradfast.com/module/${randomModuleCode}`, {
			method: "GET",
			headers: getFetchHeaders(cookies),
		});
		if (!lr1.ok) {
			console.log(`Total sleep time before failure: ${totalSleepTime} milliseconds`);
			console.error(`Failed to load module ${randomModuleCode} page`, lr1.status, await lr1.text());
			throw new Error(`Failed to load module ${randomModuleCode} page`);
		}
		cookies = updateCookies(lr1, cookies);

		// await sleep(randomIntegerBetween(500, 1000));

		const lr2 = await fetch(`https://api.gradfast.com/module/${randomModuleCode}/past-papers`, {
			method: "GET",
			headers: getFetchHeaders(cookies),
		});
		if (!lr2.ok) {
			console.log(`Total sleep time before failure: ${totalSleepTime} milliseconds`);
			console.error(`Failed to load module ${randomModuleCode} past papers`, lr2.status, await lr2.text());
			throw new Error(`Failed to load module ${randomModuleCode} past papers`);
		}
		cookies = updateCookies(lr2, cookies);
		tries += 1;
	}
	console.log(`Total sleep time before success: ${totalSleepTime} milliseconds`);
	return cookies;
};
