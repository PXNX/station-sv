// src/lib/server/http.ts
// Every external photo lookup goes through here. A slow or unresponsive third
// party must never hold up a whole page — search and station views fall back to
// a missing photo instead of spinning forever.

const DEFAULT_TIMEOUT_MS = 1800;

/** Fetch with a hard deadline. Returns normally only for a real Response. */
export async function fetchWithTimeout(
	url: string,
	init: RequestInit = {},
	timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Response> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);

	const forwarded = init.signal;
	const abort = () => controller.abort();
	if (forwarded) {
		if (forwarded.aborted) controller.abort();
		else forwarded.addEventListener('abort', abort, { once: true });
	}

	try {
		const response = await fetch(url, { ...init, signal: controller.signal });
		if (!(response instanceof Response)) throw new Error('Invalid response from fetch');
		return response;
	} finally {
		clearTimeout(timer);
		if (forwarded) forwarded.removeEventListener('abort', abort);
	}
}

/** Convenience wrapper for JSON APIs that may fail or time out. */
export async function fetchJsonWithTimeout<T>(
	url: string,
	timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<T | null> {
	try {
		const response = await fetchWithTimeout(url, {}, timeoutMs);
		if (!response.ok) return null;
		return (await response.json()) as T;
	} catch (error) {
		console.error(`External request failed: ${url}`, error);
		return null;
	}
}
