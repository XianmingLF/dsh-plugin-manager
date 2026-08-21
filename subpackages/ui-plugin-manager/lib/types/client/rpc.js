/**
 * Browser RPC helper for the host typert gateway. The web client talks to
 * host Remotes through the same-origin `/api/<namespace>/<method>` envelope
 * the official connection layer uses, without depending on the api-remotes
 * assembly (which a profile-installed plugin cannot reach).
 */
/**
 * POST one typert remote call to the same-origin gateway and resolve its value.
 * @param method - `namespace/method` wire name.
 * @param args - plain-object arguments keyed by parameter name.
 * @returns the typed value; throws on transport, envelope, or gateway errors.
 */
export async function rpcCall(method, args) {
    const rpcId = globalThis.crypto.randomUUID();
    const response = await globalThis.fetch(`/api/${method}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type: 'client-request', rpcId, method, payload: { args } }),
    });
    if (!response.ok) {
        throw new Error(`transport failure for /api/${method}: HTTP ${response.status}`);
    }
    const full = await response.json();
    if (full.rpcId !== rpcId) {
        throw new Error(`rpcId mismatch for ${method}: sent ${rpcId}, got ${full.rpcId}`);
    }
    if (!full.result.ok || full.result.value === undefined) {
        const detail = full.result.error !== undefined
            ? `${full.result.error.code}: ${full.result.error.message}`
            : 'empty result';
        throw new Error(`${method} failed: ${detail}`);
    }
    return full.result.value;
}
//# sourceMappingURL=rpc.js.map