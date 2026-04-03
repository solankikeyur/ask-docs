/**
 * adminChatStream.ts
 *
 * A module-level singleton that owns the SSE fetch for the admin chat.
 * The React component subscribes/unsubscribes but the underlying stream
 * keeps reading even when the component is unmounted (navigated away).
 * When the component re-mounts it receives the accumulated data instantly.
 */

export interface StreamState {
    /** Accumulated streamed text so far */
    data: string;
    /** Response headers received (e.g. X-Chat-Id) */
    responseHeaders: Headers | null;
    /** True while the HTTP response body is still being read */
    isStreaming: boolean;
    /** True while waiting for the initial HTTP response */
    isFetching: boolean;
    /** Set when the server returns a non-2xx response (e.g. document not ready) */
    error: string | null;
}

type Listener = (state: StreamState) => void;

const state: StreamState = {
    data: '',
    responseHeaders: null,
    isStreaming: false,
    isFetching: false,
    error: null,
};

const listeners = new Set<Listener>();
let abortController: AbortController | null = null;

function notify() {
    const snapshot = { ...state };
    listeners.forEach((l) => l(snapshot));
}

/** Subscribe to state updates. Returns an unsubscribe function. */
export function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    // Immediately deliver current state so the component can hydrate
    listener({ ...state });
    return () => listeners.delete(listener);
}

/** Get current state snapshot (for initial render before subscription fires). */
export function getSnapshot(): StreamState {
    return { ...state };
}

/** Reset accumulated data (e.g. before sending a new message). */
export function clearStreamData() {
    state.data = '';
    state.responseHeaders = null;
    notify();
}

/** Abort any in-flight stream and reset all state. */
export function abortStream() {
    abortController?.abort();
    abortController = null;
    state.data = '';
    state.responseHeaders = null;
    state.isStreaming = false;
    state.isFetching = false;
    state.error = null;
    notify();
}

/**
 * Send a message and start reading the streaming response.
 * The fetch is NOT tied to any React component — it lives here in module scope.
 */
export async function sendStream(
    url: string,
    body: Record<string, unknown>,
    csrfToken: string,
) {
    // Cancel any previous request
    abortController?.abort();
    abortController = new AbortController();

    state.data = '';
    state.responseHeaders = null;
    state.isStreaming = false;
    state.isFetching = true;
    state.error = null;
    notify();

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'text/event-stream',
                'X-CSRF-TOKEN': csrfToken,
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify(body),
            signal: abortController.signal,
        });

        state.responseHeaders = response.headers;
        state.isFetching = false;

        // Handle server-side errors (e.g. document not ready → 422)
        if (!response.ok) {
            const json = await response.json().catch(() => ({}));
            state.error = (json as { error?: string }).error ?? `Request failed (HTTP ${response.status})`;
            state.isStreaming = false;
            notify();
            return;
        }

        state.isStreaming = true;
        notify();

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
            state.isStreaming = false;
            notify();
            return;
        }

        // Read chunks until the stream closes
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            state.data += chunk;
            notify();
        }
    } catch (err) {
        if ((err as Error).name === 'AbortError') {
            // Intentionally cancelled — no-op
            return;
        }
        console.error('[adminChatStream] fetch error', err);
    } finally {
        if (state.isStreaming) {
            state.isStreaming = false;
            notify();
        }
    }
}
