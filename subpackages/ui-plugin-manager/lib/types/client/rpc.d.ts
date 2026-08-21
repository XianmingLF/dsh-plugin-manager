/**
 * Browser RPC helper for the host typert gateway. The web client talks to
 * host Remotes through the same-origin `/api/<namespace>/<method>` envelope
 * the official connection layer uses, without depending on the api-remotes
 * assembly (which a profile-installed plugin cannot reach).
 */
/** Typed result envelope returned by the host typert gateway. */
export interface RpcResult<T> {
    readonly ok: boolean;
    readonly value?: T;
    readonly error?: {
        readonly code: string;
        readonly message: string;
    };
}
/**
 * POST one typert remote call to the same-origin gateway and resolve its value.
 * @param method - `namespace/method` wire name.
 * @param args - plain-object arguments keyed by parameter name.
 * @returns the typed value; throws on transport, envelope, or gateway errors.
 */
export declare function rpcCall<T>(method: string, args: Record<string, unknown>): Promise<T>;
//# sourceMappingURL=rpc.d.ts.map